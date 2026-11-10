// Resultado de cada cenário na última etapa do exemplo (#scenario-outcome).
import { DOCUMENTS, TICKETS } from './scenarios.js';

const iconHTML = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"></use></svg>`;

function resultHeader(title, subtitle) {
  return `<div class="outcome-heading"><div><span class="outcome-kicker">RESULTADO POSSÍVEL</span><h3>${title}</h3></div>${iconHTML('check')}</div><p class="outcome-subtitle">${subtitle}</p>`;
}

export function createCompactOutcome(outcome) {
  let selected = 'planilhas', period = 'semana', documentId = null, ticketFilter = 'todos';

  function render() {
    if (selected === 'planilhas') {
      const month = period === 'mes', values = month ? [74, 59, 39] : [18, 14, 8], total = values.reduce((a, b) => a + b, 0);
      const points = month ? '8,112 40,99 73,105 106,76 139,83 172,53 205,63 238,27 272,12' : '8,112 52,95 96,103 140,69 184,76 228,39 272,30';
      outcome.innerHTML = resultHeader('Da planilha à visão do negócio', 'Dados reunidos em uma aplicação criada para sua operação.') + `<div class="dashboard-controls" role="group" aria-label="Período do dashboard"><button type="button" data-period="semana" aria-pressed="${!month}">Semana</button><button type="button" data-period="mes" aria-pressed="${month}">Mês</button></div><div class="dashboard-kpis"><div><span>Pedidos reunidos</span><strong>${total}</strong></div><div><span>Em análise</span><strong>${month ? 14 : 6}</strong></div><div><span>Fontes conectadas</span><strong>03</strong></div></div><div class="dashboard-charts"><div class="evolution-chart"><h4>Evolução de pedidos</h4><svg viewBox="0 0 280 135" role="img" aria-label="Evolução dos pedidos no período: ${month ? 'mês' : 'semana'}"><path class="chart-grid" d="M8 20H272M8 65H272M8 112H272"/><polygon class="chart-area" points="8,125 ${points} 272,125"/><polyline class="chart-line" points="${points}" pathLength="1"/></svg><div class="chart-axis"><span>${month ? 'Dia 1' : 'Seg'}</span><span>${month ? 'Dia 30' : 'Dom'}</span></div></div><div class="category-chart"><h4>Por área</h4>${['Comercial', 'Operação', 'Financeiro'].map((name, i) => `<div class="category-bar"><span>${name}</span><strong>${values[i]}</strong><i style="--bar-width:${Math.round(values[i] / values[0] * 100)}%"></i></div>`).join('')}</div></div><p class="outcome-note">Período selecionado: ${month ? 'mês' : 'semana'}</p>`;
    } else if (selected === 'documentos') {
      const doc = DOCUMENTS.find(d => d.id === documentId);
      outcome.innerHTML = resultHeader('Documentos com lugar e contexto', 'Um canvas para acompanhar cada etapa da organização.') + `<div class="document-canvas">${['Recebidos', 'Em análise', 'Organizados'].map((name, i) => `<section class="document-column"><h4><span class="column-dot dot-${i}"></span>${name}<small>${DOCUMENTS.filter(d => d.stage === i).length}</small></h4>${DOCUMENTS.filter(d => d.stage === i).map(d => `<button type="button" class="document-card" data-document="${d.id}" aria-pressed="${d.id === documentId}" aria-controls="document-detail">${iconHTML('layer')}<strong>${d.title}</strong><span>${d.category}</span></button>`).join('')}</section>`).join('')}</div><div id="document-detail" class="document-detail" role="status">${doc ? `<strong>${doc.title}</strong><dl><div><dt>Categoria</dt><dd>${doc.category}</dd></div>${doc.fields.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>` : '<span>Selecione um documento para explorar suas informações.</span>'}</div><p class="outcome-note">Extração e revisão configuradas para cada processo</p>`;
    } else {
      const filtered = TICKETS.filter(t => ticketFilter === 'todos' || t.status === ticketFilter);
      outcome.innerHTML = resultHeader('Cada conversa vira uma próxima ação', 'Tickets organizados, com responsável e situação visíveis.') + `<div class="ticket-filters" role="group" aria-label="Filtrar tickets por status">${[['todos', 'Todos'], ['pendentes', 'Pendentes'], ['andamento', 'Em andamento'], ['resolvidos', 'Resolvidos']].map(([key, label]) => `<button type="button" data-ticket-filter="${key}" aria-pressed="${ticketFilter === key}">${label}</button>`).join('')}</div><ul class="ticket-list" aria-label="Tickets de atendimento">${filtered.map(t => `<li class="ticket-row"><span class="ticket-avatar" aria-hidden="true">${t.initial}</span><div><span class="ticket-id">#${t.id} · WhatsApp</span><strong>${t.title}</strong><small>Responsável: ${t.owner}</small></div><span class="ticket-status status-${t.status}">${t.label}</span></li>`).join('')}</ul><p class="outcome-note" role="status">${filtered.length} ticket${filtered.length === 1 ? '' : 's'} neste filtro</p>`;
    }
  }

  function onClick(event) {
    const button = event.target.closest('button');
    if (!button) return;
    let selector;
    if (button.dataset.period) { period = button.dataset.period; selector = `[data-period="${period}"]`; }
    else if (button.dataset.document) { documentId = button.dataset.document; selector = `[data-document="${documentId}"]`; }
    else if (button.dataset.ticketFilter) { ticketFilter = button.dataset.ticketFilter; selector = `[data-ticket-filter="${ticketFilter}"]`; }
    else return;
    render();
    outcome.querySelector(selector).focus({ preventScroll: true });
  }
  outcome.addEventListener('click', onClick);

  return {
    setScenario(name) { selected = name; period = 'semana'; documentId = null; ticketFilter = 'todos'; render(); },
    destroy() { outcome.removeEventListener('click', onClick); },
  };
}
