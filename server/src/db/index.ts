import pg from 'pg';
import { config } from '../config.js'
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// create conenction pool to pgdb via connection string
const { Pool } = pg;
export const pool = new Pool({ connectionString: config.databaseUrl});

// helper checkDb
export async function checkDb(): Promise<void> {
    await pool.query('SELECT 1');
}

export async function initSchema(){
    const file = path.join(import.meta.dirname, 'schema.sql');
    const sqlString = await readFile(file, 'utf8');

    await pool.query(sqlString);
}
