import { PaperCard } from "./PaperCard";

export function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group">
      <summary className="list-none">
        <PaperCard className="cursor-pointer">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-black/80">{q}</h3>
            <span className="rounded-md border border-black/10 bg-white/70 px-2 py-0.5 text-xs text-black/60">
              +
            </span>
          </div>
        </PaperCard>
      </summary>
      <div className="mt-2">
        <PaperCard>
          <p className="text-[15px] text-black/75">{a}</p>
        </PaperCard>
      </div>
    </details>
  );
}
