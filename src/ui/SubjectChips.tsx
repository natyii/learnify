"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export type Chip = { key: string; label: string; icon?: ReactNode };

export default function SubjectChips({
  subjects,
  activeKey,
}: {
  subjects: Chip[];
  activeKey: string;
}) {
  const router = useRouter();
  const search = useSearchParams();

  const onSelect = (key: string) => {
    const params = new URLSearchParams(search.toString());
    params.set("subject", key);
    router.push(`/study?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {subjects.map((s) => {
        const active = s.key === activeKey;
        return (
          <button
            key={s.key}
            className={[
              "qa-chip inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
              active
                ? "bg-white/90 border-zinc-300 shadow-sm"
                : "bg-white/60 border-zinc-200 hover:bg-white/80",
            ].join(" ")}
            onClick={() => onSelect(s.key)}
            type="button"
          >
            {s.icon ?? null}
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
