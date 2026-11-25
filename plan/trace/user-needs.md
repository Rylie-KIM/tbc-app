# TBC user needs

Draft 2026-11-24, updated 2026-11-25 (owner's standing instruction: keep the trace files current without asking). First step of the plan: **user needs → features → tasks**. This file defines the problem and the user needs. Features and tasks come after it and must each point back to a need here.

Sources used: `discussion.md` (meeting 1, 2026-11-11), `examples.md` (public prospectuses, 2026-11-12), `research/sponsor-questionnaire.md` (form draft and analysis plan), and the ideas (not the code) of the old prototype in `_activities/projects/TBC`.

**Evidence levels used below**
- **Team**: said by a team member from their own experience (meeting 1). One person, one event.
- **Organiser claim**: written by organisers in a prospectus or guide. Not a sponsor's own account.
- **Survey (pending)**: the questionnaire is built to test it, but no responses exist yet (no `responses.csv` or analysis folder in `plan/research/`).
- **None**: nobody has checked it.

Right now **every sponsor need is a hypothesis**. Nothing in this file has been confirmed by a sponsor.

---

## 1. Problem statement

**Draft problem (one paragraph)**

Student and community organisers need sponsors to run tech events, and companies need access to the right students, users and developers. Today they find each other through luck: LinkedIn messages, going to events, a referral, a static PDF prospectus sent by email. An organiser cannot tell which sponsors fit or what to ask for. A sponsor cannot find events that fit its goal (hiring, product feedback, brand), cannot check who will attend, negotiates the package back and forth, and gets no evidence afterwards that it was worth the money. Both sides do the same manual work again for every event.

**Who has the problem, in order of what we know**

| Who | Problem as we understand it | Evidence |
|---|---|---|
| Organisers (volunteer students, societies, builder clubs) | Finding sponsors is slow and depends on luck and personal contacts; no common way to show an event; unclear what price is reasonable | Team (Product lead's own hackathon); Organiser claim (prospectuses) |
| Sponsors (recruiters, developer relations, brand and marketing) | Hard to find relevant events, judge which are worth it, know who attends, measure results | Team and Organiser claim (MLH guide); Survey (pending) |
| Participants (students) | Unknown. They are the audience sponsors pay for, and any data about them needs their consent | None |

**What the problem is not (scope guard)**
- Not "build an events listing": Luma, Devpost and MLH already list events (Survey Q20 tests whether sponsors use them).
- Not payments, contracts or venue booking for now. Venue was the biggest pain at one hackathon (Team), but it is a different market; keep it as a possible later need, not a first one.

**Success looks like (to confirm with the team)**
- An organiser can describe an event once and reach sponsors who fit it, without relying on a personal contact.
- A sponsor can decide whether an event is worth it from the page alone and send a proposal in one sitting.
- Both can see afterwards what the sponsorship produced.

**What would show the problem is wrong:** the decision gate in the questionnaire plan (usefulness under 40%, commitment under 10%, no pain named by 50%). In that case we rethink before building.

---

## 2. Is the sponsor questionnaire enough?

**Verdict:** enough to test **sponsor demand** and rank sponsor needs. **Not enough on its own to define the problem**: it misses a few sponsor questions the team had planned, and says nothing about organisers or participants. Fix the five small gaps (2.2) before sending; run the extra research (2.3) in parallel.

### 2.1 What it does well
- Asks about past behaviour (Q5-Q7) before the idea; TBC is mentioned only in section 4.
- Skip rule puts non-sponsors in the right place; roles are balanced in the analysis.
- Hypothesis, expected value and decision written **before** the data, with a go / iterate / pivot gate.
- Honest about small samples (counts, intervals, no p-values).

### 2.2 Gaps to fix in the form (fixes 1-4 applied to `research/sponsor-questionnaire.md` on 2026-11-24; fix 5 waits for the timing test)

| # | Gap | Why it matters | Proposed fix |
|---|---|---|---|
| 1 | People who answered Q4 = 0 jump to section 4 and are never asked **why** they do not sponsor | The analysis plan says "read their reasons first", but no question collects them. Non-sponsors are the biggest untapped group | Add one short question for Q4 = 0 only: "What has stopped you from sponsoring so far?" with options (no budget, did not find a fit, unsure of value, no time, other) |
| 2 | Two questions planned in meeting 1 are missing: "What do you want from the organiser side?" and "What would make finding opportunities easier?" | These are the direct source of organiser-facing features (response time, prospectus format, reporting) | Add "What do you wish organisers did differently?" (paragraph, optional) |
| 3 | Q4 counts "sponsored **or hosted**" | `examples.md` notes that company-hosted events (Wise, Allianz, Lloyds, Pfizer) are a different buyer from sponsors of student events; the answers get mixed | Split into two questions, or ask for sponsored only |
| 4 | Nothing on **timing and process**: how many weeks before an event they decide, who else signs off, budget cycle | Decides alerts, deadlines and whether an approval one-pager is needed. The old prototype assumed a "lead time" without any evidence | Add "How many weeks before an event do you usually decide?" (choice) |
| 5 | The "4-minute" claim is likely too low: 20 questions, 4 free-text boxes, several checkbox lists of up to 10 options | A long form lowers the number of responses, and the target is only 10-15 | Time two test people before sending; if over 6 minutes, cut Q14, Q19 or the 1-minute version only for events. (My estimate is 7-9 minutes; not measured) |

Minor: numbering is out of order (Q20 sits after Q11); Q15 describes the idea and will give polite answers (the plan already treats it as an upper bound, with Q18 as the real signal).

### 2.3 What the questionnaire cannot answer (extra research needed)

| Missing | Why it matters | Cheapest way |
|---|---|---|
| **Organiser needs** | The team says "we already know our side", but that is one person at one hackathon. Features such as the tier builder and price guidance depend on it | 5 short interviews with other organisers (same networks, 15 minutes), same method as the sponsor calls |
| **Participant willingness to share data** | Sponsors may ask to filter participants (Q13), but participants must agree to share. If students refuse, that whole feature fails, and there are privacy and university rules | A 5-question poll at the next hackathon: would you share degree, year, skills with sponsors, and under what conditions |
| **How sponsors behave in a real deal** | Self-reported answers are biased; the plan already proposes a concierge test on Impact Hack | Run the concierge test as planned |

---

## 3. User needs

Format: **who needs what, so that what**. Each need has evidence, confidence and the survey question that tests it. "Confidence" is how sure we are that the need is real, not how important it is.

### 3.1 Sponsors

| ID | Need | Evidence | Confidence | Tested by |
|---|---|---|---|---|
| S1 | **Find events that fit my goal** (hire, get product feedback, build brand) without relying on luck or a personal contact, so that I do not miss good events | Team: sponsors found by events, LinkedIn, luck. Organiser claim: MLH names these three goals | Medium | Q5, Q6, Q11, Q20 |
| S2 | **Know who will attend** (skills, study level, graduation year, numbers) before I pay, so that I can judge fit | Organiser claim (MLH: attendee fit is a top worry). Survey (pending) | Medium | Q10, Q11, Q13, Q16 |
| S3 | **Compare packages and prices clearly**, with a sense of what is normal, so that I do not negotiate back and forth | Organiser claim: tiers £300-£3,000, "negotiable" in every prospectus. Team: tiers by slots | Medium | Q7, Q11, Q16 |
| S4 | **Trust the organiser** (track record, professionalism, who else sponsors), so that my money and brand are safe | Organiser claim (MLH). Survey (pending) | Medium | Q10, Q16 |
| S5 | **See what the sponsorship produced** (interviews, sign-ups, reach), so that I can justify the spend | `examples.md`: no prospectus promises or publishes results. Survey (pending) | Low (nobody has said sponsors want this) | Q8, Q9, Q12 |
| S6 | **Get internal approval** with something I can forward, so that a recommendation becomes a decision | Survey (pending); the plan expects most respondents to be recommenders | Low | Q3, Q11 |
| S7 | **Work from email and the tools I already use**, so that I do not learn another tool for a few events a year | Survey (pending) | Low | Q4, Q20 |
| S8 | **Understand what sponsoring involves**, if I have never sponsored (non-sponsors) | None. The questionnaire now asks non-sponsors why (Q21) | None | Q21 |
| S9 | **Explore a realistic example before committing**, including events from different kinds of organiser (student society, university or careers service, company-hosted, community or non-profit, commercial), so that I can judge whether the product fits me without giving real data | Owner decision for the preview app (2026-11-25); no sponsor evidence | None (a design choice, not a validated need) | Preview use; proposed survey Q25 on preferred organiser types (task R11) |

### 3.2 Organisers

| ID | Need | Evidence | Confidence | Tested by |
|---|---|---|---|---|
| O1 | **Reach sponsors that fit without cold outreach**, so that fundraising does not take weeks of messages | Team: every route different, "often luck" | Medium (one team member) | Organiser interviews |
| O2 | **Present the event once, in a standard way** instead of a static PDF prospectus, so that sponsors find the facts they need | `examples.md`: prospectuses are PDFs sent by email or LinkedIn | Medium | Q16 (what a page must show) |
| O3 | **Know what price and tiers are reasonable**, so that a new event does not underprice or scare sponsors away | Team: typical sponsor about £2,000, "lower end for a new hackathon". Organiser claim: benchmarks in `examples.md` | Medium | Q7 and organiser interviews |
| O4 | **Manage tiers and replies in one place** (slots per tier, proposals, counter-offers), so that nothing is lost in email | Team: higher tiers have fewer slots by policy; negotiation is manual | Low | Organiser interviews |
| O5 | **Ask for non-cash support** (credits, mentors, prizes, venue), so that the event is not limited to money | Team: venue is the biggest current problem. Old prototype modelled five support types | Low | Q5 ("in-kind"), Q7 |
| O6 | **Show sponsors proof afterwards**, so that they come back next year | Inferred. No source | None | Organiser interviews |
| O7 | **Try the product safely with a sample prospectus** before uploading my own file, so that I see how it works without risk | Owner decision for the preview app (2026-11-25) | None (a design choice, not a validated need) | Preview use; organiser interviews |

### 3.3 Participants (hypothesis only)

| ID | Need | Evidence | Confidence | Tested by |
|---|---|---|---|---|
| P1 | **Control what data is shared with sponsors** and get something in return (opportunities), so that I am not tracked for hiring without consent | None. Needed because S2 depends on participant data | None | Participant poll (2.3) |

### 3.4 Needs that conflict or depend on each other
- **S2 depends on P1.** If participants refuse to share data, S2 can only be met with what the organiser says about the audience.
- **S3 and O3 pull in opposite directions.** Sponsors want low prices and clear comparison; organisers want to ask for more. Visible benchmarks help both, but a "fair price" guide is a position we must choose.
- **S1 and O1 are the same match seen from two sides.** If one side is empty, the other gets nothing. We need a way to start with few events and few sponsors (the cold start); this is a feature question, not a need.

### 3.5 Priority (provisional, to redo after the survey)

Rank by how many people need it × how much it hurts × how sure we are. With no data yet, only the order of work is useful:

1. **S1/O1 (find and be found)** and **S2/O2 (clear event page)**: both sides, and both medium confidence.
2. **S3/O3 (clear packages and prices)**: medium confidence, cheap to test with the concierge test.
3. **S5, S6, S7, O4, O5, O6**: low confidence; each waits for survey evidence.
4. **P1, S8**: research first.

---

## 4. Ideas carried over from the old prototype (ideas only, no code)

These are what the old TBC prototype assumed. They are listed so we can keep, question or drop each one against the needs above.

| Idea in the prototype | Need it serves | Keep, question or drop |
|---|---|---|
| Organiser uploads a prospectus and the system fills the event fields, then lists the missing ones | O2 | **Keep** the idea (reduces effort for organisers; shows what is missing) |
| Sponsor profile with goals, target audience, minimum requirements, support available, limits, expected benefits, lead time | S1, S4 | **Question**: profile fields are about support the sponsor can give. The survey says sponsors think in goals (hire, product, brand); model those first |
| Match list with an explanation: why relevant, what is aligned, what is missing | S1 | **Keep** the "why and what is missing" explanation; it makes the ranking trustworthy |
| Matching by shared words in text fields | S1 | **Drop** for now; do matching by hand until there are real profiles |
| Ratings (1-5) that push profiles up the ranking | S4 | **Drop** at launch: ratings were invented demo values, and a new platform has no real ratings (cold start). Show verified facts such as past events instead |
| Partnership request with terms (funding, credits, venue, mentors, prizes, promotion, recruitment) and a message thread; either side can start; status requested / counter / confirmed / declined | S3, O4 | **Keep** the thread and status; **question** free-text terms: tiers with clear prices may fit sponsors better (S3) |
| Demo data clearly labelled as demo, with a disclaimer | S4 | **Keep** the habit: never show invented numbers as real |
| Missing in the prototype | | Participant data (S2, P1), outcomes (S5), email replies (S7), exportable summary (S6), price guidance (O3): all unbuilt, and each depends on survey evidence |

**What the prototype shows about order of work:** it built matching and negotiation first, before anyone had said what sponsors want. This plan reverses that: needs first, then features that point to a need, then tasks.

---

## 5. Open assumptions to check

| # | Assumption | How to check |
|---|---|---|
| 1 | Sponsors fall into three groups (hiring, product testing, brand) | Q1 × Q5 |
| 2 | Discovery today is network-driven, not listing-driven | Q6, Q20 |
| 3 | Sponsors want participant filters | Q13; and P1 must also hold |
| 4 | A sponsor decides a few events a year, so a lightweight tool beats a dashboard | Q4 |
| 5 | Organisers' needs match the Product lead's experience of one event | 5 organiser interviews |
| 6 | The platform can start with few events and sponsors | Concierge test on Impact Hack |
| 7 | A visible minority of respondents both organise events and sponsor them (so the two user types overlap) | Q24 |
| 8 | Sponsors care about the kind of organiser (student society, careers service, company-hosted, community, commercial), so a filter by organiser type is useful | Proposed Q25 (task R11) |

---

## 6. Where the plan stands (2026-11-25)

Done: this file, `features.md`, `tasks.md` and `decisions.md`; questionnaire fixes 1-4 and new Q21 to Q24 in `../research/sponsor-questionnaire.md`; design direction saved in `../design/`; Supabase project created (Europe), `.env` set up.

Next, in this order (details and sizes in `tasks.md`):
1. Fix the `.env` password line and change the database password (H5).
2. Time the form with two people (R2), rebuild the Google Form and test both branches (R9), then send the first wave by Google Form (R10, R3). Nothing has been sent yet.
3. Run the organiser interviews and the participant poll (R4, R5); consider a survey question on organiser types (R11).
4. Build the platform and the preview app (X, H, F-series tasks), samples and AI reader included.
5. After the survey: update confidence and priority in sections 3 and 5 and the gates in `features.md` (R7).
