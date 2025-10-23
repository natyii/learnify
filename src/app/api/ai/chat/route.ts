// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/core/supabase/server";
import { findContext } from "@/lib/ai/textbook";
import { chatWithProvider } from "@/lib/ai/provider";

type Mode =
  | "explain"
  | "steps"
  | "hints"
  | "eli5"
  | "diagram"
  | "graph"
  | "map"
  | "quiz";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode: Mode = body?.mode || "explain";
    const subject: string | null = body?.subject ?? null;
    const grade: number | null =
      typeof body?.grade === "number" ? body.grade : null;
    const bookId: string | null = body?.bookId ?? null;
    const question: string = (body?.question ?? "").toString();
    const page: number | null =
      typeof body?.page === "number" && body.page > 0 ? body.page : null;
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const sessionId: string | null = body?.sessionId ?? null;

    if (!question.trim()) {
      return NextResponse.json(
        { error: "Missing question." },
        { status: 400 }
      );
    }

    // Server-side grounding from textbook_pages (exact page for the chosen book)
    const supabase = await serverSupabase();
    const { citations, snippets } = await findContext({
      supabase,
      subject,
      grade,
      bookId,
      page,
      q: question,
      maxSnippets: 1, // one page is enough when the user says "page 44"
    });

    // Talk to the provider (Groq/OpenAI). The provider we fixed always sends an array.
    const ai = await chatWithProvider({
      mode,
      subject,
      grade,
      question,
      messages,
      sessionId,
      context: {
        citations,
        snippets, // short excerpt from the page so the model knows what's there
      },
    });

    return NextResponse.json(
      {
        content: ai.content,
        citations: ai.citations || citations,
        svg: ai.svg || null,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "AI route failed." },
      { status: 500 }
    );
  }
}
