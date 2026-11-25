// H6: connection test. Prints only OK or the error class, never a password.
import pg from 'pg';
import fs from 'node:fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>/^[A-Za-z_][A-Za-z0-9_]*=/.test(l)).map(l=>[l.split('=')[0],l.slice(l.indexOf('=')+1)]));
for (const name of ['DATABASE_URL','DIRECT_URL']) {
  const c = new pg.Client({ connectionString: env[name], ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 12000 });
  try { await c.connect(); const r = await c.query('select 1 as ok'); console.log(name, 'OK', r.rows[0].ok); }
  catch (e) { console.log(name, 'FAILED', e.code || e.name, String(e.message).replace(/:[^:@/]+@/, ':***@').slice(0,120)); }
  finally { try { await c.end(); } catch {} }
}
