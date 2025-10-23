// src/lib/ai/provider.ts
type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

type ProviderArgs = {
  mode: "explain" | "steps" | "hints" | "eli5" | "diagram" | "graph" | "map" | "quiz";
  subject?: string | null;
  grade?: number | null;
  question: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }> | unknown;
  context?: {
    citations?: Array<{ bookId: string; page: number }>;
    snippets?: Array<{ bookId: string; page: number; excerpt: string }>;
  };
  sessionId?: string | null;
};

/**
 * Minimal provider that talks to Groq's Chat Completions.
 * You can swap the base URL/model/env to use OpenAI or others.
 */
export async function chatWithProvider(args: ProviderArgs): Promise<{
  content: string;
  citations?: Array<{ bookId: string; page: number }>;
  svg?: string | null;
}> {
  const {
    mode,
    subject = null,
    grade = null,
    question,
    messages,
    context,
  } = args;

  // --- Normalize messages to a proper array for the API ---
  const history: ChatMsg[] = Array.isArray(messages)
    ? (messages as Array<{ role: "user" | "assistant"; content: string }>)
        .filter((m) => m && m.role && typeof m.content === "string")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))
    : [];

  // Add a compact system prompt that nudges style by mode/subject/grade
  const system: ChatMsg = {
    role: "system",
    content: [
      `You are a helpful tutor.`,
      subject ? `Subject: ${subject}.` : ``,
      Number.isFinite(grade as number) ? `Grade: ${grade}.` : ``,
      `Mode: ${mode}.`,
      `Keep answers concise, clear, and correct.`,
      context?.snippets?.length
        ? `When useful, ground your explanation with textbook snippets the user might have opened (snippets provided separately).`
        : ``,
    ]
      .filter(Boolean)
      .join(" "),
  };

  // Optionally include grounded snippets (don’t dump all — just the first few)
  const grounding: ChatMsg[] =
    (context?.snippets || []).slice(0, 3).map((s, i) => ({
      role: "system" as const,
      content: `Context ${i + 1} — book:${s.bookId} page:${s.page}\n${(s.excerpt || "").slice(0, 600)}`,
    }));

  // The current user question/message should be the last user turn
  const lastUser: ChatMsg = { role: "user", content: question || "" };

  const finalMessages: ChatMsg[] = [system, ...grounding, ...history, lastUser];

  // --- Call Groq ---
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { content: "Server is missing GROQ_API_KEY.", citations: context?.citations || [] };
  }

  const baseUrl = "https://api.groq.com/openai/v1/chat/completions";
  // Pick a sensible default model; you can wire from env if you prefer
  const model = process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant";

  try {
    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: finalMessages, // <-- always an array now
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      // Surface the provider message for debugging in the UI
      const msg =
        typeof data?.error?.message === "string"
          ? data.error.message
          : JSON.stringify(data);
      return { content: `Groq error: ${resp.status} ${msg}`, citations: context?.citations || [] };
    }

    const content =
      data?.choices?.[0]?.message?.content ??
      "I couldn’t generate an answer right now.";

    // Pass through citations the context finder produced
    return {
      content,
      citations: context?.citations || [],
      svg: null,
    };
  } catch (e: any) {
    return { content: `Groq request failed: ${e?.message || e}`, citations: context?.citations || [] };
  }
}
