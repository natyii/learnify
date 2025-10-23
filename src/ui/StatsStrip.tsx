// src/ui/StatsStrip.tsx
// Small header card that shows the active context (grade / subject / book).
// Hardened against missing props so it never crashes pages.

type Props = {
  subjectKey?: string;          // e.g. "chemistry"
  grade?: number | null;        // e.g. 12
  bookTitle?: string | null;    // optional, when a book is selected
};

function capitalizeSafe(s?: string) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function StatsStrip({ subjectKey, grade, bookTitle }: Props) {
  const subjectLabel = capitalizeSafe(subjectKey);
  const gradeLabel = grade ?? "—";

  return (
    <aside className="hidden lg:block">
      <div className="rounded-2xl border border-zinc-300/60 bg-white/70 backdrop-blur p-4">
        <h3 className="font-semibold text-zinc-900">Active textbook</h3>
        <p className="mt-1 text-sm text-zinc-700">
          Grade {gradeLabel} {subjectLabel}
        </p>

        {bookTitle ? (
          <p className="mt-1 text-sm text-zinc-700">Book: {bookTitle}</p>
        ) : null}

        <p className="mt-3 text-sm text-zinc-700">
          Answers are grounded in your library only. If a page isn’t found, I’ll
          ask for a chapter or page.
        </p>
      </div>
    </aside>
  );
}
