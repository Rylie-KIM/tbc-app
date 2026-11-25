import StartApp from '@/components/StartApp';

export const metadata = { title: 'Explore | TBC' };

export default async function AppPage({ searchParams }: { searchParams: Promise<{ role?: string; welcome?: string }> }) {
  const { role, welcome } = await searchParams;
  return <StartApp initialRole={role} welcome={welcome === '1'} />;
}
