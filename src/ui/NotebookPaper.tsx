// src/ui/NotebookPaper.tsx
// Local-only notebook background (no global CSS). Wrap pages with this.
import * as React from "react";

type Props = React.PropsWithChildren<{
  /** Optional: tweak line color later if you like */
  line?: string;      // e.g., "rgba(0,0,0,0.06)"
  paper?: string;     // e.g., "#faf9f6"
  dot?: string;       // faint dots, optional
}>;

export default function NotebookPaper({
  children,
  line = "rgba(0,0,0,0.06)",
  paper = "#FAF9F6",
  dot = "rgba(0,0,0,0.03)",
}: Props) {
  // A stacked background: paper color + horizontal ruled lines + subtle dots.
  const bg = {
    backgroundColor: paper,
    backgroundImage: `
      linear-gradient(${line} 1px, transparent 1px),
      radial-gradient(1px 1px at 1px 1px, ${dot} 1px, transparent 1px)
    `,
    backgroundSize: "100% 28px, 24px 24px", // line spacing, dot grid
    backgroundPosition: "0 0, 0 0",
  } as React.CSSProperties;

  return (
    <div className="relative">
      {/* fixed full-viewport paper behind content */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={bg}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
