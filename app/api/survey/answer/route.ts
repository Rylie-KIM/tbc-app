import { tx } from '@/lib/db';
import { cleanAnswer, json, limited, validAnon, validEmail } from '@/lib/api';

// F21.12: one answer at a time; the client only shows "Saved" after this returns ok.
export async function POST(req: Request) {
  if (limited(req)) return json({ ok: false, error: 'rate' }, 429);
  const b = await req.json().catch(() => null);
  if (!b || !validAnon(b.anonId)) return json({ ok: false, error: 'bad' }, 400);
  if (b.key === 'q18_email') { // the email lives in its own column
    const v = typeof b.value === 'string' ? b.value.trim() : '';
    if (v && !validEmail(v)) return json({ ok: false, error: 'bad-email' }, 400);
    const ok = await tx(async (q) => {
      const r = await q(`update public.survey_response set email = nullif($2, ''), updated_at = now() where anon_id = $1 returning id, role_chosen`, [b.anonId, v]);
      if (!r.rowCount) return false;
      await q(`insert into public.survey_event (response_id, kind, key, value, role) values ($1, 'email', 'q18_email', to_jsonb($2::text), $3)`, [r.rows[0].id, v, r.rows[0].role_chosen]);
      return true;
    });
    return ok ? json({ ok: true }) : json({ ok: false, error: 'no-session' }, 404);
  }
  const value = cleanAnswer(b.key, b.value);
  if (value === null) return json({ ok: false, error: 'bad-answer' }, 400);
  const ok = await tx(async (q) => {
    const r = await q(
      `update public.survey_response set answers = answers || jsonb_build_object($2::text, $3::jsonb), updated_at = now() where anon_id = $1 returning id, role_chosen`,
      [b.anonId, b.key, JSON.stringify(value)],
    );
    if (!r.rowCount) return false;
    await q(`insert into public.survey_event (response_id, kind, key, value, role) values ($1, 'answer', $2, $3::jsonb, $4)`, [r.rows[0].id, b.key, JSON.stringify(value), r.rows[0].role_chosen]);
    return true;
  });
  return ok ? json({ ok: true }) : json({ ok: false, error: 'no-session' }, 404);
}
