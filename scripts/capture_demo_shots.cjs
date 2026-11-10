// Gera as capturas WebP das demonstrações usadas nos cartões de solução da homepage.
// As imagens mostram as próprias simulações do site (dados fictícios), não sistemas de clientes.
// Uso: com o servidor local ativo (npm start), node scripts/capture_demo_shots.cjs [baseUrl]
const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const base = process.argv[2] || 'http://localhost:4173/';
const outDir = resolve(__dirname, '..', 'public', 'assets', 'img', 'demos');
const RATIO = 10 / 16;
const SIZES = [480, 960];

const SHOTS = [
  {
    name: 'automacao',
    css: '#panel-automacao .app-window{width:880px}',
    prepare: async page => { await page.click('[data-gallery-tab="automacao"]'); await page.click('#runner-run'); },
    target: '#process-runner',
  },
  {
    name: 'sistemas',
    css: '#panel-gestao .app-window{width:900px}',
    prepare: async page => { await page.click('[data-gallery-tab="gestao"]'); },
    target: '#dashboard-panel',
  },
  {
    name: 'integracoes',
    css: '#integracoes-lab .app-window{width:1000px}',
    prepare: async page => { await page.click('[data-gallery-tab="integracao"]'); await page.click('#lab-run'); },
    target: '#integration-lab',
  },
  {
    name: 'atendimento',
    css: '',
    prepare: async page => { await page.click('[data-demo-scenario="atendimento"]'); await page.click('[data-demo-step="3"]'); },
    target: '#scenario-outcome',
  },
];

(async () => {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('luminor-analytics-consent', 'rejected'); } catch {} });
  const page = await ctx.newPage();
  const report = [];
  for (const shot of SHOTS) {
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: `${shot.css} .whatsapp-floating,.skip-link{display:none!important} .site-header{position:static!important}` });
    await shot.prepare(page);
    const target = page.locator(shot.target);
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const png = (await target.screenshot()).toString('base64');
    // Recorte 16:10 a partir do topo e redução no próprio Chrome (canvas → WebP).
    const files = await page.evaluate(async ({ png, sizes, ratio }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      const cropH = Math.min(img.height, Math.round(img.width * ratio));
      return sizes.map(width => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = Math.round(width * ratio);
        const g = canvas.getContext('2d');
        g.imageSmoothingQuality = 'high';
        g.fillStyle = '#F8F7FC';
        g.fillRect(0, 0, canvas.width, canvas.height);
        const drawH = Math.round((cropH / img.width) * width);
        g.drawImage(img, 0, 0, img.width, cropH, 0, 0, width, drawH);
        return { width, height: canvas.height, data: canvas.toDataURL('image/webp', 0.82).split(',')[1] };
      });
    }, { png, sizes: SIZES, ratio: RATIO });
    for (const file of files) {
      const path = resolve(outDir, `${shot.name}-${file.width}.webp`);
      const buffer = Buffer.from(file.data, 'base64');
      writeFileSync(path, buffer);
      report.push(`${shot.name}-${file.width}.webp ${file.width}x${file.height} ${buffer.length} B`);
    }
  }
  await browser.close();
  console.log(report.join('\n'));
})().catch(error => { console.error(error); process.exitCode = 1; });
