// Twelve invented example events (task F24 table), used until real events exist.
// Every one is shown with an "Example" label (F18). No real person or company appears.
export type OrganiserType = 'Student society' | 'University or careers service' | 'Company-hosted' | 'Community or non-profit' | 'Commercial organiser';
export const ORGANISER_TYPES: OrganiserType[] = ['Student society', 'University or careers service', 'Company-hosted', 'Community or non-profit', 'Commercial organiser'];

export type ExampleEvent = { id: string; name: string; type: OrganiserType; size: number; place: string; goal: string; price: string; blurb: string; tiers: { name: string; price: string; gets: string }[] };

const t = (a: string, b: string, c: string) => [
  { name: 'Bronze', price: a, gets: 'Logo on the event page and social posts' },
  { name: 'Gold', price: b, gets: 'Set a challenge track and a prize' },
  { name: 'Platinum', price: c, gets: 'Co-branding and an opening-ceremony slot' },
];

export const EVENTS: ExampleEvent[] = [
  { id: 'e1', name: 'Two Cities Hack', type: 'Student society', size: 350, place: 'Two cities, one weekend', goal: 'Hire', price: '£500 to £5,000', blurb: 'A 24-hour data and AI hackathon across two campuses, with students from several courses.', tiers: t('£500', '£2,000', '£5,000') },
  { id: 'e2', name: 'Campus Build Night', type: 'Student society', size: 40, place: 'One campus, one evening', goal: 'Product feedback', price: '£200 to £800', blurb: 'A small evening build session where students try new tools and give feedback.', tiers: t('£200', '£500', '£800') },
  { id: 'e3', name: 'Health Data Jam', type: 'Student society', size: 90, place: 'Edinburgh', goal: 'Brand', price: '£300 to £1,500', blurb: 'Students work with open health datasets over a weekend.', tiers: t('£300', '£800', '£1,500') },
  { id: 'e4', name: 'Careers Service AI Challenge', type: 'University or careers service', size: 120, place: 'Bristol', goal: 'Hire', price: '£1,000 to £3,000', blurb: 'An employer-focused challenge day run by a university careers service.', tiers: t('£1,000', '£2,000', '£3,000') },
  { id: 'e5', name: 'Research Data Hack', type: 'University or careers service', size: 80, place: 'Manchester', goal: 'Brand', price: '£300 to £1,500', blurb: 'A department-led hack on research data, with academic data providers.', tiers: t('£300', '£800', '£1,500') },
  { id: 'e6', name: 'FinHack London', type: 'Company-hosted', size: 200, place: 'London', goal: 'Hire', price: '£2,000 to £10,000', blurb: 'A bank hosts a fintech hackathon and invites partners to co-sponsor.', tiers: t('£2,000', '£5,000', '£10,000') },
  { id: 'e7', name: 'Cloud Native Weekend', type: 'Company-hosted', size: 100, place: 'Hybrid, London', goal: 'Product feedback', price: 'Credits and prizes', blurb: 'A developer-tools company hosts a weekend and invites partner tracks.', tiers: t('Credits', 'Credits and a prize', 'A named track') },
  { id: 'e8', name: 'Open Source Weekend', type: 'Community or non-profit', size: 150, place: 'Online and Manchester', goal: 'Product feedback', price: 'Mostly in-kind', blurb: 'A community weekend to build with open-source tools; credits matter more than cash.', tiers: t('Credits', 'Credits and mentors', 'A named track') },
  { id: 'e9', name: 'Code for Good Hackathon', type: 'Community or non-profit', size: 100, place: 'Bristol', goal: 'Brand', price: '£250 to £2,000', blurb: 'Teams build tools for local charities over one weekend.', tiers: t('£250', '£1,000', '£2,000') },
  { id: 'e10', name: 'Design x Code Weekend', type: 'Community or non-profit', size: 60, place: 'London', goal: 'Brand', price: '£300 to £1,200', blurb: 'Designers and developers pair up to build small products.', tiers: t('£300', '£700', '£1,200') },
  { id: 'e11', name: 'Green Code Hack', type: 'Commercial organiser', size: 150, place: 'London', goal: 'Brand', price: '£500 to £3,000', blurb: 'A sustainability hackathon run by an events company.', tiers: t('£500', '£1,500', '£3,000') },
  { id: 'e12', name: 'AI Build Sprint', type: 'Commercial organiser', size: 400, place: 'Online', goal: 'Hire', price: '£1,500 to £7,500', blurb: 'A large online sprint run by an events company with many sponsor tracks.', tiers: t('£1,500', '£4,000', '£7,500') },
];

export const EXAMPLE_PROPOSALS = [
  { sponsor: 'Northlight Software (example)', pack: 'Gold package', status: 'Counter-offer', tone: 'warn' },
  { sponsor: 'Brightpath Bank (example)', pack: 'Platinum package', status: 'Confirmed', tone: 'ok' },
  { sponsor: 'Quill Labs (example)', pack: 'Bronze package', status: 'Requested', tone: '' },
];
