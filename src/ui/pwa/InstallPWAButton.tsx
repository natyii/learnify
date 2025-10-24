// src/ui/pwa/InstallPWAButton.tsx
"use client";

import { useEffect, useState } from "react";

type Props = { className?: string };

export default function InstallPWAButton({ className = "" }: Props) {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const ua = navigator.userAgent || navigator.vendor;
    const ios = /iPhone|iPad|iPod/.test(ua);
    setIsIOS(ios);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari's special flag
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      // @ts-ignore
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  // Hide if already installed
  if (installed || isStandalone) return null;

  // iOS fallback card
  if (isIOS && !deferred) {
    return (
      <div
        className={`${className} cursor-default rounded-full border border-transparent bg-[linear-gradient(180deg,#06B6D4_0%,#433389_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(6,182,212,0.35)]`}
      >
        Add via <span className="font-bold">Share → Add to Home Screen</span>
      </div>
    );
  }

  // Chrome/Edge install available
  if (deferred) {
    return (
      <button
        onClick={async () => {
          deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
        className={`${className} rounded-full border border-transparent bg-[linear-gradient(180deg,#06B6D4_0%,#433389_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(6,182,212,0.35)] hover:brightness-110 transition`}
      >
        Install App
      </button>
    );
  }

  // Generic fallback (other browsers)
  return (
    <div
      className={`${className} cursor-default rounded-full border border-transparent bg-[linear-gradient(180deg,#06B6D4_0%,#433389_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(6,182,212,0.35)]`}
    >
      Install via browser menu
    </div>
  );
}
