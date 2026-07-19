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
