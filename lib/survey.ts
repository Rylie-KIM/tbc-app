// Questions of the onboarding survey (task F21.1). Keys follow the numbering of the
// questionnaire in plan/research/sponsor-questionnaire.md so the export matches the analysis plan.
export type Role = 'organiser' | 'sponsor';

export type Question = {
  key: string;
  kind: 'single' | 'multi';
  title: string;
  hint?: string;
  options: string[];
  max?: number;
};

export const SPONSOR_Q1: Question = {
  key: 'q01_role',
  kind: 'single',
  title: 'Which best describes your role?',
  options: [
    'Recruiting / talent acquisition',
    'Developer relations / developer advocate',
    'Marketing / brand / community',
    'University relations / early careers',
    'Founder or startup team member',
    'Other',
  ],
};

export const SPONSOR_Q4: Question = {
  key: 'q04_freq',
  kind: 'single',
  title: 'In the last 2 years, how many hackathons or student events has your organisation sponsored?',
  hint: 'Paid for, or gave prizes, credits or mentors to. Do not count events you organised yourselves.',
  options: ['0', '1-2', '3-5', '6 or more'],
};

export const SPONSOR_Q21: Question = {
  key: 'q21_why_not',
  kind: 'multi',
  title: 'What has stopped you from sponsoring so far?',
  hint: 'Select all that apply.',
  options: [
    'No budget',
    'I did not find an event that fits',
    'I am not sure it is worth the money',
    'No time to look for events',
    'It is not part of my role',
    'Nobody has asked us',
  ],
};

export const SPONSOR_Q5: Question = {
  key: 'q05_motive',
  kind: 'multi',
  title: 'Why did you sponsor the most recent one?',
  hint: 'Select all that apply.',
  options: [
    'Hire interns or graduates',
    'Get people to try our product or API and give feedback',
    'Brand awareness among students or developers',
    'Find beta testers or early users',
    'Support the community or local ecosystem',
  ],
};

export const SPONSOR_Q20: Question = {
  key: 'q20_tools',
  kind: 'multi',
  title: 'How do you find and keep track of events you might sponsor?',
  hint: 'Select all that apply.',
  options: [
    'Event listing sites (for example Luma, Devpost, MLH)',
    'LinkedIn',
    'Emails from organisers',
    'A spreadsheet or Notion list',
    'A CRM (for example HubSpot, Salesforce)',
    'Personal network',
    'I do not keep track',
  ],
};

export const SPONSOR_Q24: Question = {
  key: 'q24_organised',
  kind: 'single',
  title: 'If your organisation has organised a hackathon or student event itself, which edition was the most recent one?',
  options: ['We have not organised one', 'It was our first edition', '2nd edition', '3rd edition', '4th edition or later', 'Not sure'],
};

// Organiser path (draft, task F21.20): about how organisers find sponsors today.
export const ORGANISER_QS: Question[] = [
  {
    key: 'o01_find',
    kind: 'multi',
    title: 'How do you find sponsors today?',
    hint: 'Select all that apply.',
    options: [
      'Personal contacts or referrals',
      'LinkedIn messages',
      'Emails to companies',
      'Going to events',
      'Sponsor lists from other hackathons',
      'Companies contact us',
      'We have not looked yet',
    ],
  },
  {
    key: 'o02_hard',
    kind: 'multi',
    max: 2,
    title: 'What is hardest about getting sponsors?',
    hint: 'Pick up to 2.',
    options: [
      'Finding the right companies',
      'Knowing what to ask for',
      'Setting prices',
      'Negotiating back and forth',
      'Getting replies',
      'Showing what sponsors get',
    ],
  },
  {
    key: 'o03_edition',
    kind: 'single',
    title: 'Which edition is your event?',
    options: ['I have not organised one yet', 'First edition', '2nd edition', '3rd edition', '4th edition or later'],
  },
];

export type Answers = Record<string, string | string[]>;

/** The questions a person sees, given their role and the answers so far (Q4 = 0 goes to "why not"). */
export function questionsFor(role: Role, answers: Answers): Question[] {
  if (role === 'organiser') return ORGANISER_QS;
  const never = answers['q04_freq'] === '0';
  return [SPONSOR_Q1, SPONSOR_Q4, never ? SPONSOR_Q21 : SPONSOR_Q5, SPONSOR_Q20, SPONSOR_Q24];
}

const ALL: Question[] = [SPONSOR_Q1, SPONSOR_Q4, SPONSOR_Q21, SPONSOR_Q5, SPONSOR_Q20, SPONSOR_Q24, ...ORGANISER_QS];
export const OPTIONS_BY_KEY: Record<string, string[]> = Object.fromEntries(ALL.map((q) => [q.key, q.options]));

// Column order of the export: the questionnaire's order, organiser questions last.
export const EXPORT_KEYS = ['q01_role', 'q24_organised', 'q04_freq', 'q21_why_not', 'q05_motive', 'q20_tools', 'o01_find', 'o02_hard', 'o03_edition'];
