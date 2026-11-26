// The full questionnaire (plan/research/sponsor-questionnaire.md, Q1 to Q24) as the onboarding survey.
// Keys follow the questionnaire's numbering, so the export matches the analysis plan.
// Bump this on ANY change to the questions, wording, options or order (then run `npm run survey:version -- --write`
// and add a line to plan/trace/survey-changelog.md). Every saved answer records the version the person saw.
export const SURVEY_VERSION = 'v0';
export type Role = 'organiser' | 'sponsor';
export type Kind = 'single' | 'multi' | 'scale' | 'text' | 'email';

export type Question = {
  key: string;
  kind: Kind;
  section: string;
  title: string;
  hint?: string;
  intro?: string;
  options: string[];
  max?: number;
  other?: boolean;
  optional?: boolean;
  low?: string;
  high?: string;
  /** A follow-up to an earlier question: the page shows what the person chose there, and uses `titleAfter` when they chose something. */
  echoFrom?: string;
  echoLead?: string; // the sentence that introduces the list, shown in plain text
  titleAfter?: string;
};

const SEC = { about: 'About you', why: 'If you have not sponsored yet', recent: 'Your most recent sponsorship', choosing: 'Choosing events', idea: 'An idea', org: 'Finding sponsors' };
const ALL_APPLY = 'Select all that apply.';
const q = (x: Omit<Question, 'options'> & { options?: string[] }): Question => ({ options: [], ...x });

export const Q: Record<string, Question> = {
  q01_role: q({ key: 'q01_role', kind: 'single', section: SEC.about, title: 'Which best describes your role?', options: ['Recruiting / talent acquisition', 'Developer relations / developer advocate', 'Marketing / brand / community', 'University relations / early careers', 'Founder or startup team member', 'Other'] }),
  q02_size: q({ key: 'q02_size', kind: 'single', section: SEC.about, title: 'How large is your organisation?', options: ['Startup (under 50 people)', 'Small or medium (50-500)', 'Large (over 500)', 'I sponsor on my own or for a community'] }),
  q03_authority: q({ key: 'q03_authority', kind: 'single', section: SEC.about, title: 'What is your role in sponsorship decisions?', options: ['I make the final decision', 'I recommend or influence the decision', 'I am not involved in sponsorship decisions'] }),
  q24_organised: q({ key: 'q24_organised', kind: 'single', section: SEC.about, title: 'If your organisation has organised its own hackathon or student event, which edition was the most recent event you organised?', options: ['We have not organised one', 'It was our first edition', '2nd edition', '3rd edition', '4th edition or later', 'Not sure'] }),
  q04_freq: q({ key: 'q04_freq', kind: 'single', section: SEC.about, title: 'In the last 2 years, how many hackathons or student events has your organisation sponsored?', hint: 'Paid for, or gave prizes, credits or mentors to. Do not count events you organised yourselves.', options: ['0', '1-2', '3-5', '6 or more'] }),
  q21_why_not: q({ key: 'q21_why_not', kind: 'multi', section: SEC.why, title: 'What has stopped you from sponsoring a hackathon or student event so far?', hint: ALL_APPLY, other: true, options: ['No budget', 'I did not find an event that fits', 'I am not sure it is worth the money', 'No time to look for events', 'It is not part of my role', 'Nobody has asked us', 'Other'] }),
  q05_motive: q({ key: 'q05_motive', kind: 'multi', section: SEC.recent, title: 'What were your reasons for sponsoring the most recent event you sponsored?', hint: ALL_APPLY, other: true, options: ['Hire interns or graduates', 'Get people to try our product or API and give feedback', 'Brand awareness among students or developers', 'Find beta testers or early users', 'Support the community or local ecosystem', 'Other'] }),
  q06_channel: q({ key: 'q06_channel', kind: 'multi', section: SEC.recent, title: 'How did you find the most recent event you sponsored?', hint: ALL_APPLY, other: true, options: ['The organisers contacted us (email or LinkedIn)', 'Personal contact or referral', 'I attended another event', 'An event listing site (for example Luma, Devpost, MLH)', 'A university, society or careers service', 'Other'] }),
  q07_spend: q({ key: 'q07_spend', kind: 'single', section: SEC.recent, title: 'Roughly how much did your organisation contribute in total to the most recent event you sponsored?', options: ['Under £500', '£500-£1,000', '£1,000-£2,500', '£2,500-£5,000', 'Over £5,000', 'In-kind only (credits, prizes, mentors, swag)', 'Prefer not to say'] }),
  q08_satisf: q({ key: 'q08_satisf', kind: 'scale', section: SEC.recent, title: 'How well did the most recent event you sponsored meet your goal?', low: 'Not at all', high: 'Completely', options: ['1', '2', '3', '4', '5'] }),
  q09_text: q({ key: 'q09_text', kind: 'text', section: SEC.recent, title: 'For the most recent event you sponsored, what was the most valuable outcome, and what disappointed you?', optional: true }),
  q10_factors: q({ key: 'q10_factors', kind: 'multi', section: SEC.choosing, title: 'Which factors matter most when deciding whether to sponsor a hackathon or student event?', hint: 'Pick up to 3.', max: 3, other: true, options: ['Audience fit (skills, university, level)', 'Number of attendees', 'Organiser track record and reliability', 'Who else is sponsoring', 'Theme or topic', 'Cost', 'Location', 'What we get (judging seat, challenge, resume access, speaking slot)', 'Results that past sponsors got (for example hires, sign-ups, leads)', 'Other'] }),
  q11_pains: q({ key: 'q11_pains', kind: 'multi', section: SEC.choosing, title: 'What is hardest about sponsoring events?', hint: 'Pick up to 2.', max: 2, other: true, options: ['Finding relevant events', 'Judging which events are worth it', 'Negotiating the package back and forth', 'Knowing who will attend', 'Measuring results afterwards', 'Getting budget approved or reporting internally', 'Other'] }),
  q22_wish: q({ key: 'q22_wish', kind: 'text', section: SEC.choosing, title: 'When hackathon organisers contact you or work with you as a sponsor, what is missing or frustrating?', optional: true }),
  q23_lead: q({ key: 'q23_lead', kind: 'single', section: SEC.choosing, title: 'How many weeks before an event starts do you usually decide whether to sponsor the event?', options: ['Less than 2 weeks', '2 to 4 weeks', '1 to 2 months', '3 to 6 months', 'More than 6 months', 'It varies a lot'] }),
  q20_tools: q({ key: 'q20_tools', kind: 'multi', section: SEC.choosing, title: 'How do you currently find and keep track of events you might sponsor?', hint: ALL_APPLY, other: true, options: ['Event listing sites (for example Luma, Devpost, MLH)', 'LinkedIn', 'Emails from organisers', 'A spreadsheet or Notion list', 'A CRM (for example HubSpot, Salesforce)', 'Personal network', 'I do not keep track', 'Other'] }),
  q12_measure: q({ key: 'q12_measure', kind: 'multi', section: SEC.choosing, title: 'How do you measure whether a sponsorship worked?', hint: ALL_APPLY, options: ['Interviews or hires', 'Sign-ups or product usage', 'Leads or contacts', 'Social reach or brand mentions', 'Project ideas or code produced', 'We do not measure it'] }),
  q13_filters: q({ key: 'q13_filters', kind: 'multi', section: SEC.choosing, title: 'If you could filter the participants of an event you sponsor, which participants would you want?', hint: 'Pick up to 3.', max: 3, other: true, options: ['Skills or field of study (for example data, backend, design)', 'Study level (undergraduate, master’s, PhD)', 'University or department', 'Graduation year (when they could start an internship or graduate job)', 'Experience level (beginners or experienced)', 'Right to work in the UK', 'Location', 'Number of hackathons attended before', 'Team makeup (solo, team, diversity of the team)', 'Experience with our product or tools', 'I would not filter', 'Other'] }),
  q14_text: q({ key: 'q14_text', kind: 'text', section: SEC.choosing, title: 'What should an event’s web page always show about its participants?', echoFrom: 'q13_filters', echoLead: 'In the previous question, you chose', titleAfter: 'What else should an event’s web page always show about its participants?', optional: true }),
  q15_useful: q({ key: 'q15_useful', kind: 'scale', section: SEC.idea, intro: 'TBC is a website where hackathon and community organisers list their events, and sponsors can browse them and propose partnerships. A sponsor could trade things like access to hiring, user or beta testing, or product exposure for sponsorship.', title: 'How useful would TBC be to you?', low: 'Not useful', high: 'Very useful', options: ['1', '2', '3', '4', '5'] }),
  q16_page: q({ key: 'q16_page', kind: 'multi', section: SEC.idea, title: 'What would an event’s web page need to show before you would consider sponsoring the event?', hint: ALL_APPLY, other: true, options: ['Audience profile (skills, universities, levels)', 'Attendee numbers', 'Event theme or topic', 'Purpose of the event (why it exists and who it is for)', 'Expected outcomes (for example projects built, hires, sign-ups)', 'Past sponsors and what they got', 'Results of past editions (for example hires, sign-ups, projects built)', 'Dates and venue', 'What each sponsorship tier includes and costs', 'References for the organisers', 'Other'] }),
  q17_payer: q({ key: 'q17_payer', kind: 'single', section: SEC.idea, title: 'If TBC charged a fee for using the website, who should pay that fee?', options: ['Organisers', 'Sponsors', 'Both', 'It should be free', 'Not sure'] }),
  q18_email: q({ key: 'q18_email', kind: 'email', section: SEC.idea, title: 'Would you be willing to join a 15-minute interview with the TBC team about sponsoring events?', hint: 'If yes, leave your email. Leaving your email is optional.', optional: true }),
  q19_text: q({ key: 'q19_text', kind: 'text', section: SEC.idea, title: 'Anything else we should know?', optional: true }),
  // Organiser path (draft, task F21.20): how organisers find sponsors today.
  o01_find: q({ key: 'o01_find', kind: 'multi', section: SEC.org, title: 'How do you find sponsors today?', hint: ALL_APPLY, options: ['Personal contacts or referrals', 'LinkedIn messages', 'Emails to companies', 'Going to events', 'Sponsor lists from other hackathons', 'Companies contact us', 'We have not looked yet'] }),
  o02_hard: q({ key: 'o02_hard', kind: 'multi', section: SEC.org, title: 'What is hardest about getting sponsors?', hint: 'Pick up to 2.', max: 2, options: ['Finding the right companies', 'Knowing what to ask for', 'Setting prices', 'Negotiating back and forth', 'Getting replies', 'Showing what sponsors get'] }),
  o03_edition: q({ key: 'o03_edition', kind: 'single', section: SEC.org, title: 'Which edition is the event you are organising?', options: ['I have not organised one yet', 'First edition', '2nd edition', '3rd edition', '4th edition or later'] }),
};

export type Answers = Record<string, string | string[]>;

/** The questions a person sees, in the questionnaire's order. Q4 = 0 goes to "why not", then to the last section. */
export function questionsFor(role: Role, answers: Answers): Question[] {
  if (role === 'organiser') return [Q.o01_find, Q.o02_hard, Q.o03_edition, Q.q18_email, Q.q19_text];
  const head = [Q.q01_role, Q.q02_size, Q.q03_authority, Q.q24_organised, Q.q04_freq];
  const tail = [Q.q15_useful, Q.q16_page, Q.q17_payer, Q.q18_email, Q.q19_text];
  if (answers['q04_freq'] === '0') return [...head, Q.q21_why_not, ...tail];
  return [...head, Q.q05_motive, Q.q06_channel, Q.q07_spend, Q.q08_satisf, Q.q09_text, Q.q10_factors, Q.q11_pains, Q.q22_wish, Q.q23_lead, Q.q20_tools, Q.q12_measure, Q.q13_filters, Q.q14_text, ...tail];
}

// Option texts that earlier versions showed. A page still open on an older version may send one of them: accept it as it is.
export const LEGACY_OPTIONS: Record<string, string[]> = {};
export const VERSION_RE = /^v\d{1,3}$/;

const list = Object.values(Q);
export const OPTIONS_BY_KEY: Record<string, string[]> = Object.fromEntries(list.filter((x) => x.options.length).map((x) => [x.key, x.options]));
export const MAX_BY_KEY: Record<string, number> = Object.fromEntries(list.filter((x) => x.max).map((x) => [x.key, x.max as number]));
export const OTHER_KEYS = list.filter((x) => x.other).map((x) => `${x.key}_other`);
export const TEXT_KEYS = new Set<string>([...list.filter((x) => x.kind === 'text').map((x) => x.key), ...OTHER_KEYS]);

// Column order of the export: the questionnaire's order (q18_email is the email column), organiser questions, then the "Other" texts.
export const EXPORT_KEYS = ['q01_role', 'q02_size', 'q03_authority', 'q24_organised', 'q04_freq', 'q21_why_not', 'q05_motive', 'q06_channel', 'q07_spend', 'q08_satisf', 'q09_text', 'q10_factors', 'q11_pains', 'q22_wish', 'q23_lead', 'q20_tools', 'q12_measure', 'q13_filters', 'q14_text', 'q15_useful', 'q16_page', 'q17_payer', 'q18_email', 'q19_text', 'o01_find', 'o02_hard', 'o03_edition', ...OTHER_KEYS];

/** For a follow-up question: what the person chose in the earlier question (without "I would not filter"; "Other" becomes their own words). */
export function echoOf(q: Question, answers: Answers): string[] {
  if (!q.echoFrom) return [];
  const picked = answers[q.echoFrom];
  const list = Array.isArray(picked) ? picked : typeof picked === 'string' ? [picked] : [];
  const other = typeof answers[`${q.echoFrom}_other`] === 'string' ? (answers[`${q.echoFrom}_other`] as string).trim() : '';
  return list.filter((x) => x !== 'I would not filter').map((x) => (x === 'Other' ? other : x.replace(/\s*\(.*\)\s*$/, ''))).filter(Boolean);
}
