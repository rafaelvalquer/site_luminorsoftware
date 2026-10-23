# Monitoramento de SEO — Luminor Software

Este registro operacional começa sem alegar resultados que ainda não foram consultados. A propriedade foi aberta no Search Console com a conta Google disponível, mas a interface informou que essa conta não tem acesso à propriedade `https://luminorsoftware.com.br/`. Nenhum status de URL ou desempenho orgânico foi consultado.

| Indicador | Fonte | Frequência inicial | Estado inicial |
|---|---|---|---|
| URLs indexadas e motivos de exclusão | Google Search Console | Semanal; mensal após estabilização | Não consultado; CSV em `reports/search-console-status.csv` |
| Impressões, cliques, CTR e posição | Search Console | Semanal; comparar períodos equivalentes | Não consultado |
| Visitas por página e serviço | GA4, após consentimento | Semanal | Propriedade e fluxo criados; ID configurado localmente; coleta em produção pendente de publicação e validação |
| Cliques para iniciar contato por WhatsApp | GA4, evento `click_whatsapp`, após consentimento | Semanal | Implementado no código; coleta em produção pendente de publicação e validação |
| Contatos efetivamente recebidos | Controle comercial | Semanal | Não integrado; clique não comprova envio |
| Desempenho mobile | PageSpeed Insights / CrUX | Mensal e após mudanças importantes | Baseline da homepage V0.4 em 22/10/2026: PageSpeed mobile 98; sem dados CrUX. Histórico em `reports/pagespeed-mobile.csv`. |
| Erros de rastreamento e respostas HTTP | `npm run seo:check` | Após deploy e a cada publicação relevante | Rodar contra domínio público |

## Relatório orgânico semanal

O arquivo `reports/organic-search-weekly.csv` é um histórico vazio até a primeira consulta autenticada. Preencha uma linha por combinação de período, grupo de intenção, consulta e página de destino. Use períodos equivalentes nas comparações e preserve as linhas anteriores. Agrupe consultas por intenção em: marca Luminor; automação empresarial; chatbot para WhatsApp; integração de sistemas; software sob medida; automação para segmentos profissionais. Não estime impressões, cliques, CTR ou posição quando a propriedade não tiver sido consultada. Combine esse histórico com a inspeção de indexação em `reports/search-console-status.csv`.

O primeiro baseline móvel da página inicial foi obtido no PageSpeed Insights em 22/10/2026 na versão V0.4 publicada: performance 98, acessibilidade 100, práticas recomendadas 100 e SEO 100. FCP 0,9 s; LCP 1,2 s; TBT 0 ms; CLS 0; Speed Index 3,9 s. O painel informou “Nenhum dado” de campo (CrUX). Os resultados são de laboratório, numa sessão inicial com Moto G Power emulado e rede 4G lenta; não representam usuários reais nem a versão local ainda não publicada. O CSV preserva a linha histórica e o JSON contém o detalhe e as oportunidades observadas.

## Rotina pós-publicação

1. Executar `SITE_ORIGIN=https://luminorsoftware.com.br npm run seo:check` (PowerShell: `$env:SITE_ORIGIN='https://luminorsoftware.com.br'; npm run seo:check`).
2. Revisar `reports/seo-production.json`; distinguir falha de rede de erro HTTP/SEO antes de corrigir.
3. Após conceder acesso à propriedade verificada, enviar `/sitemap.xml` e inspecionar as páginas listadas no CSV. Registrar a data e o resultado real. Até lá, deixar os estados como “Não consultado”.
4. O ID GA4 da Luminor já está configurado em `public/assets/js/config.js`; após publicar, validar o consentimento e eventos no DebugView antes de considerar a coleta em produção confirmada.
5. Repetir após mudança de rota, metadados, consentimento ou conteúdo. Não interpretar a inclusão no sitemap como prova de indexação.

Responsável pelo acompanhamento e rotina de retenção comercial ainda precisa ser designado pela empresa.

## Última consulta HTTP pública

Em 22/10/2026, a origem respondeu sem falhas de rede: as 15 URLs atuais do sitemap, seus links internos, `robots.txt` e metadados estavam acessíveis. A inspeção do HTML publicado encontrou as páginas anteriores, sem as referências locais novas a `analytics.js` e `consent.js` em nenhuma das 15 páginas. As alterações deste trabalho ainda não foram publicadas, portanto execute novamente a auditoria após o deploy. A consulta não acessou Search Console nem fornece estado de indexação.
