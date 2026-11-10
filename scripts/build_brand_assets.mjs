// Gera os arquivos da marca: símbolo, logotipos em SVG, favicons e imagem de compartilhamento.
// Uso: node scripts/build_brand_assets.mjs  (os PNGs exigem o Playwright instalado localmente)
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const img = `${root}public/assets/img/`;
const wordmark = JSON.parse(await readFile(new URL('./brand-wordmark.json', import.meta.url), 'utf8'));
export const COLORS = { dark: '#160B2E', primary: '#6C2BD9', accent: '#00C8D0', white: '#FFFFFF' };

// Símbolo: dois paralelogramos arredondados que se cruzam em volta de uma abertura central,
// desenhados com 100 unidades de altura e inclinados cerca de 39°.
const K = 0.8, W = 115;
const G = { a: 70.5, b: 43, c: 26, h: 74, hx0: 40.5, hx1: 73, hy0: 28.5, hy1: 71 };
const R = { acute: 10, obtuse: 20, concave: 4, hole: 4.5 };
const skew = ([x, y]) => [x + K * (100 - y), y];
const r2 = n => Math.round(n * 100) / 100;

// Arredonda os cantos de um polígono (coordenadas finais) e devolve o path SVG.
function rounded(points, radii) {
  const n = points.length, parts = [], bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const grow = ([x, y]) => { bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y); bounds[2] = Math.max(bounds[2], x); bounds[3] = Math.max(bounds[3], y); };
  for (let i = 0; i < n; i++) {
    const p = points[i], a = points[(i + n - 1) % n], b = points[(i + 1) % n], r = radii[i];
    const u1 = norm([p[0] - a[0], p[1] - a[1]]), u2 = norm([b[0] - p[0], b[1] - p[1]]);
    const theta = Math.acos(Math.max(-1, Math.min(1, -(u1[0] * u2[0] + u1[1] * u2[1]))));
    const t = r ? r / Math.tan(theta / 2) : 0;
    const start = [p[0] - u1[0] * t, p[1] - u1[1] * t], end = [p[0] + u2[0] * t, p[1] + u2[1] * t];
    const sweep = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 1 : 0;
    parts.push(`${i ? 'L' : 'M'}${r2(start[0])} ${r2(start[1])}`);
    if (r) {
      parts.push(`A${r} ${r} 0 0 ${sweep} ${r2(end[0])} ${r2(end[1])}`);
      const bis = norm([u2[0] - u1[0], u2[1] - u1[1]]), dist = r / Math.sin(theta / 2);
      const c = [p[0] + bis[0] * dist, p[1] + bis[1] * dist];
      for (let s = 0; s <= 16; s++) {
        const a0 = Math.atan2(start[1] - c[1], start[0] - c[0]), a1 = Math.atan2(end[1] - c[1], end[0] - c[0]);
        let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        grow([c[0] + r * Math.cos(a0 + da * s / 16), c[1] + r * Math.sin(a0 + da * s / 16)]);
      }
    } else grow(p);
  }
  return { d: parts.join('') + 'Z', bounds };
}
function norm([x, y]) { const l = Math.hypot(x, y); return [x / l, y / l]; }

function symbolGeometry() {
  const { a, b, c, h, hx0, hx1, hy0, hy1 } = G;
  const outer = [[0, 0], [a, 0], [a, c], [W, c], [W, 100], [b, 100], [b, h], [0, h]].map(skew);
  const outerR = [R.obtuse, R.acute, R.concave, R.acute, R.obtuse, R.acute, R.concave, R.acute];
  const hole = [[hx0, hy0], [hx0, hy1], [hx1, hy1], [hx1, hy0]].map(skew);
  const holeR = [R.hole, R.hole, R.hole, R.hole];
  const o = rounded(outer, outerR), i = rounded(hole, holeR);
  // Peça inferior (⅃): recorta a forma completa a partir das dobras da fita.
  const lower = [[a, c], [W + 12, c], [W + 12, 112], [b, 112], [b, h], [hx0, hy1], [hx1, hy0]].map(skew).map(p => p.map(r2).join(' '));
  const [x0, y0, x1, y1] = o.bounds;
  return { d: o.d + i.d, lower: `M${lower.join('L')}Z`, box: [x0, y0, x1 - x0, y1 - y0] };
}

const SYM = symbolGeometry();
const [SX, SY, SW, SH] = SYM.box;
const vb = (x, y, w, h) => [x, y, w, h].map(r2).join(' ');

// Elementos do símbolo; id evita colisão quando há mais de um SVG inline na mesma página.
function symbol(fill, id = 'lm') {
  if (fill !== 'color') return `<path fill="${fill}" fill-rule="evenodd" d="${SYM.d}"/>`;
  // Peça superior vai do ciano ao magenta; a inferior, do azul ao roxo, para marcar as dobras da fita.
  return `<defs><linearGradient id="${id}-a" gradientUnits="userSpaceOnUse" x1="148" y1="2" x2="24" y2="72"><stop offset="0" stop-color="${COLORS.accent}"/><stop offset=".5" stop-color="#6A55EC"/><stop offset="1" stop-color="#C23BE6"/></linearGradient><linearGradient id="${id}-b" gradientUnits="userSpaceOnUse" x1="170" y1="30" x2="48" y2="98"><stop offset="0" stop-color="#2F6CF0"/><stop offset=".55" stop-color="${COLORS.primary}"/><stop offset="1" stop-color="#4A2FE0"/></linearGradient><clipPath id="${id}-c"><path fill-rule="evenodd" clip-rule="evenodd" d="${SYM.d}"/></clipPath></defs><path fill="url(#${id}-a)" fill-rule="evenodd" d="${SYM.d}"/><path fill="url(#${id}-b)" clip-path="url(#${id}-c)" d="${SYM.lower}"/>`;
}

const text = (w, x, y, size, fill) => `<path fill="${fill}" transform="translate(${r2(x)} ${r2(y)}) scale(${r2(size / 100)})" d="${w.d}"/>`;
const LUMINOR = 58, SOFTWARE = 30;

function horizontal({ sym, name, sub, rule }) {
  const gap = 22, x = SW + gap * 2 + 2, cap = wordmark.luminor.capHeight / 100;
  const top = SY + (SH - (LUMINOR * cap + 16 + SOFTWARE * cap)) / 2;
  const w = x + Math.max(wordmark.luminor.width * LUMINOR, wordmark.software.width * SOFTWARE) / 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(SX, SY, w, SH)}" role="img" aria-label="Luminor Software"><title>Luminor Software</title>${symbol(sym)}<rect x="${r2(SX + SW + gap)}" y="${r2(top)}" width="2" height="${r2(SH - (top - SY) * 2)}" fill="${rule}"/>${text(wordmark.luminor, SX + x, top + LUMINOR * cap, LUMINOR, name)}${text(wordmark.software, SX + x + 1, top + LUMINOR * cap + 16 + SOFTWARE * cap, SOFTWARE, sub)}</svg>`;
}

function vertical({ sym, name, sub }) {
  const cap = wordmark.luminor.capHeight / 100, lw = wordmark.luminor.width * LUMINOR / 100, sw = wordmark.software.width * SOFTWARE / 100;
  const w = Math.max(SW, lw, sw), y1 = SY + SH + 30 + LUMINOR * cap, y2 = y1 + 16 + SOFTWARE * cap;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(0, SY, w, y2 - SY + 2)}" role="img" aria-label="Luminor Software"><title>Luminor Software</title><g transform="translate(${r2((w - SW) / 2 - SX)} 0)">${symbol(sym)}</g>${text(wordmark.luminor, (w - lw) / 2, y1, LUMINOR, name)}${text(wordmark.software, (w - sw) / 2, y2, SOFTWARE, sub)}</svg>`;
}

const symbolSvg = (fill, pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(SX - pad, SY - pad, SW + pad * 2, SH + pad * 2)}" role="img" aria-label="Luminor Software"><title>Luminor Software</title>${symbol(fill)}</svg>`;

export const FILES = {
  'luminor-symbol.svg': symbolSvg('color'),
  'luminor-symbol-mono.svg': symbolSvg(COLORS.dark),
  'luminor-symbol-white.svg': symbolSvg(COLORS.white),
  'luminor-logo.svg': horizontal({ sym: 'color', name: COLORS.dark, sub: COLORS.primary, rule: COLORS.dark }),
  'luminor-logo-dark.svg': horizontal({ sym: 'color', name: COLORS.white, sub: COLORS.accent, rule: 'rgba(255,255,255,.4)' }),
  'luminor-logo-mono.svg': horizontal({ sym: COLORS.dark, name: COLORS.dark, sub: COLORS.dark, rule: COLORS.dark }),
  'luminor-logo-vertical.svg': vertical({ sym: 'color', name: COLORS.dark, sub: COLORS.primary }),
  'luminor-logo-vertical-dark.svg': vertical({ sym: 'color', name: COLORS.white, sub: COLORS.accent }),
};

// Ícone de aplicativo: símbolo colorido sobre quadrado azul-noturno.
const appIcon = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" rx="${radius}" fill="${COLORS.dark}"/><svg x="16" y="16" width="68" height="68" viewBox="${vb(SX, SY, SW, SH)}">${symbol('color', 'app')}</svg></svg>`;

function ico(pngs) {
  const head = Buffer.alloc(6 + pngs.length * 16);
  head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    head.writeUInt8(size % 256, e); head.writeUInt8(size % 256, e + 1);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...pngs.map(p => p.data)]);
}

async function renderPngs() {
  let chromium;
  try { ({ chromium } = await import('playwright')); } catch { console.log('Playwright ausente: PNGs não gerados.'); return; }
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage();
  const shot = async (html, width, height, transparent = true) => {
    await page.setViewportSize({ width, height });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${html}`);
    return page.screenshot({ omitBackground: transparent, clip: { x: 0, y: 0, width, height } });
  };
  const favicon = size => shot(`<svg width="${size}" height="${size}" viewBox="${vb(SX - 4, SY - (SW - SH) / 2 - 4, SW + 8, SW + 8)}">${symbol('color')}</svg>`, size, size);
  await writeFile(`${root}public/favicon.ico`, ico(await Promise.all([16, 32, 48].map(async size => ({ size, data: await favicon(size) })))));
  await writeFile(`${img}favicon-192.png`, await shot(appIcon(192, 22), 192, 192));
  await writeFile(`${img}apple-touch-icon.png`, await shot(appIcon(180, 0), 180, 180, false));
  await writeFile(`${img}luminor-logo.png`, await shot(`<svg width="512" height="512" viewBox="${vb(SX - 12, SY - (SW - SH) / 2 - 12, SW + 24, SW + 24)}">${symbol('color')}</svg>`, 512, 512));
  const font = (await readFile(`${root}public/assets/fonts/inter-latin-wght-normal.woff2`)).toString('base64');
  const logo = FILES['luminor-logo-dark.svg'].replace('<svg ', '<svg class="logo" ');
  await writeFile(`${img}og-cover.png`, await shot(`<style>@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:100 900}
    .og{position:relative;width:1200px;height:630px;overflow:hidden;font-family:Inter,sans-serif;color:#fff;background:radial-gradient(60% 80% at 0% 0%,rgba(108,43,217,.55),transparent 60%),radial-gradient(50% 70% at 100% 100%,rgba(0,200,208,.28),transparent 60%),${COLORS.dark}}
    .og:before{content:"";position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,.12) 1px,transparent 1.6px) 0 0/28px 28px;-webkit-mask-image:linear-gradient(110deg,transparent 30%,#000 90%)}
    .logo{position:absolute;left:96px;top:118px;height:150px;width:auto}
    p{position:absolute;left:96px;margin:0}.t{top:338px;width:900px;font-size:50px;line-height:1.14;font-weight:700;letter-spacing:-.03em}.t span{color:${COLORS.accent}}
    .u{bottom:72px;font-size:24px;font-weight:500;color:rgba(255,255,255,.72);letter-spacing:.02em}</style>
    <div class="og">${logo}<p class="t">Sistemas sob medida, automação<br>e integrações <span>para sua empresa.</span></p><p class="u">luminorsoftware.com.br</p></div>`, 1200, 630, false));
  await browser.close();
}

for (const [file, svg] of Object.entries(FILES)) await writeFile(img + file, svg + '\n', 'utf8');
if (!process.argv.includes('--svg-only')) await renderPngs();
console.log(`Marca gerada: ${Object.keys(FILES).length} SVGs${process.argv.includes('--svg-only') ? '' : ', favicons e imagem de compartilhamento'}.`);
