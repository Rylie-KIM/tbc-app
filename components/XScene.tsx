// The glowing X form from the design reference, as a soft background (dark version for the landing hero).
export function XScene() {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="xg" x1="0.05" y1="0" x2="0.95" y2="1">
          <stop offset="0" stopColor="#0a2a18" /><stop offset=".42" stopColor="#0b7a4a" /><stop offset=".78" stopColor="#7dff9e" /><stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <radialGradient id="xm" cx="50%" cy="50%" r="62%"><stop offset="0" stopColor="#fff" /><stop offset=".62" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
        <mask id="xmask"><rect width="800" height="600" fill="url(#xm)" /></mask>
        <filter id="xb" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="1000"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id="xglow" filterUnits="userSpaceOnUse" x="-400" y="-400" width="1600" height="1400"><feGaussianBlur stdDeviation="38" /></filter>
      </defs>
      <g mask="url(#xmask)">
        <path filter="url(#xb)" fill="url(#xg)" d="M60 -30 C200 90 345 190 345 300 C345 410 190 520 -30 500 L90 640 C300 500 390 450 400 368 C410 450 500 500 710 640 L830 500 C610 520 455 410 455 300 C455 190 600 90 840 60 L720 -30 C560 110 410 170 400 232 C390 170 260 100 170 -30 Z" />
        <ellipse cx="470" cy="338" rx="70" ry="34" fill="#ffffff" opacity=".9" filter="url(#xglow)" transform="rotate(18 470 338)" />
      </g>
    </svg>
  );
}
