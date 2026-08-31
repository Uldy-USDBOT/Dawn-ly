const CACHE_NAME = 'alfajr-dawnly-v4';
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

  // HTML pages + CSS/JS: network-first. A stale cached copy of app.js or
  // style.css can silently break rendering/behavior sitewide, so these are
  // treated with the same urgency as the HTML pages themselves.
  const isCriticalAsset = event.request.mode === 'navigate'
    || url.endsWith('.html') || url.endsWith('/')
    || url.endsWith('.css') || url.endsWith('.js');
  if (isCriticalAsset) {
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

  // Truly static assets (icons, manifest): cache-first for speed, network fallback.
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
