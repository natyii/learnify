// src/app/api/homework/scan/route.ts
import { NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";

type Body = {
  subject: string;
  grade: number;
  page: number;
  bookId?: string | null;
};

type Detection = {
  kind: "exercise" | "activity" | "questions" | "practice";
  label: string;          // e.g., "Exercise 2.7" or "Activity 3.2" or "Questions"
  number?: string | null; // "2.7" when present
  page: number;
  preview: string;        // short human preview
  text: string;           // full extracted block (what we’ll tutor from)
};

export async function POST(req: Request) {
  try {
    const { subject, grade, page, bookId = null } = (await req.json()) as Body;

    if (!subject || !Number.isFinite(grade) || !Number.isFinite(page)) {
      return NextResponse.json(
        { error: "Missing subject, grade, or page." },
        { status: 400 }
      );
    }

    const supabase = await serverSupabase();

    // 1) Fetch page rows (page-1 .. page+1) from textbook_pages
    const pagesToGet = [page - 1, page, page + 1].filter((p) => p >= 1);

    // Prefer explicit bookId if provided
    let pageRows: { book_id: string; page: number; text: string }[] = [];

    if (bookId) {
      const { data, error } = await supabase
        .from("textbook_pages")
        .select("book_id,page,text")
        .eq("book_id", bookId)
        .in("page", pagesToGet)
        .order("page", { ascending: true });
      if (!error && data) pageRows = data as any[];
    }

    // Fallback: choose a book by subject+grade if no explicit bookId
    if (!pageRows?.length) {
      const { data: books } = await supabase
        .from("textbooks")
        .select("id,subject,grade")
        .eq("grade", grade);

      const wanted = subject.toLowerCase();
      const candidate =
        (books || []).find((b: any) =>
          String(b.subject).toLowerCase().includes(wanted)
        ) || (books || [])[0];

      if (candidate) {
        const { data, error } = await supabase
          .from("textbook_pages")
          .select("book_id,page,text")
          .eq("book_id", candidate.id)
          .in("page", pagesToGet)
          .order("page", { ascending: true });
        if (!error && data) pageRows = data as any[];
      }
    }

    if (!pageRows?.length) {
      return NextResponse.json(
        { detections: [], info: "No page text found for that book/grade/subject." },
        { status: 200 }
      );
    }

    // 2) Detect exercise/activity/question/practice blocks on those pages
    const detections: Detection[] = [];
    for (const row of pageRows) {
      const txt = String(row.text || "");
      const blocks = detectBlocks(txt);

      for (const b of blocks) {
        detections.push({
          kind: b.kind,
          label: b.label,
          number: b.number,
          page: row.page,
          preview: b.preview,
          text: b.text,
        });
      }
    }

    // Prioritize the target page; then neighbors
    detections.sort((a, b) => {
      const da = Math.abs(a.page - page);
      const db = Math.abs(b.page - page);
      if (da !== db) return da - db;
      // Prefer numbered exercises/activities first
      const aRank = a.number ? 0 : 1;
      const bRank = b.number ? 0 : 1;
      return aRank - bRank;
    });

    return NextResponse.json(
      {
        detections,
        pageWindow: pagesToGet,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Scan failed." },
      { status: 500 }
    );
  }
}

/* -------------------------- block detection logic ----------------------- */
// We look for headings such as:
// "Exercise 2.7", "Activity 3.2", "Exercises", "Activities", "Questions", "Practice"
// and capture text until the next heading or a size cap.
function detectBlocks(pageText: string): Array<{
  kind: "exercise" | "activity" | "questions" | "practice";
  label: string;
  number?: string | null;
  text: string;
  preview: string;
}> {
  const text = normalize(pageText);
  const results: Array<{
    kind: "exercise" | "activity" | "questions" | "practice";
    label: string;
    number?: string | null;
    text: string;
    preview: string;
  }> = [];

  // Build a combined regex to match various section headers
  // We capture the header and then take a window until the next header.
  const headerRe =
    /(exercise\s+(\d+(?:\.\d+)?))\b|(?:\bexercises\b)|(?:\bactivity\s+(\d+(?:\.\d+)?)\b)|(?:\bactivities\b)|(?:\bquestions\b)|(?:\bpractice\b)/gi;

  // Collect indices of section starts
  const starts: Array<{
    index: number;
    kind: "exercise" | "activity" | "questions" | "practice";
    label: string;
    number?: string | null;
  }> = [];

  let m: RegExpExecArray | null;
  while ((m = headerRe.exec(text))) {
    const idx = m.index;
    let kind: "exercise" | "activity" | "questions" | "practice";
    let label: string;
    let number: string | null = null;

    if (m[1]) {
      kind = "exercise";
      number = m[2] || null;
      label = number ? `Exercise ${number}` : "Exercise";
    } else if (m[3]) {
      kind = "activity";
      number = m[3] || null;
      label = number ? `Activity ${number}` : "Activity";
    } else {
      // plural or non-numbered
      const h = m[0].toLowerCase();
      if (h.includes("exercises")) {
        kind = "exercise";
        label = "Exercises";
      } else if (h.includes("activities")) {
        kind = "activity";
        label = "Activities";
      } else if (h.includes("questions")) {
        kind = "questions";
        label = "Questions";
      } else {
        kind = "practice";
        label = "Practice";
      }
    }

    starts.push({ index: idx, kind, label, number });
  }

  if (!starts.length) return results;

  // Determine block boundaries: from each start to the next start (or size cap)
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i < starts.length - 1 ? starts[i + 1].index : text.length;
    // Take a reasonable window cap to avoid over-long blocks
    const raw = text.slice(start.index, Math.min(end, start.index + 3000));
    const block = trimBlock(raw);
    const preview = block.slice(0, 180);

    results.push({
      kind: start.kind,
      label: start.label,
      number: start.number || null,
      text: block,
      preview,
    });
  }

  return results;
}

function normalize(t: string) {
  return (t || "").replace(/\r/g, "\n");
}

function trimBlock(t: string) {
  // Keep structure; collapse excessive whitespace but preserve bullets/numbers
  return t
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
