// src/ui/pwa/InstallPWAButton.tsx
"use client";

import * as React from "react";

type Props = React.PropsWithChildren<{
  className?: string;
  iosHelperClassName?: string;
}>;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function usePWAInstall() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  const [showIOSHelp, setShowIOSHelp] = React.useState(false);

  React.useEffect(() => {
    // installed?
    const isStandalone =
      (typeof window !== "undefined" &&
        (window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone === true)) ||
      false;
    setInstalled(isStandalone);

    // Android/desktop Chrome prompt
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowIOSHelp(false);
    };

    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari guide (no beforeinstallprompt)
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isiOS = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    if (isiOS && isSafari && !isStandalone) {
      setShowIOSHelp(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canInstall = !!deferred && !installed;

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null); // event becomes single-use
    }
  };

  return {
    installed,
    canInstall,
    install,
    showIOSHelp,
    dismissIOS: () => setShowIOSHelp(false),
  };
}

export default function InstallPWAButton({
  className,
  iosHelperClassName,
  children,
}: Props) {
  const { installed, canInstall, install, showIOSHelp, dismissIOS } = usePWAInstall();

  // Nothing to show if already installed and no iOS hint is needed
  if (installed || (!canInstall && !showIOSHelp)) return null;

  return (
    <div className="relative">
      {/* Actual install button (Android/Chrome/Edge) */}
      {canInstall && (
        <button
          type="button"
          onClick={install}
          className={
            className ??
            "rounded-full px-4 py-2 text-sm font-semibold bg-black text-white"
          }
          aria-label="Install app"
        >
          {children ?? "Install app"}
        </button>
      )}

      {/* iOS Safari helper (Share → Add to Home Screen) */}
      {!canInstall && showIOSHelp && (
        <div
          className={
            iosHelperClassName ??
            "rounded-full border border-black/10 bg-white/80 px-3 py-2 text-xs font-medium text-slate-800 backdrop-blur hover:bg-white"
          }
          role="note"
        >
          <span className="hidden sm:inline">
            Install via browser menu: Share → “Add to Home Screen”
          </span>
          <span className="sm:hidden">Share → “Add to Home Screen”</span>
          <button
            type="button"
            onClick={dismissIOS}
            className="ml-2 rounded-md px-2 py-0.5 text-[11px] border border-black/10 hover:bg-black/5"
            aria-label="Dismiss install helper"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
