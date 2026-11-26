// F25.10 check: runs /api/match against a fake OpenRouter (no real key, no cost) and checks that good answers are used,
// unknown ids and bad answers are dropped, and every failure falls back to the keyword match.
// Start the app like this first:  OPENROUTER_API_KEY=test OPENROUTER_BASE_URL=http://localhost:4010 npx next start -p 3100
// Usage: node scripts/match-check.mjs http://localhost:3100 [--no-key]
import http from 'node:http';
const base = process.argv[2] || 'http://localhost:3100';
const noKey = process.argv.includes('--no-key');
let fail = 0; const bad = (m) => { fail++; console.log('FAIL', m); };
const seen = [];
const reply = (res, content, status = 200) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(status === 200 ? { choices: [{ message: { content } }] } : { error: 'x' })); };
const mock = http.createServer((req, res) => {
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
    const body = JSON.parse(b); seen.push({ auth: req.headers.authorization, body });
    const user = body.messages[1].content;
    if (user.includes('CASE-GOOD')) return reply(res, JSON.stringify({ summary: 'Two fit.', matches: [{ id: 'e1', reason: 'Data and AI students; attendance 350.' }, { id: 'zzz', reason: 'invented event' }, { id: 'e1', reason: 'duplicate' }, { id: 'e2', reason: 'x'.repeat(500) }] }));
    if (user.includes('CASE-FENCED')) return reply(res, 'Sure!\n```json\n{"summary":"","matches":[{"id":"e3","reason":"Fits."}]}\n```');
    if (user.includes('CASE-GARBAGE')) return reply(res, 'I cannot help with that.');
    if (user.includes('CASE-EMPTY')) return reply(res, '{"summary":"","matches":[]}');
    if (user.includes('CASE-NONE')) return reply(res, '{"summary":"Nothing fits a budget of £10.","matches":[]}');
    if (user.includes('CASE-429')) return reply(res, '', 429);
    reply(res, '{"summary":"","matches":[]}');
  });
}).listen(4010);
let n = 0;
const ask = async (text) => { const r = await fetch(base + '/api/match', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.9.0.${++n}` }, body: JSON.stringify({ text }) }); return { status: r.status, j: await r.json() }; };

const bads = [[{ text: 'short' }], [{ text: 'x'.repeat(401) }], [{ text: 12345678 }]];
for (const [b] of bads) { const r = await fetch(base + '/api/match', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.9.1.${++n}` }, body: JSON.stringify(b) }); if (r.status !== 400) bad('bad input accepted: ' + JSON.stringify(b).slice(0, 30)); }

if (noKey) {
  const r = await ask('I want to hire backend interns with a budget of £2,000');
  if (r.j.source !== 'keywords' || !r.j.note) bad('without a key it should use keywords: ' + JSON.stringify(r.j));
  console.log('no key: source', r.j.source, '| matches', r.j.matches.map((m) => m.id).join(','));
} else {
  let r = await ask('CASE-GOOD hire interns');
  if (r.j.source !== 'ai' || r.j.matches.map((m) => m.id).join() !== 'e1,e2') bad('good answer not cleaned: ' + JSON.stringify(r.j));
  else if (r.j.matches[1].reason.length > 220) bad('reason not shortened');
  else console.log('good answer: unknown id and duplicate dropped, long reason cut to', r.j.matches[1].reason.length);
  if (seen[0]?.auth !== 'Bearer test' || seen[0]?.body.messages[1].content.includes('"organiser":') ) bad('request shape wrong');
  if (!seen[0]?.body.messages[1].content.includes('<request>CASE-GOOD hire interns</request>')) bad('request text not wrapped in <request>');
  r = await ask('CASE-FENCED hire'); if (r.j.source !== 'ai' || r.j.matches[0]?.id !== 'e3') bad('fenced answer not read: ' + JSON.stringify(r.j));
  r = await ask('CASE-GARBAGE hire interns with budget £2,000'); if (r.j.source !== 'keywords' || !r.j.note) bad('garbage answer should fall back: ' + JSON.stringify(r.j));
  r = await ask('CASE-EMPTY hire interns'); if (r.j.source !== 'keywords') bad('empty answer should fall back');
  r = await ask('CASE-NONE budget £10'); if (r.j.source !== 'ai' || r.j.matches.length || !r.j.summary) bad('"nothing fits" answer should be shown as it is');
  r = await ask('CASE-429 hire interns'); if (r.j.source !== 'keywords') bad('provider 429 should fall back');
  console.log('fallbacks ok; requests the fake provider received:', seen.length);
}
mock.close();
console.log(fail ? `MATCH-CHECK FAILED (${fail})` : 'MATCH-CHECK PASSED');
process.exit(fail ? 1 : 0);
