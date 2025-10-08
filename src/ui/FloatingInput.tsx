"use client";

import clsx from "clsx";
import { InputHTMLAttributes, useId, useState } from "react";

export function FloatingInput(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  const [focus, setFocus] = useState(false);
  const hasValue = !!(props.value ?? props.defaultValue);

  return (
    <div className="relative">
      <input
        id={id}
        {...props}
        onFocus={(e)=>{ setFocus(true); props.onFocus?.(e); }}
        onBlur={(e)=>{ setFocus(false); props.onBlur?.(e); }}
        className={clsx(
          "w-full rounded-xl bg-white/70 backdrop-blur-md",
          "border border-black/15 px-4 pt-5 pb-2",
          "shadow-[var(--shadow-sm)] outline-none",
          "focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--plat-blue)]",
          props.className
        )}
      />
      <label
        htmlFor={id}
        className={clsx(
          "pointer-events-none absolute left-4 text-[13px] transition-all",
          focus || hasValue ? "top-1 text-[12px] text-black/60" : "top-3.5 text-black/40"
        )}
      >
        {props.label}
      </label>
    </div>
  );
}
