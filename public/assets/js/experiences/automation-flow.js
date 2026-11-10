// Experiência 01 — fluxo de automação (#automation-demo): problema, análise, automação e resultado.
import { FLOW_SCENARIOS } from './scenarios.js';
import { $, $$, el, icon } from './dom.js';
import { createTimers, createLifecycle, reducedMotionQuery } from './motion.js';

export const FLOW_LAST_STEP = 3;
/** Quanto tempo cada etapa fica na tela durante a reprodução (ms). */
export const STEP_DURATIONS = [2000, 2400, 3000];
/** Fases internas da etapa de automação: origem, regras, destino e concluído. */
export const AUTOMATION_PHASES = [['source', 0], ['rules', 650], ['target', 1500], ['done', 2150]];

const restingStatus = step => (step === 0 ? 'idle' : step === FLOW_LAST_STEP ? 'completed' : 'paused');

/** Estado inicial da máquina: idle, ou reduced-motion quando a pessoa pediu menos movimento. */
export function initialFlowState(reduced = false) {
  return { status: reduced ? 'reduced-motion' : 'idle', step: 0 };
}

/**
 * Máquina de estados do fluxo (pura e testável).
 * Estados: idle, running, paused, completed e reduced-motion; etapa sempre entre 0 e 3.
 */
export function flowTransition(state, action) {
  const reduced = state.status === 'reduced-motion';
  switch (action.type) {
    case 'play':
      if (reduced) return { status: 'reduced-motion', step: FLOW_LAST_STEP };
      if (state.status === 'running') return state;
      return { status: 'running', step: state.step === FLOW_LAST_STEP ? 0 : state.step };
    case 'pause':
      return state.status === 'running' ? { status: 'paused', step: state.step } : state;
    case 'tick':
      if (state.status !== 'running') return state;
      return state.step + 1 >= FLOW_LAST_STEP ? { status: 'completed', step: FLOW_LAST_STEP } : { status: 'running', step: state.step + 1 };
    case 'goto': {
      const step = Math.max(0, Math.min(FLOW_LAST_STEP, Math.trunc(Number(action.step)) || 0));
      return { status: reduced ? 'reduced-motion' : restingStatus(step), step };
    }
    case 'restart':
      return { status: reduced ? 'reduced-motion' : 'running', step: 0 };
    case 'select':
      return { status: reduced ? 'reduced-motion' : 'idle', step: 0 };
    case 'motion':
      if (action.reduced) return { status: 'reduced-motion', step: state.step };
      return reduced ? { status: restingStatus(state.step), step: state.step } : state;
    default:
      return state;
  }
}

export function setupAutomationFlow(root, { outcome, track = () => {} }) {
  const life = createLifecycle();
  const timers = createTimers();
  const motion = reducedMotionQuery();
  const preview = $('.workflow-preview', root);
  let state = initialFlowState(Boolean(motion?.matches));
  let selected = 'planilhas';
  let touched = false;
  let userRun = false;

  const playing = () => state.status === 'running';

  function renderControls() {
    const { step } = state;
    root.dataset.state = state.status;
    root.dataset.playing = String(playing());
    $('#demo-play-label').textContent = playing() ? 'Pausar' : step === FLOW_LAST_STEP ? 'Rever transformação' : step === 0 ? 'Ver transformação' : 'Continuar';
    $('#demo-play').setAttribute('aria-label', playing() ? 'Pausar transformação' : step === FLOW_LAST_STEP ? 'Rever transformação' : step === 0 ? 'Reproduzir transformação' : 'Continuar transformação');
    $('#demo-play>span').textContent = playing() ? 'Ⅱ' : step === FLOW_LAST_STEP ? '↻' : '▶';
  }

  /** Mostra o estado final da etapa de automação (pausa, navegação manual ou movimento reduzido). */
  function settlePhase() {
    preview.dataset.phase = 'done';
    $$('#demo-records li', root).forEach(item => { item.dataset.state = 'done'; });
  }

  /** Percorre origem → regras → destino; os registros mudam de estado um a um. */
  function runAutomationPhases() {
    const records = $$('#demo-records li', root);
    records.forEach(item => { item.dataset.state = 'waiting'; });
    for (const [phase, at] of AUTOMATION_PHASES) {
      if (at === 0) preview.dataset.phase = phase;
      else timers.after(at, () => { preview.dataset.phase = phase; });
    }
    records.forEach((item, i) => timers.after(AUTOMATION_PHASES[1][1] + 200 + i * 230, () => { item.dataset.state = 'done'; }));
  }

  function render() {
    const { step } = state;
    root.dataset.step = String(step);
    // O resultado continua ocupando espaço (invisível e inerte) para que a área não mude de altura durante a reprodução.
    const outcomeRoot = $('#scenario-outcome');
    const reserved = step !== FLOW_LAST_STEP;
    outcomeRoot.hidden = false;
    outcomeRoot.toggleAttribute('data-reserved', reserved);
    outcomeRoot.inert = reserved;
    outcomeRoot.setAttribute('aria-hidden', String(reserved));
    $$('[data-demo-step]', root).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.demoStep) === step)));
    // Durante a reprodução a legenda muda em silêncio; leitores de tela ouvem só a navegação manual e o resultado final.
    const copy = $('#demo-stage-copy');
    copy.setAttribute('aria-live', playing() ? 'off' : 'polite');
    copy.textContent = step === FLOW_LAST_STEP ? FLOW_SCENARIOS[selected].gain : FLOW_SCENARIOS[selected].captions[step];
    if (step !== 2 || !playing()) settlePhase();
    renderControls();
  }

  /** Aplica uma ação: cancela a sequência anterior e, se estiver tocando, agenda a próxima etapa. */
  function dispatch(action) {
    const previous = state;
    state = flowTransition(state, action);
    if (state === previous) return;
    timers.clear();
    render();
    if (playing()) {
      if (state.step === 2) runAutomationPhases();
      timers.after(STEP_DURATIONS[state.step], () => dispatch({ type: 'tick' }));
    }
    if (previous.status === 'running' && state.status === 'completed' && userRun) {
      userRun = false;
      track('demo_flow_complete', { scenario: selected });
    }
  }

  function choose(name) {
    selected = name;
    root.dataset.scenario = name;
    const scenario = FLOW_SCENARIOS[name];
    $$('[data-demo-scenario]', root).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demoScenario === name)));
    $('#demo-source-name').textContent = scenario.file;
    $('#demo-node-source').textContent = scenario.source;
    $('#demo-node-rules').textContent = scenario.rules;
    $('#demo-node-result').textContent = scenario.result;
    $('#demo-result').textContent = scenario.message;
    $('#demo-analysis-from').textContent = scenario.analysis.from;
    $('#demo-analysis-to').textContent = scenario.analysis.to;
    $('#demo-analysis-tasks').replaceChildren(...scenario.analysis.tasks.map(task => el('li', { text: task })));
    $('#demo-records').replaceChildren(...scenario.records.map(record => el('li', { text: record, dataset: { state: 'done' } })));
    if (name === 'planilhas') {
      const cells = ['', 'A', 'B', 'C', '1', ...scenario.columns, ...scenario.rows.flatMap((row, i) => [String(i + 2), ...row])];
      $('.sheet-grid', root).replaceChildren(...cells.map((cell, i) => el('span', { class: i > 7 && i % 4 === 3 ? 'cell-wait' : false, text: cell })));
    }
    const loose = name === 'documentos'
      ? ['Notas fiscais', 'Contrato_final_v3.pdf', 'Recibos', 'Pedido de compra'].map((label, i) => el('div', { class: `loose-document loose-${i}` }, icon('layer'), el('strong', { text: label }), el('span', { text: 'Conferir e organizar' })))
      : name === 'atendimento'
        ? ['Olá! Cadê meu pedido?', 'Pode agendar uma visita?', 'Preciso de um orçamento.', 'Alguém já respondeu?'].map((label, i) => el('div', { class: `loose-message loose-${i}` }, icon('message'), el('span', { text: label })))
        : [];
    $('#manual-preview').replaceChildren(...loose);
    outcome.setScenario(name);
    dispatch({ type: 'select' });
  }

  function userPlayToggle() {
    touched = true;
    if (playing()) { dispatch({ type: 'pause' }); return; }
    userRun = state.status !== 'reduced-motion';
    if (userRun) track('demo_flow_start', { scenario: selected, action: 'play' });
    dispatch({ type: 'play' });
  }

  $$('[data-demo-scenario]', root).forEach(button => life.listen(button, 'click', () => {
    touched = true;
    userRun = false;
    choose(button.dataset.demoScenario);
    track('demo_scenario_select', { scenario: button.dataset.demoScenario, component: 'automation_flow' });
  }));
  $$('[data-demo-step]', root).forEach(button => life.listen(button, 'click', () => {
    touched = true;
    userRun = false;
    dispatch({ type: 'goto', step: button.dataset.demoStep });
  }));
  life.listen($('#demo-play'), 'click', userPlayToggle);
  life.listen($('#demo-restart'), 'click', () => {
    touched = true;
    userRun = state.status !== 'reduced-motion';
    if (userRun) track('demo_flow_start', { scenario: selected, action: 'restart' });
    dispatch({ type: 'restart' });
  });
  life.onPageHidden(() => dispatch({ type: 'pause' }));
  life.onMotionChange(reduced => dispatch({ type: 'motion', reduced }));
  // Reprodução automática no máximo uma vez por visita; depois de qualquer interação, só manual.
  life.observe(root, entry => {
    if (!entry.isIntersecting) { dispatch({ type: 'pause' }); return; }
    if (entry.intersectionRatio >= 0.35 && !touched && state.status === 'idle') { touched = true; dispatch({ type: 'play' }); }
  });
  choose('planilhas');

  return {
    getState: () => ({ ...state, scenario: selected }),
    pendingTimers: () => timers.pending(),
    destroy() { timers.clear(); life.destroy(); outcome.destroy(); },
  };
}
