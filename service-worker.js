const CACHE_NAME = 'srtf-simulator-v1';
const ASSETS = [
    '/srtf-simulator/',
    '/srtf-simulator/index.html',
    '/srtf-simulator/bootstrap.min.css',
    '/srtf-simulator/styles.css',
    '/srtf-simulator/script.js',
    '/srtf-simulator/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
