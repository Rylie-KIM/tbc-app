# TBC tasks

Draft 2026-11-24, updated 2026-11-25 (owner's standing instruction: keep this file current without asking). Third step of the plan: user needs → features → **tasks**. Every task points to a feature in `features.md`, and every feature points to needs in `user-needs.md` (same folder).

**Detail level:** the first slice (see `features.md` section 3: the preview app, made of F00, F01, F02, F03, F05, F06, F08, F18, F21, F22, F23, F24, F25 and F26) is broken into tasks. Later features only get one placeholder task each, because their gates (survey thresholds) are not passed yet and a detailed plan now would be guesswork.

**Sizes are my rough guesses, not agreed with the tech lead:** S = under half a day, M = 1-2 days, L = 3-5 days. Hosting and database are decided (Vercel and Supabase); the code stack is assumed to be Next.js (`decisions.md`).

**Status column (added 2026-11-25):** every task row has one of `todo`, `in progress`, `done`, `blocked` (waiting for something outside the task), `skipped` (owner decided not to do it) or `later` (its gate is not passed yet, so it is not planned in detail). Claude changes the cell whenever work happens and refreshes the counts below; the owner can also edit it by hand.

**Progress (2026-11-25, after the first build):** done 44, in progress 28, todo 71, blocked 0, skipped 3, later 13; 159 tasks in all.

**Notes on the first status values:**

Done so far (2026-11-24 and 25):
- User needs, features and tasks written (this folder); decisions recorded in `decisions.md`.
- Questionnaire file updated: fixes 1-4, new Q21 to Q24. Owner decision 2026-11-25: the survey is collected on the website only (no Google Form, no timing test).
- Design direction chosen and saved (`../design/`: Flora v2, glass v1, `design-direction.md`, `logo_final.png`).
- Supabase project created on the owner's account in Europe (`eu-west-1`), Free plan decided; `.env` and `.env.example` set up and git-ignored; the `.env` password line fixed by the owner (H1, H3, H5).
- The repo `README.md` now lists the TBC project (owner allowed it, 2026-11-25).
- **The survey slice is built and live (2026-11-25):** landing, onboarding that saves every answer, start page with role switch, example events with the organiser-type filter, a short tour and checklist. https://tbc-app-mu.vercel.app. Not yet built: the Google Sheet copy, automatic backups, event pages, prospectus upload, the AI reader.

Open problems right now:
- No connection test has been run yet (H6): the `.env` lines look consistent, but nothing has connected to the database.
- The survey cannot go out until the site is built: the survey part (F26, F00 basics, F22, F21) is now the first build, and its save-check (F21.16) must pass before any link is shared (R10).

**Timing constraint from meeting 1:** no development until the winter holidays (exams, then the final-year project due in February). So the research tasks (section 1) come first; build tasks start after.

---

## 1. Before building: research and decisions

These unblock the gates in `features.md`. Owners are left empty on purpose: nobody has been assigned yet.

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| R1 | done | Decide whether to apply the five questionnaire fixes (`user-needs.md` 2.2) and update the form | Decision | S | none | The form owner has said yes or no to each of the five fixes; the form and script match. **Decided 2026-11-24: fixes 1-4 applied to `../research/sponsor-questionnaire.md` (text and script); fix 5 waits for the timing test (R2). The Google Form route was dropped on 2026-11-25 (R9). Q24 (own events organised, by edition) was added the same day** |
| R2 | skipped | Time the form with two people; cut questions if over 6 minutes | Research | S | R1 | **Skipped (owner, 2026-11-25).** There is no Google Form to time; the in-app onboarding is short by design (F21.4 aims at about a minute) |
| R3 | todo | Share the survey link from the website and reach at least 10 responses, with 3 or more each from recruiting, developer relations and marketing | Research | M (spread over days) | F21.16, F22.2 | Counts per role recorded; quota met or a note on why not |
| R4 | todo | Run 5 short interviews with other organisers (15 minutes each) | Research | M | none | 5 notes saved in `../research/`; organiser needs O1-O6 re-rated |
| R5 | todo | Run a 5-question participant poll on willingness to share data | Research | S | none | Results saved; P1 re-rated |
| R6 | todo | Analyse the survey with the plan in `../research/sponsor-questionnaire.md` and read the decision gate | Research | M | R3 | One-page report; gate result Go, Iterate or Pivot written down |
| R7 | todo | Update confidence and priority in `user-needs.md` and the gates in `features.md` | Planning | S | R4, R5, R6 | Both files updated; first slice confirmed or changed |
| R8 | in progress | Choose the stack and hosting; record the decision | Decision | S | none | One short decision note in `trace/`; includes web only or web plus mobile. Hosting and database decided: see `decisions.md` D1 (Vercel and Supabase) |
| H1 | done | Create the Supabase project in a London or EU region | Build | S | R8 | **Done 2026-11-24.** Project exists (created by the owner, region Europe, `eu-west-1` Ireland); keys saved only in `.env`; Vercel settings still to do (H7) |
| H2 | in progress | Keep the project from pausing: a scheduled request plus a warning if the project is paused (approved 2026-11-24) | Build | S | H1 | The project stays active through a week with no visitors; a forced pause sends a warning **Built 2026-11-25:** A daily Vercel cron calls `/api/health`, which queries the database (in `vercel.json`). Still to do: a warning if the project is ever paused |
| H3 | done | Free or Pro for the survey: **decided Free** (2026-11-24, done). Free pauses after a week without activity and has no automatic backups, so H2 and F21.13-F21.16 are required | Decision | S | H1 | Recorded in `decisions.md`; revisit if a pause or data loss becomes a real problem |
| H4 | done | Database changes live in the repo as migration files; the first table is created by one | Build | S | H1 | **Done 2026-11-25.** `supabase/migrations/0001_survey_response.sql` applied by `npm run db:migrate`; a second run skips it |
| H5 | done | Fix `.env`: `SUPABASE_DB_PASSWORD` holds the real password (with `!`) and only the two connection strings use `%21`; set a new long password because the old one was shown in chat, then rebuild `DATABASE_URL` and `DIRECT_URL` | Build | S | H1 | **Done 2026-11-25 (owner).** Checked: the password line holds the plain password, both connection strings decode to it, no placeholders left, `.env` is git-ignored. Whether the password was changed from the one shown in chat was not checked |
| H6 | done | Connection test from the repo: the pooled and the direct connection both answer a simple query | Test | S | H5, X6 | **Done 2026-11-25.** The pooled address answers. The direct address fails from this network (it is IPv6 only), so migrations and the app use the pooled one |
| H7 | done | Create the Vercel project, link the repo, enter the same variables under Environment Variables (production and preview) | Build | S | H5, X1 | **Done 2026-11-25.** Vercel project `tbc-app` (region Dublin, dub1); `DATABASE_URL` and `ADMIN_EXPORT_TOKEN` set for production only; live at https://tbc-app-mu.vercel.app. Preview and development variables are not set yet (H8) |
| H8 | todo | A second Supabase project for development and previews (the free plan allows two active projects); previews never use production data | Build | S | H1 | Two projects exist; preview deployments use the second one |
| H9 | in progress | Row Level Security on every table, with tests: a person cannot read another person's proposal; the publishable key reads only public example data | Build, test | M | H4, F01.2 | Tests pass; a table without a policy is not readable **Built 2026-11-25:** `survey_response` has Row Level Security on and no grants to the public roles (checked). Still to do: tests for every future table |
| H10 | todo | Storage buckets: `examples` (public read) and `uploads` (private, signed links), size and type limits, policies | Build | M | H1 | Public examples open without login; an upload is readable only by its owner |
| R9 | skipped | Rebuild the Google Form from the updated script (new Q21 to Q24) and test both branches (Q4 = 0 and any other answer) with two people | Research | S | R1 | **Skipped (owner, 2026-11-25): the survey is collected on the website only.** The Apps Script in the questionnaire file is kept for reference |
| R10 | todo | Send the survey link to sponsors only after the save-check (F21.16) has passed; the first wave comes from the website, not from a Google Form (`decisions.md` D2) | Decision | S | F21.16, F22.2 | The link is shared; nothing was sent before the save-check passed |
| R11 | todo | Test the organiser-type filter: add a survey question on which kinds of organiser sponsors prefer (proposed Q25, not yet in the questionnaire file) | Research | S | R1 | Question text agreed and added to the questionnaire, or a note on why not |

**Build tasks in section 2 start only after R6 says Go and R8 is done.** Design tasks (F00) can start earlier because the design direction is already chosen.

---

## 2. First slice

### F00 Design system (needs: all, look and feel)

Source: `../design/design-direction.md` and `../design/tbc-flora_v2.html`.

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F00.1 | done | Put the colour, type and spacing tokens in code (the token block in `tbc-flora_v2.html`) | Build | S | R8 | One tokens file; colours, `--gap: 12px`, one font family |
| F00.2 | done | Load the one typeface; decide Aeonik (licence) or Hanken Grotesk | Decision, build | S | F00.1 | **Decided 2026-11-25 (owner): Hanken Grotesk for now**; Aeonik is reconsidered at a public launch. Used everywhere, including buttons, inputs and numbers |
| F00.3 | in progress | Buttons: primary, mint, black, ghost, stop, disabled, icon, link; same height and padding in a row, 12px gap | Build | M | F00.1 | All variants in the page; focus ring visible; rows checked for equal gaps |
| F00.4 | in progress | Form controls: text input, select, segmented control, checkbox, switch, error state | Build | M | F00.1 | Each control has default, focus, error and disabled states **2026-11-25:** text boxes have more space on the left; the open-answer box has rounded corners instead of the pill shape, so the placeholder no longer hugs the edge |
| F00.5 | in progress | Tags, chips, status labels, progress bar, steps, notice | Build | M | F00.1 | Matches the design file; warning uses amber, errors use black, no red **2026-11-25 restyle (owner request):** no more small capital letters or coloured top lines; labels are raised pills in plain sentence case; the progress bar is a recessed groove with a glossy filled tube |
| F00.6 | done | Glass panels and cards (text sits on at least 66% white) | Build | S | F00.1 | Panel and card components; no text directly on the background More depth on panels, role cards (a glossy orb instead of a coloured line), answer options, scale buttons and filter chips |
| F00.7 | in progress | Backgrounds: light X form for app screens, dark X form for hero | Build | M | F00.6 | Two background components; soft edges; work at phone width |
| F00.8 | todo | Status symbol as the TBC knot, bright strand blinks, stops when "reduce motion" is on | Build | M | F00.5 | Three states (success, warning, error); used in notices; reduced-motion respected |
| F00.9 | in progress | Logo files: neon-gradient with black strand, and white-strand version for dark | Design | S | none | **Started 2026-11-24:** `logo_final.png` (3D, shadow baked in, transparent) is saved in `../design/`. Still to do: the white-strand version for dark backgrounds |
| F00.10 | todo | Accessibility pass: contrast of every pair, focus order, keyboard use | Test | M | F00.3-F00.8 | Contrast table updated with measured values; keyboard-only run-through recorded |
| F00.11 | todo | Logo set: a version without the baked-in shadow for small sizes, favicon and app icon, and a vector (SVG) source if one can be made from the logo shape | Design | M | F00.9 | Files saved in `../design/`; readable at 32 px |

### F01 Accounts and roles (needs: S1, O1, prerequisite)

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F01.1 | todo | Decide how people sign in (for example email link) and what an organisation is | Decision | S | R8 | Short note; covers one person in two organisations |
| F01.2 | todo | Data model: user, organisation, role (organiser, sponsor, decision-maker, recommender) | Build | M | F01.1 | Model in code; roles can be added to an organisation |
| F01.3 | todo | Sign-up and sign-in screens | Build | M | F01.2, F00.4 | A new person can sign up as organiser or sponsor and sign back in |
| F01.4 | todo | Organisation profile page (name, short description, contact, logo) | Build | M | F01.3 | Profile can be created and edited; visible to the other side |
| F01.5 | in progress | Privacy basics: what personal data is stored, how an account is deleted | Build, test | M | F01.2 | Stored fields listed in one document; deletion removes the account and its data |

### F02 Event page (needs: O2, S2, S3, S4)

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F02.1 | todo | Decide the mandatory, prompted and optional fields from survey Q16 (until then, a provisional list from `../research/examples.md`); include **organiser type** (student society, university or careers service, company-hosted, community or non-profit, commercial organiser), because sponsors filter by it | Decision | S | R6 or provisional | Field list with a level for each field; reasons written |
| F02.2 | todo | Data model: event with dates, venue, attendance, audience description, organiser type, tracks, contact, past editions | Build | M | F01.2, F02.1 | Model in code; first-edition flag |
| F02.3 | todo | Create and edit an event in steps (describe, packages, review, publish) with a progress bar | Build | L | F02.2, F00.5 | An organiser can save a draft and come back |
| F02.4 | todo | Publish check: mandatory fields must be filled; clear error messages | Build | S | F02.3 | Publishing is blocked with a message naming the missing fields |
| F02.5 | in progress | Public event page for sponsors: facts first, packages, organiser, "first edition" label | Build | L | F02.2, F00.6 | A sponsor can read the whole event without logging in to anything else **Built 2026-11-25 for the example events:** `/app/events/[id]` has the cover, the same fact table for every event, the packages and the prospectus; the cards on the events page are labelled as summaries. Not yet for real events |
| F02.6 | todo | Check the page against survey results: is anything sponsors named missing? | Research | S | R6, F02.5 | Gaps listed and added to the backlog |

### F03 Prospectus import and organiser trial (needs: O2, O7)

Owner decision 2026-11-25: an organiser can test the product with a sample prospectus: a pop-up, a sample to download and upload back, and a review screen. Real posters often give letter-spaced text when read as plain text (seen on the Impact Hack PDF), so the AI reader (F25) does the reading and a person confirms the result.

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F03.1 | todo | Pop-up when an organiser adds an event: "Do you have a prospectus?" with two choices, "Upload mine" and "Try with a sample" | Design, build | M | F00.3, F02.3 | Both choices lead to the right next screen; the pop-up can be closed |
| F03.2 | todo | Sample picker listing the example prospectuses (F24): "Download" saves the PDF to the person's computer, "Use it now" skips the download | Build | M | F24.6, F03.1 | A downloaded sample can be uploaded back; "Use it now" goes straight to reading |
| F03.3 | todo | Upload screen: PDF only, size limit (10 MB; the Impact Hack PDF is 5.4 MB), progress, drag and drop, clear error messages | Build | M | F03.1, H10 | A wrong file type or a too-large file is refused with a message that says what to do |
| F03.4 | todo | Reading step: send the file to the AI reader (F25.3); show progress; keep the original file private | Build | L | F25.3, F03.3 | The fields come back within a reasonable time; failure falls back to the empty form |
| F03.5 | todo | Review screen: every read field is marked "read from your file", the person confirms or edits, missing fields are listed with "fill this in yourself" | Build | L | F03.4, F02.3 | Nothing is saved until the person confirms; unclear fields stay empty |
| F03.6 | todo | Privacy: consent notice before upload (the file goes to the AI provider), a button to delete the uploaded file, and in the preview the upload is visible only to the uploader | Build | M | F03.3, F26 | Another account cannot open the file; deletion removes the file |
| F03.7 | todo | Test with all twelve examples and the real Impact Hack PDF (the real PDF is for private testing only, never shipped); record which fields were read correctly | Test | M | F03.5, F24.3 | A table of fields read right and wrong per file, saved in `../research/` |

### F05 Package builder (needs: O3, O4, O5, S3)

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F05.1 | todo | Data model: package with name, price, slots, perks (including in-kind), slots taken | Build | M | F02.2 | Model in code; slots cannot go below zero |
| F05.2 | todo | Package builder screen | Build | L | F05.1, F02.3 | An organiser can add, edit and remove packages on an event |
| F05.3 | todo | Typical price band from public prospectuses (data from `../research/examples.md`) shown next to each price | Build | S | F05.2 | Band shown with its sources; labelled as benchmark, not advice |
| F05.4 | todo | In-kind items (credits, mentors, prizes, venue) as first-class perks | Build | M | F05.2 | An in-kind package can be created with no price |
| F05.5 | todo | Compare packages side by side on the event page | Build | M | F02.5, F05.2 | A sponsor can see packages next to each other with slots left |

### F06 Browse and filter events (needs: S1, O1)

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F06.1 | done | Events list page | Build | M | F02.5 | Published events appear as cards with the key facts **Built 2026-11-25:** the "See packages" button sits at the bottom edge of every card, in the same place across a row |
| F06.2 | in progress | Filters: goal, date, location, audience and organiser type | Build | M | F06.1, F04 (see F04.1) | Each filter works alone and together; filter state kept in the page address Search plus filters by organiser type, goal and size; place is not a filter yet |
| F06.3 | todo | Cold start: what the page shows when there are few or no events | Design, build | S | F06.1 | Clear empty state with a next step (list an event, or ask us to introduce you) |
| F06.4 | done | Organiser-type filter with plain labels (student society; university or careers service; company-hosted; community or non-profit; commercial organiser), a count for each, and a one-line explanation of each | Build | M | F06.1, F02.2 | Each label filters the list; the counts add up; every label has at least two example events (F24.10) |
| F06.5 | done | Keyword search as the default, with a Filters panel (organiser type, sponsor goal, size), active-filter chips, a result count and a clear-all button | Build | M | F06.1 | **Built 2026-11-25.** Search matches name, text, place, type, goal, audience and tracks; the filter panel opens from the search bar |

F04 (sponsor profile by goal) is gated by survey Q5. For the first slice, F06.2 uses a plain goal filter without a saved profile (F04.1).

### F08 Proposals and negotiation thread (needs: S3, O4)

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F08.1 | todo | Data model: proposal with package, terms, status (requested, counter, confirmed, declined), messages | Build | M | F05.1, F01.2 | Status changes are limited to allowed moves |
| F08.2 | todo | Send a proposal from an event page | Build | M | F08.1, F05.5 | A sponsor can pick a package, add a note and send |
| F08.3 | todo | Thread screen with messages and the current terms | Build | L | F08.1, F00.5 | Both sides see the same history |
| F08.4 | todo | Accept, counter and decline | Build | M | F08.3 | Each action changes the status and adds a system message |
| F08.5 | todo | In-app notices for new proposals and replies (email comes with F09) | Build | M | F08.3 | A new message shows up for the other side without a refresh |
| F08.6 | todo | Permissions: only the two parties and invited colleagues can read a proposal | Build, test | M | F08.1, F01.2 | A third person gets "not found"; test written |

### F18 Honest demo and seed content (needs: S4)

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F18.1 | done | An "Example" label component for any invented content | Build | S | F00.5 | Label shown wherever data is example data |
| F18.2 | in progress | Seed data: a few example events, packages and a sponsor, all flagged as example | Build | M | F02.2, F05.1 | Every seeded record carries the flag; removed with one command **Built 2026-11-25:** Twelve example events sit in `data/events.ts` (not in the database yet); example sponsors and threads are not built |
| F18.3 | todo | Rule: no star ratings in the first release; show verified facts and "first edition" | Decision | S | none | Written in `../design/design-direction.md` or here |
| F18.4 | todo | Five to eight example sponsors (invented) across the three goals (hire, product feedback, brand) and in-kind only | Build | M | F18.1 | Every example sponsor has a profile and the Example label |
| F18.5 | todo | Example proposals in every status (requested, counter, confirmed, declined) between example sponsors and example events, so both sides have threads to open | Build | M | F18.4, F08.1 | Both sides see at least one thread in each status |

### F21 Onboarding survey (needs: S1, O1, research)

Decided 2026-11-24: built **with the full app**. Updated 2026-11-25: this is now the **only** way the survey is collected (the Google Form is dropped), so F21, F22 and F26 are built first, before the rest of the app. The flow starts from the landing page's call-to-action: landing hero, then one question per screen, then a personalised start.

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F21.1 | done | Choose the 4-5 onboarding questions and their order (past behaviour first, product explained after); candidates are Q1, Q5, Q6, Q20 and Q24 | Decision | S | R6 or provisional | Question list and order written; each maps to a survey question number All 24 questions of `../research/sponsor-questionnaire.md` are now in the onboarding (owner request 2026-11-25): 23 questions for a sponsor who has sponsored, 11 for one who has not (Q4 = 0), 5 for an organiser. Open questions are optional; "Other" has a text box; Q10, Q11 and Q13 keep their maximums; the email (Q18) and the free text have their own handling |
| F21.2 | in progress | Consent text, what is stored and for how long (matches F01.5) | Decision, build | S | F01.5 | Text on screen before the first answer is saved; stored fields listed |
| F21.3 | done | Data model `survey_response`: source, answers, consent time, optional email, anonymous id | Build | M | R8 | Model in code; every row has a source (form or app) |
| F21.4 | done | Stepped onboarding screens, one question per screen, progress shown, phone first; starts from the landing hero's button | Build | L | F00.3, F00.4, F00.5, F00.7, F21.3 | A person can finish on a phone in about a minute The two buttons on the "why we are asking" screen are the same size and the main one moves gently (not with "reduce motion"); small buttons at the bottom right: "Answer as … instead" and "Delete my answers" Scale, free-text and email questions added; section names shown above each question; the "questionnaire starts now" screen shows the count and says "a few minutes" The S and O beads on the "Who is TBC for?" screen float and glow (not with "reduce motion") **2026-11-25:** the scale end labels ("1 · Not useful", "5 · Very useful") are larger and dark; the "Answer as … instead" button was removed (the top-right switch does that) Switching side during the questionnaire now returns to that side's start screen (the answers of each side are kept apart and shown again when the person returns) |
| F21.5 | in progress | Answer without an account (for QR use at events); offer an account at the end | Build | M | F21.4 | An anonymous answer is saved; account creation links it |
| F21.6 | todo | Optional "help shape TBC" cards with deeper questions | Build | M | F21.4 | Each card can be skipped; answers saved with the same source tag |
| F21.7 | todo | Turn the chosen goals into the sponsor profile | Build | M | F21.4, F04.1 (gate) | Profile pre-filled from onboarding answers |
| F21.8 | done | CSV export in the survey's column order plus a `source` column | Build | S | F21.3 | The export opens in the analysis plan in `../research/sponsor-questionnaire.md` without changes |
| F21.9 | in progress | Spam protection (request limit, hidden field) | Build | S | F21.3 | A script posting many answers is limited; test written Rate limit (per address, per minute) and answer whitelist are live and tested locally; a hidden field was not added |
| F21.10 | done | "Early preview" notice and Example labels on the landing and onboarding | Build | S | F18.1 | No example content looks real |
| F21.11 | skipped | Compare in-app answers with Google Form answers by source | Research | S | R3, F21.8 | **Skipped (owner, 2026-11-25): there is no Google Form wave to compare with.** There is no unprimed baseline, so keep the intro general (F21.21) |
| F21.17 | todo | An "I do both" choice (from survey Q24: the person also organises events) that sets up the both-sides home (F23.9) | Build | S | F21.4 | Choosing it is saved and read by F23.9 |
| F21.18 | todo | One table that maps every in-app question to its number in the questionnaire (Q1 to Q24), so the export follows the analysis plan's columns | Decision | S | F21.1 | The table is in the repo; the export in F21.8 follows it |
| F21.19 | done | Three short intro screens before the questions: what TBC is for; the two kinds of user (organiser, sponsor) with one line each and "you can try both"; why we ask: this survey is to understand sponsors' needs. Draft texts in `../design/onboarding-copy.md` | Build | M | F21.4, F22.1 | The three screens show in order, can be read in about 20 seconds, and end with "Start" or "Skip and explore"; the consent line sits on the third **Built 2026-11-25:** a fourth screen "Your questionnaire starts now" (number of questions, about 1 minute, "Begin the questionnaire") comes between the "why we are asking" screen and the first question **Simplified 2026-11-25 (owner request):** plain headings instead of small label pills, the "Why we ask" label and the long explanations removed; the "starts now" screen shows only "23 questions" and "5 minutes" (organiser: 5 questions, 2 minutes or less); the question label reads only "Question 5 of 23" |
| F21.20 | done | Organiser path: if the person chose organiser, say this round is about sponsors' needs and offer two or three short questions on how they find sponsors today (written after the organiser interviews, R4), or "Skip and explore" | Decision, build | M | F21.19, R4 | An organiser can answer the short set or skip; answers saved with source `app` and the role |
| F21.21 | done | Keep screen 1 to one general sentence about TBC (no feature list) so the intro does not steer the answers; with no Google Form baseline, note the intro wording next to the results | Decision | S | F21.19 | The intro wording is checked against this rule |
| F21.22 | in progress | Review the intro wording together with all other English texts | Decision | S | F21.19, F22.6 | Final texts listed; the owner has read them |
| F21.23 | done | Append-only log of the survey: every start, answer, email and completion is its own row (`survey_event`), so changing an answer never overwrites history; the response row keeps the current state; "Delete my answers" removes both | Build | M | F21.3 | **Built 2026-11-25** (migration 0002, backfill of the existing answers). Checked by the save-check: a changed answer shows the latest in the response and keeps both rows in the log; the log is deleted with the response. The export has a log view (`?view=events`) |

Keeping every answer safe (added 2026-11-24: losing survey answers is not acceptable):

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F21.12 | done | Save each answer to the database the moment it is given; if the network fails, keep it in the browser and retry, and show "Saved" only after the server confirms | Build | M | F21.3 | A test that cuts the network mid-way loses no answer; the screen never says "Saved" before the server did **Built 2026-11-25:** Built: every answer is sent at once, queued in the browser and retried every 3 seconds; "Saved" shows only after the server confirms. The cut-network test in a browser is still to do **Tested on the live site 2026-11-25 in a real browser:** "Saved" showed only after the server confirmed; with the network cut on purpose the screen said "Not saved yet, trying again…", the answer waited in the browser queue, and after the network came back it was sent and stored (checked in the database) **2026-11-25 bug fix (owner report):** answers are now stored per side. One person who tries both sides has two responses (unique on anonymous id + side, migration 0003); every answer and the completion carry the side they were given on, so organiser answers can no longer end up in the sponsor response or the other way round. The save-check tests this (a person on both sides: two responses, answers apart). The CSV export has a `person` column that links the two responses of one person |
| F21.13 | todo | Second copy of every answer in a Google Sheet in the team's Drive, through a retry queue (an answer waits in the queue until the Sheet confirms) | Build | M | F21.3 | Every database answer appears in the Sheet; a failed write is retried, not dropped |
| F21.14 | in progress | Automatic backups of the database plus a weekly CSV export saved outside the database provider | Build | M | R8, F21.8 | Backups run on schedule; the latest export is found in Drive **Built 2026-11-25:** The export endpoint exists (`/api/admin/export`, token protected). The weekly automatic copy outside the database provider is still to do The CSV export has two views: the current answers and the log (`?view=events`) |
| F21.15 | todo | Daily check that database and Sheet counts match; the team is told if they do not | Build | S | F21.13 | A forced mismatch in a test sends a warning |
| F21.16 | in progress | Save-check before launch: submit 20 test answers (some on a bad connection), compare database, Sheet and export, then restore a backup into an empty database | Test | M | F21.12-F21.15 | All 20 found in all three places; the restore works; result written down **Built 2026-11-25:** Database part passed locally on 2026-11-25: 20 of 20 answers stored as sent, bad input and wrong token refused, delete works, test rows removed (`scripts/save-check.mjs`). The run against the live site, the Google Sheet copy and the backup restore are still to do **Live-site run 2026-11-25:** 20 of 20 test answers stored as sent and read back; all 20 removed by delete (checked in the database); the one row left in the table is a real visitor's. The rate-limit step cannot be shown on the live site when requests are paced (it passed locally). `scripts/save-check.mjs` now checks by anonymous id in the database. Still to do: the Google Sheet copy and the backup restore |

### F22 Landing page (needs: S1, O1, promotion)

Dark hero from `../design/design-direction.md`; the app itself is light. Two neon buttons, one per user type, start the onboarding (F21) as that type.

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F22.1 | done | Write the landing content: headline, three short lines on what TBC is, the question "Which side do you want to try first?", the two button labels ("Try as an organiser", "Try as a sponsor", each with a short line under it), the "early preview" notice | Decision | S | none | Text agreed by the team; no claim that is not true yet |
| F22.2 | done | Build the landing page: dark X hero, white-strand logo, two neon buttons, works on a phone | Build | L | F00.3, F00.7, F00.9, F22.1 | Both buttons start onboarding with the chosen type already set Sponsor button (neon green) on the left, organiser (lime) on the right |
| F22.3 | todo | Dark-to-light transition when the person enters onboarding (respects "reduce motion") | Build | S | F22.2, F21.4 | The switch from dark to light looks intentional, not like a page jump |
| F22.4 | in progress | Page title, description and a share image for links (promotion) | Build | S | F22.2 | A pasted link shows a proper title and image |
| F22.5 | todo | Count visits and which button was pressed, with consent where the law needs it (UK rules to check) | Build | M | F22.2, F21.2 | Counts per button; no personal data kept without consent |
| F22.6 | todo | Review all English button, headline, notice and pop-up texts for plain, natural wording (landing, onboarding, role switch, sample pop-up) | Decision | S | F22.1, F03.1 | One list of final texts; the owner has read it |

### F23 Role switch (needs: S1, O1)

Two kinds of user: organiser (wants sponsors) and sponsor (decides what to back). In this preview a person can explore both sides.

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F23.1 | done | Write the preview rules: the switch changes the view, not permissions; the other side shows example data only; actions there are never sent to real people | Decision | S | none | One short note; the team has agreed |
| F23.2 | in progress | Pick two neon colours, one per role, and check them on the light page: always with a text label (and icon), never colour alone; check contrast and a visible edge | Design | S | F00.1 | Two role colours chosen; contrast and colour-blind check recorded **Built 2026-11-25:** Lime for organiser, mint for sponsor, always with a text label. The contrast and colour-blind check is not recorded yet Colours swapped on 2026-11-25 at the owner's request: sponsor is lime, organiser is neon green |
| F23.3 | done | Switch component fixed in the top-right corner on every screen, reading "Trying as: Organiser | Sponsor"; keyboard and screen-reader friendly, large enough to tap on a phone, announces the current role | Build | M | F00.3, F23.2 | Works with keyboard only; the role change is announced Sponsor and Organiser buttons have the same size (112 px); the switch also shows on the first onboarding screen Switching side during the questionnaire keeps the progress bar exactly where it is and the question position, and a pop-up says "Switched to sponsor/organiser" (also on the start page). Tested in a browser |
| F23.4 | in progress | Home screen and navigation for each role (what each side sees after switching) | Build | L | F23.3, F02.5, F08.3 | Each role has its own start screen and menu **2026-11-25:** both start screens open with overview tiles after the reference `../design/button.design.jpg`: a gradient logo tile, an outlined glass tile with a count, the lime checklist tile and a black tile |
| F23.5 | in progress | Example data for the side the person does not own | Build | M | F18.2 | The other side is never empty; every record has the Example label |
| F23.6 | in progress | Remember the last role for the next visit; a one-time hint after onboarding: "Switch to see the other side" | Build | S | F23.3, F21.4 | Reopening the app shows the last role; the hint shows once |
| F23.7 | done | Guardrails: actions in the example side stay in the example side; test that nothing reaches a real person | Build, test | M | F23.1, F08.6 | Test passes: a proposal sent "as the other role" is never visible to a real account |
| F23.8 | todo | Test: switching back and forth keeps drafts and filters | Test | S | F23.4 | A half-filled form survives a role switch |
| F23.9 | todo | Both-sides home: when onboarding says "I do both", the home shows both sides and the switch marks both | Build | M | F23.4, F21.17 | A person who chose "I do both" sees both start screens; gate: survey Q24 shows 25% or more also organise |

### F24 Example prospectus library (needs: S9, O7, O2)

Twelve two-page example prospectuses with different covers, colours, sizes, places and content, so the organiser filter (F06.4) always shows something. All names are invented; the first example borrows content ideas from the owner's Impact Hack prospectus but none of its real names, quotes, photos or the PDF itself (owner decision 2026-11-25). Each is marked "Example". They are made by script from one template and one data file per event, so adding a thirteenth is cheap.

| # | Organiser type | Example (all invented unless noted) | Size, place | Main sponsor goal |
|---|---|---|---|---|
| 1 | Student society | A two-continent hackathon in the style of Impact Hack (content ideas only, invented name and sponsors) | 350, two cities | Hire |
| 2 | Student society | Campus Build Night | 40, one evening, one campus | Product feedback |
| 3 | Student society | Health Data Jam | 90, Edinburgh | Brand |
| 4 | University or careers service | Careers Service AI Challenge | 120, employer-focused | Hire |
| 5 | University or careers service | Research Data Hack (a department) | 80, academic data providers | Brand |
| 6 | Company-hosted | FinHack London (a bank hosts, partners join) | 200, London | Hire |
| 7 | Company-hosted | Cloud Native Weekend (a developer-tools company hosts) | 100, hybrid | Product feedback |
| 8 | Community or non-profit | Open Source Weekend | 150, online and Manchester | Product feedback (in-kind) |
| 9 | Community or non-profit | Code for Good Hackathon | 100, social impact | Brand |
| 10 | Community or non-profit | Design x Code Weekend | 60, London | Brand |
| 11 | Commercial organiser | Green Code Hack | 150, sustainability | Brand |
| 12 | Commercial organiser | AI Build Sprint (run by an events company) | 400, online | Hire |

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F24.1 | done | Confirm the twelve examples and their invented names, sizes and price ranges. Decided 2026-11-25: Impact Hack's real prospectus is not published; only its content ideas are borrowed | Decision | S | none | The table above is final; the first example contains no real name, quote or photo from Impact Hack The twelve are final (owner decision 2026-11-25: Impact Hack is not published; example 1 is an invented look-alike) |
| F24.2 | done | Build the two-page template (page 1: cover, about, audience figures; page 2: packages, contact) driven by one data file per event, real selectable text, printed to PDF with the installed Chrome | Build | M | F24.1 | One data file produces one PDF; changing the file changes the PDF **Built 2026-11-25:** `scripts/make-examples.mjs` makes one two-page prospectus per event from `data/events.json`, printed with the installed Chrome |
| F24.3 | done | Make the twelve PDFs, each with its own cover, colours, content and price structure (prices informed by `../research/examples.md`, not copied from any document) | Build | L | F24.2 | Twelve PDFs of two pages; no two covers look alike **Built 2026-11-25:** twelve PDFs (two pages each) in `public/prospectuses/`, each with its own cover colours, shapes and packages |
| F24.4 | done | Cover thumbnails (images) for the event cards | Build | S | F24.3 | One thumbnail per example The covers are SVG illustrations (`public/events/`) |
| F24.5 | done | "Example" marking inside every PDF (footer) and in the file info | Build | S | F24.3 | The word appears on both pages "Example" is on the cover ribbon and both page footers |
| F24.6 | in progress | Store the PDFs and thumbnails as static files; a seed script links each to an example event with its organiser type | Build | S | F24.3, F18.2, H10 | Seeding creates twelve example events with their files The PDFs and covers are static files linked from `data/events.json`; they are not in the database yet |
| F24.7 | done | One viewer for every prospectus: a preview inside the app and a Download button | Build | M | F24.6, F00.6 | Every prospectus opens and downloads the same way **Built 2026-11-25:** the event page shows the PDF in the page and has "Download the PDF" and "Open in a new tab" |
| F24.8 | todo | Check each PDF can be read as plain text and by the AI reader (F25) | Test | S | F24.3, F25.3 | Result per file written down |
| F24.9 | todo | Check that no real person or company appears in any example, Impact Hack included | Test | S | F24.3, F24.1 | A short checklist, signed off |
| F24.10 | todo | Check coverage: every organiser type has at least two events; every other filter value (goal, place, size band) has at least two | Test | S | F24.6, F06.4 | A table of filter values and counts; gaps filled with more examples |
| F24.11 | done | Cover art for every example event: twelve invented illustrations (SVG), different shapes and colours, used on the cards, the event page and the prospectus cover | Build | M | F24.1 | **Built 2026-11-25** by `scripts/make-examples.mjs` (`public/events/`) |

### F27 Guided start (needs: S9, O7, S1, O1)

After the questions, the start page offers a short tour and a checklist. Texts are drafted in `../design/onboarding-copy.md`. Font: Hanken Grotesk.

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F27.1 | done | Decide the steps for each side (sponsor: switch, filters, example event, prospectus viewer, proposal button, proposals; organiser: switch, add event, sample download, review screen, packages, proposals) and the closing checklist "Try these three things" | Decision | S | none | The two step lists are final; each step points at a real screen element |
| F27.2 | done | Decide: build the tour component ourselves or use a small open-source tour library (check licence, size, keyboard support, phone support) | Decision | S | none | The choice and its reasons written in `decisions.md` |
| F27.3 | in progress | Tour component: highlights a real element with a small card (title, one sentence, Back, Next, Skip); works on a phone; focus moves into the card and Esc skips; respects "reduce motion" | Build | L | F27.2, F00.6 | A keyboard-only person can go through and skip; the highlight sits on the right element at phone and desktop width **Built 2026-11-25:** Own simple version built (highlights a real element, Back, Next, Skip, Esc). Not yet tested with a keyboard only or on a phone (F27.8) |
| F27.4 | done | Start rule: the welcome card ("Show me around" or "I'll explore myself") shows once after onboarding; the tour is skippable at every step and replayable from the menu | Build | S | F27.3, F21.4 | Skipping never traps the person; the menu entry replays the tour **Built 2026-11-25:** the "Show me around" button is large and dark with a neon ring, a spinning spark and a gentle hop (not with "reduce motion"), in the top bar and on the welcome card After the tour ends with "Done", the "Show me around" button in the top bar and the welcome card disappear |
| F27.5 | done | Checklist card "Try these three things" that ticks as the person does them, shows progress and can be hidden | Build | M | F27.1, F00.5 | Each task ticks when done; the card can be dismissed **2026-11-25:** the checklist is now the lime tile of the overview tiles (a big thin counter "0/3", a thin progress line, the three tasks) |
| F27.6 | in progress | Save progress (tour done, checklist ticks) per person and per anonymous id, so reopening does not restart it | Build | S | F21.3, F26 | Closing and reopening keeps the progress **Built 2026-11-25:** Progress is saved in this browser only (not in the database yet) |
| F27.7 | done | Role-aware: the steps change when the person switches side, and the switch step comes first | Build | M | F23.3, F27.3 | Switching side mid-tour moves to that side's steps without breaking |
| F27.8 | todo | Test with three first-time people on a phone: can they finish the tour or skip it without help; do the highlights still point at the right elements after layout changes | Test | M | F27.4, F27.5 | Notes saved; broken steps fixed |

### F25 AI assistant (needs: O2, O7, S1, S4)

Claude through the Anthropic API (`decisions.md` D3). Model prices and ids come from a table cached on 2026-11-03: check them before building.

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| F25.1 | done | Record the choice: Claude for reading prospectuses (Haiku 5.5 first), Sonnet 5.5 for explanations, Opus 5.5 only if measured to be needed | Decision | S | none | In `decisions.md` D3 (done as an assumption; confirm after F25.8) |
| F25.2 | todo | Create the API key; store it only in `.env` and the Vercel settings (server side); add the empty entry to `.env.example` | Build | S | H7 | The key is never in browser code or git |
| F25.3 | todo | Server function: send an uploaded PDF to the model and get the event fields back in a fixed format; unknown fields stay empty, not guessed | Build | L | F25.2, F02.2 | A test PDF returns the expected fields; a PDF that says "ignore your instructions" does not change the result |
| F25.4 | todo | Field list and checks: the fields are those of the event page (F02.1) including organiser type; results are checked before they reach the review screen | Build | M | F25.3 | Wrong types or impossible values are dropped and listed as missing |
| F25.5 | todo | Cost guards: a call limit per person, a page and size limit, a monthly spend cap set in the provider console, token use logged | Build | M | F25.3 | A script calling the reader many times is stopped; the cap is set |
| F25.6 | todo | Consent wording shown before upload: the file content is sent to the AI provider (matches F03.6) | Decision, build | S | F03.6 | The text is on screen before upload |
| F25.7 | todo | Failure handling: refusals, timeouts, unreadable PDFs; show the manual form with a clear message | Build | M | F25.3 | Each failure shows a message and the empty form; nothing is lost |
| F25.8 | todo | Measure: run the reader on the twelve examples and the real Impact Hack PDF with Haiku 5.5 and Sonnet 5.5; count correct fields; pick the model by results | Test | M | F25.3, F24.3 | A table of results saved in `../research/`; model choice recorded |
| F25.9 | todo | Placeholder: the match explainer for F07 ("why it fits, what is missing") | Build | M | F07 gate | Starts only when F07's gate passes |

### Cross-cutting (slice 1)

| ID | Status | Task | Type | Size | Depends on | Done when |
|---|---|---|---|---|---|---|
| X1 | in progress | Repo setup: structure, readme, linting, a basic test run | Build | M | R8 | A new clone runs and passes its tests **Built 2026-11-25:** Project created (Next.js, TypeScript, build passes) and `scripts/save-check.mjs` is the one test so far; there is no wider test suite yet |
| X2 | todo | Hosted preview for each change | Build | S | X1 | A link is made for every change |
| X3 | todo | Test plan for the slice: one scripted walk from organiser event to confirmed package | Test | M | F08.4 | Script written and run once end to end |
| X4 | todo | Concierge test on a real event (Impact Hack; its date is not confirmed): one organiser, three sponsors, three hand-made proposals | Research | L | F02.5, F05.2, F08.4 | Notes on who replied and what they asked for; features nobody asked for stay out of Phase A |
| X5 | todo | Review after the concierge test; update `features.md` gates | Planning | S | X4 | Gates and first slice updated |
| X6 | in progress | Scaffold the web project (Next.js assumed) with the routes `/`, `/start`, `/app/events`, `/app/events/[id]`, `/app/events/new`, `/app/proposals/[id]`, and the light and dark page shells | Build | M | X1 | Every route loads an empty page in the right shell **Built 2026-11-25:** Routes `/`, `/start`, `/app`, `/privacy` exist; the event pages and proposal routes come with their features |
| X7 | todo | Three environments (local, preview, production) with separate keys; a script that refuses to run against production by mistake | Build | S | H8 | A preview deployment cannot reach production data |
| X8 | done | Write the code layout in the repo readme (folders for app, components, lib, database migrations, the example-prospectus generator); changes to the database only through migration scripts | Decision | S | X1 | The readme shows the layout and the rule |
| X9 | done | Git workflow: one commit per finished task, message starts with the task ID, pushed to `origin/main` right away (owner approval 2026-11-25); before each commit check that `.env` is not staged and no key or password is in the diff | Decision | S | none | Rule recorded in `decisions.md` D13; the first commit and push of the plan done |

---

## 3. Later features (placeholders)

One line each. Break these down only when the gate passes (the thresholds are in `features.md`).

| ID | Status | Task | Feature | Gate |
|---|---|---|---|---|
| F04.1 | later | Break down sponsor profile by goal (also replaces the plain goal filter in F06.2) | F04 | Q5 goal at 25% or more |
| F07.1 | later | Run match explanation by hand for the first 3 proposals, then decide (the AI explainer is F25.9) | F07 | Two Phase B features live and 5 or more real proposals |
| F09.1 | later | Break down email-first updates | F09 | Q20 emails or network at 60% or more |
| F10.1 | later | Break down participant aggregate profile | F10 | Q13 at 70% or more and participant poll supports sharing |
| F11.1 | later | Break down consent and talent-pool opt-in (before F10) | F11 | Same as F10 |
| F12.1 | later | Break down organiser history | F12 | Q10 or Q11 thresholds, or a Q9 theme |
| F13.1 | later | Break down saved shortlist and alerts | F13 | Q11 "finding" at 50% or more |
| F14.1 | later | Break down share with a decision-maker | F14 | Q3 at 50% or Q11 "approval" at 25% |
| F15.1 | later | Break down CSV export | F15 | Q20 spreadsheet or CRM at 25% |
| F16.1 | later | Break down warm introductions and inbox | F16 | Q6 network share at 60% |
| F17.1 | later | Run the outcome report by hand for the first 3 sponsors | F17 | Q11 "measuring" at 25% or Q12 gap at 15% |
| F19.1 | later | Payments and featured placement | F19 | Q17, 5 or more price calls, 10 or more deals |
| F20.1 | later | Write the first-time sponsor guide | F20 | Q4 = 0 at 25% and the reasons question is in the form |

---

## 4. Trace: feature to tasks

| Feature or group | Tasks | Count |
|---|---|---|
| F00 Design system | F00.1-F00.11 | 11 |
| F01 Accounts and roles | F01.1-F01.5 | 5 |
| F02 Event page | F02.1-F02.6 | 6 |
| F03 Prospectus import and organiser trial | F03.1-F03.7 | 7 |
| F05 Package builder | F05.1-F05.5 | 5 |
| F06 Browse and filter | F06.1-F06.5 | 5 |
| F08 Proposals and thread | F08.1-F08.6 | 6 |
| F18 Honest demo content | F18.1-F18.5 | 5 |
| F21 Onboarding survey | F21.1-F21.23 | 23 |
| F22 Landing page | F22.1-F22.6 | 6 |
| F23 Role switch | F23.1-F23.9 | 9 |
| F24 Example prospectus library | F24.1-F24.11 | 11 |
| F25 AI assistant | F25.1-F25.9 | 9 |
| F27 Guided start | F27.1-F27.8 | 8 |
| X Cross-cutting | X1-X9 | 9 |
| R Research and decisions | R1-R11 | 11 |
| H Hosting and data safety (Supabase) | H1-H10 | 10 |
| Later features (placeholders) | F04.1 to F20.1 | 13 |

Feature tasks for the preview app: 116. Cross-cutting: 9. Research and decisions: 11. Hosting and data safety (H1 to H10, serving feature F26): 10. Later placeholders: 13. Total listed: 159. Sizes are guesses and are not added up.

## 5. Suggested order

The survey is now collected on the website only, so the survey part is built first (owner decision 2026-11-25). This conflicts with the meeting-1 plan of no development before the winter holidays: the survey slice is the first thing built when development starts.

1. **Now, no code needed:** R4 and R5 (organiser interviews, participant poll), R11 (organiser-type question), F24.1 (confirm the twelve examples), F22.1, F22.6 and F21.19 to F21.22 (texts), F21.1 and F21.18 (which questions, and their numbers).
2. **Platform:** X1, X8, X6, X7, H7, H8, H6, then H4, H9, H10.
3. **Survey slice (first build):** F00.1 to F00.7 (tokens, buttons, forms, glass, backgrounds), F21 (intro screens, onboarding, and F21.12 to F21.16 so no answer is lost), F22 (landing, with the dark hero), F00.9 and F00.11 (logo set).
4. **Save-check, then send:** F21.16 must pass; then R10 (share the link) and R3 (collect at least 10 answers) while the rest is built.
5. **Product core:** F01, then F02 and F05, then F06 (with F06.4) and F08.
6. **Samples and AI:** F24 (the twelve examples), F18.4 and F18.5; F25.1 to F25.8 and F03 (the organiser trial); F25.8 decides the model.
7. **Preview wrapper:** F23 (role switch), then F27 (guided start, last, because it points at the finished screens).
8. **Check:** F00.10, X3, F03.7, F24.8 to F24.10.
9. **X4** (concierge test on Impact Hack), then X5 and R7, then decide the next phase.
