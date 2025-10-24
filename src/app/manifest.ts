// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Tutor",
    short_name: "AI Tutor",
    description: "Study smarter with grade-aware, textbook-grounded help.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      // Maskable icon improves Android install icon cropping (falls back if not present)
      { src: "/brand/logo-mark.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ],
    shortcuts: [
      { name: "Study", url: "/study" },
      { name: "Quizzes", url: "/quiz" },
      { name: "Progress", url: "/progress" }
    ]
  };
}
