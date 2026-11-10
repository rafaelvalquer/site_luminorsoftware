// Experiência 03 — laboratório de integrações (#integracoes-lab).
// Simulação educativa: nenhuma chamada de rede, nenhum dado real. As regras de cada etapa
// e o tratamento de falhas mostrados aqui são exemplos; em cada projeto eles são definidos com a empresa.
import { $, $$, el, svg, icon } from './dom.js';
import { createTimers, createLifecycle, prefersReducedMotion } from './motion.js';

export const NODE_STATES = { waiting: 'Aguardando', processing: 'Processando', success: 'Concluído', error: 'Indisponível' };
export const RECORD_STATES = { waiting: 'Aguardando envio', processing: 'Em processamento', delivered: 'Entregue', pending: 'Pendente' };
/** Duração de cada quadro, em milissegundos: envio por uma ligação e processamento em um nó. */
export const FRAME_DURATIONS = { transfer: 650, process: 800 };

const automation = (fields) => ({ icon: 'gear', name: 'Automação Luminor', role: 'Regras', core: true, ...fields });

export const INTEGRATION_EXAMPLES = {
  financeiro: {
    label: 'Pedidos e financeiro', record: 'Pedido #1050 · R$ 460,00', failAt: 2,
    nodes: [
      { icon: 'grid', name: 'Sistema de pedidos', role: 'Origem', function: 'Registra cada venda', receives: 'Pedidos lançados pela equipe ou pela loja online.', transforms: 'Nada: o pedido segue como foi confirmado.', sends: 'Para a automação, quando o pedido é confirmado.', validates: 'Pedido confirmado e com cliente identificado.', step: 'Pedido #1050 confirmado no sistema de pedidos.' },
      automation({ function: 'Valida e organiza os dados', receives: 'Cliente, itens, valor e forma de pagamento do pedido.', transforms: 'Confere o valor e monta o lançamento a receber no formato do financeiro.', sends: 'Lançamento para o controle financeiro.', validates: 'Valor maior que zero, cliente cadastrado e pedido ainda não lançado.', step: 'Automação confere o valor e monta o lançamento.' }),
      { icon: 'shield', name: 'Controle financeiro', role: 'Destino', function: 'Registra o valor a receber', receives: 'Lançamento com cliente, valor e vencimento.', transforms: 'Registra o valor a receber e atualiza o saldo previsto.', sends: 'Movimentações para os relatórios.', validates: 'Vencimento informado e lançamento sem duplicidade.', step: 'Controle financeiro registra o valor a receber.' },
      { icon: 'trend', name: 'Relatórios', role: 'Consulta', function: 'Mostra a visão consolidada', receives: 'Movimentações do controle financeiro.', transforms: 'Agrupa por período, cliente e situação.', sends: 'Para a equipe, em um painel de acompanhamento.', validates: 'Período e filtros definidos para cada relatório.', step: 'Relatórios atualizados com o novo pedido.' },
    ],
  },
  clientes: {
    label: 'Clientes e CRM', record: 'Cadastro · Empresa B', failAt: 2,
    nodes: [
      { icon: 'layer', name: 'Cadastro de clientes', role: 'Origem', function: 'Guarda os dados de cada cliente', receives: 'Cadastros feitos pela equipe ou pelo site.', transforms: 'Nada: o cadastro segue como foi salvo.', sends: 'Para a automação, a cada cadastro novo ou alterado.', validates: 'Campos obrigatórios preenchidos.', step: 'Cadastro da Empresa B salvo.' },
      automation({ function: 'Padroniza e evita duplicidade', receives: 'Nome, contato e segmento do cliente.', transforms: 'Padroniza nomes e telefones e confere se o cliente já existe no CRM.', sends: 'Contato pronto para o CRM.', validates: 'Contato válido e cliente ainda não cadastrado no CRM.', step: 'Automação padroniza os dados e procura duplicidades.' }),
      { icon: 'message', name: 'CRM', role: 'Destino', function: 'Acompanha o relacionamento', receives: 'Contato padronizado.', transforms: 'Cria ou atualiza o contato e define um responsável.', sends: 'Tarefa de primeiro contato para a equipe comercial.', validates: 'Responsável definido para cada contato.', step: 'CRM cria o contato com um responsável.' },
    ],
  },
  estoque: {
    label: 'Pedidos e estoque', record: 'Pedido #1049 · 3 itens', failAt: 2,
    nodes: [
      { icon: 'grid', name: 'Pedidos', role: 'Origem', function: 'Registra cada venda', receives: 'Pedidos confirmados com seus itens.', transforms: 'Nada: os itens seguem como foram vendidos.', sends: 'Para a automação, quando o pedido é confirmado.', validates: 'Pedido confirmado e com itens.', step: 'Pedido #1049 confirmado com 3 itens.' },
      automation({ function: 'Traduz itens e quantidades', receives: 'Itens e quantidades do pedido.', transforms: 'Converte cada item para o código usado no estoque.', sends: 'Baixa de quantidades para o estoque.', validates: 'Item existente e quantidade disponível.', step: 'Automação confere os itens e as quantidades.' }),
      { icon: 'layer', name: 'Estoque', role: 'Destino', function: 'Controla as quantidades', receives: 'Baixa por item e quantidade.', transforms: 'Atualiza o saldo de cada produto.', sends: 'Aviso quando um item fica abaixo do mínimo.', validates: 'O saldo não pode ficar negativo.', step: 'Estoque atualiza o saldo dos 3 itens.' },
    ],
  },
  formulario: {
    label: 'Formulário e sistema interno', record: 'Solicitação #208', failAt: 2,
    nodes: [
      { icon: 'mail', name: 'Formulário', role: 'Origem', function: 'Recebe solicitações', receives: 'Respostas enviadas pelo site.', transforms: 'Nada: as respostas seguem como foram enviadas.', sends: 'Para a automação, a cada envio.', validates: 'Campos obrigatórios e consentimento confirmados.', step: 'Solicitação #208 enviada pelo formulário.' },
      automation({ function: 'Classifica e preenche', receives: 'Respostas do formulário.', transforms: 'Classifica o assunto e preenche os campos do sistema interno.', sends: 'Solicitação classificada para o sistema interno.', validates: 'Assunto reconhecido e dados completos.', step: 'Automação classifica o assunto da solicitação.' }),
      { icon: 'cpu', name: 'Sistema interno', role: 'Destino', function: 'Organiza o trabalho da equipe', receives: 'Solicitação classificada.', transforms: 'Cria o registro e define a fila responsável.', sends: 'Aviso para a pessoa responsável.', validates: 'Fila definida para cada assunto.', step: 'Sistema interno cria o registro na fila certa.' },
    ],
  },
  documentos: {
    label: 'Documentos e registros', record: 'Nota fiscal 209', failAt: 2,
    nodes: [
      { icon: 'mail', name: 'Documentos', role: 'Origem', function: 'Chegam por e-mail ou upload', receives: 'Arquivos em PDF ou imagem.', transforms: 'Nada: o arquivo original é preservado.', sends: 'Para a automação, a cada arquivo recebido.', validates: 'Formato de arquivo aceito.', step: 'Nota fiscal 209 recebida por e-mail.' },
      automation({ function: 'Identifica e extrai campos', receives: 'Arquivo do documento.', transforms: 'Identifica o tipo e extrai fornecedor, valor e data para revisão.', sends: 'Campos extraídos para a organização de registros.', validates: 'Campos legíveis; dúvidas seguem para revisão humana.', step: 'Automação identifica o tipo e extrai os campos.' }),
      { icon: 'grid', name: 'Organização de registros', role: 'Destino', function: 'Arquiva com contexto', receives: 'Documento com os campos extraídos.', transforms: 'Arquiva na pasta certa e registra os campos.', sends: 'Registro disponível para consulta.', validates: 'Documento sem registro anterior.', step: 'Registro criado e arquivo organizado.' },
    ],
  },
};

export const getExample = key => INTEGRATION_EXAMPLES[key] || INTEGRATION_EXAMPLES.financeiro;

/** Estado de repouso de um exemplo: tudo aguardando. */
export function idleFrame(example) {
  return {
    nodes: example.nodes.map(() => 'waiting'), links: example.nodes.slice(1).map(() => 'idle'),
    status: 'waiting', record: 'waiting', message: 'Escolha uma ação para ver o caminho da informação.', duration: 0,
  };
}

/**
 * Quadros da simulação. "success" percorre todos os nós; "failure" para no destino indisponível
 * e deixa o registro pendente; "retry" parte desse ponto e conclui a entrega.
 */
export function simulationFrames(example, mode = 'success') {
  const { nodes, failAt } = example;
  const states = nodes.map(() => 'waiting');
  const links = nodes.slice(1).map(() => 'idle');
  const frames = [];
  const push = (message, duration, extra = {}) => frames.push({ nodes: [...states], links: [...links], status: 'processing', record: 'processing', message, duration, ...extra });
  let start = 0;
  if (mode === 'retry') {
    for (let i = 0; i < failAt; i++) states[i] = 'success';
    for (let i = 0; i < failAt - 1; i++) links[i] = 'done';
    start = failAt;
  }
  for (let i = start; i < nodes.length; i++) {
    if (i > 0) {
      links[i - 1] = 'active';
      push(mode === 'retry' && i === start ? `Nova tentativa de envio para ${nodes[i].name}.` : `Enviando para ${nodes[i].name}.`, FRAME_DURATIONS.transfer);
    }
    if (mode === 'failure' && i === failAt) {
      states[i] = 'error';
      links[i - 1] = 'blocked';
      push(`${nodes[i].name} não respondeu. O registro fica pendente, aguardando uma nova tentativa.`, 0, { status: 'simulated-error', record: 'pending' });
      return frames;
    }
    if (i > 0) links[i - 1] = 'done';
    states[i] = 'processing';
    push(nodes[i].step, FRAME_DURATIONS.process);
    states[i] = 'success';
  }
  push(mode === 'retry'
    ? `Nova tentativa concluída: ${example.record} chegou ao destino sem nova digitação.`
    : `Integração concluída: ${example.record} passou por todas as etapas sem nova digitação.`, 0, { status: 'success', record: 'delivered' });
  return frames;
}

// ===== Controlador =====
export function setupIntegrationLab(root, { track = () => {} } = {}) {
  const timers = createTimers();
  const lifecycle = createLifecycle();
  const diagram = $('.lab-diagram', root);
  const detail = $('#lab-detail', root);
  const timeline = $('#lab-timeline', root);
  const status = $('#lab-status', root);
  const recordName = $('#lab-record-name', root);
  const recordState = $('#lab-record-state', root);
  let key = 'financeiro';
  let selected = 1;
  let frames = [];
  let index = -1;
  let mode = null;

  const example = () => getExample(key);
  const current = () => (index >= 0 ? frames[index] : idleFrame(example()));

  function nodeButton(node, i) {
    return el('button', { type: 'button', class: 'lab-node', 'data-lab-node': i, 'data-kind': node.core ? 'core' : null, 'aria-pressed': 'false', 'aria-controls': 'lab-detail' },
      el('span', { class: 'lab-node-icon' }, icon(node.icon)),
      el('span', { class: 'lab-node-role', text: node.role }),
      el('strong', { class: 'lab-node-name', text: node.name }),
      el('span', { class: 'lab-node-function', text: node.function }),
      el('span', { class: 'lab-node-state' }, el('i', { 'aria-hidden': 'true' }), el('span', { text: NODE_STATES.waiting })));
  }

  function link(i) {
    return el('span', { class: 'lab-link', 'data-lab-link': i, 'aria-hidden': 'true' },
      svg('svg', { class: 'lab-wire', focusable: 'false' },
        svg('line', { class: 'wire-h', x1: '0', y1: '50%', x2: '100%', y2: '50%' }),
        svg('line', { class: 'wire-v', x1: '50%', y1: '0', x2: '50%', y2: '100%' })),
      el('i', { class: 'lab-pulse' }));
  }

  /** Monta o diagrama e a linha do tempo do exemplo atual. */
  function build() {
    const { nodes } = example();
    diagram.style.setProperty('--count', String(nodes.length));
    diagram.replaceChildren(...nodes.map((node, i) => el('li', { class: 'lab-step' }, i > 0 ? link(i - 1) : null, nodeButton(node, i))));
    timeline.replaceChildren(...nodes.map((node, i) => el('li', { 'data-lab-row': i, 'data-state': 'waiting' },
      el('span', { class: 'lab-row-mark', 'aria-hidden': 'true' }), el('span', { text: node.step }))));
    recordName.textContent = example().record;
    root.dataset.example = key;
  }

  function renderDetail() {
    const node = example().nodes[selected];
    detail.replaceChildren(
      el('span', { class: 'lab-kicker', text: `${node.role.toUpperCase()} · O QUE ACONTECE AQUI` }),
      el('h3', { text: node.name }),
      el('dl', {}, [['Recebe', node.receives], ['Transforma', node.transforms], ['Envia para', node.sends], ['Validações', node.validates]]
        .map(([term, text]) => el('div', {}, el('dt', { text: term }), el('dd', { text })))),
    );
    $$('[data-lab-node]', diagram).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.labNode) === selected)));
  }

  function renderFrame() {
    const frame = current();
    frame.nodes.forEach((state, i) => {
      const node = $(`[data-lab-node="${i}"]`, diagram);
      node.dataset.state = state;
      $('.lab-node-state span', node).textContent = NODE_STATES[state];
      $(`[data-lab-row="${i}"]`, timeline).dataset.state = state;
    });
    frame.links.forEach((state, i) => { $(`[data-lab-link="${i}"]`, diagram).dataset.state = state; });
    root.dataset.state = frame.status;
    root.dataset.mode = mode || 'idle';
    recordState.textContent = RECORD_STATES[frame.record];
    recordState.dataset.state = frame.record;
    // A região de status só fala no início e no fim de uma simulação, para não narrar cada quadro.
    if (index >= 0 && (frame.status !== 'processing' || index === 0)) status.textContent = frame.status === 'processing' ? 'Simulação em andamento.' : frame.message;
    $('#lab-message', root).textContent = frame.message;
    // aria-disabled em vez de disabled: o botão mantém o foco durante a nova tentativa.
    $('#lab-retry', root).setAttribute('aria-disabled', String(frame.status !== 'simulated-error'));
  }

  function advance() {
    if (index >= frames.length - 1) return;
    index++;
    renderFrame();
    if (frames[index].duration) timers.after(frames[index].duration, advance);
  }

  function run(nextMode) {
    timers.clear();
    mode = nextMode;
    frames = simulationFrames(example(), nextMode);
    if (prefersReducedMotion()) { index = frames.length - 1; renderFrame(); }
    else { index = -1; advance(); }
    if (nextMode === 'failure') track('integration_error_demo', { scenario: key, component: 'integrations' });
    else track('integration_simulate', { scenario: key, component: 'integrations', action: nextMode });
  }

  /** Conclui na hora (aba oculta, por exemplo), sem deixar temporizadores ativos. */
  function finish() {
    timers.clear();
    if (frames.length && index < frames.length - 1) { index = frames.length - 1; renderFrame(); }
  }

  function chooseExample(next) {
    if (!Object.hasOwn(INTEGRATION_EXAMPLES, next) || next === key) return;
    timers.clear();
    key = next;
    selected = 1;
    frames = [];
    index = -1;
    mode = null;
    build();
    renderDetail();
    renderFrame();
    status.textContent = '';
    $$('[data-lab-example]', root).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.labExample === key)));
    track('demo_scenario_select', { scenario: key, component: 'integrations' });
  }

  lifecycle.listen(root, 'click', event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.dataset.labNode !== undefined) { selected = Number(button.dataset.labNode); renderDetail(); }
    else if (button.dataset.labExample) chooseExample(button.dataset.labExample);
    else if (button.id === 'lab-run') run('success');
    else if (button.id === 'lab-failure') run('failure');
    else if (button.id === 'lab-retry' && current().status === 'simulated-error') run('retry');
  });
  lifecycle.onPageHidden(finish);
  lifecycle.onMotionChange(reduced => { if (reduced) finish(); });

  build();
  renderDetail();
  renderFrame();
  $$('[data-lab-js]', root).forEach(node => { node.hidden = false; });
  root.classList.add('is-ready');

  return {
    getState: () => ({ example: key, selected, mode, frame: index, status: current().status, record: current().record }),
    pendingTimers: () => timers.pending(),
    /** Conclui na hora uma simulação em andamento (aba trocada ou página oculta). */
    finish,
    destroy() { timers.clear(); lifecycle.destroy(); },
  };
}
