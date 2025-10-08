"use client";
import clsx from "clsx";

export default function AvatarOrb({ thinking = false, className }: { thinking?: boolean; className?: string }) {
  return (
    <div className={clsx("relative h-8 w-8", className)}>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#bfe3ff,#89CFF0,transparent_60%)]" />
      <div className="absolute inset-0 rounded-full bg-white/30 mix-blend-overlay" />
      <div
        aria-hidden
        className={clsx(
          "absolute inset-0 rounded-full ring-2 ring-[#89CFF0]/40",
          thinking && "animate-pulse [animation-duration:1600ms]"
        )}
      />
    </div>
  );
}
