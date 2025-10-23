"use client";
import React, { useEffect, useRef } from "react";

type Props = {
  /** Optional gate; if omitted the overlay renders (open=true). */
  open?: boolean;
  onClose: () => void;
  correct: number;
  total: number;
  /** If omitted we infer from correct/total. */
  scorePercent?: number;
};

export default function ResultOverlay({
  open = true,
  onClose,
  correct,
  total,
  scorePercent,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animate a celebratory circle around the score
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const radius = Math.min(w, h) / 3;
    const duration = 1500; // ms
    let raf = 0;

    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ef4444";

    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      ctx.clearRect(0, 0, w, h);

      // Draw partial circle
      ctx.beginPath();
      const startAng = -Math.PI / 2;
      const endAng = startAng + t * Math.PI * 2;
      ctx.arc(w / 2, h / 2, radius, startAng, endAng);
      ctx.stroke();

      // Pen tip
      const x = w / 2 + radius * Math.cos(endAng);
      const y = h / 2 + radius * Math.sin(endAng);
      ctx.beginPath();
      ctx.fillStyle = "#ef4444";
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      if (t < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;

  const pct =
    typeof scorePercent === "number"
      ? scorePercent
      : Math.round((correct / Math.max(total, 1)) * 100);

  const label =
    pct < 60 ? (
      <span style={{ color: "#f87171" }}>Keep Practicing</span>
    ) : pct < 85 ? (
      <span style={{ color: "#fb923c" }}>Good Job!</span>
    ) : (
      <span style={{ color: "#10b981" }}>Excellent!</span>
    );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(92vw, 460px)",
          borderRadius: 18,
          background: "linear-gradient(145deg,#ffffff,#fafafa)",
          boxShadow: "0 10px 30px rgba(0,0,0,.15)",
          padding: "24px 24px 28px",
        }}
      >
        <div
          style={{
            position: "relative",
            height: 180,
            display: "grid",
            placeItems: "center",
            marginBottom: 10,
          }}
        >
          <canvas
            ref={canvasRef}
            width={260}
            height={180}
            style={{
              position: "absolute",
              inset: 0,
              margin: "auto",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#e11d48",
              letterSpacing: "-0.01em",
            }}
          >
            {correct}/{total}
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 20,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            {pct}%
          </div>
          <div
            style={{
              fontWeight: 700,
              color: "#475569",
              fontSize: 16,
            }}
          >
            {label}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg,#06b6d4,#22c55e)",
              border: "none",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
