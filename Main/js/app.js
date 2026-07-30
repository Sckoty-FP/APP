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

// ── PWA — capturar prompt de instalación ───────────────────
// Hay que interceptarlo lo antes posible (antes del DOMContentLoaded)
window.__pwaInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();                          // evitar el mini-infobar automático
  window.__pwaInstallPrompt = e;
  window.dispatchEvent(new Event('pwa:installable'));
});

window.addEventListener('appinstalled', () => {
  window.__pwaInstallPrompt = null;
  window.dispatchEvent(new Event('pwa:installed'));
});

// ── Service Worker ─────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err =>
    console.warn('[SW] registro fallido:', err)
  );
}

document.addEventListener('DOMContentLoaded', init);
