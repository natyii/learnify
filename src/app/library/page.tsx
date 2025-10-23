// Server Component
import Link from "next/link";
import { serverSupabase } from "@/core/supabase/server";
import s from "./library.theme.module.css"; // CSS Module import

// If you already have stronger typing, keep yours.
type TextbookRow = {
  id: string;
  title: string;
  subject: string;
  grade: number | null;
  storage_path: string | null; // used by API route; may be null for some rows
};

async function getUserGrade() {
  const supabase = await serverSupabase();
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes?.user?.id;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("grade")
    .eq("user_id", userId)
    .maybeSingle();

  return (profile?.grade ?? null) as number | null;
}

async function getTextbooksByGrade(grade: number | null) {
  const supabase = await serverSupabase();

  // If grade is null, show nothing rather than throw.
  if (grade === null) return [] as TextbookRow[];

  const { data } = await supabase
    .from("textbooks")
    .select("id, title, subject, grade, storage_path")
    .eq("grade", grade)
    .order("subject", { ascending: true })
    .order("title", { ascending: true });

  return (data ?? []) as TextbookRow[];
}

export default async function LibraryPage() {
  const grade = await getUserGrade();
  const books = await getTextbooksByGrade(grade);

  return (
    // Full-width theme wrapper so the parchment + lines fill the page
    <div className={s.libraryTheme}>
      <section className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <h1 className={`${s.libraryTitle} text-2xl font-semibold`}>Library</h1>
          <p className="text-sm text-muted-foreground">
            {grade === null
              ? "No grade set on your profile."
              : `Showing textbooks for Grade ${grade}.`}
          </p>
        </header>

        {grade === null ? (
          <div className="rounded-lg border p-4 text-sm">
            Update your profile grade to see textbooks.
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm">
            No textbooks found for Grade {grade}.
          </div>
        ) : (
          <ul className={`space-y-3 ${s.libraryList}`}>
            {books.map((book) => (
              <li
                key={book.id}
                className={`${s.libraryCard} flex items-center justify-between gap-4 rounded-lg border p-4`}
              >
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    {book.subject}
                  </div>
                  <div className="truncate font-medium">{book.title}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* OPEN PDF — hits the API route and opens a signed URL in a new tab */}
                  <a
                    href={`/api/textbooks/open?id=${book.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.btnPrimary}
                  >
                    Open PDF
                  </a>

                  {/* STUDY — outline style */}
                  <Link
                    href={`/study?subject=${encodeURIComponent(book.subject)}`}
                    className={s.btnOutline}
                  >
                    Study
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
