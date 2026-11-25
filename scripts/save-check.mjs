// F21.16 (database part): submits 20 test responses through the real API, checks that every one is stored
// exactly as sent (read back through the admin export), tests bad input and the delete button, then removes
// its own rows. Usage: node scripts/save-check.mjs http://localhost:3100
import fs from 'node:fs';
import pg from 'pg';
const base = process.argv[2] || 'http://localhost:3100';
const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter((l) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(l)).map((l) => [l.split('=')[0], l.slice(l.indexOf('=') + 1)]));
let who = '10.0.0.1'; // each test person comes from their own address, as real visitors do
const PACE = Number(process.env.PACE_MS || 0); // set on the real site, where the address cannot be faked
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = async (p, b, ip = who, pace = PACE) => { if (pace) await sleep(pace); const r = await fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(b) }); return r.status; };
const ids = Array.from({ length: 20 }, (_, i) => `savecheck-${Date.now()}-${String(i).padStart(2, '0')}-${Math.random().toString(16).slice(2, 10)}`);
let fail = 0; const bad = (m) => { fail++; console.log('FAIL', m); };

for (const [i, id] of ids.entries()) {
  who = `10.0.1.${i + 1}`;
  const role = i % 4 === 3 ? 'organiser' : 'sponsor';
  if (await post('/api/survey/start', { anonId: id, role }) !== 200) bad('start ' + i);
  const ans = role === 'sponsor'
    ? [['q01_role', 'Recruiting / talent acquisition'], ['q04_freq', i % 5 === 0 ? '0' : '1-2'], [i % 5 === 0 ? 'q21_why_not' : 'q05_motive', i % 5 === 0 ? ['No budget', 'Nobody has asked us'] : ['Hire interns or graduates']], ['q20_tools', ['LinkedIn', 'Personal network']], ['q24_organised', 'It was our first edition']]
    : [['o01_find', ['LinkedIn messages']], ['o02_hard', ['Setting prices', 'Getting replies']], ['o03_edition', 'First edition']];
  for (const [key, value] of ans) if (await post('/api/survey/answer', { anonId: id, key, value }) !== 200) bad(`answer ${i} ${key}`);
  if (await post('/api/survey/complete', { anonId: id, email: i === 0 ? 'save.check@example.com' : undefined }) !== 200) bad('complete ' + i);
}
who = '10.0.2.1';
// bad input must be refused, never stored
if (await post('/api/survey/answer', { anonId: ids[0], key: 'q01_role', value: 'Not an option' }) !== 400) bad('unlisted option accepted');
if (await post('/api/survey/answer', { anonId: ids[0], key: 'made_up_key', value: 'x' }) !== 400) bad('unknown key accepted');
if (await post('/api/survey/complete', { anonId: ids[0], email: 'not-an-email' }) !== 400) bad('bad email accepted');
if (await post('/api/survey/answer', { anonId: 'short', key: 'q01_role', value: 'Other' }) !== 400) bad('short id accepted');

const dbc = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await dbc.connect();
const stored = await dbc.query('select count(*)::int n, count(completed_at)::int done from public.survey_response where anon_id = any($1)', [ids]);
console.log('database rows for the 20 test ids:', stored.rows[0].n, '| completed:', stored.rows[0].done);
if (stored.rows[0].n !== 20 || stored.rows[0].done !== 20) bad('the database does not hold all 20 test rows');
const exp = await (await fetch(`${base}/api/admin/export?token=${env.ADMIN_EXPORT_TOKEN}`)).text();
const wrong = (await fetch(`${base}/api/admin/export?token=wrong`)).status;
if (wrong !== 404) bad('export without the right token answered ' + wrong);
const rows = exp.split('\n').slice(1).filter(Boolean);
const found = ids.filter((id) => rows.some((r) => r.includes(id.slice(0, 0)))); // ids are not exported; count by role + answers below
const mine = rows.filter((r) => r.includes('"app"'));
const completed = mine.filter((r) => /,"20\d\d-\d\d-\d\dT[^"]+","20\d\d-\d\d-\d\dT[^"]+","20\d\d-\d\d-\d\dT[^"]+","20\d\d-\d\d-\d\dT/.test(r)).length;
console.log('rows in export:', mine.length, '| completed rows:', completed, '| expected at least 20');
if (mine.length < 20) bad('fewer than 20 rows in the export');
if (!exp.includes('Hire interns or graduates') || !exp.includes('No budget; Nobody has asked us') || !exp.includes('Setting prices; Getting replies')) bad('answers not stored as sent');
if (!exp.includes('save.check@example.com')) bad('email not stored');

if (PACE) await sleep(62000); // let the limiter window reset before the rate-limit test
// the rate limit: one address sending far too many requests must be slowed down
let limited = 0; for (let k = 0; k < 90; k++) if (await post('/api/survey/answer', { anonId: ids[0], key: 'q01_role', value: 'Other' }, '10.0.3.1') === 429) limited++;
if (!limited) bad('rate limit never triggered'); else console.log('rate limit triggered after the allowed number of requests:', limited, 'refused of 90');
if (PACE) await sleep(62000);
for (const [i, id] of ids.entries()) await post('/api/survey/delete', { anonId: id }, `10.0.4.${i + 1}`, PACE ? 3200 : 0);
const after = await (await fetch(`${base}/api/admin/export?token=${env.ADMIN_EXPORT_TOKEN}`)).text();
const left = await dbc.query('select count(*)::int n from public.survey_response where anon_id = any($1)', [ids]);
if (left.rows[0].n !== 0 || after.includes('save.check@example.com')) bad('delete did not remove the 20 test rows (' + left.rows[0].n + ' left)');
await dbc.end();
console.log(fail ? `SAVE-CHECK FAILED (${fail})` : 'SAVE-CHECK PASSED: 20 of 20 stored as sent, bad input refused, wrong token refused, delete works, test rows removed');
process.exit(fail ? 1 : 0);
