import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DASHBOARDS, PERIODS, LAST_DAY, computeMetrics, filterRecords, normalizeFilters, getDashboard,
  todayRecords, recordDetails, statusLabel, formatMoney, weekday,
} from '../public/assets/js/experiences/scenarios.js';

const keys = Object.keys(DASHBOARDS);
const sum = values => values.reduce((total, value) => total + value, 0);

/** Todas as combinações de filtros de um painel (período × categoria × situação). */
function combos(key) {
  const d = DASHBOARDS[key];
  const out = [];
  for (const period of Object.keys(PERIODS)) {
    for (const category of ['todas', ...d.categories]) {
      for (const status of ['todos', ...d.statuses.map(([value]) => value)]) out.push({ period, category, status });
    }
  }
  return out;
}

test('painel: dados determinísticos e fictícios', () => {
  assert.deepEqual(keys, ['planilhas', 'documentos', 'atendimento']);
  assert.deepEqual(keys.map(key => DASHBOARDS[key].records.length), [102, 48, 116]);
  for (const key of keys) {
    const { records } = DASHBOARDS[key];
    assert.equal(new Set(records.map(record => record.id)).size, records.length, `${key}: ids únicos`);
    assert(records.every(record => record.day >= 1 && record.day <= LAST_DAY));
    assert.deepEqual(computeMetrics(key, { period: 'mes' }), computeMetrics(key, { period: 'mes' }), `${key}: mesmos filtros, mesmos números`);
    // Nada de dados pessoais: sem e-mails, telefones ou documentos nos registros.
    assert(!/@|\(\d{2}\)|\d{3}\.\d{3}\.\d{3}/.test(JSON.stringify(records)), `${key}: sem dados pessoais`);
  }
});

test('painel: indicadores da semana usados no resultado do hero', () => {
  assert.deepEqual(computeMetrics('planilhas', { period: 'semana' }).kpis.map(item => item.value), [25, 8, 3, 2]);
  assert.deepEqual(computeMetrics('documentos', { period: 'semana' }).kpis.map(item => item.value), [13, 3, 7, 1]);
  assert.deepEqual(computeMetrics('atendimento', { period: 'semana' }).kpis.map(item => item.value), [20, 5, 2, 13]);
  assert.equal(computeMetrics('planilhas', { period: 'semana' }).value, 10580);
});

test('painel: indicadores, série, distribuição e lista saem do mesmo conjunto', () => {
  for (const key of keys) {
    const d = DASHBOARDS[key];
    for (const filters of combos(key)) {
      const m = computeMetrics(key, filters);
      const label = `${key} ${JSON.stringify(filters)}`;
      assert.equal(m.total, m.records.length, label);
      assert.equal(sum(m.series.map(point => point.count)), m.total, `${label}: série soma o total`);
      assert.equal(m.series.length, LAST_DAY - PERIODS[filters.period].from + 1, `${label}: um ponto por dia`);
      assert.equal(sum(Object.values(m.byStatus)), m.total, `${label}: situações somam o total`);
      assert.equal(m.value, sum(m.records.map(record => record.value || 0)), label);
      assert.equal(m.issues, m.records.filter(record => record.issue).length, label);
      for (const kpi of m.kpis) {
        const expected = kpi.key === 'total' ? m.total : kpi.key === 'sources' ? m.sources : kpi.key === 'issues' ? m.issues : m.byStatus[kpi.key.slice(7)];
        assert.equal(kpi.value, expected, `${label}: ${kpi.key}`);
      }
      // A distribuição ignora o próprio filtro, então soma o total sem ele.
      const field = d.distribution;
      const withoutOwn = computeMetrics(key, { ...filters, [field]: field === 'category' ? 'todas' : 'todos' });
      assert.equal(sum(m.distribution.map(item => item.count)), withoutOwn.total, `${label}: distribuição`);
      // A lista vem do mais recente para o mais antigo.
      assert(m.records.every((record, i) => i === 0 || m.records[i - 1].seq > record.seq), `${label}: ordem`);
    }
  }
});

test('painel: filtros por período, categoria e situação', () => {
  for (const key of keys) {
    for (const filters of combos(key)) {
      const { records } = computeMetrics(key, filters);
      assert(records.every(record => record.day >= PERIODS[filters.period].from));
      assert(records.every(record => filters.category === 'todas' || record.category === filters.category));
      assert(records.every(record => filters.status === 'todos' || record.status === filters.status));
    }
    const week = computeMetrics(key, { period: 'semana' }).total;
    const month = computeMetrics(key, { period: 'mes' }).total;
    assert(week > 0 && week < month, `${key}: a semana é parte do mês`);
    assert.equal(filterRecords(DASHBOARDS[key].records, normalizeFilters(key, {})).length, week);
  }
});

test('painel: valores desconhecidos voltam ao padrão', () => {
  assert.deepEqual(normalizeFilters('planilhas', { period: 'ano', category: '<img>', status: 'x' }), { period: 'semana', category: 'todas', status: 'todos' });
  assert.deepEqual(normalizeFilters('documentos', { period: 'mes', category: 'Contrato', status: 'organizado' }), { period: 'mes', category: 'Contrato', status: 'organizado' });
  assert.equal(getDashboard('inexistente'), DASHBOARDS.planilhas);
  assert.equal(computeMetrics('inexistente', {}).key, 'planilhas');
  assert.equal(statusLabel('atendimento', 'andamento'), 'Em andamento');
  assert.equal(statusLabel('atendimento', 'outro'), 'outro');
});

test('painel: combinações sem registros produzem estado vazio coerente', () => {
  for (const [key, filters] of [['documentos', { period: 'semana', category: 'Contrato', status: 'organizado' }], ['atendimento', { period: 'semana', category: 'Pedidos', status: 'andamento' }]]) {
    const m = computeMetrics(key, filters);
    assert.equal(m.total, 0);
    assert.deepEqual(m.records, []);
    assert(m.kpis.every(kpi => kpi.value === 0));
    assert(m.series.every(point => point.count === 0));
    assert(m.distribution.some(item => item.count > 0), 'as outras opções continuam disponíveis');
  }
});

test('painel: registros de hoje alimentam o resultado compacto', () => {
  assert.deepEqual(todayRecords('planilhas').map(record => record.id), ['1048', '1049', '1050']);
  assert.deepEqual(todayRecords('documentos').map(record => record.id), ['nf208', 'contrato', 'nf209', 'recibo', 'pedido']);
  const tickets = todayRecords('atendimento');
  assert.deepEqual(['pendentes', 'andamento', 'resolvidos'].map(status => tickets.filter(ticket => ticket.status === status).length), [2, 1, 1]);
  assert(todayRecords('documentos').find(record => record.id === 'nf209').fields.some(([, value]) => value === 'Empresa C'));
  assert.equal(weekday(LAST_DAY), 'Sex');
  assert.equal(weekday(LAST_DAY - 6), 'Sáb');
});

test('painel: detalhes e valores prontos para exibir como texto', () => {
  assert.equal(formatMoney(10580), 'R$ 10.580,00');
  assert.equal(formatMoney(320), 'R$ 320,00');
  assert.equal(formatMoney(1234567.5), 'R$ 1.234.567,50');
  for (const key of keys) {
    for (const record of DASHBOARDS[key].records) {
      const details = recordDetails(key, record);
      assert(details.length >= 4);
      assert(details.every(([label, value]) => typeof label === 'string' && typeof value === 'string' && value.length > 0), `${key} ${record.id}`);
    }
  }
  assert.deepEqual(recordDetails('planilhas', DASHBOARDS.planilhas.records.find(record => record.id === '1050')).at(-1), ['Próxima ação', 'Atualizar a situação']);
});
