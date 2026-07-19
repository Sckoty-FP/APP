/**
 * Menú de navegación inferior — Enterprise SaaS v2
 * Item activo: fondo glass con color, pill subtle.
 */

const NAV_ITEMS = [
  {
    route: '#/inicio',
    label: 'Inicio',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>`,
  },
  {
    route: '#/expedientes',
    label: 'Expedientes',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
    </svg>`,
  },
  {
    route: '#/nuevo',
    label: 'Nuevo',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
    </svg>`,
  },
  {
    route: '#/estadisticas',
    label: 'Estadísticas',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>`,
  },
  {
    route: '#/perfil',
    label: 'Perfil',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>`,
  },
];

// Rutas visibles por rol — supervisor ve todo, el resto no crea expedientes
const NAV_ROUTES = {
  supervisor:  ['#/inicio', '#/expedientes', '#/nuevo', '#/estadisticas', '#/perfil'],
  jefe_zona:   ['#/inicio', '#/expedientes', '#/estadisticas', '#/perfil'],
  jefe_equipo: ['#/inicio', '#/expedientes', '#/estadisticas', '#/perfil'],
};

export function renderNav(activeRoute, rol) {
  const nav = document.getElementById('app-nav');
  if (!nav) return;
  const active  = activeRoute || '#/inicio';
  const allowed = NAV_ROUTES[rol] ?? NAV_ROUTES.supervisor;
  const items   = NAV_ITEMS.filter(i => allowed.includes(i.route));
  nav.innerHTML = `
    <div class="nav-inner">
      ${items.map(item => `
        <a href="${item.route}"
           data-route="${item.route}"
           class="nav-item${item.route === active ? ' active' : ''}">
          ${item.icon}
          <span class="nav-label">${item.label}</span>
        </a>`).join('')}
    </div>
  `;
}

export function updateNavActive(hash) {
  document.querySelectorAll('[data-route]').forEach(el => {
    el.classList.toggle('active', el.dataset.route === hash);
  });
}
