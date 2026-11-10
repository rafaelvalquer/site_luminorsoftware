// Demonstração "Automação de processos": documentos saem da origem, passam pelas regras e
// chegam ao controle financeiro. Os textos ficam no HTML; aqui só mudam estados e contadores.
import { $, $$ } from './dom.js';
import { createTimers, createLifecycle, reducedMotionQuery } from './motion.js';

/** Duração de cada quadro (ms): conferência do documento e lançamento no destino. */
export const RUNNER_FRAME_MS = 620;

/** Estado vazio: nada processado. */
export function runnerIdle(count) {
  return { current: -1, phase: 'idle', items: Array(count).fill('waiting'), rows: Array(count).fill('empty'), done: 0, review: 0 };
}

/**
 * Quadros da execução (puros e testáveis). Cada documento passa por "processing" e termina
 * em "done" ou "review" (quando o índice está em reviewSet).
 */
export function runnerFrames(count, reviewSet = new Set()) {
  const frames = [];
  let frame = runnerIdle(count);
  for (let i = 0; i < count; i++) {
    frame = { ...frame, current: i, phase: 'processing', items: frame.items.map((s, j) => (j === i ? 'processing' : s)) };
    frames.push(frame);
    const result = reviewSet.has(i) ? 'review' : 'done';
    frame = {
      ...frame,
      phase: i === count - 1 ? 'finished' : 'moving',
      items: frame.items.map((s, j) => (j === i ? result : s)),
      rows: frame.rows.map((s, j) => (j === i ? result : s)),
      done: frame.done + (result === 'done' ? 1 : 0),
      review: frame.review + (result === 'review' ? 1 : 0),
    };
    frames.push(frame);
  }
  return frames;
}

export function setupProcessRunner(root, { track = () => {} } = {}) {
  const life = createLifecycle();
  const timers = createTimers();
  const motion = reducedMotionQuery();
  const items = $$('[data-runner-item]', root);
  const rows = $$('[data-runner-row]', root);
  const reviewSet = new Set(items.filter(item => item.dataset.review).map(item => Number(item.dataset.runnerItem)));
  const frames = runnerFrames(items.length, reviewSet);
  const run = $('#runner-run', root);
  const restart = $('#runner-restart', root);
  const message = $('#runner-message', root);
  const status = $('#runner-status', root);
  const nameOf = i => $('strong', items[i])?.textContent || '';
  let index = -1; // último quadro aplicado
  let playing = false;
  let userRun = false;

  function apply(frame) {
    items.forEach((item, i) => { item.dataset.state = frame.items[i]; });
    rows.forEach((row, i) => { row.dataset.state = frame.rows[i]; });
    $('[data-runner-count="done"]', root).textContent = String(frame.done);
    $('[data-runner-count="review"]', root).textContent = String(frame.review);
    root.dataset.state = frame.phase;
    $('#runner-current', root).textContent = frame.current < 0 ? 'Aguardando execução' : frame.phase === 'finished' ? 'Execução concluída' : nameOf(frame.current);
    const last = frame.current >= 0 ? items[frame.current] : null;
    message.textContent = frame.phase === 'idle'
      ? `${items.length} documentos aguardando. Execute a automação para ver cada etapa.`
      : frame.phase === 'finished'
        ? `${frame.done} lançados automaticamente e ${frame.review} enviado para revisão da equipe.`
        : frame.phase === 'processing'
          ? `Conferindo ${nameOf(frame.current)}: leitura, valor, vencimento e classificação.`
          : last?.dataset.review
            ? `${nameOf(frame.current)} foi para revisão: ${last.dataset.review}`
            : `${nameOf(frame.current)} lançado no controle financeiro.`;
  }

  function controls() {
    const finished = index === frames.length - 1;
    root.dataset.playing = String(playing);
    $('#runner-run-label', root).textContent = playing ? 'Pausar' : finished ? 'Executar novamente' : index >= 0 ? 'Continuar' : 'Executar automação';
    $('span[aria-hidden]', run).textContent = playing ? 'Ⅱ' : finished ? '↻' : '▶';
    restart.setAttribute('aria-disabled', String(index < 0 && !playing));
  }

  function step() {
    index += 1;
    apply(frames[index]);
    if (index === frames.length - 1) {
      playing = false;
      status.textContent = message.textContent;
      if (userRun) { userRun = false; track('demo_flow_complete', { scenario: 'documentos_financeiros', component: 'process_runner' }); }
    } else timers.after(RUNNER_FRAME_MS, step);
    controls();
  }

  function reset() {
    timers.clear();
    playing = false;
    index = -1;
    apply(runnerIdle(items.length));
    controls();
  }

  function finish() {
    timers.clear();
    playing = false;
    index = frames.length - 1;
    apply(frames[index]);
    status.textContent = message.textContent;
    controls();
  }

  function pause() {
    if (!playing) return;
    timers.clear();
    playing = false;
    controls();
  }

  function play(action) {
    if (index === frames.length - 1) reset();
    userRun = true;
    track('demo_flow_start', { scenario: 'documentos_financeiros', component: 'process_runner', action });
    if (motion?.matches) { finish(); userRun = false; return; }
    playing = true;
    status.textContent = 'Execução iniciada.';
    controls();
    timers.after(index < 0 ? 120 : RUNNER_FRAME_MS, step);
  }

  life.listen(run, 'click', () => (playing ? pause() : play(index >= 0 && index < frames.length - 1 ? 'resume' : 'play')));
  life.listen(restart, 'click', () => {
    if (restart.getAttribute('aria-disabled') === 'true') return;
    reset();
    play('restart');
  });
  life.onPageHidden(pause);
  life.onMotionChange(reduced => { if (reduced && playing) finish(); });
  life.observe(root, entry => { if (!entry.isIntersecting) pause(); }, [0]);

  $('[data-runner-js]', root)?.removeAttribute('hidden');
  reset();

  return {
    getState: () => ({ index, playing, frames: frames.length, state: root.dataset.state }),
    pendingTimers: () => timers.pending(),
    pause,
    destroy() { timers.clear(); life.destroy(); },
  };
}
