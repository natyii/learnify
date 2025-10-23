// src/ui/StudyWorkspace.tsx
"use client";

import { useMemo, useState } from "react";
import StudyChat from "@/ui/StudyChat";
import { SUBJECTS } from "@/core/study";

type SubjectKey = keyof typeof SUBJECTS;
type SubjectOpt = { key: SubjectKey; title: string };

// Allow system to be string or a function returning string
type SystemVal =
  | string
  | ((ctx: { grade: number; subject: SubjectKey }) => string);

export default function StudyWorkspace({
  grade,
  subjects,
}: {
  grade: number;
  subjects?: SubjectOpt[];
}) {
  const list: SubjectOpt[] = Array.isArray(subjects) ? subjects : [];

  const [selected, setSelected] = useState<SubjectOpt | null>(
    list.length > 0 ? list[0] : null
  );

  const sysPrompt = useMemo(() => {
    if (!selected) return "General study assistant.";

    const sys: SystemVal | undefined = (SUBJECTS as any)[selected.key]?.system;
    if (typeof sys === "function") {
      // Evaluate the function with useful context
      return sys({ grade, subject: selected.key });
    }
    if (typeof sys === "string" && sys.trim().length > 0) return sys;

    return "Subject study assistant.";
  }, [selected, grade]);

  return (
    <div className="space-y-5">
      {/* Top card with grade + subject selector */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-black">
              {selected ? `${selected.title} — Grade ${grade}` : `Grade ${grade}`}
            </h2>
            <p className="text-sm text-black/65">Choose a subject to tune the assistant.</p>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-black/75">
            <span className="sr-only">Choose subject</span>
            <select
              aria-label="Choose subject"
              className="rounded-lg border border-black/20 bg-white px-3 py-2 text-black/90"
              value={selected?.key ?? ""}
              onChange={(e) => {
                const key = e.target.value as SubjectKey;
                const found = list.find((s) => s.key === key) ?? null;
                setSelected(found);
              }}
              disabled={list.length === 0}
              title={
                list.length === 0
                  ? "No subjects available for this grade yet"
                  : "Choose subject"
              }
            >
              {list.length === 0 ? (
                <option value="">No subjects available</option>
              ) : (
                list.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.title}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
      </div>

      {/* Chat */}
      <StudyChat
        subjectKey={selected?.key ?? "general"}
        systemPrompt={sysPrompt}
      />
    </div>
  );
}
