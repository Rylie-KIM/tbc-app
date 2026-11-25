import { db } from '@/lib/db';
import { json, limited, validAnon, validEmail } from '@/lib/api';

export async function POST(req: Request) {
  if (limited(req)) return json({ ok: false, error: 'rate' }, 429);
  const b = await req.json().catch(() => null);
  if (!b || !validAnon(b.anonId)) return json({ ok: false, error: 'bad' }, 400);
  const email = b.email ? (validEmail(b.email) ? b.email : null) : null;
  if (b.email && !email) return json({ ok: false, error: 'bad-email' }, 400);
  const r = await db().query(
    `update public.survey_response set email = coalesce($2, email), completed_at = now(), updated_at = now() where anon_id = $1`,
    [b.anonId, email],
  );
  if (!r.rowCount) return json({ ok: false, error: 'no-session' }, 404);
  return json({ ok: true });
}
