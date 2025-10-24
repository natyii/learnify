// public/sw.js
// Minimal service worker: immediately activate and control clients.
// No caching logic needed for installability (Chrome only checks that a SW exists).

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through network (keeps things simple)
self.addEventListener("fetch", () => {});
