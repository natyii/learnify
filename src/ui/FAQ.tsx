export function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{q}</h4>
          <span className="ml-4 text-sm text-[var(--muted)] group-open:hidden">+</span>
          <span className="ml-4 text-sm text-[var(--muted)] hidden group-open:inline">−</span>
        </div>
      </summary>
      <p className="mt-3 text-sm text-[var(--muted)]">{a}</p>
    </details>
  );
}
