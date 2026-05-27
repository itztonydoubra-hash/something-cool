// Luna Service Worker - Enables offline support & installability
const CACHE_NAME = 'luna-v4';
const ASSETS = [
    '/',
    '/index.html',
    '/src/css/style.css',
    '/src/css/components.css',
    '/src/css/pages.css',
    '/src/js/storage.js',
    '/src/js/cycle.js',
    '/src/js/mood.js',
    '/src/js/water.js',
    '/src/js/skincare.js',
    '/src/js/budget.js',
    '/src/js/selfcare.js',
    '/src/js/affirmations.js',
    '/src/js/aichat.js',
    '/src/js/insights.js',
    '/src/js/outfits.js',
    '/src/js/onboarding.js',
    '/src/js/dashboard.js',
    '/src/js/app.js',
    '/manifest.json'
];

// Install - cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
        ).then(() => self.clients.claim())
    );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => caches.match('/index.html'))
    );
});
