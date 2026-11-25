// H4: applies supabase/migrations/*.sql in order, once each. Uses the pooled DATABASE_URL
// (the direct address is IPv6 only). Prints file names only, never credentials.
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
const env = { ...Object.fromEntries(fs.existsSync('.env') ? fs.readFileSync('.env','utf8').split('\n').filter(l=>/^[A-Za-z_][A-Za-z0-9_]*=/.test(l)).map(l=>[l.split('=')[0],l.slice(l.indexOf('=')+1)]) : []), ...process.env };
const c = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
await c.connect();
await c.query('create table if not exists public._migrations (name text primary key, applied_at timestamptz not null default now())');
await c.query('alter table public._migrations enable row level security');
const dir = 'supabase/migrations';
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) {
  const done = await c.query('select 1 from public._migrations where name = $1', [f]);
  if (done.rowCount) { console.log('skip ', f); continue; }
  await c.query('begin');
  try { await c.query(fs.readFileSync(path.join(dir, f), 'utf8')); await c.query('insert into public._migrations(name) values ($1)', [f]); await c.query('commit'); console.log('apply', f); }
  catch (e) { await c.query('rollback'); console.error('FAILED', f, e.message); process.exit(1); }
}
await c.end();
