// F24: makes the cover art (SVG) and the two-page example prospectus (PDF) for every example event.
// All names are invented; every prospectus says "Example". Needs Google Chrome (macOS path below) to print the PDFs.
// Usage: node scripts/make-examples.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const events = JSON.parse(fs.readFileSync('data/events.json', 'utf8'));
fs.mkdirSync('public/events', { recursive: true });
fs.mkdirSync('public/prospectuses', { recursive: true });

// one palette per event: [deep, mid, bright, accent]
const PAL = [
  ['#0a2a18', '#0b7a4a', '#7dff9e', '#b6ff00'], ['#10223f', '#2f6df0', '#8fd3ff', '#ffe66d'], ['#34123f', '#a23cc9', '#ff9de0', '#ffd56b'],
  ['#3a1c05', '#d9731a', '#ffc27a', '#fff3c4'], ['#05303a', '#12929c', '#8ff0ea', '#ffb86b'], ['#1c1c2b', '#4b4bd8', '#a5a8ff', '#47ff00'],
  ['#0b2b2e', '#0aa88a', '#b6ffe9', '#ff7a59'], ['#2a1a0a', '#a8741f', '#ffe08a', '#6dffb1'], ['#0e2d1b', '#3f9d2f', '#c6ff7a', '#ff9f43'],
  ['#2d0f26', '#d03a7a', '#ffb3d1', '#7dffd9'], ['#06281c', '#16a05a', '#9bffbf', '#ffe14d'], ['#0a1a35', '#1f5fd0', '#9ec8ff', '#ff6bd5'],
];

function cover(e, w = 1200, h = 675) {
  const [d, m, b, a] = PAL[e.palette % PAL.length];
  const i = e.palette % 6;
  let shapes = '';
  if (i === 0) shapes = `<circle cx="${w*.78}" cy="${h*.35}" r="${h*.42}" fill="${m}" opacity=".85"/><circle cx="${w*.62}" cy="${h*.78}" r="${h*.3}" fill="${b}" opacity=".55"/><circle cx="${w*.9}" cy="${h*.85}" r="${h*.14}" fill="${a}"/>`;
  if (i === 1) shapes = Array.from({ length: 9 }, (_, k) => `<rect x="${w*.35 + k*70}" y="${-h*.2}" width="38" height="${h*1.6}" fill="${k % 2 ? b : m}" opacity=".7" transform="rotate(24 ${w*.5} ${h*.5})"/>`).join('') + `<circle cx="${w*.82}" cy="${h*.28}" r="${h*.12}" fill="${a}"/>`;
  if (i === 2) shapes = Array.from({ length: 11 }, (_, r) => Array.from({ length: 14 }, (_, c) => `<circle cx="${w*.38 + c*52}" cy="${60 + r*54}" r="${6 + ((r*c) % 5)*2.4}" fill="${(r + c) % 3 ? b : a}" opacity=".8"/>`).join('')).join('');
  if (i === 3) shapes = [1, .8, .6, .4, .22].map((k, n) => `<circle cx="${w*.78}" cy="${h*.5}" r="${h*.62*k}" fill="none" stroke="${n % 2 ? b : a}" stroke-width="${18 - n*2}" opacity=".85"/>`).join('');
  if (i === 4) shapes = [0, 1, 2, 3, 4].map((k) => `<path d="M0 ${h*(.45 + k*.1)} C ${w*.25} ${h*(.25 + k*.1)}, ${w*.5} ${h*(.7 + k*.08)}, ${w} ${h*(.4 + k*.1)} L ${w} ${h} L 0 ${h} Z" fill="${[m, b, a, m, b][k]}" opacity="${.55 - k*.06}"/>`).join('');
  if (i === 5) shapes = Array.from({ length: 7 }, (_, k) => `<polygon points="${w*.45 + k*95},${h*.9} ${w*.45 + k*95 + 70},${h*.2 + (k%3)*60} ${w*.45 + k*95 + 140},${h*.9}" fill="${[b, a, m][k % 3]}" opacity=".75"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Illustration for ${e.name} (example)"><defs><linearGradient id="g${e.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${d}"/><stop offset="1" stop-color="${m}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g${e.id})"/>${shapes}</svg>`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const facts = (e) => [['Organiser type', e.type], ['Attendance', `${e.attendance} people`], ['Where', e.place], ['Format', e.format], ['Audience', e.audience], ['Main sponsor goal', e.goal], ['Packages', e.price], ['Edition', e.edition]];

function html(e) {
  const [d, m, b, a] = PAL[e.palette % PAL.length];
  const svg = cover(e, 794, 400).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%" ');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(e.name)} sponsorship prospectus (example)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;700&display=swap">
<style>
@page { size: A4; margin: 0 }
* { box-sizing: border-box } body { margin: 0; font-family: 'Hanken Grotesk', Helvetica, Arial, sans-serif; color: #101612; -webkit-print-color-adjust: exact; print-color-adjust: exact }
.page { width: 794px; height: 1123px; position: relative; overflow: hidden; page-break-after: always; background: #fff }
.cover { position: relative; height: 400px; color: #fff }
.cover .t { position: absolute; left: 48px; bottom: 44px; right: 48px }
.cover small { letter-spacing: .18em; text-transform: uppercase; font-weight: 500; font-size: 13px; opacity: .9 }
.cover h1 { font-size: 56px; line-height: 1; margin: 10px 0 0; letter-spacing: -.03em }
.ribbon { position: absolute; top: 28px; right: 28px; background: ${a}; color: #101612; font-weight: 700; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; padding: 7px 14px; border-radius: 999px }
.body { padding: 36px 48px }
h2 { font-size: 24px; margin: 0 0 12px; letter-spacing: -.02em; color: ${d} }
p { font-size: 15px; line-height: 1.55; margin: 0 0 12px }
table { width: 100%; border-collapse: collapse; font-size: 14px } td { padding: 9px 10px; border-bottom: 1px solid #dfe5e1 } td:first-child { width: 36%; color: #5a665e; font-weight: 500 }
.tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 8px }
.tier { border: 2px solid ${m}; border-radius: 16px; padding: 16px } .tier:nth-child(2) { background: ${d}; color: #fff; border-color: ${d} }
.tier h3 { margin: 0; font-size: 16px; font-weight: 500 } .tier .p { font-size: 26px; font-weight: 700; margin: 6px 0 10px; letter-spacing: -.02em }
.tier ul { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5 }
.foot { position: absolute; left: 48px; right: 48px; bottom: 26px; font-size: 11px; color: #6a766e; display: flex; justify-content: space-between }
.chip { display: inline-block; background: ${b}; color: #101612; border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 500; margin: 0 6px 6px 0 }
</style></head><body>
<section class="page">
  <div class="cover">${svg}<span class="ribbon">Example</span><div class="t"><small>Sponsorship prospectus</small><h1>${esc(e.name)}</h1></div></div>
  <div class="body">
    <h2>About the event</h2>
    <p>${esc(e.blurb)} It is organised by ${esc(e.organiser.toLowerCase())} and is in its ${esc(e.edition.toLowerCase())}.</p>
    <p>Sponsors meet ${e.attendance} participants: ${esc(e.audience.toLowerCase())}. The main reason sponsors take part is: ${esc(e.goal.toLowerCase())}.</p>
    <h2 style="margin-top:22px">At a glance</h2>
    <table>${facts(e).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
  </div>
  <div class="foot"><span>${esc(e.name)} · Sponsorship prospectus</span><span>Page 1 of 2 · Example, not a real event</span></div>
</section>
<section class="page">
  <div class="body" style="padding-top:48px">
    <h2>Who takes part</h2>
    <p>${e.attendance} participants. ${esc(e.audience)}.</p>
    <p>${e.tracks.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</p>
    <h2 style="margin-top:26px">Sponsorship packages</h2>
    <div class="tiers">${e.tiers.map((t) => `<div class="tier"><h3>${esc(t.name)}</h3><div class="p">${esc(t.price)}</div><ul>${t.perks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>
    <p style="margin-top:14px;color:#5a665e;font-size:13px">Every package can be adjusted. Tell us what you want from the event and we will propose a fit.</p>
    <h2 style="margin-top:26px">Contact</h2>
    <p>Partnerships team, ${esc(e.name)}<br>sponsors@example.invalid (an invented address)</p>
  </div>
  <div class="foot"><span>${esc(e.name)} · Sponsorship prospectus</span><span>Page 2 of 2 · All names are invented for the TBC preview</span></div>
</section></body></html>`;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tbc-prospectus-'));
for (const e of events) {
  fs.writeFileSync(`public/events/${e.id}.svg`, cover(e));
  const f = path.join(tmp, `${e.id}.html`);
  fs.writeFileSync(f, html(e));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf-no-header', '--virtual-time-budget=6000', `--print-to-pdf=${path.resolve('public/prospectuses', e.id + '.pdf')}`, 'file://' + f], { stdio: 'ignore' });
  console.log(e.id, e.name);
}
