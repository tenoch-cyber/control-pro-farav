/* Control Pro · Service Worker: permite abrir la app sin internet. © 2026 Grupo Farav */
const VERSION = 'cp-v1.5.1';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png', './logo-farav.jpg', './apple-touch-icon.png'];
const FB = '10.12.2';
const LIBS = [
  `https://www.gstatic.com/firebasejs/${FB}/firebase-app.js`,
  `https://www.gstatic.com/firebasejs/${FB}/firebase-auth.js`,
  `https://www.gstatic.com/firebasejs/${FB}/firebase-firestore.js`
];
// Solo se guardan en caché estos servidores externos (librerías y fuentes). Nunca los datos de Firestore.
const CDN = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    await Promise.all(LIBS.map((u) => c.add(new Request(u, { mode: 'cors' })).catch(() => {})));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/__/')) return; // inicio de sesión de Google: nunca desde caché

  // Páginas de la app: primero internet (para recibir actualizaciones), si no hay, la copia guardada.
  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const c = await caches.open(VERSION);
        c.put('./index.html', res.clone());
        return res;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  const same = url.origin === self.location.origin;
  if (!same && !CDN.includes(url.hostname)) return; // Firestore, Auth, etc.: sin tocar

  // Archivos propios y librerías: copia guardada primero, se actualiza en segundo plano.
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    const hit = await c.match(req);
    const net = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await net) || Response.error();
  })());
});
