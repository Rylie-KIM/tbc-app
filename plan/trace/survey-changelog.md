# Survey changelog

Every change to the questions, their wording, their options or their order gets a new version. Owner request, 2026-11-26: without this we cannot tell which version of the survey a person saw.

## How it works

- `SURVEY_VERSION` in `lib/survey.ts` (`v0`, `v1`, ...). The page sends it with every start, answer and completion; the server stores it on the response (`survey_response.survey_version`, the version at start) and on each logged event (`survey_event.survey_version`).
- `plan/trace/survey-versions/<version>.json` is a snapshot of what each person sees in that version: every question with its wording, hint, options, limits and order, for the three paths (organiser, sponsor who has sponsored, sponsor who has not). The file holds a hash of that content.
- `npm run survey:version -- --check` fails when the questions differ from the snapshot of the current version. Run it before every deploy. After a change: raise `SURVEY_VERSION`, run `npm run survey:version -- --write`, add a row below, then commit.
- The CSV export has `survey_version` (at start) and `versions_seen` (every version in that person's log; more than one means they carried on after a change). `?view=events` has the version on each line.
- When an option's text changes, the old text goes into `LEGACY_OPTIONS` in `lib/survey.ts`, so a page still open on the old version can still save. Old answers are not rewritten: in analysis, group the old and new text by hand and say so.
- Wording changes that are not questions (buttons, intro, layout) are not versions. They are in git.

## Versions

| Version | Date | What changed | Why |
|---|---|---|---|
| v0 | up to 2026-11-26 | The questionnaire as it stood when versions began (24 questions, `sponsor-questionnaire.md`). Rows saved before versions were recorded are labelled v0, including earlier small wording edits that were not tracked (for example the interview question's hint). | Starting point. Snapshot written from the code on 2026-11-26. |
| v1 | 2026-11-26 | Q10, option 9: "Measurable results from past editions" is now "Results that past sponsors got (for example hires, sign-ups, leads)". | The old text did not say whose results or what kind. |

## Analysis note for Q10

Answers saved under v0 hold the old text "Measurable results from past editions". Count it together with the v1 text for the same option, and report the two versions separately in a small table so a wording effect can be seen.
