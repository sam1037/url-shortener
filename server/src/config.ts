import dotenv from 'dotenv';

dotenv.config();

export const config = {
	port: parseInt(process.env.PORT || '3000'),
	baseUrl: process.env.BASE_URL || 'http://localhost:3000',
	codeLength: parseInt(process.env.CODE_LENGTH || '6'),
}

// todo ensure config has no null here

export type Config = typeof config;