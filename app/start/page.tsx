import Onboarding from '@/components/Onboarding';

export const metadata = { title: 'A few questions | TBC' };

export default async function StartPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return <Onboarding role={role} />;
}
