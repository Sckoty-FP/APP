/**
 * Módulo de autenticación — Fase 4
 * - Login / logout con Supabase Auth
 * - Sesión persistente
 * - Carga del perfil desde tabla `usuarios`
 * - Caché en memoria del usuario y rol activos
 */

import { initSupabase, getSupabase } from './supabase.js';
import { navigate } from './router.js';
import { iniciarNotificaciones, detenerNotificaciones, getExpedientesConNotif } from './notificaciones.js';
import { renderNav } from './ui/nav.js';

// ── Estado en memoria ──────────────────────────────────────────
let _currentUser  = null;   // { id, nombre, email, rol, activo }
let _initialized  = false;

// ── Redirección por rol ────────────────────────────────────────
function redirectByRol(rol) {
  switch (rol) {
    case 'supervisor':   navigate('#/expedientes'); break;
    case 'jefe_zona':    navigate('#/estadisticas'); break;
    case 'jefe_equipo':  navigate('#/expedientes'); break;
    default:             navigate('#/expedientes'); break;
  }
}

// ── Cargar perfil desde la tabla `usuarios` ────────────────────
async function loadProfile(authUser) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('usuarios')
    .select('id, nombre, email, rol, activo')
    .eq('id', authUser.id)
    .single();

  if (error || !data) {
    throw new Error('No se encontró tu perfil en el sistema. Contactá con el supervisor.');
  }

  if (!data.activo) {
    throw new Error('Tu cuenta está desactivada. Contactá con el supervisor.');
  }

  _currentUser = data;
  return data;
}

// ── Actualizar UI del header según usuario logueado ────────────
function updateHeaderUser() {
  if (!_currentUser) return;
  // Re-renderizar nav con el rol correcto (oculta "Nuevo" para no-supervisores)
  renderNav(location.hash || '#/expedientes', _currentUser.rol);

  const titleEl  = document.getElementById('page-title');
  const actionEl = document.getElementById('header-action');
  if (!actionEl) return;

  // Iniciales del usuario
  const initials = _currentUser.nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  actionEl.innerHTML = `
    <button
      id="btn-notif"
      class="header-icon-btn notif-btn"
      aria-label="Notificaciones"
      style="cursor:pointer; border:none;"
      onclick="window.__notifNavegar()"
    >
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
    </button>
    <button
      onclick="if(confirm('¿Cerrás sesión?'))window.__authLogout()"
      style="
        display:flex;align-items:center;gap:8px;
        background:rgba(255,255,255,0.1);
        border:1px solid rgba(255,255,255,0.15);
        border-radius:999px;
        padding:4px 12px 4px 4px;
        cursor:pointer;
        transition:background 120ms ease;
      "
      onmouseover="this.style.background='rgba(255,255,255,0.18)'"
      onmouseout="this.style.background='rgba(255,255,255,0.1)'"
    >
      <div style="
        width:28px;height:28px;border-radius:50%;
        background:var(--brand);
        display:flex;align-items:center;justify-content:center;
        font-size:11px;font-weight:700;color:white;
        flex-shrink:0;
      ">${initials}</div>
      <span style="font-size:12px;color:rgba(254,242,242,0.8);font-weight:500;white-space:nowrap;">
        ${_currentUser.nombre.split(' ')[0]}
      </span>
    </button>
  `;

  // Navegación inteligente desde la campana
  window.__notifNavegar = function () {
    const ids = [...getExpedientesConNotif()];
    if (ids.length === 1) {
      navigate(`#/expediente?id=${ids[0]}`);
    } else {
      navigate('#/expedientes');
    }
  };

  // Escuchar actualizaciones de notificaciones
  document.addEventListener('notif:update', ({ detail }) => {
    const badge = document.getElementById('notif-badge');
    const btn   = document.getElementById('btn-notif');
    if (!btn) return;

    if (detail.count > 0) {
      if (!badge) {
        const b = document.createElement('span');
        b.id        = 'notif-badge';
        b.className = 'notif-badge';
        b.textContent = detail.count > 99 ? '99+' : detail.count;
        btn.appendChild(b);
      } else {
        badge.textContent = detail.count > 99 ? '99+' : detail.count;
      }
    } else {
      badge?.remove();
    }
  });
}

// ── Mostrar / ocultar shell según ruta ─────────────────────────
export function setShellVisible(visible) {
  const header = document.getElementById('app-header');
  const nav    = document.getElementById('app-nav');
  if (header) header.style.display = visible ? '' : 'none';
  if (nav)    nav.style.display    = visible ? '' : 'none';
}

// ── Login ──────────────────────────────────────────────────────
export async function login(email, password) {
  const sb = getSupabase();

  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Correo o contraseña incorrectos.');
    }
    throw new Error(error.message);
  }

  await loadProfile(data.user);
  updateHeaderUser();
  setShellVisible(true);
  iniciarNotificaciones();
  redirectByRol(_currentUser.rol);
}

// ── Logout ─────────────────────────────────────────────────────
export async function logout() {
  const sb = getSupabase();
  detenerNotificaciones();
  await sb.auth.signOut();
  _currentUser = null;
  setShellVisible(false);
  navigate('#/login');
}

// ── Getters ────────────────────────────────────────────────────
export function getCurrentUser() { return _currentUser; }
export function getCurrentRol()  { return _currentUser?.rol ?? null; }
export function isLoggedIn()     { return _currentUser !== null; }

// ── Inicialización (llamar al arrancar la app) ─────────────────
export async function initAuth() {
  if (_initialized) return;
  _initialized = true;

  await initSupabase();
  const sb = getSupabase();

  // Escuchar cambios de sesión
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      _currentUser = null;
      setShellVisible(false);
      navigate('#/login');
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (!_currentUser) {
        try {
          await loadProfile(session.user);
          updateHeaderUser();
          setShellVisible(true);
          iniciarNotificaciones();
          // Solo redirigir si estamos en login
          if (location.hash === '#/login' || location.hash === '') {
            redirectByRol(_currentUser.rol);
          }
        } catch (err) {
          console.error('[auth]', err.message);
          await sb.auth.signOut();
        }
      }
    }
  });

  // Comprobar sesión existente al arrancar
  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    setShellVisible(false);
    navigate('#/login');
    return;
  }

  // Sesión activa — cargar perfil
  try {
    await loadProfile(session.user);
    updateHeaderUser();
    setShellVisible(true);
    iniciarNotificaciones();
  } catch (err) {
    console.error('[auth]', err.message);
    await sb.auth.signOut();
  }
}

// ── Exponer al HTML para los event handlers inline ────────────
window.__authLogin       = login;
window.__authLogout      = logout;
window.__getCurrentUser  = getCurrentUser;
window.__getCurrentRol   = getCurrentRol;
