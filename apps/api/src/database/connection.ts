import { Pool } from 'pg';

// Pool de conexão com o PostgreSQL (Supabase)
// DATABASE_URL deve estar no .env ANTES deste módulo ser carregado
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DATABASE_URL?.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : false,
});

db.on('error', (err) => {
  console.error('Pool error:', err.message);
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await db.query(text, params);
  return res.rows;
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const res = await db.query(text, params);
  return res.rows[0] || null;
}
