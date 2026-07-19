/**
 * Módulo de autenticación — Fase 4
 * - Login / logout con Supabase Auth
 * - Sesión persistente
 * - Carga del perfil desde tabla `usuarios`
 * - Caché en memoria del usuario y rol activos
 */

import { initSupabase, getSupabase } from './supabase.js';
import { navigate } from './router.js';

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
      onclick="window.__authLogout()"
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
  redirectByRol(_currentUser.rol);
}

// ── Logout ─────────────────────────────────────────────────────
export async function logout() {
  const sb = getSupabase();
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
  } catch (err) {
    console.error('[auth]', err.message);
    await sb.auth.signOut();
  }
}

// ── Exponer al HTML para los event handlers inline ────────────
window.__authLogin  = login;
window.__authLogout = logout;
