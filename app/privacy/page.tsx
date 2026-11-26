import Link from 'next/link';

export const metadata = { title: 'What we store | TBC' };

export default function Privacy() {
  return (
    <main className="wrap" style={{ paddingBlock: 40, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 720 }}>
      <Link href="/" className="small">Back to TBC</Link>
      <h1 style={{ fontSize: '2.2rem' }}>What we store</h1>
      <p className="muted">TBC is an early preview. This page is a plain-language draft, not a legal notice, and it will be reviewed before any wider launch.</p>
      <h2>Your answers</h2>
      <p>When you start the short questions we store which side you chose (organiser or sponsor), the answers you give, and the times you started and finished. We store an anonymous random code from your browser to keep your answers together. There is no account yet.</p>
      <h2>Your email</h2>
      <p>Your email is optional. If you leave it, we may contact you for a short interview about how sponsors choose events. We do not share it.</p>
      <h2>The “Tell us what you are looking for” box</h2>
      <p>The sentence you write there is sent to an AI service (OpenRouter and the free model it uses) together with the facts of our example events, so that it can suggest events. We do not store your sentence, and we do not send your answers, your email or any code that identifies you. The free service may keep or use what it receives under its own terms, so please do not write personal or confidential details.</p>
      <h2>What we do not store</h2>
      <p>We do not store your name, and the preview does not track you across other sites.</p>
      <h2>Why</h2>
      <p>The answers help us understand what sponsors need, so that TBC can be built around it. They are read by the TBC team only, and results are shared as summaries.</p>
      <h2>Delete your answers</h2>
      <p>Use the “Delete my answers” button on the questions screen or on the start page. It removes your answers from this browser&apos;s session straight away.</p>
      <p className="small">Where the data is kept: a database in the EU (Ireland). How long it is kept has not been decided yet; it will be written here.</p>
    </main>
  );
}
