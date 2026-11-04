/**
 * Артефакт агента (не код сайта). Полноэкранные скриншоты концептов главной.
 * Запуск: NODE_PATH=/tmp/xk-shots/node_modules node docs/concepts/2026-11-04/shoot.cjs
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:4321/concepts/';
const OUT = path.resolve(__dirname);
const CONCEPTS = ['a', 'b', 'c'];
const WIDTHS = [1440, 390];

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
  // Форсируем загрузку lazy-изображений и даём им время декодироваться.
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  });
  await new Promise((r) => setTimeout(r, 3000));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    protocolTimeout: 180000,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  const report = [];

  for (const c of CONCEPTS) {
    for (const w of WIDTHS) {
      const page = await browser.newPage();
      const errors = [];
      const failed = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + (r.failure() && r.failure().errorText)));
      page.on('response', (r) => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });

      await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
      await page.goto(BASE + c, { waitUntil: 'networkidle0', timeout: 60000 });
      await autoScroll(page);

      const name = c + '-' + w + '.png';
      await page.screenshot({ path: path.join(OUT, name), fullPage: true });

      const dims = await page.evaluate(() => ({
        h: document.body.scrollHeight,
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
        imgs: Array.from(document.images).map((i) => ({ src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0 })),
      }));
      const broken = dims.imgs.filter((i) => !i.ok).map((i) => i.src);
      report.push(
        'OK  ' + name + '  height=' + dims.h + 'px  overflowX=' + dims.overflowX +
        '  imgs=' + dims.imgs.length + '  broken=' + broken.length +
        (broken.length ? '  [' + broken.join(', ') + ']' : '') +
        (errors.length ? '  consoleErrors=' + errors.length + ' [' + errors.join(' | ') + ']' : '') +
        (failed.length ? '  failedReq=' + failed.length + ' [' + failed.join(' | ') + ']' : '')
      );
      await page.close();
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'shots-report.txt'), report.join('\n') + '\n');
  console.log(report.join('\n'));
})().catch((e) => {
  console.error('FATAL: ' + (e && e.stack ? e.stack : e));
  process.exit(1);
});
