'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'organiser' | 'sponsor';

/** Top bar of the event page: same logo and side switch as the start page (the switch stays top right). */
export default function DetailBar() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('sponsor');
  useEffect(() => {
    try {
      const r = localStorage.getItem('tbc_role');
      if (r === 'organiser' || r === 'sponsor') setRole(r);
      const done = JSON.parse(localStorage.getItem('tbc_tasks') || '[]') as string[];
      if (!done.includes('s-open')) localStorage.setItem('tbc_tasks', JSON.stringify([...done, 's-open']));
    } catch { /* ignore */ }
  }, []);
  const pick = (r: Role) => {
    if (r === role) return;
    try { localStorage.setItem('tbc_role', r); } catch { /* ignore */ }
    router.push(`/app?role=${r}&switched=${r}`);
  };
  return (
    <header className="appbar">
      <div className="wrap">
        <Link href="/" className="logo-row" aria-label="TBC home"><img src="/brand/logo.png" alt="" /><b>TBC.</b></Link>
        <div className="row bar-actions">
          <div className="switch" role="group" aria-label="Trying as">
            <span className="lbl">Trying as:</span>
            <button className="spo" aria-pressed={role === 'sponsor'} onClick={() => pick('sponsor')}>Sponsor</button>
            <button className="org" aria-pressed={role === 'organiser'} onClick={() => pick('organiser')}>Organiser</button>
          </div>
        </div>
      </div>
    </header>
  );
}
