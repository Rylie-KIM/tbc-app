import Link from 'next/link';
import { XScene } from '@/components/XScene';

export default function Landing() {
  return (
    <div className="dark">
      <div className="scene"><XScene /></div>
      <div className="wrap hero">
        <Link href="/" className="logo-row" aria-label="TBC home">
          <img src="/brand/logo-white.png" alt="" /> <b>TBC.</b>
        </Link>
        <div className="grow">
          <span className="chip mint" style={{ width: 'fit-content' }}>Early preview</span>
          <h1>Sponsors and hackathons, in one place</h1>
          <p className="lead">TBC helps people who run hackathons find sponsors, and helps sponsors find events worth backing. No more searching through emails and PDFs.</p>
          <p className="ask">Which side do you want to try first?</p>
          <div className="row">
            <Link className="btn btn-neon rolebtn" href="/start?role=sponsor"><b>Try as a sponsor</b><span>I am choosing what to back</span></Link>
            <Link className="btn btn-lime rolebtn" href="/start?role=organiser"><b>Try as an organiser</b><span>I am looking for sponsors</span></Link>
          </div>
          <p className="notice-dark">This is an early preview. Everything you see is example data. You can switch sides at any time, and your answers to a few short questions help us design TBC. <Link href="/privacy" style={{ color: '#b6ff00' }}>What we store</Link></p>
        </div>
      </div>
    </div>
  );
}
