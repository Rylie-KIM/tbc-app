import StartApp from '@/components/StartApp';

export const metadata = { title: 'Explore | TBC' };

export default async function AppPage({ searchParams }: { searchParams: Promise<{ role?: string; welcome?: string; switched?: string }> }) {
  const { role, welcome, switched } = await searchParams;
  return <StartApp initialRole={role} welcome={welcome === '1'} switched={switched} />;
}
