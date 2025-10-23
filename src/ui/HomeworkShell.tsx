// src/ui/HomeworkShell.tsx
"use client";

import { useMemo, useState } from "react";
import HomeworkChat from "@/ui/HomeworkChat";

type Subject = { key: string; label: string; icon: string };

export default function HomeworkShell({
  grade,
  subjects,
  defaultSubjectKey,
}: {
  grade: number;
  subjects: Subject[];
  defaultSubjectKey: string;
}) {
  const [active, setActive] = useState<string>(defaultSubjectKey);

  const activeLabel = useMemo(
    () => subjects.find(s => s.key === active)?.label ?? active,
    [subjects, active]
  );

  return (
    <>
      {/* Subject chips (clickable, with active highlight) */}
      <section className="mb-3">
        <nav className="flex flex-wrap gap-2 rounded-2xl p-2 bg-white/55 backdrop-blur-sm border border-zinc-200/60">
          {subjects.map((s) => {
            const isActive = s.key === active;
            const base =
              "subject-chip inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] border transition cursor-pointer select-none";
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                className={[
                  base,
                  isActive
                    ? "border-emerald-300 bg-emerald-50 text-zinc-900 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25)]"
                    : "border-zinc-200/70 bg-white/70 text-zinc-900 hover:border-zinc-300 hover:bg-white",
                ].join(" ")}
                title={s.label}
              >
                <span aria-hidden className="leading-none">{s.icon}</span>
                <span className="label leading-none">{s.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="text-xs text-zinc-600 mt-2">Grade: {grade} • Subject: {activeLabel}</div>
      </section>

      {/* Chat (subject-aware) */}
      <section className="paper-card p-3 sm:p-4">
        <HomeworkChat subjectKey={active} grade={grade} />
      </section>
    </>
  );
}
