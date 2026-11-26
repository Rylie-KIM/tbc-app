import { tx } from '@/lib/db';
import { json, limited, responseFor, sideOf, validAnon, validEmail, versionOf } from '@/lib/api';

export async function POST(req: Request) {
  if (limited(req)) return json({ ok: false, error: 'rate' }, 429);
  const b = await req.json().catch(() => null);
  if (!b || !validAnon(b.anonId)) return json({ ok: false, error: 'bad' }, 400);
  const email = b.email ? (validEmail(b.email) ? b.email : null) : null;
  if (b.email && !email) return json({ ok: false, error: 'bad-email' }, 400);
  const ok = await tx(async (q) => {
    const resp = await responseFor(q, b.anonId, sideOf(b.role));
    if (!resp) return false;
    await q(`update public.survey_response set email = coalesce($2, email), completed_at = now(), updated_at = now() where id = $1`, [resp.id, email]);
    await q(`insert into public.survey_event (response_id, kind, role, survey_version) values ($1, 'complete', $2, $3)`, [resp.id, resp.role_chosen, versionOf(b.version)]);
    return true;
  });
  return ok ? json({ ok: true }) : json({ ok: false, error: 'no-session' }, 404);
}
