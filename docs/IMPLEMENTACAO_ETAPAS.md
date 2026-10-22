# Execução do plano técnico — Luminor

## Etapa 1 — Correções essenciais (P0)
- [x] LUM-001 viewport + breakpoints para celular.
- [x] LUM-002 menu mobile acessível, tecla Esc, fechar ao navegar.
- [x] LUM-003 endpoint real `POST /api/leads` para servidor Node com persistência local.
- [x] LUM-004 validação de campos, honeypot, proteção básica contra abuso e indicação de status de envio.
- [~] LUM-005 seção de contato preparada; contatos/CNPJ dependem de informações verdadeiras.
- [x] LUM-006 depoimentos fictícios retirados; espaço para casos autorizados.
- [x] LUM-007 nenhuma promessa de ausência de bloqueios na API do WhatsApp.

## Etapa 2 — Conversão (P1)
- [x] LUM-008 novo topo com mensagem objetiva e CTA principal.
- [x] LUM-009 três ofertas organizam oito capacidades.
- [x] LUM-010 CTA de cada grupo preenche interesse do lead.
- [~] LUM-011 botão de WhatsApp fixo apenas se número real for configurado.
- [x] LUM-012 hierarquia, design system, tipografia e grid responsivos.
- [x] LUM-013 mensagens de interesse contextualizadas no formulário.

## Etapa 3 — Demonstrações (P1)
- [x] Calculadora de tempo e custo potencial, com premissas e disclaimers.
- [x] Quatro cenários de mensagens (pedido, cobrança, agenda, atendimento humano).
- [x] Painel interativo com cinco abas e dados fictícios claramente identificados.

## Etapa 4 — SEO e confiança (P2)
- [~] LUM-014 estudos de caso preparados na arquitetura, dependem de autorização e dados reais.
- [~] LUM-015 depoimentos reais dependem de autorização; fictícios não publicados.
- [~] LUM-016 seção de princípios técnicos e página preliminar de privacidade; LGPD precisa aprovação formal.
- [~] LUM-017 metadados, Open Graph, robots, semântica; canonical/sitemap dependem de domínio final.
- [x] LUM-018 frontend sem bibliotecas externas, com assets leves e CSS/JS locais.
- [~] LUM-019 eventos de consentimento e integração GA4 opcional; medição real exige ID e homologação.
- [x] LUM-020 labels, foco, teclado, ARIA, movimento reduzido.

## Etapa 5 — QA e publicação
- [x] Testes locais de API e inspeção de navegação/responsividade automatizada.
- [~] Domínio público e deployment: não realizados sem acesso à hospedagem.
- [~] Lighthouse, LGPD, credenciais, cópias de segurança e armazenamento persistente de produção: pendentes.

Legenda: [x] entregue / [~] implementação parcial ou dependência externa.
