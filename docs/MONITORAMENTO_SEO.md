# Monitoramento de SEO — Luminor Software

Em 22/10/2026, a conta Google atual conseguiu acessar a propriedade `https://luminorsoftware.com.br/`. O sitemap foi enviado e consta como processado, com 15 URLs encontradas. As inspeções individuais estão registradas em `reports/search-console-status.csv`; o relatório agregado de indexação ainda está em processamento. A consulta de desempenho refeita em 23/10/2026 mostra 0 cliques e 0 impressões em 21/10/2026, CTR e posição média em 0 e nenhuma linha nas dimensões de consultas ou páginas. Ainda não há dados para identificar oportunidades orgânicas. Testes ao vivo de 22–23/10 confirmaram que as 15 URLs do sitemap estão disponíveis para o Google. Disponibilidade para rastreamento não significa que a URL já esteja indexada.

| Indicador | Fonte | Frequência inicial | Estado observado |
|---|---|---|---|
| URLs indexadas e motivos de exclusão | Google Search Console | Semanal; mensal após estabilização | Consultas de 22–23/10: 3 indexadas, 7 detectadas mas não indexadas e 5 não reconhecidas; motivos específicos indisponíveis marcados como N/D; relatório agregado ainda em processamento. CSV em `reports/search-console-status.csv` |
| Impressões, cliques, CTR e posição | Search Console | Semanal; comparar períodos equivalentes | Em 21/10: 0 impressões, 0 cliques, CTR 0% e posição média 0; nenhuma consulta listada. Snapshot agregado em `reports/organic-search-weekly.csv` |
| Visitas por página e serviço | GA4, após consentimento | Semanal | Propriedade e fluxo criados; implantação V0.5 `READY`, mas zero dados nas últimas 48 horas e DebugView ainda sem confirmação |
| Cliques para iniciar contato por WhatsApp | GA4, evento `click_whatsapp`, após consentimento | Semanal | Implementado no código da V0.5; coleta/eventos em produção ainda não validados |
| Contatos efetivamente recebidos | Controle comercial | Semanal | Não integrado; clique não comprova envio |
| Desempenho mobile | PageSpeed Insights / CrUX | Mensal e após mudanças importantes | Baseline da homepage V0.4 em 22/10/2026: PageSpeed mobile 98; sem dados CrUX. Histórico em `reports/pagespeed-mobile.csv`. |
| Erros de rastreamento e respostas HTTP | `npm run seo:check` | Após deploy e a cada publicação relevante | Rodar contra domínio público |

## Relatório orgânico semanal

O arquivo `reports/organic-search-weekly.csv` contém a consulta agregada de 21/10/2026, refeita em 23/10: nenhum clique ou impressão e nenhuma linha nas tabelas de consultas e páginas. Preencha novas linhas por combinação de período, grupo de intenção, consulta e página de destino quando o Search Console fornecer esses dados; preserve as linhas anteriores. Agrupe consultas por intenção em: marca Luminor; automação empresarial; chatbot para WhatsApp; integração de sistemas; software sob medida; automação para segmentos profissionais. Não estime métricas ausentes. Combine esse histórico com a inspeção de indexação em `reports/search-console-status.csv`.

O primeiro baseline móvel da página inicial foi obtido no PageSpeed Insights em 22/10/2026 na versão V0.4 publicada: performance 98, acessibilidade 100, práticas recomendadas 100 e SEO 100. FCP 0,9 s; LCP 1,2 s; TBT 0 ms; CLS 0; Speed Index 3,9 s. O painel informou “Nenhum dado” de campo (CrUX). Os resultados são de laboratório, numa sessão inicial com Moto G Power emulado e rede 4G lenta; não representam usuários reais nem a versão local ainda não publicada. O CSV preserva a linha histórica e o JSON contém o detalhe e as oportunidades observadas.

## Rotina pós-publicação

1. Executar `SITE_ORIGIN=https://luminorsoftware.com.br npm run seo:check` (PowerShell: `$env:SITE_ORIGIN='https://luminorsoftware.com.br'; npm run seo:check`).
2. Revisar `reports/seo-production.json`; distinguir falha de rede de erro HTTP/SEO antes de corrigir.
3. O acesso à propriedade está confirmado e `/sitemap.xml` consta como `Processado` (15 URLs encontradas em 22/10/2026). Reinspecione as páginas após o processamento do relatório, registre os novos resultados reais no CSV e mantenha “N/D” quando o Google não fornecer um campo. Teste ao vivo cada URL que continue sem indexação; o teste informa rastreabilidade atual, não garante indexação.
4. O ID GA4 da Luminor já está configurado em `public/assets/js/config.js`; após publicar, validar o consentimento e eventos no DebugView antes de considerar a coleta em produção confirmada.
5. Repetir após mudança de rota, metadados, consentimento ou conteúdo. Não interpretar a inclusão no sitemap como prova de indexação.

Responsável pelo acompanhamento e rotina de retenção comercial ainda precisa ser designado pela empresa.

## Última consulta HTTP pública

Em 22/10/2026 às 17:22 (horário de São Paulo), antes da implantação V0.5, a origem respondeu sem falhas de rede: as 15 URLs então listadas, `robots.txt`, sitemap, links internos e metadados estavam acessíveis; aquela versão ainda não continha referências aos módulos de consentimento/Analytics. Às 21:24, a Vercel listou a implantação V0.5 do commit `a3c21c5` como `READY` para produção. As auditorias locais às 21:25 e 21:47 não conseguiram carregar `robots.txt` nem `sitemap.xml` (`fetch failed`; o navegador também indicou `ERR_CONNECTION_TIMED_OUT`), então nenhum HTML completo da V0.5 foi inspecionado por HTTP nesta sessão. A repetição da auditoria em 23/10 também falhou por rede (0 páginas, 0 erros críticos e 2 falhas de rede); a tentativa mais recente desta revisão teve o mesmo resultado. Isso não permite concluir que a origem esteja indisponível para todos os visitantes: testes ao vivo do Google em 22–23/10 confirmaram disponibilidade das 15 URLs. Na consulta individual de 23/10, os estados registrados para as 15 URLs são: 3 indexadas, 7 detectadas e não indexadas e 5 não reconhecidas. Os testes ao vivo de 22–23/10 indicaram disponibilidade para rastreamento das 15 URLs. O relatório agregado de indexação segue em processamento; o relatório de desempenho mostra zero cliques/impressões em 21/10 e nenhuma consulta listada. Repita as verificações completas quando a conexão e o processamento dos relatórios estiverem estáveis.
