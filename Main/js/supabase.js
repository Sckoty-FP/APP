/**
 * Cliente Supabase centralizado.
 * NUNCA instanciar en otro módulo — importar siempre desde aquí.
 *
 * Configurar antes de usar (Fase 2):
 *   1. Crear proyecto en https://supabase.com
 *   2. Reemplazar los valores de SUPABASE_URL y SUPABASE_ANON_KEY
 */

const SUPABASE_URL     = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

let supabase = null;

export async function initSupabase() {
  if (SUPABASE_URL === 'TU_SUPABASE_URL') {
    console.warn('[supabase] Credenciales no configuradas. Edita js/supabase.js.');
    return false;
  }

  const { createClient } = await import(
    'https://esm.sh/@supabase/supabase-js@2'
  );

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

export function getSupabase() {
  if (!supabase) throw new Error('[supabase] Cliente no inicializado. Llama a initSupabase() primero.');
  return supabase;
}
