# Luminor Software

Site institucional estático em HTML, CSS e JavaScript, com servidor Node opcional para testes locais. As páginas públicas em `public/` são HTML gerado diretamente; o projeto não usa Vite, React ou Next.js.

## Desenvolvimento e validação

Requer Node.js 20 ou superior.

```bash
npm start
npm run dev
npm test
npm run build
```

`npm test` cobre API local, metadados, sitemap, páginas, consentimento e mensuração. `npm run build` regenera `public/sitemap.xml`. Para atualizar as páginas estáticas comerciais e artigos a partir do conteúdo-fonte do gerador, execute `node scripts/create_seo_pages.mjs`. Para gerar a prévia independente: `python scripts/build_standalone.py`.

O GitHub Actions executa verificações Chromium de consentimento, responsividade, movimento reduzido e contraste. Para rodar localmente com Playwright e Chrome instalados, use `tests/site_consent_browser.cjs`, `tests/browser_check.cjs` e `tests/visual_check.cjs`.

A auditoria HTTP de produção requer o domínio publicado:

```powershell
$env:SITE_ORIGIN='https://luminorsoftware.com.br'
npm run seo:check
```

Ela salva `reports/seo-production.json` (ignorado pelo Git) e falha quando não consegue validar a origem. Falha de rede fica identificada separadamente de problemas de rastreamento. Veja também `docs/SEO.md` e `docs/MONITORAMENTO_SEO.md`.

## Publicação na Vercel

A raiz do projeto é o Root Directory; a saída estática é `public/`. O comando de build apenas gera o sitemap, sem instalar dependências. Configure `luminorsoftware.com.br` como domínio principal no painel. O redirect de `www` depende de também vincular `www.luminorsoftware.com.br`. Depois do deploy, rode a auditoria HTTP, confirme HTTPS e submeta o sitemap pelo Search Console verificado.

O projeto Vercel `luminor-software` está conectado à branch `main`. Em 22/10/2026 às 21:24 (horário de São Paulo), a Vercel listou a V0.5 (commit `a3c21c5`) como `READY` para produção; essa implantação foi criada pelo push de `main` e inclui consentimento/Analytics. As alterações locais posteriores ainda não foram publicadas. A auditoria HTTP completa anterior ao deploy validou as 15 URLs; as tentativas posteriores de leitura do domínio às 21:25 e 21:47 de 22/10 e as tentativas repetidas em 23/10 falharam nesta sessão. Testes ao vivo do Google em 22–23/10 confirmaram disponibilidade para rastreamento das 15 URLs; o resultado por URL está no CSV. Confira o Root Directory e as configurações efetivas de build; `vercel.json` define build estático com saída em `public/`. No Search Console, o sitemap aparece como processado (15 URLs); as inspeções individuais foram preenchidas no CSV. O relatório de indexação segue em processamento; a consulta de desempenho refeita em 23/10 para 21/10 não traz cliques, impressões, consultas ou páginas. A validação do GA4 em DebugView continua pendente.

## Contato e formulário

O formulário prepara uma mensagem e abre WhatsApp. A mensagem só é enviada se a pessoa revisar e confirmar no aplicativo; o clique não é contabilizado como lead recebido. O site estático da Vercel não usa `POST /api/leads`; o servidor e a API em `server/` são para execução Node local. Sem JavaScript, o botão do formulário não envia dados e há um link de e-mail como alternativa. A API local, se usada diretamente em ambiente Node, grava JSONL em `data/`; ela não é storage de produção.

O e-mail e WhatsApp comerciais confirmados estão em `public/assets/js/config.js`. A política de privacidade permanece preliminar até receber identificação do controlador, critérios aprovados de retenção e revisão jurídica. Consulte `docs/PRIVACIDADE_DADOS.md` para o inventário observado e suas pendências.

## Consentimento e Analytics

O controle compartilhado está em `public/assets/js/consent.js`; a medição central está em `public/assets/js/analytics.js`. Escolha pendente não carrega tags. Analytics só carrega após aceite e se `analyticsId` contiver um ID GA4 real (`G-...`). A propriedade GA4 Luminor Software e o fluxo Web foram criados na conta Google atual; em 23/10/2026, a propriedade mostra porte de 1 a 10 funcionários e o ID público está na V0.5. O fluxo continua mostrando zero dados recebidos nas últimas 48 horas; consentimento e eventos em produção ainda precisam de validação no DebugView. Nunca coloque credenciais administrativas no código público.

O visitante pode aceitar, rejeitar, reabrir as preferências e revogar. Os eventos usam parâmetros permitidos e não incluem nome, telefone, e-mail ou texto livre. `click_whatsapp` mede intenção de contato. `generate_lead` não dispara porque o site não recebe confirmação de envio pelo WhatsApp. Instruções operacionais: `docs/SEO.md` e `docs/PRIVACIDADE_DADOS.md`.

## Páginas e conteúdo

- Serviços: `public/servicos/`.
- Segmentos: `public/segmentos/`.
- Artigos e hub: `public/conteudos/`.
- SEO e rotas: `public/sitemap.xml`, `public/robots.txt`, `vercel.json`.
- Relatório de inspeção do Search Console: `reports/search-console-status.csv`; estados consultados em 22–23/10/2026 para as 15 URLs do sitemap e resultados de teste ao vivo das 15 URLs.

Páginas devem ser conteúdo HTML útil, com canonical e links internos reais. Após criar novas páginas, rode `npm run build` e `npm test`; depois da publicação, execute a auditoria e atualize os relatórios com dados reais.
