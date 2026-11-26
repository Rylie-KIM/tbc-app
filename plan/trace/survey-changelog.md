# Survey changelog

Every change to the questions, their wording, their options or their order gets a new version. Owner request, 2026-11-26: without this we cannot tell which version of the survey a person saw.

## How it works

- `SURVEY_VERSION` in `lib/survey.ts` (`v0`, `v1`, ...). The page sends it with every start, answer and completion; the server stores it on the response (`survey_response.survey_version`, the version at start) and on each logged event (`survey_event.survey_version`).
- `plan/trace/survey-versions/<version>.json` is a snapshot of what each person sees in that version: every question with its wording, hint, options, limits and order, for the three paths (organiser, sponsor who has sponsored, sponsor who has not). The file holds a hash of that content.
- **In the database** (migration 0005): `survey_version` (one row per version: date, summary, content hash), `survey_question` (every question of that version; the answer options are a JSON array in the `options` column) and `survey_flow` (the order of the questions in that version, one row per position, for the three paths). The view `survey_event_readable` shows every logged event next to the question it answered, as that version worded it. These tables are filled from the snapshot files by `npm run survey:publish`; a published version is never edited (the script stops with MISMATCH if a snapshot no longer matches what is in the database). There is deliberately no foreign key from `survey_response` / `survey_event` to `survey_version`: a save must never fail because a version was not published yet.
- Release steps for a change: edit `lib/survey.ts`, raise `SURVEY_VERSION`, `npm run survey:version -- --write --summary "what changed"`, add a row below, `npm run survey:publish`, deploy, commit. `npm run survey:version -- --check` and `npm run survey:publish -- --check` must both pass before a deploy.
- `npm run survey:version -- --check` fails when the questions differ from the snapshot of the current version. Run it before every deploy. After a change: raise `SURVEY_VERSION`, run `npm run survey:version -- --write`, add a row below, then commit.
- The CSV export has `survey_version` (at start) and `versions_seen` (every version in that person's log; more than one means they carried on after a change). `?view=events` has the version on each line.
- When an option's text changes, the old text goes into `LEGACY_OPTIONS` in `lib/survey.ts`, so a page still open on the old version can still save. Old answers are not rewritten: in analysis, group the old and new text by hand and say so.
- Wording changes that are not questions (buttons, intro, layout) are not versions. They are in git.

## Versions

| Version | Date | What changed | Why |
|---|---|---|---|
| v0 | up to 2026-11-26 | The questionnaire as it stood when versions began (24 questions, `sponsor-questionnaire.md`). Rows saved before versions were recorded are labelled v0, including earlier small wording edits that were not tracked (for example the interview question's hint). | Starting point. Snapshot written from the code on 2026-11-26. |
| v1 | 2026-11-26 | Q10, option 9: "Measurable results from past editions" is now "Results that past sponsors got (for example hires, sign-ups, leads)". | The old text did not say whose results or what kind. |
| v2 | 2026-11-26 | (1) Q14 is a follow-up to Q13: it now shows "You chose: ..." (the person's Q13 picks) above the question, and asks "What else should an event’s web page always show about its participants?" (the old text said "Which of these" with nothing shown). A person who chose nothing or only "I would not filter" gets "What should an event’s web page always show about its participants?" with no list. (2) Q16 has three new options after "Attendee numbers", each separate: "Event theme or topic", "Purpose of the event (why it exists and who it is for)", "Expected outcomes (for example projects built, hires, sign-ups)"; the option "Results from past editions" became "Results of past editions (for example hires, sign-ups, projects built)". (3) Wording only, same meaning: Q5 to Q9 now say "the most recent event you sponsored" instead of "this event" or "the event"; Q10 and Q23 and Q21 say what is sponsored; Q13 "the participants of an event you sponsor" (was "the participants you receive"); Q14 and Q16 say "an event’s web page"; Q15 "How useful would TBC be to you?" (was "that"); Q17 "If TBC charged a fee for using the website, who should pay that fee?" (was "it"); Q18 names the TBC team and the topic of the interview and its hint says "Leaving your email is optional"; Q24 and the organiser edition question name the event. | (1) "Which of these" pointed at nothing on the screen, and the intent was unclear. (2) Owner: an event page may also need to say what the event is about and what it aims for. |

## Analysis note for Q10

Answers saved under v0 hold the old text "Measurable results from past editions". Count it together with the v1 text for the same option, and report the two versions separately in a small table so a wording effect can be seen.

## Analysis note for Q14 and Q16

Q14: from v2 the question follows the person's Q13 picks and asks "what else", so answers repeat Q13 less than in v0 and v1. Do not pool them for the "share that repeats Q13" figure; read the new codes in both. The list shown is not saved separately: it is the person's own Q13 answer, in the same row.

Q16: the three new options exist only from v2. Share them out of the v2 respondents, not out of everyone, and report the other options by version too so the longer list's effect can be seen.
