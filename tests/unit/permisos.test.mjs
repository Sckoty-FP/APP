import { test } from 'node:test';
import assert from 'node:assert/strict';
import { puedeCrearExpediente } from '../../Main/js/config.js';

test('admin_ppa, delegado y jefe_equipo pueden crear expedientes', () => {
  assert.equal(puedeCrearExpediente('admin_ppa'), true);
  assert.equal(puedeCrearExpediente('delegado'), true);
  assert.equal(puedeCrearExpediente('jefe_equipo'), true);
});

test('rol desconocido o vacío no puede crear', () => {
  assert.equal(puedeCrearExpediente('tecnico'), false);
  assert.equal(puedeCrearExpediente(undefined), false);
  assert.equal(puedeCrearExpediente(null), false);
});
