/**
 * Service Worker — SGR-PPA v3
 *
 * Estrategia:
 *   · Local (JS, CSS, HTML, vistas): Network First → siempre código fresco,
 *     cache solo como fallback offline.
 *   · CDN externos (Chart.js, jsPDF, fuentes): Cache First → no cambian.
 *   · Supabase (API + Auth): nunca cachear.
 *
 * Versión bumpeada a v3 para limpiar los caches incorrectos de v2.
 */

const CACHE = 'sgr-ppa-v3';

// ── Instalación: solo el shell mínimo para abrir offline ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(['/index.html', '/manifest.json']))
  );
  self.skipWaiting();
});

// ── Activación: eliminar todos los caches anteriores ───────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ───────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Supabase: nunca interceptar (API + Auth)
  if (url.hostname.includes('supabase.co')) return;

  // CDN externos: Cache First (Chart.js, jsPDF, Google Fonts, esm.sh…)
  // Estos recursos son versionados / inmutables — no cambian.
  if (url.hostname !== location.hostname) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached ?? fetch(event.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        })
      )
    );
    return;
  }

  // Todo lo local (JS, CSS, HTML, vistas, iconos…): Network First
  // Siempre pide el archivo fresco al servidor.
  // Si no hay red, sirve el cache como último recurso.
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
