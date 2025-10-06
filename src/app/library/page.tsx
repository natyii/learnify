import { requireUser } from "@/core/auth";
import { getProfile } from "@/core/profile";
import { getTextbooksByGrade } from "@/core/textbooks";
import Link from "next/link";

export default async function Page() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const grade = Number(profile?.grade ?? 0);

  if (!grade) {
    return (
      <main className="min-h-screen p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Library</h1>
        <p className="text-[var(--muted)]">
          Your grade is missing. Go to <a className="underline" href="/app">/app</a> and set a grade.
        </p>
      </main>
    );
  }

  let textbooks: Awaited<ReturnType<typeof getTextbooksByGrade>>;
  try {
    textbooks = await getTextbooksByGrade(grade);
  } catch (e: any) {
    return (
      <main className="min-h-screen p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Library</h1>
        <div className="rounded-xl p-4 bg-[var(--card)] border border-white/10">
          <p className="text-red-300 font-mono text-sm break-all">
            Failed to load textbooks: {e?.message ?? "unknown error"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Library</h1>
          <p className="text-[var(--muted)]">Grade {grade} textbooks</p>
        </div>
      </div>

      {textbooks.length === 0 ? (
        <div className="rounded-xl p-6 bg-[var(--card)] border border-white/10">
          <p>No textbooks found for grade {grade}.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {textbooks.map(tb => {
            const canSign = !!tb.storagePath;
            const canHttp = !!tb.httpUrl;
            return (
              <li key={String(tb.id)} className="rounded-xl border border-white/10 bg-[var(--card)] p-4">
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{tb.subject || "—"}</p>
                  <h3 className="text-lg font-semibold leading-snug">{tb.title || "Untitled"}</h3>
                </div>
                <div className="flex gap-2">
                  {canSign ? (
                    <Link
                      className="flex-1 text-center rounded-md px-3 py-2 bg-[var(--accent)] text-white"
                      href={`/library/open?path=${encodeURIComponent(tb.storagePath!)}`}
                      target="_blank"
                    >
                      Open PDF
                    </Link>
                  ) : canHttp ? (
                    <Link
                      className="flex-1 text-center rounded-md px-3 py-2 bg-[var(--accent)] text-white"
                      href={tb.httpUrl!}
                      target="_blank"
                    >
                      Open
                    </Link>
                  ) : (
                    <span className="text-[var(--muted)]">Unavailable</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
