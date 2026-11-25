import { tx } from '@/lib/db';
import { json, limited, validAnon } from '@/lib/api';

// F21.3 / F21.12: creates the row when the person agrees on the intro screen.
export async function POST(req: Request) {
  if (limited(req)) return json({ ok: false, error: 'rate' }, 429);
  const b = await req.json().catch(() => null);
  if (!b || !validAnon(b.anonId) || (b.role !== 'organiser' && b.role !== 'sponsor') || b.website) return json({ ok: false, error: 'bad' }, 400);
  await tx(async (q) => {
    const r = await q(
      `insert into public.survey_response (anon_id, role_chosen, consent_at) values ($1, $2, now())
       on conflict (anon_id, role_chosen) do update set updated_at = now() returning id`,
      [b.anonId, b.role],
    );
    await q(`insert into public.survey_event (response_id, kind, role) values ($1, 'start', $2)`, [r.rows[0].id, b.role]);
  });
  return json({ ok: true });
}
