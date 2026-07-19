/**
 * Punto de entrada de la aplicación.
 * Orden de inicialización:
 *   1. Renderizar nav (no necesita auth ni supabase)
 *   2. Iniciar router
 *   3. Supabase + Auth se inicializan en la Fase 4
 */

import { renderNav } from './ui/nav.js';
import { initRouter } from './router.js';

function init() {
  renderNav();
  initRouter();
}

document.addEventListener('DOMContentLoaded', init);
