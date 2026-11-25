import Link from 'next/link';
import { notFound } from 'next/navigation';
import DetailBar from '@/components/DetailBar';
import { EVENTS, eventById, factRows } from '@/data/events';

export function generateStaticParams() { return EVENTS.map((e) => ({ id: e.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const e = eventById((await params).id);
  return { title: e ? `${e.name} (example) | TBC` : 'Event | TBC' };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const e = eventById((await params).id);
  if (!e) notFound();
  const pdf = `/prospectuses/${e.id}.pdf`;
  return (
    <>
      <DetailBar />
      <main className="wrap app">
        <Link href="/app" className="back">← Back to events</Link>
        <div className="cover big">
          <img src={`/events/${e.id}.svg`} alt={`Illustration for ${e.name} (example)`} />
          <span className="badge-ex"><i aria-hidden /> Example</span>
        </div>
        <div>
          <span className="typeline"><i aria-hidden />{e.type}</span>
          <h1 style={{ fontSize: 'clamp(1.9rem,4.5vw,2.9rem)', marginTop: 6 }}>{e.name}</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: '62ch' }}>{e.blurb}</p>
          <p className="small" style={{ marginTop: 8 }}>This is an example event with invented details. The cards on the events page are summaries; this page has everything.</p>
        </div>

        <section className="glass">
          <h2>Event facts</h2>
          <dl className="facttable">
            {factRows(e).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
            <div><dt>Tracks</dt><dd>{e.tracks.join(', ')}</dd></div>
            <div><dt>Organised by</dt><dd>{e.organiser}</dd></div>
          </dl>
        </section>

        <section>
          <h2>Packages</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {e.tiers.map((t, i) => (
              <article key={t.name} className={`glass tiercard ${i === 1 ? 'feat' : ''}`}>
                <span className="chip">{t.name}</span>
                <div className="price">{t.price}</div>
                <ul>{t.perks.map((p) => (<li key={p}>{p}</li>))}</ul>
              </article>
            ))}
          </div>
          <div className="row" style={{ marginTop: 16 }}><button className="btn btn-primary" disabled>Send a proposal (coming soon)</button></div>
        </section>

        <section className="glass">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div><h2>Prospectus</h2><p className="muted" style={{ marginTop: 4 }}>The organiser&apos;s own document: 2 pages, PDF.</p></div>
            <div className="row">
              <a className="btn btn-spark" href={pdf} download={`${e.name.replace(/\s+/g, '-')}-prospectus-example.pdf`}>Download the PDF</a>
              <a className="btn btn-ghost" href={pdf} target="_blank" rel="noopener noreferrer">Open in a new tab</a>
            </div>
          </div>
          <object className="pdfview" data={`${pdf}#toolbar=0`} type="application/pdf" aria-label={`Prospectus of ${e.name}`}>
            <p className="muted">Your browser cannot show the PDF here. <a href={pdf}>Download it instead</a>.</p>
          </object>
        </section>
        <footer className="foot">TBC is an early preview. Everything on this page is example data. <Link href="/privacy">What we store</Link></footer>
      </main>
    </>
  );
}
