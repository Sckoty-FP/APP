/**
 * Configuración centralizada de labels — SGR-PPA v3
 * Un solo lugar para cambiar cómo se muestran roles y estados en la UI.
 * Los valores del enum en BD (en_gestion, cerrada, etc.) NO cambian.
 */

export const LABELS_ESTADO = {
  pendiente:           'Pendiente',
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

// Orden de agrupación para exportación PDF (Módulo G)
export const ORDEN_ESTADO_PDF = [
  'pendiente',
  'en_gestion',
  'pendiente_revision',
  'rescatada',
  'cerrada',
];
