// src/app/api/quiz/session/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRouteSupabase } from "@/core/supabase/route";
import { generateMCQsFromPages } from "@/lib/quiz/generateFromPages";
import { getActiveTextbookId, getPagesForRanges } from "@/core/grounding/pages";
import { getQuizAI, getQuizModel } from "@/lib/ai/quizClient";

const BodySchema = z.object({
  grade: z.number().int().min(1).max(12).optional(),
  selections: z.array(z.object({
    subject: z.string().min(1),
    pages: z.array(z.object({
      start: z.number().int().min(1),
      end: z.number().int().min(1),
    })).min(1),
    chapters: z.array(z.string()).optional(),
  })).min(1),
  count: z.number().int().min(1).max(100),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export async function POST(req: Request) {
  try {
    const supabase = await getRouteSupabase(); // R/W client (cookies ok)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { grade, selections, count, difficulty } = parsed.data;

    // Resolve grade from profile if not provided
    let resolvedGrade = grade ?? null;
    if (!resolvedGrade) {
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("grade")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
      if (!profile?.grade) return NextResponse.json({ error: "Grade not found on profile" }, { status: 400 });
      const g = typeof profile.grade === "string" ? parseInt(profile.grade, 10) : Number(profile.grade);
      if (!Number.isFinite(g)) return NextResponse.json({ error: "Invalid grade on profile" }, { status: 400 });
      resolvedGrade = g;
    }

    // Collect pages for all subjects/ranges
    type PageRow = { id: number; page_number: number; text_content: string | null };
    const allPageIds: number[] = [];
    const pagesForAI: PageRow[] = [];

    for (const sel of selections) {
      const tbId = await getActiveTextbookId(supabase, resolvedGrade, sel.subject);
      if (!tbId) {
        return NextResponse.json(
          { error: `No textbook found for ${sel.subject} (grade ${resolvedGrade})` },
          { status: 400 },
        );
      }

      const pages = await getPagesForRanges(
        supabase,
        tbId,
        sel.pages.map(r => ({ start: Math.min(r.start, r.end), end: Math.max(r.start, r.end) })),
      );

      if (!pages.length) {
        return NextResponse.json(
          { error: `No pages in selected ranges for ${sel.subject}` },
          { status: 400 },
        );
      }

      for (const p of pages) {
        allPageIds.push(p.id);
        pagesForAI.push(p);
      }
    }

    if (allPageIds.length === 0) {
      return NextResponse.json({ error: "No grounding pages provided" }, { status: 400 });
    }

    // Only pages with actual text are usable for AI grounding
    const pagesWithText = pagesForAI.filter(p => p.text_content && p.text_content.trim().length > 0);

    // Create session (so the user still has a record even if AI fails)
    const { data: session, error: insErr } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: user.id,
        grade: resolvedGrade,
        difficulty,
        question_count: count,
      })
      .select("*")
      .single();
    if (insErr || !session) {
      return NextResponse.json({ error: insErr?.message ?? "Failed to create session" }, { status: 500 });
    }

    // Link session -> pages
    const linkRows = allPageIds.map(pid => ({ session_id: session.id, page_id: pid }));
    const { error: linkErr } = await supabase.from("quiz_session_pages").insert(linkRows);
    if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 });

    // Attempt AI generation when we actually have text
    let itemsToInsert: any[] = [];
    let usedAI = false;

    if (pagesWithText.length > 0) {
      try {
        const ai = await getQuizAI();      // Groq (per env)
        const model = getQuizModel();      // live model name
        const subject = selections[0]?.subject ?? "General";

        const generated = await generateMCQsFromPages({
          grade: resolvedGrade,
          subject,
          difficulty,
          count,
          pages: pagesWithText,
          openai: ai as any,
          model,
        });

        if (generated.length >= Math.min(3, count)) {
          usedAI = true;
          itemsToInsert = generated.map((g) => ({
            session_id: session.id,
            subject,
            question: g.question,
            options: JSON.stringify(g.options),
            correct_index: g.correct_index,
            source_page_id: g.source_page_id ?? allPageIds[0] ?? null,
          }));
        }
      } catch (err) {
        // swallow & fall back below
        itemsToInsert = [];
      }
    }

    // If we have zero items AND we had zero page text, tell the caller to backfill
    if (itemsToInsert.length === 0 && pagesWithText.length === 0) {
      return NextResponse.json({
        session_id: session.id,
        usedAI: false,
        count,
        items: [],
        warning: "Selected textbook pages are missing text_content. Please backfill page text in Supabase.",
      });
    }

    // If AI failed but we had some text, fall back with placeholders (keeps UX usable)
    if (itemsToInsert.length === 0) {
      const subject = selections[0]?.subject ?? "General";
      itemsToInsert = Array.from({ length: count }).map((_, i) => ({
        session_id: session.id,
        subject,
        question: `Placeholder Q${i + 1}: Based ONLY on the selected textbook pages.`,
        options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
        correct_index: 0,
        source_page_id: allPageIds[i % allPageIds.length] ?? null,
      }));
    }

    const { data: insertedItems, error: itemsErr } = await supabase
      .from("quiz_items")
      .insert(itemsToInsert)
      .select("id, question, options, correct_index, source_page_id, subject");
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

    return NextResponse.json({
      session_id: session.id,
      difficulty,
      count,
      usedAI,
      items: insertedItems,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
