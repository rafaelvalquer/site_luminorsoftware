import test from 'node:test';
import assert from 'node:assert/strict';
import { flowTransition, initialFlowState, FLOW_LAST_STEP, STEP_DURATIONS, AUTOMATION_PHASES } from '../public/assets/js/experiences/automation-flow.js';
import { createTimers } from '../public/assets/js/experiences/motion.js';
import { FLOW_SCENARIOS } from '../public/assets/js/experiences/scenarios.js';

const run = (state, ...actions) => actions.reduce(flowTransition, state);

test('fluxo: estado inicial respeita movimento reduzido', () => {
  assert.deepEqual(initialFlowState(), { status: 'idle', step: 0 });
  assert.deepEqual(initialFlowState(true), { status: 'reduced-motion', step: 0 });
});

test('fluxo: reprodução percorre as quatro etapas e termina em completed', () => {
  let state = run(initialFlowState(), { type: 'play' });
  assert.deepEqual(state, { status: 'running', step: 0 });
  state = run(state, { type: 'tick' }, { type: 'tick' });
  assert.deepEqual(state, { status: 'running', step: 2 });
  state = run(state, { type: 'tick' });
  assert.deepEqual(state, { status: 'completed', step: FLOW_LAST_STEP });
  assert.equal(run(state, { type: 'tick' }), state, 'tick fora da reprodução não muda nada');
  assert.deepEqual(run(state, { type: 'play' }), { status: 'running', step: 0 }, 'rever recomeça do problema');
});

test('fluxo: pausa mantém a etapa e só vale durante a reprodução', () => {
  const running = run(initialFlowState(), { type: 'goto', step: 1 }, { type: 'play' });
  assert.deepEqual(running, { status: 'running', step: 1 });
  const paused = flowTransition(running, { type: 'pause' });
  assert.deepEqual(paused, { status: 'paused', step: 1 });
  assert.equal(flowTransition(paused, { type: 'pause' }), paused);
  assert.equal(flowTransition(running, { type: 'play' }), running, 'play durante a reprodução é ignorado');
});

test('fluxo: navegação direta, reinício e troca de cenário', () => {
  assert.deepEqual(run(initialFlowState(), { type: 'goto', step: 3 }), { status: 'completed', step: 3 });
  assert.deepEqual(run(initialFlowState(), { type: 'goto', step: 0 }), { status: 'idle', step: 0 });
  assert.deepEqual(run(initialFlowState(), { type: 'goto', step: 9 }), { status: 'completed', step: 3 }, 'etapa limitada a 0–3');
  assert.deepEqual(run(initialFlowState(), { type: 'goto', step: 'x' }), { status: 'idle', step: 0 });
  assert.deepEqual(run(initialFlowState(), { type: 'goto', step: 2 }, { type: 'restart' }), { status: 'running', step: 0 });
  assert.deepEqual(run(initialFlowState(), { type: 'play' }, { type: 'tick' }, { type: 'select' }), { status: 'idle', step: 0 }, 'trocar de cenário interrompe a sequência');
});

test('fluxo: movimento reduzido disponibiliza as etapas sem reprodução automática', () => {
  const reduced = initialFlowState(true);
  assert.deepEqual(flowTransition(reduced, { type: 'play' }), { status: 'reduced-motion', step: 3 });
  assert.deepEqual(flowTransition(reduced, { type: 'restart' }), { status: 'reduced-motion', step: 0 });
  assert.deepEqual(flowTransition(reduced, { type: 'goto', step: 2 }), { status: 'reduced-motion', step: 2 });
  const running = run(initialFlowState(), { type: 'play' }, { type: 'tick' });
  assert.deepEqual(flowTransition(running, { type: 'motion', reduced: true }), { status: 'reduced-motion', step: 1 }, 'preferência ligada no meio da reprodução para tudo');
  assert.deepEqual(run(reduced, { type: 'goto', step: 3 }, { type: 'motion', reduced: false }), { status: 'completed', step: 3 });
});

test('fluxo: cada cenário descreve as quatro etapas', () => {
  for (const [name, scenario] of Object.entries(FLOW_SCENARIOS)) {
    assert.equal(scenario.captions.length, 3, name);
    assert.ok(scenario.gain, name);
    assert.equal(scenario.analysis.tasks.length, 3, name);
    assert.ok(scenario.analysis.from && scenario.analysis.to, name);
    assert.ok(scenario.records.length > 0, name);
  }
  assert.equal(STEP_DURATIONS.length, FLOW_LAST_STEP);
  assert.ok(AUTOMATION_PHASES.at(-1)[1] < STEP_DURATIONS[2], 'as fases da automação terminam antes da próxima etapa');
});

test('temporizadores: sequência nova cancela a anterior e clear não deixa nada ativo', async () => {
  const timers = createTimers();
  const calls = [];
  timers.sequence([[5, () => calls.push('a1')], [5, () => calls.push('a2')]]);
  assert.equal(timers.pending(), 2);
  timers.sequence([[5, () => calls.push('b1')]]);
  assert.equal(timers.pending(), 1);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.deepEqual(calls, ['b1']);
  assert.equal(timers.pending(), 0, 'temporizador executado sai da lista');
  timers.after(5, () => calls.push('c'));
  timers.clear();
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.deepEqual(calls, ['b1']);
  assert.equal(timers.pending(), 0);
});
