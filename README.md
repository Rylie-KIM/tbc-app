# TBC

Early preview of TBC: hackathon organisers and sponsors find each other. Planning lives in `plan/` (start with `plan/trace/`: `user-needs.md` → `features.md` → `tasks.md`, and `decisions.md`).

Live preview: https://tbc-app-mu.vercel.app (public, marked "early preview", all event data is example data).

## What is built (2026-11-25)

The survey slice: landing page (dark hero), onboarding survey that saves every answer, a start page with a role switch, example events filterable by organiser type, a short guided tour and checklist.

## Run it

```bash
npm install
cp .env.example .env     # fill in the values; .env is git-ignored
npm run db:test          # connection test (pooled address)
npm run db:migrate       # applies supabase/migrations/*.sql, once each
npm run dev              # http://localhost:3000
npm run build && npm start -- -p 3100
node scripts/save-check.mjs http://localhost:3100   # stores 20 test answers, reads them back, removes them
```

## Layout

| Path | What |
|---|---|
| `app/` | Pages (`/` landing, `/start` onboarding, `/app` start page, `/privacy`) and API routes (`app/api/survey/*`, `health`, `admin/export`) |
| `components/` | `Onboarding`, `StartApp` (role switch, tour, checklist, events), `XScene` (background) |
| `data/events.ts` | Twelve invented example events (always labelled "Example") |
| `lib/` | `db.ts` (pooled Postgres), `survey.ts` (questions), `api.ts` (checks, rate limit) |
| `supabase/migrations/` | Database changes: only through these files, never by hand |
| `scripts/` | `migrate.mjs`, `db-test.mjs`, `save-check.mjs` |
| `plan/` | Everything planned: needs, features, tasks, decisions, design, research |

## Rules

- Secrets only in `.env` (local) and Vercel Environment Variables. Never in git, chat or browser code.
- Database changes only through migration files. Every table has Row Level Security on; the server reaches the database through `DATABASE_URL`.
- One commit per finished task, message starts with the task ID, pushed to `origin/main` (`plan/trace/decisions.md` D13).
- Export of survey answers (contains emails): `/api/admin/export?token=…` with `ADMIN_EXPORT_TOKEN`. Keep the file private.
