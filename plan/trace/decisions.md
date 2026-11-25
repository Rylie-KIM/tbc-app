# TBC decisions

Updated 2026-11-25. **Working rule (owner, 2026-11-25):** Claude keeps `user-needs.md`, `features.md`, `tasks.md` and this file up to date without asking each time. Status words: **Owner decided** = stated by the project owner; **Assumed** = a default chosen by Claude that stands until the owner changes it.

One entry per decision, newest last. Each says what was decided, who decided, and what it changes.

---

## D1. Hosting and database: Vercel with Supabase (2026-11-24)

**Decided by:** the project owner (chat, 2026-11-24). **Related task:** R8 in `tasks.md` (stack and hosting); only the database and hosting parts are decided here. Web only or web plus mobile app is still open.

**Decision:** the web app is deployed on Vercel. User data lives in a Supabase Postgres database, connected through the Vercel Marketplace.

**Why Supabase (my reading, not stated by the owner):** one service can hold the database, sign-in (Supabase Auth) and uploaded files (Supabase Storage), which covers F01, F02 uploads and F21 with one account to manage. Whether to use its sign-in is not decided (F01.1).

**What was found on the free plan (web search, 2026-11-24; check the official pricing page before relying on it):**
- 500 MB database per project; 2 active projects.
- A project **pauses after one week without activity** and stays offline until someone turns it back on in the dashboard.
- **No automatic backups** on the free plan. The Pro plan lists daily backups with 7-day retention. I did not verify the Pro price.
- I did not find out whether data survives a pause in every case. Read the pausing page in the Supabase docs.

Survey answers are small (an estimated 1-2 KB each), so size is not the problem. The pause and the missing backups are.

**Risks and what covers them**

| Risk | Cover |
|---|---|
| Project pauses during the survey period and answers cannot be saved | Keep the project active with regular traffic or a scheduled request; before the survey goes live, check that the project is running; consider the Pro plan for the survey period (task to add) |
| No automatic backups on free | Our own copies: Google Sheet copy of every answer (F21.13), weekly CSV export to Drive (F21.14), daily count check (F21.15), restore test (F21.16) |
| Data lost by a mistake (wrong delete, bad change) | Same backups; changes to the database made only through saved scripts, not by hand in the dashboard |
| Personal data stored outside the UK or EU | Choose a London or EU region when creating the project |

**Decided later the same day (2026-11-24, project owner)**
- The Supabase project is on the owner's own account (created that day).
- Region: Europe, `eu-west-1` (Ireland), read from the pooler address in the Supabase dashboard.
- **Free plan** until the survey starts, and for the survey too. The pause and the missing backups therefore stay open risks, and the covers in the table above are required, not optional.
- Task H2 (keep-alive and pause warning) approved.
- Database changes are kept as code (migration files in the repo); nobody edits the production database by hand.

**Not decided yet**
- Who owns the Vercel account.
- Whether to move to Pro later (for example if a pause or lost data becomes a real problem).
- Whether to use Supabase Auth for sign-in.

**What changes in the plan**
- R8 is half done (hosting and database); stack for the code and web-versus-mobile remain.
- F21.14 is required, not optional, on the free plan.
- The follow-up tasks were added to `tasks.md` as H1 to H4 (and H5 to H10 later).

---

## D2. Survey collection: the website only, no Google Form (2026-11-25)

**Status:** Owner decided (2026-11-25): the survey is collected on the website only; the Google Form and the timing test are dropped. This replaces an earlier assumption of mine (Google Form first). Nothing had been sent through the Google Form.

**Consequences:**
- The survey cannot go out until the site exists, so the survey part (F26 hosting and data safety, the F00 basics, F22 landing, F21 onboarding) is the first build. This conflicts with the meeting-1 plan of no development before the winter holidays; the survey slice is the first thing built when development starts.
- The Google Form's automatic copy in the owner's Drive is gone, so the safety tasks F21.12 to F21.16 (immediate save, Google Sheet copy, backups, daily count, save-check) are the only protection and must pass before any link is shared (R10).
- There is no unprimed Google Form baseline (F21.11 skipped), so the intro stays general (F21.21).
- Tasks R2 and R9 are skipped; the Apps Script in the questionnaire file is kept only for reference. The questions (Q1 to Q24) and the analysis plan still apply.

## D3. AI provider and models (2026-11-25)

**Status:** Assumed (the owner asked which AI; Claude proposed).

**Decision:** Claude through the Anthropic API. The prospectus reader starts on Claude Haiku 5.5 and is compared with Claude Sonnet 5.5 on the real examples (F25.8). Sonnet 5.5 is the likely model for the match explainer. Opus 5.5 only if measured to be needed.

**Why:** Claude can take a PDF as a document, which avoids the letter-spaced text problem seen when the Impact Hack PDF is read as plain text.

**Checks needed:** the model ids and prices come from a table cached on 2026-11-03 (Haiku 5.5 $0.10 / $0.50, Sonnet 5.5 $2 / $10, Opus 5.5 $4 / $20 per million tokens); my cost per prospectus (under one cent on Haiku, a few cents on Sonnet) is an estimate and was not measured. The API key stays on the server; a call limit and a spend cap are required (F25.5); the uploaded file goes to the AI provider, so the person is told first (F25.6); the retention terms were not checked.

## D4. Preview-mode rules for the role switch (2026-11-25)

**Status:** Assumed. The switch only changes the view, not permissions; the other side shows example data only; actions there never reach real people (F23.1, F23.7). Both sides marked by a text label, never by colour alone.

## D5. Example data policy (2026-11-25)

**Status:** Owner decided on Impact Hack (2026-11-25): its real prospectus is not published; only its content ideas are borrowed. Assumed for the rest: twelve example prospectuses (F24) across five organiser types, all names invented, every example marked "Example". The real Impact Hack PDF is used only for private testing of the AI reader.

## D6. Typeface (2026-11-24)

**Status:** Owner decided on 2026-11-25: Hanken Grotesk, a free look-alike of Aeonik (the typeface in `../design/4.jpg`, which is paid), is used for now (F00.2) for the app, the onboarding and the guided start. Aeonik is reconsidered at a public launch. One typeface everywhere.

## D7. Design direction (2026-11-24)

**Status:** Owner decided. "Flora" v2 (`../design/tbc-flora_v2.html`): light glass app screens, dark X hero for landing and covers, neon-gradient logo, no red anywhere, 12px gap in every button row. Written up in `../design/design-direction.md`.

## D8. Landing and onboarding flow (2026-11-25)

**Status:** Owner decided. Landing (dark hero) asks "Which side do you want to try first?" with two neon buttons ("Try as an organiser", "Try as a sponsor"); then one question per screen (4-5 questions); then a personalised start; then sign-up. A role switch fixed in the top-right corner ("Trying as: Organiser | Sponsor") lets a person explore both sides. English wording is a first proposal (F22.6 reviews it).

## D9. Code stack (2026-11-25)

**Status:** Assumed. Next.js on Vercel with Supabase (database, likely sign-in, file storage). Not verified with the tech lead; web only for now.

## D10. No answer may be lost (2026-11-24)

**Status:** Owner decided. Each survey answer is saved to the database at once, copied to a Google Sheet in the owner's Drive, backed up weekly as CSV outside the database provider, and checked by a daily count (F21.12 to F21.16, H2). Required because the Free plan has no automatic backups and pauses after a week without activity.

## D11. Organiser-type filter (2026-11-25)

**Status:** Owner proposed. Events can be filtered by who organises them (student society; university or careers service; company-hosted; community or non-profit; commercial organiser). It needs more examples (twelve, at least two per type, F24) and an organiser-type field on the event page (F02). Whether sponsors want it is tested by a proposed survey question (R11).

## D12. Onboarding intro and guided start (2026-11-25)

**Status:** Owner requested; wording is Claude's first draft. Before the survey questions, three short screens say what TBC is for, explain the two kinds of user and say that the survey is to understand sponsors' needs (organisers get a shorter path, F21.19 to F21.21). After the questions, the start page offers a tour and a "Try these three things" checklist (F27). Draft texts in `../design/onboarding-copy.md`. The intro explains the product before the questions, which can steer answers, so the intro is kept general and the answers are compared with the Google Form by source (F21.11).

## D13. Commit and push after every finished task (2026-11-25)

**Status:** Owner decided: when a task is finished, Claude commits and pushes it to `origin/main` of the `tbc-app` repo without asking again. One commit per task, message starts with the task ID (for example `H6: connection test passes`); the commit ends with the co-author line the tool requires. Before each commit: `.env` is not staged, no key or password is in the diff, `git status` is clean afterwards. Three things stay out of git (`.gitignore`) until the repo is confirmed private: the real Impact Hack PDF (D5), the raw meeting transcript (names of team members) and the reference images `1.jpg` to `8.jpg` (other people's design work). The other DeskThread repo also keeps its `plan/` out of git, so this is a deliberate choice to review. The visibility of the GitHub repo (public or private) was not checked: keep it private while it holds the plan and the research.

## D14. First build and deployment (2026-11-25)

**Status:** Owner asked to build the app and deploy it ("start now, deploy until done"). Facts, not choices:
- Live at https://tbc-app-mu.vercel.app, Vercel project `tbc-app`, function region Dublin (dub1) to sit near the Supabase database (`eu-west-1`). The site is public (no password) and marked "early preview"; it asks search engines not to index it. Nobody has been given the link yet: share it only after the save-check on the live site has passed (R10).
- The app reaches the database through the pooled address (`DATABASE_URL`); the direct address does not work from the Vercel build or from this Mac (IPv6 only), so migrations also use the pooled one.
- Production variables set on Vercel: `DATABASE_URL`, `ADMIN_EXPORT_TOKEN` (the CSV export of answers, `/api/admin/export?token=...`). Preview and development variables are not set.
- A daily Vercel cron calls `/api/health`, which reads the database, against the Free plan's pause after a week without activity (H2).
- Not built yet, and listed in `tasks.md`: the Google Sheet copy (F21.13), the weekly backup (F21.14), the daily count check (F21.15), the backup restore test, event pages, prospectus upload, the AI reader.

**Save-check results (2026-11-25).** On the live site, 20 of 20 test answers were stored exactly as sent and read back, wrong input and a wrong export token were refused, and the delete button removed all 20 (checked in the database; the one row left belongs to a real visitor). In a real browser, answers showed "Saved" only after the server confirmed, and answers given while the network was cut were kept in the browser and stored after it returned. Not yet done: the Google Sheet copy, automatic backups, the backup restore test (F21.13 to F21.16): until they pass, treat the live survey as not yet safe to share widely (R10).

## D15. The survey keeps a log, not one overwritten row (2026-11-25)

**Status:** Owner asked (the data looked like one row updated again and again). It was: one `survey_response` row per person, each answer overwriting the last. Now there is also `survey_event`, an append-only log with one row per start, answer, email and completion (migration 0002); the response row remains the current state. A changed answer keeps both values in the log. Deleting a person's answers removes the response and its log rows (the privacy promise). The existing visitor's answers were copied into the log as `backfill` rows (their true times were not kept). The CSV export has the current answers and, with `?view=events`, the log.

## D16. The full questionnaire is in the app (2026-11-25)

**Status:** Owner asked. All 24 questions of the questionnaire file are in the onboarding (earlier only 5 to 6 were). This overrides the earlier plan of 4 to 5 onboarding questions (F21.1). A sponsor who has sponsored sees 23 questions, one who has not (Q4 = 0) sees 11, an organiser sees 5. The intro now says "a few minutes" (it was "about a minute"); the time was not measured.

**Update (2026-11-25):** a sponsor who answers Q4 = 0 sees 11 questions (the skip rule in `sponsor-questionnaire.md` stays). Owner chose to keep it and to say "11–23 questions" on the intro screen instead of a fixed 23.

## D17. One response per person and side (2026-11-25)

**Status:** Owner reported a bug: after switching between Sponsor and Organiser, the earlier answers stayed attached to the newly chosen side. Cause: there was one response row per browser, and the side was overwritten. Now there is one response per browser and side (migration 0003, unique on `anon_id` + `role_chosen`); each answer names its side. Switching side during the questionnaire returns to that side's start screen. Answers already stored before this fix were not split (only one real visitor row existed). "Delete my answers" removes both sides.
