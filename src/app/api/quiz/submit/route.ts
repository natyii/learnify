// src/app/api/quiz/submit/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/core/supabase/rsc";

// ---------- input schema ----------
const BodySchema = z.object({
  // This is quiz_sessions.id (UUID in your DB)
  session_id: z.string().min(1),
  // answers collected from the UI for this session
  answers: z.array(
    z.object({
      item_id: z.union([z.string(), z.number()]), // quiz_items.id (BIGINT)
      selected_index: z.number().int().min(0).max(3),
    })
  ).min(1),
});

type AnswerRow = z.infer<typeof BodySchema>["answers"][number];

export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();

    // auth
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { session_id, answers } = parsed.data;

    // 1) verify session belongs to this user
    const { data: sessionRow, error: sessErr } = await supabase
      .from("quiz_sessions")
      .select("id, user_id")
      .eq("id", session_id)
      .maybeSingle();

    if (sessErr) {
      return NextResponse.json({ error: sessErr.message }, { status: 500 });
    }
    if (!sessionRow || sessionRow.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2) load correct answers for these items, but only if they belong to this session
    const itemIds = answers.map((a) =>
      typeof a.item_id === "string" ? Number(a.item_id) : a.item_id
    ).filter((n) => Number.isFinite(n)) as number[];

    if (itemIds.length === 0) {
      return NextResponse.json({ error: "No valid item ids" }, { status: 400 });
    }

    const { data: items, error: itemsErr } = await supabase
      .from("quiz_items")
      .select("id, session_id, correct_index")
      .eq("session_id", session_id)
      .in("id", itemIds);

    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No matching items for this session" }, { status: 400 });
    }

    // Map for quick lookup
    const byId = new Map<number, { correct_index: number }>();
    for (const it of items) {
      const idNum = typeof it.id === "string" ? Number(it.id) : (it.id as number);
      byId.set(idNum, { correct_index: Number(it.correct_index) });
    }

    // 3) calculate score
    let score = 0;
    const graded = answers.map((a: AnswerRow) => {
      const idNum = typeof a.item_id === "string" ? Number(a.item_id) : (a.item_id as number);
      const meta = byId.get(idNum);
      const is_correct = !!meta && a.selected_index === meta.correct_index;
      if (is_correct) score += 1;
      return {
        attempt_id: "", // fill after attempt insert
        item_id: idNum,
        selected_index: a.selected_index,
        is_correct,
      };
    });

    const total = answers.length;
    // if you like percent as integer 0-100:
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;

    // 4) insert attempt (note: your table uses quiz_id, not session_id)
    const { data: attempt, error: attErr } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: session_id,      // <-- important: your schema column name
        user_id: user.id,
        score,
        total,
        // started_at has default now(), completed_at can stay null or set now()
        completed_at: new Date().toISOString(),
      })
      .select("id, quiz_id, user_id, score, total, started_at, completed_at")
      .single();

    if (attErr || !attempt) {
      return NextResponse.json({ error: attErr?.message ?? "Failed to save attempt" }, { status: 500 });
    }

    // 5) insert answers, now that we know attempt_id
    const answerRows = graded.map((g) => ({
      attempt_id: attempt.id,
      item_id: g.item_id,
      selected_index: g.selected_index,
      is_correct: g.is_correct,
    }));

    const { error: ansErr } = await supabase
      .from("quiz_answers")
      .insert(answerRows);

    if (ansErr) {
      // Not fatal to the score record, but let’s surface it
      return NextResponse.json({
        warning: "Attempt saved, but answers failed to save.",
        attempt: {
          attempt_id: attempt.id,
          session_id: attempt.quiz_id,
          score: attempt.score,
          total: attempt.total,
          percent,
          completed_at: attempt.completed_at,
        },
        error: ansErr.message,
      }, { status: 207 }); // 207 Multi-Status: partial success
    }

    // 6) success payload
    return NextResponse.json({
      attempt: {
        attempt_id: attempt.id,
        session_id: attempt.quiz_id,
        score: attempt.score,
        total: attempt.total,
        percent,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at,
      },
      breakdown: graded.map(g => ({
        item_id: g.item_id,
        selected_index: g.selected_index,
        is_correct: g.is_correct,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
