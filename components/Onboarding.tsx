'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { echoOf, questionsFor, SURVEY_VERSION, type Answers, type Question, type Role } from '@/lib/survey';

type Job = { path: string; body: Record<string, unknown>; retried?: boolean };
type SaveState = 'idle' | 'saving' | 'saved' | 'retry';
const QUEUE_KEY = 'tbc_queue';

const readLS = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const writeLS = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode: the page still works */ } };
const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Onboarding({ role: roleParam }: { role?: string }) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(roleParam === 'organiser' || roleParam === 'sponsor' ? roleParam : null);
  const started = useRef(false);
  const [step, setStep] = useState(0); // 0..2 intro, 3 "questionnaire starts", 4.. the questions
  const [anchor, setAnchor] = useState<{ step: number; pct: number } | null>(null); // keeps the bar where it was after a switch or a branch
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pctNow = useRef(0);
  const lastPct = useRef(0);
  const lastLen = useRef(0);
  const [allAnswers, setAllAnswers] = useState<Record<Role, Answers>>({ sponsor: {}, organiser: {} }); // one set of answers per side
  const answers: Answers = role ? allAnswers[role] : {};
  const setAnswers = (f: (a: Answers) => Answers) => { if (role) setAllAnswers((all) => ({ ...all, [role]: f(all[role]) })); };
  const [emailError, setEmailError] = useState('');
  const [save, setSave] = useState<SaveState>('idle');
  const [finishing, setFinishing] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const anon = useRef('');
  const queue = useRef<Job[]>([]);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = useMemo(() => (role ? questionsFor(role, answers) : []), [role, answers]);

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
        if (res.status === 404 && job.path !== '/api/survey/start' && !job.retried && (job.body.role === 'sponsor' || job.body.role === 'organiser')) {
          // the server has no response for this person and side (for example it was deleted): create it again, then send the answer again
          job.retried = true;
          queue.current.unshift({ path: '/api/survey/start', body: { anonId: job.body.anonId, role: job.body.role, version: job.body.version } });
          persistQueue();
        } else if (res.ok || res.status === 400 || res.status === 404) { queue.current.shift(); persistQueue(); }
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
    queue.current.push({ path, body: { anonId: anon.current, role, version: SURVEY_VERSION, ...body } });
    persistQueue();
    void flush();
  };

  const begin = () => {
    if (!role) return;
    enqueue('/api/survey/start', { role });
    started.current = true;
    setStep(3);
  };

  const say = (msg: string, ms = 5000) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), ms);
  };

  // The switch is visible from the first screen. Changing side sends the person back to the screen with the Start
  // button for that side: its answers are kept apart from the other side's (each side is its own response).
  const switchRole = (r: Role) => {
    if (r === role) return;
    setAnchor(null);
    setRole(r);
    writeLS('tbc_role', r);
    if (step >= 3) setStep(2);
    say(`Switched to ${r}.`);
  };

  const setValue = (key: string, value: string | string[]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    enqueue('/api/survey/answer', { key, value });
  };

  const choose = (q: Question, opt: string) => {
    if (q.kind === 'single' || q.kind === 'scale') return setValue(q.key, opt);
    const cur = (answers[q.key] as string[] | undefined) ?? [];
    if (cur.includes(opt)) return setValue(q.key, cur.filter((x) => x !== opt));
    if (q.max && cur.length >= q.max) return;
    setValue(q.key, [...cur, opt]);
  };

  // Free text: kept in state at once, sent shortly after typing stops and again when leaving the question.
  const typeText = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (textTimer.current) clearTimeout(textTimer.current);
    textTimer.current = setTimeout(() => enqueue('/api/survey/answer', { key, value }), 700);
  };
  // The email is kept in state at once and sent about a second after typing stops, when it looks valid.
  const typeEmail = (key: string, value: string) => {
    setEmailError('');
    setAnswers((a) => ({ ...a, [key]: value }));
    if (textTimer.current) clearTimeout(textTimer.current);
    const v = value.trim();
    if (v && EMAIL.test(v)) textTimer.current = setTimeout(() => enqueue('/api/survey/answer', { key, value: v }), 900);
  };
  const flushText = (q: Question | null) => {
    if (textTimer.current) { clearTimeout(textTimer.current); textTimer.current = null; }
    if (!q) return;
    const keys = [q.key, `${q.key}_other`].filter((k) => typeof answers[k] === 'string');
    for (const k of keys) enqueue('/api/survey/answer', { key: k, value: answers[k] });
  };

  const go = (delta: number, q: Question | null) => {
    if (q?.kind === 'email') {
      const v = ((answers[q.key] as string) ?? '').trim();
      if (delta > 0 && v && !EMAIL.test(v)) { setEmailError('That email does not look right. You can leave it empty.'); return; }
      setEmailError('');
      if (textTimer.current) { clearTimeout(textTimer.current); textTimer.current = null; }
      if (!v || EMAIL.test(v)) enqueue('/api/survey/answer', { key: q.key, value: v }); // also when going Back, so a typed email is never lost
    }
    flushText(q);
    setStep((s) => s + delta);
  };

  const finish = async (q: Question | null) => {
    flushText(q);
    setFinishing(true);
    enqueue('/api/survey/complete', {});
    writeLS('tbc_done', '1');
    for (let i = 0; i < 40 && (queue.current.length || busy.current); i++) await new Promise((r) => setTimeout(r, 250));
    if (!queue.current.length) router.push('/app?welcome=1');
    else setFinishing(false);
  };

  const wipe = async () => {
    try { await fetch('/api/survey/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ anonId: anon.current }) }); } catch { /* ignore */ }
    queue.current = []; persistQueue();
    try { localStorage.removeItem('tbc_anon'); localStorage.removeItem('tbc_done'); } catch { /* ignore */ }
    setAllAnswers({ sponsor: {}, organiser: {} }); setDeleted(true);
  };

  const isIntro = step < 4;
  const qi = step - 4;
  const q = qi >= 0 && qi < questions.length ? questions[qi] : null;
  const last = 3 + questions.length; // index of the final question
  const baseline = ((step + 1) / (last + 1)) * 100;
  const pct = !anchor ? baseline
    : step >= anchor.step ? (last <= anchor.step ? 100 : anchor.pct + ((100 - anchor.pct) * (step - anchor.step)) / (last - anchor.step))
    : (anchor.pct * (step + 1)) / (anchor.step + 1);
  pctNow.current = pct;

  // when the number of questions changes (a branch after Q4), keep the bar where it was
  useEffect(() => {
    if (lastLen.current && lastLen.current !== questions.length && step >= 4) setAnchor({ step, pct: lastPct.current });
    lastLen.current = questions.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);
  useEffect(() => { lastPct.current = pct; });

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

  const sel = (k: string) => answers[k];
  const canNext = !q || q.optional || (q.kind === 'multi' ? ((sel(q.key) as string[] | undefined)?.length ?? 0) > 0 : !!sel(q.key));
  const echo = q ? echoOf(q, answers) : [];
  const shownTitle = q ? (echo.length > 0 && q.titleAfter ? q.titleAfter : q.title) : '';
  const isLast = !!q && qi === questions.length - 1;
  const total = questionsFor(role, {}).length;
  const otherOn = !!q?.other && ((sel(q.key) as string[] | undefined) ?? []).includes('Other');

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
            <h2>Welcome to TBC</h2>
            <p className="muted">Sponsors and hackathons, in one place.</p>
            <div className="row"><button className="btn btn-primary" onClick={() => setStep(1)}>Next</button></div>
          </>)}

          {step === 1 && (<>
            <h2>Who is TBC for? You can try both sides.</h2>
            <div className="two">
              <div className="usercard spo"><span className="orb spo" aria-hidden>S</span><b>Sponsor</b><p className="muted">You decide whether your company backs events: to hire, to get product feedback, or to be seen.</p></div>
              <div className="usercard org"><span className="orb org" aria-hidden>O</span><b>Organiser</b><p className="muted">You run a hackathon or student event and need support: money, credits, prizes, mentors or a venue.</p></div>
            </div>
            <div className="row"><button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button><button className="btn btn-primary" onClick={() => setStep(2)}>Next</button></div>
          </>)}

          {step === 2 && (<>
            {role === 'sponsor' ? (<>
              <h2>A few questions about sponsoring</h2>
              <p className="muted">We want to learn how you decide which events to back. There are no right answers.</p>
            </>) : (<>
              <h2>We are starting with sponsors</h2>
              <p className="muted">Answer a few questions about how you find sponsors today, or skip to explore.</p>
            </>)}
            <p className="small">Your answers are saved to help us design TBC. Your email is optional. <Link href="/privacy" target="_blank">What we store</Link></p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-tour btn-same" onClick={begin}><span className="spark" aria-hidden>✦</span> {role === 'sponsor' ? 'Start' : 'Answer a few questions'}</button>
              <Link className="btn btn-ghost btn-same" href="/app">Skip and explore</Link>
            </div>
          </>)}

          {step === 3 && (<>
            <h2>Your questionnaire starts now</h2>
            <div className="two">
              <div className="usercard"><b className="bignum">{role === 'sponsor' ? '23' : total}</b><span>{role === 'sponsor' ? 'questions at most' : 'questions'}</span></div>
              <div className="usercard"><b className="bignum">{role === 'sponsor' ? '5–10' : '2'}</b><span>{role === 'sponsor' ? 'minutes' : 'minutes or less'}</span></div>
            </div>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-tour btn-same" onClick={() => setStep(4)} autoFocus><span className="spark" aria-hidden>✦</span> Begin the questionnaire</button>
            </div>
          </>)}

          {q && (<>
            <span className="kicker">Question {qi + 1} of {questions.length}</span>
            {q.key === 'q21_why_not' && (
              <p className="skipnote" role="status">Thanks. Since you have not sponsored yet, we skip {questionsFor('sponsor', { q04_freq: '1-2' }).length - questions.length} questions about past sponsorships. {questions.length - qi} left.</p>
            )}
            {q.intro && <p className="muted" style={{ background: 'rgba(255,255,255,.7)', borderRadius: 16, padding: '12px 16px' }}>{q.intro}</p>}
            {echo.length > 0 && (
              <div className="echo"><span className="muted">You chose</span><div className="row" style={{ gap: 8 }}>{echo.map((x) => <span className="tag" key={x}>{x}</span>)}</div></div>
            )}
            <h2>{shownTitle}</h2>
            {q.hint && <p className="muted">{q.hint}</p>}
            {q.optional && q.kind !== 'email' && <span className="small">Optional</span>} {/* the email question already says it in its hint */}

            {(q.kind === 'single' || q.kind === 'multi') && (
              <div className="opts" role={q.kind === 'single' ? 'radiogroup' : 'group'} aria-label={shownTitle}>
                {q.options.map((o) => {
                  const on = q.kind === 'single' ? sel(q.key) === o : ((sel(q.key) as string[] | undefined) ?? []).includes(o);
                  return (
                    <button key={o} className={`opt ${q.kind === 'multi' ? 'multi' : ''}`} role={q.kind === 'single' ? 'radio' : 'checkbox'} aria-checked={on} onClick={() => choose(q, o)}>
                      <span className="mark" aria-hidden /> {o}
                    </button>
                  );
                })}
                {otherOn && (
                  <input className="input" aria-label="Other, please say" placeholder="Other: please say" maxLength={300} value={(sel(`${q.key}_other`) as string) ?? ''} onChange={(e) => typeText(`${q.key}_other`, e.target.value)} onBlur={() => flushText(q)} />
                )}
              </div>
            )}

            {q.kind === 'scale' && (<>
              <div className="scale" role="radiogroup" aria-label={shownTitle}>
                {q.options.map((o) => (<button key={o} className="scalebtn" role="radio" aria-checked={sel(q.key) === o} onClick={() => choose(q, o)}>{o}</button>))}
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span className="scalelabel"><b>1</b> {q.low}</span><span className="scalelabel"><b>5</b> {q.high}</span></div>
            </>)}

            {q.kind === 'text' && (
              <textarea className="input area" rows={4} maxLength={1000} aria-label={shownTitle} value={(sel(q.key) as string) ?? ''} onChange={(e) => typeText(q.key, e.target.value)} onBlur={() => flushText(q)} placeholder="Type here (optional)" />
            )}

            {q.kind === 'email' && (<>
              <input id="em" className="input" aria-label="Email address" type="email" inputMode="email" autoComplete="email" value={(sel(q.key) as string) ?? ''} onChange={(e) => typeEmail(q.key, e.target.value)} placeholder="you@example.com" aria-describedby="emerr" />
              <p id="emerr" className="small" style={{ color: '#7d5200' }}>{emailError}</p>
              {/* the email is sent when leaving this question (see go) */}
            </>)}

            <div className="row">
              <button className="btn btn-ghost" onClick={() => go(-1, q)} disabled={finishing}>Back</button>
              {isLast
                ? <button className="btn btn-primary" onClick={() => void finish(q)} disabled={finishing || !canNext}>{finishing ? 'Saving…' : 'Finish and explore'}</button>
                : <button className="btn btn-primary" onClick={() => { if (q.kind === 'email') { const v = ((answers[q.key] as string) ?? '').trim(); if (v && !EMAIL.test(v)) { setEmailError('That email does not look right. You can leave it empty.'); return; } } go(1, q); }} disabled={!canNext}>Next</button>}
            </div>
            {save === 'retry' && <p className="small">We could not reach the server yet. Your answers are kept on this device and will be sent when the connection is back.</p>}
          </>)}

          {!isIntro && (
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              {deleted
                ? <span className="small">Your answers were deleted.</span>
                : <button className="btn btn-ghost btn-small" onClick={wipe}>Delete my answers</button>}
            </div>
          )}
        </section>
      </div>
      {toast && <div className="toast" role="status" aria-live="polite"><i aria-hidden /> {toast}</div>}
    </div>
  );
}
