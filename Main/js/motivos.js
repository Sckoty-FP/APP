/**
 * Módulo de dominio — motivos de fallo.
 * Catálogo de solo lectura para todos los roles.
 * Los resultados se cachean en memoria para la sesión.
 */

import { getSupabase } from './supabase.js';

let _cache = null;

export async function listarMotivos() {
  if (_cache) return _cache;
  const sb = getSupabase();
  const { data, error } = await sb
    .from('motivos_fallo')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  _cache = data ?? [];
  return _cache;
}
