"use client";
import { PropsWithChildren } from "react";

/**
 * Warm “notebook page” canvas:
 * - paper base
 * - faint horizontal ruling + soft dot grid
 * - gentle vignette
 * Pure presentational. No globals changed.
 */
export default function Theme({ children }: PropsWithChildren) {
  return (
    <div
      className="min-h-[100svh] antialiased text-[#0b1220] selection:bg-emerald-200/60 selection:text-black"
      style={{
        backgroundImage: [
          // vignette
          "radial-gradient(150% 80% at 50% -20%, rgba(0,0,0,0.08), rgba(0,0,0,0.02) 35%, rgba(0,0,0,0) 60%)",
          // horizontal ruling (every 35px)
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 34px)",
          // subtle dot grid
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
