/**
 * Артефакт агента (не код сайта). Полноэкранные скриншоты эталона B2.
 * Запуск: NODE_PATH=/tmp/xk-shots/node_modules node docs/concepts/2026-11-04/b2-shoot.cjs
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:4321/concepts/b2';
const OUT = path.resolve(__dirname);
const WIDTHS = [390, 768, 1440];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 700;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + step) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  });
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {})));
  });
  await new Promise((r) => setTimeout(r, 4000));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    protocolTimeout: 180000,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-features=Translate,TranslateUI', '--lang=ru-RU'],
  });
  const report = [];

  for (const w of WIDTHS) {
    const page = await browser.newPage();
    const errors = [];
    const failed = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + (r.failure() && r.failure().errorText)));
    page.on('response', (r) => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });

    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await autoScroll(page);

    const name = 'b2-' + w + '.png';
    await page.screenshot({ path: path.join(OUT, name), fullPage: true });

    const dims = await page.evaluate(() => ({
      h: document.body.scrollHeight,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      fonts: document.fonts ? document.fonts.status : 'n/a',
      nunito: document.fonts && document.fonts.check ? document.fonts.check('16px Nunito') : 'n/a',
      imgs: Array.from(document.images).map((i) => ({ src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0 })),
    }));
    const broken = dims.imgs.filter((i) => !i.ok).map((i) => i.src);
    report.push(
      'OK  ' + name + '  height=' + dims.h + 'px  overflowX=' + dims.overflowX +
      '  fonts=' + dims.fonts + '  nunito=' + dims.nunito +
      '  imgs=' + dims.imgs.length + '  broken=' + broken.length +
      (broken.length ? '  [' + broken.join(', ') + ']' : '') +
      (errors.length ? '  consoleErrors=' + errors.length + ' [' + errors.join(' | ') + ']' : '') +
      (failed.length ? '  failedReq=' + failed.length + ' [' + failed.join(' | ') + ']' : '')
    );
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'b2-shots-report.txt'), report.join('\n') + '\n');
  console.log(report.join('\n'));
})();
