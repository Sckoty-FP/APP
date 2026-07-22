/**
 * Router por hash con guard de autenticación.
 * Rutas públicas: #/login
 * Rutas protegidas: todo lo demás
 */

import { isLoggedIn, setShellVisible, getCurrentRol } from './auth.js';
import { updateNavActive } from './ui/nav.js';

const PUBLIC_ROUTES = new Set(['#/login']);

const ROUTES = {
  '#/login':         { view: 'login',        title: 'SGR-PPA',           public: true },
  '#/inicio':        { view: 'inicio',        title: 'Inicio' },
  '#/expedientes':   { view: 'expedientes',   title: 'Expedientes' },
  '#/expediente':    { view: 'expediente',    title: 'Expediente',        navActive: '#/expedientes' },
  '#/nuevo':         { view: 'nuevo',         title: 'Nuevo expediente',  navActive: '#/expedientes' },
  '#/estadisticas':  { view: 'estadisticas',  title: 'Estadísticas' },
  '#/perfil':        { view: 'perfil',        title: 'Perfil' },
  '#/usuarios':      { view: 'usuarios',      title: 'Usuarios',          navActive: '#/perfil', rol: 'admin_ppa' },
  '#/estilos':       { view: 'estilos',       title: 'Sistema visual' },  // solo dev
};

// ── Parámetros de la ruta actual ───────────────────────────────
let _currentParams = new URLSearchParams();
export function getRouteParams() { return _currentParams; }

function parseHash(rawHash) {
  const [base, qs] = (rawHash || '').split('?');
  return { base, params: new URLSearchParams(qs || '') };
}

const DEFAULT_AUTH_ROUTE   = '#/expedientes';
const DEFAULT_PUBLIC_ROUTE = '#/login';

async function loadView(rawHash) {
  const { base, params } = parseHash(rawHash);
  _currentParams = params;

  const route    = ROUTES[base] || ROUTES[DEFAULT_AUTH_ROUTE];
  const isPublic = PUBLIC_ROUTES.has(base);

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

  // Guard: ruta restringida por rol
  if (route.rol && getCurrentRol() !== route.rol) {
    navigate(DEFAULT_AUTH_ROUTE);
    return;
  }

  // Shell: ocultar header/nav en login
  const isLogin = base === '#/login';
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

    // innerHTML no ejecuta <script> — ejecutar directamente con Function
    // (evita polyfills de Tailwind CDN que interceptan replaceWith/replaceChild)
    main.querySelectorAll('script').forEach(old => {
      if (old.src) {
        const s = document.createElement('script');
        s.src = old.src;
        document.head.appendChild(s);
      } else {
        // eslint-disable-next-line no-new-func
        new Function(old.textContent)();
      }
      old.remove();
    });
  } catch (err) {
    main.innerHTML = `
      <div class="empty-state">
        <p style="color:var(--danger);font-size:var(--text-sm);">${err.message}</p>
      </div>`;
  } finally {
    main.classList.remove('loading');
  }

  // Actualizar nav activo (solo en rutas protegidas)
  if (!isLogin) updateNavActive(route.navActive || base || DEFAULT_AUTH_ROUTE);
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

// ── Exponer para los scripts de las vistas (no son módulos) ───
window.__navigate        = navigate;
window.__getRouteParams  = getRouteParams;
