"use client";
import { ReactNode } from "react";
import { clsx } from "clsx";

export function FeatureCard({
  icon, title, children, toneIndex = 0,
}: { icon: ReactNode; title: string; children: ReactNode; toneIndex?: 0|1|2|3|4 }) {
  const accents = [
    "from-emerald-400/30 via-cyan-400/20 to-transparent",
    "from-sky-400/30 via-indigo-400/20 to-transparent",
    "from-amber-400/30 via-rose-400/20 to-transparent",
    "from-violet-400/30 via-fuchsia-400/20 to-transparent",
    "from-teal-400/30 via-emerald-400/20 to-transparent",
  ];
  return (
    <div className={clsx(
      "relative overflow-hidden rounded-3xl p-5 border",
      "border-white/20 bg-white/35 backdrop-blur-xl",
      "shadow-[0_10px_50px_rgba(0,0,0,0.10)]"
    )}>
      <div aria-hidden className={clsx(
        "pointer-events-none absolute inset-0 -z-10 opacity-60",
        "bg-gradient-to-br", accents[toneIndex]
      )}/>
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/60 text-black/80 border border-white/40">
          {icon}
        </div>
        <div className="text-[13px] tracking-wide text-black/60">DETAILS</div>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-black">{title}</h3>
      <p className="mt-1 text-[15px] text-black/75">{children}</p>
    </div>
  );
}
export default FeatureCard;
