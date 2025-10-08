// src/ui/Nebula.tsx
"use client";

import { motion } from "framer-motion";

export default function Nebula() {
  return (
    <>
      <style jsx>{`
        .blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(50px);
          opacity: 0.5;
          mix-blend-mode: screen;
        }
      `}</style>

      <div className="absolute inset-0 -z-20">
        <motion.div
          className="blob"
          style={{ width: 380, height: 380, top: -60, left: -60, background: "radial-gradient(closest-side, #a5b4fc, transparent)" }}
          animate={{ x: [0, 40, -20, 0], y: [0, 20, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="blob"
          style={{ width: 460, height: 460, top: 120, right: -80, background: "radial-gradient(closest-side, #67e8f9, transparent)" }}
          animate={{ x: [0, -60, 30, 0], y: [0, 30, -25, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="blob"
          style={{ width: 420, height: 420, bottom: -80, left: 120, background: "radial-gradient(closest-side, #34d399, transparent)" }}
          animate={{ x: [0, 30, -40, 0], y: [0, -25, 20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </>
  );
}
