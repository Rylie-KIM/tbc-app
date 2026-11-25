import { db } from '@/lib/db';
import { json } from '@/lib/api';

// H2: the daily Vercel cron calls this, so the database sees traffic every day (the free plan pauses
// a project after a week without activity). Also useful for a quick "is it up" check.
export async function GET() {
  try {
    const r = await db().query('select count(*)::int as n, count(completed_at)::int as done from public.survey_response');
    return json({ ok: true, responses: r.rows[0].n, completed: r.rows[0].done });
  } catch {
    return json({ ok: false }, 503);
  }
}
