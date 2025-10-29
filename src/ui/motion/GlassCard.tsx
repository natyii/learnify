"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "violet" | "mint" | "amber";
  interactive?: boolean;
};

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  default: "from-[rgba(124,140,255,.16)] to-[rgba(50,230,183,.14)]",
  violet:  "from-[rgba(139,92,246,.18)] to-[rgba(124,140,255,.14)]",
  mint:    "from-[rgba(50,230,183,.18)] to-[rgba(124,140,255,.12)]",
  amber:   "from-[rgba(255,177,78,.18)] to-[rgba(124,140,255,.10)]",
};

export default function GlassCard({ children, className, tone="default", interactive=true }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={interactive ? { y: -2 } : undefined}
      className={clsx(
        "relative rounded-3xl p-5 md:p-6",
        "bg-[var(--card-bg)] border border-[var(--card-border)]",
        "shadow-[0_10px_30px_rgba(0,0,0,.06)] overflow-hidden",
        "isolate",
        className
      )}
    >
      {/* halo */}
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -inset-px -z-[1]",
          `bg-gradient-to-br ${toneMap[tone]} opacity-90`,
          "rounded-[inherit] blur-xl"
        )}
      />
      {/* subtle shimmer on scroll */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] overflow-hidden"
      >
        <div className="absolute -inset-x-10 -inset-y-1 bg-[var(--shimmer)] opacity-[.08] translate-x-[-100%] will-change-transform [animation:gc-shimmer_8s_linear_infinite]" />
      </div>
      <style jsx>{`
        @keyframes gc-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      {children}
    </motion.div>
  );
}
