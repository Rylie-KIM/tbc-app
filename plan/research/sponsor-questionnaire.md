# Sponsor questionnaire (web survey)

> **Status 2026-11-26:** this file matches the deployed survey, **version 1.0.0**. The wording of every question, hint and answer option below is the wording in the app. The source in code is `lib/survey.ts`; the stored copy is `../trace/survey-versions/1.0.0.json` and the database tables `survey_version`, `survey_question` (options as JSON) and `survey_flow` (order). Each later change to a question gets a new version and a row in `../trace/survey-changelog.md`; update this file with it. If this file and the app ever differ, the app is right.

> **Update 2026-11-25:** the survey is now collected on the website (onboarding, task F21), not by Google Form. The questions (Q1 to Q24), the analysis plan and the decision gate below still apply. The Google Forms steps and the Apps Script are kept only for reference.

Draft 2026-11-12. Goal: learn how sponsors choose hackathons, what is hard for them, and whether TBC would help. Target 10-15 responses, at least 3 each from recruitment, product/developer-relations and brand/marketing sponsors. About 4 minutes before the 2026-11-24 revision. The app tells sponsors "5-10 minutes"; this was never timed (task R2 was skipped, D2). Revised 2026-11-24: fixes 1-4 of `../trace/user-needs.md` 2.2 applied (new Q21, Q22, Q23; Q4 asks about sponsoring only); Q24 (own events organised, by edition) added the same day. Based on meeting 1 (`discussion.md`) and the benchmarks in `examples.md`.

Rules for the survey: ask about past behaviour, not hypotheticals; the questions do not mention TBC until section 4 (the intro screens before them describe TBC in one general sentence, D12); we do not quote prices ourselves; email is optional.

## How to create it in Google Forms

1. Go to forms.google.com, sign in, click **Blank form**.
2. Click the title "Untitled form" and paste the form title below; paste the description under it.
3. Add each question with the **+** button on the right. Use the dropdown on the question for the type (Multiple choice, Checkboxes, Linear scale, Short answer, Paragraph). Type options one per line. Switch **Required** on only where the list says so.
4. Add sections with the **two-rectangles** icon on the right (Add section). Give each section its title from below.
5. Skip rule (Q4): on the multiple-choice question click the three dots at the bottom right, choose **Go to section based on answer**, and set "0" to section 1b, every other answer to section 2. Then open the **After section 1b** menu at the bottom of section 1b ("Section 1b: If you have not sponsored yet") and choose **Go to section 4**, so non-sponsors skip sections 2 and 3.
6. "Pick up to 3" (Q10 and Q13) and "up to 2" (Q11): on the checkbox question click the three dots, choose **Response validation**, then **Select at most** and enter the number.
7. Email (Q18): type Short answer, three dots, **Response validation**, **Text**, **Email**. Leave it optional.
8. Settings tab: leave **Collect email addresses** off and **Limit to 1 response** off (it forces a Google sign-in and loses respondents). Under Presentation turn on **Show progress bar**.
9. Responses tab: click the green Sheets icon to link a spreadsheet; this is where we read the answers.
10. Test it yourself and with one other person, then click **Send**, the link icon, tick **Shorten URL**, and copy the link. For events, make a QR code from that link (in Chrome, right-click the page and choose "Create QR code for this page", or use any free QR generator).

For on-the-spot use, duplicate the form (three dots, Make a copy) and keep only Q1, Q3, Q5, Q6 and Q11 as a 1-minute version.

## Create the form with Google Apps Script (fast route, added 2026-11-16; reference only: the question texts in this script follow the Google Form layout, with the hint inside the title, and do not include the organiser path)

This replaces steps 2-9 above: one script builds the whole form (19 questions, 4 sections, skip rule, validations, progress bar, linked Sheet). The question text is the same as in "Form text" below; if you change a question there, change it in the script too.

**How to run it**

1. Go to script.google.com, sign in with the Google account that should own the form, click **New project**.
2. Delete the sample code, paste the script below, click the disk icon to save (name the project "TBC sponsor form").
3. In the function dropdown at the top choose `createSponsorForm`, click **Run**.
4. First run only (it asks for Forms, Sheets and Drive access): click **Review permissions**, choose your account, then **Advanced**, **Go to TBC sponsor form (unsafe)**, **Allow**. This warning is normal for your own script (it is not verified by Google).
5. Open **Execution log** (bottom). It prints the edit link, the share link and the Sheet link. Open the edit link and check it once.
6. Do step 10 above (test, shorten URL, QR code).
7. **Re-running:** the script stores the form, sheet and version number in Script properties, so running it again rebuilds the questions in the same form (same link, same sheet) instead of making a new one. Each run renames the two Drive files to `... ver_<n>_<date>` (for example `TBC sponsor questionnaire form ver_3_2026-11-17`) and keeps both in the Drive folder "TBC"; the title respondents see does not change. A re-run is safe only before the first response: once the form has any response the script stops with an error, because rebuilding would break the answer columns. To start over with a new form, delete `TBC_FORM_ID`, `TBC_SHEET_ID` and `TBC_VERSION` under Project Settings, Script properties.

```javascript
function createSponsorForm() {
  var props = PropertiesService.getScriptProperties();
  var TITLE = "How do companies choose hackathons to sponsor? (4-minute survey)";
  var form;
  var existingId = props.getProperty("TBC_FORM_ID");
  if (existingId) {
    // Re-run: reuse the same form and rebuild its questions. Only safe before the first response.
    form = FormApp.openById(existingId);
    if (form.getResponses().length > 0) {
      throw new Error("The form already has responses; rebuilding would break the answer columns. " +
        "Edit the form by hand, or delete TBC_FORM_ID under Project Settings > Script properties to make a new form.");
    }
    var old = form.getItems();
    for (var i = old.length - 1; i >= 0; i--) form.deleteItem(old[i]);
    form.setTitle(TITLE);
  } else {
    form = FormApp.create(TITLE);
    props.setProperty("TBC_FORM_ID", form.getId());
  }
  form.setDescription(
    "We are university students who organise hackathons and are researching how companies decide " +
    "which events to sponsor, so we can make that process easier. It takes about 4 minutes. " +
    "Answers are used only for this research; we will not publish your name or company without " +
    "your permission. Thank you.");
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);
  form.setConfirmationMessage(
    "Thank you. Your answers help us build something useful for organisers and sponsors.");

  // ---- helpers
  function choice(title, options, required) {
    var it = form.addMultipleChoiceItem().setTitle(title).setRequired(required);
    it.setChoiceValues(options);
    return it;
  }
  function boxes(title, options, required, other, atMost) {
    var it = form.addCheckboxItem().setTitle(title).setRequired(required);
    it.setChoiceValues(options);
    if (other) it.showOtherOption(true);
    if (atMost) {
      it.setValidation(FormApp.createCheckboxValidation()
        .setHelpText("Pick at most " + atMost + ".")
        .requireSelectAtMost(atMost).build());
    }
    return it;
  }
  function scale(title, lowLabel, highLabel) {
    return form.addScaleItem().setTitle(title).setBounds(1, 5)
      .setLabels(lowLabel, highLabel).setRequired(true);
  }
  function para(title) {
    return form.addParagraphTextItem().setTitle(title).setRequired(false);
  }

  // ---- Section 1: About you
  form.addSectionHeaderItem().setTitle("Section 1: About you");

  choice("Which best describes your role?", [
    "Recruiting / talent acquisition",
    "Developer relations / developer advocate",
    "Marketing / brand / community",
    "University relations / early careers",
    "Founder or startup team member",
    "Other"], true);

  choice("How large is your organisation?", [
    "Startup (under 50 people)",
    "Small or medium (50-500)",
    "Large (over 500)",
    "I sponsor on my own or for a community"], true);

  choice("What is your role in sponsorship decisions?", [
    "I make the final decision",
    "I recommend or influence the decision",
    "I am not involved in sponsorship decisions"], true);

  // Q24 (added 2026-11-24): asked before Q4 so that people who then skip to section 1b still answer it
  choice("If your organisation has organised its own hackathon or student event, which edition was the most recent event you organised?", [
    "We have not organised one",
    "It was our first edition",
    "2nd edition",
    "3rd edition",
    "4th edition or later",
    "Not sure"], true);

  // Q4 gets its skip rule after the section breaks exist (see below)
  // Revised 2026-11-24: asks about sponsoring only (events you organised yourselves do not count).
  var q4 = form.addMultipleChoiceItem()
    .setTitle("In the last 2 years, how many hackathons or student events has your organisation sponsored (paid for, or given prizes, credits or mentors to)? Do not count events you organised yourselves.")
    .setRequired(true);

  // ---- Section 1b: only for people who answered 0 to Q4 (added 2026-11-24)
  var page1b = form.addPageBreakItem().setTitle("Section 1b: If you have not sponsored yet");

  boxes("What has stopped you from sponsoring a hackathon or student event so far? (select all that apply)", [
    "No budget",
    "I did not find an event that fits",
    "I am not sure it is worth the money",
    "No time to look for events",
    "It is not part of my role",
    "Nobody has asked us"], true, true);

  // ---- Section 2: Your most recent sponsorship
  var page2 = form.addPageBreakItem().setTitle("Section 2: Your most recent sponsorship");

  boxes("What were your reasons for sponsoring the most recent event you sponsored? (select all that apply)", [
    "Hire interns or graduates",
    "Get people to try our product or API and give feedback",
    "Brand awareness among students or developers",
    "Find beta testers or early users",
    "Support the community or local ecosystem"], true, true);

  boxes("How did you find the most recent event you sponsored? (select all that apply)", [
    "The organisers contacted us (email or LinkedIn)",
    "Personal contact or referral",
    "I attended another event",
    "An event listing site (for example Luma, Devpost, MLH)",
    "A university, society or careers service"], true, true);

  choice("Roughly how much did your organisation contribute in total to the most recent event you sponsored?", [
    "Under £500",
    "£500-£1,000",
    "£1,000-£2,500",
    "£2,500-£5,000",
    "Over £5,000",
    "In-kind only (credits, prizes, mentors, swag)",
    "Prefer not to say"], true);

  scale("How well did the most recent event you sponsored meet your goal?", "Not at all", "Completely");

  para("For the most recent event you sponsored, what was the most valuable outcome, and what disappointed you?");

  // ---- Section 3: Choosing events
  form.addPageBreakItem().setTitle("Section 3: Choosing events");

  boxes("Which factors matter most when deciding whether to sponsor a hackathon or student event? Pick up to 3.", [
    "Audience fit (skills, university, level)",
    "Number of attendees",
    "Organiser track record and reliability",
    "Who else is sponsoring",
    "Theme or topic",
    "Cost",
    "Location",
    "What we get (judging seat, challenge, resume access, speaking slot)",
    "Results that past sponsors got (for example hires, sign-ups, leads)"], true, true, 3);

  boxes("What is hardest about sponsoring events? Pick up to 2.", [
    "Finding relevant events",
    "Judging which events are worth it",
    "Negotiating the package back and forth",
    "Knowing who will attend",
    "Measuring results afterwards",
    "Getting budget approved or reporting internally"], true, true, 2);

  // Q22 and Q23 (added 2026-11-24; numbered Q22 and Q23 so the other numbers stay fixed, placed after Q11 in the form)
  para("When hackathon organisers contact you or work with you as a sponsor, what is missing or frustrating?");

  choice("How many weeks before an event starts do you usually decide whether to sponsor the event?", [
    "Less than 2 weeks",
    "2 to 4 weeks",
    "1 to 2 months",
    "3 to 6 months",
    "More than 6 months",
    "It varies a lot"], true);

  // Q20 (added later; numbered Q20 so the other numbers stay fixed, placed after Q11 in the form)
  boxes("How do you currently find and keep track of events you might sponsor? (select all that apply)", [
    "Event listing sites (for example Luma, Devpost, MLH)",
    "LinkedIn",
    "Emails from organisers",
    "A spreadsheet or Notion list",
    "A CRM (for example HubSpot, Salesforce)",
    "Personal network",
    "I do not keep track"], true, true);

  boxes("How do you measure whether a sponsorship worked? (select all that apply)", [
    "Interviews or hires",
    "Sign-ups or product usage",
    "Leads or contacts",
    "Social reach or brand mentions",
    "Project ideas or code produced",
    "We do not measure it"], true, false);

  boxes("If you could filter the participants of an event you sponsor, which participants would you want? Pick up to 3.", [
    "Skills or field of study (for example data, backend, design)",
    "Study level (undergraduate, master’s, PhD)",
    "University or department",
    "Graduation year (when they could start an internship or graduate job)",
    "Experience level (beginners or experienced)",
    "Right to work in the UK",
    "Location",
    "Number of hackathons attended before",
    "Team makeup (solo, team, diversity of the team)",
    "Experience with our product or tools",
    "I would not filter"], true, true, 3);

  para("What should an event’s web page always show about its participants?");

  // ---- Section 4: An idea (everyone answers from here)
  var page4 = form.addPageBreakItem().setTitle("Section 4: An idea")
    .setHelpText(
      "TBC is a website where hackathon and community organisers list their events, and sponsors " +
      "can browse them and propose partnerships. A sponsor could trade things like access to " +
      "hiring, user or beta testing, or product exposure for sponsorship.");

  scale("How useful would TBC be to you?", "Not useful", "Very useful");

  boxes("What would an event’s web page need to show before you would consider sponsoring the event? (select all that apply)", [
    "Audience profile (skills, universities, levels)",
    "Attendee numbers",
    "Event theme or topic",
    "Purpose of the event (why it exists and who it is for)",
    "Expected outcomes (for example projects built, hires, sign-ups)",
    "Past sponsors and what they got",
    "Results of past editions (for example hires, sign-ups, projects built)",
    "Dates and venue",
    "What each sponsorship tier includes and costs",
    "References for the organisers"], true, true);

  choice("If TBC charged a fee for using the website, who should pay that fee?", [
    "Organisers", "Sponsors", "Both", "It should be free", "Not sure"], true);

  form.addTextItem()
    .setTitle("Would you be willing to join a 15-minute interview with the TBC team about sponsoring events? If yes, leave an email.")
    .setRequired(false)
    .setValidation(FormApp.createTextValidation()
      .setHelpText("Enter a valid email address.")
      .requireTextIsEmail().build());

  para("Anything else we should know?");

  // ---- Skip rule for Q4: "0" goes to section 1b (why not), every other answer goes to section 2.
  //      Section 1b then jumps to section 4, so non-sponsors never see sections 2 and 3.
  page1b.setGoToPage(page4);
  q4.setChoices([
    q4.createChoice("0", page1b),
    q4.createChoice("1-2", page2),
    q4.createChoice("3-5", page2),
    q4.createChoice("6 or more", page2)]);

  // ---- Linked response sheet
  var ss;
  var sheetId = props.getProperty("TBC_SHEET_ID");
  if (sheetId) {
    ss = SpreadsheetApp.openById(sheetId);          // re-run: keep the same sheet
  } else {
    ss = SpreadsheetApp.create("TBC sponsor questionnaire (responses)");
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    props.setProperty("TBC_SHEET_ID", ss.getId());
  }

  // ---- Drive file names get a version number and date on every run; the title respondents
  //      see stays clean. Both files always live in the Drive folder "TBC".
  var ver = Number(props.getProperty("TBC_VERSION") || "0") + 1;
  props.setProperty("TBC_VERSION", String(ver));
  var stamp = "ver_" + ver + "_" + Utilities.formatDate(new Date(), "Europe/London", "yyyy-MM-dd");
  var folder = DriveApp.getFolderById("1f9HFyDZjSB2A3ObQ0YRBFQckBe6M5Z4j");
  var formFile = DriveApp.getFileById(form.getId());
  var sheetFile = DriveApp.getFileById(ss.getId());
  formFile.setName("TBC sponsor questionnaire form " + stamp);
  sheetFile.setName("TBC sponsor questionnaire responses " + stamp);
  formFile.moveTo(folder);
  sheetFile.moveTo(folder);

  Logger.log("Version: " + stamp);
  Logger.log("Edit the form:  " + form.getEditUrl());
  Logger.log("Share this link: " + form.getPublishedUrl());
  Logger.log("Responses sheet: " + ss.getUrl());
}
```

**After it runs**

- Check that Q4 = "0" jumps to Section 4 and the other answers go to Section 2 (open the share link and test both).
- Apps Script cannot shorten the URL: do that in the form (**Send**, link icon, **Shorten URL**).
- The 1-minute event version is still made by hand: **Make a copy** of the form and keep only Q1, Q3, Q5, Q6, Q11.
- The Sheet holds emails from Q18: keep it private, and export to `responses.csv` only into the git-ignored `research/analysis/` folder.

## Question text (as in the app, 1.0.0)

**Before the questions** (the intro screens, wording in `components/Onboarding.tsx`): "Welcome to TBC" (one sentence: "Sponsors and hackathons, in one place."); "Who is TBC for? You can try both sides." (Sponsor and Organiser); for a sponsor, "A few questions about sponsoring" ("We want to learn how you decide which events to back. There are no right answers.") with the note that answers are saved to help design TBC and that the email is optional; then "Your questionnaire starts now" with the numbers **23 questions at most** and **5-10 minutes** (organiser: 5 questions, 2 minutes or less). The Google Form title and description that stood here are no longer used (D2).

**How the app shows the questions:**
- One question per screen, with "Question n of N" above it, a progress bar, Back and Next. The hint is shown under the question; an optional question carries the tag "Optional" (the email question says it in its hint).
- Three paths (the order below is the order shown; the snapshot `survey-versions/1.0.0.json` and the table `survey_flow` hold it):

| Path | Questions in order | Count |
|---|---|---|
| Sponsor who has sponsored (Q4 is not 0) | Q1, Q2, Q3, Q24, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q22, Q23, Q20, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19 | 23 |
| Sponsor who has not sponsored (Q4 = 0) | Q1, Q2, Q3, Q24, Q4, Q21, Q15, Q16, Q17, Q18, Q19 | 11 |
| Organiser | O1, O2, O3, Q18, Q19 | 5 |

- **Skip note.** After Q4 = 0 the page says: "Thanks. Since you have not sponsored yet, we skip 12 questions about past sponsorships. 6 left." (The intro says "23 questions at most" so that answering 0 does not look like a way to a shorter survey.)
- **Q14 follows Q13.** Above Q14 the page shows "In the previous question, you chose: ..." as plain text with the person's Q13 answers (without "I would not filter"; "Other" shows the person's own words). With at least one answer the question reads "What else should an event’s web page always show about its participants?"; with none, or only "I would not filter", it reads "What should an event’s web page always show about its participants?" and nothing is shown above it.
- **"Other" options** open a short text box; the text is saved as `<question>_other`.
- **Email (Q18)** is saved while it is typed (when it looks valid) and when the person goes Back or Next. At the end the person goes to the app ("Finish and explore"); the confirmation message at the end of this section is not used.

### Section 1: About you

**Q1. Which best describes your role?** Multiple choice, required.
- Recruiting / talent acquisition
- Developer relations / developer advocate
- Marketing / brand / community
- University relations / early careers
- Founder or startup team member
- Other

**Q2. How large is your organisation?** Multiple choice, required.
- Startup (under 50 people)
- Small or medium (50-500)
- Large (over 500)
- I sponsor on my own or for a community

**Q3. What is your role in sponsorship decisions?** Multiple choice, required. Used to filter answers, not to block them.
- I make the final decision
- I recommend or influence the decision
- I am not involved in sponsorship decisions

**Q24. If your organisation has organised its own hackathon or student event, which edition was the most recent event you organised?** Multiple choice, required. Added 2026-11-24 (numbered Q24 so the other numbers stay fixed, placed after Q3 and before Q4 in the form, so everyone answers it, including people who skip to section 1b).
- We have not organised one
- It was our first edition
- 2nd edition
- 3rd edition
- 4th edition or later
- Not sure

**Q4. In the last 2 years, how many hackathons or student events has your organisation sponsored?** Multiple choice, required, hint "Paid for, or gave prizes, credits or mentors to. Do not count events you organised yourselves.", with the skip rule (0 goes to section 1b, every other answer to section 2). Revised 2026-11-24: "or hosted" removed, because company-hosted events are a different buyer.
- 0
- 1-2
- 3-5
- 6 or more

### Section 1b: If you have not sponsored yet (only people who answered 0 to Q4; after this section, go to section 4)

**Q21. What has stopped you from sponsoring a hackathon or student event so far?** Checkboxes, required, hint "Select all that apply.". Added 2026-11-24 (numbered Q21 so the other numbers stay fixed, placed after Q4 in the form).
- No budget
- I did not find an event that fits
- I am not sure it is worth the money
- No time to look for events
- It is not part of my role
- Nobody has asked us
- Other (add "Other" option)

### Section 2: Your most recent sponsorship

**Q5. What were your reasons for sponsoring the most recent event you sponsored?** Checkboxes, required, hint "Select all that apply.".
- Hire interns or graduates
- Get people to try our product or API and give feedback
- Brand awareness among students or developers
- Find beta testers or early users
- Support the community or local ecosystem
- Other (add "Other" option)

**Q6. How did you find the most recent event you sponsored?** Checkboxes, required, hint "Select all that apply.".
- The organisers contacted us (email or LinkedIn)
- Personal contact or referral
- I attended another event
- An event listing site (for example Luma, Devpost, MLH)
- A university, society or careers service
- Other (add "Other" option)

**Q7. Roughly how much did your organisation contribute in total to the most recent event you sponsored?** Multiple choice, required.
- Under £500
- £500-£1,000
- £1,000-£2,500
- £2,500-£5,000
- Over £5,000
- In-kind only (credits, prizes, mentors, swag)
- Prefer not to say

**Q8. How well did the most recent event you sponsored meet your goal?** Linear scale 1 to 5, required. Label 1 "Not at all", label 5 "Completely".

**Q9. For the most recent event you sponsored, what was the most valuable outcome, and what disappointed you?** Paragraph, optional.

### Section 3: Choosing events

**Q10. Which factors matter most when deciding whether to sponsor a hackathon or student event?** Checkboxes, required, hint "Pick up to 3.", at most 3 can be chosen.
- Audience fit (skills, university, level)
- Number of attendees
- Organiser track record and reliability
- Who else is sponsoring
- Theme or topic
- Cost
- Location
- What we get (judging seat, challenge, resume access, speaking slot)
- Results that past sponsors got (for example hires, sign-ups, leads)
- Other (add "Other" option)

**Q11. What is hardest about sponsoring events?** Checkboxes, required, hint "Pick up to 2.", at most 2 can be chosen.
- Finding relevant events
- Judging which events are worth it
- Negotiating the package back and forth
- Knowing who will attend
- Measuring results afterwards
- Getting budget approved or reporting internally
- Other (add "Other" option)

**Q22. When hackathon organisers contact you or work with you as a sponsor, what is missing or frustrating?** Paragraph, optional. Added 2026-11-24 (placed after Q11 in the form).

**Q23. How many weeks before an event starts do you usually decide whether to sponsor the event?** Multiple choice, required. Added 2026-11-24 (placed after Q22 in the form).
- Less than 2 weeks
- 2 to 4 weeks
- 1 to 2 months
- 3 to 6 months
- More than 6 months
- It varies a lot

**Q20. How do you currently find and keep track of events you might sponsor?** Checkboxes, required, hint "Select all that apply.". Added after the first draft: numbered Q20 so the other numbers stay fixed, but placed after Q11 in the form.
- Event listing sites (for example Luma, Devpost, MLH)
- LinkedIn
- Emails from organisers
- A spreadsheet or Notion list
- A CRM (for example HubSpot, Salesforce)
- Personal network
- I do not keep track
- Other (add "Other" option)

**Q12. How do you measure whether a sponsorship worked?** Checkboxes, required, hint "Select all that apply.".
- Interviews or hires
- Sign-ups or product usage
- Leads or contacts
- Social reach or brand mentions
- Project ideas or code produced
- We do not measure it

**Q13. If you could filter the participants of an event you sponsor, which participants would you want?** Checkboxes, required, hint "Pick up to 3.", at most 3 can be chosen.
- Skills or field of study (for example data, backend, design)
- Study level (undergraduate, master’s, PhD)
- University or department
- Graduation year (when they could start an internship or graduate job)
- Experience level (beginners or experienced)
- Right to work in the UK
- Location
- Number of hackathons attended before
- Team makeup (solo, team, diversity of the team)
- Experience with our product or tools
- I would not filter
- Other (add "Other" option)

**Q14. What should an event’s web page always show about its participants?** Paragraph, optional. **In the app (2026-11-26):** the page shows "In the previous question, you chose: ..." as plain text (the person's Q13 picks, not "I would not filter") above the question, and the question reads "What else should an event page always show about its participants?". Without a pick it keeps the plain wording. The Google Form version is not used (D2).

### Section 4: An idea (everyone answers from here)

**Section description:** TBC is a website where hackathon and community organisers list their events, and sponsors can browse them and propose partnerships. A sponsor could trade things like access to hiring, user or beta testing, or product exposure for sponsorship.

**Q15. How useful would TBC be to you?** Linear scale 1 to 5, required. Label 1 "Not useful", label 5 "Very useful".

**Q16. What would an event’s web page need to show before you would consider sponsoring the event?** Checkboxes, required, hint "Select all that apply.".
- Audience profile (skills, universities, levels)
- Attendee numbers
- Event theme or topic
- Purpose of the event (why it exists and who it is for)
- Expected outcomes (for example projects built, hires, sign-ups)
- Past sponsors and what they got
- Results of past editions (for example hires, sign-ups, projects built)
- Dates and venue
- What each sponsorship tier includes and costs
- References for the organisers
- Other (add "Other" option)

**Q17. If TBC charged a fee for using the website, who should pay that fee?** Multiple choice, required.
- Organisers
- Sponsors
- Both
- It should be free
- Not sure

**Q18. Would you be willing to join a 15-minute interview with the TBC team about sponsoring events?** Short answer (email), optional, email validation, hint "If yes, leave your email. Leaving your email is optional."

**Q19. Anything else we should know?** Paragraph, optional.

### Organiser path (people who choose "organiser"; 5 questions)

Added 2026-11-25 (task F21.20): how organisers find sponsors today. Shown in this order: O1, O2, O3, then Q18 and Q19 above. These three questions are not in the analysis plan below; they are read as counts.

**O1. How do you find sponsors today?** Checkboxes, required, hint "Select all that apply."
- Personal contacts or referrals
- LinkedIn messages
- Emails to companies
- Going to events
- Sponsor lists from other hackathons
- Companies contact us
- We have not looked yet

**O2. What is hardest about getting sponsors?** Checkboxes, required, hint "Pick up to 2.", at most 2 can be chosen.
- Finding the right companies
- Knowing what to ask for
- Setting prices
- Negotiating back and forth
- Getting replies
- Showing what sponsors get

**O3. Which edition is the event you are organising?** Multiple choice, required.
- I have not organised one yet
- First edition
- 2nd edition
- 3rd edition
- 4th edition or later

**Confirmation message (Google Form only, not used in the app):** Thank you. Your answers help us build something useful for organisers and sponsors.

## Follow-up call script (20-30 min)

Use the same questions in order, but ask "why" after Q5, Q10 and Q11 and ask for the last concrete example. Cover the form's section 4 only at the end.

## How we will use the results

- **Filter first** (in the linked sheet, not in the form, so nobody is blocked): keep answers where Q3 is "final decision" or "recommend or influence"; drop "not involved". Prefer Q4 (sponsored in the last 2 years) not 0. Answers with Q4 = 0 are analysed separately as non-sponsors (why they do not sponsor: Q21). Keep one answer per company.
- Aim for at least 3 kept answers per role in Q1 (recruiting, developer relations, marketing).
- Tally Q5 and Q12 by role (Q1) to see which sponsor type cares about what.
- Compare Q7 amounts with the prices in `examples.md`.
- Q13 and Q14 (which participants sponsors would filter for) decide which participant data an event page must show and which filters the matching feature needs; compare the top picks by role (Q1).
- Q10, Q11 and Q16 decide what the event page and the matching feature must show.
- Q15 and Q17 are the early signal on demand and who pays.
- Keep raw answers in the linked Google Sheet; do not publish names or company names.

---

# Analysis plan (added 2026-11-13)

All numbers in the examples below are **made up to show the method**; they are not survey results.

Each question ends with three linked parts:

- **Hypothesis:** a claim about sponsors and why we believe it (meeting 1, the MLH guide, `examples.md`). It can be wrong.
- **Expected:** the number we would see if the hypothesis is true. Written before the data arrives, so the result can only confirm or refute it.
- **Decision:** what we build, and how, for each range of the result. A feature is built only when its evidence passes the threshold written here.

## 0. Ground rules for a small sample

- With 10-15 usable answers, a 50% share has a 95% interval of about 25%-75% (Wilson). Only trust gaps of roughly 30 points or more. No p-values: with this n they mislead. Report counts (k of n) next to every percentage.
- Segment cells (role x question) will hold 3-5 people. Show raw counts there, not percentages, and never draw conclusions from one cell.
- Equal weight per role: to stop the largest role dominating, report the **balanced share** (average of each role's share) next to the plain share.
- Every result is read twice: all kept answers, and only Q3 = "final decision" (robustness check). If the ranking changes, say so.
- Self-reports are biased toward politeness (Q15) and toward memory gaps (Q7, Q8). Pair every opinion with a behaviour (Q4-Q7, Q18).
- Raw responses contain emails (Q18). Keep `responses.csv` out of git (add it to `.gitignore`) and delete the email column before sharing any file.

### What "Wilson" means

Wilson is short for the **Wilson score interval**, a way to show how uncertain a share is when the sample is small.

- **The problem:** if 8 of 12 sponsors say they sponsored to hire, the share is 67%. With only 12 people, the true share across all sponsors could easily be 50% or 80%. The interval gives the plausible range, here about 39% to 86%.
- **How to read it:**
  | Chose it | Share | Wilson interval (95%) |
  |---|---|---|
  | 8 of 12 | 67% | 39% to 86% |
  | 4 of 12 | 33% | 14% to 61% |
  | 3 of 12 | 25% | 9% to 53% |
  (made-up numbers, same as the examples below)
- **Overlapping intervals mean the order is not settled.** In the table, 33% and 25% overlap almost completely, so we must not say one is more common than the other. A wide interval means the sample is too small to be sure. This is why the plan says to trust only gaps of about 30 points or more.
- **"95%"** means: if we repeated the survey many times with new samples, about 95 of 100 intervals built this way would contain the true share.
- **Why not "share plus or minus an error":** that simple method fails for small samples and for shares near 0% or 100%. For example, 12 of 12 would give an interval of exactly 100%, which is not believable. Wilson still gives a sensible range in those cases, so it is the usual choice for small surveys.
- **How we use it:** the `wilson(k, n)` function in Section 1 takes the number of people who chose an option (k) and the number of respondents (n) and returns the two ends of the interval. In the charts it appears as the thin line (whisker) at the end of each bar.

## 1. Setup shared by every question

Export: Responses tab, three-dot menu on the linked Google Sheet, File, Download, CSV. Save as `responses.csv` in `research/analysis/` (suggested folder; not created yet). Use `df["col"]` bracket access everywhere. The answer columns follow the form order, so `q24_organised` sits between `q03_authority` and `q04_freq`, `q21_why_not` sits right after `q04_freq`, and `q22_wish`, `q23_lead` and `q20_tools` sit between `q11_pains` and `q12_measure` in `KEYS`. Non-sponsors leave Q5 to Q14 and Q20, Q22, Q23 empty; sponsors leave Q21 empty.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from math import sqrt

KEYS = [
    "q01_role", "q02_size", "q03_authority", "q24_organised", "q04_freq", "q21_why_not",
    "q05_motive", "q06_channel", "q07_spend", "q08_satisf", "q09_text",
    "q10_factors", "q11_pains", "q22_wish", "q23_lead", "q20_tools", "q12_measure", "q13_filters", "q14_text",
    "q15_useful", "q16_page", "q17_payer", "q18_email", "q19_text",
]
df = pd.read_csv("responses.csv")
df = df.rename(columns=dict(zip(df.columns[1:], KEYS)))   # column 0 is the Timestamp

# --- filter (keep every dropped row in `dropped` so the flow chart can count them)
dropped = df[df["q03_authority"] == "I am not involved in sponsorship decisions"]
df = df.drop(dropped.index)
df["is_sponsor"] = df["q04_freq"] != "0"          # non-sponsors are analysed separately
one_per_company = True                              # add a company column by hand if two people from one firm answered

def wilson(k, n, z=1.96):
    """95% Wilson interval for a share k/n."""
    if n == 0:
        return np.nan, np.nan
    p = k / n
    d = 1 + z**2 / n
    c = (p + z**2 / (2 * n)) / d
    h = z * sqrt(p * (1 - p) / n + z**2 / (4 * n**2)) / d
    return c - h, c + h

def multi_hot(series, options):
    """Google Forms stores checkboxes as one comma-joined string, and some option
    texts contain commas, so split by looking for each exact option text."""
    s = series.fillna("")
    return pd.DataFrame({o: s.str.contains(o, regex=False) for o in options})

def share_table(hot):
    n = len(hot)
    rows = []
    for o in hot.columns:
        k = int(hot[o].sum())
        lo, hi = wilson(k, n)
        rows.append((o, k, k / n, lo, hi))
    t = pd.DataFrame(rows, columns=["option", "k", "share", "lo", "hi"])
    return t.sort_values("share", ascending=False).reset_index(drop=True)

def balanced_share(hot, group):
    """Mean of each role's share, so every role weighs the same."""
    return hot.groupby(group).mean().mean()

def top2(s):
    s = s.dropna()
    return (s >= 4).mean()

def boot_ci(s, f=np.mean, B=5000, seed=0):
    x = s.dropna().to_numpy()
    rng = np.random.default_rng(seed)
    b = [f(rng.choice(x, len(x))) for _ in range(B)]
    return tuple(np.percentile(b, [2.5, 97.5]))

BLUE = "#3b6ea5"   # one hue for one series; roles are shown as small multiples, not extra colours
INK = "#1f2937"

def bar_share(t, title):
    """Horizontal bar of shares with Wilson whiskers and k/n labels. One series, so no legend."""
    n_rows = len(t)
    fig, ax = plt.subplots(figsize=(7.5, 0.45 * n_rows + 1.3))
    y = np.arange(n_rows)[::-1]
    ax.barh(y, t["share"], color=BLUE, height=0.55)
    ax.hlines(y, t["lo"], t["hi"], color=INK, lw=1)
    for yi, k, hi in zip(y, t["k"], t["hi"]):
        ax.text(min(hi + 0.02, 0.97), yi, f"{k}", va="center", fontsize=9, color=INK)
    ax.set_yticks(y)
    ax.set_yticklabels(t["option"], fontsize=9)
    ax.set_xlim(0, 1)
    ax.xaxis.set_major_formatter(lambda v, _: f"{v:.0%}")
    ax.set_title(title, loc="left", fontsize=11, color=INK)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    ax.grid(axis="x", alpha=0.2)
    fig.tight_layout()
    return fig

def role_heatmap(hot, role, title):
    """Counts per role x option, one sequential hue, counts printed in cells."""
    ct = hot.groupby(role).sum().T                      # options x roles
    fig, ax = plt.subplots(figsize=(1.6 + 1.2 * ct.shape[1], 0.45 * ct.shape[0] + 1.3))
    ax.imshow(ct.to_numpy(), cmap="Blues", vmin=0)
    ax.set_xticks(range(ct.shape[1])); ax.set_xticklabels(ct.columns, rotation=30, ha="right", fontsize=9)
    ax.set_yticks(range(ct.shape[0])); ax.set_yticklabels(ct.index, fontsize=9)
    for i in range(ct.shape[0]):
        for j in range(ct.shape[1]):
            ax.text(j, i, int(ct.iat[i, j]), ha="center", va="center", fontsize=9)
    ax.set_title(title, loc="left", fontsize=11, color=INK)
    fig.tight_layout()
    return fig
```

Chart rules used throughout: one axis only (no dual axes), one hue per single series, roles compared as small multiples or a counts heatmap (not extra colours), numbers shown only where they carry the finding, a data table view for each chart (`t.to_markdown()`). If a chart ever needs per-role colours, validate the palette with the dataviz skill's `validate_palette.js` first.

Option lists: copy the exact option text from the form into Python lists (`MOTIVES`, `CHANNELS`, `FACTORS`, `PAINS`, `MEASURES`, `FILTERS`, `PAGE`). "Other" free text is not matched by the lists; read it by hand and add a recoded option if two people wrote the same thing.

## 2. Per-question plan

Each entry: why we ask, how we analyse it (math and code), chart, a made-up example, then Hypothesis, Expected and Decision.

### Q1. Role
- **Why:** every other answer is read by role; recruiting, developer relations and marketing want different things (meeting 1: recruitment, product testing, brand).
- **Analysis:** count per role; compare with the quota of 3 per core role; balanced weights use these groups.
  ```python
  quota = df["q01_role"].value_counts().rename("n").to_frame()
  quota["gap_to_3"] = (3 - quota["n"]).clip(lower=0)
  ```
- **Chart:** horizontal bar of counts with a vertical reference line at 3 (quota tracker).
- **Example:** Recruiting 5, Developer relations 3, Marketing 2, Other 1. Marketing needs 1 more answer before results are read by role.
- **Hypothesis:** the sample is recruiting-heavy because it comes from hackathon networks, and the three core roles want different things (meeting 1).
- **Expected:** recruiting is 40% or more of kept answers; each of developer relations and marketing reaches at least 3.
- **Decision:**
  - Every core role has 3 or more answers: read all tables by role and build onboarding presets per goal (hire, product feedback, brand).
  - A role has fewer than 3: make no claim about that role, ship one generic onboarding with a goal checklist, and collect more answers from that role (event QR form) before designing its preset.

### Q2. Organisation size
- **Why:** budget and approval differ: mass-recruiting big firms versus startups (meeting 1); R. U. Hacking even has a startup tier.
- **Analysis:** role x size counts; median Q7 midpoint per size only if each group has at least 3 sponsors (see Q7 for the midpoint map).
  ```python
  pd.crosstab(df["q02_size"], df["q01_role"])
  ```
- **Chart:** strip plot (one dot per respondent) of Q7 midpoint by size, with the median as a short tick.
- **Example:** Startup median £750 (n=4), Large median £2,500 (n=3), Small or medium n=2, too few to show.
- **Hypothesis:** large firms spend more and need help with internal approval; startups decide fast (meeting 1).
- **Expected:** median Q7 midpoint of Large is at least 2x that of Startup, and "getting budget approved" (Q11) is picked by half or more of Large but under a quarter of Startups (counts only; cells hold 3-5 people).
- **Decision:**
  - Gap of 2x or more and approval pain confirmed: build price guidance by company size and a one-page proposal summary that a sponsor can export and forward; give startups a one-click propose path.
  - Gap under 2x: one price guide for everyone, no size-specific tiers; build the approval one-pager only if Q11 approval reaches 25% overall.

### Q3. Role in the decision
- **Why:** tells us whose answers carry weight; people who do not decide cannot say what makes a sponsor pay (MLH makes the same point).
- **Analysis:** shares of the three answers; **robustness rerun**: repeat the main tables with only "final decision" and compare rankings.
  ```python
  flow = pd.Series({"all answers": len(df) + len(dropped), "involved in decisions": len(df),
                    "sponsored in last 2 years": int(df["is_sponsor"].sum())})
  ```
- **Chart:** horizontal bars of the flow (all, involved, sponsored), counts labelled.
- **Example:** 15 answers, 13 involved, 11 sponsored in the last 2 years. 11 enter the main analysis, 2 non-sponsors are read separately.
- **Hypothesis:** most respondents recommend rather than finally decide, so a proposal often has to travel to someone else.
- **Expected:** "recommend or influence" is 50% or more of the involved respondents.
- **Decision:**
  - 50% or more: sponsor accounts get two roles (decision-maker, recommender) and a "share this shortlist or proposal" link that works without an account (Phase B).
  - Under 50%: one sponsor role; do not build sharing.

### Q4. How many events sponsored in the last 2 years (revised 2026-11-24: sponsored only)
- **Why:** separates repeat sponsors from newcomers and gives a rough yearly volume; "0" respondents explain why companies do not sponsor.
- **Analysis:** distribution; events per year = midpoint / 2 using {"1-2": 1.5, "3-5": 4, "6 or more": 7}; yearly spend per company = events per year x Q7 median midpoint (crude).
  ```python
  mid = {"0": 0, "1-2": 1.5, "3-5": 4, "6 or more": 7}
  df["events_per_year"] = df["q04_freq"].map(mid) / 2
  ```
- **Chart:** bar of the four categories.
- **Example:** 0: 2, 1-2: 5, 3-5: 4, 6 or more: 2 (of 13 including the non-sponsors).
- **Hypothesis:** sponsors do 1-5 events in two years, so a platform would be used a few times a year, not weekly.
- **Expected:** 1-2 plus 3-5 is 60% or more of sponsors; "6 or more" is 20% or less.
- **Decision:**
  - Mostly 1-5: no workflow-heavy dashboard; build saved criteria, email alerts and a guided first sponsorship; price per event, not by subscription.
  - "6 or more" is 30% or more: move the saved shortlist and portfolio view up, and test a subscription in the calls.
  - Non-sponsors (Q4 = 0) are 25% or more of answers: read their reasons first (Q21) and add a short "what sponsoring involves" guide to onboarding.

### Q5. Why they sponsored
- **Why:** the central question. Confirms or corrects the three motives (hiring, product feedback, brand) and shows which are combined.
- **Analysis:** multi-select share with Wilson interval, balanced share by role, motives per respondent.
  ```python
  hot5 = multi_hot(df.loc[df["is_sponsor"], "q05_motive"], MOTIVES)
  t5 = share_table(hot5)
  bal5 = balanced_share(hot5, df.loc[df["is_sponsor"], "q01_role"])
  df["n_motives"] = hot5.sum(axis=1)
  ```
- **Chart:** bar with whiskers (`bar_share`); heatmap role x motive (`role_heatmap`).
- **Example:** hire 8/12 = 67% (interval 39-86%), brand 5/12 = 42%, product feedback 4/12 = 33% (interval 14-61%), beta testers 3/12 = 25% (interval 9-53%). Intervals overlap, so the order of the last three is not settled.
- **Hypothesis:** hiring is the leading motive, product feedback is concentrated in developer relations, and most sponsors name two motives.
- **Expected:** hiring is 50% or more (balanced share); product feedback is 50% or more among developer relations; median motives per respondent is 2 or more.
- **Decision:**
  - Sponsors choose one or more goals at signup (multi-select). Hiring 50% or more: build the hiring fields first (graduation year, field, level) in the event page and the trade menu.
  - Product feedback or beta testers 25% or more in any role: add credit and beta-test trade templates; under 25%: keep them as a plain option, build no test sign-up tooling.
  - Median motives 2 or more: the matching score takes several goal weights (formula in Section 4); equal to 1: a single goal selector is enough.

### Q6. How they found the event
- **Why:** shows what TBC competes with today (meeting 1: events, LinkedIn, luck).
- **Analysis:** share table; **personal-network share** = contacted by organisers, personal contact, attended another event; **platform-addressable share** = listing site, university or society.
  ```python
  hot6 = multi_hot(df.loc[df["is_sponsor"], "q06_channel"], CHANNELS)
  network = hot6[[CH_CONTACTED, CH_REFERRAL, CH_ATTENDED]].any(axis=1).mean()
  ```
- **Chart:** bar with whiskers; one stat tile for the network share.
- **Example:** referral 7/12, organisers contacted us 6/12, listing site 2/12; network share 11/12 = 92%.
- **Hypothesis:** discovery is relationship-driven; listing sites are a minority (meeting 1: events, LinkedIn, luck).
- **Expected:** personal-network share (organisers contacted us, personal contact, attended another event) is 60% or more; listing site is under 20%.
- **Decision:**
  - 60% or more: build warm introductions (shared connections, request an intro), verified organiser profiles and an inbox for inbound proposals first; the listing stays a simple index (Phase C).
  - 30-59%: build the feed and alerts first; test introductions by hand in the concierge test before building them.
  - Under 30%: search, feed and alerts are the core; do not build introductions.

### Q7. How much they contributed
- **Why:** checks our price benchmarks (£300-£3,000 in prospectuses, £500-£7,500 from Orlando) against what sponsors actually paid.
- **Analysis:** bin counts; midpoint map for the money bins; median and interquartile range of midpoints; in-kind and prefer-not-to-say reported as counts only.
  ```python
  MID = {"Under £500": 250, "£500-£1,000": 750, "£1,000-£2,500": 1750,
         "£2,500-£5,000": 3750, "Over £5,000": 6250}   # 6,250 = middle of Orlando's 5,000-7,500 band (assumption)
  df["spend_mid"] = df["q07_spend"].map(MID)
  med = df["spend_mid"].median()
  q1, q3 = df["spend_mid"].quantile([0.25, 0.75])
  ```
- **Chart:** ordered bar of the bins with the benchmark prices drawn as thin reference lines on the same £ axis (never a second axis); strip plot by size (Q2).
- **Example:** median bin £1,000-£2,500 (midpoint £1,750), 3 of 12 in-kind only, 1 prefer not to say. Compared with the Gold tiers of £800 (birmingHack) and £2,000 (HackBelfast), the median sits between them.
- **Hypothesis:** most sponsors spend £500-£2,500 and in-kind is common among product companies; this matches the prospectus benchmarks (£300-£3,000).
- **Expected:** 60% or more of the money answers fall in £500-£2,500; in-kind only is 25% or more among developer relations.
- **Decision:**
  - Both hold: default tier suggestions sit in £500-£2,500 and show the benchmark band; in-kind packages (credits, prizes, mentors) are first-class in the tier builder from day one.
  - In-kind under 10%: postpone the in-kind fields.
  - Median outside £300-£3,000: rewrite the price suggestions before launch, because our benchmarks do not describe these sponsors.

### Q8. How well the event met the goal
- **Why:** if sponsors are already happy, the pain is small; low satisfaction for a motive marks an opening.
- **Analysis:** median and interquartile range; top-2-box share with Wilson interval; bootstrap interval of the mean; mean by motive (Q5) and by whether they measure results (Q12); Spearman correlation with spend (exploratory).
  ```python
  s8 = df["q08_satisf"].astype(float)
  lo, hi = boot_ci(s8)
  df[["q08_satisf", "spend_mid"]].astype(float).corr(method="spearman")
  ```
- **Chart:** strip plot (one dot per person) with median tick, one small panel per motive; counts in the panel titles.
- **Example:** median 4, top-2-box 7/12 = 58%; product-feedback sponsors median 3 (n=4).
- **Hypothesis:** satisfaction is middling (3-4) and lower for product and brand sponsors because their results are harder to measure.
- **Expected:** median 3-4, top-2-box 40-65%; product and brand median is at least 0.5 below the hiring median.
- **Decision:**
  - Top-2-box under 50%: sponsors are not getting value, so outcome reporting and agreed target outcomes in the proposal move into Phase A-B.
  - Top-2-box 75% or more: the pain is small, so discovery and effort matter more; keep the post-event form to three questions.
  - Product or brand clearly lower: build their goal-specific KPIs (sign-ups through a code, reach) before the hiring KPIs.

### Q9. Most valuable outcome and what disappointed
- **Why:** surfaces reasons the closed lists miss, in the sponsor's own words.
- **Analysis:** thematic coding. Starter codebook: audience mismatch, low attendance, poor organisation, low visibility, no follow-up or report, slow communication, hired someone, good talent, product feedback received. Two people code independently; report percent agreement, then agree the final codes. Count themes and keep two or three anonymised quotes.
  ```python
  codes = pd.read_csv("q09_codes.csv")        # one row per (response id, theme), hand-coded
  codes["theme"].value_counts()
  ```
- **Chart:** bar of theme counts, split into "valuable" and "disappointed" panels.
- **Example:** disappointed: no follow-up report 4, audience mismatch 3; valuable: hired an intern 3, good talent 3.
- **Hypothesis:** audience mismatch and missing reporting dominate the disappointments (meeting 1, MLH guide).
- **Expected:** those two themes together are 40% or more of the "disappointed" codes.
- **Decision:**
  - Any theme with 3 or more mentions becomes a backlog item with its count: audience mismatch maps to the participant profile (Phase B), no report maps to the outcome report (Phase D).
  - A new theme with 3 or more mentions gets its own one-paragraph spec.
  - A theme with one mention is noted and not built.

### Q10. Factors in choosing an event
- **Why:** decides which fields an event page must show and how to weight the matching score.
- **Analysis:** share table with intervals, balanced share by role, differences between roles; derived matching weights.
  ```python
  hot10 = multi_hot(df["q10_factors"], FACTORS)
  t10 = share_table(hot10)
  w = balanced_share(hot10, df["q01_role"])
  weights = (w / w.sum()).round(3)             # share of attention each factor gets
  ```
- **Chart:** bar with whiskers; heatmap role x factor.
- **Example:** audience fit 9/13 = 69%, what we get 7/13 = 54%, organiser track record 6/13 = 46%, cost 3/13 = 23%.
- **Hypothesis:** audience fit and "what we get" lead; cost matters less than organisers assume.
- **Expected:** audience fit is 50% or more (balanced share); cost is under 30%.
- **Decision:**
  - The top three factors become the sponsor's filter chips and the order of sections on the event page; the normalised balanced shares seed the matching weights.
  - Cost under 30%: do not make price the default sort or a headline filter; show tiers lower on the page.
  - Cost 50% or more: price filter and price sort go into Phase A.

### Q11. Biggest difficulties (pick up to 2)
- **Why:** the problems TBC must solve; picking only two forces a ranking.
- **Analysis:** share table; by role and size; pair counts; **rank stability** by bootstrap (how often each pain stays in the top 3 when respondents are resampled).
  ```python
  hot11 = multi_hot(df["q11_pains"], PAINS)
  t11 = share_table(hot11)
  pairs = hot11.astype(int).T.dot(hot11.astype(int))      # co-occurrence counts; diagonal = totals
  rng = np.random.default_rng(0)
  top3 = pd.Series(0, index=hot11.columns)
  for _ in range(2000):
      s = hot11.sample(len(hot11), replace=True, random_state=int(rng.integers(1e9)))
      top3[s.mean().nlargest(3).index] += 1
  stability = top3 / 2000
  ```
- **Chart:** bar with whiskers; a pair heatmap only if n is 20 or more.
- **Example:** finding relevant events 8/13, measuring results 7/13, knowing who will attend 6/13; "finding" is in the top 3 in 96% of resamples.
- **Hypothesis:** finding events and measuring results are the two main pains (meeting 1).
- **Expected:** the top pain is 50% or more (balanced share) and "finding" stays in the top 3 in 90% or more of resamples.
- **Decision:**
  - Each pain maps to one feature: finding to feed and alerts (C), judging worth to quality signals (B), negotiating to tier builder and thread (A), who will attend to participant profile (B), measuring to outcome report (D), approval to exportable one-pager.
  - A pain at 50% or more goes into Phase A; 25-49% into the next phase as "Should"; under 25% stays in the backlog.
  - No pain reaches 50%: the problem is not sharp enough; run the follow-up calls before building anything (decision gate, Step 8).

### Q12. How they measure success
- **Why:** tells which outcome data TBC must collect and whether an outcome report would be used.
- **Analysis:** share table; by role; **measurement gap** = people who name measuring as a pain (Q11) and also measure nothing (Q12).
  ```python
  hot12 = multi_hot(df["q12_measure"], MEASURES)
  gap = (hot11[PAIN_MEASURING] & hot12[NO_MEASURE]).mean()
  ```
- **Chart:** bar with whiskers; heatmap role x metric.
- **Example:** interviews or hires 7/13, sign-ups 5/13, leads 4/13, we do not measure 3/13; gap 2/13 = 15%.
- **Hypothesis:** recruiters count interviews, product companies count sign-ups, marketing counts reach, and a visible minority measures nothing.
- **Expected:** "we do not measure it" is 15% or more; the most common metric differs by role.
- **Decision:**
  - Build only the KPIs that 25% or more of a role choose: hiring = interviews started, product = sign-ups through an event link or code, brand = reach.
  - Measurement gap 15% or more: the report must be zero-effort (pre-filled from event data plus a three-question post-event form), not an analytics dashboard.
  - Gap under 5%: sponsors already measure on their own; offer links, codes and an export only, and no tracking of our own.

### Q13. Which participants they would filter for (pick up to 3)
- **Why:** decides what participant data an event page shows and what filters sponsors get; also shows where privacy limits apply.
- **Analysis:** share table; "I would not filter" share (no demand); share naming a sensitive filter (right to work, team makeup); role differences = largest gap in share between two roles per option.
  ```python
  hot13 = multi_hot(df["q13_filters"], FILTERS)
  t13 = share_table(hot13)
  by_role = hot13.groupby(df["q01_role"]).mean()
  spread = (by_role.max() - by_role.min()).sort_values(ascending=False)
  ```
- **Chart:** bar with whiskers; heatmap role x filter.
- **Example:** skills or field 9/13, graduation year 7/13, study level 6/13, right to work 4/13, no filter 1/13; spread: graduation year 0.60 (recruiting 5/5 versus marketing 0/3).
- **Hypothesis:** recruiters want graduation year, study level and right to work; product companies want skills and tool experience; brand wants numbers and location.
- **Expected:** 70% or more pick at least one filter (not "I would not filter"); graduation year is 50% or more among recruiting.
- **Decision:**
  - 70% or more: collect these attributes at participant registration with consent, show aggregates only (a group appears only with 5 or more people), and give sponsors a filter on the aggregate (Phase B).
  - 40-69%: show aggregates but build no filter.
  - Under 40%: do not collect participant data in Phase A-B; show attendee count and the organiser's own audience description.
  - Right to work 25% or more: add it as an opt-in aggregate after the data-protection check; under 25%: do not collect it.

### Q14. What an event page should always show about participants
- **Why:** the sponsor's own wording for the participant section of the event page.
- **Analysis:** code each answer to the Q13 options plus new codes; count; note what is mentioned first.
- **Chart:** bar of coded mentions.
- **Example:** "cohort by course and year" 5, "how many are final-year" 4, "past hackathon winners" 2.
- **Hypothesis:** answers mostly repeat Q13; the new codes are the useful part. In the app the question asks "what else" after showing the person's Q13 picks, so repeats of Q13 are expected to be rarer than in the original wording.
- **Expected:** at least one new code is mentioned twice or more.
- **Decision:**
  - The coded list becomes the participant fields of the event page, ordered by mention count; a field mentioned once is not added.
  - A new code with 2 or more mentions is added to the registration form and to the Q13 filter list.

### Q15. How useful the idea would be
- **Why:** the first demand signal for TBC.
- **Analysis:** median, top-2-box with Wilson interval, bootstrap interval of the mean, by role and by Q4; Spearman with Q4. Treat as an upper bound: a described idea gets polite answers.
  ```python
  s15 = df["q15_useful"].astype(float)
  k = int((s15 >= 4).sum()); n = int(s15.notna().sum())
  top2_ci = wilson(k, n)
  ```
- **Chart:** distribution bar (1-5) in one hue; strip plot by role with median ticks.
- **Example:** values 5,4,4,3,5,4,2,4,5,3,4,4 give median 4 and top-2-box 9/12 = 75% (interval 47-91%).
- **Hypothesis:** the idea gets a median of 3.5-4, inflated by politeness; the real test is Q18.
- **Expected:** top-2-box is 50-80%.
- **Decision:**
  - Decision gate (Step 8): 60% or more is Go (build Phase A); 40-59% is Iterate (more calls, narrow to the one feature with the highest priority score, concierge test only); under 40% is Pivot (stop building the platform and rethink the offer).
  - No feature is built from Q15 alone.

### Q16. What an event page must show
- **Why:** defines the event page content and the minimum product.
- **Analysis:** balanced share; MoSCoW rule on the balanced share: Must at 50% or more, Should 25-49%, Could under 25%.
  ```python
  hot16 = multi_hot(df["q16_page"], PAGE)
  bal16 = balanced_share(hot16, df["q01_role"])
  moscow = pd.cut(bal16, [-0.01, 0.25, 0.50, 1.01], labels=["Could", "Should", "Must"], right=False)
  ```
- **Chart:** bar with reference lines at 25% and 50%.
- **Example:** attendee numbers 11/13, audience profile 10/13, tier prices 9/13, past sponsors 7/13, results 5/13, references 3/13. (The list in the app also has event theme or topic, purpose and expected outcomes; the figures above are made up and predate them.)
- **Hypothesis:** attendee numbers, audience profile and tier prices are must-haves; references are optional.
- **Expected:** attendee numbers, audience profile and tiers are each 50% or more (balanced); references are under 25%.
- **Decision:**
  - 50% or more: mandatory field in the event page schema (an organiser cannot publish without it); 25-49%: prompted; under 25%: optional.
  - Past sponsors and results stay "Should" even above 50%, because a first-time organiser cannot fill them; show a "first edition" label instead.

### Q17. Who should pay
- **Why:** direction for the business model. This question gives direction only, not a price.
- **Analysis:** distribution; by role, size and Q15 (do the keenest users expect others to pay?). Price needs the follow-up calls: ask the four Van Westendorp prices (too cheap, a bargain, getting expensive, too expensive) of the people who agree to a call.
- **Chart:** bar of the five answers.
- **Example:** both 4/13, organisers 3/13, free 4/13, sponsors 1/13, not sure 1/13.
- **Hypothesis:** many say "free" or "organisers"; people prefer another party to pay.
- **Expected:** "free" plus "organisers" is 50% or more; "sponsors" is 20% or less.
- **Decision:**
  - Default: free for both sides at launch; build no payments.
  - "Sponsors" is 40% or more: test paid featured placement in the calls using the four Van Westendorp prices.
  - Payments are built only after at least 5 calls give a price range and at least 10 deals have gone through the platform.

### Q18. Open to a follow-up chat (email left)
- **Why:** a behaviour, not an opinion; the strongest commitment signal in the form, and the interview pipeline.
- **Analysis:** opt-in rate with Wilson interval; opt-in among people with Q15 of 4 or 5.
  ```python
  opt = df["q18_email"].notna()
  rate = opt.mean(); ci = wilson(int(opt.sum()), len(opt))
  keen = df["q15_useful"].astype(float) >= 4
  rate_keen = opt[keen].mean()
  ```
- **Chart:** none; two stat tiles (overall rate and rate among keen respondents) with the interval printed.
- **Example:** 4 of 13 left an email (31%, interval 13-58%); 4 of 9 keen respondents (44%).
- **Hypothesis:** 25-40% of sponsors leave an email, fewer than Q15 suggests.
- **Expected:** opt-in rate 25-40%; higher among respondents with Q15 of 4 or 5.
- **Decision:**
  - 25% or more: run the concierge test with these sponsors on Impact Hack (hand-made event page, three tailored proposals).
  - 10-24%: recruit more sponsors at events and sharpen the pitch before any test.
  - Under 10%: Pivot signal (decision gate).
  - Any feature that no sponsor asks for during the test stays out of Phase A.

### Q19. Anything else
- **Why:** catches what we did not think to ask.
- **Analysis:** read every answer; thematic codes as in Q9; add anything new to the backlog with a mention count.
- **Chart:** none unless a theme repeats; then a bar of theme counts.
- **Example:** "I would only pay if I could see last year's attendee list" (one mention).
- **Hypothesis:** most people leave it empty; one or two comments are useful.
- **Expected:** 30% or fewer answer.
- **Decision:**
  - A theme mentioned 3 or more times enters the backlog with a spec; a single comment is noted and not built.

### Q20. How they find and keep track of events (added later; placed after Q11 in the form)
- **Why:** Q6 asks how they found one event; this asks what they use every day. It is what TBC replaces or has to sit beside.
- **Analysis:** share table with intervals, balanced share by role; **inbox-and-network share** = emails from organisers or personal network; **manual-tracking share** = spreadsheet, Notion or CRM.
  ```python
  hot20 = multi_hot(df["q20_tools"], TOOLS)
  t20 = share_table(hot20)
  inbox_net = hot20[[T_EMAIL, T_NETWORK]].any(axis=1).mean()
  manual = hot20[[T_SHEET, T_CRM]].any(axis=1).mean()
  ```
- **Chart:** bar with whiskers (`bar_share`).
- **Example:** personal network 8/13, emails from organisers 7/13, LinkedIn 6/13, spreadsheet or Notion 4/13, listing sites 3/13, CRM 1/13, do not keep track 3/13.

- **Hypothesis:** sponsors work out of their inbox and personal lists, not a tool; listing sites are not yet a habit (meeting 1).
- **Expected:** inbox-and-network share is 60% or more; listing sites are under 30%; spreadsheet, Notion or CRM is 25% or more.
- **Decision:**
  - Inbox-and-network 60% or more: the product must work from email: proposals and alerts arrive by email and a reply by email lands in the thread, so a sponsor can answer without learning a new tool (Phase A).
  - Spreadsheet, Notion or CRM 25% or more: add a CSV export of the shortlist and proposals (Phase B); build no CRM integration.
  - Listing sites 40% or more: we compete with an existing habit, so we differentiate on participant data and matching, not on the list itself.
  - "I do not keep track" 30% or more: saved shortlist and alerts are the core; export is not needed.
- Follow-up in the interview: ask what they last did to find a new event, step by step.

### Q21. Why they have not sponsored (only Q4 = 0; added 2026-11-24)
- **Why:** non-sponsors are a possible new market, and the earlier form never asked them anything before the idea section.
- **Analysis:** share table (checkboxes), counts only if fewer than 10 non-sponsors answer; note "Other" text by hand.
  ```python
  ns = df[~df["is_sponsor"]]
  hot21 = multi_hot(ns["q21_why_not"], WHY_NOT)
  t21 = share_table(hot21)
  ```
- **Chart:** bar with whiskers; if fewer than 10 answers, a plain count list.
- **Example (made up):** no budget 3, did not find an event that fits 5, not sure it is worth it 4, nobody has asked us 2.
- **Hypothesis:** most non-sponsors say they did not find a fit or are unsure of the value, not that they have no budget.
- **Expected:** "did not find an event that fits" plus "not sure it is worth the money" is 50% or more of non-sponsors.
- **Decision:**
  - 50% or more: discovery and quality signals (F06, F12) matter more than price; the first-time sponsor guide (F20) stays in the backlog.
  - "No budget" is 40% or more: cheap and in-kind packages (F05) move up; price guidance matters.
  - "Nobody has asked us" is 25% or more: inbound proposals (F16) matter, since sponsors wait to be asked.
  - Under 5 non-sponsors answer: no conclusion; read answers one by one in the calls.

### Q22. What organisers should do differently (added 2026-11-24)
- **Why:** meeting 1 planned "what do you want from the organiser side"; this is its open version.
- **Analysis:** thematic coding as in Q9 (starter codes: faster replies, clear prospectus, audience data, reports after the event, fewer emails, fair prices, professionalism); two people code independently, report agreement, keep two or three anonymised quotes.
- **Chart:** bar of theme counts.
- **Example (made up):** "send audience numbers up front" 4, "report after the event" 3, "faster replies" 2.
- **Hypothesis:** the top themes are missing audience data and missing reports, which match Q11 and Q9.
- **Expected:** those two themes are 40% or more of the coded mentions.
- **Decision:**
  - A theme with 3 or more mentions becomes a backlog item with its count (for example "replies" maps to the proposal thread and email-first updates, F08 and F09).
  - A theme with one mention is noted and not built.

### Q23. How many weeks before an event they decide (added 2026-11-24)
- **Why:** decides alerts, deadlines on the event page and whether a long lead time needs planning tools. The old prototype assumed a lead time without any evidence.
- **Analysis:** distribution; share deciding in under 4 weeks; by role.
  ```python
  LEAD_ORDER = ["Less than 2 weeks", "2 to 4 weeks", "1 to 2 months", "3 to 6 months", "More than 6 months", "It varies a lot"]
  t23 = df["q23_lead"].value_counts().reindex(LEAD_ORDER).fillna(0).astype(int)
  short = df["q23_lead"].isin(LEAD_ORDER[:2]).mean()
  ```
- **Chart:** ordered bar of the six answers.
- **Example (made up):** 2 to 4 weeks 5, 1 to 2 months 4, less than 2 weeks 2, 3 to 6 months 1, it varies 1.
- **Hypothesis:** most sponsors decide 2 weeks to 2 months before an event, so a listing must show the event at least 8 weeks ahead.
- **Expected:** 2 to 4 weeks plus 1 to 2 months is 50% or more.
- **Decision:**
  - "Less than 4 weeks" is 40% or more: alerts and a quick one-click proposal matter; show a "last minute" filter.
  - "3 months or more" is 25% or more: organisers should publish early; add a "publish by" reminder to the organiser flow.
  - "It varies a lot" is 30% or more: do not build deadline-based features; keep alerts generic.

### Q24. Events they organised themselves, by edition (added 2026-11-24)
- **Why:** TBC has two kinds of user, organisers and sponsors. Some people are both (a society that sponsors, a company that runs its own hackathon). Q4 now counts sponsoring only, so this question is where hosting shows up. The edition also shows how experienced an organiser is, which matters for the "first edition" label and for trust (need S4).
- **Analysis:** share who have organised at least one event (any answer except "We have not organised one"); distribution by edition; cross with Q1 role and Q4 (sponsor and organiser at once).
  ```python
  ORG_NONE = "We have not organised one"
  df["is_organiser"] = df["q24_organised"].notna() & (df["q24_organised"] != ORG_NONE)
  both = (df["is_organiser"] & df["is_sponsor"]).mean()
  ```
- **Chart:** ordered bar of the six answers; one stat tile for the share who are both.
- **Example (made up):** not organised 8, first edition 2, 2nd 2, 3rd 1, 4th or later 1, not sure 1.
- **Hypothesis:** a visible minority (about one in four) of sponsor-side respondents also organise events, so the two user types overlap.
- **Expected:** 20% or more answered something other than "We have not organised one".
- **Decision:**
  - 25% or more: onboarding offers "I do both"; the role switch (F23) remembers both sides and the home screen shows both.
  - Under 10%: treat organisers and sponsors as separate groups; keep the switch as an exploration tool only.
  - Many "first edition" answers: show the "first edition" label prominently and plan trust features (F12) for newcomers.

## 3. Overall analysis plan (after the per-question work)

**Step 1: one clean table.** One row per company: role, size, authority, frequency, motives, channels, spend midpoint, satisfaction, pains, measures, filters, page needs, usefulness, payer, opt-in. Save as `analysis_table.csv` (without emails).

**Step 2: demand map.** Group the four "information need" questions (Q10 factors, Q11 pains, Q13 filters, Q16 page) into the features they imply and compute how many companies need each one.
  ```python
  need = pd.DataFrame({
      "participant data and filters":  hot10[F_AUDIENCE] | hot11[P_WHO_ATTENDS] | hot16[PG_AUDIENCE] | hot13.drop(columns=[F_NONE]).any(axis=1),
      "discovery feed and alerts":     hot11[P_FINDING],
      "quality signals (history, references)": hot10[F_TRACK] | hot10[F_RESULTS] | hot16[PG_PAST] | hot16[PG_RESULTS] | hot16[PG_REFS],
      "tier builder and clear prices": hot10[F_COST] | hot11[P_NEGOTIATE] | hot16[PG_TIERS],
      "proposal and negotiation thread": hot11[P_NEGOTIATE],
      "outcome reporting":             hot11[P_MEASURE] | hot10[F_RESULTS],
      "approval one-pager":            hot11[P_APPROVAL],
  })
  D = need.groupby(df["q01_role"]).mean().mean()          # balanced demand per feature
  ```
  The column names for the hot-encoded options (`F_AUDIENCE`, `P_FINDING`, ...) are the exact option texts from the form.

**Step 3: feature priority score.** For each feature f: demand D_f (balanced share who need it) times willingness W_f (share of those people who rate usefulness 4 or 5 in Q15).
  - FPS_f = D_f x W_f, on a 0-1 scale.
  - Rank stability: bootstrap respondents 2,000 times and report how often each feature stays in the top 3.
  ```python
  W = pd.Series({f: top2(df.loc[need[f], "q15_useful"].astype(float)) for f in need.columns})
  fps = (D * W).sort_values(ascending=False)
  ```
  Then place each feature on an impact-versus-effort chart: x is build effort (S, M, L estimated by Vicky and Seoyeon as the technical side), y is FPS. One axis each, labelled points, no colour per feature.

**Step 4: segments.** With 10-15 answers use rules, not clustering: personas by role crossed with the main motive (Q5), for example "recruiter", "tool builder", "brand". Show each persona's top 3 needs as small multiples. If n reaches 30 or more, test the rules with hierarchical clustering on the multi-hot answers (Jaccard distance) and check the dendrogram agrees.

**Step 5: validated demand.** Count companies that rate usefulness 4 or 5 **and** left an email: this is the commitment rate (Q15 x Q18). Add the Q17 answer to see who they expect to pay.

**Step 6: price and market size (rough).**
  - Price band: Q7 midpoint quartiles beside the benchmark tiers in `examples.md`.
  - Yearly spend per sponsor: events per year (Q4) x median spend (Q7).
  - Market sketch: number of distinct sponsors across a sample of 20 UK student hackathons (from public pages) x yearly spend x an assumed adoption rate (state the assumption). This is a sketch, not a forecast.

**Step 7: triangulate.** Put survey results next to Orlando's experience, the MLH guide, the benchmark prospectuses and the follow-up calls in one table: agree, disagree, no evidence. Anything that only one source supports stays a hypothesis.

**Step 8: decision gate.** Agree these thresholds **before** the data arrives (they are proposals; change them now, not after):
  | Result | Go | Iterate | Pivot |
  |---|---|---|---|
  | Usefulness top-2-box (Q15), kept answers | 60% or more | 40-59% | under 40% |
  | Commitment rate (Q15 of 4-5 and email) | 25% or more | 10-24% | under 10% |
  | At least one pain named by 50% or more (Q11, balanced) | yes | | no |
  | Discovery is network-driven (Q6 network share) | any (decides features, not go/no-go) | | |
  | Sponsors who would filter participants (Q13, not "no filter") | 70% or more | 40-69% | under 40% |
  Read the gate on the main analysis and again on Q3 = "final decision" only.

**Step 9: report.** One page: sample (n, roles, flow chart), top 3 findings with counts and intervals, the demand map, the priority chart, the gate result, three quotes, and a list of what we still do not know. Share the one page, never the raw sheet.

## 4. Feature development plan from the results

Builds on the existing hackathon MVP (organiser and sponsor journeys, prospectus upload, matches with reasons and gaps, request and negotiation thread). This section collects the **Decision** lines of Section 2 into one build plan. "How" says whether a feature is built, run by hand first (concierge), or deferred. All thresholds were fixed before the data (see Step 8) and change only by a written decision.

| Phase | Feature | Evidence and threshold (build when) | How |
|---|---|---|---|
| A. Core | Event page with Must fields | Q16: field at 50% or more (balanced); Q10, Q11 agree | Build. Must fields mandatory for organisers, Should prompted, Could optional. "First edition" label for new organisers |
| A | Sponsor goals at signup and trade menu | Q5: motive at 25% or more | Build. Menu options only for motives that pass 25% |
| A | Tier builder with in-kind packages | Q7: in-kind 25% or more among developer relations, or Q11 "negotiating" 25% or more | Build. Price suggestions from the Q7 bins and benchmark band |
| A | Proposal and negotiation thread | Already exists | Keep |
| A | Email-first replies (proposals and alerts by email, reply by email lands in the thread) | Q20: emails from organisers or personal network 60% or more | Build |
| B. Trust and fit | Participant aggregate profile and sponsor filters on it | Q13: 70% or more pick a filter, and Q10 audience fit 50% or more or Q11 "who will attend" 25% or more | Build with consent, groups of 5 or more only. 40-69%: aggregates without filters. Under 40%: do not collect participant data |
| B | Organiser history and ratings | Q10 track record 25% or more, or Q11 "judging worth" 25% or more, or Q9 theme with 3 mentions | Build from event data; first-time organisers show "first edition" |
| B | Matching score | At least two Phase B features live and 5 or more real proposals | Run by hand until then; then build with weights from Q10 and Q13 balanced shares |
| B | CSV export of shortlist and proposals | Q20: spreadsheet, Notion or CRM 25% or more | Build; no CRM integration |
| B | Share shortlist with a decision-maker | Q3: "recommend or influence" 50% or more | Build as a link that works without an account |
| C. Discovery | Feed and alerts, follow organiser | Q11 "finding" 50% or more | Build |
| C | Warm introductions and inbox for inbound proposals | Q6 network share 60% or more (30-59%: test by hand in the concierge test; under 30%: skip) | Build or concierge, by the threshold |
| D. Outcomes | Outcome report with KPIs by goal, post-event form, event links or codes | Q11 "measuring" 25% or more, or Q12 measurement gap 15% or more, or Q8 top-2-box under 50% | Concierge first (three-question form, hand-built report), automate after 3 sponsors use it |
| D | Approval one-pager (PDF export) | Q11 "approval" 25% or more | Build |
| E. Money | Featured placement, then transaction fee or subscription | Q17 plus price range from 5 or more calls, and 10 or more deals through the platform | Defer. No payments before then |

**Order of work:** Phase A starts only when the decision gate says Go (Step 8). A later phase starts when its evidence passes and the earlier phase is live. A feature whose threshold is not met is not built, even if it is attractive. A feature that passes but that no sponsor asks for in the concierge test stays out of Phase A.

**Matching score (Phase B), transparent and data-based.** For sponsor s and event e:
  - score(s, e) = sum over goals g of weight_g(s) x fit_g(e), where weight_g(s) is the sponsor's stated goal share (for example hiring 0.6, brand 0.4).
  - fit_hiring(e) = share of participants matching the sponsor's hiring criteria (graduation year, field, level), from the aggregate profile.
  - fit_product(e) = share of participants with the relevant skills or tool experience.
  - fit_brand(e) = reach, scaled by attendees and region match.
  - Show each term next to the score so the "why" and "gaps" on the match card come from these numbers (the MVP already shows reasons and gaps).
  - Starting weights for the criteria inside each fit come from the balanced shares of Q10 and Q13; refit after real proposals show which matches sponsors accept.

**Data model additions (to discuss with Vicky):** event tiers with price, slots and perks; participant aggregate bins with a minimum group size; sponsor goals and criteria; event history (sponsors, outcomes, ratings); outcome records (KPI, value, source).

**Privacy, before any participant data is stored:** collect each attribute only with a clear consent at registration; show sponsors aggregates, not individuals, until a participant opts in to a talent pool; keep sensitive attributes (right to work, ethnicity) aggregate and opt-in; check university and data-protection requirements first. This is a design rule, not legal advice.

**Test before building:** run the concierge test on Impact Hack with the early-access list from Q18: hand-make the event page and three tailored proposals, then record who replies and what they ask for. Any feature that no sponsor asks for during this test stays out of Phase A.
