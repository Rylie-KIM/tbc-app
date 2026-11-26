// Writes every version snapshot (plan/trace/survey-versions/*.json) into the database tables
// survey_version, survey_question and survey_flow. Safe to run again. A version that is already published
// must match its snapshot exactly: published versions are never edited, a change is a new version.
//   node scripts/survey-publish.mjs           publish what is missing, then verify
//   node scripts/survey-publish.mjs --check   only verify (exit 1 when the current version is missing or differs)
import fs from 'node:fs';
import pg from 'pg';
const env = { ...Object.fromEntries(fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8').split('\n').filter((l) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(l)).map((l) => [l.split('=')[0], l.slice(l.indexOf('=') + 1)]) : []), ...process.env };
const dir = 'plan/trace/survey-versions';
const snaps = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'))).sort((a, b) => Number(a.version.slice(1)) - Number(b.version.slice(1)));
const checkOnly = process.argv.includes('--check');
const c = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
await c.connect();
let bad = 0;
try {
  for (const s of snaps) {
    const have = await c.query('select content_hash from public.survey_version where version = $1', [s.version]);
    if (have.rowCount) {
      if (have.rows[0].content_hash !== s.hash) { bad++; console.error(`MISMATCH ${s.version}: the database holds ${have.rows[0].content_hash}, the snapshot ${s.hash}. A published version must not change; make a new version.`); } else console.log('ok     ', s.version);
      continue;
    }
    if (checkOnly) { bad++; console.error('MISSING', s.version, '(run npm run survey:publish)'); continue; }
    await c.query('begin');
    try {
      await c.query('insert into public.survey_version (version, released, summary, content_hash) values ($1, $2, $3, $4)', [s.version, s.released ?? null, s.summary ?? null, s.hash]);
      const byKey = new Map();
      for (const list of Object.values(s.paths)) for (const q of list) if (!byKey.has(q.key)) byKey.set(q.key, q);
      for (const q of byKey.values()) {
        await c.query('insert into public.survey_question (version, key, kind, section, title, intro, hint, options, max_choices, has_other, optional, low_label, high_label, echo_from, title_after) values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13,$14,$15)',
          [s.version, q.key, q.kind, q.section, q.title, q.intro, q.hint, JSON.stringify(q.options ?? []), q.max, !!q.other, !!q.optional, q.low, q.high, q.echoFrom ?? null, q.titleAfter ?? null]);
      }
      for (const [path, list] of Object.entries(s.paths)) for (const [i, q] of list.entries()) await c.query('insert into public.survey_flow (version, path, position, question_key) values ($1,$2,$3,$4)', [s.version, path, i + 1, q.key]);
      await c.query('commit'); console.log('publish', s.version, `(${byKey.size} questions)`);
    } catch (e) { await c.query('rollback'); throw e; }
  }
} finally { await c.end(); }
process.exit(bad ? 1 : 0);
