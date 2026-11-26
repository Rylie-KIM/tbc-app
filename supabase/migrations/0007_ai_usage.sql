-- F25.10: a daily counter of AI calls (a cost and rate guard for the "describe what you want" search).
-- One row per day; the app only increments it. No text or person is stored here.
create table if not exists public.ai_usage (
  day    date primary key,
  calls  int not null default 0
);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;
