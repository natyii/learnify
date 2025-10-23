"use client";

import { useEffect, useRef } from "react";

/**
 * DoodleSchool
 * - tasteful, GPU-accelerated parallax doodles
 * - very light on CPU; no external libs
 * - respects reduced motion
 */
export default function DoodleSchool() {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      root.style.opacity = "0.3";
      return;
    }

    let t = 0;
    const loop = () => {
      t += 0.008;

      // subtle orbital motion
      const items = root.querySelectorAll<HTMLElement>("[data-doodle]");
      items.forEach((el, i) => {
        const speed = 0.4 + (i % 5) * 0.12;
        const rX = 6 + (i % 7);
        const rY = 8 + ((i + 3) % 7);

        const x = Math.sin(t * speed + i) * rX;
        const y = Math.cos(t * speed + i) * rY;

        // tiny hover/float
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${(Math.sin(t*speed + i)*2).toFixed(2)}deg)`;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* left halo */}
      <div className="absolute -left-40 top-10 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.25),transparent_60%)] blur-2xl" />
      {/* top halo */}
      <div className="absolute left-1/3 -top-24 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.28),transparent_60%)] blur-2xl" />
      {/* right halo */}
      <div className="absolute -right-48 top-24 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.24),transparent_60%)] blur-2xl" />

      {/* DOODLES — thin-stroke, school-themed */}
      <svg
        className="absolute left-8 top-28 h-24 w-24 text-white/35"
        data-doodle
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* notebook */}
        <rect x="10" y="8" width="44" height="48" rx="6" />
        <path d="M18 16h28M18 22h28M18 28h28M18 34h18" />
      </svg>

      <svg
        className="absolute right-10 top-32 h-24 w-24 text-white/30"
        data-doodle
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* pencil */}
        <path d="M10 50l8 4 4-8L52 16c2-2 2-6 0-8s-6-2-8 0L14 46l-4 8z" />
      </svg>

      <svg
        className="absolute bottom-28 left-1/2 h-24 w-24 -translate-x-1/2 text-white/25"
        data-doodle
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* ruler */}
        <rect x="6" y="26" width="52" height="12" rx="3" />
        <path d="M12 26v12M20 26v12M28 26v12M36 26v12M44 26v12M52 26v12" />
      </svg>

      <svg
        className="absolute bottom-16 left-10 h-24 w-24 text-white/28"
        data-doodle
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* backpack */}
        <rect x="14" y="22" width="36" height="28" rx="8" />
        <path d="M22 26v-2a10 10 0 0120 0v2M22 36h20" />
      </svg>

      <svg
        className="absolute right-24 bottom-24 h-24 w-24 text-white/28"
        data-doodle
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* compass */}
        <path d="M32 6v14M20 58l12-24 12 24M14 40a18 18 0 1136 0" />
      </svg>
    </div>
  );
}
