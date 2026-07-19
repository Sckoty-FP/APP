const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  const errores = [];
  page.on('console', msg => { if (msg.type() === 'error') errores.push(msg.text()); });

  await page.goto('https://app-nu-eosin-14.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('Hash:', await page.evaluate(() => location.hash));
  console.log('Título:', await page.title());

  // Ver qué hay en el main
  const mainHtml = await page.$eval('#app-main', el => el.innerHTML).catch(() => 'no encontrado');
  console.log('Contenido #app-main:', mainHtml.slice(0, 600));

  await page.screenshot({ path: 'tests/diag-inicio.png' });

  if (errores.length) {
    console.log('Errores:', errores);
  }

  await browser.close();
})();
