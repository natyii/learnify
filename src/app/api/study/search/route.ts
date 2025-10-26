// src/app/api/study/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";

/**
 * GET /api/study/search?q=photosynthesis&subject=biology&grade=10&bookId=uuid&limit=5
 * Returns [{bookId, page, openUrl?}]
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const subject = (url.searchParams.get("subject") || "").trim().toLowerCase();
    const grade = Number(url.searchParams.get("grade") || "") || null;
    const bookId = url.searchParams.get("bookId") || url.searchParams.get("textbook_id");
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "5"), 1), 10);

    if (!q) return NextResponse.json([], { status: 200 });

    const supabase = await serverSupabase();

    let qp = supabase
      .from("textbook_pages")
      .select("textbook_id, page_number, subject, grade, content")
      .ilike("content", `%${q}%`)
      .order("page_number", { ascending: true })
      .limit(limit);

    if (bookId) qp = qp.eq("textbook_id", bookId);
    if (grade) qp = qp.eq("grade", grade);
    if (subject) qp = qp.eq("subject", subject);

    const { data, error } = await qp;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (data || []).map((r) => ({
      bookId: r.textbook_id,
      page: r.page_number,
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Search failed." }, { status: 500 });
  }
}
