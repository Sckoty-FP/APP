/**
 * Test end-to-end Realtime — versión con logging detallado
 * node tests/test-realtime-e2e2.js
 */

const { chromium } = require('playwright');

const BASE  = 'https://app-nu-eosin-14.vercel.app';
const SUP   = { email: 'ruben.beltran@verisure.es', pass: 'APPtest' };
const JEFE2 = { email: 'test.jefe2@verisure.es',   pass: 'APPtest' };

async function loginAndWait(page, cred, label) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.fill('#login-email',    cred.email);
  await page.fill('#login-password', cred.pass);
  await page.click('#login-btn');
  await page.waitForFunction(() => !location.hash.includes('login'), { timeout: 10000 });
  await page.waitForTimeout(3000);
  console.log(`[${label}] Hash tras login:`, await page.evaluate(() => location.hash));
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── Sesión A: Supervisor ────────────────────────────────────
  const ctxA  = await browser.newContext();
  const pageA = await ctxA.newPage();
  pageA.on('console', m => {
    if (m.text().includes('realtime') || m.type() === 'error') {
      console.log(`[SUP console] ${m.text()}`);
    }
  });

  await loginAndWait(pageA, SUP, 'SUP');

  // Esperar que Realtime conecte
  await pageA.waitForTimeout(4000);
  console.log('[SUP] esperando SUBSCRIBED...');

  // Obtener ID de un expediente visible
  const cards = await pageA.$$('.card-expediente');
  console.log('[SUP] expedientes visibles:', cards.length);
  if (!cards.length) { console.log('❌ Sin expedientes'); await browser.close(); return; }

  // Usar el ÚLTIMO expediente (más probable que sea de jefe2 por fecha)
  const ultimaCard = cards[cards.length - 1];
  const onclick    = await ultimaCard.getAttribute('onclick');
  const expId      = onclick?.match(/id=([a-f0-9-]+)/)?.[1];
  console.log('[SUP] Expediente elegido:', expId);

  // ── Sesión B: Jefe2 escribe un comentario ───────────────────
  const ctxB  = await browser.newContext();
  const pageB = await ctxB.newPage();
  pageB.on('console', m => {
    if (m.type() === 'error') console.log(`[JEFE2 error] ${m.text()}`);
  });

  await loginAndWait(pageB, JEFE2, 'JEFE2');

  // Navegar al expediente
  await pageB.evaluate(id => window.__navigate(`#/expediente?id=${id}`), expId);
  await pageB.waitForTimeout(3000);
  console.log('[JEFE2] hash:', await pageB.evaluate(() => location.hash));

  // Buscar input comentario
  const input = await pageB.$('#coment-texto');
  console.log('[JEFE2] input comentario:', input ? 'encontrado ✅' : 'NO encontrado ❌');

  if (!input) {
    // Quizás este expediente no es de jefe2 — probar con el primero
    console.log('[JEFE2] intentando con primer expediente...');
    await pageB.evaluate(() => window.__navigate('#/expedientes'));
    await pageB.waitForTimeout(2000);
    const jefe2Cards = await pageB.$$('.card-expediente');
    console.log('[JEFE2] expedientes propios:', jefe2Cards.length);
    if (!jefe2Cards.length) {
      console.log('❌ Jefe2 no tiene expedientes');
      await browser.close(); return;
    }
    const firstOnclick = await jefe2Cards[0].getAttribute('onclick');
    const firstId      = firstOnclick?.match(/id=([a-f0-9-]+)/)?.[1];
    console.log('[JEFE2] usando su expediente:', firstId);
    await pageB.evaluate(id => window.__navigate(`#/expediente?id=${id}`), firstId);
    await pageB.waitForTimeout(3000);
  }

  const input2 = await pageB.$('#coment-texto');
  console.log('[JEFE2] input (2º intento):', input2 ? 'encontrado ✅' : 'NO encontrado ❌');

  if (input2) {
    await input2.fill('Notif test ' + Date.now());
    const btn = await pageB.$('#btn-enviar-coment');
    console.log('[JEFE2] botón enviar:', btn ? 'encontrado ✅' : 'NO encontrado ❌');
    if (btn) {
      await btn.click();
      console.log('[JEFE2] ✅ Comentario enviado');
    }
  }

  // ── Esperar badge en sesión A ───────────────────────────────
  console.log('\n[SUP] Esperando badge (12s)...');
  try {
    await pageA.waitForFunction(() => !!document.getElementById('notif-badge'), { timeout: 12000 });
    const val = await pageA.$eval('#notif-badge', el => el.textContent);
    console.log('[SUP] ✅ Badge aparece con valor:', val);
  } catch {
    console.log('[SUP] ❌ Badge NO apareció');
    // Verificar si al menos el evento llegó inspeccionando el window
    const count = await pageA.evaluate(() => {
      try { return window._notifCount ?? 'no expuesto'; } catch { return 'error'; }
    });
    console.log('[SUP] contador interno:', count);
  }

  await pageA.screenshot({ path: 'tests/diag-e2e2-A.png' });
  await pageB.screenshot({ path: 'tests/diag-e2e2-B.png' });
  await browser.close();
})();
