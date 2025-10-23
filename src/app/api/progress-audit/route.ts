// src/app/api/progress-audit/route.ts
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/core/supabase/rsc";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getServerSupabase();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  // 1) Attempts from normalized view
  const { data: attempts, error: attemptsErr } = await supabase
    .from("v_quiz_attempts")
    .select("id, total, correct_count, session_id, created_at, user_id")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(200);

  const filteredAttempts =
    (attempts || []).filter(
      (r: any) => !("user_id" in r) || r.user_id === user.id
    );

  // Difficulty breakdown (join quiz_sessions)
  let difficulty: Record<string, number> = { easy: 0, medium: 0, hard: 0, unknown: 0 };
  try {
    const sessionIds = Array.from(
      new Set(filteredAttempts.map((a: any) => a.session_id).filter(Boolean))
    );
    if (sessionIds.length) {
      const { data: sess } = await supabase
        .from("quiz_sessions")
        .select("id, difficulty")
        .in("id", sessionIds as string[]);
      const map = new Map((sess || []).map((s: any) => [s.id, s.difficulty || "unknown"]));
      for (const a of filteredAttempts) {
        const d = (map.get(a.session_id) || "unknown") as "easy" | "medium" | "hard" | "unknown";
        difficulty[d] = (difficulty[d] || 0) + 1;
      }
    } else {
      difficulty.unknown = filteredAttempts.length;
    }
  } catch {
    difficulty.unknown = filteredAttempts.length;
  }

  // 2) Answers scoped to those attempts
  const attemptIds = filteredAttempts.map((a: any) => a.id);
  let answers: any[] = [];
  if (attemptIds.length) {
    const { data: ans } = await supabase
      .from("quiz_answers")
      .select("attempt_id, selected_index, item:quiz_items!inner(id, subject, correct_index)")
      .in("attempt_id", attemptIds);
    answers = ans || [];
  }

  // Subject stats
  const subjectStats: Record<string, { total: number; correct: number }> = {};
  for (const a of answers) {
    const s = (a.item?.subject || "Unknown") as string;
    const wasCorrect = a.item?.correct_index === a.selected_index;
    subjectStats[s] = subjectStats[s] || { total: 0, correct: 0 };
    subjectStats[s].total += 1;
    subjectStats[s].correct += wasCorrect ? 1 : 0;
  }

  // 3) Study from normalized view
  const { data: studyRows, error: studyErr } = await supabase
    .from("v_study_sessions")
    .select("created_at, duration_ms, user_id")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true });

  const filteredStudy =
    (studyRows || []).filter(
      (r: any) => !("user_id" in r) || r.user_id === user.id
    );

  // 14-day daily minutes
  const now = new Date();
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const last14Keys: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    last14Keys.push(dayKey(d));
  }
  const studyMap: Record<string, number> = Object.fromEntries(last14Keys.map((k) => [k, 0]));
  let totalStudyMs = 0;
  for (const s of filteredStudy) {
    const k = dayKey(new Date(s.created_at));
    const ms = Math.max(0, Number(s.duration_ms || 0));
    totalStudyMs += ms;
    if (k in studyMap) studyMap[k] += ms;
  }
  const daily = last14Keys.map((k) => ({
    day: k,
    minutes: Math.round((studyMap[k] || 0) / 60000),
  }));

  // Final metrics
  const attemptsForAvg = filteredAttempts.slice(0, 50).filter((a: any) => (a.total ?? 0) > 0);
  const avgScore = attemptsForAvg.length
    ? attemptsForAvg.reduce((acc: number, a: any) => acc + (a.correct_count * 100.0) / a.total, 0) /
      attemptsForAvg.length
    : 0;

  const payload = {
    window_since: sinceIso,
    attempts_count: filteredAttempts.length,
    avg_score: Math.round(avgScore),
    difficulty,
    study_minutes_total: Math.round(totalStudyMs / 60000),
    daily,
    subjects: Object.entries(subjectStats).map(([subject, v]) => ({
      subject,
      total: v.total,
      correct: v.correct,
      accuracy: v.total ? Math.round((v.correct * 100) / v.total) : 0,
    })),
    errors: {
      attempts: attemptsErr?.message ?? null,
      study: studyErr?.message ?? null,
    },
  };

  return NextResponse.json(payload);
}
