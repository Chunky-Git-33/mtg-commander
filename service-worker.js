// Commander Companion — Service Worker v7
// Network-first: always fetches fresh when online, cache fallback when offline.

const CACHE_NAME = 'commander-companion-v7';
const BASE = '/mtg-commander';

const ASSETS_TO_CACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png',
  BASE + '/icons/icon-180.png',
  BASE + '/icons/icon-167.png',
  BASE + '/icons/icon-152.png',
  BASE + '/apple-touch-icon.png'
];

// Install — pre-cache assets, skip waiting immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate — wipe ALL old caches, claim all clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Fetch — NETWORK FIRST, fall back to cache only when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request)
          .then(cached => cached || caches.match(BASE + '/index.html'))
      )
  );
});
