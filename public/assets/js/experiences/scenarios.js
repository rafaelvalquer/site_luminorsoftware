// Dados demonstrativos das experiências. Tudo é fictício e determinístico:
// os mesmos filtros produzem sempre os mesmos números, e nenhum registro representa cliente real.

// ===== Experiência 01 — as quatro etapas de cada cenário =====
export const FLOW_SCENARIOS = {
  planilhas: {
    file: 'controle_pedidos.xlsx', source: 'Planilhas', rules: 'Validar e consolidar', result: 'Aplicação',
    message: 'Dados consolidados. Equipe no controle.',
    columns: ['Pedido', 'Valor', 'Situação'], rows: [['#1048', 'R$ 320', 'Conferir'], ['#1049', 'R$ 180', 'Copiar'], ['#1050', 'R$ 460', 'Atualizar']],
    analysis: { tasks: ['Copiar pedido', 'Conferir valor', 'Atualizar situação'], from: 'Planilha de pedidos', to: 'Sistema de pedidos' },
    records: ['#1048', '#1049', '#1050'],
    captions: [
      'Pedidos copiados à mão entre planilhas, com conferência repetida a cada atualização.',
      'Mapeamos o que se repete: copiar o pedido, conferir o valor e atualizar a situação.',
      'Uma regra valida cada pedido e o envia ao sistema, sem nova digitação.',
    ],
    gain: 'As planilhas viram uma visão clara da operação. Explore o resultado.',
  },
  documentos: {
    file: 'documentos_da_equipe', source: 'Documentos', rules: 'Classificar e extrair', result: 'Registros',
    message: 'Informações extraídas. Revisão pela equipe.',
    analysis: { tasks: ['Abrir cada arquivo', 'Copiar os campos', 'Arquivar na pasta certa'], from: 'E-mail e pastas', to: 'Registro organizado' },
    records: ['NF 208', 'Contrato', 'NF 209'],
    captions: [
      'Notas, contratos e recibos chegam por canais diferentes e esperam alguém abrir.',
      'Mapeamos o que se repete: abrir o arquivo, copiar os campos e arquivar.',
      'Uma regra classifica cada documento e extrai os campos para revisão.',
    ],
    gain: 'Cada documento encontra seu lugar. Selecione um cartão para ver os dados.',
  },
  atendimento: {
    file: 'mensagens_de_clientes', source: 'WhatsApp', rules: 'Classificar e encaminhar', result: 'Equipe',
    message: 'Solicitações organizadas. Contexto com a equipe.',
    analysis: { tasks: ['Ler cada mensagem', 'Identificar o assunto', 'Avisar quem responde'], from: 'WhatsApp', to: 'Fila da equipe' },
    records: ['#1048', '#1049', '#1050'],
    captions: [
      'Mensagens se acumulam e ninguém sabe ao certo quem já respondeu.',
      'Mapeamos o que se repete: ler, identificar o assunto e avisar quem responde.',
      'Uma regra classifica cada conversa e cria o ticket com o responsável certo.',
    ],
    gain: 'Conversas viram tickets com contexto e responsável. Explore os filtros.',
  },
};

// ===== Experiência 02 — base única do painel =====
/** O mês demonstrativo tem 30 dias; "hoje" é o dia 30, uma sexta-feira. */
export const LAST_DAY = 30;
export const PERIODS = { semana: { label: 'Semana', from: LAST_DAY - 6 }, mes: { label: 'Mês', from: 1 } };
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export const weekday = day => WEEKDAYS[(((day - LAST_DAY) % 7) + 7 + 4) % 7];
const isWeekend = day => weekday(day) === 'Sáb' || weekday(day) === 'Dom';

/** Gerador pseudoaleatório com semente fixa (mulberry32): mesma semente, mesmos dados. */
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (rand, min, max) => min + Math.floor(rand() * (max - min + 1));
const pick = (rand, items) => items[Math.floor(rand() * items.length)];
function weighted(rand, entries) {
  let roll = rand() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [value, weight] of entries) if ((roll -= weight) < 0) return value;
  return entries.at(-1)[0];
}
/** Registros dos dias 1 a 29; o dia 30 recebe os registros fixos usados no exemplo do hero. */
function generate(seed, perDay, make) {
  const rand = seeded(seed);
  const out = [];
  for (let day = 1; day < LAST_DAY; day++) {
    const count = perDay(rand, day);
    for (let i = 0; i < count; i++) out.push(make(rand, day));
  }
  return out;
}
const sequence = records => records.map((record, seq) => ({ ...record, seq }));

// Pedidos: os três últimos são os da planilha da etapa "Problema".
const ORDER_ISSUES = ['Valor diferente entre planilha e sistema', 'Cadastro do cliente incompleto', 'Pedido lançado em duplicidade'];
const orders = generate(1048, (rand, day) => (isWeekend(day) ? between(rand, 1, 2) : between(rand, 3, 6)), (rand, day) => {
  const pendingChance = day >= 28 ? 0.45 : day >= 24 ? 0.15 : 0.03;
  return {
    day,
    status: rand() < pendingChance ? 'pendente' : 'concluido',
    category: weighted(rand, [['Comercial', 45], ['Operação', 35], ['Financeiro', 20]]),
    source: weighted(rand, [['Planilha comercial', 50], ['Loja online', 30], ['WhatsApp', 20]]),
    value: between(rand, 8, 90) * 10,
    customer: `Cliente ${String(between(rand, 1, 40)).padStart(2, '0')}`,
    issue: rand() < 0.06 ? pick(rand, ORDER_ISSUES) : null,
  };
});
orders.push(
  { day: LAST_DAY, status: 'pendente', category: 'Comercial', source: 'Planilha comercial', value: 320, customer: 'Cliente 07', issue: null, next: 'Conferir o valor' },
  { day: LAST_DAY, status: 'pendente', category: 'Operação', source: 'Loja online', value: 180, customer: 'Cliente 12', issue: null, next: 'Copiar para o sistema' },
  { day: LAST_DAY, status: 'pendente', category: 'Financeiro', source: 'WhatsApp', value: 460, customer: 'Cliente 03', issue: 'Valor diferente entre planilha e sistema', next: 'Atualizar a situação' },
);
orders.forEach((order, i) => { order.id = String(1051 - orders.length + i); order.title = order.customer; });

// Documentos: os cinco do dia 30 são os cartões do resultado no hero.
const DOC_ISSUES = ['Campo obrigatório ausente', 'Assinatura pendente', 'Valor ilegível no arquivo'];
const DOC_TITLES = { Contrato: 'Contrato comercial', Comprovante: 'Recibo de serviço', Pedido: 'Pedido de compra' };
const documents = generate(208, (rand, day) => (isWeekend(day) ? between(rand, 0, 1) : between(rand, 1, 3)), (rand, day) => {
  const status = day >= 28 ? weighted(rand, [['recebido', 35], ['analise', 35], ['organizado', 30]]) : day >= 22 ? weighted(rand, [['analise', 10], ['organizado', 90]]) : 'organizado';
  return {
    day, status,
    category: weighted(rand, [['Nota fiscal', 45], ['Contrato', 15], ['Comprovante', 25], ['Pedido', 15]]),
    source: weighted(rand, [['E-mail', 50], ['Upload', 30], ['Digitalização', 20]]),
    issue: status !== 'organizado' && rand() < 0.3 ? pick(rand, DOC_ISSUES) : null,
  };
});
let invoiceNumber = 208 - documents.filter(doc => doc.category === 'Nota fiscal').length;
let otherNumber = 300;
documents.forEach(doc => {
  if (doc.category === 'Nota fiscal') { doc.id = `nf${invoiceNumber}`; doc.title = `Nota fiscal ${invoiceNumber++}`; }
  else { doc.id = `doc${otherNumber}`; doc.title = `${DOC_TITLES[doc.category]} ${otherNumber++}`; }
});
documents.push(
  { id: 'nf208', title: 'Nota fiscal 208', category: 'Nota fiscal', status: 'recebido', source: 'E-mail', day: LAST_DAY, issue: null, fields: [['Fornecedor', 'Empresa A'], ['Valor', 'R$ 320,00'], ['Próxima etapa', 'Extrair informações']] },
  { id: 'contrato', title: 'Contrato comercial', category: 'Contrato', status: 'recebido', source: 'Upload', day: LAST_DAY, issue: 'Assinatura pendente', fields: [['Cliente', 'Empresa B'], ['Vigência', '12 meses'], ['Próxima etapa', 'Revisar cláusulas']] },
  { id: 'nf209', title: 'Nota fiscal 209', category: 'Nota fiscal', status: 'analise', source: 'E-mail', day: LAST_DAY, issue: null, fields: [['Fornecedor', 'Empresa C'], ['Valor', 'R$ 180,00'], ['Próxima etapa', 'Conferência humana']] },
  { id: 'recibo', title: 'Recibo de serviço', category: 'Comprovante', status: 'organizado', source: 'Digitalização', day: LAST_DAY, issue: null, fields: [['Prestador', 'Empresa D'], ['Valor', 'R$ 460,00'], ['Situação', 'Classificado e organizado']] },
  { id: 'pedido', title: 'Pedido de compra', category: 'Pedido', status: 'organizado', source: 'Upload', day: LAST_DAY, issue: null, fields: [['Código', 'PC 1050'], ['Área', 'Operação'], ['Situação', 'Classificado e organizado']] },
);

// Atendimento: os quatro tickets do dia 30 são os da lista do hero.
const SUBJECTS = { Pedidos: ['Acompanhar pedido', 'Trocar um produto'], Agendamentos: ['Agendar uma visita', 'Remarcar horário'], Financeiro: ['Dúvida sobre pagamento', 'Segunda via de boleto'], Orçamentos: ['Solicitar orçamento', 'Revisar proposta'] };
const tickets = generate(1047, (rand, day) => (isWeekend(day) ? between(rand, 1, 3) : between(rand, 3, 6)), (rand, day) => {
  const category = weighted(rand, [['Pedidos', 40], ['Agendamentos', 20], ['Financeiro', 20], ['Orçamentos', 20]]);
  const status = day >= 29 ? weighted(rand, [['pendentes', 40], ['andamento', 30], ['resolvidos', 30]]) : day >= 26 ? weighted(rand, [['pendentes', 10], ['andamento', 20], ['resolvidos', 70]]) : 'resolvidos';
  return {
    day, category, status,
    title: pick(rand, SUBJECTS[category]),
    owner: pick(rand, ['Ana', 'Bruno', 'Carla']),
    source: weighted(rand, [['WhatsApp', 70], ['E-mail', 20], ['Site', 10]]),
    issue: status === 'pendentes' ? 'Sem resposta há mais de 24 horas' : null,
  };
});
tickets.forEach((ticket, i) => { ticket.id = String(1048 - tickets.length + i); });
tickets.push(
  { id: '1048', title: 'Acompanhar pedido', owner: 'Ana', status: 'pendentes', category: 'Pedidos', source: 'WhatsApp', day: LAST_DAY, issue: null },
  { id: '1049', title: 'Agendar uma visita', owner: 'Bruno', status: 'andamento', category: 'Agendamentos', source: 'WhatsApp', day: LAST_DAY, issue: null },
  { id: '1050', title: 'Dúvida sobre pagamento', owner: 'Carla', status: 'resolvidos', category: 'Financeiro', source: 'WhatsApp', day: LAST_DAY, issue: null },
  { id: '1051', title: 'Solicitar orçamento', owner: 'Ana', status: 'pendentes', category: 'Orçamentos', source: 'WhatsApp', day: LAST_DAY, issue: null },
);

/**
 * Configuração de cada painel. "distribution" é o campo do gráfico de distribuição;
 * "chips" é o campo dos filtros rápidos acima da lista.
 */
export const DASHBOARDS = {
  planilhas: {
    key: 'planilhas', title: 'Controle de pedidos', tab: 'Pedidos', noun: ['pedido', 'pedidos'], money: true, interest: 'Sistemas sob medida',
    statusLabel: 'Situação', statuses: [['pendente', 'Pendente'], ['concluido', 'Concluído']],
    categoryLabel: 'Área', categories: ['Comercial', 'Operação', 'Financeiro'],
    distribution: 'category', chips: 'status',
    kpis: [['total', 'Pedidos registrados'], ['status:pendente', 'Pendências'], ['sources', 'Fontes de informação'], ['issues', 'Situações que precisam de atenção']],
    chartTitle: 'Pedidos por dia', distributionTitle: 'Pedidos por área',
    records: sequence(orders),
  },
  documentos: {
    key: 'documentos', title: 'Organização de documentos', tab: 'Documentos', noun: ['documento', 'documentos'], money: false, interest: 'Automação de processos internos',
    statusLabel: 'Etapa', statuses: [['recebido', 'Recebido'], ['analise', 'Em análise'], ['organizado', 'Organizado']],
    categoryLabel: 'Tipo', categories: ['Nota fiscal', 'Contrato', 'Comprovante', 'Pedido'],
    distribution: 'status', chips: 'category',
    kpis: [['total', 'Documentos recebidos'], ['status:analise', 'Em análise'], ['status:organizado', 'Organizados'], ['issues', 'Precisam de revisão']],
    chartTitle: 'Documentos recebidos por dia', distributionTitle: 'Documentos por etapa',
    records: sequence(documents),
  },
  atendimento: {
    key: 'atendimento', title: 'Central de atendimento', tab: 'Atendimento', noun: ['ticket', 'tickets'], money: false, interest: 'Atendimento pelo WhatsApp',
    statusLabel: 'Situação', statuses: [['pendentes', 'Pendente'], ['andamento', 'Em andamento'], ['resolvidos', 'Resolvido']],
    categoryLabel: 'Assunto', categories: ['Pedidos', 'Agendamentos', 'Financeiro', 'Orçamentos'],
    distribution: 'category', chips: 'status',
    kpis: [['total', 'Tickets recebidos'], ['status:pendentes', 'Pendentes'], ['status:andamento', 'Em andamento'], ['status:resolvidos', 'Resolvidos']],
    chartTitle: 'Tickets por dia', distributionTitle: 'Tickets por assunto',
    records: sequence(tickets),
  },
};

/** Reais no formato brasileiro, sem depender da localidade do navegador. */
export function formatMoney(value) {
  const [int, cents] = Number(value).toFixed(2).split('.');
  return `R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${cents}`;
}

/** Painel pelo nome, com o de pedidos como padrão para nomes desconhecidos. */
export function getDashboard(key) {
  return DASHBOARDS[key] || DASHBOARDS.planilhas;
}

/** Valores fora da lista permitida voltam ao padrão. */
export function normalizeFilters(key, filters = {}) {
  const dashboard = getDashboard(key);
  return {
    period: Object.hasOwn(PERIODS, filters.period) ? filters.period : 'semana',
    category: dashboard.categories.includes(filters.category) ? filters.category : 'todas',
    status: dashboard.statuses.some(([status]) => status === filters.status) ? filters.status : 'todos',
  };
}

export function filterRecords(records, filters) {
  const from = PERIODS[filters.period].from;
  return records.filter(record => record.day >= from
    && (filters.category === 'todas' || record.category === filters.category)
    && (filters.status === 'todos' || record.status === filters.status));
}

export const statusLabel = (key, status) => getDashboard(key).statuses.find(([value]) => value === status)?.[1] ?? status;

/**
 * Todas as métricas saem do mesmo conjunto filtrado: indicadores, série por dia e lista.
 * A distribuição ignora apenas o próprio filtro, para que todas as opções continuem selecionáveis.
 */
export function computeMetrics(key, rawFilters) {
  const dashboard = getDashboard(key);
  const filters = normalizeFilters(dashboard.key, rawFilters);
  const records = filterRecords(dashboard.records, filters).sort((a, b) => b.seq - a.seq);
  const byStatus = Object.fromEntries(dashboard.statuses.map(([status]) => [status, records.filter(record => record.status === status).length]));
  const value = records.reduce((sum, record) => sum + (record.value || 0), 0);
  const sources = new Set(records.map(record => record.source)).size;
  const issues = records.filter(record => record.issue).length;
  const kpiValue = kpi => (kpi === 'total' ? records.length : kpi === 'sources' ? sources : kpi === 'issues' ? issues : byStatus[kpi.slice('status:'.length)] ?? 0);

  const series = [];
  for (let day = PERIODS[filters.period].from; day <= LAST_DAY; day++) {
    series.push({ day, label: filters.period === 'semana' ? weekday(day) : String(day), count: records.filter(record => record.day === day).length });
  }

  const field = dashboard.distribution;
  const base = filterRecords(dashboard.records, { ...filters, [field]: field === 'category' ? 'todas' : 'todos' });
  const options = field === 'category' ? dashboard.categories.map(category => [category, category]) : dashboard.statuses;
  const distribution = options.map(([option, label]) => ({ key: option, label, count: base.filter(record => record[field] === option).length }));

  return {
    key: dashboard.key, filters, records, total: records.length, value, byStatus, sources, issues,
    kpis: dashboard.kpis.map(([kpi, label]) => ({ key: kpi, label, value: kpiValue(kpi) })),
    series, distribution,
  };
}

/** Registros de "hoje" (dia 30), usados no resultado compacto do hero. */
export function todayRecords(key) {
  return getDashboard(key).records.filter(record => record.day === LAST_DAY);
}

/** Campos do detalhe de um registro, prontos para exibir como texto. */
export function recordDetails(key, record) {
  const dashboard = getDashboard(key);
  const common = [['Recebido em', record.day === LAST_DAY ? 'Hoje (dia 30)' : `Dia ${record.day}`], [dashboard.categoryLabel, record.category], ['Origem', record.source], [dashboard.statusLabel, statusLabel(key, record.status)]];
  if (dashboard.key === 'planilhas') {
    return [['Pedido', `#${record.id}`], ['Cliente', record.customer], ['Valor', formatMoney(record.value)], ...common, ['Próxima ação', record.next || (record.status === 'pendente' ? 'Conferir e confirmar' : 'Nenhuma pendência')]];
  }
  if (dashboard.key === 'documentos') return [...(record.fields || [['Próxima etapa', record.status === 'organizado' ? 'Arquivado' : 'Revisão pela equipe']]), ...common];
  return [['Ticket', `#${record.id}`], ['Responsável', record.owner], ...common];
}
