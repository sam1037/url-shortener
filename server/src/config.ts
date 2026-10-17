import dotenv from 'dotenv';

dotenv.config();

export const config = {
	port: parseInt(process.env.PORT || '3000'),
	baseUrl: process.env.BASE_URL || 'http://localhost:3000'
}

export type Config = typeof config;