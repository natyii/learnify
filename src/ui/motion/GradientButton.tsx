"use client";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  intent?: "primary" | "secondary";
};

export default function GradientButton({ loading=false, intent="primary", className, children, ...rest }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-full px-5 py-2.5 font-medium",
        "transition-[box-shadow,transform] duration-200",
        "outline-none focus-visible:ring-2 ring-offset-2 ring-offset-transparent",
        intent === "primary"
          ? "text-white bg-gradient-to-tr from-[#433389] to-[#615BDB]"
          : "text-[var(--ink)] bg-white/70",
        "shadow-[0_8px_20px_rgba(67,51,137,.25)]",
        className
      )}
      {...rest}
    >
      {/* animated border */}
      <span className="pointer-events-none absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-[var(--neon)] via-white/50 to-[var(--plasma)] opacity-70" />
      <span className="relative z-10">{children}</span>
      {loading && (
        <span aria-hidden className="absolute right-3 h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
      )}
    </motion.button>
  );
}
