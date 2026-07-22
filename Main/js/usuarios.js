/**
 * Módulo de dominio — usuarios.
 * Solo admin_ppa accede a estas funciones (RLS lo garantiza en BD).
 */

import { getSupabase, getSupabaseCredentials } from './supabase.js';

// ── Listar ─────────────────────────────────────────────────────

export async function listarUsuarios() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('usuarios')
    .select('id, nombre, email, rol, activo, matricula')
    .order('rol')
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

// ── Crear ──────────────────────────────────────────────────────

/**
 * Crea un usuario en Supabase Auth (via fetch directo, sin cliente JS extra)
 * y luego inserta su perfil en la tabla usuarios con la sesión activa del admin.
 * Usar fetch evita toda interferencia con la sesión activa del admin.
 */
export async function crearUsuario({ nombre, email, password, rol, matricula }) {
  const sb = getSupabase();
  const { url, key } = getSupabaseCredentials();

  // Signup via REST directo — no toca la sesión del cliente principal
  const res = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': key },
    body: JSON.stringify({ email, password }),
    credentials: 'omit',  // evita que cookies de la respuesta afecten la sesión activa
  });
  const authData = await res.json();
  if (!res.ok) {
    throw new Error(authData.msg || authData.error_description || `Error Auth: ${res.status}`);
  }

  const userId = authData.user?.id;
  if (!userId) throw new Error('No se recibió el ID del usuario creado.');

  // Insertar perfil en la tabla usuarios con la sesión activa del admin
  const payload = { id: userId, nombre, email, rol, activo: true };
  if (matricula) payload.matricula = matricula.trim().toUpperCase();
  const { error: insertError } = await sb.from('usuarios').insert(payload);
  if (insertError) throw new Error(insertError.message);

  return userId;
}

// ── Activar / desactivar ────────────────────────────────────────

export async function toggleActivo(id, activo) {
  const sb = getSupabase();
  const { error } = await sb
    .from('usuarios')
    .update({ activo })
    .eq('id', id);
  if (error) throw error;
}

// ── Cambiar rol ─────────────────────────────────────────────────

export async function cambiarRol(id, nuevoRol) {
  const sb = getSupabase();
  const { error } = await sb
    .from('usuarios')
    .update({ rol: nuevoRol })
    .eq('id', id);
  if (error) throw error;
}

// ── Actualizar matrícula ────────────────────────────────────────

export async function actualizarMatricula(id, matricula) {
  const sb = getSupabase();
  const val = matricula ? matricula.trim().toUpperCase() : null;
  const { error } = await sb.from('usuarios').update({ matricula: val }).eq('id', id);
  if (error) throw error;
}

// ── Etiquetas ──────────────────────────────────────────────────

export const ROL_LABEL = {
  admin_ppa:   'AdminPPA',
  delegado:    'Delegado',
  jefe_equipo: 'Jefe de equipo',
};
