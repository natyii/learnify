"use client";
import { useEffect, useRef } from "react";

export default function AmbientGrid() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let raf = 0, t = 0;
    const tick = () => {
      t += 0.0016;
      el.style.backgroundPosition = `${t*40}px ${t*28}px, 0 0, 0 0`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background:
          `radial-gradient(circle at 1px 1px, var(--paper-dots) 1px, transparent 1.5px) 0 0/18px 18px,` +
          `repeating-linear-gradient(to bottom, transparent 0 28px, var(--paper-lines) 28px 29px),` +
          `linear-gradient(90deg, transparent 0 40px, var(--paper-margin) 40px 41px, transparent 41px)`,
      }}
    />
  );
}
