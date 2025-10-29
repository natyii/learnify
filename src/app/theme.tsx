"use client";
import { PropsWithChildren, useEffect, useRef } from "react";

export default function Theme({ children }: PropsWithChildren) {
  const gridRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 800 || navigator.hardwareConcurrency < 4);

    if (isMobile) return; // 💤 auto-pause on mobile

    let t = 0;
    let raf = 0;
    const el = gridRef.current!;
    const tick = () => {
      t += 0.0008;
      el.style.backgroundPosition = `${t * 60}px ${t * 40}px, 0 0, 0 0`;
      if (lightRef.current) {
        lightRef.current.style.backgroundPosition = `${t * 20}px ${t * 12}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="min-h-[100svh] antialiased text-[#0b1220] selection:bg-emerald-200/60 selection:text-black relative overflow-hidden"
    >
      {/* Animated grid */}
      <div
        ref={gridRef}
        aria-hidden
        className="absolute inset-0 -z-20 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,.06) 1px, transparent 1.5px) 0 0/24px 24px,
            repeating-linear-gradient(to bottom, transparent 0 28px, rgba(97,91,219,.12) 28px 29px),
            linear-gradient(90deg, transparent 0 40px, rgba(255,59,48,.18) 40px 41px, transparent 41px)
          `,
          backgroundColor: "#FAF7EF",
        }}
      />

      {/* Moving light overlay */}
      <div
        ref={lightRef}
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 120% at 20% 0%, rgba(97,91,219,0.18), rgba(50,230,183,0.15) 40%, transparent 70%)",
          mixBlendMode: "soft-light",
          backgroundSize: "300% 300%",
        }}
      />

      {children}
    </div>
  );
}
