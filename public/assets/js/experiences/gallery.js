// Galeria "Veja a tecnologia funcionando." — abas acessíveis (padrão WAI-ARIA tabs).
// Sem JavaScript, os três painéis aparecem um abaixo do outro e as abas ficam ocultas.
import { $, $$ } from './dom.js';
import { createLifecycle } from './motion.js';

export const GALLERY_TABS = ['automacao', 'gestao', 'integracao'];

/** Próxima aba para uma tecla de navegação (ou null se a tecla não navega). */
export function nextTab(current, key, tabs = GALLERY_TABS) {
  const i = tabs.indexOf(current);
  if (key === 'ArrowRight') return tabs[(i + 1) % tabs.length];
  if (key === 'ArrowLeft') return tabs[(i - 1 + tabs.length) % tabs.length];
  if (key === 'Home') return tabs[0];
  if (key === 'End') return tabs[tabs.length - 1];
  return null;
}

export function setupGallery(root, { track = () => {}, onChange = () => {} } = {}) {
  const life = createLifecycle();
  const tabs = $$('[data-gallery-tab]', root);
  const panels = $$('[data-gallery-panel]', root);
  let active = tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.dataset.galleryTab || GALLERY_TABS[0];

  function render() {
    for (const tab of tabs) {
      const selected = tab.dataset.galleryTab === active;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const panel of panels) panel.hidden = panel.dataset.galleryPanel !== active;
    root.dataset.active = active;
  }

  /** Mostra uma aba; com focus=true o foco vai para o botão da aba. */
  function show(name, { focus = false, source = 'api' } = {}) {
    if (!GALLERY_TABS.includes(name)) return;
    const changed = name !== active;
    active = name;
    render();
    if (focus) $(`[data-gallery-tab="${name}"]`, root)?.focus();
    if (changed) {
      onChange(name);
      if (source === 'user') track('demo_scenario_select', { scenario: name, component: 'gallery', action: 'tab' });
    }
  }

  for (const tab of tabs) {
    life.listen(tab, 'click', () => show(tab.dataset.galleryTab, { source: 'user' }));
    life.listen(tab, 'keydown', event => {
      const next = nextTab(active, event.key, tabs.map(t => t.dataset.galleryTab));
      if (!next) return;
      event.preventDefault();
      show(next, { focus: true, source: 'user' });
    });
  }

  $('[data-gallery-js]', root)?.removeAttribute('hidden');
  root.classList.add('is-ready');
  render();

  return {
    show,
    panel: name => panels.find(panel => panel.dataset.galleryPanel === name) || null,
    getState: () => ({ active }),
    destroy() { life.destroy(); },
  };
}
