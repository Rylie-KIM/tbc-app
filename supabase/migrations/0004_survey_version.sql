-- Survey versions (owner request 2026-11-26): each response and each logged event records which version of the
-- questionnaire the person saw, so a change to wording, options or order can be tracked. See plan/trace/survey-changelog.md.
-- Everything saved before versions were recorded is labelled 'v0' (the questionnaire as it stood on 2026-11-26).
-- A row with no version later means an old cached page sent it without one.
alter table public.survey_response add column if not exists survey_version text;
alter table public.survey_event add column if not exists survey_version text;
update public.survey_response set survey_version = 'v0' where survey_version is null;
update public.survey_event set survey_version = 'v0' where survey_version is null;
