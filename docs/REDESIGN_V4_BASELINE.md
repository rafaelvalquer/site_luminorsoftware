# Redesign V4 — linha de base

Levantamento feito em 10/11/2026, antes de qualquer alteração do plano V4 (redesign visual-first).

## Ponto de partida

- Branch de trabalho: `feature/luminor-visual-first-v4`, criada a partir de `ce2229e` (branch `feature/experiencias-premium-v3`).
- Essa base contém as experiências da V3.1 (E01–E05): fluxo do hero em módulos ES, painel de dados em `<dialog>`, laboratório de integrações e passe de performance. Elas ainda **não estão na `main`** nem foram enviadas ao GitHub. A V4 reaproveita esse código em vez de recriar as demonstrações.
- `git status` limpo no início. Nenhuma alteração não relacionada foi sobrescrita.
- Arquivos analisados: `README.md`, `package.json`, `vercel.json`, `public/index.html`, `public/assets/css/styles.css`, `public/assets/css/experiences.css`, `public/assets/js/app.js`, `analytics.js`, `consent.js`, os módulos de `public/assets/js/experiences/`, `scripts/build_standalone.mjs`, `scripts/create_seo_pages.mjs`, `scripts/build_brand_assets.mjs` e os testes de `tests/`.

## Estrutura atual da homepage

Ordem das seções e altura medida (1440 × 900 e 390 × 844, movimento reduzido):

| # | Seção | Título | Altura desktop | Altura mobile |
|---|---|---|---:|---:|
| 1 | `#inicio` | Seu negócio cresce. Seus processos precisam acompanhar. + demonstração `#automation-demo` + faixa 01/02/03 | 1054 px | 1859 px |
| 2 | `#solucoes` | O problema muda. A solução acompanha. (4 cartões com “problema comum”, descrição e 2 links) | 1006 px | 2199 px |
| 3 | `#integracoes-lab` | Seus sistemas podem trabalhar juntos. (laboratório interativo) | 1266 px | 2342 px |
| 4 | `#metodo` | Primeiro, seu processo. Depois, a tecnologia. (4 etapas) | 774 px | 1490 px |
| 5 | `#processos` | O que se repete aí pode virar automação. (4 exemplos antes/depois) | 1244 px | 2085 px |
| 6 | `#simulador` | Do corre-corre ao trabalho com foco. (cena da equipe + 3 benefícios) | 1348 px | 1248 px |
| 7 | `#diferenciais` | O software precisa funcionar para quem usa. (3 critérios) | 723 px | 1245 px |
| 8 | `#faq` | Algumas dúvidas antes de começar. (6 perguntas recolhidas) | 861 px | 1103 px |
| 9 | `#contato` | Conte o que está tomando tempo da sua equipe. (formulário → WhatsApp) | 1028 px | 1661 px |
| | **Página inteira** | | **9813 px** | **16185 px** |

Também existem: barra superior de conteúdo novo, `<template id="portfolio-template">` (não renderizado), `<dialog id="dashboard-dialog">` (painel completo) e rodapé.

## Texto visível

Medido com `node tests/homepage_text_audit.cjs baseline docs/redesign-v4` (palavras renderizadas e visíveis no `<main>`; respostas do FAQ recolhidas não contam).

- **Explicativo**: títulos, parágrafos e listas fora das demonstrações e do formulário.
- **Demonstração**: texto dentro das interfaces simuladas.
- **Controles**: botões, links e perguntas do FAQ.

| Seção | Visível | Explicativo | Demonstração | Controles | Formulário |
|---|---:|---:|---:|---:|---:|
| `#inicio` | 150 | 60 | 83 | 7 | — |
| `#solucoes` | 205 | **171** | — | 34 | — |
| `#integracoes-lab` | 202 | 20 | 182 | — | — |
| `#metodo` | 106 | **106** | — | — | — |
| `#processos` | 178 | **162** | — | 16 | — |
| `#simulador` | 108 | 69 | 35 | 4 | — |
| `#diferenciais` | 95 | **95** | — | — | — |
| `#faq` | 80 | 36 | — | 44 | — |
| `#contato` | 114 | 53 | — | 4 | 57 |
| **Total** | **1238** | **772** | **300** | **109** | **57** |

Meta da V4: reduzir o texto explicativo em 50–60%, ou seja, ficar entre **309 e 386 palavras explicativas** sem perder SEO, formulário e WhatsApp.

## Elementos visuais existentes

- Demonstração do hero `#automation-demo`: planilha → análise → fluxo → resultado, com 3 cenários (Planilhas, Documentos, Atendimento) e resultado compacto que abre o painel completo.
- Painel de dados em `<dialog>`: KPIs, barras, distribuição, filtros e lista de registros (dados determinísticos de `scenarios.js`).
- Laboratório de integrações: diagrama com 4 nós, detalhes da etapa, simulação passo a passo, falha e nova tentativa.
- Cena da equipe (`#team-experience`): ilustração SVG “antes/depois” com 5 pessoas animadas.
- Ícones SVG em sprite, símbolo e logotipo da marca. Não há fotos nem capturas de tela de interfaces.

## Repetições identificadas

1. A mesma ideia de **antes/depois da automação** aparece em quatro lugares: demonstração do hero, “problema comum” dos cartões de solução, exemplos práticos (`#processos`) e cena da equipe (`#simulador`).
2. **Método e diferenciais** se sobrepõem: “entendemos seu processo” aparece no método, em “Sobre a Luminor”, no FAQ e no contato.
3. A faixa do hero (Controle de processos / Integrações inteligentes / Menos trabalho repetitivo) repete os cartões de solução.
4. Os cartões de solução têm três camadas de texto (problema comum, descrição e dois links) para dizer o mesmo.
5. Há CTAs de contato em quase todas as seções (`solution-bottom`, `examples-note`, `team-bottom`, `faq-more`).

## Possíveis cortes e fusões

- Hero: título, uma frase e dois CTAs; retirar `hero-note`, `hero-footer` e a faixa 01/02/03.
- Soluções: nome, uma frase (≤ 20 palavras) e link para a página do serviço; sem “problema comum”.
- `#processos` e `#simulador`: substituir pela galeria “Veja a tecnologia funcionando.” com abas (automação, sistema de gestão e integração), reaproveitando o fluxo, o painel e o laboratório.
- `#metodo` + `#diferenciais`: unir em uma metodologia visual de 4 etapas com uma linha de texto cada.
- FAQ: manter recolhido e mais enxuto na introdução.
- Contato: título e descrição mais curtos, preservando formulário, consentimento e WhatsApp.

## Testes e performance na linha de base

- `npm test`: 46 testes aprovados.
- `tests/browser_check.cjs`, `tests/visual_check.cjs` e `tests/site_consent_browser.cjs`: aprovados no commit `ce2229e` (passe E05).
- Web Vitals de laboratório (Playwright + Chrome, mediana de 3 execuções; mobile 390 × 844 com CPU 4×; desktop 1440 × 900):

| Medida | Mobile | Desktop |
|---|---:|---:|
| LCP | 620 ms | 180 ms |
| CLS | 0 | 0,064 |
| INP (aproximação por event timing) | 144 ms | 48 ms |

O CLS de desktop restante vem do deslocamento horizontal de botões do cabeçalho na troca de fonte (`font-display: swap` mantido de propósito). Não há medição Lighthouse nesta linha de base.

## Capturas

Em `docs/redesign-v4/`:

- `baseline-desktop-hero.jpg`, `baseline-desktop-completa.jpg` (1440 px)
- `baseline-mobile-hero.jpg`, `baseline-mobile-completa.jpg` (390 px)
- `baseline-texto.json` (contagem completa por seção e viewport)

## Observações para a implementação

- O identificador sugerido no plano (“Software e automação para pequenos negócios”) conflita com uma orientação anterior de não usar “pequenos negócios” nos textos. Será usado “Software e automação sob medida”.
- O README cita `python scripts/build_standalone.py`; o script atual é `npm run build:preview` (`scripts/build_standalone.mjs`).
- Os eventos de analytics das demonstrações (`demo_flow_start`, `dashboard_filter`, `integration_simulate` etc.) ainda não estão na allowlist de `analytics.js`; isso entra na entrega de qualidade.
