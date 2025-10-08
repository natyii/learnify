import clsx from "clsx";

export function ProgressRing({ value, size=44, stroke=6, className }: { value: number; size?: number; stroke?: number; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className={clsx(className)}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(2,6,23,0.08)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#g)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${c} ${c}`} strokeDashoffset={dash}
        style={{ transition: "stroke-dashoffset .4s ease" }}
      />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#007BFF" />
          <stop offset="100%" stopColor="#89CFF0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
