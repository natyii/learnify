/**
 * Server-safe animated doodles that blend with a dark/nebula hero.
 * Uses Tailwind + custom keyframes defined in globals.css (step 2).
 * No 'use client', no styled-jsx, no SMIL — works everywhere.
 */
export default function DoodleSchool() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Notebook, floating left */}
      <svg
        viewBox="0 0 120 120"
        className="absolute left-[4%] top-[120px] h-28 w-28 opacity-25 animate-float-slow"
        fill="none"
      >
        <rect x="14" y="18" width="86" height="84" rx="12" className="fill-white/5" />
        <rect x="14" y="18" width="86" height="84" rx="12" className="stroke-white/60" strokeWidth="2" />
        <line x1="28" y1="32" x2="92" y2="32" className="stroke-white/60" strokeWidth="2" />
        <line x1="28" y1="48" x2="92" y2="48" className="stroke-white/60" strokeWidth="2" />
        <line x1="28" y1="64" x2="92" y2="64" className="stroke-white/60" strokeWidth="2" />
      </svg>

      {/* Pencil, gentle drift near the headline */}
      <svg
        viewBox="0 0 200 80"
        className="absolute right-[6%] top-[110px] h-24 w-40 opacity-30 animate-drift-x"
        fill="none"
      >
        <rect x="20" y="30" width="120" height="12" rx="6" className="fill-white/5 stroke-white/60" strokeWidth="2" />
        <polygon points="140,30 176,40 140,42" className="fill-white/5 stroke-white/60" strokeWidth="2" />
        <circle cx="182" cy="40" r="6" className="stroke-white/60" strokeWidth="2" />
      </svg>

      {/* Ruler, bottom-right of hero */}
      <svg
        viewBox="0 0 120 120"
        className="absolute right-[10%] top-[360px] h-28 w-28 opacity-25 animate-float-slower"
        fill="none"
      >
        <rect x="20" y="22" width="80" height="20" rx="6" className="fill-white/5 stroke-white/60" strokeWidth="2" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1={26 + i * 9}
            y1="26"
            x2={26 + i * 9}
            y2={i % 2 ? 38 : 34}
            className="stroke-white/60"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Backpack, faint behind the stat row */}
      <svg
        viewBox="0 0 120 120"
        className="absolute left-[10%] top-[520px] h-28 w-28 opacity-20 animate-float-slowest"
        fill="none"
      >
        <rect x="30" y="40" width="60" height="56" rx="12" className="fill-white/5 stroke-white/60" strokeWidth="2" />
        <rect x="40" y="32" width="40" height="16" rx="8" className="stroke-white/60" strokeWidth="2" />
        <rect x="44" y="66" width="32" height="16" rx="6" className="stroke-white/60" strokeWidth="2" />
      </svg>

      {/* Tiny bits: paper clips / confetti lines for parallax-ish depth */}
      <div className="absolute inset-0 animate-slow-parallax">
        <div className="absolute left-[30%] top-[18%] h-1 w-8 rounded-full bg-white/20 rotate-6" />
        <div className="absolute right-[22%] top-[28%] h-1 w-10 rounded-full bg-white/15 -rotate-12" />
        <div className="absolute right-[18%] top-[44%] h-1 w-6 rounded-full bg-white/15 rotate-3" />
        <div className="absolute left-[14%] top-[40%] h-1 w-12 rounded-full bg-white/15 -rotate-3" />
      </div>
    </div>
  );
}
