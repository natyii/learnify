"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SubjectRow = { subject: string; grade: number };

export default function StudySubjectList() {
  const router = useRouter();
  const params = useSearchParams();
  const active = (params.get("subject") || "").toLowerCase();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/study/subjects", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (json.error) {
          setError(json.error);
          setSubjects([]);
        } else {
          setSubjects(json.subjects || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load subjects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="px-3 py-2 text-xs text-zinc-500">Loading subjects…</div>;
  }
  if (error) {
    return <div className="px-3 py-2 text-xs text-red-600">Subjects: {error}</div>;
  }
  if (!subjects.length) {
    return <div className="px-3 py-2 text-xs text-zinc-500">No subjects for your grade.</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {subjects.map((s) => {
        const isActive = s.subject.toLowerCase() === active;
        return (
          <button
            key={s.subject.toLowerCase()}
            onClick={() =>
              router.push(`/study?subject=${encodeURIComponent(s.subject)}`)
            }
            className={[
              "w-full text-left rounded-lg px-3 py-2 transition",
              isActive
                ? "bg-emerald-600/10 text-emerald-700 border border-emerald-600/30"
                : "hover:bg-zinc-100 text-zinc-800 border border-transparent",
            ].join(" ")}
          >
            {s.subject}
          </button>
        );
      })}
    </div>
  );
}
