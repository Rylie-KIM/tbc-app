import { tx } from '@/lib/db';
import { cleanAnswer, json, limited, responseFor, sideOf, validAnon, validEmail, versionOf } from '@/lib/api';

// F21.12: one answer at a time; the client only shows "Saved" after this returns ok.
// Every answer belongs to one side (sponsor or organiser): a person who tries both has two separate responses.
export async function POST(req: Request) {
  if (limited(req)) return json({ ok: false, error: 'rate' }, 429);
  const b = await req.json().catch(() => null);
  if (!b || !validAnon(b.anonId)) return json({ ok: false, error: 'bad' }, 400);
  const side = sideOf(b.role);
  const ver = versionOf(b.version); // the questionnaire version this person saw

  if (b.key === 'q18_email') { // the email lives in its own column
    const v = typeof b.value === 'string' ? b.value.trim() : '';
    if (v && !validEmail(v)) return json({ ok: false, error: 'bad-email' }, 400);
    const ok = await tx(async (q) => {
      const resp = await responseFor(q, b.anonId, side);
      if (!resp) return false;
      await q(`update public.survey_response set email = nullif($2, ''), updated_at = now() where id = $1`, [resp.id, v]);
      await q(`insert into public.survey_event (response_id, kind, key, value, role, survey_version) values ($1, 'email', 'q18_email', to_jsonb($2::text), $3, $4)`, [resp.id, v, resp.role_chosen, ver]);
      return true;
    });
    return ok ? json({ ok: true }) : json({ ok: false, error: 'no-session' }, 404);
  }

  const value = cleanAnswer(b.key, b.value);
  if (value === null) return json({ ok: false, error: 'bad-answer' }, 400);
  const ok = await tx(async (q) => {
    const resp = await responseFor(q, b.anonId, side);
    if (!resp) return false;
    await q(`update public.survey_response set answers = answers || jsonb_build_object($2::text, $3::jsonb), updated_at = now() where id = $1`, [resp.id, b.key, JSON.stringify(value)]);
    await q(`insert into public.survey_event (response_id, kind, key, value, role, survey_version) values ($1, 'answer', $2, $3::jsonb, $4, $5)`, [resp.id, b.key, JSON.stringify(value), resp.role_chosen, ver]);
    return true;
  });
  return ok ? json({ ok: true }) : json({ ok: false, error: 'no-session' }, 404);
}
