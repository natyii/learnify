// src/app/api/quiz/attempt/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRouteSupabase } from "@/core/supabase/route";

const BodySchema = z.object({
  session_id: z.string().uuid(),
  answers: z.array(
    z.object({
      item_id: z.string().uuid(),
      selected_index: z.number().int().min(0),
    })
  ).min(1),
});

export async function POST(req: Request) {
  try {
    const supabase = await getRouteSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { session_id, answers } = parsed.data;

    // 1) Verify the session belongs to this user
    const { data: sessionRow, error: sessionErr } = await supabase
      .from("quiz_sessions")
      .select("id, user_id, question_count")
      .eq("id", session_id)
      .maybeSingle();

    if (sessionErr) return NextResponse.json({ error: sessionErr.message }, { status: 500 });
    if (!sessionRow) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (sessionRow.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2) Load items for that session to grade server-side
    const { data: items, error: itemsErr } = await supabase
      .from("quiz_items")
      .select("id, correct_index")
      .eq("session_id", session_id);

    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    if (!items?.length) return NextResponse.json({ error: "No items to grade" }, { status: 400 });

    const correctMap = new Map<string, number>();
    for (const it of items) correctMap.set(it.id as string, it.correct_index as number);

    // 3) Grade
    let correct = 0;
    const graded = answers.map(a => {
      const ci = correctMap.get(a.item_id);
      const is_correct = ci !== undefined && a.selected_index === ci;
      if (is_correct) correct++;
      return { ...a, is_correct };
    });

    const total = items.length;
    const score_percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    // 4) Insert attempt (uses session_id per our SQL fix)
    const { data: attempt, error: attErr } = await supabase
      .from("quiz_attempts")
      .insert({
        session_id,
        user_id: user.id,
        score: correct,
        total,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (attErr || !attempt) {
      return NextResponse.json({ error: attErr?.message ?? "Failed to save attempt" }, { status: 500 });
    }

    // 5) Insert answers
    const answerRows = graded.map(g => ({
      attempt_id: attempt.id,
      item_id: g.item_id,
      selected_index: g.selected_index,
      is_correct: g.is_correct,
    }));

    const { error: insAnsErr } = await supabase
      .from("quiz_answers")
      .insert(answerRows);

    if (insAnsErr) {
      return NextResponse.json({ error: insAnsErr.message }, { status: 500 });
    }

    return NextResponse.json({
      correct,
      total,
      score_percent,
      answers: graded,
      attempt_id: attempt.id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
