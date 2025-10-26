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
  })).min(1),
  count: z.number().int().min(1).max(100),
  difficulty: z.enum(["easy", "medium", "hard"]),
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
    const { grade, selections, count, difficulty } = parsed.data;

    // Resolve grade
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

    // Gather pages
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
        sel.pages.map((r) => ({ start: Math.min(r.start, r.end), end: Math.max(r.start, r.end) })),
      );

      if (!pages.length) {
        return NextResponse.json({ error: `No pages in selected ranges for ${sel.subject}` }, { status: 400 });
      }

      for (const p of pages) {
        allPageIds.push(p.id as any);
        pagesForAI.push(p as any);
      }
    }

    if (!allPageIds.length) {
      return NextResponse.json({ error: "No grounding pages provided" }, { status: 400 });
    }

    const pagesWithText = pagesForAI.filter(p => p.text_content && p.text_content.trim().length > 0);
    if (!pagesWithText.length) {
      return NextResponse.json(
        { error: "Selected textbook pages are missing text_content. Please backfill OCR text." },
        { status: 400 },
      );
    }

    // Robust language detection (ratio-based + explicit subject)
    const langBlob = pagesWithText.map(p => p.text_content || "").join(" ");
    const ethiopic = (langBlob.match(/[\u1200-\u137F]/g) || []).length;
    const latin    = (langBlob.match(/[A-Za-z]/g) || []).length;
    const totalAlpha = ethiopic + latin;
    const subjLabel = (selections[0]?.subject || "").trim().toLowerCase();
    const isExplicitAmharic = subjLabel === "amharic";
    const ethiopicRatio = totalAlpha > 0 ? ethiopic / totalAlpha : 0;
    const languageHint = (isExplicitAmharic || ethiopicRatio >= 0.35) ? "am" : "auto";

    // Create session
    const { data: session, error: insErr } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: user.id,
        grade: resolvedGrade,
        difficulty,
        question_count: count,
      })
      .select("id, user_id, grade, difficulty, question_count")
      .maybeSingle();
    if (insErr || !session) {
      return NextResponse.json({ error: insErr?.message || "Failed to create session" }, { status: 500 });
    }

    let usedAI = false;
    let itemsToInsert: any[] = [];

    try {
      const ai = await getQuizAI();
      const model = getQuizModel();
      const subject = selections[0]?.subject ?? "General";

      // Chunk pages & attempt multiple small calls
      const chunk = <T,>(arr: T[], size: number) => {
        const out: T[][] = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
      };
      const pageBatches = chunk(pagesWithText, 4);
      const collected: any[] = [];
      let attempts = 0;

      for (const batch of pageBatches) {
        attempts++;
        const need = Math.max(3, count - collected.length);
        const generated = await generateMCQsFromPages({
          grade: resolvedGrade,
          subject,
          difficulty,
          count: need,
          pages: batch as any,
          openai: ai as any,
          model,
          languageHint,
        });
        if (generated?.length) {
          for (const g of generated) {
            if (!collected.some((x) => x.question === g.question)) collected.push(g);
            if (collected.length >= count) break;
          }
        }
        if (collected.length >= Math.min(count, 10) || attempts >= 3) break;
      }

      if (collected.length >= Math.min(3, count)) {
        usedAI = true;
        itemsToInsert = collected.slice(0, count).map((g) => ({
          session_id: session.id,
          subject,
          question: g.question,
          options: JSON.stringify(g.options),
          correct_index: g.correct_index,
          source_page_id: g.source_page_id ?? allPageIds[0] ?? null,
        }));
      } else {
        await supabase.from("quiz_sessions").delete().eq("id", session.id);
        return NextResponse.json(
          { error: "Could not generate enough questions from the selected pages. Try fewer pages or reduce count." },
          { status: 400 },
        );
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
      try { await supabase.from("quiz_sessions").delete().eq("id", session.id); } catch {}
      return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
