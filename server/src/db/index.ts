import pg from 'pg';
import { config } from '../config.js'

// create conenction pool to pgdb via connection string
const { Pool } = pg;
export const pool = new Pool({ connectionString: config.databaseUrl});

// helper checkDb
export async function checkDb(): Promise<void> {
    await pool.query('SELECT 1');
}
