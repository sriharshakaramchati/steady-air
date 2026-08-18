const CACHE = 'steady-air-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  // { cache: 'reload' } bypasses the browser's HTTP cache. Without it a new
  // worker can re-cache the *previous* build straight out of the HTTP cache
  // (GitHub Pages serves HTML with a max-age), so a shipped fix would never
  // reach anyone who had already opened the app.
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first: in airplane mode everything comes straight from cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) => hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
    )
  );
});
