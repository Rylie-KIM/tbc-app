-- Append-only log: every start, answer, role change, email and completion is recorded as its own row,
-- so nothing is overwritten and the history of a response can be read back (owner request 2026-11-25).
-- survey_response keeps the current state (one row per person); survey_event keeps what happened.
-- The app only inserts here; rows disappear only when the person deletes their answers (cascade).
create table if not exists public.survey_event (
  id           bigint generated always as identity primary key,
  response_id  uuid not null references public.survey_response(id) on delete cascade,
  kind         text not null check (kind in ('start', 'answer', 'email', 'complete', 'backfill')),
  key          text,
  value        jsonb,
  role         text,
  created_at   timestamptz not null default now()
);
create index if not exists survey_event_response_idx on public.survey_event (response_id, id);
alter table public.survey_event enable row level security;
revoke all on public.survey_event from anon, authenticated;

-- rows that existed before the log: one 'backfill' event per answer (time = last update; the true times were not kept)
insert into public.survey_event (response_id, kind, key, value, role, created_at)
select r.id, 'backfill', a.key, a.value, r.role_chosen, r.updated_at
from public.survey_response r, jsonb_each(r.answers) as a(key, value);
