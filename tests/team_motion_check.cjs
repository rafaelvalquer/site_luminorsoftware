/** Verify movement continuity, visible character size and focused work in the real browser. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'no-preference' });
    await page.goto(pathToFileURL(resolve(__dirname, '../PREVIA_AUTONOMA.html')).href);
    await page.locator('#cookies-reject').click();
    await page.locator('#team-experience').scrollIntoViewIfNeeded();
    await page.waitForSelector('#team-experience[data-phase="before"][data-playing="true"]');
    const result = await page.evaluate(() => new Promise(resolve => {
      const scene = document.querySelector('#team-experience');
      const people = [...scene.querySelectorAll('.team-person')];
      const position = el => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return [matrix.e, matrix.f];
      };
      let previous = people.map(position), previousPhase = 'before';
      function sample() {
        const phase = scene.dataset.phase, current = people.map(position);
        if (previousPhase === 'before' && phase === 'transition') {
          resolve(current.map((point, i) => Math.hypot(point[0] - previous[i][0], point[1] - previous[i][1])));
          return;
        }
        previous = current; previousPhase = phase;
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    }));
    assert(result.every(distance => distance < 35), `Characters must not snap back at transition: ${result}`);
    console.log('Deslocamento entre quadros na transição (px): ' + result.map(v => v.toFixed(2)).join(', '));
    await page.waitForSelector('#team-experience[data-phase="after"][data-playing="true"]');
    const working = await page.locator('.person-1 .person-arm').first().evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(170);
    assert.notEqual(working, await page.locator('.person-1 .person-arm').first().evaluate(el => getComputedStyle(el).transform), 'Hands keep typing in focused work phase');
    assert(await page.locator('.person-1 .person-scale').evaluate(el => el.getBoundingClientRect().height > 130));
    assert.equal(await page.locator('.work-screen').count(), 5);
    const inside = await page.locator('.team-illustration').evaluate(svg => {
      const bounds = svg.getBoundingClientRect();
      return [...svg.querySelectorAll('.person-scale')].every(person => {
        const box = person.getBoundingClientRect();
        return box.top >= bounds.top && box.bottom <= bounds.bottom && box.left >= bounds.left && box.right <= bounds.right;
      });
    });
    assert(inside, 'Larger characters stay inside the scene');
    await page.waitForSelector('#team-experience[data-phase="after"][data-playing="false"]');
    console.log('Personagens maiores, sem saltos, trabalhando nos cinco computadores e sem cortes: OK');
    await page.close();
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
