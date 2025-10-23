"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TeX from "./TeX"; // your KaTeX wrapper

type Mode =
  | "explain"
  | "steps"
  | "hints"
  | "eli5"
  | "diagram"
  | "graph"
  | "map"
  | "quiz";

type Citation = { bookId: string | null; page: number; openUrl?: string | null };

type Message = {
  role: "user" | "assistant";
  mode?: Mode;
  content: string;
  citations?: Citation[];
  svg?: string | null;
};

type Props = {
  subjectKey: string;
  grade: number;
  bookId?: string | null;
  bookTitle?: string | null;
};

function normalize(msgs: Message[]): Message[] {
  return msgs.map((m) => ({ ...m, content: m.content ?? "" }));
}

function parseMaybePage(input: string): number | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const m = trimmed.match(/\b(?:page|pg|p)\s*#?\s*(\d{1,4})\b/i);
  if (m) return Number(m[1]);
  return null;
}

function makeClientSessionId() {
  return "local-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** GET /api/study/lookup – resolves exact textbook + page + openUrl */
async function resolveLookup(params: {
  subjectKey: string;
  grade: number;
  bookId: string | null;
  q: string;
  pageHint: number | null;
}): Promise<Citation | null> {
  const { subjectKey, grade, bookId, q, pageHint } = params;
  const url = new URL("/api/study/lookup", window.location.origin);
  if (bookId) url.searchParams.set("bookId", bookId);
  else {
    url.searchParams.set("subject", subjectKey);
    url.searchParams.set("grade", String(grade));
  }
  if (pageHint != null) url.searchParams.set("page", String(pageHint));
  if (q) url.searchParams.set("q", q);

  try {
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    const j = await res.json();
    if (!res.ok) return null;
    const id = j?.textbook?.id as string | undefined;
    const page = Number(j?.page);
    const openUrl = j?.openUrl as string | undefined;
    if (!id || !Number.isFinite(page) || page <= 0) return null;
    return { bookId: id, page, openUrl: openUrl ?? undefined };
  } catch {
    return null;
  }
}

/** GET /api/study/search – returns top pages for topic/keyword queries */
async function resolveSearch(params: {
  q: string;
  subjectKey: string;
  grade: number;
  bookId: string | null;
}): Promise<Citation[]> {
  const { q, subjectKey, grade, bookId } = params;
  if (!q.trim()) return [];
  const url = new URL("/api/study/search", window.location.origin);
  url.searchParams.set("q", q);
  url.searchParams.set("subject", subjectKey);
  url.searchParams.set("grade", String(grade));
  if (bookId) {
    url.searchParams.set("bookId", bookId);
    url.searchParams.set("textbook_id", bookId); // tolerant to either param
  }
  url.searchParams.set("limit", "5");

  try {
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    if (!res.ok) return [];
    const j = await res.json();
    const rows: any[] = Array.isArray(j?.results) ? j.results : [];
    const mapped: Citation[] = rows
      .map((r) => ({
        bookId: (r.book_id ?? r.bookId ?? bookId) as string | null,
        page: Number(r.page ?? r.page_number),
      }))
      .filter((c) => Number.isFinite(c.page) && c.page > 0);

    // De-dup (bookId,page)
    const seen = new Set<string>();
    const out: Citation[] = [];
    for (const c of mapped) {
      const k = `${c.bookId ?? "null"}:${c.page}`;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(c);
      }
    }
    return out;
  } catch {
    return [];
  }
}

export default function StudyChat(props: Props) {
  const { subjectKey, grade, bookId = null, bookTitle = null } = props;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("explain");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);

  // create (or reuse) a session on mount/when subject/grade/book change
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/study/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjectKey, grade, bookId, bookTitle }),
        });
        const json = await res.json();

        const id = json?.sessionId || json?.id || null;
        if (id) {
          setSessionId(id);
          setMessages(normalize(json.messages || []));
        } else {
          // Fallback so the UI stays usable
          setSessionId(makeClientSessionId());
          if (json?.error) {
            setMessages((m) => [
              ...m,
              { role: "assistant", content: `Session note: ${json.error}` },
            ]);
          }
        }
      } catch {
        // Offline/500 — still allow chatting locally
        setSessionId(makeClientSessionId());
      }
    };
    init();
  }, [subjectKey, grade, bookId, bookTitle]);

  // autoscroll on new messages / loading
  useEffect(() => {
    if (!scroller.current) return;
    scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim()) return; // <-- no hard dependency on sessionId

    const userMsg: Message = { role: "user", mode, content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const historyForApi = [...messages, userMsg].map(({ role, content }) => ({
      role,
      content,
    }));
    const pageHint = parseMaybePage(userMsg.content);

    try {
      // Strict Mode if referencing Example/Exercise/Activity or a page
      const wantsStrict =
        /\b(example|ex(?:ercise)?|activity)\s+[0-9]+(?:\.[0-9]+)?\b/i.test(userMsg.content) ||
        /\bpage\s+[0-9]{1,4}\b/i.test(userMsg.content);

      async function callAI() {
        if (wantsStrict) {
          const strictRes = await fetch("/api/study/explain-strict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject: subjectKey,
              grade,
              message: userMsg.content,
              bookId: bookId ?? null,
            }),
          });
          const strictJson = await strictRes.json();
          if (strictRes.ok && !strictJson?.bypass) {
            return { ok: true, json: strictJson };
          }
          // fall through
        }

        const normalRes = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            subject: subjectKey,
            grade,
            bookId,
            question: userMsg.content,
            page: pageHint,
            messages: historyForApi,
            sessionId, // may be local-…; backend can ignore if it wants
          }),
        });
        const normalJson = await normalRes.json();
        return { ok: normalRes.ok, json: normalJson };
      }

      // Parallel requests (AI + lookup + search)
      const [aiRes, lookupRes, searchRes] = await Promise.allSettled([
        callAI(),
        resolveLookup({
          subjectKey,
          grade,
          bookId,
          q: userMsg.content,
          pageHint,
        }),
        resolveSearch({
          q: userMsg.content,
          subjectKey,
          grade,
          bookId,
        }),
      ]);

      // Build assistant message
      let content = "Something went wrong.";
      let svg: string | null = null;
      let citations: Citation[] = [];

      if (aiRes.status === "fulfilled" && aiRes.value.ok) {
        const j = aiRes.value.json;
        if (j?.error) {
          content = String(j.error);
        } else {
          content = (j.content ?? j.message ?? "").toString();
          svg = j.svg || null;

          if (Array.isArray(j.citations) && j.citations.length > 0) {
            citations = j.citations
              .map((c: any) => ({
                bookId: (c.bookId ?? c.book_id ?? bookId) as string | null,
                page: Number(c.page),
              }))
              .filter((c: Citation) => Number.isFinite(c.page) && c.page > 0);
          }
        }
      } else if (aiRes.status === "fulfilled" && !aiRes.value.ok) {
        const msg = aiRes.value.json?.error || "AI request failed.";
        content = String(msg);
      } else {
        content = "Network error.";
      }

      if (citations.length === 0 && lookupRes.status === "fulfilled" && lookupRes.value) {
        citations = [lookupRes.value];
      }
      if (citations.length === 0 && searchRes.status === "fulfilled") {
        citations = searchRes.value.slice(0, 3);
      }

      const assistant: Message = { role: "assistant", mode, content, citations, svg };
      setMessages((m) => [...m, assistant]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickModes: Array<{ key: Mode; label: string }> = useMemo(
    () => [
      { key: "explain", label: "Explain" },
      { key: "steps", label: "Steps" },
      { key: "hints", label: "Hints" },
      { key: "eli5", label: "ELI5" },
      { key: "diagram", label: "Diagram" },
      { key: "graph", label: "Graph" },
      { key: "map", label: "Map" },
      { key: "quiz", label: "Quiz" },
    ],
    []
  );

  return (
    <div id="study-root" className="study-chat rounded-2xl">
      {/* messages area */}
      <div ref={scroller} className="chat-scroll">
        {messages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}
        {loading && <div className="text-xs text-zinc-500">Thinking…</div>}
      </div>

      {/* STICKY DOCK: Quick Actions ON TOP, Input just below. Both move together. */}
      <div className="sticky bottom-2 z-10">
        <div className="space-y-2">
          {/* Quick actions row (on top of the input) */}
          <div className="paper-card rounded-2xl px-3 py-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-600 text-white px-3 py-1 text-xs whitespace-nowrap">
                {bookId ? "active book" : "grade-wide"}
              </span>

              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {quickModes.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMode(m.key)}
                    className={[
                      "qa-pill rounded-full border px-3 py-1 text-sm whitespace-nowrap",
                      mode === m.key ? "is-active" : "",
                    ].join(" ")}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* input bar (under quick actions) */}
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
              placeholder='Ask about a topic, chapter, or a page (e.g., “page 53” or just “53”).'
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="btn-send"
              title={
                !input.trim()
                  ? "Type a question or page number"
                  : loading
                  ? "Working…"
                  : "Send"
              }
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const cls = "msg-block " + (isUser ? "user ml-0" : "assistant");

  return (
    <div className={cls}>
      {message.mode && (
        <div className="mb-2">
          <span className="mode-chip">{labelFor(message.mode)}</span>
        </div>
      )}
      <TeX>{message.content}</TeX>

      {message.svg && (
        <div
          className="mt-3 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: message.svg }}
        />
      )}

      {message.citations && message.citations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.citations.map((c, i) => {
            const canLink = !!c.bookId && Number.isFinite(c.page) && c.page > 0;
            const href =
              c.openUrl ||
              (canLink
                ? `/api/textbooks/open?id=${encodeURIComponent(
                    c.bookId as string
                  )}#page=${encodeURIComponent(String(c.page))}`
                : undefined);
            return canLink ? (
              <a
                key={i}
                className="cite-chip hover:underline"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title="Open textbook at this page"
              >
                p. {c.page}
              </a>
            ) : (
              <span key={i} className="cite-chip">
                p. {c.page}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function labelFor(mode: Mode) {
  switch (mode) {
    case "explain":
      return "Explain";
    case "steps":
      return "Steps";
    case "hints":
      return "Hints";
    case "eli5":
      return "ELI5";
    case "diagram":
      return "Diagram";
    case "graph":
      return "Graph";
    case "map":
      return "Map";
    case "quiz":
      return "Quiz";
  }
}
