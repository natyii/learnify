import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ethiopian AI Tutor",
    short_name: "AI Tutor",
    description:
      "Grade-aware study PWA aligned to Ethiopian MoE textbooks with study chat, quizzes, and progress.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1220",
    theme_color: "#0b1220",

    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],

    categories: ["education", "productivity"],

    // Optional metadata polish
    dir: "ltr",
    lang: "en",
    prefer_related_applications: false,
    display_override: ["standalone", "minimal-ui"],
  };
}
