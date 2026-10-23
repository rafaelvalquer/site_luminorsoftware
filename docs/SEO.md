# SEO técnico — Luminor Software

## Endereços e publicação

A implementação usa `https://luminorsoftware.com.br` como origem canônica definida no plano. `public/sitemap.xml` é gerado pelo comando `npm run build`, que também é executado pela configuração Vercel. O servidor local imita URLs limpas e redireciona `.html` e barras finais para a URL preferencial.

No painel Vercel, confirme que `luminorsoftware.com.br` está vinculado ao projeto e definido como domínio principal. Para redirecionamento de `www`, vincule também `www.luminorsoftware.com.br`; a regra em `vercel.json` só pode operar quando esse hostname está associado. A Vercel provisiona HTTPS para domínios configurados; não publique até verificar DNS, certificado e o comportamento de `/`, páginas HTML, assets, API e sitemap em uma URL de produção.

O projeto Vercel `luminor-software` foi localizado e possui implantação de produção pronta a partir da branch `main`, commit `LuminorSoftware_V0.4` (`f197011`). O domínio público responde. As alterações deste workspace são locais e ainda não foram publicadas; a auditoria HTTP confirma que a versão publicada não inclui os novos módulos de consentimento/Analytics. `vercel.json` neste repositório define build estático com saída em `public/`; confirme no painel que o Root Directory aponta para a raiz do repositório. A configuração Vercel reporta framework Vite enquanto o código local atual é HTML estático, então confira as configurações efetivas de build antes de promover um novo deploy. Nenhum sitemap foi enviado ao Google.

## Verificações locais

```bash
npm test
npm run build
```

Os testes verificam metadados únicos, canonicals, sitemap, JSON-LD, links internos, disponibilidade de conteúdo sem JavaScript, URLs limpas e preservação das rotas de API e assets.

## GA4 e Search Console

A propriedade GA4 `Luminor Software` e o fluxo Web `Luminor Software - site` foram criados na conta Google atual. O fluxo aponta para `https://luminorsoftware.com.br/`, com medição otimizada desligada; o ID público `G-VWCKL7GFG2` está configurado em `public/assets/js/config.js`. O site só carrega a tag após consentimento válido. A validação em DebugView depende de publicar a alteração e aceitar métricas no site publicado. O evento `click_whatsapp` registra apenas a abertura/clique para iniciar a conversa, não confirma que uma mensagem foi enviada. Não inclua nome, telefone, e-mail ou texto livre de formulário nos eventos.

Uma consulta autenticada à propriedade `https://luminorsoftware.com.br/` retornou “você não tem acesso a esta propriedade” para a conta Google atualmente disponível. O responsável pela propriedade precisa conceder acesso a essa conta ou fornecer uma conta autorizada. Então envie `https://luminorsoftware.com.br/sitemap.xml` e inspecione a homepage e páginas de serviço. Até esse acesso, os status do CSV devem permanecer “Não consultado”.

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

O GA4 está configurado no código local com o ID público da propriedade Luminor, mas a versão publicada ainda não recebeu a alteração. Eventos permitidos: `page_view`, `view_service`, `click_diagnostico`, `click_whatsapp`, `form_validation_error` e `generate_lead`. `generate_lead` está reservado a uma confirmação real de recebimento e não é usado pelo fluxo WhatsApp atual. O site mede só o clique/abertura do WhatsApp, não o envio da mensagem. Os parâmetros aceitos são `page_type`, `service_slug`, `cta_location` e `contact_channel`; o page location transmitido remove query strings. Não enviar campos do formulário ao GA4.

A política de privacidade continua preliminar e `noindex` até que controlador, bases legais e retenção sejam confirmados e haja revisão jurídica. O inventário observado está em `docs/PRIVACIDADE_DADOS.md`.

### Ativar, substituir ou revogar mensuração

- **Ativar GA4:** a propriedade e o fluxo da Luminor já foram criados e o ID público está preenchido em `public/assets/js/config.js`. Execute os testes, publique e valide page views/eventos no DebugView depois de aceitar métricas no ambiente publicado. Não coloque credenciais de conta nesse arquivo.
- **Desativar:** esvazie `analyticsId`, publique a mudança e confirme que nenhuma tag é inserida mesmo após aceite. Para a preferência de um visitante, use “Preferências de cookies” no rodapé e escolha “Somente essenciais”; a revogação bloqueia novos eventos e tenta remover cookies `_ga*` aplicáveis.
- **Substituir por outro fornecedor:** não reaproveite automaticamente o consentimento GA4. Revise fornecedor, finalidade, dados transmitidos, base legal, cookies, política de privacidade e inventário; implemente uma integração separada, com consentimento e testes próprios, antes de ativar.

## Auditoria HTTP após publicação

Com a origem pública no ambiente, rode `npm run seo:check` (ou defina `SITE_ORIGIN`). O script verifica status e redirecionamentos, regras aplicáveis ao Googlebot no `robots.txt` para cada URL, referência e disponibilidade do sitemap, headers/meta robots, canonical, conteúdo, JSON-LD e links locais, salvando `reports/seo-production.json`. Falha de rede é separada de erro de HTTP/indexabilidade e o script retorna código diferente de zero quando a verificação não é conclusiva ou detecta erro crítico.

Os status do Search Console devem ser obtidos na propriedade verificada e registrados em `reports/search-console-status.csv`. No momento, todas as 15 URLs constam como “Não consultado”; sitemap por si só não prova indexação. Consulte `docs/MONITORAMENTO_SEO.md` para a rotina de acompanhamento.
