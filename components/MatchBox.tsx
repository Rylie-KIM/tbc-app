'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { eventById } from '@/data/events';

type Result = { source: 'ai' | 'keywords'; summary: string; matches: { id: string; reason: string }[]; note?: string };

// F25.10: the sponsor writes what they want in a sentence and gets example events with a reason for each.
export function MatchBox({ onUsed }: { onUsed?: () => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState('');
  const [ai, setAi] = useState<boolean | null>(null);
  const ok = text.trim().length >= 8;
  useEffect(() => { fetch('/api/match').then((r) => r.json()).then((j) => setAi(!!j.ai)).catch(() => setAi(false)); }, []);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true); setErr(''); setRes(null);
    try {
      const r = await fetch('/api/match', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
      const j = await r.json().catch(() => null);
      if (r.status === 429) setErr('You are asking quickly. Please wait a minute and try again.');
      else if (!r.ok || !j?.ok) setErr('Something went wrong. Please try again, or use the search below.');
      else { setRes(j as Result); onUsed?.(); }
    } catch { setErr('No connection. Please try again.'); }
    setBusy(false);
  };

  return (
    <section className="glass matchbox" aria-label="Describe what you are looking for" data-tour="match">
      <h2>Tell us what you are looking for</h2>
      <p className="muted">Write one or two sentences. We suggest example events that fit and say why.</p>
      <form onSubmit={go}>
        <textarea className="input area" rows={3} maxLength={400} value={text} onChange={(e) => setText(e.target.value)} aria-label="Describe what you are looking for" placeholder="For example: I want to hire three backend interns and can spend about £2,000." />
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" type="submit" disabled={!ok || busy}>{busy ? 'Looking…' : 'Find events'}</button>
          {(res || err) && <button type="button" className="btn btn-ghost" onClick={() => { setRes(null); setErr(''); }}>Clear</button>}
        </div>
      </form>
      <p className="small" style={{ marginTop: 10 }}>{ai ? 'Your sentence is sent to an AI service. Please do not write personal or confidential details. Suggestions can be wrong, so check the event page.' : 'This search matches the words you write against the example events.'}</p>
      {err && <p role="alert" className="matcherr">{err}</p>}
      {res && (
        <div className="matchres" role="status" aria-live="polite">
          {res.summary && <p>{res.summary}</p>}
          {res.note && <p className="small">{res.note}</p>}
          {res.source === 'ai' && res.matches.length > 0 && <p className="small">Suggested by AI from the example events.</p>}
          {res.matches.map((m) => {
            const ev = eventById(m.id);
            if (!ev) return null;
            return (
              <article className="matchitem" key={m.id}>
                <div><b>{ev.name}</b> <span className="small">({ev.type}, example)</span><p>{m.reason}</p></div>
                <Link className="btn btn-spark btn-small" href={`/app/events/${ev.id}`}>See details <span aria-hidden>→</span></Link>
              </article>
            );
          })}
          {res.matches.length === 0 && !res.summary && <p>No example event matches. Try other words.</p>}
        </div>
      )}
    </section>
  );
}
