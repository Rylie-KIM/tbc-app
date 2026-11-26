import { db } from '@/lib/db';
import { json, limited } from '@/lib/api';
import { keywordMatch, parseAnswer, SYSTEM_PROMPT, userPrompt, type MatchResult } from '@/lib/match';

// F25.10: "describe what you want" for the sponsor side. The sentence goes to OpenRouter (a free model) with the facts of the
// example events only; no name, email or other personal data is sent or stored. Falls back to a keyword match on any problem.
export const maxDuration = 30;

const BASE = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';
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
  const timer = setTimeout(() => ctl.abort(), 22_000);
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST', signal: ctl.signal,
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', 'x-title': 'TBC preview' },
      body: JSON.stringify({ model: MODEL, temperature: 0.2, max_tokens: 700, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt(text) }] }),
    });
    if (!res.ok) { console.error('openrouter status', res.status); return null; }
    const data = await res.json().catch(() => null);
    const out = parseAnswer(data?.choices?.[0]?.message?.content);
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
