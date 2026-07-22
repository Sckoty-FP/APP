/**
 * Service Worker — SGR-PPA
 * Estrategia: Cache First para assets estáticos, Network First para vistas.
 * Las llamadas a Supabase (API y Auth) nunca se cachean.
 */

const CACHE     = 'sgr-ppa-v2';
const PRECACHE  = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/app.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/router.js',
  '/js/supabase.js',
  '/js/expedientes.js',
  '/js/comentarios.js',
  '/js/estadisticas.js',
  '/js/motivos.js',
  '/js/tecnicos.js',
  '/js/usuarios.js',
  '/js/importacion.js',
  '/js/ui/nav.js',
  '/views/login.html',
  '/views/inicio.html',
  '/views/expedientes.html',
  '/views/expediente.html',
  '/views/nuevo.html',
  '/views/estadisticas.html',
  '/views/perfil.html',
  '/views/tecnicos.html',
  '/views/usuarios.html',
  '/icons/icon.svg',
];

// ── Instalación: pre-cachear assets ────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activación: limpiar caches anteriores ──────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: Cache First para assets, Network First para vistas
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Ignorar esquemas no-HTTP (chrome-extension://, etc.)
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Supabase: nunca cachear (API + Auth)
  if (url.hostname.includes('supabase.co')) return;

  // CDN (Chart.js, etc.): Cache First
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

  // Assets JS/CSS: Cache First
  if (url.pathname.match(/\.(js|css|svg|png|ico|woff2?)$/)) {
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

  // Vistas HTML y rutas: Network First (para recibir actualizaciones)
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
