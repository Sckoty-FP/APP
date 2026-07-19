/**
 * Router por hash con guard de autenticación.
 * Rutas públicas: #/login
 * Rutas protegidas: todo lo demás
 */

import { isLoggedIn, setShellVisible } from './auth.js';
import { updateNavActive } from './ui/nav.js';

const PUBLIC_ROUTES = new Set(['#/login']);

const ROUTES = {
  '#/login':         { view: 'login',        title: 'SGR-PPA',           public: true },
  '#/inicio':        { view: 'inicio',        title: 'Inicio' },
  '#/expedientes':   { view: 'expedientes',   title: 'Expedientes' },
  '#/nuevo':         { view: 'nuevo',         title: 'Nuevo expediente' },
  '#/estadisticas':  { view: 'estadisticas',  title: 'Estadísticas' },
  '#/perfil':        { view: 'perfil',        title: 'Perfil' },
  '#/estilos':       { view: 'estilos',       title: 'Sistema visual' },  // solo dev
};

const DEFAULT_AUTH_ROUTE   = '#/expedientes';
const DEFAULT_PUBLIC_ROUTE = '#/login';

async function loadView(hash) {
  const route = ROUTES[hash] || ROUTES[DEFAULT_AUTH_ROUTE];
  const isPublic = PUBLIC_ROUTES.has(hash);

  // Guard: ruta protegida sin sesión → login
  if (!isPublic && !isLoggedIn()) {
    navigate(DEFAULT_PUBLIC_ROUTE);
    return;
  }

  // Guard: ya autenticado intenta ir al login → volver atrás
  if (isPublic && isLoggedIn()) {
    navigate(DEFAULT_AUTH_ROUTE);
    return;
  }

  // Shell: ocultar header/nav en login
  const isLogin = hash === '#/login';
  setShellVisible(!isLogin);

  // Actualizar título
  const titleEl = document.getElementById('page-title');
  if (titleEl && !isLogin) titleEl.textContent = route.title;

  // Cargar vista
  const main = document.getElementById('app-main');
  main.classList.add('loading');

  try {
    const res = await fetch(`views/${route.view}.html`);
    if (!res.ok) throw new Error(`Vista no encontrada: ${route.view}`);
    main.innerHTML = await res.text();
  } catch (err) {
    main.innerHTML = `
      <div class="empty-state">
        <p style="color:var(--danger);font-size:var(--text-sm);">${err.message}</p>
      </div>`;
  } finally {
    main.classList.remove('loading');
  }

  // Actualizar nav activo (solo en rutas protegidas)
  if (!isLogin) updateNavActive(hash || DEFAULT_AUTH_ROUTE);
}

export function navigate(hash) {
  if (location.hash !== hash) {
    location.hash = hash;
  } else {
    // Misma ruta — forzar recarga de vista
    loadView(hash);
  }
}

export function initRouter() {
  window.addEventListener('hashchange', () => loadView(location.hash));
  loadView(location.hash || DEFAULT_PUBLIC_ROUTE);
}
