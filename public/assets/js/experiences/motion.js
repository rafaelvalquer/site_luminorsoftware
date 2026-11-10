// Utilitários de movimento compartilhados pelas experiências interativas.
// Nada aqui toca no DOM durante a importação, para que a lógica possa ser testada no Node.

/** Media query de movimento reduzido (ou null fora do navegador). */
export function reducedMotionQuery() {
  return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
}

/** true quando a pessoa pediu menos movimento no sistema. */
export function prefersReducedMotion() {
  return Boolean(reducedMotionQuery()?.matches);
}

/**
 * Temporizadores rastreados: cada sequência nova cancela a anterior, e clear()
 * garante que nenhum timeout continue ativo depois de uma pausa ou desmontagem.
 */
export function createTimers() {
  const ids = new Set();
  return {
    after(ms, fn) {
      const id = setTimeout(() => { ids.delete(id); fn(); }, ms);
      ids.add(id);
      return id;
    },
    /** Agenda passos [atraso acumulado, função] e cancela qualquer sequência em curso. */
    sequence(steps) {
      this.clear();
      let at = 0;
      for (const [delay, fn] of steps) { at += delay; this.after(at, fn); }
    },
    clear() {
      for (const id of ids) clearTimeout(id);
      ids.clear();
    },
    pending() { return ids.size; },
  };
}

/** Registra ouvintes e observadores para liberar tudo de uma vez ao desmontar. */
export function createLifecycle() {
  const cleanups = [];
  return {
    add(fn) { cleanups.push(fn); return fn; },
    listen(target, type, fn, options) {
      target.addEventListener(type, fn, options);
      cleanups.push(() => target.removeEventListener(type, fn, options));
    },
    /** Pausa quando a aba perde visibilidade. */
    onPageHidden(fn) {
      this.listen(document, 'visibilitychange', () => { if (document.hidden) fn(); });
    },
    /** Avisa quando a preferência de movimento muda durante a visita. */
    onMotionChange(fn) {
      const query = reducedMotionQuery();
      if (query) this.listen(query, 'change', () => fn(query.matches));
    },
    /** Observa a entrada e a saída da área visível, sem medir posições durante a rolagem. */
    observe(element, fn, thresholds = [0, 0.35]) {
      if (!('IntersectionObserver' in window)) return;
      const observer = new IntersectionObserver(entries => entries.forEach(fn), { threshold: thresholds });
      observer.observe(element);
      cleanups.push(() => observer.disconnect());
    },
    destroy() { while (cleanups.length) cleanups.pop()(); },
  };
}

/** Pausa ou retoma as animações CSS/Web Animations dentro de um elemento. */
export function setAnimationsPaused(root, paused) {
  if (!root.getAnimations) return;
  for (const animation of root.getAnimations({ subtree: true })) paused ? animation.pause() : animation.play();
}
