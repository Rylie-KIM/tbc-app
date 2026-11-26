-- The questionnaire itself, kept per version (owner request 2026-11-26), so an answer can always be read
-- against the exact question, options and order the person saw.
--   survey_version   one row per version (what changed, a hash of the content)
--   survey_question  every question of that version; the answer options are a JSON array (jsonb)
--   survey_flow      the order of the questions in that version, for each path
-- Filled by `npm run survey:publish` from plan/trace/survey-versions/*.json. A published version is never changed:
-- a change to the questions is a new version. survey_response.survey_version and survey_event.survey_version
-- hold the version text; there is deliberately no foreign key, so a save can never fail because a version
-- was not published yet (no answer may be lost, D10).
create table if not exists public.survey_version (
  version       text primary key,
  released      date,
  summary       text,
  content_hash  text not null,
  published_at  timestamptz not null default now()
);
create table if not exists public.survey_question (
  version       text not null references public.survey_version(version) on delete restrict,
  key           text not null,
  kind          text not null,
  section       text not null,
  title         text,
  intro         text,
  hint          text,
  options       jsonb not null default '[]'::jsonb,
  max_choices   int,
  has_other     boolean not null default false,
  optional      boolean not null default false,
  low_label     text,
  high_label    text,
  echo_from     text,
  title_after   text,
  primary key (version, key)
);
create table if not exists public.survey_flow (
  version       text not null,
  path          text not null check (path in ('organiser', 'sponsor_has_sponsored', 'sponsor_not_sponsored_yet')),
  position      int  not null,
  question_key  text not null,
  primary key (version, path, position),
  foreign key (version, question_key) references public.survey_question(version, key)
);
alter table public.survey_version enable row level security;
alter table public.survey_question enable row level security;
alter table public.survey_flow enable row level security;
revoke all on public.survey_version, public.survey_question, public.survey_flow from anon, authenticated;

-- every logged event next to the question it answered, as that version worded it
create or replace view public.survey_event_readable as
select e.id, e.response_id, e.created_at, e.kind, e.survey_version, e.key, q.title as question, q.kind as question_kind, q.options as question_options, e.value, e.role
from public.survey_event e
left join public.survey_question q on q.version = e.survey_version and q.key = e.key;
revoke all on public.survey_event_readable from anon, authenticated;
