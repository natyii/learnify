// src/ui/ParallaxDoodles.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo } from "react";

type DoodleProps = {
  // absolute positioning (tailwind)
  pos: string;
  // scale and opacity
  scale?: number;
  opacity?: number;
  // parallax intensity (px of travel from scroll)
  parallax?: number;
  // base z
  z?: number;
  // SVG element
  svg: JSX.Element;
  // individual float speed seconds
  speed?: number;
};

function Float({
  pos,
  scale = 1,
  opacity = 0.25,
  parallax = 60,
  z = 0,
  svg,
  speed = 8,
}: DoodleProps) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, parallax]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, parallax / 10]);

  return (
    <motion.div
      className={`pointer-events-none absolute ${pos}`}
      style={{ y, rotate, zIndex: z }}
      aria-hidden
    >
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, -2, 0] }}
        transition={{ duration: speed, ease: "easeInOut", repeat: Infinity }}
        className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.12)]"
        style={{ scale, opacity, filter: "saturate(1.05) blur(0px)" }}
      >
        {svg}
      </motion.div>
    </motion.div>
  );
}

const stroke = "#0b1729";
const soft = "#89CFF0"; // accent sky
const paper = "#FFE8A3"; // light notebook gold

// minimal, brandable, school-supply SVGs (no external CSS)
const icons = {
  pencil: (
    <svg width="220" height="36" viewBox="0 0 220 36" fill="none">
      <rect x="10" y="8" width="180" height="20" rx="10" fill={paper} stroke={stroke} strokeWidth="2" />
      <polygon points="190,8 210,18 190,28" fill="#F5C1B0" stroke={stroke} strokeWidth="2" />
      <rect x="14" y="11" width="26" height="14" rx="7" fill="#E6F7F1" stroke={stroke} strokeWidth="2" />
    </svg>
  ),
  ruler: (
    <svg width="220" height="38" viewBox="0 0 220 38" fill="none">
      <rect x="6" y="6" width="208" height="26" rx="6" fill="#F8F4D9" stroke={stroke} strokeWidth="2" />
      {[...Array(10)].map((_, i) => (
        <line
          key={i}
          x1={26 + i * 18}
          y1="9"
          x2={26 + i * 18}
          y2={i % 2 ? 18 : 26}
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  ),
  book: (
    <svg width="120" height="110" viewBox="0 0 120 110" fill="none">
      <rect x="12" y="16" width="96" height="78" rx="10" fill="#FFFFFF" stroke={stroke} strokeWidth="2" />
      <path d="M22 24h76M22 36h76M22 48h54" stroke={stroke} strokeWidth="2" />
    </svg>
  ),
  backpack: (
    <svg width="130" height="140" viewBox="0 0 130 140" fill="none">
      <rect x="20" y="32" width="90" height="90" rx="18" fill="#F2FAFF" stroke={stroke} strokeWidth="2" />
      <rect x="40" y="20" width="50" height="22" rx="10" fill="#E5F3FF" stroke={stroke} strokeWidth="2" />
      <rect x="32" y="76" width="66" height="32" rx="8" fill="#FFFFFF" stroke={stroke} strokeWidth="2" />
      <circle cx="90" cy="92" r="4" fill={soft} />
    </svg>
  ),
};

export default function ParallaxDoodles() {
  // layout presets: corners + mid-sides so you see them immediately
  const items = useMemo<DoodleProps[]>(
    () => [
      { pos: "top-20 left-8", svg: icons.book, scale: 0.9, parallax: 40, opacity: 0.22, speed: 9, z: -5 },
      { pos: "top-24 right-10", svg: icons.pencil, scale: 1.0, parallax: 70, opacity: 0.28, speed: 7, z: -4 },
      { pos: "bottom-24 left-12", svg: icons.backpack, scale: 0.9, parallax: 60, opacity: 0.22, speed: 10, z: -4 },
      { pos: "bottom-28 right-16", svg: icons.ruler, scale: 1.0, parallax: 50, opacity: 0.25, speed: 8, z: -5 },
      // subtle mid background pieces
      { pos: "top-1/3 left-[42%]", svg: icons.ruler, scale: 0.7, parallax: 30, opacity: 0.18, speed: 11, z: -6 },
      { pos: "bottom-1/3 right-[40%]", svg: icons.book, scale: 0.7, parallax: 35, opacity: 0.18, speed: 12, z: -6 },
    ],
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {items.map((it, i) => (
        <Float key={i} {...it} />
      ))}
    </div>
  );
}
