'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EVENTS, EXAMPLE_PROPOSALS, GOALS, ORGANISER_TYPES, SIZE_BANDS, factRows, type ExampleEvent } from '@/data/events';

type Role = 'organiser' | 'sponsor';
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

type Step = { target: string; title: string; text: string };
const STEPS: Record<Role, Step[]> = {
  sponsor: [
    { target: 'switch', title: 'Switch sides here', text: 'Switch sides here to see TBC as an organiser too.' },
    { target: 'filters', title: 'Search and filter', text: 'Search by keyword, or open Filters to narrow events by who organises them, the sponsor goal and the size.' },
    { target: 'event', title: 'Open an event', text: 'Each card is a summary. Open an event for the full details, its packages and the prospectus. Everything here is example data.' },
  ],
  organiser: [
    { target: 'switch', title: 'Switch sides here', text: 'Switch sides here to see TBC as a sponsor too.' },
    { target: 'add', title: 'Add your event', text: 'This is where you will start with your prospectus, or try one of our samples. It is coming soon.' },
    { target: 'proposals', title: 'Proposals', text: 'Sponsors’ proposals and your replies will appear here. These are examples.' },
  ],
};
const TASKS: Record<Role, { id: string; label: string }[]> = {
  sponsor: [{ id: 's-open', label: 'Open an example event' }, { id: 's-filter', label: 'Search or filter the events' }, { id: 's-switch', label: 'Switch to the organiser side' }],
  organiser: [{ id: 'o-prop', label: 'Look at an example proposal' }, { id: 'o-add', label: 'See where you will add an event' }, { id: 'o-switch', label: 'Switch to the sponsor side' }],
};
const TYPE_DOT: Record<string, string> = { 'Student society': '#47ff00', 'University or careers service': '#04a56a', 'Company-hosted': '#0b0f0d', 'Community or non-profit': '#69ff93', 'Commercial organiser': '#d9a21a' };

const matches = (e: ExampleEvent, text: string) => {
  const hay = [e.name, e.blurb, e.place, e.type, e.goal, e.audience, e.format, e.organiser, e.tracks.join(' ')].join(' ').toLowerCase();
  return text.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

export default function StartApp({ initialRole, welcome, switched }: { initialRole?: string; welcome?: boolean; switched?: string }) {
  const [role, setRole] = useState<Role>('sponsor');
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [panel, setPanel] = useState(false);
  // a click anywhere outside the Filters button and its panel closes the panel
  useEffect(() => {
    if (!panel) return;
    const close = (e: MouseEvent) => { if (!(e.target as Element).closest('#filterpanel, .btn-filters')) setPanel(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [panel]);
  const [types, setTypes] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [tour, setTour] = useState<number | null>(null);
  const [tourDone, setTourDone] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hideList, setHideList] = useState(false);
  const [toast, setToast] = useState('');

  const say = (msg: string, ms = 4000) => { setToast(msg); setTimeout(() => setToast(''), ms); };

  useEffect(() => {
    const r = (initialRole === 'organiser' || initialRole === 'sponsor' ? initialRole : ls.get('tbc_role')) as Role | null;
    if (r === 'organiser' || r === 'sponsor') setRole(r);
    try { setDone(JSON.parse(ls.get('tbc_tasks') || '[]')); } catch { /* ignore */ }
    setHideList(ls.get('tbc_hidelist') === '1');
    if (new URLSearchParams(window.location.search).get('tour') === 'again') { ls.set('tbc_tour_done', ''); ls.set('tbc_tour', ''); } // /app?tour=again brings the guide button back
    setTourDone(ls.get('tbc_tour_done') === '1');
    setShowWelcome(!!welcome && ls.get('tbc_tour') !== 'seen' && ls.get('tbc_tour_done') !== '1');
    if (switched === 'organiser' || switched === 'sponsor') say(`Switched to ${switched}.`);
    setReady(true);
  }, [initialRole, welcome, switched]);

  const tick = useCallback((id: string) => setDone((d) => { if (d.includes(id)) return d; const n = [...d, id]; ls.set('tbc_tasks', JSON.stringify(n)); return n; }), []);
  const pick = (r: Role) => { if (r === role) return; ls.set('tbc_role', r); setRole(r); tick(r === 'organiser' ? 's-switch' : 'o-switch'); if (tour !== null) setTour(0); say(`Switched to ${r}.`); };

  useEffect(() => {
    document.querySelectorAll('.tour-target').forEach((el) => el.classList.remove('tour-target'));
    if (tour === null) return;
    const el = document.querySelector(`[data-tour="${STEPS[role][tour]?.target}"]`);
    if (el) { el.classList.add('tour-target'); el.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  }, [tour, role]);
  const endTour = (finished = false) => { setTour(null); ls.set('tbc_tour', 'seen'); if (finished) { ls.set('tbc_tour_done', '1'); setTourDone(true); setShowWelcome(false); } };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && tour !== null) endTour(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);
  const startTour = () => { setShowWelcome(false); ls.set('tbc_tour', 'seen'); setTour(0); };

  const toggle = (set: (f: (v: string[]) => string[]) => void, v: string) => { set((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])); tick('s-filter'); };
  const nFilters = types.length + goals.length + sizes.length;
  const events = useMemo(() => EVENTS.filter((e) =>
    (!text.trim() || matches(e, text)) &&
    (!types.length || types.includes(e.type)) &&
    (!goals.length || goals.includes(e.goal)) &&
    (!sizes.length || SIZE_BANDS.some((b) => sizes.includes(b.id) && b.test(e.attendance)))), [text, types, goals, sizes]);
  const clearAll = () => { setTypes([]); setGoals([]); setSizes([]); setText(''); };
  const steps = STEPS[role];
  const tasks = TASKS[role];

  if (!ready) return null;
  return (
    <>
      <header className="appbar">
        <div className="wrap">
          <Link href="/" className="logo-row" aria-label="TBC home"><img src="/brand/logo.png" alt="" /><b>TBC.</b></Link>
          <div className="row bar-actions">
            {!tourDone && <button className="btn btn-tour" onClick={() => setTour(0)}><span className="spark" aria-hidden>✦</span> Show me around</button>}
            <div className="switch" data-tour="switch" role="group" aria-label="Trying as">
              <span className="lbl">Trying as:</span>
              <button className="spo" aria-pressed={role === 'sponsor'} onClick={() => pick('sponsor')}>Sponsor</button>
              <button className="org" aria-pressed={role === 'organiser'} onClick={() => pick('organiser')}>Organiser</button>
            </div>
          </div>
        </div>
      </header>

      <main className="wrap app">
        {showWelcome && !tourDone && (
          <section className="glass" aria-label="Welcome">
            <h2>You are ready to explore</h2>
            <p className="muted" style={{ margin: '8px 0 16px' }}>Everything here is example data, so try anything. Want a quick tour?</p>
            <div className="row">
              <button className="btn btn-tour" onClick={startTour}><span className="spark" aria-hidden>✦</span> Show me around</button>
              <button className="btn btn-ghost" onClick={() => { setShowWelcome(false); ls.set('tbc_tour', 'seen'); }}>I will explore myself</button>
            </div>
          </section>
        )}

        <div className="pilllabel"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M8 1.5 13 3.4v4.2c0 3-2 5.3-5 6.9-3-1.6-5-3.9-5-6.9V3.4z" fill="currentColor" opacity=".85" /></svg> Early preview: everything here is example data</div>
        <section className="bento" aria-label="Overview">
          <div className="tile tile-grad" aria-hidden><img src="/brand/logo-white.png" alt="" /></div>
          <a className="tile tile-glass" href={role === 'sponsor' ? '#events' : '#proposals'}>
            <span className="num">+{role === 'sponsor' ? EVENTS.length : EXAMPLE_PROPOSALS.length}</span>
            <span className="tilelabel"><span>{role === 'sponsor' ? 'Example events' : 'Example proposals'}</span><span aria-hidden>↗</span></span>
          </a>
          {!hideList ? (
            <div className="tile tile-lime" aria-label="Try these three things">
              <div className="tilelabel"><b>Try these three things</b><button className="btn btn-ghost btn-small" onClick={() => { setHideList(true); ls.set('tbc_hidelist', '1'); }}>Hide</button></div>
              <div className="num">{tasks.filter((t) => done.includes(t.id)).length}<span className="of">/3</span></div>
              <div className="thin" aria-hidden><i style={{ width: `${(tasks.filter((t) => done.includes(t.id)).length / 3) * 100}%` }} /></div>
              <ul className="check small-check">
                {tasks.map((t) => (<li key={t.id} className={done.includes(t.id) ? 'done' : ''}><i aria-hidden>{done.includes(t.id) ? '✓' : ''}</i>{t.label}</li>))}
              </ul>
            </div>
          ) : null}
          {role === 'sponsor' ? (
            <div className="tile tile-black">
              <span className="num">+{ORGANISER_TYPES.length}</span>
              <span className="tilelabel"><span>Kinds of organiser to choose from</span><span className="glowdot" aria-hidden /></span>
            </div>
          ) : null}
        </section>

        {role === 'sponsor' ? (
          <>
            <div>
              <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>Choose events to sponsor</h1>
              <p className="muted" style={{ marginTop: 8 }}>These cards are summaries of example events. Open an event for its full details, packages and prospectus.</p>
            </div>

            <div id="events" className="searchbox" data-tour="filters">
              <div className="searchrow">
                <div className="searchfield">
                  <input className="input search" type="search" aria-label="Search events by keyword" placeholder="Search by keyword, for example AI, London, hire" value={text} onChange={(e) => { setText(e.target.value); tick('s-filter'); }} />
                  {(nFilters > 0 || text) && <button className="clearin" onClick={clearAll}>Clear all</button>}
                </div>
                <span className="filterwrap">
                  <button className="btn btn-ghost btn-filters" aria-expanded={panel} aria-controls="filterpanel" onClick={() => setPanel(!panel)}>
                    Filters{nFilters ? <span className="badge">{nFilters}</span> : null}
                  </button>
                </span>
              </div>
              {panel && (
                <div id="filterpanel" className="fpanel">
                  <fieldset><legend>Who organises it</legend><div className="filters">{ORGANISER_TYPES.map((t) => (<button key={t} className="fchip" aria-pressed={types.includes(t)} onClick={() => toggle(setTypes, t)}>{t}</button>))}</div></fieldset>
                  <fieldset><legend>Sponsor goal</legend><div className="filters">{GOALS.map((g) => (<button key={g} className="fchip" aria-pressed={goals.includes(g)} onClick={() => toggle(setGoals, g)}>{g}</button>))}</div></fieldset>
                  <fieldset><legend>Size</legend><div className="filters">{SIZE_BANDS.map((b) => (<button key={b.id} className="fchip" aria-pressed={sizes.includes(b.id)} onClick={() => toggle(setSizes, b.id)}>{b.label}</button>))}</div></fieldset>
                </div>
              )}
              {nFilters > 0 && (
                <div className="active">
                  {[...types, ...goals, ...sizes.map((s) => SIZE_BANDS.find((b) => b.id === s)?.label ?? s)].map((v) => <span className="tag" key={v}>{v}</span>)}
                </div>
              )}
              <p className="small" role="status">{events.length} of {EVENTS.length} example events</p>
            </div>

            {events.length === 0 ? (
              <section className="glass"><h3>No events match</h3><p className="muted" style={{ margin: '6px 0 12px' }}>Try fewer words or clear the filters.</p><button className="btn btn-primary" onClick={clearAll}>Clear all</button></section>
            ) : (
              <div className="grid">
                {events.map((e, i) => (
                  <article key={e.id} className="card ecard" {...(i === 0 ? { 'data-tour': 'event' } : {})}>
                    <div className="cover">
                      <img src={`/events/${e.id}.svg`} alt={`Illustration for ${e.name} (example)`} loading="lazy" />
                      <span className="badge-ex"><i aria-hidden /> Example</span>
                    </div>
                    <div className="ebody">
                      <span className="typeline"><i style={{ background: TYPE_DOT[e.type] }} aria-hidden />{e.type}</span>
                      <h3>{e.name}</h3>
                      <p className="muted">{e.blurb}</p>
                      <div className="sumlabel">Summary</div>
                      <dl className="facts">
                        {factRows(e).filter(([k]) => ['Attendance', 'Where', 'Main sponsor goal', 'Packages'].includes(k)).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
                      </dl>
                      <div className="bottom"><Link className="btn btn-spark" href={`/app/events/${e.id}`}>See details and packages <span aria-hidden>→</span></Link></div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>Find sponsors for your event</h1>
              <p className="muted" style={{ marginTop: 8 }}>List your event, set your packages and talk to sponsors in one place. This preview shows how it will look.</p>
            </div>
            <section className="glass" data-tour="add">
              <h3>Add your event</h3>
              <p className="muted" style={{ margin: '8px 0 14px' }}>Start with your prospectus, or try one of our samples. We read the file, you check it.</p>
              <div className="row"><button className="btn btn-tour" onClick={() => tick('o-add')}><span className="spark" aria-hidden>✦</span> Add an event (coming soon)</button></div>
            </section>
            <section id="proposals" className="glass" data-tour="proposals">
              <h3>Example proposals</h3>
              <div style={{ marginTop: 8 }}>
                {EXAMPLE_PROPOSALS.map((p) => (
                  <div className="statusrow" key={p.sponsor}>
                    <span><b>{p.sponsor}</b><br /><span className="small">{p.pack}</span></span>
                    <span className="row"><span className={`chip ${p.tone}`}>{p.status}</span><button className="btn btn-ghost btn-small" onClick={() => tick('o-prop')}>Open</button></span>
                  </div>
                ))}
              </div>
              <p className="small" style={{ marginTop: 8 }}>These are examples. Nothing here is sent to real people.</p>
            </section>
          </>
        )}
        <footer className="foot">TBC is an early preview. Everything on this page is example data. <Link href="/privacy">What we store</Link></footer>
      </main>

      {toast && <div className="toast" role="status" aria-live="polite"><i aria-hidden /> {toast}</div>}

      {tour !== null && (
        <div className="tour" role="dialog" aria-label="Guided tour" aria-live="polite">
          <span className="small" style={{ color: '#b9cbc0' }}>Step {tour + 1} of {steps.length}</span>
          <h3>{steps[tour].title}</h3>
          <p>{steps[tour].text}</p>
          <div className="row">
            <button className="btn btn-ghost-dark" onClick={() => setTour(Math.max(0, tour - 1))} disabled={tour === 0}>Back</button>
            {tour < steps.length - 1
              ? <button className="btn btn-lime" onClick={() => setTour(tour + 1)} autoFocus>Next</button>
              : <button className="btn btn-lime" onClick={() => endTour(true)} autoFocus>Done</button>}
            <button className="btn btn-ghost-dark" onClick={() => endTour()}>Skip</button>
          </div>
        </div>
      )}
    </>
  );
}
