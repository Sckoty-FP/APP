/**
 * Test: verifica que la suscripción Realtime se conecta
 * node tests/test-realtime.js
 */

const { chromium } = require('playwright');

const BASE = 'https://app-nu-eosin-14.vercel.app';
const SUP  = { email: 'ruben.beltran@verisure.es', pass: 'APPtest' };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await page.fill('#login-email',    SUP.email);
  await page.fill('#login-password', SUP.pass);
  await page.click('#login-btn');
  await page.waitForFunction(() => location.hash.includes('expedientes'), { timeout: 8000 });
  await page.waitForTimeout(4000); // Dar tiempo a que Realtime conecte

  // Verificar estado del canal Realtime via window.__debug_realtime
  const estadoCanal = await page.evaluate(() => {
    // Buscar canales activos en el cliente Supabase
    try {
      const sb = window.__supabase;
      if (sb) return sb.getChannels().map(c => ({ topic: c.topic, state: c.state }));
    } catch {}
    return 'no expuesto';
  });

  console.log('Estado canales Realtime:', JSON.stringify(estadoCanal, null, 2));

  // Ver si aparece el botón de campana
  const btnNotif = await page.$('#btn-notif');
  console.log('Botón campana en header:', btnNotif ? '✅ presente' : '❌ no encontrado');

  // Logs relevantes
  const realtimeLogs = logs.filter(l =>
    l.toLowerCase().includes('realtime') ||
    l.toLowerCase().includes('channel') ||
    l.toLowerCase().includes('socket') ||
    l.toLowerCase().includes('error')
  );
  if (realtimeLogs.length) {
    console.log('\nLogs Realtime:');
    realtimeLogs.forEach(l => console.log(' ', l));
  } else {
    console.log('\nSin logs de Realtime en consola.');
  }

  await page.screenshot({ path: 'tests/diag-realtime.png' });
  await browser.close();
})();
