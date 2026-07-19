/**
 * Módulo de notificaciones en tiempo real.
 *
 * Suscribe a INSERT en la tabla `comentarios` via Supabase Realtime.
 * RLS filtra automáticamente: cada usuario solo recibe eventos de
 * los comentarios que tiene permiso de leer.
 *
 * El estado es en memoria — se resetea al recargar (suficiente para v2).
 */

import { getSupabase } from './supabase.js';

let _channel  = null;
let _count    = 0;
// Expedientes con al menos una notificación pendiente (para limpiar por ID)
const _expConNotif = new Set();

// ── Iniciar suscripción ─────────────────────────────────────────
export function iniciarNotificaciones() {
  const sb = getSupabase();

  _channel = sb
    .channel('notif-comentarios')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'comentarios' },
      payload => {
        _count++;
        if (payload.new?.expediente_id) {
          _expConNotif.add(payload.new.expediente_id);
        }
        _emitir();
      }
    )
    .subscribe();
}

// ── Detener suscripción ─────────────────────────────────────────
export function detenerNotificaciones() {
  if (_channel) {
    getSupabase().removeChannel(_channel);
    _channel = null;
  }
  _count = 0;
  _expConNotif.clear();
  _emitir();
}

// ── Limpiar notificaciones de un expediente específico ──────────
export function limpiarNotifExpediente(expedienteId) {
  if (!_expConNotif.has(expedienteId)) return;
  _expConNotif.delete(expedienteId);
  // El contador se reduce en 1 por cada expediente limpiado
  // (no sabemos cuántos comentarios llegaron, pero 1 limpieza = 1 entrada)
  if (_count > 0) _count = Math.max(0, _count - 1);
  _emitir();
}

// ── Resetear todo ───────────────────────────────────────────────
export function resetearNotificaciones() {
  _count = 0;
  _expConNotif.clear();
  _emitir();
}

// ── Getter ──────────────────────────────────────────────────────
export function getCount() { return _count; }

// ── Evento interno ──────────────────────────────────────────────
function _emitir() {
  document.dispatchEvent(
    new CustomEvent('notif:update', { detail: { count: _count } })
  );
}
