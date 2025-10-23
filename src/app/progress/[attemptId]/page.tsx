// src/app/progress/[attemptId]/page.tsx
import Theme from "@/app/theme";
import { getServerSupabase } from "@/core/supabase/rsc";
import { redirect } from "next/navigation";
import Link from "next/link";
import "../progress.theme.css"; // reuse the same theme

export const dynamic = "force-dynamic";

function toISO(v: any) {
  try {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return new Date(0).toISOString();
}

export default async function AttemptDetail({
  params,
}: {
  params: { attemptId: string };
}) {
  const supabase = await getServerSupabase();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) redirect("/sign-in");

  const attemptId = params.attemptId;

  // Attempt (from normalized view)
  const { data: attemptRows, error: attemptErr } = await supabase
    .from("v_quiz_attempts")
    .select("*")
    .eq("id", attemptId)
    .limit(1);

  if (attemptErr || !attemptRows?.length) {
    return (
      <Theme>
        <div id="progress-root" className="mx-auto max-w-3xl p-6">
          <div className="rounded-2xl bg-white/70 ring-1 ring-black/10 p-6">
            <h1 className="text-xl font-bold">Attempt not found</h1>
            <p className="mt-2 text-slate-600">{attemptErr?.message || "No data for this attempt."}</p>
            <div className="mt-6">
              <Link href="/progress" className="text-indigo-600 font-medium hover:underline">
                ← Back to Progress
              </Link>
            </div>
          </div>
        </div>
      </Theme>
    );
  }

  const attempt = attemptRows[0];

  // Difficulty (optional)
  let difficulty: string | null = null;
  if (attempt.session_id) {
    const { data: s } = await supabase
      .from("quiz_sessions")
      .select("id, difficulty")
      .eq("id", attempt.session_id)
      .limit(1);
    difficulty = s?.[0]?.difficulty ?? null;
  }

  // Answers + items for this attempt
  const { data: answers, error: answersErr } = await supabase
    .from("quiz_answers")
    .select(
      "id, attempt_id, selected_index, item:quiz_items!inner(id, subject, prompt, options, correct_index)"
    )
    .eq("attempt_id", attemptId);

  // Compute stats
  const total = Number(attempt.total || 0);
  const correct_count = Number(attempt.correct_count || 0);
  const pct = total ? Math.round((correct_count * 100) / total) : 0;

  return (
    <Theme>
      <div id="progress-root" className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <Link href="/progress" className="text-indigo-600 font-medium hover:underline">
            ← Back to Progress
          </Link>
        </div>

        <div className="rounded-2xl bg-white/70 ring-1 ring-black/10 p-6 shadow-sm">
          <h1 className="text-2xl font-black">Attempt Review</h1>
          <p className="mt-1 text-slate-600">
            {new Date(toISO(attempt.created_at)).toLocaleString()} · Difficulty:{" "}
            {(difficulty || "Unknown").toString().replace(/^\w/, (c) => c.toUpperCase())}
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MiniKPI label="Score" value={`${pct}%`} />
            <MiniKPI label="Correct" value={`${correct_count}/${total}`} />
            <MiniKPI label="Duration" value={fmtDuration(Number(attempt.duration_ms || 0))} />
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white/70 ring-1 ring-black/10 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Questions</h2>
          {!answers?.length && (
            <div className="mt-3 text-slate-600">No answers recorded for this attempt.</div>
          )}

          <ol className="mt-4 space-y-4">
            {(answers || []).map((ans: any, idx: number) => {
              const item = ans.item || {};
              const options: string[] = Array.isArray(item.options) ? item.options : [];
              const correct = item.correct_index;
              const chosen = ans.selected_index;
              const isCorrect = correct === chosen;
              return (
                <li
                  key={ans.id ?? idx}
                  className="rounded-xl ring-1 ring-black/10 p-4 bg-white/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Q{idx + 1} · {item.subject || "Unknown"}
                      </div>
                      <div className="mt-1 font-medium text-[#0b1220]">
                        {item.prompt || "(No prompt stored)"}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        isCorrect ? "bg-green-100 text-green-800" : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-black/10 p-3">
                      <div className="text-xs text-slate-500 mb-1">Your answer</div>
                      <div className="text-sm">
                        {options[chosen as number] ?? `Choice #${Number(chosen) + 1}`}
                      </div>
                    </div>
                    <div className="rounded-lg border border-black/10 p-3">
                      <div className="text-xs text-slate-500 mb-1">Correct answer</div>
                      <div className="text-sm">
                        {options[correct as number] ?? `Choice #${Number(correct) + 1}`}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Theme>
  );
}

function MiniKPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 ring-1 ring-black/10 px-4 py-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-black text-[#0b1220]">{value}</div>
    </div>
  );
}

function fmtDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")} min`;
}
