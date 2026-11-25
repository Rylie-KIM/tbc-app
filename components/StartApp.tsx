'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { EVENTS, EXAMPLE_PROPOSALS, ORGANISER_TYPES, type OrganiserType } from '@/data/events';

type Role = 'organiser' | 'sponsor';
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

type Step = { target: string; title: string; text: string };
const STEPS: Record<Role, Step[]> = {
  sponsor: [
    { target: 'switch', title: 'Switch sides here', text: 'Switch sides here to see TBC as an organiser too.' },
    { target: 'filters', title: 'Filter the events', text: 'Filter events by who organises them. More filters (goal, place, size) are coming.' },
    { target: 'event', title: 'Open an event', text: 'Open an event to see its packages. Everything here is example data.' },
  ],
  organiser: [
    { target: 'switch', title: 'Switch sides here', text: 'Switch sides here to see TBC as a sponsor too.' },
    { target: 'add', title: 'Add your event', text: 'This is where you will start with your prospectus, or try one of our samples. It is coming next.' },
    { target: 'proposals', title: 'Proposals', text: 'Sponsors’ proposals and your replies will appear here. These are examples.' },
  ],
};
const TASKS: Record<Role, { id: string; label: string }[]> = {
  sponsor: [{ id: 's-open', label: 'Open an example event' }, { id: 's-filter', label: 'Filter by who organises it' }, { id: 's-switch', label: 'Switch to the organiser side' }],
  organiser: [{ id: 'o-prop', label: 'Look at an example proposal' }, { id: 'o-add', label: 'See where you will add an event' }, { id: 'o-switch', label: 'Switch to the sponsor side' }],
};

export default function StartApp({ initialRole, welcome }: { initialRole?: string; welcome?: boolean }) {
  const [role, setRole] = useState<Role>('sponsor');
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [type, setType] = useState<OrganiserType | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [tour, setTour] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hideList, setHideList] = useState(false);

  useEffect(() => {
    const r = (initialRole === 'organiser' || initialRole === 'sponsor' ? initialRole : ls.get('tbc_role')) as Role | null;
    if (r === 'organiser' || r === 'sponsor') setRole(r);
    try { setDone(JSON.parse(ls.get('tbc_tasks') || '[]')); } catch { /* ignore */ }
    setHideList(ls.get('tbc_hidelist') === '1');
    setShowWelcome(!!welcome && ls.get('tbc_tour') !== 'seen');
    setReady(true);
  }, [initialRole, welcome]);

  const tick = useCallback((id: string) => setDone((d) => { if (d.includes(id)) return d; const n = [...d, id]; ls.set('tbc_tasks', JSON.stringify(n)); return n; }), []);
  const pick = (r: Role) => { if (r === role) return; ls.set('tbc_role', r); setRole(r); tick(r === 'organiser' ? 's-switch' : 'o-switch'); setOpen(null); if (tour !== null) setTour(0); };

  // tour highlight
  useEffect(() => {
    document.querySelectorAll('.tour-target').forEach((el) => el.classList.remove('tour-target'));
    if (tour === null) return;
    const el = document.querySelector(`[data-tour="${STEPS[role][tour]?.target}"]`);
    if (el) { el.classList.add('tour-target'); el.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  }, [tour, role]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && tour !== null) endTour(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);
  const endTour = () => { setTour(null); ls.set('tbc_tour', 'seen'); };
  const startTour = () => { setShowWelcome(false); ls.set('tbc_tour', 'seen'); setTour(0); };

  const events = EVENTS.filter((e) => !type || e.type === type);
  const steps = STEPS[role];
  const tasks = TASKS[role];

  if (!ready) return null;
  return (
    <>
      <header className="appbar">
        <div className="wrap">
          <Link href="/" className="logo-row" aria-label="TBC home"><img src="/brand/logo.png" alt="" style={{ height: 36 }} /><b>TBC.</b></Link>
          <div className="row">
            <button className="btn btn-ghost" style={{ padding: '8px 16px' }} onClick={() => setTour(0)}>Show me around</button>
            <div className="switch" data-tour="switch" role="group" aria-label="Trying as">
              <span className="lbl">Trying as:</span>
              <button className="spo" aria-pressed={role === 'sponsor'} onClick={() => pick('sponsor')}>Sponsor</button>
              <button className="org" aria-pressed={role === 'organiser'} onClick={() => pick('organiser')}>Organiser</button>
            </div>
          </div>
        </div>
      </header>

      <main className="wrap app">
        {showWelcome && (
          <section className="glass" aria-label="Welcome">
            <h2>You are ready to explore</h2>
            <p className="muted" style={{ margin: '8px 0 16px' }}>Everything here is example data, so try anything. Want a quick tour?</p>
            <div className="row">
              <button className="btn btn-primary" onClick={startTour}>Show me around</button>
              <button className="btn btn-ghost" onClick={() => { setShowWelcome(false); ls.set('tbc_tour', 'seen'); }}>I will explore myself</button>
            </div>
          </section>
        )}

        {!hideList && (
          <section className="glass" aria-label="Try these three things">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3>Try these three things</h3>
              <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '.85rem' }} onClick={() => { setHideList(true); ls.set('tbc_hidelist', '1'); }}>Hide</button>
            </div>
            <ul className="check" style={{ marginTop: 12 }}>
              {tasks.map((t) => (<li key={t.id} className={done.includes(t.id) ? 'done' : ''}><i aria-hidden>{done.includes(t.id) ? '✓' : ''}</i>{t.label}</li>))}
            </ul>
          </section>
        )}

        {role === 'sponsor' ? (
          <>
            <div>
              <span className="kicker">Sponsor view</span>
              <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', marginTop: 6 }}>Events to back</h1>
              <p className="muted" style={{ marginTop: 8 }}>Example events from five kinds of organiser. Open one to see its packages.</p>
            </div>
            <div className="filters" data-tour="filters" role="group" aria-label="Filter by who organises the event">
              <button className="fchip" aria-pressed={type === null} onClick={() => setType(null)}>All ({EVENTS.length})</button>
              {ORGANISER_TYPES.map((t) => (
                <button key={t} className="fchip" aria-pressed={type === t} onClick={() => { setType(type === t ? null : t); tick('s-filter'); }}>{t} ({EVENTS.filter((e) => e.type === t).length})</button>
              ))}
            </div>
            <div className="grid">
              {events.map((e, i) => (
                <article key={e.id} className="glass ecard" {...(i === 0 ? { 'data-tour': 'event' } : {})}>
                  <div className="row"><span className="chip warn">Example</span><span className="tag">{e.type}</span></div>
                  <h3>{e.name}</h3>
                  <p className="muted">{e.blurb}</p>
                  <p className="small">{e.size} people · {e.place} · Goal: {e.goal} · {e.price}</p>
                  <div className="row"><button className="btn btn-ghost" aria-expanded={open === e.id} onClick={() => { setOpen(open === e.id ? null : e.id); tick('s-open'); }}>{open === e.id ? 'Hide packages' : 'See packages'}</button></div>
                  {open === e.id && (
                    <div className="tiers">
                      {e.tiers.map((t) => (<div className="tier" key={t.name}><span><b>{t.name}</b> · {t.gets}</span><b>{t.price}</b></div>))}
                      <button className="btn btn-primary" disabled>Send a proposal (coming next)</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="kicker">Organiser view</span>
              <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', marginTop: 6 }}>Find sponsors for your event</h1>
              <p className="muted" style={{ marginTop: 8 }}>List your event, set your packages and talk to sponsors in one place. This preview shows how it will look.</p>
            </div>
            <section className="glass" data-tour="add">
              <h3>Add your event</h3>
              <p className="muted" style={{ margin: '8px 0 14px' }}>Start with your prospectus, or try one of our samples. We read the file, you check it.</p>
              <div className="row"><button className="btn btn-primary" onClick={() => tick('o-add')}>Add an event (coming next)</button><span className="chip warn">Not available yet</span></div>
            </section>
            <section className="glass" data-tour="proposals">
              <h3>Example proposals</h3>
              <div style={{ marginTop: 8 }}>
                {EXAMPLE_PROPOSALS.map((p) => (
                  <div className="statusrow" key={p.sponsor}>
                    <span><b>{p.sponsor}</b><br /><span className="small">{p.pack}</span></span>
                    <span className="row"><span className={`chip ${p.tone}`}>{p.status}</span><button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '.85rem' }} onClick={() => tick('o-prop')}>Open</button></span>
                  </div>
                ))}
              </div>
              <p className="small" style={{ marginTop: 8 }}>These are examples. Nothing here is sent to real people.</p>
            </section>
          </>
        )}
        <footer className="foot">TBC is an early preview. Everything on this page is example data. <Link href="/privacy">What we store</Link></footer>
      </main>

      {tour !== null && (
        <div className="tour" role="dialog" aria-label="Guided tour" aria-live="polite">
          <span className="small" style={{ color: '#b9cbc0' }}>Step {tour + 1} of {steps.length}</span>
          <h3>{steps[tour].title}</h3>
          <p>{steps[tour].text}</p>
          <div className="row">
            <button className="btn btn-ghost-dark" onClick={() => setTour(Math.max(0, tour - 1))} disabled={tour === 0}>Back</button>
            {tour < steps.length - 1
              ? <button className="btn btn-lime" onClick={() => setTour(tour + 1)} autoFocus>Next</button>
              : <button className="btn btn-lime" onClick={endTour} autoFocus>Done</button>}
            <button className="btn btn-ghost-dark" onClick={endTour}>Skip</button>
          </div>
        </div>
      )}
    </>
  );
}
