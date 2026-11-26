# Survey changelog

Every change to the questions, their wording, their options or their order gets a new version. Owner request, 2026-11-26: without this we cannot tell which version of the survey a person saw.

## How it works

- `SURVEY_VERSION` in `lib/survey.ts` (`v0`, `v1`, ...; the first is `v0`). The page sends it with every start, answer and completion; the server stores it on the response (`survey_response.survey_version`, the version at start) and on each logged event (`survey_event.survey_version`).
- `plan/trace/survey-versions/<version>.json` is a snapshot of what each person sees in that version: every question with its wording, hint, options, limits and order, for the three paths (organiser, sponsor who has sponsored, sponsor who has not). The file holds a hash of that content.
- **In the database** (migration 0005): `survey_version` (one row per version: date, summary, content hash), `survey_question` (every question of that version; the answer options are a JSON array in the `options` column) and `survey_flow` (the order of the questions in that version, one row per position, for the three paths). The view `survey_event_readable` shows every logged event next to the question it answered, as that version worded it. These tables are filled from the snapshot files by `npm run survey:publish`; a published version is never edited (the script stops with MISMATCH if a snapshot no longer matches what is in the database). There is deliberately no foreign key from `survey_response` / `survey_event` to `survey_version`: a save must never fail because a version was not published yet.
- Release steps for a change: edit `lib/survey.ts`, raise `SURVEY_VERSION`, `npm run survey:version -- --write --summary "what changed"`, add a row below, `npm run survey:publish`, deploy, commit. `npm run survey:version -- --check` and `npm run survey:publish -- --check` must both pass before a deploy.
- `npm run survey:version -- --check` fails when the questions differ from the snapshot of the current version. Run it before every deploy. After a change: raise `SURVEY_VERSION`, run `npm run survey:version -- --write`, add a row below, then commit.
- The CSV export has `survey_version` (at start) and `versions_seen` (every version in that person's log; more than one means they carried on after a change). `?view=events` has the version on each line.
- When an option's text changes in a later version, the old text goes into `LEGACY_OPTIONS` in `lib/survey.ts`, so a page still open on the old version can still save (it is empty now). Old answers are not rewritten: in analysis, group the old and new text by hand and say so.
- Wording changes that are not questions (buttons, intro, layout) are not versions. They are in git.

## Versions

| Version | Date | What it is |
|---|---|---|
| v0 | 2026-11-26 | The first version: the 24 questions of `sponsor-questionnaire.md` as they stand after the test period. Organiser path 5 questions, sponsor who has sponsored 23, sponsor who has not 11. Snapshot: `survey-versions/v0.json`. |

The next change to a question, an option or the order is `v1`: raise `SURVEY_VERSION`, write the snapshot, add a row here.

## Test period (before v0): not versions

Until 2026-11-26 the link had not been shared with anyone, so every answer in the database was a test and all of them were deleted (D19). The wording changes made on 2026-11-26 during that test period are folded into v0 and are not separate versions. For the record, they were:

- Q10, option 9: "Measurable results from past editions" is now "Results that past sponsors got (for example hires, sign-ups, leads)" (the old text did not say whose results or what kind). Q16: "Results from past editions" is now "Results of past editions (for example hires, sign-ups, projects built)".
- Q14 follows Q13: the page shows "In the previous question, you chose: ..." as plain text above the question, and the question reads "What else should an event’s web page always show about its participants?". A person who chose nothing, or only "I would not filter", gets "What should an event’s web page always show about its participants?" with no sentence above it. (The old text, "Which of these should an event page always show about its participants?", pointed at nothing on the screen.)
- Q16 has three new options after "Attendee numbers", each separate: "Event theme or topic", "Purpose of the event (why it exists and who it is for)", "Expected outcomes (for example projects built, hires, sign-ups)".
- Q22: "What do you wish event organisers did differently?" is now "When hackathon organisers contact you or work with you as a sponsor, what is missing or frustrating?" (the old text did not say different from what, or about what). Made after the first answers by the owner's test, before any real visitor; the one response then in the database had no Q22 answer.
- Pronouns replaced by what they point at: Q5 to Q9 say "the most recent event you sponsored"; Q10, Q21 and Q23 say what is sponsored; Q13 says "the participants of an event you sponsor"; Q15 "How useful would TBC be to you?"; Q17 "If TBC charged a fee for using the website, who should pay that fee?"; Q18 names the TBC team and the topic, and its hint says "Leaving your email is optional"; Q24 and the organiser edition question name the event.
