// src/app/study/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import StudyChat from "@/ui/StudyChat";
import {
  getDefaultSubject,
  getTextbooksByGrade,
  getSubjectsForGrade,
  subjectLabelToKeys,
} from "@/core/textbooks";
import { getUserGrade } from "@/core/grade";
import "./study.theme.css";
import StudyTimer from "./StudyTimer"; // <-- added

const SUBJECTS: { key: string; label: string; icon: string }[] = [
  { key: "amharic",               label: "Amharic",               icon: "💬" },
  { key: "english",               label: "English",               icon: "🗣️" },
  { key: "mathematics",           label: "Mathematics",           icon: "➗" },
  { key: "biology",               label: "Biology",               icon: "🧫" },
  { key: "chemistry",             label: "Chemistry",             icon: "⚗️" },
  { key: "physics",               label: "Physics",               icon: "🧲" },
  { key: "geography",             label: "Geography",             icon: "🗺️" },
  { key: "history",               label: "History",               icon: "🪶" },
  { key: "civics",                label: "Civics",                icon: "⚖️" },
  { key: "economics",             label: "Economics",             icon: "✅" },
  { key: "ict",                   label: "ICT",                   icon: "💻" },
  { key: "general",               label: "General",               icon: "⭐" },

  // Additional distinct subjects
  { key: "environmental_science", label: "Environmental Science", icon: "🌿" },
  { key: "arts",                  label: "Arts",                  icon: "🎨" },
  { key: "science",               label: "Science",               icon: "🔬" },
  { key: "cte",                   label: "CTE",                   icon: "🛠️" },
  { key: "social_studies",        label: "Social Studies",        icon: "👥" },
  { key: "health",                label: "Health",                icon: "❤️" },
];

export default async function StudyIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const urlSubjectRaw = (sp?.subject as string | undefined) ?? null;
  const urlSubject = urlSubjectRaw ? urlSubjectRaw.toLowerCase() : null;

  // Optional: allow ?grade= for easy testing without relying on profile
  const urlGradeRaw = (sp?.grade as string | undefined) ?? null;
  const urlGrade = urlGradeRaw && Number.isFinite(Number(urlGradeRaw)) ? Number(urlGradeRaw) : null;

  const grade = urlGrade ?? (await getUserGrade());
  const availableSubjects = grade ? await getSubjectsForGrade(grade) : [];

  if (!grade || availableSubjects.length === 0) {
    return (
      <div id="study-root" className="notebook-bg min-h-[100svh]">
        <header className="mx-auto max-w-6xl px-4 pt-8 pb-4">
          <h1 className="text-center leading-tight">
            <span className="block text-3xl sm:text-4xl font-semibold text-zinc-900">
              Smarter study,
            </span>
            <span className="block text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              tuned for your grade.
            </span>
          </h1>
        </header>
        <main className="mx-auto max-w-6xl px-4 mt-4">
          <section className="rounded-2xl border border-zinc-200/70 bg-white/80 backdrop-blur-sm p-6 text-sm text-zinc-600">
            {grade
              ? "No subjects are configured for your grade yet."
              : "Set your grade in your profile to see available subjects."}
          </section>
        </main>
        <div className="h-6" />
      </div>
    );
  }

  // Only show chips we support AND that exist for this grade
  const supported = new Set(SUBJECTS.map((s) => s.key));
  const visibleKeys = availableSubjects.filter((k) => supported.has(k));
  const VISIBLE_SUBJECTS = SUBJECTS.filter((s) => visibleKeys.includes(s.key));

  const defaultSubject = (await getDefaultSubject()) ?? visibleKeys[0];
  const subjectKey =
    (urlSubject && visibleKeys.includes(urlSubject) ? urlSubject : null) ?? defaultSubject;

  if (urlSubject && urlSubject !== subjectKey) {
    return redirect(`/study?subject=${encodeURIComponent(subjectKey)}`);
  }

  // Pick a book whose normalized subject keys include subjectKey
  const books = await getTextbooksByGrade(grade);
  const preferred =
    books.find((b: any) =>
      subjectLabelToKeys(String(b.subject)).includes(subjectKey)
    ) ?? books[0] ?? null;

  const bookId = preferred?.id ?? null;
  const bookTitle = preferred?.title ?? null;

  const subjectTitle =
    SUBJECTS.find((s) => s.key === subjectKey)?.label ??
    subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);

  return (
    <div id="study-root" className="notebook-bg min-h-[100svh]">
      <header className="mx-auto max-w-6xl px-4 pt-8 pb-4">
        <h1 className="text-center leading-tight">
          <span className="block text-3xl sm:text-4xl font-semibold text-zinc-900">
            Smarter study,
          </span>
          <span className="block text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            tuned for {subjectTitle.toLowerCase()}.
          </span>
        </h1>
      </header>

      {/* SUBJECTS ROW — only valid subjects for this grade */}
      <section className="mx-auto max-w-6xl px-4">
        <nav className="flex flex-wrap gap-2 rounded-2xl p-2 bg-white/55 backdrop-blur-sm border border-zinc-200/60">
          {VISIBLE_SUBJECTS.map((s) => {
            const key = s.key.toLowerCase();
            const active = key === subjectKey;
            const base =
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] border transition";
            return (
              <Link
                key={s.key}
                href={`/study?subject=${s.key}`}
                scroll={false}
                className={[
                  base,
                  active
                    ? "border-emerald-300 bg-emerald-50 text-zinc-900 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25)]"
                    : "border-zinc-200/70 bg-white/70 text-zinc-900 hover:border-zinc-300 hover:bg-white",
                ].join(" ")}
                aria-pressed={active}
                aria-label={`Choose ${s.label}`}
                title={s.label}
              >
                <span aria-hidden className="leading-none">{s.icon}</span>
                <span className="leading-none">{s.label}</span>
              </Link>
            );
          })}
        </nav>
      </section>

      {/* QUICK ACTIONS + CHAT AREA */}
      <main className="mx-auto max-w-6xl px-4 mt-4">
        {/* Track real time spent studying this subject */}
        <StudyTimer subject={subjectKey} />

        <section className="rounded-2xl border border-zinc-200/70 bg-white/80 backdrop-blur-sm">
          <Suspense>
            <StudyChat
              subjectKey={subjectKey}
              grade={grade}
              bookId={bookId}
              bookTitle={bookTitle}
            />
          </Suspense>
        </section>
      </main>

      <div className="h-6" />
    </div>
  );
}
