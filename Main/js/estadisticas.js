/**
 * Módulo de dominio — estadísticas.
 * Los KPIs se calculan en SQL (funciones RPC en Supabase):
 *   - kpi_resumen           → sql/05_kpis.sql (pantalla Inicio)
 *   - est_*                 → sql/16_estadisticas_filtros.sql (pantalla Estadísticas)
 * El alcance por rol (jefe_equipo solo ve lo suyo) lo aplica la BD en est_base.
 */

import { getSupabase } from './supabase.js';

export async function obtenerKpiResumen() {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('kpi_resumen');
  if (error) throw error;
  return data[0];
}

async function rpc(nombre, params) {
  const { data, error } = await getSupabase().rpc(nombre, params);
  if (error) throw error;
  return data ?? [];
}

/**
 * Todas las secciones de la pantalla con el mismo filtro.
 * @param {{p_jefe, p_tecnico, p_desde, p_hasta}} params — ver paramsRpc()
 */
export async function obtenerEstadisticas(params) {
  const [resumen, porMes, porJefe, tecnicos, motivos] = await Promise.all([
    rpc('est_resumen',          params),
    rpc('est_por_mes',          params),
    rpc('est_por_jefe',         params),
    rpc('est_ranking_tecnicos', params),
    rpc('est_ranking_motivos',  params),
  ]);
  return { resumen: resumen[0] ?? {}, porMes, porJefe, tecnicos, motivos };
}

/** Jefes con expedientes (acumulado, respetando el rol) para el selector. */
export async function listarJefesFiltro() {
  const filas = await rpc('est_por_jefe', {});
  return filas
    .map(f => ({ id: f.jefe_id, nombre: f.jefe_nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Técnicos con expedientes (acumulado), opcionalmente de un jefe. */
export async function listarTecnicosFiltro(jefeId = null) {
  const filas = await rpc('est_ranking_tecnicos', { p_jefe: jefeId || null });
  return filas
    .map(f => ({ id: f.tecnico_id, nombre: f.tecnico_nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
