// Luna Service Worker v5 - Network-first for fresh updates
const CACHE_NAME = 'luna-v5';

// Install - skip waiting immediately
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Activate - clear ALL old caches immediately
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.map(key => caches.delete(key)))
        ).then(() => self.clients.claim())
    );
});

// Fetch - NETWORK FIRST (always get fresh files, fall back to cache)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache the fresh response for offline use
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => {
                // Only use cache if network fails (offline)
                return caches.match(event.request)
                    .then(response => response || caches.match('/index.html'));
            })
    );
});
