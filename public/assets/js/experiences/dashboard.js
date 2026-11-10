// Experiência 02 — painel interativo.
// Resultado compacto na última etapa do fluxo (#scenario-outcome) e painel completo na galeria
// de demonstrações (#dashboard-panel). O mesmo controlador também funciona dentro de um <dialog>.
// Indicadores, gráficos e lista saem sempre de computeMetrics(), a mesma fonte de dados.
import { computeMetrics, getDashboard, todayRecords, recordDetails, statusLabel, formatMoney, PERIODS, LAST_DAY } from './scenarios.js';
import { $, $$, el, svg, icon, replaceChildrenKeepingFocus } from './dom.js';

const plural = (count, [one, many]) => `${count} ${count === 1 ? one : many}`;
const dayLabel = day => (day === LAST_DAY ? 'hoje' : `dia ${day}`);
const LIST_PAGE = 8;

/** Linha do gráfico de evolução (pontos no espaço 280 × 135 do SVG compacto). */
function linePoints(series) {
  const max = Math.max(1, ...series.map(point => point.count));
  const step = 264 / Math.max(1, series.length - 1);
  return series.map((point, i) => `${Math.round(8 + i * step)},${Math.round(112 - (point.count / max) * 92)}`).join(' ');
}

// ===== Resultado compacto (última etapa do fluxo) =====
export function createCompactOutcome(outcome, { onExplore = () => {} } = {}) {
  let selected = 'planilhas', period = 'semana', documentId = null, ticketFilter = 'todos';

  const header = (title, subtitle) => [
    el('div', { class: 'outcome-heading' },
      el('div', {}, el('span', { class: 'outcome-kicker', text: 'RESULTADO POSSÍVEL' }), el('h3', { text: title })),
      icon('check')),
    el('p', { class: 'outcome-subtitle', text: subtitle }),
  ];
  const footer = (note, noteAttrs = {}) => el('div', { class: 'outcome-footer' },
    el('p', { class: 'outcome-note', ...noteAttrs, text: note }),
    el('button', { type: 'button', class: 'outcome-explore', 'data-dashboard-open': true, 'data-focus-key': 'explore' }, 'Ver painel completo', icon('arrow')));

  function planilhas() {
    const metrics = computeMetrics('planilhas', { period });
    const month = period === 'mes';
    const points = linePoints(metrics.series);
    const max = Math.max(1, ...metrics.distribution.map(item => item.count));
    const kpi = key => metrics.kpis.find(item => item.key === key).value;
    return [
      ...header('Da planilha à visão do negócio', 'Dados reunidos em uma aplicação criada para sua operação.'),
      el('div', { class: 'dashboard-controls', role: 'group', 'aria-label': 'Período do dashboard' },
        Object.entries(PERIODS).map(([key, { label }]) => el('button', { type: 'button', 'data-period': key, 'data-focus-key': `period:${key}`, 'aria-pressed': String(period === key), text: label }))),
      el('div', { class: 'dashboard-kpis' },
        el('div', {}, el('span', { text: 'Pedidos reunidos' }), el('strong', { text: kpi('total') })),
        el('div', {}, el('span', { text: 'Pendências' }), el('strong', { text: kpi('status:pendente') })),
        el('div', {}, el('span', { text: 'Fontes conectadas' }), el('strong', { text: kpi('sources') }))),
      el('div', { class: 'dashboard-charts' },
        el('div', { class: 'evolution-chart' },
          el('h4', { text: 'Evolução de pedidos' }),
          svg('svg', { viewBox: '0 0 280 135', role: 'img', 'aria-label': `Pedidos por dia no período: ${metrics.series.map(point => `${month ? `dia ${point.label}` : point.label} ${point.count}`).join(', ')}` },
            svg('path', { class: 'chart-grid', d: 'M8 20H272M8 65H272M8 112H272' }),
            svg('polygon', { class: 'chart-area', points: `8,125 ${points} 272,125` }),
            svg('polyline', { class: 'chart-line', points, pathLength: '1' })),
          el('div', { class: 'chart-axis' }, el('span', { text: month ? 'Dia 1' : metrics.series[0].label }), el('span', { text: month ? `Dia ${LAST_DAY}` : metrics.series.at(-1).label }))),
        el('div', { class: 'category-chart' },
          el('h4', { text: 'Por área' }),
          metrics.distribution.map(item => el('div', { class: 'category-bar' }, el('span', { text: item.label }), el('strong', { text: item.count }), el('i', { style: { '--bar-width': `${Math.round((item.count / max) * 100)}%` } }))))),
      footer(`Período: ${month ? 'mês' : 'semana'} · dados demonstrativos`),
    ];
  }

  function documentos() {
    const docs = todayRecords('documentos');
    const doc = docs.find(item => item.id === documentId);
    const { statuses } = getDashboard('documentos');
    return [
      ...header('Documentos com lugar e contexto', 'Os documentos de hoje, acompanhados etapa por etapa.'),
      el('div', { class: 'document-canvas' }, statuses.map(([status, label], i) => {
        const items = docs.filter(item => item.status === status);
        return el('section', { class: 'document-column' },
          el('h4', {}, el('span', { class: `column-dot dot-${i}` }), label, el('small', { text: items.length })),
          items.map(item => el('button', { type: 'button', class: 'document-card', 'data-document': item.id, 'data-focus-key': `doc:${item.id}`, 'aria-pressed': String(item.id === documentId), 'aria-controls': 'document-detail' },
            icon('layer'), el('strong', { text: item.title }), el('span', { text: item.category }))));
      })),
      el('div', { id: 'document-detail', class: 'document-detail', role: 'status' }, doc
        ? [el('strong', { text: doc.title }), el('dl', {}, [['Categoria', doc.category], ...doc.fields].map(([key, value]) => el('div', {}, el('dt', { text: key }), el('dd', { text: value }))))]
        : el('span', { text: 'Selecione um documento para explorar suas informações.' })),
      footer('Extração e revisão configuradas para cada processo'),
    ];
  }

  function atendimento() {
    const tickets = todayRecords('atendimento');
    const filtered = tickets.filter(ticket => ticketFilter === 'todos' || ticket.status === ticketFilter);
    const filters = [['todos', 'Todos'], ['pendentes', 'Pendentes'], ['andamento', 'Em andamento'], ['resolvidos', 'Resolvidos']];
    return [
      ...header('Cada conversa vira uma próxima ação', 'Tickets de hoje, com responsável e situação visíveis.'),
      el('div', { class: 'ticket-filters', role: 'group', 'aria-label': 'Filtrar tickets por status' },
        filters.map(([key, label]) => el('button', { type: 'button', 'data-ticket-filter': key, 'data-focus-key': `ticket:${key}`, 'aria-pressed': String(ticketFilter === key), text: label }))),
      el('ul', { class: 'ticket-list', 'aria-label': 'Tickets de atendimento' }, filtered.map(ticket => el('li', { class: 'ticket-row' },
        el('span', { class: 'ticket-avatar', 'aria-hidden': 'true', text: ticket.owner[0] }),
        el('div', {}, el('span', { class: 'ticket-id', text: `#${ticket.id} · ${ticket.source}` }), el('strong', { text: ticket.title }), el('small', { text: `Responsável: ${ticket.owner}` })),
        el('span', { class: `ticket-status status-${ticket.status}`, text: statusLabel('atendimento', ticket.status) })))),
      footer(`${plural(filtered.length, ['ticket', 'tickets'])} neste filtro`, { role: 'status' }),
    ];
  }

  function render() {
    replaceChildrenKeepingFocus(outcome, selected === 'planilhas' ? planilhas() : selected === 'documentos' ? documentos() : atendimento());
  }

  function onClick(event) {
    const button = event.target.closest('button');
    if (!button || !outcome.contains(button)) return;
    if (button.hasAttribute('data-dashboard-open')) { onExplore({ scenario: selected, period, opener: button }); return; }
    if (button.dataset.period) period = button.dataset.period;
    else if (button.dataset.document) documentId = button.dataset.document;
    else if (button.dataset.ticketFilter) ticketFilter = button.dataset.ticketFilter;
    else return;
    render();
  }
  outcome.addEventListener('click', onClick);

  return {
    setScenario(name) { selected = name; period = 'semana'; documentId = null; ticketFilter = 'todos'; render(); },
    destroy() { outcome.removeEventListener('click', onClick); },
  };
}

// ===== Painel completo (na página ou em <dialog>) =====
export function createDashboardPanel(dialog, { track = () => {} } = {}) {
  const modal = typeof dialog.showModal === 'function';
  const body = $('#dashboard-app', dialog);
  const sync = $('[data-dash-sync]', dialog);
  const state = { scenario: 'planilhas', period: 'semana', category: 'todas', status: 'todos', selected: null, limit: LIST_PAGE };
  let opener = null;
  let parts = null;
  let fresh = true;

  const dashboard = () => getDashboard(state.scenario);
  const filterKey = field => (field === 'category' ? 'category' : 'status');
  const allValue = field => (field === 'category' ? 'todas' : 'todos');
  const optionsFor = field => (field === 'category' ? dashboard().categories.map(category => [category, category]) : dashboard().statuses);
  const fieldLabel = field => (field === 'category' ? dashboard().categoryLabel : dashboard().statusLabel);
  const periodName = () => (state.period === 'semana' ? 'na semana' : 'no mês');

  /** Estrutura fixa de cada cenário; as atualizações depois só mexem no que mudou. */
  function build() {
    const d = dashboard();
    parts = {
      kpis: el('section', { class: 'dash-kpis', 'aria-label': 'Indicadores do período' },
        d.kpis.map(([key, label]) => el('div', { class: 'dash-kpi', dataset: { kpi: key } }, el('span', { text: label }), el('strong', { text: '0' })))),
      chartSub: el('p', { class: 'dash-sub' }),
      chart: el('div', { class: 'dash-bars', role: 'img' }),
      axis: el('div', { class: 'dash-axis', 'aria-hidden': 'true' }),
      distribution: el('div', { class: 'dash-dist', role: 'group', 'aria-label': `${d.distributionTitle}. Selecione uma linha para filtrar.` }),
      distClear: el('button', { type: 'button', class: 'dash-link', 'data-dash-clear-dist': true, hidden: true, text: 'Mostrar todas' }),
      chips: el('div', { class: 'dash-chips', role: 'group', 'aria-label': `Filtrar por ${fieldLabel(d.chips).toLowerCase()}` }),
      summary: el('p', { class: 'dash-summary', role: 'status' }),
      list: el('ul', { class: 'dash-list', 'aria-label': `Lista de ${d.noun[1]}` }),
      more: el('button', { type: 'button', class: 'dash-more', 'data-dash-more': true, hidden: true }),
    };
    body.replaceChildren(
      parts.kpis,
      el('div', { class: 'dash-grid' },
        el('section', { class: 'dash-card dash-chart', 'aria-labelledby': 'dash-chart-title' },
          el('div', { class: 'dash-card-head' }, el('div', {}, el('h4', { id: 'dash-chart-title', text: d.chartTitle }), parts.chartSub)),
          parts.chart, parts.axis),
        el('section', { class: 'dash-card dash-distribution', 'aria-labelledby': 'dash-dist-title' },
          el('div', { class: 'dash-card-head' }, el('h4', { id: 'dash-dist-title', text: d.distributionTitle }), parts.distClear),
          parts.distribution)),
      el('section', { class: 'dash-card dash-records', 'aria-labelledby': 'dash-list-title' },
        el('div', { class: 'dash-card-head' }, el('h4', { id: 'dash-list-title', text: `Lista de ${d.noun[1]}` }), parts.chips),
        parts.summary, parts.list, parts.more),
    );
    fresh = true;
  }

  function updateKpis(metrics) {
    for (const item of metrics.kpis) {
      const node = $(`[data-kpi="${item.key}"]`, parts.kpis);
      const strong = $('strong', node);
      if (strong.textContent === String(item.value)) continue;
      strong.textContent = String(item.value);
      if (!fresh) { node.classList.remove('is-changed'); void node.offsetWidth; node.classList.add('is-changed'); }
    }
  }

  function updateChart(metrics) {
    const d = dashboard();
    const week = state.period === 'semana';
    const max = Math.max(1, ...metrics.series.map(point => point.count));
    parts.chartSub.textContent = `${PERIODS[state.period].label} · ${plural(metrics.total, d.noun)}${d.money ? ` · ${formatMoney(metrics.value)}` : ''}`;
    if (parts.chart.childElementCount !== metrics.series.length) {
      parts.chart.replaceChildren(...metrics.series.map(() => el('span', { class: 'dash-bar' }, el('i'))));
    }
    parts.chart.dataset.period = state.period;
    parts.axis.dataset.period = state.period;
    parts.chart.setAttribute('aria-label', `${d.chartTitle} ${periodName()}: ${metrics.series.map(point => `${week ? point.label : `dia ${point.label}`}, ${point.count}`).join('; ')}`);
    metrics.series.forEach((point, i) => {
      const bar = parts.chart.children[i];
      bar.style.setProperty('--v', String(point.count / max));
      bar.classList.toggle('is-zero', point.count === 0);
      bar.title = `${week ? point.label : `Dia ${point.label}`}: ${plural(point.count, d.noun)}`;
    });
    // O último dia ("hoje") tem cor própria e também o rótulo escrito, para não depender só da cor.
    parts.axis.replaceChildren(...metrics.series.map((point, i) => el('span', { class: point.day === LAST_DAY ? 'is-today' : null },
      week ? el('b', { text: point.count }) : null,
      point.day === LAST_DAY ? 'Hoje' : week || i === 0 || (i + 1) % 5 === 0 ? point.label : '')));
  }

  function updateDistribution(metrics) {
    const d = dashboard();
    const active = state[filterKey(d.distribution)];
    const max = Math.max(1, ...metrics.distribution.map(item => item.count));
    if (parts.distribution.childElementCount !== metrics.distribution.length) {
      parts.distribution.replaceChildren(...metrics.distribution.map(item => el('button', { type: 'button', class: 'dash-dist-row', 'data-dist': item.key },
        el('span', { class: 'dash-dist-label', text: item.label }), el('strong'), el('i', { 'aria-hidden': 'true' }))));
    }
    metrics.distribution.forEach((item, i) => {
      const row = parts.distribution.children[i];
      row.setAttribute('aria-pressed', String(active === item.key));
      $('strong', row).textContent = String(item.count);
      $('i', row).style.setProperty('--share', String(item.count / max));
    });
    parts.distClear.hidden = active === allValue(d.distribution);
  }

  function updateChips() {
    const field = dashboard().chips;
    const active = state[filterKey(field)];
    replaceChildrenKeepingFocus(parts.chips, [[allValue(field), 'Todos'], ...optionsFor(field)].map(([key, label]) =>
      el('button', { type: 'button', 'data-chip': key, 'data-focus-key': `chip:${key}`, 'aria-pressed': String(active === key), text: label })));
  }

  function rowFor(record) {
    const d = dashboard();
    const open = state.selected === record.id;
    const detailId = `dash-detail-${record.id}`;
    return el('li', { class: open ? 'is-open' : null },
      el('button', { type: 'button', class: 'dash-row', 'data-record': record.id, 'data-focus-key': `rec:${record.id}`, 'aria-expanded': String(open), 'aria-controls': open ? detailId : null },
        el('span', { class: 'dash-row-id', text: d.key === 'documentos' ? dayLabel(record.day) : `#${record.id} · ${dayLabel(record.day)}` }),
        el('strong', { class: 'dash-row-title', text: record.title }),
        el('span', { class: 'dash-row-meta', text: [record.category, record.source, record.owner].filter(Boolean).join(' · ') }),
        d.money ? el('span', { class: 'dash-row-value', text: formatMoney(record.value) }) : null,
        el('span', { class: 'dash-tags' },
          el('span', { class: `dash-status status-${record.status}`, text: statusLabel(d.key, record.status) }),
          record.issue ? el('span', { class: 'dash-flag' }, el('span', { 'aria-hidden': 'true', text: '!' }), ' Atenção') : null)),
      open ? el('div', { id: detailId, class: 'dash-row-detail' },
        record.issue ? el('p', { class: 'dash-detail-issue' }, el('strong', { text: 'Precisa de atenção: ' }), record.issue) : null,
        el('dl', {}, recordDetails(d.key, record).map(([key, value]) => el('div', {}, el('dt', { text: key }), el('dd', { text: value }))))) : null);
  }

  function updateList(metrics) {
    const d = dashboard();
    const filters = [];
    if (state.category !== 'todas') filters.push(`${d.categoryLabel}: ${state.category}`);
    if (state.status !== 'todos') filters.push(`${d.statusLabel}: ${statusLabel(d.key, state.status)}`);
    parts.summary.textContent = `${plural(metrics.total, d.noun)} ${periodName()}${d.money ? ` · ${formatMoney(metrics.value)}` : ''} · ${filters.length ? filters.join(' · ') : 'sem filtros'}`;
    if (!metrics.records.some(record => record.id === state.selected)) state.selected = null;
    if (!metrics.records.length) {
      replaceChildrenKeepingFocus(parts.list, el('li', { class: 'dash-empty' },
        el('strong', { text: `Nenhum ${d.noun[0]} com esses filtros.` }),
        el('span', { text: 'Mude o período ou limpe os filtros para ver os registros.' }),
        el('button', { type: 'button', class: 'dash-link', 'data-dash-clear': true, 'data-focus-key': 'clear', text: 'Limpar filtros' })));
    } else {
      replaceChildrenKeepingFocus(parts.list, metrics.records.slice(0, state.limit).map(rowFor));
    }
    const remaining = metrics.records.length - state.limit;
    parts.more.hidden = remaining <= 0;
    parts.more.textContent = remaining > 0 ? `Mostrar mais ${Math.min(remaining, LIST_PAGE)} (${remaining} restantes)` : '';
  }

  /** Recalcula a partir da mesma fonte e atualiza só as partes necessárias. */
  function update() {
    const metrics = computeMetrics(state.scenario, state);
    updateKpis(metrics);
    updateChart(metrics);
    updateDistribution(metrics);
    updateChips();
    updateList(metrics);
    $('#dashboard-title', dialog).textContent = dashboard().title;
    $$('[data-dash-scenario]', dialog).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.dashScenario === state.scenario)));
    $$('[data-dash-period]', dialog).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.dashPeriod === state.period)));
    dialog.dataset.scenario = state.scenario;
    if (sync && !fresh) { sync.classList.remove('is-syncing'); void sync.offsetWidth; sync.classList.add('is-syncing'); }
    fresh = false;
  }

  function setScenario(name) {
    state.scenario = getDashboard(name).key;
    Object.assign(state, { category: 'todas', status: 'todos', selected: null, limit: LIST_PAGE });
    build();
    update();
  }

  const filterEvent = action => track('dashboard_filter', { scenario: state.scenario, component: 'dashboard', action });

  function onClick(event) {
    if (modal && event.target === dialog) { close(); return; }
    const control = event.target.closest('button,a');
    if (!control || !dialog.contains(control)) return;
    const d = dashboard();
    if (modal && control.hasAttribute('data-dash-close')) { close(); return; }
    if (control.hasAttribute('data-dash-cta')) {
      const interest = document.getElementById('lead-interest');
      if (interest) interest.value = d.interest;
      if (modal) close({ restoreFocus: false });
      return;
    }
    if (control.dataset.dashScenario) {
      if (control.dataset.dashScenario === state.scenario) return;
      setScenario(control.dataset.dashScenario);
      track('demo_scenario_select', { scenario: state.scenario, component: 'dashboard' });
      return;
    }
    if (control.dataset.dashPeriod) {
      if (control.dataset.dashPeriod === state.period) return;
      state.period = control.dataset.dashPeriod;
      state.limit = LIST_PAGE;
      filterEvent('period');
    } else if (control.dataset.dist !== undefined) {
      const key = filterKey(d.distribution);
      state[key] = state[key] === control.dataset.dist ? allValue(d.distribution) : control.dataset.dist;
      state.limit = LIST_PAGE;
      filterEvent(key);
    } else if (control.hasAttribute('data-dash-clear-dist')) {
      state[filterKey(d.distribution)] = allValue(d.distribution);
      update();
      parts.distribution.querySelector('button')?.focus({ preventScroll: true });
      filterEvent('clear');
      return;
    } else if (control.dataset.chip !== undefined) {
      state[filterKey(d.chips)] = control.dataset.chip;
      state.limit = LIST_PAGE;
      filterEvent(filterKey(d.chips));
    } else if (control.hasAttribute('data-dash-clear')) {
      Object.assign(state, { category: 'todas', status: 'todos', limit: LIST_PAGE });
      update();
      parts.chips.querySelector('button')?.focus({ preventScroll: true });
      filterEvent('clear');
      return;
    } else if (control.hasAttribute('data-dash-more')) {
      const first = state.limit;
      state.limit += LIST_PAGE;
      update();
      parts.list.children[first]?.querySelector('button')?.focus({ preventScroll: true });
      return;
    } else if (control.dataset.record) {
      state.selected = state.selected === control.dataset.record ? null : control.dataset.record;
      if (state.selected) filterEvent('record');
    } else return;
    update();
  }

  function open({ scenario = 'planilhas', period = 'semana', opener: from = null } = {}) {
    opener = from;
    state.period = Object.hasOwn(PERIODS, period) ? period : 'semana';
    setScenario(scenario);
    if (modal && !dialog.open) { dialog.showModal(); $('[data-dash-close]', dialog)?.focus(); }
  }

  function close({ restoreFocus = true } = {}) {
    if (!restoreFocus) opener = null;
    if (modal && dialog.open) dialog.close();
  }

  // Esc fecha pelo próprio <dialog>; em todos os casos o foco volta para quem abriu o painel.
  function onClose() {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  }

  dialog.addEventListener('click', onClick);
  if (modal) dialog.addEventListener('close', onClose);
  // Na página o painel fica sempre montado; no <dialog> ele é montado ao abrir.
  else setScenario(state.scenario);

  return {
    open,
    close,
    getState: () => ({ ...state, open: modal ? dialog.open : true }),
    destroy() { dialog.removeEventListener('click', onClick); dialog.removeEventListener('close', onClose); if (modal && dialog.open) dialog.close(); },
  };
}
