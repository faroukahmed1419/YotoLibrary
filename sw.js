// OuterSchool — offline service worker
// Strategy:
//  - App shell (this file's folder: index.html, icon.png, effects.json, ui.json,
//    SUBPROGRAM/manifest.json, etc.) → cache-first, so the app opens with zero network.
//  - Everything else (CDN fonts/icons/scripts, RSS feeds, program library files) →
//    network-first with a cache fallback, so it still works offline after the first visit,
//    but picks up updates whenever a connection is available.

const CACHE_NAME = 'outerschool-v1';
const APP_SHELL = [
  './',
  './index.html',
  './icon.png',
  './ui.json',
  './fonts.json',
  './Effects/effects.json',
  './Wallpapers/manifest.json',
  './SUBPROGRAM/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        APP_SHELL.map((url) => cache.add(url).catch(() => { /* file may not exist on this host yet — skip it */ }))
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // never cache POST/PUT etc.

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin) {
    // App shell / same-site files: cache-first, refresh cache in background.
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  } else {
    // Cross-origin (fonts, Font Awesome, RSS parser, etc.): network-first, cache fallback.
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
  }
});
