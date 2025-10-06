export function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-8 w-8 rounded-xl grid place-items-center font-bold text-black ring-2 ring-white/20 bg-[conic-gradient(at_30%_30%,#67e8f9, #93c5fd, #a78bfa, #67e8f9)]">A</div>
      <span className="text-lg font-semibold tracking-tight">AI Tutor</span>
    </div>
  );
}
