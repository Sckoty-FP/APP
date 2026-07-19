/**
 * Router por hash.
 * Rutas: #/inicio · #/expedientes · #/nuevo · #/estadisticas · #/perfil · #/estilos
 * Guards de rol se añaden en la Fase 4.
 */

import { updateNavActive } from './ui/nav.js';

const ROUTES = {
  '#/inicio':        { view: 'inicio',        title: 'Inicio' },
  '#/expedientes':   { view: 'expedientes',   title: 'Expedientes' },
  '#/nuevo':         { view: 'nuevo',         title: 'Nuevo expediente' },
  '#/estadisticas':  { view: 'estadisticas',  title: 'Estadísticas' },
  '#/perfil':        { view: 'perfil',        title: 'Perfil' },
  '#/estilos':       { view: 'estilos',       title: 'Sistema visual' },  // solo dev
};

const DEFAULT_ROUTE = '#/inicio';

async function loadView(hash) {
  const route  = ROUTES[hash] || ROUTES[DEFAULT_ROUTE];
  const main   = document.getElementById('app-main');
  const header = document.getElementById('page-title');

  header.textContent = route.title;
  main.classList.add('loading');

  try {
    const res = await fetch(`views/${route.view}.html`);
    if (!res.ok) throw new Error(`Vista no encontrada: ${route.view}`);
    main.innerHTML = await res.text();
  } catch (err) {
    main.innerHTML = `
      <div class="empty-state">
        <p style="color:var(--danger); font-size:var(--text-sm);">${err.message}</p>
      </div>`;
  } finally {
    main.classList.remove('loading');
  }

  updateNavActive(hash || DEFAULT_ROUTE);
}

export function navigate(hash) {
  location.hash = hash;
}

export function initRouter() {
  window.addEventListener('hashchange', () => loadView(location.hash));
  loadView(location.hash || DEFAULT_ROUTE);
}
