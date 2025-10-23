"use client";
import { useEffect, useRef } from "react";

/**
 * 2050-style floating doodles:
 * Glowing geometric outlines drifting slowly with scroll parallax.
 * They stay visible on any background (light or dark).
 */
export default function ParallaxDoodles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const handle = () => {
      const y = window.scrollY;
      root.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        const depth = parseFloat(el.dataset.depth || "0.1");
        el.style.transform = `translateY(${y * depth}px)`;
      });
    };
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <GlowShape className="left-[5%] top-[20%]" size={180} color="#22c55e" depth={0.05} rotate />
      <GlowShape className="right-[10%] top-[10%]" size={220} color="#06b6d4" depth={0.03} rotate />
      <GlowShape className="right-[5%] bottom-[15%]" size={200} color="#818cf8" depth={0.08} rotate />
      <GlowShape className="left-[8%] bottom-[20%]" size={160} color="#f59e0b" depth={0.06} rotate />
      <GlowShape className="left-[40%] top-[60%]" size={120} color="#ec4899" depth={0.1} />
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function GlowShape({
  className = "",
  size = 150,
  color = "#22c55e",
  depth = 0.05,
  rotate = false,
}: {
  className?: string;
  size?: number;
  color?: string;
  depth?: number;
  rotate?: boolean;
}) {
  return (
    <div
      data-depth={depth}
      className={`${className} absolute`}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 15px ${color}60) drop-shadow(0 0 35px ${color}30)`,
        animation: rotate ? "float 20s linear infinite" : "float 12s ease-in-out infinite",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeOpacity="0.8"
      >
        <polygon
          points="100,10 190,60 160,180 40,180 10,60"
          stroke={color}
          strokeWidth="4"
          fill="none"
        />
        <circle cx="100" cy="100" r="35" stroke={color} strokeWidth="4" />
      </svg>
    </div>
  );
}
