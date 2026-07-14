import puppeteer from 'puppeteer-core';
import { mkdir, readdir } from 'node:fs/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://localhost:3100';
const label = process.argv[3] || '';
const mode = process.argv[4] || 'desktop'; // desktop | mobile
const OUT = './temporary screenshots';
await mkdir(OUT, { recursive: true });

const existing = (await readdir(OUT)).filter(f => f.startsWith('screenshot-'));
let n = 1;
for (const f of existing) { const m = f.match(/screenshot-(\d+)/); if (m) n = Math.max(n, +m[1] + 1); }
const name = `screenshot-${n}${label ? '-' + label : ''}.png`;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
if (mode === 'mobile') await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
else await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
// force lazy images eager + reveals visible, then decode everything
await page.evaluate(async () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
  document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
  const h = document.body.scrollHeight;
  for (let y = 0; y <= h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
  window.scrollTo(0, 0);
  await Promise.allSettled([...document.images].map(i => i.decode()));
});
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });
await browser.close();
console.log(`saved ${OUT}/${name}`);
