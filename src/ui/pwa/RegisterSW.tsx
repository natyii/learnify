// src/ui/pwa/RegisterSW.tsx
"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const alreadyReloaded = sessionStorage.getItem("sw-reloaded");

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(async (reg) => {
        // Wait for the worker to be ready and controlling this page.
        await navigator.serviceWorker.ready;

        // If there is no controller yet but we have an active worker,
        // reload once so the SW controls this tab (required for installability).
        if (!navigator.serviceWorker.controller && reg.active && !alreadyReloaded) {
          sessionStorage.setItem("sw-reloaded", "1");
          location.reload();
        }
      })
      .catch(() => {
        // ignore
      });

    // Optional: clear the one-shot flag when tab closes
    const handler = () => sessionStorage.removeItem("sw-reloaded");
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, []);

  return null;
}
