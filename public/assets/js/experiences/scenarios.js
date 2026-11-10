// Dados demonstrativos dos cenários do exemplo interativo. Nenhum registro representa cliente real.

// Cada cenário descreve as quatro etapas: problema, análise, automação e resultado.
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
