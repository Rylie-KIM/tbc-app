import { MAX_BY_KEY, OPTIONS_BY_KEY, TEXT_KEYS } from '@/lib/survey';

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

// Best-effort limiter (per server instance): enough to blunt a simple script (task F21.9).
const hits = new Map<string, { n: number; t: number }>();
export function limited(req: Request, max = 60): boolean {
  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1;
  if (hits.size > 5000) hits.clear();
  return h.n > max;
}

export const validAnon = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9-]{20,64}$/.test(v);

/** Keeps only values the questions allow: listed options (up to the question's maximum) or free text of a set length. */
export function cleanAnswer(key: unknown, value: unknown): string | string[] | null {
  if (typeof key !== 'string') return null;
  if (TEXT_KEYS.has(key)) return typeof value === 'string' ? value.trim().slice(0, 1000) : null;
  const allowed = OPTIONS_BY_KEY[key];
  if (!allowed) return null;
  const max = MAX_BY_KEY[key] ?? allowed.length;
  if (typeof value === 'string') return allowed.includes(value) ? value : null;
  if (Array.isArray(value) && value.length <= max && value.every((x) => typeof x === 'string' && allowed.includes(x))) return Array.from(new Set(value as string[]));
  return null;
}

export const validEmail = (v: unknown): v is string => typeof v === 'string' && v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
