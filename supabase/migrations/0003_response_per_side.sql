-- A person who tries both sides gets one response per side, so answers given as a sponsor never show up
-- as answers of the organiser side (and the other way round). Owner request 2026-11-25.
alter table public.survey_response drop constraint if exists survey_response_anon_id_key;
create unique index if not exists survey_response_anon_role_idx on public.survey_response (anon_id, role_chosen);
