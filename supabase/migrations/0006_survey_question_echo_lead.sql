-- survey v3: the sentence that introduces the earlier answers shown above a follow-up question
alter table public.survey_question add column if not exists echo_lead text;
