import { ReactNode } from "react";
import clsx from "clsx";

export function GlassCard({
  children,
  className,
}: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-black/10",
        "bg-[var(--glass)] backdrop-blur-md",
        "shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Soft academia sticky tab */
export function PaperTab({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        "absolute -top-3 left-1/2 -translate-x-1/2 h-3 w-28 rounded-md",
        "bg-[#FDE9A9] opacity-90 shadow-sm border border-black/10",
        className
      )}
    />
  );
}
