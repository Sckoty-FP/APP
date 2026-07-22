/**
 * Módulo de dominio — técnicos.
 * Solo admin_ppa y delegado acceden a estas funciones (RLS lo garantiza).
 */

import { getSupabase } from './supabase.js';

// ── Listar técnicos ────────────────────────────────────────────

export async function listarTecnicos({ jefeId } = {}) {
  const sb = getSupabase();
  let q = sb
    .from('tecnicos')
    .select('id, nombre, matricula, activo, jefe_id, usuarios!jefe_id(nombre)')
    .order('activo', { ascending: false })
    .order('nombre');

  if (jefeId) q = q.eq('jefe_id', jefeId);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(t => ({
    id:          t.id,
    nombre:      t.nombre,
    matricula:   t.matricula,
    activo:      t.activo,
    jefe_id:     t.jefe_id,
    jefe_nombre: t.usuarios?.nombre ?? '—',
  }));
}

// ── Listar jefes de equipo (para el selector) ─────────────────

export async function listarJefesEquipo() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('usuarios')
    .select('id, nombre, rol')
    .in('rol', ['jefe_equipo', 'admin_ppa'])
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

// ── Crear técnico ──────────────────────────────────────────────

export async function crearTecnico({ nombre, matricula, jefe_id }) {
  const sb = getSupabase();
  const payload = { nombre, jefe_id, activo: true };
  if (matricula) payload.matricula = matricula.trim().toUpperCase();

  const { error } = await sb.from('tecnicos').insert(payload);
  if (error) throw new Error(error.message);
}

// ── Activar / desactivar ───────────────────────────────────────

export async function toggleActivoTecnico(id, activo) {
  const sb = getSupabase();
  const { error } = await sb.from('tecnicos').update({ activo }).eq('id', id);
  if (error) throw error;
}

// ── Cambiar jefe asignado ──────────────────────────────────────

export async function cambiarJefeTecnico(id, jefeId) {
  const sb = getSupabase();
  const { error } = await sb.from('tecnicos').update({ jefe_id: jefeId }).eq('id', id);
  if (error) throw error;
}
