import { clsx } from "clsx";

export function PrimaryButton({ className, children, ...props }: any) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-xl px-6 py-3 font-medium text-black",
        "bg-[linear-gradient(180deg,#8af1c1,#55e3a6)] border border-emerald-300",
        "shadow-[0_10px_25px_rgba(16,185,129,0.25)] hover:brightness-105 active:brightness-95",
        "focus:outline-none focus:ring-2 focus:ring-emerald-300/60",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ className, children, ...props }: any) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-xl px-6 py-3 font-medium",
        "bg-white/70 text-black border border-[rgba(206,190,130,0.65)] backdrop-blur-[3px]",
        "hover:bg-white/85 active:bg-white/70",
        "focus:outline-none focus:ring-2 focus:ring-[rgba(206,190,130,0.6)]",
        className
      )}
    >
      {children}
    </button>
  );
}
