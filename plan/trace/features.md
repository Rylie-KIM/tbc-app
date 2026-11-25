# TBC features

Draft 2026-11-24, updated 2026-11-25 (owner's standing instruction: keep this file current without asking). Second step of the plan: user needs → **features** → tasks. Needs are in `user-needs.md` (same folder). Each feature below points to the need IDs it serves. Tasks come next, and each task will point to a feature.

**Status of the evidence:** no sponsor survey responses exist yet, so every gate below is still open. The gates are the thresholds already written in `../research/sponsor-questionnaire.md` (analysis plan, section 4); they decide whether a feature is built, run by hand first, or left out. Nothing here is a commitment to build.

**How a feature is delivered**
- **Build**: code it.
- **Concierge**: do it by hand for a few real users first (a person, a spreadsheet, a PDF), then automate if people use it.
- **Defer**: not before its gate.

**Phases** (from the questionnaire plan): A core, B trust and fit, C discovery, D outcomes, E money. "Foundation" means the platform cannot work without it, so it has no survey gate.

---

## 1. Feature list

### Foundation

| ID | Feature | What it does | Needs | Gate | How |
|---|---|---|---|---|---|
| F00 | Design system | Tokens, components and states from the chosen "Flora" direction (`../design/design-direction.md`): light glass app screens, dark X hero, one typeface, 12px button gaps, knot-shaped blinking status symbols | all (look and feel) | None | Build |
| F01 | Accounts and roles | Sign up and sign in as organiser or sponsor; one organisation profile per account; sponsors can add a second role (decision-maker or recommender). Sign-in is likely Supabase Auth (see `decisions.md`, not final) | S1, O1 (prerequisite) | None | Build |
| F18 | Honest demo and seed content | Any example data is labelled as example; nothing invented is shown as real; "first edition" label instead of fake ratings. Includes example sponsors and example proposal threads in every status, so both sides have something to open in the preview | S4, S9 | None | Build |
| F24 | Example prospectus library | Twelve example prospectuses of two pages each (at least two for each kind of organiser, see F06), made from one template but with different covers, colours, sizes, places and content, including one in the style of the owner's Impact Hack (only its content ideas are borrowed; the real sponsor names, quote, photos and PDF are not used or published). Every one is marked "Example"; all names are invented. The app shows and downloads every prospectus through one consistent viewer. Also gives organisers something to download and upload back when trying the import | S9, O7, O2 | None | Build |
| F26 | Hosting, database and data safety | Vercel for the web app; a Supabase database in Europe (eu-west-1) on the free plan; three environments (local, preview, production); Row Level Security on every table; storage buckets for examples (public) and uploads (private); keep-alive against pausing; backups, a Google Sheet copy and daily count checks, because the free plan pauses after a week without activity and has no automatic backups | all (nothing may be lost) | None (decided 2026-11-24) | Build |

### Phase A: core

| ID | Feature | What it does | Needs | Gate (build when) | How |
|---|---|---|---|---|---|
| F02 | Event page | One structured page per event: dates, venue, attendance, audience description, organiser type, packages, organiser contact, past editions. Fields that sponsors say they need are mandatory, others prompted or optional | O2, S2, S3, S4 | Q16: a field is mandatory at 50% or more (balanced share); 25-49% prompted; under 25% optional | Build |
| F03 | Prospectus import and organiser trial | When an organiser adds an event, a pop-up asks "Do you have a prospectus?": upload mine, or try with a sample. A sample can be downloaded and uploaded back, or used at once. The file is read (by the AI reader, F25), the fields are pre-filled from it, each one marked "read from your file", the missing ones are listed, and the organiser confirms or fixes them. In the preview an uploaded file is visible only to the person who uploaded it | O2, O7 | Part of the preview app (owner decision 2026-11-25) | Build (after F02 and F24) |
| F04 | Sponsor profile by goal | Sponsor picks goals (hire, product feedback, brand; several allowed) and the criteria for each | S1 | Q5: a goal at 25% or more | Build; only goals that pass |
| F05 | Package builder with price guidance | Organiser defines tiers with price, slots and perks (including in-kind: credits, mentors, prizes, venue); shows a typical price band from public prospectuses | O3, O4, O5, S3 | Q7: in-kind 25% or more among developer relations, or Q11 "negotiating" 25% or more | Build; price band from `../research/examples.md` |
| F06 | Browse and filter events | Sponsor lists events and filters by goal, date, location, audience and **who organises it**: student society, university or careers service, company-hosted, community or non-profit, commercial organiser. Kept simple: this is not meant to compete with Luma or Devpost | S1, O1 | Q11 "finding" 25% or more; Q20 tells how far we differ from listing sites | Build (basic) |
| F08 | Proposal and negotiation thread | Either side sends a proposal for a package; the other accepts, counters or declines; a message thread; status requested, counter, confirmed, declined | S3, O4 | Foundation of the product (idea kept from the old prototype) | Build |
| F09 | Email-first updates | Proposals and alerts arrive by email; a reply by email lands in the thread | S7 | Q20: emails from organisers or personal network 60% or more | Build |
| F21 | Onboarding survey | A stepped onboarding of 4-5 questions (role, goal, how you find events, whether you also organise events, optional email) that starts from the landing page and ends in a personalised start. The answers fill the sponsor profile and are also stored as research answers, tagged by source. Optional "help shape TBC" cards ask the deeper questions. Before the questions, three short screens say what TBC is for, explain the two kinds of user, and say that this survey is to understand sponsors' needs (organisers get a shorter path). Past-behaviour questions come before the product is explained in detail. **No answer may be lost**: each answer is saved on the server at once, kept in a second copy in a Google Sheet, backed up, and checked automatically | S1, O1; also research (second collection path next to the Google Form) | None for a minimal version; the profile link waits for F04's gate | Build, shipped with the full app (decided 2026-11-24). Until then the Google Form collects |
| F22 | Landing page | Dark hero (the X form, white-strand logo) that explains TBC in a few lines and asks one clear question: "Which side do you want to try first?" Two neon buttons answer it: "Try as an organiser" (I'm looking for sponsors) and "Try as a sponsor" (I'm choosing what to back). A button starts the onboarding (F21) on that side. Marked "early preview" | S1, O1 (reach both sides); promotion | None | Build |
| F23 | Role switch | The app has two kinds of user, organiser and sponsor. After onboarding a person can explore both sides: a switch fixed in the top-right corner (same place on every screen) reads "Trying as: Organiser | Sponsor" and changes the view (neon buttons, always with a text label). In this preview it changes what is shown, not what the person is allowed to do; the other side shows example data only. If onboarding says the person both organises and sponsors, the home screen shows both sides | S1, O1, S9 (both sides explorable in the preview) | None; the both-sides home follows survey Q24 (25% or more also organise) | Build, ships with the preview |
| F27 | Guided start | After onboarding the start page offers a short tour ("Show me around") that highlights real parts of the screen with a small card: the role switch, the filters, an example event and its prospectus, the proposal button; a different route for each side. A closing checklist, "Try these three things", ticks as the person does them. Skippable at every step, replayable from the menu, progress remembered. Texts in `../design/onboarding-copy.md`; font Hanken Grotesk | S9, O7, S1, O1 | None | Build |
| F25 | AI assistant | Uses Claude through the Anthropic API. First use: the prospectus reader, which sends an uploaded PDF to the model and gets the event fields back in a fixed format (Claude Haiku 5.5, chosen by measured accuracy against Sonnet 5.5). Later use: the match explainer for F07 ("why it fits, what is missing"). Safeguards: API key on the server only, per-user call limits and a monthly spend cap, the PDF treated as data and never as instructions, the person told that the file goes to the AI provider, and every result reviewed by a person before it is saved | O2, O7, S1, S4 | None for the reader (needed by F03); the explainer follows F07's gate | Build the reader with F03; explainer later |

### Phase B: trust and fit

| ID | Feature | What it does | Needs | Gate (build when) | How |
|---|---|---|---|---|---|
| F07 | Match explanation | Shows why an event fits a sponsor, what is aligned and what is missing. No invented ratings | S1, S4 | At least two Phase B features live and 5 or more real proposals | Concierge first (by hand), then rule-based |
| F10 | Participant aggregate profile | Shows sponsors the audience as groups (study level, graduation year, field); a group appears only with 5 or more people; sponsors can filter on the aggregate | S2, P1 | Q13: 70% or more pick a filter, **and** the participant poll supports sharing (P1) | Build with consent. 40-69%: aggregates without filters. Under 40%: do not collect |
| F11 | Participant consent and talent-pool opt-in | Participants choose what is shared and can opt in to be contacted; sensitive items stay aggregate and opt-in | P1 | Prerequisite of F10; participant poll | Build before any participant data is stored |
| F12 | Organiser history and verified facts | Past events, past sponsors and what they received, verified by the other side; a first-time organiser shows "first edition" | S4, O6 | Q10 track record 25% or more, or Q11 "judging worth" 25% or more, or a Q9 theme with 3 mentions | Build from event data |
| F14 | Share with a decision-maker | A link (no account needed) to a shortlist or proposal, plus a one-page PDF summary for internal approval | S6 | Q3: "recommend or influence" 50% or more, or Q11 "approval" 25% or more | Build |
| F15 | Export | CSV export of the shortlist and proposals | S7 | Q20: spreadsheet, Notion or CRM 25% or more | Build; no CRM integration |
| F20 | First-time sponsor guide | A short "what sponsoring involves" guide in onboarding for people who have not sponsored before | S8 | Q4 = 0 is 25% or more of answers, and the reasons question exists | Build (content only) |

### Phase C: discovery

| ID | Feature | What it does | Needs | Gate (build when) | How |
|---|---|---|---|---|---|
| F13 | Saved shortlist, alerts, follow an organiser | Sponsor saves events, gets alerts on new matches, follows organisers | S1 | Q11 "finding" 50% or more | Build |
| F16 | Warm introductions and inbound inbox | Request an introduction through a shared contact; an inbox for proposals sent to a sponsor | S1, O1 | Q6 network share 60% or more (30-59%: test by hand; under 30%: skip) | Build or concierge, by the threshold |

### Phase D: outcomes

| ID | Feature | What it does | Needs | Gate (build when) | How |
|---|---|---|---|---|---|
| F17 | Outcome report | Post-event three-question form, event links or codes, KPIs by goal (interviews, sign-ups, reach), a report both sides can see | S5, O6 | Q11 "measuring" 25% or more, or Q12 measurement gap 15% or more, or Q8 top-2-box under 50% | Concierge first; automate after 3 sponsors use it |

### Phase E: money

| ID | Feature | What it does | Needs | Gate | How |
|---|---|---|---|---|---|
| F19 | Payments and featured placement | Paid placement, then a transaction fee or subscription | none yet | Q17 plus a price range from 5 or more calls, and 10 or more deals through the platform | Defer |

---

## 2. Coverage: every need has a feature

| Need | Served by |
|---|---|
| S1 Find events that fit my goal | F04, F06, F07, F13, F16, F21, F22, F23, F25 |
| S2 Know who will attend | F02, F10 |
| S3 Compare packages and prices | F05, F08, F02 |
| S4 Trust the organiser | F02, F07, F12, F18 |
| S5 See what it produced | F17 |
| S6 Get internal approval | F14 |
| S7 Work from email and my tools | F09, F15 |
| S8 Understand what sponsoring involves | F20 |
| S9 Explore a realistic example before committing (including by kind of organiser) | F06, F18, F23, F24, F27 |
| O1 Reach sponsors without cold outreach | F06, F16, F01, F21, F22, F23 |
| O2 Present the event once | F02, F03, F24, F25 |
| O3 Know a reasonable price | F05 |
| O4 Manage tiers and replies in one place | F05, F08 |
| O5 Ask for non-cash support | F05 |
| O6 Show proof afterwards | F12, F17 |
| O7 Try the product safely with a sample prospectus | F03, F24, F25, F27 |
| P1 Control what data is shared | F10, F11 |
| All needs: nothing may be lost, and the look is consistent | F00, F26 |

Dependencies: F10 needs F11 (and the participant poll). F03 needs F02. F07 needs F04 and F02. F13 and F16 need F06. F17 needs F08 to have real deals. F21 needs F00 (design) and F18 (example labels); its link to the sponsor profile waits for F04. F22 needs F00 (dark hero, logo files). F23 needs F01 (roles), F18 (example data) and F08's permission rules, so the other side never reaches real users. F24 feeds F03 (samples to download and upload), F18 (example events) and F06 (cover thumbnails). F25's reader is needed by F03. F26 is needed by every feature that stores data (F01, F02, F03, F08, F21, F27). F27 points at real parts of F06, F23, F24, F03 and F08, so it comes after them, and it stores its progress with F21's data.

Bias note for F21: the landing page already shows the product, so in-app answers are less neutral than the Google Form. Keep both, tag every answer with its source, and compare them (`tasks.md` F21.11).

---

## 3. Preview app (first release) and the concierge test

**The preview app** is what people try on the web: landing, onboarding, both sides explorable, an organiser can try a sample prospectus, a sponsor can open example events and proposals. It is made of **F00, F01, F02, F03, F05, F06 (basic), F08, F18, F21, F22, F23, F24, F25 (reader), F26, F27**.

**The concierge test on Impact Hack** needs a smaller set: F00, F01, F02, F05, F06 (basic), F08, F18, F26. Match explanation (F07) is done by hand for the first three proposals.

Both are proposals. If the survey shows a different top need, the slice changes. Nothing outside these lists is built before its gate.

## 4. Not building (for now)

- Venue booking or a venue marketplace (a pain at one hackathon, but a different market).
- Contracts and payments before F19's gate.
- A general events listing that competes with Luma, Devpost or MLH.
- Star ratings of organisers or sponsors at launch (no real data; see F12).
- Participant data without consent (F10 and F11 first).

## 5. Open questions

- Does the first release include F09 (email-first)? Only if survey Q20 reaches 60%; until then updates are in-app only.
- The survey (Google Form) is not sent yet. Fixes 1-4 and a new Q24 are in the questionnaire file; fix 5 (length) waits for the timing test. The Google Form itself still has to be rebuilt.
- Typeface: buy Aeonik or keep Hanken Grotesk (`decisions.md`).
- Impact Hack's real prospectus is **not** published (owner decision 2026-11-25): only its content ideas are borrowed. The real PDF is used only for private testing of the reader.
- Platform: web only for now; a mobile app later is not decided.
- Which AI model reads prospectuses best is decided by measurement (F25.8), not in advance.
- Whether to move Supabase from Free to Pro if a pause or lost data ever happens.
