import { ReactNode } from "react";
import { clsx } from "clsx";

/**
 * PaperCard: tuned for the legal-pad bg. High legibility, soft glass, warm border.
 */
export function PaperCard({
  className,
  children,
  as: As = "div",
  hover = true,
}: {
  className?: string;
  children: ReactNode;
  as?: any;
  hover?: boolean;
}) {
  return (
    <As
      className={clsx(
        "rounded-2xl border p-5",
        // background: warm translucent paper + subtle blur
        "bg-[rgba(255,255,255,0.72)] backdrop-blur-[6px]",
        // warm border that matches paper tone
        "border-[rgba(206,190,130,0.45)]",
        // soft elevation
        "shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        hover && "transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </As>
  );
}
