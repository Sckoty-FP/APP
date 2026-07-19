/**
 * Test Realtime definitivo — jefe2 comenta en SU expediente
 * node tests/test-realtime-e2e3.js
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
  await page.waitForFunction(() => !location.hash.includes('login'), { timeout: 10000 });
  await page.waitForTimeout(3000);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── Sesión B: Jefe2 — encontrar SU expediente ───────────────
  const ctxB  = await browser.newContext();
  const pageB = await ctxB.newPage();
  pageB.on('console', m => {
    if (m.type() === 'error') console.log('[JEFE2 error]', m.text());
  });

  await login(pageB, JEFE2);
  console.log('[JEFE2] logueado, buscando sus expedientes...');

  const cards = await pageB.$$('.card-expediente');
  console.log('[JEFE2] expedientes propios:', cards.length);

  if (!cards.length) {
    console.log('❌ Jefe2 no tiene expedientes asignados');
    await browser.close(); return;
  }

  // ID del primer expediente de jefe2
  const onclick = await cards[0].getAttribute('onclick');
  const expId   = onclick?.match(/id=([a-f0-9-]+)/)?.[1];
  console.log('[JEFE2] su expediente:', expId);

  // ── Sesión A: Supervisor — escucha Realtime ─────────────────
  const ctxA  = await browser.newContext();
  const pageA = await ctxA.newPage();
  pageA.on('console', m => {
    if (m.text().includes('realtime') || m.type() === 'error') {
      console.log('[SUP console]', m.text());
    }
  });

  await login(pageA, SUP);
  console.log('[SUP] logueado, esperando que Realtime conecte (5s)...');
  await pageA.waitForTimeout(5000);

  // Badge antes
  const badgeAntes = await pageA.$('#notif-badge');
  console.log('[SUP] badge antes:', badgeAntes ? 'visible' : 'no visible (correcto)');

  // ── Jefe2 navega a su expediente y comenta ──────────────────
  await pageB.evaluate(id => window.__navigate(`#/expediente?id=${id}`), expId);
  await pageB.waitForTimeout(3000);
  console.log('[JEFE2] en expediente, hash:', await pageB.evaluate(() => location.hash));

  // Verificar que el input de comentario es VISIBLE
  const inputVisible = await pageB.$eval('#coment-input-bar', el => el.style.display !== 'none').catch(() => false);
  console.log('[JEFE2] barra de comentarios visible:', inputVisible);

  if (!inputVisible) {
    console.log('[JEFE2] ❌ La barra de comentarios no está visible — puede ser que este estado no permita comentar o que el RLS bloquee');
    await pageB.screenshot({ path: 'tests/diag-e2e3-B-nodisplay.png' });
    await browser.close(); return;
  }

  // Escribir comentario
  const textarea = await pageB.$('#coment-texto');
  await textarea.evaluate(el => el.style.display = 'block'); // forzar visible si es necesario
  await pageB.evaluate(() => {
    const el = document.getElementById('coment-texto');
    if (el) { el.value = 'Notif Realtime ' + Date.now(); el.dispatchEvent(new Event('input')); }
  });

  const btn = await pageB.$('#btn-send');
  console.log('[JEFE2] botón enviar encontrado:', !!btn);
  if (btn) {
    await btn.click({ force: true });
    console.log('[JEFE2] ✅ click en enviar');
  }

  // ── Esperar badge en sesión A ───────────────────────────────
  console.log('\n[SUP] Esperando notificación (15s)...');
  try {
    await pageA.waitForFunction(() => !!document.getElementById('notif-badge'), { timeout: 15000 });
    const val = await pageA.$eval('#notif-badge', el => el.textContent);
    console.log('[SUP] ✅ Badge aparece:', val);
  } catch {
    console.log('[SUP] ❌ Badge NO apareció en 15s');
  }

  await pageA.screenshot({ path: 'tests/diag-e2e3-A.png' });
  await pageB.screenshot({ path: 'tests/diag-e2e3-B.png' });
  await browser.close();
})();
