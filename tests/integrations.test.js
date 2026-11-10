import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  INTEGRATION_EXAMPLES, NODE_STATES, RECORD_STATES, FRAME_DURATIONS, getExample, idleFrame, simulationFrames,
} from '../public/assets/js/experiences/integrations.js';

const examples = Object.entries(INTEGRATION_EXAMPLES);
const FIELDS = ['icon', 'name', 'role', 'function', 'receives', 'transforms', 'sends', 'validates', 'step'];

test('integrações: exemplos completos, com a automação no meio e um destino que pode falhar', () => {
  assert.deepEqual(Object.keys(INTEGRATION_EXAMPLES), ['financeiro', 'clientes', 'estoque', 'formulario', 'documentos']);
  assert.deepEqual(INTEGRATION_EXAMPLES.financeiro.nodes.map(node => node.name), ['Sistema de pedidos', 'Automação Luminor', 'Controle financeiro', 'Relatórios']);
  for (const [key, example] of examples) {
    assert(example.nodes.length >= 3, key);
    assert(typeof example.record === 'string' && example.record.length > 0, key);
    assert.deepEqual(example.nodes.map(node => Boolean(node.core)), example.nodes.map((_, i) => i === 1), `${key}: automação na segunda etapa`);
    assert.equal(example.nodes[example.failAt].role, 'Destino', `${key}: a falha simulada acontece no destino`);
    for (const node of example.nodes) for (const field of FIELDS) assert(typeof node[field] === 'string' && node[field].length > 0, `${key}.${node.name}.${field}`);
  }
  assert.equal(getExample('inexistente'), INTEGRATION_EXAMPLES.financeiro);
});

test('integrações: repouso deixa tudo aguardando', () => {
  for (const [, example] of examples) {
    const frame = idleFrame(example);
    assert(frame.nodes.every(state => state === 'waiting'));
    assert(frame.links.every(state => state === 'idle'));
    assert.equal(frame.links.length, example.nodes.length - 1);
    assert.equal(frame.status, 'waiting');
    assert.equal(frame.record, 'waiting');
  }
});

/** Regras comuns a qualquer sequência de quadros. */
function assertSequence(frames, label) {
  for (const [i, frame] of frames.entries()) {
    assert(frame.nodes.every(state => Object.hasOwn(NODE_STATES, state)), label);
    assert(Object.hasOwn(RECORD_STATES, frame.record), label);
    assert(frame.nodes.filter(state => state === 'processing').length <= 1, `${label}: um nó processando por vez`);
    assert(frame.links.filter(state => state === 'active').length <= 1, `${label}: uma ligação ativa por vez`);
    assert(typeof frame.message === 'string' && frame.message.length > 0, label);
    const last = i === frames.length - 1;
    assert.equal(frame.duration === 0, last, `${label}: só o último quadro encerra a sequência`);
    assert(last || [FRAME_DURATIONS.transfer, FRAME_DURATIONS.process].includes(frame.duration), label);
  }
}

test('integrações: simulação de sucesso percorre todos os nós e entrega o registro', () => {
  for (const [key, example] of examples) {
    const frames = simulationFrames(example, 'success');
    assertSequence(frames, key);
    assert.equal(frames.length, example.nodes.length * 2, `${key}: envio e processamento por etapa, mais a conclusão`);
    const last = frames.at(-1);
    assert.equal(last.status, 'success');
    assert.equal(last.record, 'delivered');
    assert(last.nodes.every(state => state === 'success'));
    assert(last.links.every(state => state === 'done'));
    assert(frames.slice(0, -1).every(frame => frame.status === 'processing'));
  }
});

test('integrações: falha simulada mantém o registro pendente no destino', () => {
  for (const [key, example] of examples) {
    const frames = simulationFrames(example, 'failure');
    assertSequence(frames, key);
    const last = frames.at(-1);
    assert.equal(last.status, 'simulated-error');
    assert.equal(last.record, 'pending');
    assert.equal(last.nodes[example.failAt], 'error');
    assert(last.nodes.slice(0, example.failAt).every(state => state === 'success'), `${key}: etapas anteriores concluídas`);
    assert(last.nodes.slice(example.failAt + 1).every(state => state === 'waiting'), `${key}: nada segue adiante`);
    assert.equal(last.links[example.failAt - 1], 'blocked');
    assert.equal(frames.filter(frame => frame.status === 'simulated-error').length, 1);
  }
});

test('integrações: nova tentativa parte da falha e conclui a entrega', () => {
  for (const [key, example] of examples) {
    const frames = simulationFrames(example, 'retry');
    assertSequence(frames, key);
    assert(frames[0].nodes.slice(0, example.failAt).every(state => state === 'success'), `${key}: não repete o que já foi feito`);
    assert.equal(frames[0].links[example.failAt - 1], 'active');
    assert.match(frames[0].message, /^Nova tentativa/);
    assert.equal(frames.at(-1).status, 'success');
    assert.equal(frames.at(-1).record, 'delivered');
  }
});

test('experiências: sem rede, sem código dinâmico e sem HTML montado com texto', () => {
  const dir = new URL('../public/assets/js/experiences/', import.meta.url);
  for (const file of readdirSync(dir)) {
    const source = readFileSync(new URL(file, dir), 'utf8');
    for (const pattern of [/\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /sendBeacon/, /\beval\s*\(/, /new Function/, /innerHTML/, /insertAdjacentHTML/, /document\.write/]) {
      assert(!pattern.test(source), `${file}: ${pattern}`);
    }
  }
});

test('integrações: o HTML sem JavaScript mostra o mesmo exemplo principal', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const start = html.indexOf('<div class="gallery-panel" id="integracoes-lab"');
  const end = html.indexOf('<section id="metodo"', start);
  assert(start > 0 && end > start, 'painel de integração na galeria de demonstrações');
  const section = html.slice(start, end);
  assert(start > html.indexOf('id="demonstracoes"') && start > html.indexOf('id="solucoes"'), 'dentro da galeria, depois das soluções');
  assert(section.includes('role="tabpanel"') && section.includes('aria-labelledby="tab-integracao"'));
  assert(section.includes('Selecione uma etapa para ver o que ela recebe, transforma e envia.'));
  const { nodes, record } = INTEGRATION_EXAMPLES.financeiro;
  for (const node of nodes) {
    for (const field of ['name', 'role', 'function', 'step']) assert(section.includes(`>${node[field]}<`), `${node.name}.${field}`);
    assert(section.includes(`href="#i-${node.icon}"`), node.icon);
  }
  for (const field of ['receives', 'transforms', 'sends', 'validates']) assert(section.includes(`<dd>${nodes[1][field]}</dd>`), field);
  assert(section.includes(`>${record}<`));
  assert(section.includes('Simulação educativa'));
});
