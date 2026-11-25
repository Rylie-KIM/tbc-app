import { db } from '@/lib/db';
import { json, limited, validAnon } from '@/lib/api';

// "Delete my answers" (F01.5 / F21.2): removes the whole row for this browser.
export async function POST(req: Request) {
  if (limited(req, 20)) return json({ ok: false, error: 'rate' }, 429);
  const b = await req.json().catch(() => null);
  if (!b || !validAnon(b.anonId)) return json({ ok: false, error: 'bad' }, 400);
  await db().query('delete from public.survey_response where anon_id = $1', [b.anonId]);
  return json({ ok: true });
}
