"use client";
import Link from "next/link";
import { clsx } from "clsx";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
};

export function GlowButton({ href, children, className, variant = "primary" }: Props) {
  if (variant === "secondary") {
    // Glass/white variant with strong contrast on light themes
    return (
      <Link
        href={href}
        className={clsx(
          "relative inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium",
          "border border-black/20 bg-white/85 backdrop-blur-sm text-black/90",
          "shadow-[0_6px_16px_rgba(0,0,0,0.08)] ring-emerald-300/40",
          "hover:bg-white focus:outline-none focus:ring-2",
          className
        )}
      >
        {children}
      </Link>
    );
  }

  // Primary: premium emerald-teal glow with subtle inner light
  return (
    <Link
      href={href}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-black",
        "bg-[linear-gradient(180deg,#9ff8cf_0%,#50e3a7_60%,#39d49a_100%)]",
        "border border-emerald-500/80 shadow-[0_12px_28px_rgba(16,185,129,0.28)]",
        "before:absolute before:inset-[-2px] before:rounded-[14px] before:bg-[radial-gradient(100%_100%_at_50%_0%,rgba(16,185,129,0.35),transparent_55%)] before:-z-10",
        "hover:brightness-[1.05] focus:outline-none focus:ring-2 focus:ring-emerald-300/60",
        className
      )}
    >
      {children}
    </Link>
  );
}
