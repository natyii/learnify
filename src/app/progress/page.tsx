// src/app/progress/page.tsx
// Progress dashboard (server) — Lifetime stats, user-specific, real data only.
// Does not assume a particular timestamp column; it normalizes from any of several candidates.

import { redirect } from "next/navigation";
import Theme from "@/app/theme";
import { getServerSupabase } from "@/core/supabase/rsc";
import ProgressView from "@/ui/progress/ProgressView";
import "./progress.theme.css";

export const dynamic = "force-dynamic";

// ---------- helpers ----------
function toISO(v: any) {
  try {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return new Date(0).toISOString();
}
function pickFirstKey<T extends Record<string, any>>(row: T, keys: string[]) {
  for (const k of keys) if (k in row && row[k] != null) return { key: k, value: row[k] };
  return null;
}

export default async function ProgressPage({
  searchParams,
}: {
  // Await to avoid Next.js sync dynamic API warning
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await getServerSupabase();

  // Auth
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) redirect("/sign-in");

  await searchParams; // resolved (not used right now)

  // -------------------------
  // 1) Attempts (LIFETIME) — PER USER, schema-agnostic timestamp
  // -------------------------
  let attemptsErr: string | null = null;
  let attemptsRows: any[] = [];

  try {
    // Select * so we can discover which timestamp column exists.
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", user.id) // ✅ user scoped
      .order("id", { ascending: false }) // neutral; we'll sort by detected timestamp later
      .limit(2000);

    attemptsRows = data ?? [];
    if (error) attemptsErr = error.message ?? String(error);
  } catch (e: any) {
    attemptsErr = e?.message || "attempts load failed";
  }

  // Normalize attempts → {id, created_at, total, correct_count}
  const attempts = (attemptsRows || [])
    .map((a) => {
      const ts =
        pickFirstKey(a, [
          "created_at",
          "started_at",
          "submitted_at",
          "inserted_at",
          "timestamp",
          "createdOn",
        ]) || { key: "created_at", value: null };

      return {
        id: String(a.id),
        created_at: toISO(ts.value),
        total: Number(a.total ?? a.questions ?? a.items_total ?? 0),
        correct_count: Number(a.correct_count ?? a.correct ?? 0),
      };
    })
    // sort newest first by detected timestamp
    .sort((x, y) => +new Date(y.created_at) - +new Date(x.created_at));

  // last 30 days attempts count for KPI context (from detected timestamp)
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const attemptsLast30 = attempts.filter(
    (a) => new Date(a.created_at) >= since30
  ).length;

  // -------------------------
  // 2) Answers (per user) — only for these attempts
  // -------------------------
  let answersErr: string | null = null;
  let answers: any[] = [];
  try {
    if (attempts.length) {
      const attemptIds = attempts.map((a) => a.id);
      const { data, error } = await supabase
        .from("quiz_answers")
        .select(
          "attempt_id, selected_index, item:quiz_items!inner(id, subject, correct_index)"
        )
        .in("attempt_id", attemptIds);

      answers = data ?? [];
      if (error) answersErr = error.message ?? String(error);
    }
  } catch (e: any) {
    answersErr = e?.message || "answers load failed";
  }

  const payload = {
    attempts, // lifetime (user only)
    answers,  // lifetime (user only)
    meta: { attemptsLast30 },
    errors: { attempts: attemptsErr, answers: answersErr },
  };

  return (
    <Theme>
      <div id="progress-root">
        <ProgressView payload={payload} />
      </div>
    </Theme>
  );
}
