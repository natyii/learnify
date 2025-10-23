// src/ui/Markdown.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * High-contrast Markdown + KaTeX renderer.
 * Forces dark, readable text for all content.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div
      className={[
        "prose prose-zinc max-w-none",
        "text-zinc-900 prose-p:text-zinc-900 prose-li:text-zinc-900",
        "prose-strong:text-zinc-900 prose-em:text-zinc-900 prose-headings:text-zinc-900",
        "prose-blockquote:text-zinc-900 prose-code:text-zinc-900",
        "[&_.katex]:text-zinc-900 [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-1",
      ].join(" ")}
      style={{ color: "#0a0a0a" }} // hard override to prevent theme bleed
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, output: "html" }]]}
        components={{
          code(props) {
            const { children, className } = props as any;
            const isBlock = (className || "").includes("language-");
            if (isBlock) {
              return (
                <pre className="rounded-xl border border-zinc-200 bg-white/90 p-3 overflow-x-auto text-sm text-zinc-900">
                  <code className={className}>{children}</code>
                </pre>
              );
            }
            return (
              <code className="rounded-md border border-zinc-200 bg-white/80 px-1.5 py-px text-[0.9em] text-zinc-900">
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-[520px]">{children}</table>
              </div>
            );
          },
        }}
      >
        {normalizeForKatex(children)}
      </ReactMarkdown>
    </div>
  );
}

function normalizeForKatex(text: string): string {
  let t = text.replace(/\n{3,}/g, "\n\n");
  // charges like H^+^ -> $H^{+}$
  t = t.replace(/\b([A-Z][a-z]?)(\^\+{1,3}|\^\-{1,3})\b/g, (_m, el, charge) => {
    return `$${el}^{${String(charge).replace("^", "")}}$`;
  });
  // common: H2O -> $H_2O$
  t = t.replace(/\bH2O\b/g, "$H_2O$");
  return t;
}
