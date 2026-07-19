/**
 * Cliente Supabase centralizado.
 * NUNCA instanciar en otro módulo — importar siempre desde aquí.
 *
 * Configurar antes de usar (Fase 2):
 *   1. Crear proyecto en https://supabase.com
 *   2. Reemplazar los valores de SUPABASE_URL y SUPABASE_ANON_KEY
 */

const SUPABASE_URL     = 'https://xvzuvfanxrbxulsvmixl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2enV2ZmFueHJieHVsc3ZtaXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MTY4MTgsImV4cCI6MjA5OTk5MjgxOH0.Jd9nwdVGUlftAWBTyXqWxGjyqCCKMZS3dxXRUuGK6bU';

let supabase = null;

export async function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[supabase] Credenciales no configuradas.');
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

export function getSupabaseCredentials() {
  return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
}
