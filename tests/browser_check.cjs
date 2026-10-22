/** Offline QA. Requires Playwright; CHROMIUM_PATH optionally selects a local browser. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { readFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const root = resolve(__dirname, '..');
  const html = readFileSync(resolve(root, 'PREVIA_AUTONOMA.html'), 'utf8');
  assert(!html.includes('id="lab-content"'));
  mkdirSync(resolve(root, 'screenshots'), { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const errors = [];
  try {
    for (const width of [320, 375, 390, 768, 900, 1024, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(resolve(root, 'PREVIA_AUTONOMA.html')).href);
      await page.locator('#cookies-reject').click();
      assert(await page.locator('#cookie-banner').isHidden());
      assert.equal(await page.locator('h1').innerText(), 'Entendemos seu processo.\nCriamos a solução.\nAutomatizamos sua rotina.');
      assert.equal(await page.locator('.process-flow li').count(), 4);
      assert.equal(await page.locator('.method-grid article').count(), 4);
      assert.equal(await page.locator('.example-card').count(), 3);
      assert.equal(await page.locator('#automation-demo').getAttribute('data-playing'), 'false', 'Reduced motion disables automatic playback');
      const checkLayout=async()=>{
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        const result=await page.locator('#scenario-outcome').evaluate(el=>({content:el.scrollHeight,available:el.clientHeight}));
        assert(result.content<=result.available+1,`Result content clipped at ${width}px: ${JSON.stringify(result)}`);
      };
      await page.locator('[data-demo-step="3"]').click();
      assert.equal(await page.locator('.dashboard-kpis strong').first().innerText(),'40');
      await page.locator('[data-period="mes"]').click();
      assert.equal(await page.locator('.dashboard-kpis strong').first().innerText(),'172');
      await checkLayout();
      if(width===390||width===1440) await page.locator('#automation-demo').screenshot({path:resolve(root,`screenshots/Luminor_Ganhos_Planilhas_${width}.png`)});
      await page.locator('[data-demo-scenario="documentos"]').click();
      assert.equal(await page.locator('#automation-demo').getAttribute('data-step'),'0');
      assert(await page.locator('#scenario-outcome').isHidden());
      await page.locator('[data-demo-step="3"]').click();
      assert.equal(await page.locator('.document-column').count(),3);
      assert.equal(await page.locator('.document-card').count(),5);
      await page.locator('[data-document="nf209"]').focus();
      await page.keyboard.press('Enter');
      assert((await page.locator('#document-detail').innerText()).includes('Empresa C'));
      assert(await page.locator('[data-document="nf209"]').evaluate(el=>el===document.activeElement));
      await checkLayout();
      if(width===390||width===1440) await page.locator('#automation-demo').screenshot({path:resolve(root,`screenshots/Luminor_Ganhos_Documentos_${width}.png`)});
      await page.locator('[data-demo-scenario="atendimento"]').click();
      await page.locator('[data-demo-step="3"]').click();
      assert.equal(await page.locator('.ticket-row').count(),4);
      for(const [status,count] of [['pendentes',2],['andamento',1],['resolvidos',1],['todos',4]]){
        await page.locator(`[data-ticket-filter="${status}"]`).click();
        assert.equal(await page.locator('.ticket-row').count(),count);
      }
      await checkLayout();
      if(width===390||width===1440) await page.locator('#automation-demo').screenshot({path:resolve(root,`screenshots/Luminor_Ganhos_Atendimento_${width}.png`)});
      await page.locator('[data-demo-scenario="documentos"]').click();
      await page.locator('[data-demo-step="3"]').click();
      assert.equal(await page.locator('.document-card[aria-pressed="true"]').count(),0);
      await page.locator('[data-demo-scenario="atendimento"]').click();
      await page.locator('[data-demo-step="3"]').click();
      assert.equal(await page.locator('[data-ticket-filter="todos"]').getAttribute('aria-pressed'),'true');
      await page.locator('[data-demo-scenario="planilhas"]').click();
      await page.locator('[data-demo-step="3"]').click();
      assert.equal(await page.locator('[data-period="semana"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('.team-person').count(),5);
      assert.equal(await page.locator('#team-experience').getAttribute('data-playing'),'false');
      for(const phase of ['before','after']){
        await page.locator(`[data-team-state="${phase}"]`).click();
        assert.equal(await page.locator('#team-experience').getAttribute('data-phase'),phase);
        if(width===390||width===1440) await page.locator('#team-experience').screenshot({path:resolve(root,`screenshots/Luminor_Equipe_${phase}_${width}.png`)});
      }
      await page.locator('#team-play').click();
      assert.equal(await page.locator('#team-experience').getAttribute('data-phase'),'after');
      const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
      assert.deepEqual(brokenAnchors, []);
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto', 'Reduced motion disables smooth anchor scrolling');
      const checkAnchorHeading = async id => {
        const position = await page.evaluate(id => {
          const section = document.getElementById(id);
          const heading = section.querySelector('.overline, .eyebrow');
          return { top: heading.getBoundingClientRect().top, headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom };
        }, id);
        const gap = position.top - position.headerBottom;
        assert(gap >= -1, `Anchor content hidden behind header at ${id}/${width}px: ${JSON.stringify(position)}`);
        assert(gap <= (width > 900 ? 80 : 55), `Anchor spacing too large at ${id}/${width}px: ${JSON.stringify(position)}`);
      };
      await page.locator('.skip-link').focus();
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#main');
      await checkAnchorHeading('main');
      await page.locator('.site-header .brand').click();
      await checkAnchorHeading('inicio');
      for (const id of ['solucoes', 'metodo', 'processos', 'simulador', 'faq', 'contato']) {
        await page.evaluate(id => { location.hash = id; }, id);
        await checkAnchorHeading(id);
      }
      const overflowing = await page.locator('body *').evaluateAll(elements => elements.filter(el => {
        const r = el.getBoundingClientRect();
        return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('[aria-hidden="true"]');
      }).map(el => el.className));
      assert.deepEqual(overflowing, [], `Overflow at ${width}px`);
      if (width === 390) {
        for (const id of ['solucoes', 'metodo', 'processos', 'simulador', 'faq', 'contato']) {
          await page.locator('#menu-btn').focus();
          await page.keyboard.press('Enter');
          assert.equal(await page.locator('#menu-btn').getAttribute('aria-expanded'), 'true');
          await page.locator(`#nav a[href="#${id}"]`).click();
          assert.equal(await page.locator('#menu-btn').getAttribute('aria-expanded'), 'false');
          await checkAnchorHeading(id);
        }
        await page.locator('#menu-btn').click();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#menu-btn').getAttribute('aria-expanded'), 'false');
        assert(await page.locator('#menu-btn').evaluate(el => el === document.activeElement));
      }
      if (width === 1440) {
        for (const link of await page.locator('.site-footer nav a[href^="#"]').all()) {
          await link.scrollIntoViewIfNeeded();
          const id = (await link.getAttribute('href')).slice(1);
          await link.click();
          await checkAnchorHeading(id);
        }
        for (const button of await page.locator('.solution-cta').all()) {
          await button.click();
          assert.equal(await page.locator('#lead-interest').inputValue(), await button.getAttribute('data-solution'));
          await checkAnchorHeading('contato');
        }
        for (const link of await page.locator('[data-interest]').all()) {
          await link.click();
          assert.equal(await page.locator('#lead-interest').inputValue(), await link.getAttribute('data-interest'));
        }
        const description='A equipe consolida planilhas toda semana.';
        await page.locator('#lead-problem').fill(description);
        await page.locator('.team-bottom [data-interest]').click();
        assert.equal(await page.locator('#lead-interest').inputValue(),'Automação de processos internos');
        assert.equal(await page.locator('#lead-problem').inputValue(),description);
        await page.locator('#submit-lead').click();
        assert((await page.locator('#form-status').innerText()).includes('Informe seu nome'));
        await page.locator('.faq-items summary').first().focus();
        await page.keyboard.press('Enter');
        assert(await page.locator('.faq-items details').first().evaluate(el => el.open));
      }
      if (width === 390 || width === 1440) {
        await page.locator('#automation-demo').screenshot({ path: resolve(root, 'screenshots', `Luminor_Automacao_${width}.png`) });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: resolve(root, 'screenshots', width === 390 ? 'Luminor_Mobile.png' : 'Luminor_Desktop.png'), fullPage: true });
      }
      console.log(`${width}px: conteúdo, âncoras e layout OK`);
      await page.close();
    }
    const animated = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'no-preference' });
    animated.on('pageerror', error => errors.push(error.message));
    await animated.goto(pathToFileURL(resolve(root, 'PREVIA_AUTONOMA.html')).href);
    await animated.locator('#cookies-reject').click();
    await animated.locator('#automation-demo').scrollIntoViewIfNeeded();
    await animated.waitForSelector('#automation-demo[data-step="1"][data-playing="true"]');
    // Set an explicit stage before testing pause, independent of the auto-intro timing.
    await animated.locator('[data-demo-step="1"]').click();
    await animated.locator('#demo-play').click();
    await animated.locator('#demo-play').click();
    await animated.waitForTimeout(2100);
    assert.equal(await animated.locator('#automation-demo').getAttribute('data-step'), '1', 'Pause keeps the selected stage');
    await animated.locator('[data-demo-step="2"]').click();
    await animated.locator('#demo-play').click();
    assert.equal(await animated.locator('.flow-connector i').first().evaluate(el => getComputedStyle(el).animationName), 'data-packet');
    const initial = await animated.locator('.flow-connector i').first().evaluate(el => el.getBoundingClientRect().left);
    await animated.waitForTimeout(200);
    const advanced = await animated.locator('.flow-connector i').first().evaluate(el => el.getBoundingClientRect().left);
    assert.notEqual(initial, advanced, 'Data moves along the automated flow');
    await animated.waitForSelector('#automation-demo[data-step="3"][data-playing="false"]');
    assert(await animated.locator('.dashboard-kpis').isVisible());
    await animated.locator('#automation-demo').screenshot({ path: resolve(root, 'screenshots/Luminor_Automacao_Animada.png') });
    await animated.locator('#demo-play').click();
    assert.equal(await animated.locator('#automation-demo').getAttribute('data-step'), '0', 'Replay starts at the spreadsheet');
    await animated.emulateMedia({ reducedMotion: 'reduce' });
    await animated.waitForSelector('#automation-demo[data-playing="false"]');
    await animated.emulateMedia({reducedMotion:'no-preference'});
    await animated.locator('#team-experience').scrollIntoViewIfNeeded();
    await animated.waitForSelector('#team-experience[data-phase="before"][data-playing="true"]');
    const start=await animated.locator('.person-1').evaluate(el=>getComputedStyle(el).transform);
    await animated.waitForTimeout(250);
    assert.notEqual(start,await animated.locator('.person-1').evaluate(el=>getComputedStyle(el).transform));
    await animated.locator('#team-play').click();
    const paused=await animated.locator('.person-1').evaluate(el=>getComputedStyle(el).transform);
    await animated.waitForTimeout(300);
    assert.equal(paused,await animated.locator('.person-1').evaluate(el=>getComputedStyle(el).transform));
    await animated.locator('#team-play').click();
    await animated.waitForSelector('#team-experience[data-phase="transition"]');
    await animated.waitForSelector('#team-experience[data-phase="after"][data-playing="false"]');
    await animated.locator('#team-play').click();
    assert.equal(await animated.locator('#team-experience').getAttribute('data-phase'),'before');
    await animated.locator('h1').scrollIntoViewIfNeeded();
    await animated.waitForSelector('#team-experience[data-playing="false"]');
    await animated.locator('#team-experience').scrollIntoViewIfNeeded();
    assert.equal(await animated.locator('#team-experience').getAttribute('data-playing'),'false','No automatic replay');
    await animated.locator('#team-play').click();
    await animated.emulateMedia({reducedMotion:'reduce'});
    await animated.waitForSelector('#team-experience[data-playing="false"]');
    await animated.close();
    assert.deepEqual(errors, []);
    console.log('Menu, teclado, serviços, CTA da equipe e validação: OK');
    console.log('Dashboard, canvas, tickets, filtros, resets e equipe animada: reprodução, pausa, replay, saída de viewport e movimento reduzido OK');
  } catch(error){ console.error(error); process.exitCode=1; } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
