"use client";
import { PropsWithChildren } from "react";

/**
 * Theme — wraps pages with a soft-academia notebook canvas:
 * - warm paper base
 * - faint dots + horizontal ruling
 * - subtle vignette
 * No globals.css edits required.
 */
export default function Theme({ children }: PropsWithChildren) {
  return (
    <div
      className="min-h-[100svh] text-[#0b1220] antialiased selection:bg-emerald-200/60 selection:text-black"
      style={{
        // Layered backgrounds: vignette, notebook lines, subtle dot grid
        backgroundImage: [
          // vignette
          "radial-gradient(150% 80% at 50% -20%, rgba(0,0,0,0.08), rgba(0,0,0,0.02) 35%, rgba(0,0,0,0) 60%)",
          // ruling lines
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 34px)",
          // dot grid
          "radial-gradient(circle at 25px 25px, rgba(0,0,0,0.06) 1px, rgba(255,255,255,0) 1.5px)"
        ].join(","),
        backgroundColor: "#FAF7EF",
        backgroundSize: "100% 100%, 100% 35px, 50px 50px",
      }}
    >
      {children}
    </div>
  );
}
