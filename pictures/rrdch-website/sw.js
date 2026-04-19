/**
 * RRDCH Service Worker — PWA offline cache
 * Caches core assets for offline viewing.
 */
const CACHE_NAME = 'rrdch-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/departments.html',
  '/appointments.html',
  '/events.html',
  '/login.html',
  '/students.html',
  '/syllabus.html',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/js/auth.js',
  '/assets/data/departments.json',
  '/manifest.json',
];

// Install — pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  return self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
