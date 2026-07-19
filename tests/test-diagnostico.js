/**
 * Test diagnóstico rápido contra Vercel
 * node tests/test-diagnostico.js
 */

const { chromium } = require('playwright');

const BASE = 'https://app-nu-eosin-14.vercel.app';
const SUP  = { email: 'ruben.beltran@verisure.es', pass: 'APPtest' };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext();
  const page    = await ctx.newPage();

  // Capturar errores de consola
  const errores = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errores.push(msg.text());
  });
  page.on('pageerror', err => errores.push('[pageerror] ' + err.message));

  console.log('\n=== DIAGNÓSTICO SGR-PPA ===\n');

  // 1. Cargar la app
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Hash inicial:', await page.evaluate(() => location.hash));

  // 2. Login como supervisor
  await page.fill('#login-email',    SUP.email);
  await page.fill('#login-password', SUP.pass);
  await page.click('#login-btn');
  await page.waitForFunction(() => location.hash.includes('expedientes'), { timeout: 8000 });
  console.log('✅ Login OK. Hash:', await page.evaluate(() => location.hash));
  await page.screenshot({ path: 'tests/diag-01-login.png' });

  // 3. Verificar expedientes
  await page.waitForTimeout(3000);
  const cards = await page.$$('.card-expediente');
  console.log(`Expedientes visibles: ${cards.length}`);

  // Capturar HTML del listado si está vacío
  if (cards.length === 0) {
    const listHtml = await page.$eval('#exp-list', el => el.innerHTML).catch(() => 'elemento no encontrado');
    console.log('HTML de #exp-list:', listHtml.slice(0, 400));
  }
  await page.screenshot({ path: 'tests/diag-02-expedientes.png' });

  // 4. Ir a Perfil
  await page.click('a[data-route="#/perfil"]');
  await page.waitForFunction(() => location.hash.includes('perfil'), { timeout: 5000 });
  await page.waitForTimeout(1500);
  console.log('Hash en perfil:', await page.evaluate(() => location.hash));

  // ¿Aparece el botón de gestión?
  const btnGestion = await page.$('#perfil-admin-section');
  const visible    = btnGestion ? await btnGestion.evaluate(el => el.style.display !== 'none') : false;
  console.log('Sección admin visible en perfil:', visible);
  await page.screenshot({ path: 'tests/diag-03-perfil.png' });

  // 5. Clic en "Gestionar usuarios"
  if (visible) {
    await page.click('#perfil-admin-section button');
    await page.waitForTimeout(2000);
    const hashDespues = await page.evaluate(() => location.hash);
    console.log('Hash tras clic en Gestionar usuarios:', hashDespues);
    await page.screenshot({ path: 'tests/diag-04-usuarios.png' });

    // ¿Hay lista de usuarios o error?
    const listHtml = await page.$eval('#usuarios-list', el => el.innerHTML).catch(() => 'elemento no encontrado');
    console.log('HTML de #usuarios-list:', listHtml.slice(0, 500));
  }

  // 6. Errores de consola
  if (errores.length) {
    console.log('\n⚠️  Errores de consola:');
    errores.forEach(e => console.log('  -', e));
  } else {
    console.log('\n✅ Sin errores de consola');
  }

  await browser.close();
  console.log('\n=== FIN DIAGNÓSTICO ===\n');
})();
