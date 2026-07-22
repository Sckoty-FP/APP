/**
 * Módulo de dominio — expedientes.
 * Toda consulta a BD sobre expedientes, técnicos y jefes de equipo pasa por aquí.
 */

import { getSupabase } from './supabase.js';
import { LABELS_ESTADO } from './config.js';

// ── Expedientes ────────────────────────────────────────────────

export async function listarExpedientes({ estado, busqueda, limit, jefeId, fechaDesde, fechaHasta } = {}) {
  const sb = getSupabase();
  let q = sb
    .from('expedientes')
    .select(`
      id, instalacion, mantenimiento, estado, fecha_creacion, motivo, motivo_id,
      jefe:jefe_id ( nombre ),
      tecnico:tecnico_id ( nombre ),
      motivo_fallo:motivo_id ( nombre )
    `)
    .order('fecha_creacion', { ascending: false });

  if (estado)     q = q.eq('estado', estado);
  if (jefeId)     q = q.eq('jefe_id', jefeId);
  if (fechaDesde) q = q.gte('fecha_creacion', fechaDesde + 'T00:00:00');
  if (fechaHasta) q = q.lte('fecha_creacion', fechaHasta + 'T23:59:59');
  if (busqueda) {
    const t = busqueda.trim();
    q = q.or(`instalacion.ilike.%${t}%,mantenimiento.ilike.%${t}%`);
  }
  if (limit)      q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function obtenerExpediente(id) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('expedientes')
    .select(`
      id, instalacion, mantenimiento, motivo, motivo_id, observaciones, estado,
      fecha_creacion, fecha_rescate,
      jefe:jefe_id ( id, nombre ),
      tecnico:tecnico_id ( id, nombre ),
      creador:creado_por ( nombre ),
      motivo_fallo:motivo_id ( nombre )
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
// Alias re-exportado desde config.js para no romper los imports existentes
export const ESTADO_LABEL = LABELS_ESTADO;
