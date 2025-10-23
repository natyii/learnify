"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Make sure KaTeX CSS is imported once globally, e.g. in app/layout.tsx:
// import "katex/dist/katex.min.css";

type TeXProps = {
  children: string;
  className?: string; // applied to an outer wrapper, not ReactMarkdown (v9 restriction)
};

/**
 * Markdown + Math renderer (GFM + KaTeX) hardened for Next 15 hydration.
 * - Paragraphs are rendered as <div> to avoid invalid <p><pre/></p> structures.
 * - Block code uses <pre><code>, inline code stays inline.
 * - KaTeX output is handled by remark-math + rehype-katex.
 */
export default function TeX({ children, className }: TeXProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Render paragraphs as neutral block containers to prevent
          // <pre> inside <p> hydration errors from mixed content.
          p({ children, ...props }) {
            return (
              <div {...props}>
                {children}
              </div>
            );
          },

          // Code rendering: inline vs fenced (block) code.
          code({ inline, className, children, ...props }) {
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="md-code-block">
                <pre className={className} {...props}>
                  <code>{children}</code>
                </pre>
              </div>
            );
          },

          // (Other elements can use defaults. KaTeX output is injected by rehype-katex.)
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
