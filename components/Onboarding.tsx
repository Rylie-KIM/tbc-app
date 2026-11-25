'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { questionsFor, type Answers, type Question, type Role } from '@/lib/survey';

type Job = { path: string; body: Record<string, unknown> };
type SaveState = 'idle' | 'saving' | 'saved' | 'retry';
const QUEUE_KEY = 'tbc_queue';

const readLS = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const writeLS = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode: the page still works */ } };
const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`);

export default function Onboarding({ role: roleParam }: { role?: string }) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(roleParam === 'organiser' || roleParam === 'sponsor' ? roleParam : null);
  const started = useRef(false);
  const [step, setStep] = useState(0); // 0..2 intro screens, then questions, then the email step
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [save, setSave] = useState<SaveState>('idle');
  const [finishing, setFinishing] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const anon = useRef('');
  const queue = useRef<Job[]>([]);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = useMemo(() => (role ? questionsFor(role, answers) : []), [role, answers]);
  const total = questions.length + 1;

  useEffect(() => {
    let a = readLS('tbc_anon');
    if (!a) { a = newId(); writeLS('tbc_anon', a); }
    anon.current = a;
    try { queue.current = JSON.parse(readLS(QUEUE_KEY) || '[]'); } catch { queue.current = []; }
    if (role) writeLS('tbc_role', role);
    if (queue.current.length) void flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistQueue = () => writeLS(QUEUE_KEY, JSON.stringify(queue.current));

  // F21.12: send jobs in order; "Saved" shows only after the server confirmed; failures retry.
  const flush = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setSave('saving');
    while (queue.current.length) {
      const job = queue.current[0];
      try {
        const res = await fetch(job.path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(job.body) });
        if (res.ok || res.status === 400 || res.status === 404) { queue.current.shift(); persistQueue(); if (res.status === 404) { /* session gone: nothing to update */ } }
        else throw new Error(String(res.status));
      } catch {
        busy.current = false;
        setSave('retry');
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), 3000);
        return;
      }
    }
    busy.current = false;
    setSave('saved');
  }, []);

  const enqueue = (path: string, body: Record<string, unknown>) => {
    queue.current.push({ path, body: { anonId: anon.current, ...body } });
    persistQueue();
    void flush();
  };

  const begin = () => {
    if (!role) return;
    enqueue('/api/survey/start', { role });
    started.current = true;
    setStep(3);
  };

  // The role switch is visible from the first screen (owner request 2026-11-25): changing side keeps the
  // answers already given, updates the stored side, and returns to the "why we are asking" screen because
  // the questions differ between the two sides.
  const switchRole = (r: Role) => {
    if (r === role) return;
    setRole(r);
    writeLS('tbc_role', r);
    if (started.current) enqueue('/api/survey/start', { role: r });
    if (step >= 3) setStep(2);
  };

  const choose = (q: Question, opt: string) => {
    let value: string | string[];
    if (q.kind === 'single') value = opt;
    else {
      const cur = (answers[q.key] as string[] | undefined) ?? [];
      if (cur.includes(opt)) value = cur.filter((x) => x !== opt);
      else if (q.max && cur.length >= q.max) return;
      else value = [...cur, opt];
    }
    setAnswers((a) => ({ ...a, [q.key]: value }));
    enqueue('/api/survey/answer', { key: q.key, value });
  };

  const finish = async () => {
    const e = email.trim();
    if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setEmailError('That email does not look right. You can leave it empty.'); return; }
    setEmailError('');
    setFinishing(true);
    enqueue('/api/survey/complete', e ? { email: e } : {});
    writeLS('tbc_done', '1');
    for (let i = 0; i < 40 && (queue.current.length || busy.current); i++) await new Promise((r) => setTimeout(r, 250));
    if (!queue.current.length) router.push('/app?welcome=1');
    else setFinishing(false);
  };

  const wipe = async () => {
    try { await fetch('/api/survey/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ anonId: anon.current }) }); } catch { /* ignore */ }
    queue.current = []; persistQueue();
    try { localStorage.removeItem('tbc_anon'); localStorage.removeItem('tbc_done'); } catch { /* ignore */ }
    setAnswers({}); setDeleted(true);
  };

  if (!role) {
    return (
      <div className="onb wrap"><div className="onb-card glass">
        <h2>Which side do you want to try first?</h2>
        <div className="row">
          <Link className="btn btn-lime" href="/start?role=sponsor">Try as a sponsor</Link>
          <Link className="btn btn-neon" href="/start?role=organiser">Try as an organiser</Link>
        </div>
      </div></div>
    );
  }

  const isIntro = step < 3;
  const qi = step - 3;
  const q = qi >= 0 && qi < questions.length ? questions[qi] : null;
  const onEmail = !isIntro && !q;
  const pct = isIntro ? ((step + 1) / (total + 3)) * 100 : ((step + 1) / (total + 3)) * 100;
  const sel = (k: string) => answers[k];
  const canNext = !q || (q.kind === 'single' ? !!sel(q.key) : ((sel(q.key) as string[] | undefined)?.length ?? 0) > 0);

  return (
    <div className="onb">
      <div className="wrap onb-top">
        <Link href="/" className="logo-row" aria-label="TBC home"><img src="/brand/logo.png" alt="" /><b>TBC.</b></Link>
        <div className="row">
          {!isIntro && <span className={`save-state ${save === 'saved' ? 'ok' : save === 'idle' ? '' : 'wait'}`} role="status">
            {save === 'saved' ? 'Saved' : save === 'saving' ? 'Saving…' : save === 'retry' ? 'Not saved yet, trying again…' : 'Your answers are saved as you go'}
          </span>}
          <div className="switch" role="group" aria-label="Trying as">
            <span className="lbl">Trying as:</span>
            <button className="spo" aria-pressed={role === 'sponsor'} onClick={() => switchRole('sponsor')}>Sponsor</button>
            <button className="org" aria-pressed={role === 'organiser'} onClick={() => switchRole('organiser')}>Organiser</button>
          </div>
        </div>
      </div>
      <div className="wrap" style={{ display: 'flex', flex: 1 }}>
        <section className="onb-card glass" aria-live="polite">
          <div className="progress" aria-hidden><i style={{ width: `${pct}%` }} /></div>

          {step === 0 && (<>
            <span className="kicker">Welcome</span>
            <h2>Sponsors and hackathons, in one place</h2>
            <p className="muted">TBC helps people who run hackathons find sponsors, and helps sponsors find events worth backing.</p>
            <div className="row"><button className="btn btn-primary" onClick={() => setStep(1)}>Next</button></div>
          </>)}

          {step === 1 && (<>
            <span className="kicker">Two sides, and you can try both</span>
            <h2>Who is TBC for?</h2>
            <div className="two">
              <div className="usercard spo"><b>Sponsor</b><p className="muted">You decide whether your company backs events: to hire, to get product feedback, or to be seen.</p></div>
              <div className="usercard org"><b>Organiser</b><p className="muted">You run a hackathon or student event and need support: money, credits, prizes, mentors or a venue.</p></div>
            </div>
            <p className="small">You are trying TBC as <b>{role === 'organiser' ? 'an organiser' : 'a sponsor'}</b>. You can switch sides at any time with the button in the top right corner, here and inside the app.</p>
            <div className="row"><button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button><button className="btn btn-primary" onClick={() => setStep(2)}>Next</button></div>
          </>)}

          {step === 2 && (<>
            <span className="kicker">Why we are asking</span>
            {role === 'sponsor' ? (<>
              <h2>A few questions about sponsoring</h2>
              <p className="muted">We are building TBC around what sponsors actually need, so we would like to learn how you decide which events to back. It takes about a minute. There are no right answers.</p>
            </>) : (<>
              <h2>We are starting with sponsors</h2>
              <p className="muted">This first round is about what sponsors need. You can answer a few quick questions about how you find sponsors today, or go straight to exploring.</p>
            </>)}
            <p className="small">Your answers are saved to help us design TBC. Your email is optional. <Link href="/privacy" target="_blank">What we store</Link></p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary btn-same btn-invite" onClick={begin}>{role === 'sponsor' ? 'Start' : 'Answer a few questions'}</button>
              <Link className="btn btn-ghost btn-same" href="/app">Skip and explore</Link>
            </div>
          </>)}

          {q && (<>
            <span className="kicker">Question {qi + 1} of {questions.length}</span>
            <h2>{q.title}</h2>
            {q.hint && <p className="muted">{q.hint}</p>}
            <div className="opts" role={q.kind === 'single' ? 'radiogroup' : 'group'} aria-label={q.title}>
              {q.options.map((o) => {
                const on = q.kind === 'single' ? sel(q.key) === o : ((sel(q.key) as string[] | undefined) ?? []).includes(o);
                return (
                  <button key={o} className={`opt ${q.kind === 'multi' ? 'multi' : ''}`} role={q.kind === 'single' ? 'radio' : 'checkbox'} aria-checked={on} onClick={() => choose(q, o)}>
                    <span className="mark" aria-hidden /> {o}
                  </button>
                );
              })}
            </div>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={qi === 0}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext}>Next</button>
            </div>
          </>)}

          {onEmail && (<>
            <span className="kicker">Last step</span>
            <h2>Want to talk for 15 minutes?</h2>
            <p className="muted">If you would be happy to chat about how you choose events, leave your email. This is optional.</p>
            <label className="small" htmlFor="em">Email (optional)</label>
            <input id="em" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-describedby="emerr" />
            <p id="emerr" className="small" style={{ color: '#7d5200' }}>{emailError}</p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={finishing}>Back</button>
              <button className="btn btn-primary" onClick={finish} disabled={finishing}>{finishing ? 'Saving…' : 'Finish and explore'}</button>
            </div>
            {save === 'retry' && <p className="small">We could not reach the server yet. Your answers are kept on this device and will be sent when the connection is back.</p>}
          </>)}

          {!isIntro && (
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-small" onClick={() => switchRole(role === 'organiser' ? 'sponsor' : 'organiser')}>
                Answer as {role === 'organiser' ? 'sponsor' : 'organiser'} instead
              </button>
              {deleted
                ? <span className="small">Your answers were deleted.</span>
                : <button className="btn btn-ghost btn-small" onClick={wipe}>Delete my answers</button>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
