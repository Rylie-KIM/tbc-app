import { OPTIONS_BY_KEY } from '@/lib/survey';

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

/** Keeps only values the questions allow: listed options (single or several), nothing else. */
export function cleanAnswer(key: unknown, value: unknown): string | string[] | null {
  if (typeof key !== 'string') return null;
  const allowed = OPTIONS_BY_KEY[key];
  if (!allowed) return null;
  if (typeof value === 'string') return allowed.includes(value) ? value : null;
  if (Array.isArray(value) && value.length <= allowed.length && value.every((x) => typeof x === 'string' && allowed.includes(x))) {
    return Array.from(new Set(value as string[]));
  }
  return null;
}

export const validEmail = (v: unknown): v is string => typeof v === 'string' && v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
