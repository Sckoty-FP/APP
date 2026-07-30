/**
 * Módulo de dominio — estadísticas.
 * Los KPIs se calculan en SQL (funciones RPC en Supabase).
 * Requiere ejecutar Main/sql/05_kpis.sql antes de usar.
 */

import { getSupabase } from './supabase.js';

export async function obtenerKpiResumen() {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('kpi_resumen');
  if (error) throw error;
  return data[0];
}

export async function obtenerKpiTendencia(meses = 6) {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('kpi_tendencia', { meses });
  if (error) throw error;
  return data ?? [];
}

export async function obtenerInformeMensual(anio, mes) {
  const sb = getSupabase();
  const [kpiRes, jefesRes, motivosRes, tecnicosRes] = await Promise.all([
    sb.rpc('kpi_mes',          { p_anio: anio, p_mes: mes }),
    sb.rpc('kpi_jefes_mes',    { p_anio: anio, p_mes: mes }),
    sb.rpc('kpi_motivos_mes',  { p_anio: anio, p_mes: mes }),
    sb.rpc('kpi_tecnicos_mes', { p_anio: anio, p_mes: mes }),
  ]);
  if (kpiRes.error)      throw kpiRes.error;
  if (jefesRes.error)    throw jefesRes.error;
  if (motivosRes.error)  throw motivosRes.error;
  if (tecnicosRes.error) throw tecnicosRes.error;

  return {
    kpi:      kpiRes.data[0]    ?? {},
    jefes:    jefesRes.data     ?? [],
    motivos:  motivosRes.data   ?? [],
    tecnicos: tecnicosRes.data  ?? [],
  };
}
