# SEO técnico — Luminor Software

## Endereços e publicação

A implementação usa `https://luminorsoftware.com.br` como origem canônica definida no plano. `public/sitemap.xml` é gerado pelo comando `npm run build`, que também é executado pela configuração Vercel. O servidor local imita URLs limpas e redireciona `.html` e barras finais para a URL preferencial.

No painel Vercel, confirme que `luminorsoftware.com.br` está vinculado ao projeto e definido como domínio principal. Para redirecionamento de `www`, vincule também `www.luminorsoftware.com.br`; a regra em `vercel.json` só pode operar quando esse hostname está associado. A Vercel provisiona HTTPS para domínios configurados; não publique até verificar DNS, certificado e o comportamento de `/`, páginas HTML, assets, API e sitemap em uma URL de produção.

O projeto Vercel `luminor-software` foi localizado. Em 22/10/2026 às 21:24 (horário de São Paulo), a Vercel listou uma implantação V0.5 como `READY` para produção, da branch `main`, commit `a3c21c5`; esse commit inclui os módulos de consentimento e Analytics. O código local deste workspace agora tem alterações posteriores a esse commit, ainda não publicadas. A auditoria HTTP completa anterior ao deploy examinou as 15 URLs da V0.4. As tentativas locais de ler `robots.txt` e `sitemap.xml` às 21:25 e 21:47 de 22/10 e as tentativas repetidas em 23/10 falharam por rede nesta sessão; na última execução, 0 páginas foram avaliadas, com 0 erros críticos e 2 falhas de rede. Testes ao vivo do Google em 22–23/10 confirmaram que as 15 URLs do sitemap estão disponíveis e podem ser rastreadas/indexadas; isso não confirma que estejam indexadas. `vercel.json` define build estático com saída em `public/`; confirme que o Root Directory do projeto aponta para a raiz do repositório. A configuração Vercel reportou framework Vite em observação anterior, então confira as configurações efetivas de build. O Search Console ficou acessível pela conta Google atual: o sitemap foi processado em 22/10/2026, com 15 URLs encontradas. As 15 inspeções individuais foram registradas no CSV; o relatório agregado de indexação segue em processamento, enquanto o relatório de desempenho mostra 0 cliques e 0 impressões em 21/10/2026 e nenhuma consulta listada.

## Verificações locais

```bash
npm test
npm run build
```

Os testes verificam metadados únicos, canonicals, sitemap, JSON-LD, links internos, disponibilidade de conteúdo sem JavaScript, URLs limpas e preservação das rotas de API e assets.

## GA4 e Search Console

A propriedade GA4 `Luminor Software` e o fluxo Web `Luminor Software - site` foram criados na conta Google atual. O fluxo aponta para `https://luminorsoftware.com.br/`, com medição otimizada desligada; o ID público `G-VWCKL7GFG2` está configurado em `public/assets/js/config.js`. A implantação V0.5 marcada `READY` pela Vercel inclui essa configuração, mas as requisições e eventos ainda não foram confirmados no DebugView. O site só carrega a tag após consentimento válido. O evento `click_whatsapp` registra apenas a abertura/clique para iniciar a conversa, não confirma que uma mensagem foi enviada. Não inclua nome, telefone, e-mail ou texto livre de formulário nos eventos.

Na conta Google atual, o sitemap `https://luminorsoftware.com.br/sitemap.xml` consta como `Processado`, com 15 páginas encontradas. As 15 URLs foram inspecionadas individualmente em 23/10/2026. O retrato registrado no CSV é: 3 indexadas, 7 “Detectadas, mas não indexadas no momento” e 5 “O Google não reconhece o URL”. Os motivos não disponíveis estão marcados como N/D. Testes ao vivo de 22–23/10 confirmaram disponibilidade para o Google das 15 URLs; o resultado por endereço está no campo “Resultado do teste ao vivo mais recente” em `reports/search-console-status.csv`. A disponibilidade atual não altera o status no índice. O relatório agregado de páginas ainda exibe “Dados em processamento”; a consulta de desempenho de 23/10 para 21/10 registra 0 cliques e impressões e nenhuma linha nas tabelas de consultas e páginas (`reports/organic-search-weekly.csv`). Não solicite indexação sem revisar antes a disponibilidade e a consistência técnica da página publicada.

### Atualizar páginas e sitemap

1. Atualize o conteúdo-fonte e os metadados em `scripts/create_seo_pages.mjs` para páginas de serviço, segmentos e artigos; mantenha canonical, title, description, links internos e scripts compartilhados.
2. Execute `node scripts/create_seo_pages.mjs` para gerar as páginas HTML.
3. Execute `npm run build` para reconstruir `public/sitemap.xml`, depois `npm test` para validar metadados, links e rotas.
4. Após publicar, rode `npm run seo:check`; se o sitemap mudou, envie-o novamente pela propriedade verificada no Search Console e atualize `reports/search-console-status.csv` com consultas reais.

### Interpretar estados de indexação

| Estado informado pelo Search Console | Interpretação operacional |
|---|---|
| Indexada | URL consta no índice segundo a inspeção consultada; registre data e canonical escolhida. |
| Descoberta, ainda não indexada | Google conhece a URL, mas ainda não confirmou rastreamento/indexação; confira links internos, conteúdo e canonical e acompanhe novamente. |
| Rastreada, ainda não indexada | Google buscou a página, mas não a incluiu no índice; revise utilidade, duplicação e sinais técnicos sem presumir a causa. |
| Duplicada / canonical alternativa | Compare canonical declarada, URL inspecionada e canonical escolhida pelo Google; corrija inconsistências reais. |
| Bloqueada | Identifique a regra de robots, acesso ou `noindex` observada antes de alterar a política de rastreamento. |
| Não encontrada / erro de servidor | Reproduza a URL e status HTTP; corrija links, redirecionamento ou disponibilidade conforme a resposta real. |

Registre sempre a data, o resultado e a ação no CSV. A presença no sitemap ou HTTP 200 não comprova indexação. Agrupamentos de consultas orgânicas e períodos comparáveis estão definidos em `docs/MONITORAMENTO_SEO.md` e têm histórico em `reports/organic-search-weekly.csv`.

## Dados estruturados

Organization publica somente marca, URL, logo e canais comerciais já informados. Razão social, CNPJ, endereço, perfis sociais e avaliações não foram inventados. Páginas de serviço incluem `Service`; páginas com hierarquia visível incluem `BreadcrumbList`.

## Desempenho

As verificações responsivas de navegador cobrem 320 a 1440 px, movimento reduzido e a interação atual. O código local ainda não foi publicado. Lighthouse no domínio e métricas de campo Core Web Vitals não foram medidos; faça a medição após publicar as alterações. Métricas laboratoriais locais não substituem dados de campo.

## Consentimento e eventos

`public/assets/js/consent.js` mantém os estados `pending`, `accepted` e `rejected` em `localStorage`, compartilha a escolha entre as páginas da origem e permite reabrir/revogar no rodapé. `public/assets/js/analytics.js` só adiciona a tag depois de aceite e de encontrar um ID `G-...` válido. Ao revogar, envia atualização de consentimento negado, bloqueia novos eventos e tenta remover cookies `_ga*`. A escolha pendente não carrega tags.

O GA4 está configurado no código local e está incluído na implantação V0.5 marcada `READY` pela Vercel. Em 23/10/2026, a propriedade `Luminor Software` mostrava o porte `Pequena: 1 a 10 funcionários`; o fluxo web da homepage usa o mesmo ID de medição do código (`G-VWCKL7GFG2`). O painel informava que nenhum dado havia sido recebido nas últimas 48 horas; a coleta em produção e o DebugView continuam sem validação. Eventos permitidos: `page_view`, `view_service`, `click_diagnostico`, `click_whatsapp`, `form_validation_error` e `generate_lead`. `generate_lead` está reservado a uma confirmação real de recebimento e não é usado pelo fluxo WhatsApp atual. O site mede só o clique/abertura do WhatsApp, não o envio da mensagem. Os parâmetros aceitos são `page_type`, `service_slug`, `cta_location` e `contact_channel`; o page location transmitido remove query strings. Não enviar campos do formulário ao GA4.

A política de privacidade continua preliminar e `noindex` até que controlador, bases legais e retenção sejam confirmados e haja revisão jurídica. O inventário observado está em `docs/PRIVACIDADE_DADOS.md`.

## CI e proteção de merge

O workflow `.github/workflows/seo.yml` executa testes/build e verificações de navegador em `push` e `pull_request`. Na execução da V0.5 (commit `a3c21c5`, run `39877917433`), o job `seo` passou e o navegador validou consentimento, mas `browser_check.cjs` falhou ao comparar a transformação dos personagens durante a pausa; o job de contraste foi então ignorado. A correção local pausa explicitamente as animações CSS quando `data-playing="false"`. No Chrome local, `browser_check.cjs`, `site_consent_browser.cjs` e `visual_check.cjs` passaram; o teste de movimento confirmou que os personagens ficam parados e retomam a sequência. A CI ainda não executou essa revisão local.

A consulta ao endpoint de regrasets do repositório retornou uma lista vazia. A consulta de proteção da branch `main` foi negada pela integração GitHub com erro 403 por falta de permissão administrativa, e a interface GitHub desta sessão estava desconectada. Portanto, não há evidência de que os checks sejam obrigatórios para merge; confirme e configure essa exigência nas configurações do repositório com uma conta administradora.

### Ativar, substituir ou revogar mensuração

- **Ativar GA4:** a propriedade e o fluxo da Luminor já foram criados e a implantação V0.5 contém o ID público em `public/assets/js/config.js`. A consulta atual do fluxo mostra zero dados nas últimas 48 horas. Execute os testes, valide a disponibilidade pública e depois confira page views/eventos no DebugView após aceitar métricas no ambiente publicado. Não coloque credenciais de conta nesse arquivo.
- **Desativar:** esvazie `analyticsId`, publique a mudança e confirme que nenhuma tag é inserida mesmo após aceite. Para a preferência de um visitante, use “Preferências de cookies” no rodapé e escolha “Somente essenciais”; a revogação bloqueia novos eventos e tenta remover cookies `_ga*` aplicáveis.
- **Substituir por outro fornecedor:** não reaproveite automaticamente o consentimento GA4. Revise fornecedor, finalidade, dados transmitidos, base legal, cookies, política de privacidade e inventário; implemente uma integração separada, com consentimento e testes próprios, antes de ativar.

## Auditoria HTTP após publicação

Com a origem pública no ambiente, rode `npm run seo:check` (ou defina `SITE_ORIGIN`). O script verifica status e redirecionamentos, regras aplicáveis ao Googlebot no `robots.txt` para cada URL, referência e disponibilidade do sitemap, headers/meta robots, canonical, conteúdo, JSON-LD, links locais quebrados e se cada URL do sitemap recebe ao menos um link interno navegável, salvando `reports/seo-production.json`. Falha de rede é separada de erro de HTTP/indexabilidade e o script retorna código diferente de zero quando a verificação não é conclusiva ou detecta erro crítico.

Os status do Search Console devem ser obtidos na propriedade verificada e registrados em `reports/search-console-status.csv`. As consultas de 22–23/10/2026 e os testes ao vivo das 15 URLs estão anotados por endereço no CSV. Sitemap e teste ao vivo não provam indexação. Reconsulte os estados após o Google processar os relatórios e atualize a data sem substituir resultados indisponíveis por suposições. Consulte `docs/MONITORAMENTO_SEO.md` para a rotina de acompanhamento.
