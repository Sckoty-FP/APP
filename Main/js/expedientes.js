/**
 * Módulo de dominio — expedientes.
 * Toda consulta a BD sobre expedientes, técnicos y jefes de equipo pasa por aquí.
 */

import { getSupabase } from './supabase.js';
import { LABELS_ESTADO, corregirNombre } from './config.js';

// ── Expedientes ────────────────────────────────────────────────

export async function listarExpedientes({ estado, estadoIn, busqueda, limit, jefeId, fechaDesde, fechaHasta, creadoAntesDe } = {}) {
  const sb = getSupabase();
  let q = sb
    .from('expedientes')
    .select(`
      id, instalacion, mantenimiento, estado, fecha_creacion, fecha_mantenimiento, motivo, motivo_id,
      jefe:jefe_id ( nombre ),
      tecnico:tecnico_id ( nombre ),
      motivo_fallo:motivo_id ( nombre )
    `)
    .order('fecha_creacion', { ascending: false });

  if (estadoIn?.length) q = q.in('estado', estadoIn);
  else if (estado)      q = q.eq('estado', estado);
  if (jefeId)           q = q.eq('jefe_id', jefeId);
  if (fechaDesde)       q = q.gte('fecha_mantenimiento', fechaDesde);
  if (fechaHasta)       q = q.lte('fecha_mantenimiento', fechaHasta);
  if (creadoAntesDe)    q = q.lte('fecha_creacion', creadoAntesDe);
  if (busqueda) {
    const t = busqueda.trim();
    q = q.or(`instalacion.ilike.%${t}%,mantenimiento.ilike.%${t}%`);
  }
  if (limit)      q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(e => ({
    ...e,
    jefe:    e.jefe    ? { ...e.jefe,    nombre: corregirNombre(e.jefe.nombre) }    : e.jefe,
    tecnico: e.tecnico ? { ...e.tecnico, nombre: corregirNombre(e.tecnico.nombre) } : e.tecnico,
  }));
}

export async function obtenerExpediente(id) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('expedientes')
    .select(`
      id, instalacion, mantenimiento, motivo, motivo_id, observaciones, estado,
      fecha_creacion, fecha_mantenimiento, fecha_rescate,
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
    .in('rol', ['jefe_equipo', 'admin_ppa'])
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  return (data ?? []).map(j => ({ ...j, nombre: corregirNombre(j.nombre) }));
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
