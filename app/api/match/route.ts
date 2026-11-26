import { db } from '@/lib/db';
import { json, limited } from '@/lib/api';
import { keywordMatch, parseAnswer, SYSTEM_PROMPT, userPrompt, type MatchResult } from '@/lib/match';

// F25.10: "describe what you want" for the sponsor side. The sentence goes to OpenRouter (a free model) with the facts of the
// example events only; no name, email or other personal data is sent or stored. Falls back to a keyword match on any problem.
export const maxDuration = 30;

const BASE = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
// Free models are often rate-limited upstream (429), so OpenRouter is given a short list and tries the next one on a failure.
// The free list changes: ids were read from openrouter.ai/api/v1/models on 2026-11-26. Tried that day on two sentences: ernie answered both
// (5 to 8 s), ling one of two, the others were rate-limited upstream. The openrouter/free router was left out: it landed on slow reasoning models (25 s+).
const MODELS = (process.env.OPENROUTER_MODELS || 'baidu/ernie-5.5-flash-preview:free,inclusionai/ling-3.2-flash:free,google/gemma-4-31b-it:free').split(',').map((m) => m.trim()).filter(Boolean).slice(0, 3);
const DAILY_CAP = Number(process.env.AI_DAILY_CAP || 40);

async function underDailyCap(): Promise<boolean> {
  try {
    const r = await db().query('insert into public.ai_usage (day, calls) values (current_date, 1) on conflict (day) do update set calls = ai_usage.calls + 1 returning calls');
    return r.rows[0].calls <= DAILY_CAP;
  } catch { return false; } // if the counter cannot be read, do not spend: use the keyword match
}

async function askModel(text: string): Promise<MatchResult | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  if (!(await underDailyCap())) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20_000);
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST', signal: ctl.signal,
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', 'x-title': 'TBC preview' },
      body: JSON.stringify({ models: MODELS, temperature: 0.2, max_tokens: 2500, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt(text) }] }),
    });
    if (!res.ok) { console.error('openrouter status', res.status); return null; }
    const data = await res.json().catch(() => null);
    const content = data?.choices?.[0]?.message?.content;
    const out = parseAnswer(content);
    if (!out || !(out.matches.length || out.summary)) console.error('openrouter answer not usable', data?.model, data?.choices?.[0]?.finish_reason, typeof content === 'string' ? `${content.length} chars: ${content.slice(0, 160).replace(/\s+/g, ' ')}` : 'no content');
    return out && (out.matches.length || out.summary) ? out : null; // an answer with neither matches nor a reason is treated as a failure
  } catch (e) { console.error('openrouter failed', (e as Error).name); return null; }
  finally { clearTimeout(timer); }
}

export async function POST(req: Request) {
  if (limited(req, 6)) return json({ ok: false, error: 'rate' }, 429);
  const b = await req.json().catch(() => null);
  const text = typeof b?.text === 'string' ? b.text.trim() : '';
  if (text.length < 8 || text.length > 400 || b?.website) return json({ ok: false, error: 'bad' }, 400);
  const ai = await askModel(text);
  if (ai) return json({ ok: true, ...ai });
  const kw = keywordMatch(text);
  return json({ ok: true, ...kw, note: process.env.OPENROUTER_API_KEY ? 'The AI is busy right now, so this is a simple keyword match.' : 'This is a simple keyword match.' });
}

/** Tells the page whether the AI is switched on (so it can show the right notice). */
export async function GET() { return json({ ai: !!process.env.OPENROUTER_API_KEY }); }
