// Original abstract glyph icons. NO brand reproduction.
// Each icon is rendered onto a rounded-square tile.
const Icon = {};

Icon.Camera = ({s=1}) => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <rect x="6" y="16" width="52" height="38" rx="9" fill="none" stroke="currentColor" strokeWidth="3"/>
    <rect x="22" y="10" width="20" height="8" rx="2.5" fill="currentColor"/>
    <circle cx="32" cy="35" r="11" fill="none" stroke="currentColor" strokeWidth="3"/>
    <circle cx="32" cy="35" r="4" fill="currentColor"/>
    <circle cx="50" cy="24" r="2" fill="currentColor"/>
  </svg>
);

Icon.Messages = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M10 20 q0-8 8-8 h28 q8 0 8 8 v18 q0 8-8 8 h-18 l-10 8 v-8 h-0 q-8 0-8-8 z" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <circle cx="22" cy="29" r="2.5" fill="currentColor"/>
    <circle cx="32" cy="29" r="2.5" fill="currentColor"/>
    <circle cx="42" cy="29" r="2.5" fill="currentColor"/>
  </svg>
);

Icon.Photos = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <rect x="8" y="12" width="48" height="40" rx="7" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M8 44 l14-14 12 12 8-8 14 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <circle cx="44" cy="22" r="4" fill="currentColor"/>
  </svg>
);

Icon.Settings = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round">
      <circle cx="32" cy="32" r="10" />
      <path d="M32 6 v8 M32 50 v8 M6 32 h8 M50 32 h8 M14 14 l5.5 5.5 M44.5 44.5 L50 50 M50 14 l-5.5 5.5 M14 50 l5.5-5.5"/>
    </g>
    <circle cx="32" cy="32" r="3" fill="currentColor"/>
  </svg>
);

Icon.Phone = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M14 12 q0-4 4-4 h6 q3 0 4 3 l4 10 q1 3-2 5 l-4 3 q5 9 14 14 l3-4 q2-3 5-2 l10 4 q3 1 3 4 v6 q0 4-4 4 q-26 0-43-43 z" fill="currentColor"/>
  </svg>
);

Icon.Mail = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <rect x="6" y="14" width="52" height="36" rx="6" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M8 18 l24 18 l24-18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
  </svg>
);

Icon.Calendar = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <rect x="8" y="12" width="48" height="44" rx="6" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M8 24 h48" stroke="currentColor" strokeWidth="3"/>
    <rect x="20" y="6" width="4" height="12" rx="2" fill="currentColor"/>
    <rect x="40" y="6" width="4" height="12" rx="2" fill="currentColor"/>
    <rect x="18" y="32" width="8" height="8" rx="1.5" fill="currentColor"/>
    <rect x="38" y="32" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.5"/>
    <rect x="28" y="42" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.5"/>
  </svg>
);

Icon.Map = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M8 16 l16-6 l16 6 l16-6 v42 l-16 6 l-16-6 l-16 6 z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M24 10 v42 M40 16 v42" stroke="currentColor" strokeWidth="3"/>
    <circle cx="44" cy="30" r="3" fill="currentColor"/>
  </svg>
);

Icon.Music = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M22 44 v-26 l24-6 v26" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <ellipse cx="18" cy="46" rx="6" ry="5" fill="currentColor"/>
    <ellipse cx="42" cy="42" rx="6" ry="5" fill="currentColor"/>
  </svg>
);

Icon.Browser = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3"/>
    <ellipse cx="32" cy="32" rx="10" ry="22" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M10 32 h44 M14 20 h36 M14 44 h36" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

Icon.Wallet = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <rect x="6" y="14" width="52" height="36" rx="6" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M40 32 h18" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="44" cy="32" r="2" fill="#000"/>
  </svg>
);

Icon.Notes = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M14 8 h28 l12 12 v36 q0 4-4 4 h-36 q-4 0-4-4 v-44 q0-4 4-4 z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M42 8 v12 h12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M20 32 h24 M20 40 h24 M20 48 h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

Icon.Health = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M32 54 C 14 42, 6 30, 12 20 C 18 10, 30 14, 32 22 C 34 14, 46 10, 52 20 C 58 30, 50 42, 32 54 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M14 32 h8 l3-6 l5 14 l4-10 l3 6 l11 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

Icon.Weather = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="22" cy="26" r="9" fill="currentColor"/>
    <path d="M18 42 q-10 0-10 8 q0 7 9 7 h28 q9 0 9-9 q0-10-11-11 q-2-9-12-9 q-7 0-10 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
  </svg>
);

Icon.AI = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <defs>
      <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7ad9ff"/>
        <stop offset="1" stopColor="#b58bff"/>
      </linearGradient>
    </defs>
    <path d="M32 6 L40 24 L58 32 L40 40 L32 58 L24 40 L6 32 L24 24 Z" fill="url(#aiGrad)"/>
    <path d="M48 8 l3 6 l6 3 l-6 3 l-3 6 l-3-6 l-6-3 l6-3 z" fill="#fff" opacity="0.85"/>
  </svg>
);

Icon.Files = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <path d="M8 18 q0-4 4-4 h12 l6 6 h22 q4 0 4 4 v26 q0 4-4 4 h-40 q-4 0-4-4 z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M8 28 h48" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

Icon.Clock = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M32 16 v16 l11 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="32" cy="32" r="2.5" fill="currentColor"/>
  </svg>
);

Icon.Calculator = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <rect x="10" y="6" width="44" height="52" rx="6" fill="none" stroke="currentColor" strokeWidth="3"/>
    <rect x="16" y="12" width="32" height="12" rx="2" fill="currentColor" opacity="0.25"/>
    <g fill="currentColor">
      <circle cx="20" cy="34" r="2.5"/><circle cx="32" cy="34" r="2.5"/><circle cx="44" cy="34" r="2.5"/>
      <circle cx="20" cy="44" r="2.5"/><circle cx="32" cy="44" r="2.5"/><circle cx="44" cy="44" r="2.5"/>
      <circle cx="20" cy="52" r="2.5"/><circle cx="32" cy="52" r="2.5"/><circle cx="44" cy="52" r="2.5"/>
    </g>
  </svg>
);

Icon.Gallery = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%">
    <rect x="8" y="8" width="48" height="48" rx="8" fill="none" stroke="currentColor" strokeWidth="3"/>
    <circle cx="22" cy="22" r="4" fill="currentColor"/>
    <path d="M8 48 l14-14 l10 10 l8-6 l14 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
  </svg>
);

window.Icon = Icon;
