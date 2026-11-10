import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { GALLERY_TABS, nextTab } from '../public/assets/js/experiences/gallery.js';
import { runnerFrames, runnerIdle } from '../public/assets/js/experiences/process-runner.js';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const main = html.slice(html.indexOf('<main'), html.indexOf('</main>')).replace(/<template[\s\S]*?<\/template>/g, '');

test('homepage V4: seções na ordem do plano e links internos válidos', () => {
  const ids = [...main.matchAll(/<section id="([\w-]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['inicio', 'solucoes', 'demonstracoes', 'metodo', 'faq', 'contato']);
  const anchors = new Set([...html.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
  for (const [, hash] of html.matchAll(/href="#([\w-]+)"/g)) assert(anchors.has(hash), `#${hash}`);
  assert.doesNotMatch(main, /pequenos negócios/i);
});

test('homepage V4: capturas das demonstrações com dimensões, alt e carregamento tardio', () => {
  const images = [...main.matchAll(/<img [^>]*src="\/assets\/img\/demos\/[^>]+>/g)].map(m => m[0]);
  assert.equal(images.length, 4);
  for (const img of images) {
    assert.match(img, /width="480" height="300"/);
    assert.match(img, /loading="lazy"/);
    assert.match(img, /alt="Captura da demonstração[^"]+fictíci/);
    for (const [, path] of img.matchAll(/\/assets\/img\/demos\/([\w-]+\.webp)/g)) {
      const size = statSync(new URL(`../public/assets/img/demos/${path}`, import.meta.url)).size;
      assert(size < 60000, `${path}: ${size} B`);
    }
  }
});

test('demonstrações: eventos e parâmetros dentro da allowlist do Analytics', () => {
  const analytics = readFileSync(new URL('../public/assets/js/analytics.js', import.meta.url), 'utf8');
  const list = pattern => new Set(analytics.match(pattern)[1].match(/'[\w]+'/g).map(s => s.slice(1, -1)));
  const allowed = list(/const allowed = new Set\(\[([^\]]+)\]/);
  const keys = list(/for \(const key of \[([^\]]+)\]/);
  let calls = 0;
  for (const file of ['automation-flow.js', 'dashboard.js', 'integrations.js', 'gallery.js', 'process-runner.js']) {
    const source = readFileSync(new URL(`../public/assets/js/experiences/${file}`, import.meta.url), 'utf8');
    for (const [, name, params = ''] of source.matchAll(/track\('(\w+)'(?:,\s*\{([^}]*)\})?/g)) {
      calls++;
      assert(allowed.has(name), `${file}: ${name}`);
      for (const [, key] of params.matchAll(/(\w+)\s*:/g)) assert(keys.has(key), `${file}: ${name}.${key}`);
      for (const [, key] of params.matchAll(/(?:^|,)\s*(\w+)\s*(?=,|$)/g)) assert(keys.has(key), `${file}: ${name}.${key}`);
    }
  }
  assert(calls >= 10, `track calls found: ${calls}`);
});

test('galeria: navegação por teclado entre as abas', () => {
  assert.deepEqual(GALLERY_TABS, ['automacao', 'gestao', 'integracao']);
  assert.equal(nextTab('automacao', 'ArrowRight'), 'gestao');
  assert.equal(nextTab('automacao', 'ArrowLeft'), 'integracao');
  assert.equal(nextTab('integracao', 'ArrowRight'), 'automacao');
  assert.equal(nextTab('gestao', 'Home'), 'automacao');
  assert.equal(nextTab('gestao', 'End'), 'integracao');
  assert.equal(nextTab('gestao', 'Enter'), null);
});

test('automação da galeria: quadros determinísticos e coerentes com o HTML', () => {
  const frames = runnerFrames(5, new Set([3]));
  assert.equal(frames.length, 10);
  assert.deepEqual(runnerIdle(2), { current: -1, phase: 'idle', items: ['waiting', 'waiting'], rows: ['empty', 'empty'], done: 0, review: 0 });
  assert.deepEqual(frames[0].items, ['processing', 'waiting', 'waiting', 'waiting', 'waiting']);
  const last = frames.at(-1);
  assert.equal(last.phase, 'finished');
  assert.deepEqual(last.rows, ['done', 'done', 'done', 'review', 'done']);
  assert.equal(last.done, 4);
  assert.equal(last.review, 1);
  for (const frame of frames) assert.equal(frame.items.filter(s => s === 'processing').length, frame.phase === 'processing' ? 1 : 0);
  const runner = main.slice(main.indexOf('id="process-runner"'), main.indexOf('id="runner-status"'));
  assert.equal((runner.match(/data-runner-item="/g) || []).length, 5);
  assert.equal((runner.match(/data-runner-row="/g) || []).length, 5);
  assert.equal((runner.match(/data-review="/g) || []).length, 1);
  assert.match(runner, /data-runner-item="3"[^>]*data-review=/);
  assert.match(runner, /data-runner-row="3"[^>]*data-kind="review"/);
});
