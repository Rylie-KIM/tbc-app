import { Pool } from 'pg';

// One small pool per server instance. DATABASE_URL is the pooled (port 6543) Supabase address.
const g = globalThis as unknown as { __tbcPool?: Pool };

export function db(): Pool {
  if (!g.__tbcPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    g.__tbcPool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return g.__tbcPool;
}

/** Runs several statements as one transaction (state update and its log row stay together). */
export async function tx<T>(fn: (q: (sql: string, params?: unknown[]) => Promise<import('pg').QueryResult>) => Promise<T>): Promise<T> {
  const c = await db().connect();
  try {
    await c.query('begin');
    const out = await fn((sql, params) => c.query(sql, params as never[]));
    await c.query('commit');
    return out;
  } catch (e) {
    await c.query('rollback').catch(() => undefined);
    throw e;
  } finally {
    c.release();
  }
}
