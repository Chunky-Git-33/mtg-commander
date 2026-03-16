// Commander Companion — Service Worker v9
// index.html is NEVER cached — always fetched fresh from network.
// Icons and manifest only are cached for offline use.

const CACHE_NAME = 'commander-companion-v9';
const BASE = '/mtg-commander';

const CACHE_ONLY = [
  BASE + '/manifest.json',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png',
  BASE + '/icons/icon-180.png',
  BASE + '/icons/icon-167.png',
  BASE + '/icons/icon-152.png',
  BASE + '/apple-touch-icon.png'
];

// Install — cache static assets only, never index.html
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_ONLY))
  );
  self.skipWaiting();
});

// Activate — wipe ALL previous caches without exception
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Fetch — index.html always from network, never from cache
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isHtml = url.pathname === BASE + '/'
              || url.pathname === BASE + '/index.html'
              || url.pathname.endsWith('/');

  if (isHtml) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(BASE + '/index.html'))
    );
    return;
  }

  // Static assets — network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
