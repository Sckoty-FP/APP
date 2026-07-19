/**
 * Test end-to-end de notificaciones Realtime
 * Sesión A (supervisor Rubén) — escucha notificaciones
 * Sesión B (jefe2) — escribe un comentario
 * Verificar que el badge aparece en sesión A
 *
 * node tests/test-realtime-end2end.js
 */

const { chromium } = require('playwright');

const BASE  = 'https://app-nu-eosin-14.vercel.app';
const SUP   = { email: 'ruben.beltran@verisure.es', pass: 'APPtest' };
const JEFE2 = { email: 'test.jefe2@verisure.es',   pass: 'APPtest' };

async function login(page, cred) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.fill('#login-email',    cred.email);
  await page.fill('#login-password', cred.pass);
  await page.click('#login-btn');
  await page.waitForFunction(() => !location.hash.includes('login'), { timeout: 8000 });
  await page.waitForTimeout(2000);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── Sesión A: Supervisor ────────────────────────────────────
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  const logsA = [];
  pageA.on('console', m => logsA.push(`[${m.type()}] ${m.text()}`));

  console.log('Iniciando sesión A (supervisor)...');
  await login(pageA, SUP);
  console.log('Hash sesión A:', await pageA.evaluate(() => location.hash));

  // Esperar que Realtime conecte
  await pageA.waitForTimeout(3000);

  // Badge antes del comentario
  const badgeAntes = await pageA.$('#notif-badge');
  console.log('Badge ANTES del comentario:', badgeAntes ? 'visible' : 'no visible (esperado)');

  // ── Obtener primer expediente para comentar ─────────────────
  const primerCard = await pageA.$('.card-expediente');
  if (!primerCard) {
    console.log('❌ No hay expedientes visibles en sesión A');
    await browser.close();
    return;
  }
  const expId = await primerCard.evaluate(el => el.getAttribute('onclick')?.match(/id=([^']+)/)?.[1]);
  console.log('ID expediente para el test:', expId);

  // ── Sesión B: Jefe2 escribe un comentario ───────────────────
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  const logsB = [];
  pageB.on('console', m => logsB.push(`[${m.type()}] ${m.text()}`));

  console.log('\nIniciando sesión B (jefe2)...');
  await login(pageB, JEFE2);
  console.log('Hash sesión B:', await pageB.evaluate(() => location.hash));

  // Navegar al mismo expediente
  await pageB.evaluate(id => window.__navigate(`#/expediente?id=${id}`), expId);
  await pageB.waitForFunction(() => location.hash.includes('expediente?'), { timeout: 8000 });
  await pageB.waitForTimeout(2000);

  // Buscar el input de comentario
  const inputComent = await pageB.$('#coment-texto');
  if (!inputComent) {
    console.log('❌ No se encontró el input de comentario en sesión B');
    // Capturar HTML para debug
    const mainHtml = await pageB.$eval('#app-main', el => el.innerHTML.slice(0, 300));
    console.log('Main HTML sesión B:', mainHtml);
  } else {
    await inputComent.fill('Comentario de prueba Realtime ' + Date.now());
    const btnEnviar = await pageB.$('#btn-enviar-coment');
    if (btnEnviar) {
      await btnEnviar.click();
      console.log('✅ Comentario enviado desde jefe2');
    }
  }

  // ── Esperar notificación en sesión A ────────────────────────
  console.log('\nEsperando badge en sesión A (10s)...');
  try {
    await pageA.waitForFunction(() => document.getElementById('notif-badge') !== null, { timeout: 10000 });
    const badgeDespues = await pageA.$eval('#notif-badge', el => el.textContent);
    console.log('✅ Badge aparece en sesión A con valor:', badgeDespues);
  } catch {
    console.log('❌ Badge NO apareció en sesión A tras 10 segundos');
  }

  await pageA.screenshot({ path: 'tests/diag-realtime-A.png' });
  await pageB.screenshot({ path: 'tests/diag-realtime-B.png' });

  // Errores relevantes
  const errA = logsA.filter(l => l.includes('[error]') || l.includes('realtime'));
  const errB = logsB.filter(l => l.includes('[error]') || l.includes('realtime'));
  if (errA.length) { console.log('\nLogs sesión A:', errA); }
  if (errB.length) { console.log('Logs sesión B:', errB); }

  await browser.close();
})();
