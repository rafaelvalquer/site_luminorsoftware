// Exemplo interativo do hero (#automation-demo): da rotina manual ao resultado.
import { FLOW_SCENARIOS, FLOW_CAPTIONS } from './scenarios.js';
import { $, $$ } from './dom.js';
import { createTimers, createLifecycle, reducedMotionQuery } from './motion.js';

const iconHTML = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"></use></svg>`;
const safeText = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function setupAutomationFlow(root, { outcome }) {
  const life = createLifecycle();
  const timers = createTimers();
  const motion = reducedMotionQuery();
  let selected = 'planilhas', step = 0, playing = false, touched = false;

  function playLabel() {
    root.dataset.playing = String(playing);
    $('#demo-play-label').textContent = playing ? 'Pausar' : step === 3 ? 'Rever transformação' : step === 0 ? 'Ver transformação' : 'Continuar';
    $('#demo-play').setAttribute('aria-label', playing ? 'Pausar transformação' : step === 3 ? 'Rever transformação' : step === 0 ? 'Reproduzir transformação' : 'Continuar transformação');
    $('#demo-play>span').textContent = playing ? 'Ⅱ' : step === 3 ? '↻' : '▶';
  }
  function pause() { timers.clear(); playing = false; playLabel(); }
  function setStep(next) {
    step = next;
    root.dataset.step = String(step);
    $('#scenario-outcome').hidden = step !== 3;
    $$('[data-demo-step]', root).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.demoStep) === step)));
    $('#demo-stage-copy').textContent = step === 3 ? FLOW_SCENARIOS[selected].gain : FLOW_CAPTIONS[step];
    playLabel();
  }
  function schedule() { timers.after(1800, () => { if (step < 3) { setStep(step + 1); schedule(); } else pause(); }); }
  function play() {
    if (motion?.matches) { setStep(3); pause(); return; }
    if (step === 3) setStep(0);
    playing = true; playLabel(); schedule();
  }
  function choose(name) {
    pause();
    selected = name;
    root.dataset.scenario = name;
    const scenario = FLOW_SCENARIOS[name];
    $$('[data-demo-scenario]', root).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demoScenario === name)));
    $('#demo-source-name').textContent = scenario.file;
    $('#demo-node-source').textContent = scenario.source;
    $('#demo-node-result').textContent = scenario.result;
    $('#demo-result').textContent = scenario.message;
    if (name === 'planilhas') {
      const cells = ['', 'A', 'B', 'C', '1', ...scenario.columns, ...scenario.rows.flatMap((row, i) => [String(i + 2), ...row])];
      $('.sheet-grid', root).innerHTML = cells.map((cell, i) => `<span class="${i > 7 && i % 4 === 3 ? 'cell-wait' : ''}">${safeText(cell)}</span>`).join('');
    }
    $('#manual-preview').innerHTML = name === 'documentos'
      ? ['Notas fiscais', 'Contrato_final_v3.pdf', 'Recibos', 'Pedido de compra'].map((label, i) => `<div class="loose-document loose-${i}">${iconHTML('layer')}<strong>${label}</strong><span>Conferir e organizar</span></div>`).join('')
      : name === 'atendimento'
        ? ['Olá! Cadê meu pedido?', 'Pode agendar uma visita?', 'Preciso de um orçamento.', 'Alguém já respondeu?'].map((label, i) => `<div class="loose-message loose-${i}">${iconHTML('message')}<span>${label}</span></div>`).join('')
        : '';
    outcome.setScenario(name);
    setStep(0);
  }

  $$('[data-demo-scenario]', root).forEach(button => life.listen(button, 'click', () => { touched = true; choose(button.dataset.demoScenario); }));
  $$('[data-demo-step]', root).forEach(button => life.listen(button, 'click', () => { touched = true; pause(); setStep(Number(button.dataset.demoStep)); }));
  life.listen($('#demo-play'), 'click', () => { touched = true; if (playing) pause(); else play(); });
  life.onPageHidden(pause);
  life.onMotionChange(reduced => { if (reduced) pause(); });
  life.observe(root, entry => {
    if (!entry.isIntersecting) { pause(); return; }
    if (entry.intersectionRatio >= 0.35 && !touched && !motion?.matches) { touched = true; play(); }
  });
  choose('planilhas');

  return {
    pendingTimers: () => timers.pending(),
    destroy() { timers.clear(); life.destroy(); outcome.destroy(); },
  };
}
