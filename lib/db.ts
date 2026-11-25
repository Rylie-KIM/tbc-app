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
