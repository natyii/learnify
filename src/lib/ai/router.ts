// src/lib/ai/router.ts
// Groq now → OpenAI-first later fallback

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type RouteChatArgs = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type RouteChatResult =
  | { ok: true; model: string; provider: "groq" | "openai"; content: string }
  | { ok: false; error: string };

const env = {
  pref: process.env.PROVIDER_PREF?.toLowerCase() || "groq",
  groqKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant",
  oaiKey: process.env.OPENAI_API_KEY,
  oaiModel: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
  oaiDailyCap: Number(process.env.OPENAI_DAILY_REQUEST_CAP || "0"),
};

// Simple in-memory counter
let openaiCountToday = 0;

async function callGroq(args: RouteChatArgs): Promise<RouteChatResult> {
  if (!env.groqKey) return { ok: false, error: "Missing GROQ_API_KEY" };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.groqModel,
      messages: args.messages,
      temperature: args.temperature ?? 0.4,
      max_tokens: args.maxTokens ?? 1200,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `Groq HTTP ${res.status}: ${text}` };
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "";
  return { ok: true, model: env.groqModel, provider: "groq", content };
}

async function callOpenAI(args: RouteChatArgs): Promise<RouteChatResult> {
  if (!env.oaiKey) return { ok: false, error: "Missing OPENAI_API_KEY" };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.oaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.oaiModel,
      messages: args.messages,
      temperature: args.temperature ?? 0.4,
      max_tokens: args.maxTokens ?? 1200,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `OpenAI HTTP ${res.status}: ${text}` };
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "";
  return { ok: true, model: env.oaiModel, provider: "openai", content };
}

function shouldPreferOpenAI() {
  if (env.pref === "openai" && env.oaiDailyCap > 0)
    return openaiCountToday < env.oaiDailyCap;
  return env.pref === "openai";
}

export async function routeChat(
  args: RouteChatArgs
): Promise<RouteChatResult> {
  const tryOpenAIFirst = shouldPreferOpenAI();

  if (tryOpenAIFirst) {
    const first = await callOpenAI(args);
    if (first.ok) {
      openaiCountToday++;
      return first;
    }
    const fb = await callGroq(args);
    if (fb.ok) return fb;
    return first;
  }

  const first = await callGroq(args);
  if (first.ok) return first;

  const fb = await callOpenAI(args);
  if (fb.ok) {
    openaiCountToday++;
    return fb;
  }
  return first;
}
