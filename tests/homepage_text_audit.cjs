// Auditoria de texto e capturas da homepage (redesign V4).
// Uso: node tests/homepage_text_audit.cjs <rótulo> [pasta de saída] [baseUrl]
// Conta as palavras visíveis no <main>, por seção, separando o texto explicativo
// (títulos, parágrafos e listas fora das demonstrações e do formulário) do texto das
// interfaces demonstrativas, botões e campos. Salva JSON e capturas em JPEG.
const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const [label = 'atual', outDir = 'docs/redesign-v4', base = 'http://localhost:4173/'] = process.argv.slice(2);
const DEMO = '#automation-demo, #integration-lab, #team-experience, .tech-gallery-stage, .app-window, dialog';
const CONTROL = 'button, a, summary, label, select, option, input, textarea';

async function audit(page) {
  return page.evaluate(({ DEMO, CONTROL }) => {
    const words = text => (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%$-]*/gu) || []).length;
    const sections = {};
    const totals = { visible: 0, explanatory: 0, demo: 0, controls: 0, form: 0 };
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || parent.closest('template, noscript, script, style')) continue;
      if (!parent.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const count = words(node.textContent);
      if (!count) continue;
      const section = parent.closest('main > section, main > dialog')?.id || 'outros';
      const bucket = (sections[section] ||= { visible: 0, explanatory: 0, demo: 0, controls: 0, form: 0 });
      const kind = parent.closest(DEMO) ? 'demo' : parent.closest('form') ? 'form' : parent.closest(CONTROL) ? 'controls' : 'explanatory';
      for (const target of [bucket, totals]) { target.visible += count; target[kind] += count; }
    }
    const order = [...document.querySelectorAll('main > section')].map(s => ({
      id: s.id,
      heading: s.querySelector('h1, h2')?.textContent.replace(/\s+/g, ' ').trim() || '',
      height: Math.round(s.getBoundingClientRect().height),
    }));
    return { totals, sections, order, pageHeight: document.documentElement.scrollHeight };
  }, { DEMO, CONTROL });
}

(async () => {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const result = { label, base, date: new Date().toISOString(), viewports: {} };
  for (const [name, viewport, isMobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
    const ctx = await browser.newContext({ viewport, isMobile, hasTouch: isMobile, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('luminor-analytics-consent', 'rejected'); } catch {} });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    result.viewports[name] = await audit(page);
    await page.screenshot({ path: join(outDir, `${label}-${name}-hero.jpg`), type: 'jpeg', quality: 72 });
    await page.screenshot({ path: join(outDir, `${label}-${name}-completa.jpg`), type: 'jpeg', quality: 60, fullPage: true });
    await ctx.close();
  }
  await browser.close();
  writeFileSync(join(outDir, `${label}-texto.json`), JSON.stringify(result, null, 2));
  const d = result.viewports.desktop;
  console.log(JSON.stringify({ totals: d.totals, pageHeight: d.pageHeight, mobileHeight: result.viewports.mobile.pageHeight }, null, 1));
  for (const [id, s] of Object.entries(d.sections)) console.log(id.padEnd(18), JSON.stringify(s));
})();
