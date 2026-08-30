const CACHE_NAME = 'alfajr-dawnly-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './quran.html',
  './hadith.html',
  './duas.html',
  './qa.html',
  './support.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isRemoteApi = url.includes('api.aladhan.com') || url.includes('cdn.islamic.network') || url.includes('mp3quran.net');
  if (isRemoteApi) return; // let these go straight to network, no caching

  // HTML pages: network-first, so edits to index.html/support.html show up
  // immediately for returning visitors instead of waiting on a version bump.
  const isHTMLPage = event.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/');
  if (isHTMLPage) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets (icons, manifest, fonts): cache-first for speed, network fallback.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      }).catch(() => cached);
    })
  );
});
