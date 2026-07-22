/**
 * Módulo de dominio — usuarios.
 * Solo el supervisor accede a estas funciones (RLS lo garantiza en BD).
 */

import { getSupabase, getSupabaseCredentials } from './supabase.js';

// ── Listar ─────────────────────────────────────────────────────

export async function listarUsuarios() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('usuarios')
    .select('id, nombre, email, rol, activo')
    .order('rol')
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

// ── Crear ──────────────────────────────────────────────────────

/**
 * Crea un usuario en Supabase Auth y luego inserta su perfil.
 * Usa una instancia temporal del cliente para que el signUp
 * no invalide la sesión activa del supervisor.
 */
export async function crearUsuario({ nombre, email, password, rol }) {
  // Importar createClient dinámicamente para no ensuciar el bundle principal
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');

  const sb  = getSupabase();
  const { url, key } = getSupabaseCredentials();

  // Instancia temporal — no comparte sesión con la app principal
  const tmp = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await tmp.auth.signUp({ email, password });
  if (authError) throw new Error(authError.message);

  const userId = authData.user?.id;
  if (!userId) throw new Error('No se recibió el ID del usuario creado.');

  // Insertar perfil en la tabla usuarios (usando la sesión del supervisor)
  const { error: insertError } = await sb
    .from('usuarios')
    .insert({ id: userId, nombre, email, rol, activo: true });

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

// ── Etiquetas ──────────────────────────────────────────────────

export const ROL_LABEL = {
  admin_ppa:   'AdminPPA',
  delegado:    'Delegado',
  jefe_equipo: 'Jefe de equipo',
};
