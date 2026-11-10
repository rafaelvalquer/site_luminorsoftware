// Dados demonstrativos dos cenários do exemplo interativo. Nenhum registro representa cliente real.

export const FLOW_SCENARIOS = {
  planilhas: { file: 'controle_pedidos.xlsx', source: 'Planilhas', result: 'Aplicação', message: 'Dados consolidados. Equipe no controle.', columns: ['Pedido', 'Valor', 'Situação'], rows: [['#1048', 'R$ 320', 'Conferir'], ['#1049', 'R$ 180', 'Copiar'], ['#1050', 'R$ 460', 'Atualizar']], gain: 'As planilhas viram uma visão clara da operação. Explore o dashboard.' },
  documentos: { file: 'documentos_da_equipe', source: 'Documentos', result: 'Registros', message: 'Informações extraídas. Revisão pela equipe.', gain: 'Cada documento encontra seu lugar. Selecione um cartão para ver os dados.' },
  atendimento: { file: 'mensagens_de_clientes', source: 'WhatsApp', result: 'Equipe', message: 'Solicitações organizadas. Contexto com a equipe.', gain: 'Conversas viram tickets com contexto e responsável. Explore os filtros.' },
};

export const FLOW_CAPTIONS = [
  'Informações espalhadas e a mesma tarefa feita várias vezes.',
  'A Luminor entende a rotina e mapeia as etapas que se repetem.',
  'Criamos um fluxo sob medida que conecta dados, ferramentas e pessoas.',
];

export const DOCUMENTS = [
  { id: 'nf208', title: 'Nota fiscal 208', category: 'Nota fiscal', stage: 0, fields: [['Fornecedor', 'Empresa A'], ['Valor', 'R$ 320,00'], ['Próxima etapa', 'Extrair informações']] },
  { id: 'contrato', title: 'Contrato comercial', category: 'Contrato', stage: 0, fields: [['Cliente', 'Empresa B'], ['Vigência', '12 meses'], ['Próxima etapa', 'Revisar cláusulas']] },
  { id: 'nf209', title: 'Nota fiscal 209', category: 'Nota fiscal', stage: 1, fields: [['Fornecedor', 'Empresa C'], ['Valor', 'R$ 180,00'], ['Próxima etapa', 'Conferência humana']] },
  { id: 'recibo', title: 'Recibo de serviço', category: 'Comprovante', stage: 2, fields: [['Prestador', 'Empresa D'], ['Valor', 'R$ 460,00'], ['Situação', 'Classificado e organizado']] },
  { id: 'pedido', title: 'Pedido de compra', category: 'Pedido', stage: 2, fields: [['Código', 'PC 1050'], ['Área', 'Operação'], ['Situação', 'Classificado e organizado']] },
];

export const TICKETS = [
  { id: '1048', title: 'Acompanhar pedido', owner: 'Ana', status: 'pendentes', label: 'Pendente', initial: 'A' },
  { id: '1049', title: 'Agendar uma visita', owner: 'Bruno', status: 'andamento', label: 'Em andamento', initial: 'B' },
  { id: '1050', title: 'Dúvida sobre pagamento', owner: 'Carla', status: 'resolvidos', label: 'Resolvido', initial: 'C' },
  { id: '1051', title: 'Solicitar orçamento', owner: 'Ana', status: 'pendentes', label: 'Pendente', initial: 'A' },
];
