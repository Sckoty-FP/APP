/**
 * Verifica el estado de la suscripción Realtime
 * node tests/test-realtime-status.js
 */

const { chromium } = require('playwright');

const BASE  = 'https://app-nu-eosin-14.vercel.app';
const SUP   = { email: 'ruben.beltran@verisure.es', pass: 'APPtest' };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
    // Mostrar en tiempo real si es realtime o error
    if (msg.text().includes('realtime') || msg.type() === 'error') {
      console.log(`  [console ${msg.type()}] ${msg.text()}`);
    }
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.fill('#login-email',    SUP.email);
  await page.fill('#login-password', SUP.pass);
  await page.click('#login-btn');
  await page.waitForFunction(() => location.hash.includes('expedientes'), { timeout: 8000 });

  console.log('Login OK. Esperando 6s para que Realtime conecte...');
  await page.waitForTimeout(6000);

  // Buscar logs de realtime
  const realtimeLogs = logs.filter(l => l.text.includes('realtime'));
  console.log('\nLogs [realtime]:', realtimeLogs.length ? realtimeLogs : 'ninguno — la suscripción no emitió estado');

  // Todos los errores
  const errorLogs = logs.filter(l => l.type === 'error');
  if (errorLogs.length) {
    console.log('\nErrores de consola:');
    errorLogs.forEach(l => console.log(' ', l.text));
  }

  await page.screenshot({ path: 'tests/diag-realtime-status.png' });
  await browser.close();
})();
