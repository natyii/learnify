// src/app/api/study/lookup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";
import { subjectLabelToKeys } from "@/core/textbooks";

/**
 * Resolve the right textbook for a student and return an URL that
 * opens the correct PDF at the requested page using /api/textbooks/open.
 *
 * Accepts (query or JSON body):
 *  - subject: canonical subject key (e.g. "economics", "science", "cte", "environmental_science")
 *  - grade: number (optional; if omitted we read the user's profile.grade)
 *  - bookId: optional explicit textbook id (uuid) to force selection
 *  - page: number (optional; defaults to 1). Also parses from q="page 33" or "33"
 *  - q: optional free text that may include a page number (e.g. "page 33" or "33")
 *  - redirect=1 (querystring): if provided, do a 302 redirect to the open URL instead of returning JSON
 *
 * Response (200):
 *  {
 *    ok: true,
 *    textbook: { id, title, subject, grade, storage_path },
 *    page: number,
 *    openUrl: "/api/textbooks/open?id=<uuid>#page=<n>"
 *  }
 */
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const isGet = req.method === "GET";

    const qp = Object.fromEntries(url.searchParams.entries());
    const body = !isGet ? await safeJson(req) : {};

    const subjectKey = String(qp.subject ?? body.subject ?? "").trim().toLowerCase();
    let grade: number | null = parseIntMaybe(qp.grade ?? body.grade);
    const bookId = String(qp.bookId ?? body.bookId ?? "").trim() || null;
    const pageParam = qp.page ?? body.page;
    const q = String(qp.q ?? body.q ?? "").trim();
    const redirectFlag = url.searchParams.get("redirect") === "1";

    if (!subjectKey && !bookId) {
      return NextResponse.json(
        { error: "Missing subject (or provide bookId)" },
        { status: 400 }
      );
    }

    const supabase = await serverSupabase();

    // If grade not provided, read from profile
    if (grade == null) {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) {
        return NextResponse.json(
          { error: "Missing grade and user not signed in" },
          { status: 401 }
        );
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("grade")
        .eq("user_id", uid)
        .maybeSingle();
      if (typeof profile?.grade === "number") {
        grade = profile.grade;
      } else {
        return NextResponse.json(
          { error: "Grade not set in profile" },
          { status: 400 }
        );
      }
    }

    // Page resolution
    const pageFromQ = parsePageFromQuery(q);
    const page = clampPage(parseIntMaybe(pageParam) ?? pageFromQ ?? 1);

    // 1) If bookId provided, use it directly (and optionally sanity check grade/subject)
    if (bookId) {
      const { data: one, error } = await supabase
        .from("textbooks")
        .select("id, title, subject, grade, storage_path")
        .eq("id", bookId)
        .maybeSingle();

      if (error || !one) {
        return NextResponse.json(
          { error: "Textbook not found for bookId", details: error?.message },
          { status: 404 }
        );
      }

      // sanity check grade/subject match (non-fatal; we just return diagnostics)
      const matchesGrade = Number(one.grade) === Number(grade);
      const keys = subjectLabelToKeys(String(one.subject));
      const matchesSubject = subjectKey ? keys.includes(subjectKey) : true;

      if (!one.storage_path || !one.storage_path.trim()) {
        return NextResponse.json(
          { error: "Textbook row has no storage_path; set it to the object key inside the bucket." },
          { status: 409 }
        );
      }

      const openUrl = `/api/textbooks/open?id=${encodeURIComponent(one.id)}#page=${page}`;

      if (redirectFlag) {
        return NextResponse.redirect(openUrl, 302);
      }
      return NextResponse.json({
        ok: true,
        textbook: one,
        page,
        openUrl,
        diagnostics: { matchesGrade, matchesSubject, normalizedKeys: keys },
      });
    }

    // 2) No bookId → select the correct textbook for (grade, subject)
    // Pull all textbooks for the grade and pick the one whose normalized keys include subjectKey
    const { data: books, error: listErr } = await supabase
      .from("textbooks")
      .select("id, title, subject, grade, storage_path")
      .eq("grade", grade);

    if (listErr) {
      return NextResponse.json(
        { error: "Failed to list textbooks", details: listErr.message },
        { status: 500 }
      );
    }

    const candidates = (books ?? []).filter((b) =>
      subjectLabelToKeys(String(b.subject)).includes(subjectKey)
    );

    const chosen = candidates[0] ?? (books ?? [])[0] ?? null;

    if (!chosen) {
      return NextResponse.json(
        { error: "No textbooks configured for this grade", grade },
        { status: 404 }
      );
    }

    if (!chosen.storage_path || !chosen.storage_path.trim()) {
      return NextResponse.json(
        { error: "Chosen textbook has no storage_path; set it to the object key inside the bucket." },
        { status: 409 }
      );
    }

    const openUrl = `/api/textbooks/open?id=${encodeURIComponent(chosen.id)}#page=${page}`;

    if (redirectFlag) {
      return NextResponse.redirect(openUrl, 302);
    }
    return NextResponse.json({
      ok: true,
      textbook: chosen,
      page,
      openUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unhandled error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

// -------------------- helpers --------------------

function parseIntMaybe(v: any): number | null {
  if (v == null) return null;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

/** Accepts: "page 33", "p 33", "pg 33", "#33", or bare "33" */
function parsePageFromQuery(q: string): number | null {
  if (!q) return null;
  const s = q.toLowerCase().trim();
  const m1 = s.match(/\b(?:page|pg|p)\s*#?\s*(\d{1,4})\b/);
  if (m1) return parseIntMaybe(m1[1]);
  const m2 = s.match(/#\s*(\d{1,4})\b/);
  if (m2) return parseIntMaybe(m2[1]);
  if (/^\d{1,4}$/.test(s)) return parseIntMaybe(s);
  return null;
}

function clampPage(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(n, 2000));
}

async function safeJson(req: NextRequest): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
