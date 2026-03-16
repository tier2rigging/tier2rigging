// Tier2 Rigging Service Worker
// ── BUMP THIS NUMBER every time you deploy changes ──
const VERSION    = '4';
const CACHE_NAME = 'tier2-v' + VERSION;

const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/customer.html',
  '/admin.html',
  '/customers.html',
  '/rigger-update.html',
  '/dashboard.html',
  '/intake.html',
  '/invoice.html',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install — cache core pages and skip waiting immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate — delete old caches, take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// Tell all open pages when a new version is ready
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
