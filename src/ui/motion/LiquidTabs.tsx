"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

type Tab = { id: string; label: string };
type Props = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export default function LiquidTabs({ tabs, activeId, onChange, className }: Props) {
  return (
    <div className={clsx("relative inline-flex items-center gap-2 p-1 rounded-full bg-white/70 border border-[var(--card-border)]", className)}>
      <div className="relative flex">
        {tabs.map((t) => {
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={clsx(
                "relative z-10 px-3 py-1.5 rounded-full text-sm transition-colors",
                isActive ? "text-black" : "text-[var(--ink-muted)]"
              )}
            >
              {t.label}
              {isActive && (
                <motion.span
                  layoutId="liquid-pill"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[var(--plasma)]/40 to-[var(--neon)]/40 backdrop-blur-sm"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
