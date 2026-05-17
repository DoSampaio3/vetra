import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://vetra_user:vetra_pass@localhost:5432/vetra',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await db.query(text, params);
  return res.rows;
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const res = await db.query(text, params);
  return res.rows[0] || null;
}
