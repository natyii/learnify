// src/ui/progress/Charts.tsx
"use client";

import { motion } from "framer-motion";
import React from "react";

export function Donut({
  size = 160,
  stroke = 18,
  segments,
  title,
}: {
  size?: number;
  stroke?: number;
  segments: { label: string; value: number }[];
  title?: string;
}) {
  const radius = (size - stroke) / 2;
  const C = 2 * Math.PI * radius;
  const total = Math.max(1, segments.reduce((a, s) => a + (s.value || 0), 0));

  let acc = 0;
  const arcs = segments.map((s, i) => {
    const len = (s.value / total) * C;
    const dasharray = `${len} ${C - len}`;
    const dashoffset = -acc;
    acc += len;
    return (
      <motion.circle
        key={i}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={dasharray}
        strokeDashoffset={dashoffset}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: i * 0.1 }}
        className="text-indigo-600"
        style={{ stroke: "currentColor" }}
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          strokeWidth={stroke}
          className="text-black/10"
          style={{ stroke: "currentColor" }}
        />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>{arcs}</g>
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-[#0b1220]"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          {title || "Breakdown"}
        </text>
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
            <span>
              {s.label}: {s.value || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Bars({
  data,
  title,
  height = 160,
}: {
  data: { label: string; value: number }[];
  title?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  return (
    <div className="w-full">
      <div className="mb-2 text-sm font-semibold text-slate-700">{title}</div>
      <div className="flex items-end gap-4 h-[180px]">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * height}px` }}
              transition={{ duration: 0.9, delay: i * 0.05 }}
              className="w-full rounded-t-md bg-gradient-to-b from-indigo-500/80 to-cyan-400/80 shadow"
            />
            <div className="mt-1 text-[11px] text-slate-600 text-center">
              {d.label}
            </div>
            <div className="text-[11px] font-semibold">
              {Math.round(d.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Line({
  points,
  title,
  height = 180,
}: {
  points: { x: number; y: number }[];
  title?: string;
  height?: number;
}) {
  const w = 500;
  const h = height;
  const pad = 16;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 1);
  const minY = 0;
  const maxY = Math.max(...ys, 1);
  const scaleX = (x: number) =>
    pad + ((x - minX) / Math.max(1, maxX - minX)) * (w - pad * 2);
  const scaleY = (y: number) =>
    h - pad - ((y - minY) / Math.max(1, maxY - minY)) * (h - pad * 2);

  const d = points.length
    ? points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.x)} ${scaleY(p.y)}`)
        .join(" ")
    : "";

  return (
    <div className="w-full">
      <div className="mb-2 text-sm font-semibold text-slate-700">{title}</div>
      <svg width={w} height={h} className="overflow-visible">
        {[0.25, 0.5, 0.75].map((t, i) => (
          <line
            key={i}
            x1={pad}
            x2={w - pad}
            y1={pad + t * (h - pad * 2)}
            y2={pad + t * (h - pad * 2)}
            className="stroke-black/10"
          />
        ))}
        <motion.path
          d={d}
          fill="none"
          className="stroke-indigo-600"
          strokeWidth={3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={scaleX(p.x)}
            cy={scaleY(p.y)}
            r={3}
            className="fill-indigo-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.03 }}
          />
        ))}
      </svg>
    </div>
  );
}
