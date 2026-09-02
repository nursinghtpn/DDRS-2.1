// Service worker minimum — hanya untuk penuhi syarat "installable" PWA
// (Chrome/Android memerlukan SW berdaftar sebelum tunjuk prom "Install App").
// Kandungan sebenar sistem (dalam iframe) TIDAK di-cache di sini —
// ia sentiasa dimuat terus dari Google Apps Script secara langsung.

const CACHE_NAME = 'icg-nursing-shell-v3';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png?v=2',
  './icons/icon-512.png?v=2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Hanya layan fail "shell" dari cache; semua permintaan lain (termasuk
// kandungan sistem sebenar dalam iframe) terus ke rangkaian seperti biasa.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && SHELL_FILES.some((f) => url.pathname.endsWith(f.replace('./', '')))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
