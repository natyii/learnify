import { ReactNode } from "react";

export function FeatureCard({
  icon,
  title,
  children,
}: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.012] backdrop-blur-md p-5 hover:bg-white/[0.022] hover:border-white/[0.10] transition-colors">
      <div className="mb-2 flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
          {icon}
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="text-sm text-[var(--muted)]">{children}</div>
    </div>
  );
}
