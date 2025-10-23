// src/ui/SubjectIcon.tsx
import * as React from "react";

export function subjectIcon(key: string): string {
  const s = (key || "").toLowerCase();
  const map: Record<string, string> = {
    amharic: "📝",
    english: "🗣️",
    mathematics: "➗",
    algebra: "∑",
    geometry: "📐",
    trigonometry: "📈",
    calculus: "∫",
    statistics: "📊",
    chemistry: "⚗️",
    physics: "🔭",
    biology: "🧬",
    geography: "🗺️",
    history: "🏺",
    civics: "⚖️",
    economics: "💹",
    ict: "💻",
    "general science": "🔬",
    science: "🔬",
    art: "🎨",
    music: "🎵",
    business: "💼",
    entrepreneurship: "🚀",
    study: "✨",
    general: "⭐️",
  };
  return map[s] ?? "📘";
}

export function SubjectChip({
  label,
  active,
  href,
}: {
  label: string;
  active?: boolean;
  href: string;
}) {
  const icon = subjectIcon(label);
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition
      ${active
          ? "border-emerald-500/70 bg-white/80 text-emerald-700 shadow-[0_1px_0_rgba(16,185,129,0.25)]"
          : "border-zinc-300/70 bg-white/60 text-zinc-800 hover:bg-white/75"
        }`}
    >
      <span aria-hidden>{icon}</span>
      <span className="font-medium">{capitalize(label)}</span>
    </a>
  );
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
