// src/app/api/study/explain-strict/route.ts
import { NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";
import { chatWithProvider } from "@/lib/ai/provider";

// Expected body from StudyChat:
// { subject: string, grade: number, message: string, bookId?: string|null }
type Body = {
  subject: string;
  grade: number;
  message: string;
  bookId?: string | null;
};

type PageRow = { book_id: string; page: number; text: string };

export async function POST(req: Request) {
  try {
    const { subject, grade, message, bookId = null } = (await req.json()) as Body;
    if (!subject || !Number.isFinite(grade) || !message?.trim()) {
      return NextResponse.json({ error: "Missing subject, grade, or message." }, { status: 400 });
    }

    // 1) Parse hints (Example/Exercise/Activity + optional page)
    const { page, tag, number } = parseStrictTarget(message);

    if (!tag) {
      // If the user didn’t ask for a specific “Example/Exercise/Activity”,
      // we don’t do strict mode—let the caller fall back to normal Study flow.
      return NextResponse.json(
        { content: "STRICT_MODE_BYPASS", bypass: true },
        { status: 200 }
      );
    }

    // 2) Fetch the page window (page±1) for the chosen book (or best match by grade+subject)
    const supabase = await serverSupabase();
    const rows = await fetchPageWindow({ supabase, subject, grade, page, bookId });

    if (!rows.length) {
      return NextResponse.json(
        {
          content:
            "I couldn’t fetch that page from this book. Tell me the page number (e.g., 'page 66') or copy/paste the Example/Exercise text.",
          citations: [],
          strict: { tag, number, page },
        },
        { status: 200 }
      );
    }

    // 3) Extract the labeled block from the page text
    const merged = rows.map(r => `Page ${r.page}:\n${r.text || ""}`).join("\n").slice(0, 10000);
    const picked = extractLabeledBlock(merged, { tag, number });

    if (!picked?.raw) {
      // No guessing in strict mode
      return NextResponse.json(
        {
          content:
            `I found the page, but couldn’t locate **${prettyLabel(tag, number)}** on it.\n` +
            `Please copy/paste the exact text of the ${prettyLabel(tag, number)} or confirm the number.`,
          citations: rows.map(r => ({ bookId: r.book_id, page: r.page })),
          strict: { tag, number, page },
        },
        { status: 200 }
      );
    }

    // 4) Build a tight tutoring prompt from the exact block
    const system = [
      "You are a supportive tutor.",
      "Use ONLY the extracted Example/Exercise/Activity block below.",
      "Explain or guide from THIS exact block; do not invent numbers or new text.",
      "Be concise, structured, and kind. Include quick checks for understanding.",
    ].join("\n");

    const user = [
      `Subject: ${subject}`,
      `Grade: ${grade}`,
      page ? `Target page: ${page}` : "",
      `Target: ${prettyLabel(tag, number)}`,
      "",
      "Exact block (use ONLY this):",
      "```",
      picked.raw.slice(0, 3200),
      "```",
      "",
      "Now explain/guide from THIS exact block. If it's a worked example, walk through its method.",
    ]
      .filter(Boolean)
      .join("\n");

    const citations = [{ bookId: rows[0].book_id, page: page ?? rows[0].page }];

    const ai = await chatWithProvider({
      mode: "steps",
      subject,
      grade,
      question: user,
      context: { citations, snippets: [{ page: citations[0].page, excerpt: picked.raw.slice(0, 1500) }] },
      system,
      temperature: 0.2,
    });

    return NextResponse.json(
      {
        content:
          ai?.content ??
          `Let’s walk through ${prettyLabel(tag, number)} step by step using the textbook block (p. ${citations[0].page}).`,
        citations,
        strict: { tag, number, page: citations[0].page, detectedTitle: picked.title ?? null },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Strict explain failed." }, { status: 500 });
  }
}

/* ------------------------------ helpers --------------------------------- */

function parseStrictTarget(msg: string) {
  const q = (msg || "").toLowerCase();

  // page
  const pageMatch = q.match(/\bpage\s+(\d{1,4})\b/);
  const page = pageMatch ? Number(pageMatch[1]) : null;

  // Example / Exercise / Activity
  const example = q.match(/\bexample\s+([0-9]+(?:\.[0-9]+)?)\b/);
  const exercise = q.match(/\bex(?:ercise)?\s+([0-9]+(?:\.[0-9]+)?)\b/);
  const activity = q.match(/\bactivity\s+([0-9]+(?:\.[0-9]+)?)\b/);

  if (example) return { tag: "example" as const, number: example[1], page };
  if (exercise) return { tag: "exercise" as const, number: exercise[1], page };
  if (activity) return { tag: "activity" as const, number: activity[1], page };

  return { tag: null as null, number: null as null, page };
}

function prettyLabel(tag: "example" | "exercise" | "activity", number?: string | null) {
  const cap = tag[0].toUpperCase() + tag.slice(1);
  return number ? `${cap} ${number}` : cap;
}

async function fetchPageWindow(opts: {
  supabase: any;
  subject: string;
  grade: number;
  page: number | null;
  bookId: string | null;
}) {
  const { supabase, subject, grade, page, bookId } = opts;
  const pages = page ? [page - 1, page, page + 1].filter((p) => p && p >= 1) : [];

  let rows: PageRow[] = [];
  if (page && bookId) {
    const { data } = await supabase
      .from("textbook_pages")
      .select("book_id,page,text")
      .eq("book_id", bookId)
      .in("page", pages)
      .order("page", { ascending: true })
      .limit(3);
    rows = (data || []) as any;
    if (rows.length) return rows;
  }

  if (page) {
    const { data: books } = await supabase
      .from("textbooks")
      .select("id,subject,grade")
      .eq("grade", grade);

    const wanted = subject.toLowerCase();
    const book =
      (books || []).find((b: any) => String(b.subject).toLowerCase().includes(wanted)) ||
      (books || [])[0];

    if (book) {
      const { data } = await supabase
        .from("textbook_pages")
        .select("book_id,page,text")
        .eq("book_id", book.id)
        .in("page", pages)
        .order("page", { ascending: true })
        .limit(3);
      rows = (data || []) as any;
    }
  }

  return rows;
}

function extractLabeledBlock(
  textAll: string,
  target: { tag: "example" | "exercise" | "activity"; number?: string | null }
) {
  const flat = (textAll || "").replace(/\r/g, "\n");
  const re =
    target.number
      ? new RegExp(`\\b${target.tag}\\s*${escapeRegex(target.number)}\\b[:\\-\\s]*`, "i")
      : new RegExp(`\\b${target.tag}\\b[:\\-\\s]*`, "i");

  const m = flat.match(re);
  if (!m) return null;

  const start = m.index ?? 0;

  // Find the next heading (Example/Exercise/Activity) to cap the block
  const nextRe = /\b(?:example|exercise|activity)\s+[0-9]+(?:\.[0-9]+)?\b/i;
  const tail = flat.slice(start + 1);
  const next = tail.search(nextRe);
  const end = next >= 0 ? start + 1 + next : flat.length;

  const raw = flat.slice(start, Math.min(end, start + 3000)).trim();
  const title = raw.slice(0, Math.min(140, raw.length)).replace(/\s+/g, " ");
  return { raw, title };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
