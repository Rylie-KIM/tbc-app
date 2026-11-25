-- H4 / F21.3: survey answers collected by the website.
-- Only the server (through DATABASE_URL) reads or writes this table.
-- Row Level Security is ON with no policy, so the public (publishable) key can read nothing.
create extension if not exists pgcrypto;

create table if not exists public.survey_response (
  id            uuid primary key default gen_random_uuid(),
  anon_id       text not null unique,
  source        text not null default 'app',
  role_chosen   text not null check (role_chosen in ('organiser', 'sponsor')),
  started_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  consent_at    timestamptz not null,
  answers       jsonb not null default '{}'::jsonb,
  email         text,
  completed_at  timestamptz
);

alter table public.survey_response enable row level security;
revoke all on public.survey_response from anon, authenticated;
