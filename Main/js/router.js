/**
 * Router por hash.
 * Rutas: #/inicio · #/expedientes · #/nuevo · #/estadisticas · #/perfil
 * Guards de rol se añaden en la Fase 4.
 */

const ROUTES = {
  '#/inicio':        { view: 'inicio',        title: 'Inicio' },
  '#/expedientes':   { view: 'expedientes',   title: 'Expedientes' },
  '#/nuevo':         { view: 'nuevo',         title: 'Nuevo expediente' },
  '#/estadisticas':  { view: 'estadisticas',  title: 'Estadísticas' },
  '#/perfil':        { view: 'perfil',        title: 'Perfil' },
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
      <div class="p-6 text-center">
        <p class="text-sm text-red-500">${err.message}</p>
      </div>`;
  } finally {
    main.classList.remove('loading');
  }

  updateNav(hash || DEFAULT_ROUTE);
}

function updateNav(activeHash) {
  document.querySelectorAll('[data-route]').forEach(el => {
    const isActive = el.dataset.route === activeHash;
    el.querySelector('.nav-icon').classList.toggle('text-blue-600', isActive);
    el.querySelector('.nav-icon').classList.toggle('text-gray-400', !isActive);
    el.querySelector('.nav-label').classList.toggle('text-blue-600', isActive);
    el.querySelector('.nav-label').classList.toggle('text-gray-400', !isActive);
  });
}

export function navigate(hash) {
  location.hash = hash;
}

export function initRouter() {
  window.addEventListener('hashchange', () => loadView(location.hash));
  loadView(location.hash || DEFAULT_ROUTE);
}
