// src/app/homework/page.tsx
import { Suspense } from "react";
import { getUserGrade } from "@/core/grade";
import { getDefaultSubject, getSubjectsForGrade } from "@/core/textbooks";
import HomeworkShell from "@/ui/HomeworkShell";
import "./homework.theme.css";

const SUBJECTS: { key: string; label: string; icon: string }[] = [
  { key: "amharic", label: "Amharic", icon: "💬" },
  { key: "english", label: "English", icon: "🗣️" },
  { key: "mathematics", label: "Mathematics", icon: "➗" },
  { key: "biology", label: "Biology", icon: "🧫" },
  { key: "chemistry", label: "Chemistry", icon: "⚗️" },
  { key: "physics", label: "Physics", icon: "🧲" },
  { key: "geography", label: "Geography", icon: "🗺️" },
  { key: "history", label: "History", icon: "🪶" },
  { key: "civics", label: "Civics", icon: "⚖️" },
  { key: "economics", label: "Economics", icon: "✅" },
  { key: "ict", label: "ICT", icon: "💻" },
  { key: "arts", label: "Arts", icon: "🎨" },
  { key: "science", label: "Science", icon: "🔬" },
  { key: "cte", label: "CTE", icon: "🛠️" },
  { key: "social_studies", label: "Social Studies", icon: "👥" },
  { key: "health", label: "Health", icon: "❤️" },
  { key: "environmental_science", label: "Environmental Science", icon: "🌿" },
  { key: "general", label: "General", icon: "⭐" },
];

export default async function HomeworkPage() {
  const grade = await getUserGrade();
  const available = grade ? await getSubjectsForGrade(grade) : [];
  const supported = new Set(SUBJECTS.map(s => s.key));
  const visible = SUBJECTS.filter(s => available.includes(s.key) && supported.has(s.key));

  const defaultSubject = (await getDefaultSubject()) ?? (visible[0]?.key ?? "english");

  return (
    <div id="homework-root" className="min-h-[100svh]">
      <header className="mx-auto max-w-6xl px-4 pt-8 pb-4">
        <h1 className="text-center leading-tight">
          <span className="block text-3xl sm:text-4xl font-semibold text-zinc-900">
            Homework,
          </span>
          <span className="block text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            organized and simple.
          </span>
        </h1>
      </header>

      <main className="mx-auto max-w-6xl px-4 mt-2">
        <Suspense>
          <HomeworkShell
            grade={grade ?? 0}
            subjects={visible}
            defaultSubjectKey={defaultSubject}
          />
        </Suspense>
      </main>

      <div className="h-6" />
    </div>
  );
}
