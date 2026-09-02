// ============================================================
// DDRS Service Worker — membolehkan aplikasi "Add to Home Screen" / dipasang
// sebagai aplikasi mudah alih, dengan caching asas untuk pemuatan lebih pantas.
// ============================================================
const CACHE_NAME = 'ddrs-cache-v1';
const ASSET_UNTUK_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Simpan aset asas ke cache semasa pemasangan
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSET_UNTUK_CACHE))
  );
  self.skipWaiting();
});

// Buang cache versi lama semasa diaktifkan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategi: rangkaian dahulu (data sentiasa terkini), fallback ke cache jika luar talian
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
