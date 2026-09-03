// ============================================================
// DDRS Service Worker — membolehkan aplikasi "Add to Home Screen" / dipasang
// sebagai aplikasi mudah alih.
//
// PENTING: index.html (app shell) TIDAK PERNAH di-cache. Ia sentiasa diambil
// terus dari rangkaian setiap kali dibuka, supaya aplikasi yang sudah
// dipasang di telefon SENTIASA guna versi/logik terkini dan tidak
// "terperangkap" pada versi lama (punca data tidak keluar selepas kemas kini).
// Hanya aset statik (ikon, manifest) yang di-cache untuk pemuatan lebih pantas.
// ============================================================
const CACHE_NAME = 'ddrs-cache-v2'; // Naikkan nombor versi ini setiap kali deploy besar untuk buang cache lama
const ASSET_STATIK = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Simpan aset statik sahaja semasa pemasangan
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSET_STATIK))
  );
  self.skipWaiting();
});

// Buang SEMUA cache versi lama semasa diaktifkan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Dokumen HTML (app shell) — SENTIASA rangkaian, TIADA fallback cache.
  // Ini memastikan aplikasi yang dipasang sentiasa guna kod & konfigurasi
  // (cth: APPS_SCRIPT_URL) yang PALING TERKINI, elak "terperangkap" versi lama.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(fetch(req));
    return;
  }

  // Aset statik lain (ikon, manifest) — rangkaian dahulu, fallback cache jika luar talian
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
