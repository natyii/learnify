// src/ui/pwa/InstallPWAButton.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  className?: string;
  children?: React.ReactNode; // label override
};

function getUAHints() {
  if (typeof navigator === "undefined") return { browser: "unknown", os: "unknown" };
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  const isIPadOS =
    /Macintosh/.test(ua) && "ontouchend" in document; // iPadOS reports as Mac
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isFirefox = /firefox/i.test(ua);
  const isEdge = /edg/i.test(ua);
  const isChrome = /chrome|crios|chromium/i.test(ua) && !isEdge && !isSafari;
  const os = isIOS || isIPadOS ? "ios" : /Mac/i.test(ua) ? "mac" : /Win/i.test(ua) ? "windows" : "other";
  const browser = isSafari ? "safari" : isFirefox ? "firefox" : isEdge ? "edge" : isChrome ? "chrome" : "other";
  return { os, browser, isIOS, isIPadOS, isSafari, isFirefox, isEdge, isChrome };
}

export default function InstallPWAButton({ className = "", children }: Props) {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const hints = useMemo(getUAHints, []);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      // Chrome/Edge will fire this when all install criteria met
      e.preventDefault();
      // @ts-ignore
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall as any, { once: true });
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall as any);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // If app already running as standalone, hide button entirely
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari standalone detection
      (window.navigator as any).standalone);

  if (installed || isStandalone) return null;

  const canInstall = !!deferred;

  // Friendly fallback text per browser when beforeinstallprompt isn't available
  const fallbackLabel = useMemo(() => {
    if (hints.isSafari && (hints.os === "ios" || hints.os === "mac")) {
      return "How to install";
    }
    if (hints.browser === "firefox") return "How to install";
    if (hints.browser === "edge") return "How to install";
    // If unknown browser and no event, still show help
    return "How to install";
  }, [hints]);

  const helpSteps = useMemo(() => {
    if (hints.isSafari && hints.os === "ios") {
      return [
        "Tap the Share icon",
        "Choose “Add to Home Screen”",
        "Tap Add",
      ];
    }
    if (hints.isSafari && hints.os === "mac") {
      // Safari 17+: Share > Add to Dock
      return [
        "In Safari menu bar, choose Share",
        "Click “Add to Dock”",
        "Open the app from your Dock",
      ];
    }
    if (hints.browser === "firefox") {
      return [
        "Click the install icon in the address bar",
        "Confirm Install",
      ];
    }
    if (hints.browser === "edge") {
      return [
        "Click ⋯ (menu) > Apps > Install this site as an app",
        "Confirm Install",
      ];
    }
    // Generic Chrome fallback (if event didn't fire yet)
    return [
      "Refresh the page once (service worker just registered)",
      "Then click this button when it says “Install app”",
    ];
  }, [hints]);

  if (canInstall) {
    return (
      <button
        onClick={async () => {
          deferred.prompt();
          await deferred.userChoice; // { outcome: 'accepted' | 'dismissed' }
          setDeferred(null);
        }}
        className={className}
        title="Install app"
      >
        {children ?? "Install app"}
      </button>
    );
  }

  // Fallback UI: show help steps popover
  return (
    <div className="relative">
      <button
        onClick={() => setShowHelp((v) => !v)}
        className={className}
        title="How to install"
      >
        {children ?? fallbackLabel}
      </button>

      {showHelp && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-black/10 bg-white p-3 text-sm text-slate-800 shadow-lg">
          <div className="mb-1 font-semibold">Install on your device</div>
          <ol className="list-decimal pl-4">
            {helpSteps.map((s) => (
              <li key={s} className="mb-1">{s}</li>
            ))}
          </ol>
          <button
            onClick={() => setShowHelp(false)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs hover:bg-white"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
