/**
 * Punto de entrada de la aplicación.
 * Orden de inicialización:
 *   1. Renderizar nav
 *   2. Iniciar router
 *   3. Supabase + Auth se inicializan en la Fase 4
 */

import { renderNav } from './ui/nav.js';
import { initRouter } from './router.js';

function init() {
  renderNav(location.hash || '#/inicio');
  initRouter();
}

document.addEventListener('DOMContentLoaded', init);
