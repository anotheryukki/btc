import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3];

const existing = fs.readdirSync(outDir).filter((f) => /^screenshot-\d+/.test(f));
const nextNum = existing.reduce((max, f) => {
  const m = f.match(/^screenshot-(\d+)/);
  return m ? Math.max(max, parseInt(m[1], 10) + 1) : max;
}, 1);

const fileName = label ? `screenshot-${nextNum}-${label}.png` : `screenshot-${nextNum}.png`;
const outPath = path.join(outDir, fileName);

const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const executablePath = chromePaths.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error('No Chrome/Edge executable found.');
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  defaultViewport: { width: 1440, height: 900 },
});

const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: outPath });
await browser.close();

console.log(`Saved ${outPath}`);
