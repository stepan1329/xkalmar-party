/**
 * Технический скрипт съёмки скриншотов XKALMAR для visual-critic.
 * Артефакт агента (не код сайта). Запуск:
 * NODE_PATH=/tmp/xk-shots/node_modules node docs/screenshots/take-shots.cjs
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:4321';
const OUT = path.resolve(__dirname);

const FULL_WIDTHS = [1440, 1024, 768, 390, 360];

const SECTIONS_1440 = [
  ['hero-1440-full', 'section.hero'],
  ['format-1440-full', 'section.format'],
  ['faq-1440-full', 'section.faq'],
  ['drc-1440-full', 'section.drc'],
  ['timeline-1440-full', 'section.timeline'],
  ['yamarka-1440-full', 'section.yamarka'],
  ['hallway-1440-full', 'section.hallway'],
  ['features-1440-full', 'section.features'],
  ['reviews-1440-full', 'section.reviews'],
  ['gallery-1440-full', 'section.gallery'],
  ['zayavka-1440-full', '#zayavka'],
  ['footer-1440-full', 'footer.site-footer'],
];

const MOBILE_390 = [
  ['header-390-full', 'header.site-header'],
  ['drc-390-full', 'section.drc'],
  ['zayavka-390-full', '#zayavka'],
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 600;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + step) {
          clearInterval(timer);
          resolve();
        }
      }, 60);
    });
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 700));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  const report = [];

  // --- QA-сбор: консоль, сеть, ссылки ---
  const consoleErrors = [];
  const badResponses = []; // 4xx/5xx
  const failedRequests = [];
  const links = new Set(); // href -> где найдено

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push('[' + msg.type() + '] ' + msg.text());
    }
  });
  page.on('pageerror', (err) => consoleErrors.push('[pageerror] ' + err.message));
  page.on('requestfailed', (req) =>
    failedRequests.push(req.url() + ' :: ' + (req.failure() ? req.failure().errorText : '?')));
  page.on('response', (res) => {
    if (res.status() >= 400) badResponses.push(res.status() + ' ' + res.url());
  });

  const collectLinks = async () => {
    const found = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]')).map((a) => ({
        href: a.href,
        text: (a.textContent || '').trim().slice(0, 60),
      }))
    );
    for (const l of found) links.add(JSON.stringify(l));
  };
  // --- конец QA-сбора ---

  const shoot = async (name, opts) => {
    await page.screenshot({ path: path.join(OUT, name + '.png'), ...opts });
    report.push('OK  ' + name + '.png');
  };

  const sectionShot = async (name, selector, viewport) => {
    const el = await page.$(selector);
    if (!el) {
      report.push('MISSING  ' + name + '.png  selector not found: ' + selector);
      return;
    }
    try {
      await el.screenshot({ path: path.join(OUT, name + '.png') });
      report.push('OK  ' + name + '.png  (' + selector + ' @' + viewport + ')');
    } catch (e) {
      report.push('FAIL  ' + name + '.png  ' + selector + ': ' + e.message);
    }
  };

  for (const w of FULL_WIDTHS) {
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await autoScroll(page);
    await shoot('full-' + w + 'px', { fullPage: true });
  }

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await autoScroll(page);
  for (const [name, sel] of SECTIONS_1440) {
    await sectionShot(name, sel, 1440);
  }
  await collectLinks();

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await autoScroll(page);
  for (const [name, sel] of MOBILE_390) {
    await sectionShot(name, sel, 390);
  }
  await collectLinks();

  // --- QA-отчёт ---
  const qa = [];
  qa.push('=== QA-отчёт ' + new Date().toISOString() + ' ===');
  qa.push('');
  qa.push('--- Консоль (errors/warnings): ' + consoleErrors.length + ' ---');
  consoleErrors.forEach((e) => qa.push(e));
  qa.push('');
  qa.push('--- HTTP >= 400: ' + badResponses.length + ' ---');
  badResponses.forEach((e) => qa.push(e));
  qa.push('');
  qa.push('--- Сетевые сбои: ' + failedRequests.length + ' ---');
  failedRequests.forEach((e) => qa.push(e));
  qa.push('');
  qa.push('--- Ссылки на сайте: ' + links.size + ' ---');
  Array.from(links).map((s) => JSON.parse(s)).forEach((l) =>
    qa.push((l.href || '(пусто)') + '  |  ' + l.text));

  fs.writeFileSync(path.join(OUT, 'qa-report.txt'), qa.join('\n') + '\n');

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'shots-report.txt'), report.join('\n') + '\n');
  console.log(report.join('\n'));
  console.log('QA: qa-report.txt записан; консоль=' + consoleErrors.length +
    ' http>=400=' + badResponses.length + ' сеть=' + failedRequests.length +
    ' ссылок=' + links.size);
})().catch((e) => {
  console.error('FATAL: ' + (e && e.stack ? e.stack : e));
  process.exit(1);
});
