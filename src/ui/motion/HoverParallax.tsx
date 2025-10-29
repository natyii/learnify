"use client";
import { ReactNode, useRef } from "react";

type Props = { children: ReactNode; maxTilt?: number; className?: string };

export default function HoverParallax({ children, maxTilt = 2.5, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={(e) => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (y - 0.5) * -maxTilt;
        const ry = (x - 0.5) *  maxTilt;
        el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      }}
      onMouseLeave={() => {
        const el = ref.current; if (!el) return;
        el.style.transform = "perspective(600px) rotateX(0) rotateY(0)";
      }}
      style={{ transition: "transform .2s ease-out", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
