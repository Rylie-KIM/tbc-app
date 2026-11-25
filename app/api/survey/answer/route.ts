import { db } from '@/lib/db';
import { cleanAnswer, json, limited, validAnon } from '@/lib/api';

// F21.12: one answer at a time; the client only shows "Saved" after this returns ok.
export async function POST(req: Request) {
  if (limited(req)) return json({ ok: false, error: 'rate' }, 429);
  const b = await req.json().catch(() => null);
  if (!b || !validAnon(b.anonId)) return json({ ok: false, error: 'bad' }, 400);
  const value = cleanAnswer(b.key, b.value);
  if (value === null) return json({ ok: false, error: 'bad-answer' }, 400);
  const r = await db().query(
    `update public.survey_response set answers = answers || jsonb_build_object($2::text, $3::jsonb), updated_at = now() where anon_id = $1`,
    [b.anonId, b.key, JSON.stringify(value)],
  );
  if (!r.rowCount) return json({ ok: false, error: 'no-session' }, 404);
  return json({ ok: true });
}
