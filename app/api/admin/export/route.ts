import { timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';
import { EXPORT_KEYS } from '@/lib/survey';

// F21.8 / F21.14: CSV of every answer, in the questionnaire's column order plus a source column.
// Protected by ADMIN_EXPORT_TOKEN (sent as ?token=...). Contains emails: keep the file private.
const csv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET(req: Request) {
  const want = process.env.ADMIN_EXPORT_TOKEN ?? '';
  const got = new URL(req.url).searchParams.get('token') ?? '';
  const a = Buffer.from(want), b = Buffer.from(got);
  if (!want || a.length !== b.length || !timingSafeEqual(a, b)) return new Response('Not found', { status: 404 });
  const r = await db().query('select * from public.survey_response order by started_at');
  const head = ['id', 'source', 'role_chosen', 'started_at', 'updated_at', 'consent_at', 'completed_at', ...EXPORT_KEYS, 'email'];
  const lines = [head.join(',')];
  for (const row of r.rows) {
    const ans = row.answers ?? {};
    lines.push([row.id, row.source, row.role_chosen, row.started_at?.toISOString(), row.updated_at?.toISOString(), row.consent_at?.toISOString(), row.completed_at?.toISOString(),
      ...EXPORT_KEYS.map((k) => (Array.isArray(ans[k]) ? ans[k].join('; ') : ans[k])), row.email].map(csv).join(','));
  }
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="tbc-survey.csv"', 'cache-control': 'no-store' } });
}
