/**
 * Módulo de dominio — expedientes.
 * Toda consulta a BD sobre expedientes, técnicos y jefes de equipo pasa por aquí.
 */

import { getSupabase } from './supabase.js';

// ── Expedientes ────────────────────────────────────────────────

export async function listarExpedientes({ estado, busqueda } = {}) {
  const sb = getSupabase();
  let q = sb
    .from('expedientes')
    .select(`
      id, instalacion, mantenimiento, estado, fecha_creacion, motivo,
      jefe:jefe_id ( nombre ),
      tecnico:tecnico_id ( nombre )
    `)
    .order('fecha_creacion', { ascending: false });

  if (estado) q = q.eq('estado', estado);
  if (busqueda) {
    const t = busqueda.trim();
    q = q.or(`instalacion.ilike.%${t}%,mantenimiento.ilike.%${t}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function obtenerExpediente(id) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('expedientes')
    .select(`
      id, instalacion, mantenimiento, motivo, observaciones, estado,
      fecha_creacion, fecha_rescate,
      jefe:jefe_id ( id, nombre ),
      tecnico:tecnico_id ( id, nombre ),
      creador:creado_por ( nombre )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function crearExpediente(campos) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('expedientes')
    .insert(campos)
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function cambiarEstado(id, nuevoEstado) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('expedientes')
    .update({ estado: nuevoEstado })
    .eq('id', id)
    .select('id, estado')
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarExpediente(id, campos) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('expedientes')
    .update(campos)
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

// ── Catálogos ──────────────────────────────────────────────────

export async function listarJefesEquipo() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('usuarios')
    .select('id, nombre')
    .eq('rol', 'jefe_equipo')
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

export async function listarTecnicosPorJefe(jefeId) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('tecnicos')
    .select('id, nombre')
    .eq('jefe_id', jefeId)
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

// ── Etiquetas de estado ────────────────────────────────────────

export const ESTADO_LABEL = {
  pendiente:           'Pendiente',
  en_gestion:          'En gestión',
  pendiente_revision:  'Pend. revisión',
  rescatada:           'Rescatada',
  cerrada:             'Cerrada',
};
