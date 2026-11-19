/**
 * Lógica pura de los filtros de estadísticas (sin DOM ni Supabase → testeable).
 * Tests: tests/unit/estadisticas-filtros.test.mjs
 *
 * Período: { tipo: 'acumulado' } | { tipo: 'anio', anio } | { tipo: 'mes', anio, mes }
 * El rango devuelto usa `hasta` EXCLUSIVO, igual que est_base en SQL (sql/16).
 */

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const iso = (anio, mes) => `${anio}-${String(mes).padStart(2, '0')}-01`;

export function rangoPeriodo(periodo) {
  const { tipo, anio, mes } = periodo ?? {};
  if (tipo === 'acumulado') return { desde: null, hasta: null };
  if (tipo === 'anio' && Number.isInteger(anio)) {
    return { desde: iso(anio, 1), hasta: iso(anio + 1, 1) };
  }
  if (tipo === 'mes' && Number.isInteger(anio) && Number.isInteger(mes) && mes >= 1 && mes <= 12) {
    const sig = mes === 12 ? { a: anio + 1, m: 1 } : { a: anio, m: mes + 1 };
    return { desde: iso(anio, mes), hasta: iso(sig.a, sig.m) };
  }
  throw new Error(`Período inválido: ${JSON.stringify(periodo)}`);
}

export function paramsRpc({ jefeId, tecnicoId, periodo }) {
  const { desde, hasta } = rangoPeriodo(periodo);
  return {
    p_jefe:    jefeId    || null,
    p_tecnico: tecnicoId || null,
    p_desde:   desde,
    p_hasta:   hasta,
  };
}

function etiquetaPeriodo({ tipo, anio, mes }) {
  if (tipo === 'acumulado') return 'Acumulado';
  if (tipo === 'anio') return `Año ${anio}`;
  return `${MESES[mes - 1]} ${anio}`;
}

export function etiquetaFiltro({ jefeNombre, tecnicoNombre, periodo }) {
  let alcance = 'Todos los jefes';
  if (tecnicoNombre) alcance = `Técnico: ${tecnicoNombre}${jefeNombre ? ` (${jefeNombre})` : ''}`;
  else if (jefeNombre) alcance = `Jefe: ${jefeNombre}`;
  return `${alcance} · ${etiquetaPeriodo(periodo)}`;
}

export function tasaRescate({ rescatada = 0, cerrada = 0 } = {}) {
  const finalizados = Number(rescatada) + Number(cerrada);
  return finalizados > 0 ? Math.round((Number(rescatada) / finalizados) * 100) : null;
}

export function formatMes(yyyymm) {
  const [y, m] = yyyymm.split('-');
  return `${MESES_CORTOS[parseInt(m, 10) - 1]} '${y.slice(2)}`;
}
