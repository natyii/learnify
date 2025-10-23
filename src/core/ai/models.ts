// src/core/ai/models.ts
export const OPENAI_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
export const GROQ_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.1-70b-versatile";
export const OPENAI_CAP = Number(process.env.OPENAI_DAILY_REQUEST_CAP || "50");
