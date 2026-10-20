// db/errors.ts
const PG_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		err.code === PG_UNIQUE_VIOLATION
	);
}
