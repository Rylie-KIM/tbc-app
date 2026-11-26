// Survey versioning (owner request 2026-11-26): every change to the questions, their wording, options or order
// needs a new SURVEY_VERSION in lib/survey.ts, a snapshot file and a line in plan/trace/survey-changelog.md.
//   node scripts/survey-version.mjs --check   fails if the questionnaire differs from the snapshot of SURVEY_VERSION
//   node scripts/survey-version.mjs --write   writes plan/trace/survey-versions/<version>.json for the current code
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const s = await import('../lib/survey.ts');
const pick = (x) => ({ key: x.key, section: x.section, kind: x.kind, title: x.title ?? null, intro: x.intro ?? null, hint: x.hint ?? null, options: x.options, max: x.max ?? null, other: !!x.other, optional: !!x.optional, low: x.low ?? null, high: x.high ?? null });
const paths = {
  organiser: s.questionsFor('organiser', {}).map(pick),
  sponsor_has_sponsored: s.questionsFor('sponsor', { q04_freq: '1-2' }).map(pick),
  sponsor_not_sponsored_yet: s.questionsFor('sponsor', { q04_freq: '0' }).map(pick),
};
const hash = createHash('sha256').update(JSON.stringify(paths)).digest('hex').slice(0, 16);
const file = fileURLToPath(new URL(`../plan/trace/survey-versions/${s.SURVEY_VERSION}.json`, import.meta.url));
const snap = { version: s.SURVEY_VERSION, hash, paths };

if (process.argv.includes('--write')) {
  writeFileSync(file, JSON.stringify(snap, null, 2) + '\n');
  console.log(`wrote ${file} (hash ${hash})`);
} else if (process.argv.includes('--check')) {
  if (!existsSync(file)) { console.error(`NO SNAPSHOT for ${s.SURVEY_VERSION}. Run --write and add a line to plan/trace/survey-changelog.md.`); process.exit(1); }
  const old = JSON.parse(readFileSync(file, 'utf8'));
  if (old.hash !== hash) { console.error(`The questionnaire changed but SURVEY_VERSION is still ${s.SURVEY_VERSION} (snapshot ${old.hash}, now ${hash}). Bump SURVEY_VERSION, run --write, update the changelog.`); process.exit(1); }
  console.log(`ok: ${s.SURVEY_VERSION} matches its snapshot (${hash})`);
} else console.log(JSON.stringify(snap, null, 2));
