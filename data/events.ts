// Twelve invented example events (task F24). Every one is shown with an "Example" label (F18);
// no real person or company appears. The facts use the same categories for every event.
import raw from './events.json';

export type OrganiserType = 'Student society' | 'University or careers service' | 'Company-hosted' | 'Community or non-profit' | 'Commercial organiser';
export const ORGANISER_TYPES: OrganiserType[] = ['Student society', 'University or careers service', 'Company-hosted', 'Community or non-profit', 'Commercial organiser'];
export const GOALS = ['Hire', 'Product feedback', 'Brand'] as const;
export const SIZE_BANDS = [
  { id: 'small', label: 'Under 100 people', test: (n: number) => n < 100 },
  { id: 'medium', label: '100 to 250 people', test: (n: number) => n >= 100 && n <= 250 },
  { id: 'large', label: 'Over 250 people', test: (n: number) => n > 250 },
] as const;

export type Tier = { name: string; price: string; perks: string[] };
export type ExampleEvent = {
  id: string; name: string; type: OrganiserType; attendance: number; place: string; format: string; audience: string;
  goal: string; price: string; edition: string; blurb: string; tracks: string[]; organiser: string; palette: number; tiers: Tier[];
};
export const EVENTS = raw as ExampleEvent[];
export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

/** The same rows for every event, in the same order (summary on the cards, full table on the event page). */
export const factRows = (e: ExampleEvent): [string, string][] => [
  ['Organiser type', e.type],
  ['Attendance', `${e.attendance} people`],
  ['Where', e.place],
  ['Format', e.format],
  ['Audience', e.audience],
  ['Main sponsor goal', e.goal],
  ['Packages', e.price],
  ['Edition', e.edition],
];

export const EXAMPLE_PROPOSALS = [
  { sponsor: 'Northlight Software (example)', pack: 'Gold package', status: 'Counter-offer', tone: 'warn' },
  { sponsor: 'Brightpath Bank (example)', pack: 'Platinum package', status: 'Confirmed', tone: 'ok' },
  { sponsor: 'Quill Labs (example)', pack: 'Bronze package', status: 'Requested', tone: '' },
];
