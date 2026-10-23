/** Light theme QA: isolated local responses; no leads or telemetry are sent. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve, extname } = require('node:path');
const root = resolve(__dirname, '..');

async function checkContrast(page, state) {
  const failures = await page.evaluate(() => {
    const parse = color => (color.match(/[\d.]+/g) || []).map(Number);
    const luminance = rgb => rgb.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const background = element => {
      const layers = [];
      for (let parent = element; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        const c = parse(style.backgroundColor);
        if (c.length >= 3 && (c[3] ?? 1) > 0) layers.push(c);
        // The hero/contact gradient's darkest stop is a conservative text background.
        if (style.backgroundImage.includes('linear-gradient')) layers.push([238, 244, 255, 1]);
      }
      return layers.reverse().reduce((under, over) => over.slice(0, 3).map((v, i) => v * (over[3] ?? 1) + under[i] * (1 - (over[3] ?? 1))), [255, 255, 255]);
    };
    return [...document.body.querySelectorAll('*')].flatMap(el => {
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return [];
      if (el.closest('svg,script,style,[hidden],.honeypot')) return [];
      let text = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim();
      if (el.matches('input:not([type=range]):not([type=checkbox]),textarea')) text = el.value || el.getAttribute('placeholder') || '';
      if (!text) return [];
      const style = getComputedStyle(el);
      const fg = parse(el.matches('input,textarea') && !el.value && el.getAttribute('placeholder') ? getComputedStyle(el, '::placeholder').color : style.color);
      const bg = background(el), a = luminance(fg), b = luminance(bg);
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      return ratio < 4.5 ? [{ text: text.slice(0, 65), ratio: ratio.toFixed(2), color: style.color, bg, selector: el.id || el.className }] : [];
    });
  });
  assert.deepEqual(failures, [], `Text contrast below 4.5:1 (${state})`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      let apiLeadCalls = 0;
      await page.route('http://luminor.test/**', route => {
        const path = new URL(route.request().url()).pathname;
        if (path === '/api/leads') { apiLeadCalls++; return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"API não configurada"}' }); }
        const file = resolve(root, 'public', path === '/' ? 'index.html' : '.' + path);
        const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml' };
        return route.fulfill({ contentType: types[extname(file)] || 'text/plain', body: readFileSync(file) });
      });
      await page.goto('http://luminor.test/');
      await checkContrast(page, `cookie banner ${width}`);
      await page.locator('#cookies-reject').click();
      assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).colorScheme), 'light');
      for (const step of [0, 1, 2, 3]) {
        await page.locator(`[data-demo-step="${step}"]`).click();
        await checkContrast(page, `animation step ${step}, ${width}`);
        if (width === 1440) await page.locator('#automation-demo').screenshot({ path: resolve(root, `screenshots/Luminor_Claro_Etapa_${step}.png`) });
      }
      for(const scenario of ['planilhas','documentos','atendimento']){
        await page.locator(`[data-demo-scenario="${scenario}"]`).click();
        await page.locator('[data-demo-step="3"]').click();
        if(scenario==='documentos') await page.locator('[data-document="nf208"]').click();
        await checkContrast(page,`Result ${scenario}, ${width}`);
      }
      for(const phase of ['before','after']){
        await page.locator(`[data-team-state="${phase}"]`).click();
        await checkContrast(page,`Team ${phase}, ${width}`);
      }
      await page.locator('.faq-items summary').first().click();
      await checkContrast(page, `FAQ ${width}`);
      if (width === 390) {
        await page.locator('#menu-btn').click();
        await checkContrast(page, 'mobile navigation');
        await page.keyboard.press('Escape');
      }
      await page.locator('#submit-lead').click();
      await checkContrast(page, `validation error ${width}`);
      await page.locator('#lead-name').fill('Pessoa Teste');
      await page.locator('#lead-company').fill('Empresa Teste');
      await page.locator('#lead-phone').fill('11999999999');
      await page.locator('#lead-problem').fill('Consolidar as planilhas da equipe toda semana.');
      await page.locator('#lead-consent').check();
      await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href^="https://wa.me/"]'))e.preventDefault()},true));
      await page.locator('#submit-lead').click();
      await page.waitForFunction(() => document.querySelector('#form-status').textContent.includes('só será enviada quando você revisar e confirmar no WhatsApp'));
      assert.match(await page.locator('#form-status a').getAttribute('href'),/^https:\/\/wa\.me\//);
      assert.equal(apiLeadCalls,0,'Static form does not post to the local leads API');
      assert.equal(await page.locator('#form-status').evaluate(el=>el.textContent.includes('lead enviado')),false,'WhatsApp opening is not treated as a confirmed lead');
      await checkContrast(page, `WhatsApp prepared ${width}`);
      await page.locator('#contato').screenshot({ path: resolve(root, `screenshots/Luminor_Claro_Formulario_${width}.png`) });
      await page.keyboard.press('Tab');
      await page.locator('#demo-play').focus();
      assert.equal(await page.locator('#demo-play').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
      for (const path of ['privacidade.html', '404.html']) {
        await page.goto(`http://luminor.test/${path}`);
        await checkContrast(page, `${path}, ${width}`);
        await page.screenshot({ path: resolve(root, `screenshots/Luminor_Claro_${path.replace('.html', '')}_${width}.png`), fullPage: true });
      }
      await page.close();
      console.log(`${width}px: tema claro, contraste >= 4.5:1, animação, formulário, FAQ, foco e páginas auxiliares OK`);
    }
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
