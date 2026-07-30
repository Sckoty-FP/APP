/**
 * Configuración centralizada de labels — SGR-PPA v3
 * Un solo lugar para cambiar cómo se muestran roles y estados en la UI.
 * Los valores del enum en BD (en_gestion, cerrada, etc.) NO cambian.
 */

export const LABELS_ESTADO = {
  en_gestion:          'Acción Pendiente',
  pendiente_revision:  'Pte Aprobación',
  rescatada:           'Rescatada',
  cerrada:             'No Recuperable',
};

export const LABELS_ROL = {
  admin_ppa:   'AdminPPA',
  delegado:    'Delegado',
  jefe_equipo: 'Jefe de Equipo',
};

// Antigüedad de un expediente abierto
const ESTADOS_ABIERTOS = new Set(['en_gestion', 'pendiente_revision']);

export function calcularAntiguedad(fechaIso, estado) {
  if (!ESTADOS_ABIERTOS.has(estado)) return null;
  const dias = Math.floor((Date.now() - new Date(fechaIso)) / 86_400_000);
  if (dias < 15) return { dias, color: 'var(--rescatada-accent)',  bg: 'var(--rescatada-bg)' };
  if (dias < 30) return { dias, color: 'var(--warning)',            bg: '#FFF7ED' };
  return               { dias, color: 'var(--danger)',             bg: 'var(--danger-bg)' };
}

// Correcciones visuales de nombres — solo display, sin tocar BD
const NOMBRES_CORREGIDOS = {
  'Ruben Beltran': 'Rubén Beltrán',
};
export function corregirNombre(nombre) {
  return NOMBRES_CORREGIDOS[nombre] ?? nombre;
}

// Orden de agrupación para exportación PDF (Módulo G)
export const ORDEN_ESTADO_PDF = [
  'en_gestion',
  'pendiente_revision',
  'rescatada',
  'cerrada',
];
