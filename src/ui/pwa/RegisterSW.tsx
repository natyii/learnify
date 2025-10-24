// src/ui/pwa/RegisterSW.tsx
"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      // Keep scope at root (/) so it covers the whole app
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {/* ignore */});
    }
  }, []);
  return null;
}
