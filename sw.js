const CACHE_NAME = 'spinwheel-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.svg',
  'https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;900&family=Orbitron:wght@700;900&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.map(url => new Request(url, {mode: 'no-cors'})));
    }).catch(() => {
      return caches.open(CACHE_NAME).then(cache => cache.addAll(['./index.html']));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
