/**
 * Punto de entrada de la aplicación.
 * Orden de inicialización:
 *   1. Renderizar nav
 *   2. Inicializar auth (verifica sesión, escucha cambios)
 *   3. Iniciar router (el guard de auth ya funciona)
 */

import { renderNav }  from './ui/nav.js';
import { initAuth }   from './auth.js';
import { initRouter } from './router.js';

async function init() {
  renderNav(location.hash || '#/expedientes');

  // Auth primero — el router necesita saber si hay sesión
  await initAuth();

  initRouter();
}

// ── Service Worker ─────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err =>
    console.warn('[SW] registro fallido:', err)
  );
}

document.addEventListener('DOMContentLoaded', init);
