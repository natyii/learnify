"use client";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Elegant notebook + edge-biased doodles:
 * - Muted graph-paper + margin
 * - Doodles use a center "avoid" mask so they don't shout under content
 * - Palette: slate/steel/cyan-ice (low saturation)
 */
export default function Doodle() {
  const reduce = useReducedMotion();
  const strokeAnim = reduce
    ? { opacity: [0.18, 0.42, 0.18] }
    : { pathLength: [0, 1, 0], opacity: [0.22, 0.75, 0.22] };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* soft tech wash */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_10%,rgba(148,163,184,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_90%,rgba(103,232,249,0.10),transparent_60%)]" />

      {/* graph paper (subtle) */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(to bottom, rgba(203,213,225,0.16) 0 1px, transparent 1px 26px),
            repeating-linear-gradient(to right,  rgba(203,213,225,0.08) 0 1px, transparent 1px 26px)
          `,
        }}
      />
      {/* margin line */}
      <div className="absolute inset-y-0 left-[68px] hidden w-px bg-[rgba(244,63,94,0.45)] sm:block" />
      {/* hole punches */}
      <div className="absolute left-6 top-36 h-3 w-3 rounded-full bg-white/12" />
      <div className="absolute left-6 top-[45%] h-3 w-3 rounded-full bg-white/12" />
      <div className="absolute left-6 bottom-36 h-3 w-3 rounded-full bg-white/12" />

      {/* DOODLES with center-avoid mask */}
      <svg
        className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 1200 1200"
      >
        <defs>
          {/* Elegant gradients */}
          <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />   {/* slate-400 */}
            <stop offset="55%" stopColor="#9ca3af" />  {/* gray-400 */}
            <stop offset="100%" stopColor="#a7f3d0" /> {/* mint-200 */}
          </linearGradient>
          <linearGradient id="gB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />  {/* sky-200 */}
            <stop offset="50%" stopColor="#7dd3fc" /> {/* sky-300 */}
            <stop offset="100%" stopColor="#a5b4fc" />{/* indigo-200 */}
          </linearGradient>

          {/* Mask: dim center column where content sits */}
          <radialGradient id="centerFade" cx="50%" cy="37%" r="36%">
            <stop offset="0%" stopColor="black" stopOpacity="0.85" />
            <stop offset="60%" stopColor="black" stopOpacity="0.55" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>
          <mask id="avoidCenter">
            <rect width="1200" height="1200" fill="url(#centerFade)" />
          </mask>
        </defs>

        {/* Edge-biased groups (top-left / top-right / bottom arc) */}
        <g mask="url(#avoidCenter)">
          {/* Book (top-left, slow) */}
          <motion.path
            d="M180,420 h240 a20,20 0 0 1 20,20 v160 a20,20 0 0 1 -20,20 h-240 a20,20 0 0 1 -20,-20 v-160 a20,20 0 0 1 20,-20 z
               M180,460 h280 M250,420 v200"
            stroke="url(#gA)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0.18 }}
            animate={strokeAnim}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />

          {/* Compass (top-right, medium) */}
          <motion.path
            d="M940,420 l-60,150 M940,420 l60,150 M880,570 a90,90 0 0 1 120,0 M940,420 a18,18 0 1 1 0,0.01"
            stroke="url(#gB)" strokeWidth="2.6" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.18 }}
            animate={strokeAnim}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />

          {/* Flask (left edge, very slow drift) */}
          <motion.path
            d="M140,720 v72 l-90,140 a22,22 0 0 0 19,34 h140 a22,22 0 0 0 19,-34 l-90,-140 v-72
               M114,820 h112"
            stroke="url(#gB)" strokeWidth="2.6" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.16 }}
            animate={strokeAnim}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
          />

          {/* Bottom orbit (kept wide so it runs under gaps) */}
          <motion.ellipse
            cx="600" cy="980" rx="290" ry="85"
            stroke="url(#gA)" strokeWidth="2.4" fill="none"
            initial={{ pathLength: 0, opacity: 0.16 }}
            animate={strokeAnim}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </g>
      </svg>
    </div>
  );
}
