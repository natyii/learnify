// public/sw.js — basic PWA service worker
const CACHE_VERSION = 'v1.0.0';
const APP_SHELL = ['/', '/favicon.ico', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_VERSION ? caches.delete(key) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(req); }
      catch {
        const cache = await caches.open(CACHE_VERSION);
        return (await cache.match(req)) || (await cache.match('/')) || Response.error();
      }
    })());
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(req);
      const network = fetch(req).then((res) => { cache.put(req, res.clone()); return res; }).catch(() => null);
      return cached || network || Response.error();
    })());
    return;
  }

  event.respondWith((async () => {
    try { return await fetch(req); }
    catch {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(req);
      return cached || Response.error();
    }
  })());
});
