const CACHE_NAME = 'kitchen-ai-cache-v6';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/firebase-config.js',
  '/logo192.png',
  '/logo512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) => keys.filter((key) => key !== CACHE_NAME))
        .then((oldKeys) => Promise.all(oldKeys.map((key) => caches.delete(key)))),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for navigations to prevent stale HTML after deploy.
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' }))
        .then((response) => {
          if (response && response.ok) {
            const ct = response.headers.get('content-type') || '';
            if (ct.includes('text/html')) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone));
            }
          }
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      });
    }),
  );
});
