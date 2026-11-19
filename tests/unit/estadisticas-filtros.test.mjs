import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rangoPeriodo, paramsRpc, etiquetaFiltro, tasaRescate, formatMes,
} from '../../Main/js/estadisticas-filtros.js';

// ── rangoPeriodo: hasta es EXCLUSIVO (igual que est_base) ──────────
test('acumulado no tiene límites', () => {
  assert.deepEqual(rangoPeriodo({ tipo: 'acumulado' }), { desde: null, hasta: null });
});

test('año completo: 1 ene → 1 ene del siguiente', () => {
  assert.deepEqual(rangoPeriodo({ tipo: 'anio', anio: 2026 }),
    { desde: '2026-01-01', hasta: '2027-01-01' });
});

test('mes normal', () => {
  assert.deepEqual(rangoPeriodo({ tipo: 'mes', anio: 2026, mes: 10 }),
    { desde: '2026-10-01', hasta: '2026-11-01' });
});

test('diciembre cruza de año', () => {
  assert.deepEqual(rangoPeriodo({ tipo: 'mes', anio: 2026, mes: 12 }),
    { desde: '2026-12-01', hasta: '2027-01-01' });
});

test('período inválido lanza error', () => {
  assert.throws(() => rangoPeriodo({ tipo: 'mes', anio: 2026, mes: 13 }));
  assert.throws(() => rangoPeriodo({ tipo: 'semana' }));
});

// ── paramsRpc ─────────────────────────────────────────────────────
test('todos + acumulado → todo null', () => {
  assert.deepEqual(
    paramsRpc({ jefeId: '', tecnicoId: '', periodo: { tipo: 'acumulado' } }),
    { p_jefe: null, p_tecnico: null, p_desde: null, p_hasta: null });
});

test('jefe + mes', () => {
  assert.deepEqual(
    paramsRpc({ jefeId: 'j1', tecnicoId: null, periodo: { tipo: 'mes', anio: 2026, mes: 3 } }),
    { p_jefe: 'j1', p_tecnico: null, p_desde: '2026-03-01', p_hasta: '2026-04-01' });
});

// ── etiquetaFiltro (título del PDF y de la pantalla) ─────────────
test('etiqueta todos acumulado', () => {
  assert.equal(etiquetaFiltro({ periodo: { tipo: 'acumulado' } }), 'Todos los jefes · Acumulado');
});

test('etiqueta jefe + mes', () => {
  assert.equal(
    etiquetaFiltro({ jefeNombre: 'Ana López', periodo: { tipo: 'mes', anio: 2026, mes: 10 } }),
    'Jefe: Ana López · Octubre 2026');
});

test('etiqueta técnico gana sobre jefe + año', () => {
  assert.equal(
    etiquetaFiltro({ jefeNombre: 'Ana', tecnicoNombre: 'Pepe', periodo: { tipo: 'anio', anio: 2025 } }),
    'Técnico: Pepe (Ana) · Año 2025');
});

// ── tasaRescate ──────────────────────────────────────────────────
test('tasa = rescatadas / finalizados, redondeada', () => {
  assert.equal(tasaRescate({ rescatada: 1, cerrada: 2 }), 33);
  assert.equal(tasaRescate({ rescatada: 46, cerrada: 150 }), 23);
});

test('sin finalizados la tasa es null', () => {
  assert.equal(tasaRescate({ rescatada: 0, cerrada: 0 }), null);
  assert.equal(tasaRescate({}), null);
});

// ── formatMes ────────────────────────────────────────────────────
test('formatMes', () => {
  assert.equal(formatMes('2026-07'), "Jul '26");
  assert.equal(formatMes('2025-12'), "Dic '25");
});
