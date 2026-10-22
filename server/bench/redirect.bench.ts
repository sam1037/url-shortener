// Load-tests GET /:code and prints median p50/p99 per concurrency level.
// Start the server first: CACHE_ENABLED=true|false npm run start:perf
// Then: npm run bench
import autocannon from 'autocannon';

const baseUrl = process.env.BENCH_URL ?? 'http://localhost:3000';
const seedCount = 1000;
const warmupSeconds = 5;
const durationSeconds = 20;
const connectionLevels = [10, 50, 150];
const runsPerLevel = 3;

async function seed(): Promise<string[]> {
	const codes: string[] = [];
	const batchSize = 50;
	for (let i = 0; i < seedCount; i += batchSize) {
		const batch = Array.from({ length: batchSize }, async (_, j) => {
			const res = await fetch(`${baseUrl}/api/v1/shorten`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					longURL: `https://example.com/bench/${i + j}`,
				}),
			});
			if (!res.ok) throw new Error(`seed failed: ${res.status}`);
			const { shortenURL } = (await res.json()) as { shortenURL: string };
			return new URL(shortenURL).pathname.slice(1);
		});
		codes.push(...(await Promise.all(batch)));
	}
	return codes;
}

function run(codes: string[], connections: number, duration: number) {
	return autocannon({
		url: baseUrl,
		connections,
		duration,
		requests: [
			{
				method: 'GET',
				// a random seeded code per request, so it's not one hot row
				setupRequest: (req) => ({
					...req,
					path: `/${codes[Math.floor(Math.random() * codes.length)]}`,
				}),
			},
		],
	});
}

// anything but a 302 means the numbers are wrong (e.g. 429 from the limiter)
function assertClean(result: autocannon.Result) {
	const bad = result['1xx'] + result['2xx'] + result['4xx'] + result['5xx'];
	if (bad > 0 || result.errors > 0) {
		throw new Error(
			`unexpected responses: ${JSON.stringify(result.statusCodeStats)}, errors: ${result.errors}`,
		);
	}
}

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)] ?? NaN;
}

const codes = await seed();
console.log(`seeded ${codes.length} codes against ${baseUrl}`);

console.log(`warm-up ${warmupSeconds}s...`);
assertClean(await run(codes, 50, warmupSeconds));

const rows = [];
for (const connections of connectionLevels) {
	const results: autocannon.Result[] = [];
	for (let i = 0; i < runsPerLevel; i++) {
		console.log(`-c ${connections} run ${i + 1}/${runsPerLevel}...`);
		const result = await run(codes, connections, durationSeconds);
		assertClean(result);
		results.push(result);
	}
	rows.push({
		connections,
		'p50 ms': median(results.map((r) => r.latency.p50)),
		'p99 ms': median(results.map((r) => r.latency.p99)),
		'req/s': Math.round(median(results.map((r) => r.requests.average))),
	});
}

console.table(rows);
