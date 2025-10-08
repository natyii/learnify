export function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-8 w-8 grid place-items-center rounded-xl font-bold text-white ring-2 ring-white/15
                      bg-[conic-gradient(at_30%_30%,#1f2937,#374151,#6b7280,#a7f3d0,#1f2937)]">
        A
      </div>
      <span className="text-lg font-semibold tracking-tight">AI Tutor</span>
    </div>
  );
}
