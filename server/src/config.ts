import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
	const val = process.env[key];
	if (val === undefined || val === '') {
		throw new Error(`Missing env var: ${key}`)
	}
	return val
}

// todo handle parseint nan
export const config: Config = {
	port: parseInt(requireEnv('PORT')),
	baseUrl: requireEnv('BASE_URL'),
	codeLength: parseInt(requireEnv('CODE_LENGTH')),
	databaseUrl: requireEnv("DATABASE_URL")
}

export interface Config {
	port: number;
	baseUrl: string;
	codeLength: number;
	databaseUrl: string
}