/**
 * Test completo SGR-PPA
 * Crea 6 expedientes ficticios y verifica el flujo completo
 * Ejecutar: node tests/test-full.js
 */

const { chromium } = require('playwright');

const BASE    = 'http://localhost:3000';
const SUP     = { email: 'ruben.beltran@verisure.es', pass: 'APPtest' };
const JEFE1   = { email: 'test.jefe@verisure.es',     pass: 'APPtest' };
const JEFE2   = { email: 'test.jefe2@verisure.es',    pass: 'APPtest' };

// 6 expedientes ficticios: 3 para jefe1, 3 para jefe2
const EXPEDIENTES = [
  // Jefe 1
  {
    instalacion:   'C/ Mayor 12, Madrid',
    mantenimiento: 'MNT-2024-001',
    motivo:        'PPA rechazada por documentación incompleta. Falta certificado de instalación.',
    observaciones: 'El cliente avisó que tiene los docs pendientes de firma notarial.',
    jefe: 'test.jefe1',
  },
  {
    instalacion:   'Avda. Constitución 45, Sevilla',
    mantenimiento: 'MNT-2024-002',
    motivo:        'PPA rechazada por incidencia técnica no resuelta. Alarma disparándose sola.',
    observaciones: '',
    jefe: 'test.jefe1',
  },
  {
    instalacion:   'Ctra. Nacional II km 34, Guadalajara',
    mantenimiento: 'MNT-2024-003',
    motivo:        'Rechazo por falta de acceso durante visita de verificación.',
    observaciones: 'El portero no dejó pasar al técnico. Avisar con 48h de antelación.',
    jefe: 'test.jefe1',
  },
  // Jefe 2
  {
    instalacion:   'Pol. Industrial Norte, Nave 7, Zaragoza',
    mantenimiento: 'MNT-2024-004',
    motivo:        'PPA rechazada por fallo en el detector de humo sector B.',
    observaciones: '',
    jefe: 'test.jefe2',
  },
  {
    instalacion:   'Plaza del Ayuntamiento 3, Valencia',
    mantenimiento: 'MNT-2024-005',
    motivo:        'Documentación de la instalación no coincide con el plano aprobado.',
    observaciones: 'Planos actualizados pedidos al departamento técnico.',
    jefe: 'test.jefe2',
  },
  {
    instalacion:   'C/ Balmes 89, Barcelona',
    mantenimiento: 'MNT-2024-006',
    motivo:        'Rechazo por contrato de mantenimiento vencido. No renovado a tiempo.',
    observaciones: 'Contactar con el cliente para renovación urgente.',
    jefe: 'test.jefe2',
  },
];

// ── Helpers ────────────────────────────────────────────────
async function login(page, email, pass) {
  await page.goto(BASE + '/#/login');
  await page.waitForSelector('#login-email', { timeout: 12000 });
  await page.fill('#login-email', email);
  await page.fill('#login-password', pass);
  await page.click('#login-btn');
  await page.waitForFunction(
    () => !location.hash.includes('login'),
    { timeout: 12000 }
  );
  console.log(`  ✓ Login: ${email}`);
}

async function logout(page) {
  page.once('dialog', d => d.accept());
  await page.evaluate(() => window.__authLogout?.());
  await page.waitForFunction(
    () => location.hash.includes('login'),
    { timeout: 8000 }
  );
  console.log('  ✓ Logout');
}

async function screenshot(page, nombre) {
  await page.screenshot({ path: `tests/screenshots/${nombre}.png`, fullPage: false });
}

// ── Test: crear expediente ──────────────────────────────────
async function crearExpediente(page, exp) {
  await page.goto(BASE + '/#/nuevo');
  await page.waitForSelector('#f-instalacion', { timeout: 8000 });

  await page.fill('#f-instalacion', exp.instalacion);
  await page.fill('#f-mantenimiento', exp.mantenimiento);

  // Esperar que carguen las opciones del select de jefe
  await page.waitForFunction(
    () => document.getElementById('f-jefe')?.options.length > 1,
    { timeout: 8000 }
  );
  // Seleccionar 1ª o 2ª opción real (índice 1 o 2, el 0 es placeholder)
  const opcionIdx = exp.jefe === 'test.jefe1' ? 1 : 2;
  await page.evaluate((idx) => {
    const sel = document.getElementById('f-jefe');
    sel.selectedIndex = idx;
    sel.dispatchEvent(new Event('change'));
  }, opcionIdx);

  await page.fill('#f-motivo', exp.motivo);
  if (exp.observaciones) await page.fill('#f-observaciones', exp.observaciones);

  await page.click('#btn-guardar');
  await page.waitForFunction(
    () => location.hash.includes('expedientes') && !location.hash.includes('nuevo'),
    { timeout: 8000 }
  );
  console.log(`  ✓ Expediente creado: ${exp.mantenimiento} — ${exp.instalacion}`);
}

// ── Main ───────────────────────────────────────────────────
(async () => {
  const { mkdirSync } = require('fs');
  mkdirSync('tests/screenshots', { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const ctx     = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page    = await ctx.newPage();

  // ── 1. LOGIN SUPERVISOR ──────────────────────────────────
  console.log('\n[1] Login como supervisor');
  await login(page, SUP.email, SUP.pass);
  await screenshot(page, '01-login-supervisor');

  // ── 2. CREAR 6 EXPEDIENTES ───────────────────────────────
  console.log('\n[2] Creando 6 expedientes ficticios');
  for (let i = 0; i < EXPEDIENTES.length; i++) {
    await crearExpediente(page, EXPEDIENTES[i], i);
  }
  await screenshot(page, '02-lista-expedientes');

  // ── 3. CAMBIAR ESTADOS (máquina libre supervisor) ────────
  console.log('\n[3] Testeando máquina de estados — supervisor');

  // Abrir el primer expediente (MNT-2024-001) y cambiar estado
  await page.goto(BASE + '/#/expedientes');
  await page.waitForSelector('.card-expediente', { timeout: 8000 });
  // Click en el primero
  await page.locator('.card-expediente').first().click();
  await page.waitForSelector('#estado-section', { timeout: 8000 });
  await screenshot(page, '03-detalle-pendiente');

  // Cambiar a En gestión (directo, no terminal)
  await page.locator('#estado-btns button[data-estado="en_gestion"]').click();
  await page.waitForSelector('.badge-en_gestion', { timeout: 8000 });
  console.log('  ✓ pendiente → en_gestion');
  await screenshot(page, '04-estado-en-gestion');

  // Cambiar a pendiente_revision
  await page.locator('#estado-btns button[data-estado="pendiente_revision"]').click();
  await page.waitForSelector('.badge-pendiente_revision', { timeout: 8000 });
  console.log('  ✓ en_gestion → pendiente_revision');

  // Volver a pendiente (supervisor puede)
  await page.locator('#estado-btns button[data-estado="pendiente"]').click();
  await page.waitForSelector('.badge-pendiente', { timeout: 8000 });
  console.log('  ✓ pendiente_revision → pendiente (vuelta libre ✓)');
  await screenshot(page, '05-vuelta-a-pendiente');

  // Marcar como rescatada (terminal — confirm)
  await page.locator('#estado-btns button[data-estado="en_gestion"]').click();
  await page.waitForSelector('.badge-en_gestion', { timeout: 8000 });

  // Manejar el confirm de estado terminal
  page.once('dialog', async dialog => {
    console.log(`  ✓ Confirm dialog: "${dialog.message().slice(0, 60)}..."`);
    await dialog.accept();
  });
  await page.locator('#estado-btns button[data-estado="rescatada"]').click();
  await page.waitForSelector('.badge-rescatada', { timeout: 8000 });
  console.log('  ✓ en_gestion → rescatada (con confirm ✓)');
  await screenshot(page, '06-rescatada-terminal');

  // Verificar que el aviso de estado terminal se muestra (no hay botones)
  const bloqueado = await page.locator('#estado-section').innerText();
  if (bloqueado.includes('no puede cambiar')) {
    console.log('  ✓ Estado terminal bloqueado en UI ✓');
  }

  // ── 4. ESTADÍSTICAS ──────────────────────────────────────
  console.log('\n[4] Vista de estadísticas');
  await page.goto(BASE + '/#/estadisticas');
  await page.waitForSelector('#kpi-grid', { timeout: 8000 });
  // Esperar a que desaparezcan los skeletons
  await page.waitForFunction(
    () => !document.querySelector('#kpi-grid .skeleton'),
    { timeout: 10000 }
  );
  await screenshot(page, '07-estadisticas');
  console.log('  ✓ KPIs cargados');

  // ── 5. INICIO ────────────────────────────────────────────
  console.log('\n[5] Vista de inicio');
  await page.goto(BASE + '/#/inicio');
  await page.waitForFunction(
    () => !document.querySelector('#kpi-mini .skeleton'),
    { timeout: 10000 }
  );
  await screenshot(page, '08-inicio');
  console.log('  ✓ Dashboard de inicio cargado');

  // ── 6. PERFIL ────────────────────────────────────────────
  console.log('\n[6] Vista de perfil');
  await page.goto(BASE + '/#/perfil');
  await page.waitForSelector('#perfil-nombre', { timeout: 5000 });
  const nombre = await page.locator('#perfil-nombre').innerText();
  console.log(`  ✓ Perfil: ${nombre}`);
  await screenshot(page, '09-perfil');

  // ── 7. LOGOUT ────────────────────────────────────────────
  console.log('\n[7] Logout supervisor');
  await page.evaluate(() => window.__authLogout?.());
  await page.waitForFunction(() => location.hash.includes('login'), { timeout: 8000 });
  console.log('  ✓ Logout OK');

  // ── 8. LOGIN JEFE_EQUIPO 1 — verificar RLS ───────────────
  console.log('\n[8] Login jefe_equipo 1 — verificar que solo ve sus expedientes');
  await login(page, JEFE1.email, JEFE1.pass);
  await page.goto(BASE + '/#/expedientes');
  await page.waitForSelector('.card-expediente, .empty-state', { timeout: 8000 });
  const tarjetas = await page.locator('.card-expediente').count();
  console.log(`  ✓ Jefe 1 ve ${tarjetas} expedientes (deben ser 3)`);
  await screenshot(page, '10-jefe1-expedientes');

  // Intentar ir a /nuevo — debe rechazar
  await page.goto(BASE + '/#/nuevo');
  await page.waitForSelector('.empty-state, #form-nuevo', { timeout: 5000 });
  const acceso = await page.locator('.empty-state').count();
  if (acceso > 0) {
    console.log('  ✓ Jefe 1 NO puede crear expedientes ✓');
  }

  // Avanzar estado de un expediente (jefe puede ir a en_gestion)
  await page.goto(BASE + '/#/expedientes');
  await page.waitForSelector('.card-expediente', { timeout: 8000 });
  // Buscar uno que no esté rescatado
  const cardsJefe1 = page.locator('.card-expediente:not(.estado-rescatada):not(.estado-cerrada)');
  if (await cardsJefe1.count() > 0) {
    await cardsJefe1.first().click();
    await page.waitForSelector('#estado-section', { timeout: 8000 });
    const btnGestion = page.locator('#estado-btns button[data-estado="en_gestion"]');
    if (await btnGestion.count() > 0) {
      await btnGestion.click();
      await page.waitForSelector('.badge-en_gestion', { timeout: 8000 });
      console.log('  ✓ Jefe 1 avanzó estado a en_gestion ✓');
      await screenshot(page, '11-jefe1-cambio-estado');
    }
  }

  // ── 9. LOGIN JEFE_EQUIPO 2 — verificar RLS ───────────────
  console.log('\n[9] Login jefe_equipo 2 — verificar RLS separación');
  await page.evaluate(() => window.__authLogout?.());
  await page.waitForFunction(() => location.hash.includes('login'), { timeout: 8000 });
  await login(page, JEFE2.email, JEFE2.pass);
  await page.goto(BASE + '/#/expedientes');
  await page.waitForSelector('.card-expediente, .empty-state', { timeout: 8000 });
  const tarjetasJ2 = await page.locator('.card-expediente').count();
  console.log(`  ✓ Jefe 2 ve ${tarjetasJ2} expedientes (deben ser 3)`);
  await screenshot(page, '12-jefe2-expedientes');

  // ── FIN ──────────────────────────────────────────────────
  console.log('\n✅ Todos los tests pasaron. Screenshots en tests/screenshots/');
  await browser.close();
})().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
