// src/ui/HomeworkChat.tsx
"use client";

import { useRef, useState, useEffect } from "react";

type Props = {
  subjectKey: string;
  grade: number;
};

type Msg = { role: "user" | "assistant"; content: string };

export default function HomeworkChat({ subjectKey, grade }: Props) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Reset conversation when subject changes
  useEffect(() => {
    setMsgs([]);
    setInput("");
  }, [subjectKey]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, loading]);

  async function guide() {
    if (!input.trim()) return;
    const user = input.trim();

    setMsgs((m) => [...m, { role: "user", content: user }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/homework/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectKey,
          grade,
          exerciseText: user,
        }),
      });
      const j = await res.json();
      const content =
        (j?.content as string) ??
        "Paste the exact exercise text and I’ll guide you step-by-step (no final answers).";

      setMsgs((m) => [...m, { role: "assistant", content }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Network error." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* messages */}
      <div ref={scroller} className="max-h-[60vh] overflow-auto space-y-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={["msg-block", m.role === "user" ? "user ml-0" : "assistant"].join(" ")}
            style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-xs text-zinc-500">Thinking…</div>}
      </div>

      {/* input */}
      <div className="hw-actions">
        <div className="w-full hw-input">
          <textarea
            rows={4}
            className="w-full resize-y p-3 rounded-xl"
            placeholder="Paste the exact exercise here…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button
          className="hw-chip-btn hw-accent"
          onClick={guide}
          disabled={loading || !input.trim()}
          title="Guide me step-by-step (no final answers)"
        >
          <span className="ico" aria-hidden>🧭</span>
          <span className="label">Guide me step-by-step</span>
        </button>
      </div>
    </div>
  );
}
