# Redesign V4 — resultados

Redesign visual-first da homepage, executado em 10/11/2026 na branch `feature/luminor-visual-first-v4`. Nada foi publicado: a branch não foi enviada ao GitHub, não houve merge na `main` nem deploy.

## Commits

| Entrega | Commit | Conteúdo |
|---|---|---|
| Base | `ce2229e` | Ponto de partida: V3.1 (E01–E05), ainda local e fora da `main` |
| 1 | `a7ce70a` | Linha de base, auditoria de texto e capturas |
| 2 | `7fd3d1f` | Nova estrutura e textos da homepage |
| 3 | `c150466` | Capturas WebP nos cartões e refinamentos visuais |
| 4 | `7e7f74c` | Refinamento das demonstrações da galeria |
| 5 | `af1128c` | Allowlist de Analytics das demonstrações e verificações de qualidade |
| 6 | commit deste relatório | Capturas finais, README e relatório |

## Estrutura antes e depois

| Antes (9 seções) | Depois (6 seções) | Decisão |
|---|---|---|
| `#inicio` hero + faixa 01/02/03 | `#inicio` | Mantido. Nova mensagem e CTAs, divisão 44/56 no desktop. Faixa, rodapé e avatares removidos. A demonstração `#automation-demo` foi preservada |
| `#solucoes` | `#solucoes` | Mantido e encurtado. Cada cartão tem captura, nome, uma frase e link para a página do serviço |
| `#integracoes-lab` | Aba "Integração de sistemas" de `#demonstracoes` | Unido à galeria. O id `integracoes-lab` continua no painel da aba |
| — | `#demonstracoes` | **Novo**: galeria "Veja a tecnologia funcionando." com 3 abas |
| `#metodo` | `#metodo` | Mantido como trilha visual de 4 etapas |
| `#processos` | — | Removido. Os exemplos antes/depois repetiam o hero e os cartões |
| `#simulador` (cena da equipe) | — | Removido. Era uma ilustração animada pesada, com a mesma ideia de antes/depois |
| `#diferenciais` | 3 critérios dentro de `#metodo` | Unido ao método |
| `#faq` | `#faq` | Mantido e recolhido, com introdução de uma linha |
| `#contato` | `#contato` | Novo título e descrição. Formulário, consentimento e WhatsApp sem mudança de comportamento |
| `<dialog>` do painel | Painel inline na aba "Sistema de gestão" | O botão do resultado do hero ("Ver painel completo") leva à aba com o mesmo cenário e período |

Links de outras páginas (`/#solucoes`, `/#metodo`, `/#faq`, `/#contato`) continuam válidos. Os ids removidos não tinham links externos.

## Texto visível

Medido com `node tests/homepage_text_audit.cjs` (1440 × 900, movimento reduzido; respostas do FAQ recolhidas e abas ocultas não contam).

| Medida | Antes | Depois | Variação |
|---|---:|---:|---:|
| Texto explicativo | 772 palavras | 310 palavras | **−59,8%** |
| Todo o texto visível do `<main>` | 1238 | 590 | −52% |
| Altura da página (desktop) | 9813 px | 5988 px | −39% |
| Altura da página (390 px) | 16185 px | 9988 px | −38% |

Por seção (explicativo, antes → depois): hero 60 → 34; soluções 171 → 88; método + sobre 201 → 82; exemplos e equipe 231 → 0; demonstrações 20 → 39; FAQ 36 → 21; contato 53 → 46.

A primeira versão da entrega 2 cortou 70%, acima da faixa do plano. Linhas úteis foram devolvidas: nota de confiança no hero, frase sobre a Luminor no método, introdução do FAQ e checklist do contato. Isso trouxe o corte para a faixa de 50–60%.

## Textos principais

- Identificador: “Software e automação sob medida”. O plano sugeria “para pequenos negócios”, o que conflita com uma orientação anterior de não usar esse termo.
- H1: “Sistemas e automações que simplificam seu negócio.”
- Descrição: “Transformamos tarefas repetitivas, planilhas e processos manuais em soluções fáceis de usar.”
- CTAs: “Quero automatizar meu negócio” e “Ver soluções na prática”.
- Cartões: Automação, Sistemas sob medida, Integrações e Atendimento, com as frases do plano (com pequenos complementos, todas com até 20 palavras).
- Contato: “Qual tarefa está tomando tempo da sua equipe?” / “Conte seu desafio. Vamos avaliar uma solução sob medida.” / botão “Falar com a Luminor”.

## Imagens e origem

| Arquivo | Origem | Tamanho |
|---|---|---|
| `public/assets/img/demos/automacao-{480,960}.webp` | Captura da demonstração "Automação de processos" da própria galeria | 11,9 KB / 32,1 KB |
| `sistemas-{480,960}.webp` | Captura do painel "Controle de pedidos" (dados fictícios) | 9,3 KB / 23,0 KB |
| `integracoes-{480,960}.webp` | Captura do laboratório de integrações após uma simulação | 15,3 KB / 44,4 KB |
| `atendimento-{480,960}.webp` | Captura do resultado "Atendimento" do hero (tickets fictícios) | 10,1 KB / 30,3 KB |

- Todas foram geradas por `scripts/capture_demo_shots.cjs`: Chrome via Playwright, recorte 16:10 e conversão WebP no canvas.
- Não há imagens de internet, imagens geradas por IA nem telas de clientes.
- Nos cartões, as imagens têm `width`/`height`, `srcset`, `sizes`, `loading="lazy"`, `decoding="async"` e alt descritivo que identifica a captura como demonstração com dados fictícios.

## Componentes novos ou alterados

- `experiences/gallery.js`: abas acessíveis (WAI-ARIA tabs, setas/Home/End). Sem JavaScript, os painéis aparecem empilhados.
- `experiences/process-runner.js`: demonstração origem → regras → destino com 5 documentos fictícios, um enviado para revisão.
  - Executar, pausar, continuar e reiniciar.
  - Pausa em aba oculta, fora da tela e ao trocar de aba.
  - Com movimento reduzido, mostra o resultado na hora.
- `experiences/dashboard.js`: o painel funciona inline (e ainda em `<dialog>`, se usado), com tamanho de página configurável (5 registros na galeria) e KPIs compactos.
- `experiences/integrations.js`: expõe `finish()`. Trocar de aba conclui a simulação na hora.
- `app.js`:
  - Removida a cena da equipe.
  - Nova entrada suave de cartões e da trilha do método (só `transform`/`opacity`, desligada com movimento reduzido).
  - A sombra do cabeçalho ao rolar já existia.
- CSS:
  - 21 KB removidos de `styles.css`: regras só usadas pelas seções retiradas, mais keyframes órfãos.
  - Bloco V4 em `experiences.css`: hero, cartões, galeria, janelas de aplicativo, automação e trilha do método.

## Funcionalidades preservadas

- URLs, title, description, canonical, Open Graph, JSON-LD, sitemap, robots, páginas de serviço, segmento e artigos: sem alteração (verificado por `tests/seo.test.js`).
- Formulário: validação, mensagem preparada e abertura do WhatsApp sem mudança. A abertura do WhatsApp continua contando só como `click_whatsapp`, nunca como lead confirmado (verificado em `visual_check.cjs`).
- Consentimento e GA4: nenhuma requisição antes do aceite; revogação remove a tag (`site_consent_browser.cjs` e `browser_check.cjs`).
- Analytics das demonstrações:
  - Eventos: `demo_flow_start`, `demo_flow_complete`, `demo_scenario_select`, `dashboard_filter`, `integration_simulate` e `integration_error_demo`.
  - Parâmetros: só `scenario`, `component` e `action`.
  - Conferido no navegador: nada é enviado antes do aceite, e nenhum dado digitado aparece nos eventos.
  - Isso conclui o item pendente E06 da V3.1.
- CSP: nenhum script externo novo, nenhum `eval` ou `innerHTML` nos módulos (teste de varredura em `integrations.test.js`).

## Testes

| Verificação | Resultado |
|---|---|
| `npm test` | 51/51 aprovados (5 testes novos em `tests/homepage-v4.test.js`) |
| `tests/browser_check.cjs` | Aprovado em 320, 375, 390, 768, 900, 1024 e 1440 px: layout sem overflow, âncoras, menu, teclado, galeria, painel, automação, laboratório, movimento reduzido e animado |
| `tests/visual_check.cjs` | Contraste ≥ 4,5:1 em 390 e 1440 px, incluindo os novos estados da galeria |
| `tests/site_consent_browser.cjs` | Aprovado |

Testes atualizados, não desativados: H1, ordem das seções, âncoras e menu, painel inline em vez de diálogo, galeria e CTAs das demonstrações. `tests/team_motion_check.cjs` foi removido junto com a cena da equipe (não fazia parte do CI); `docs/QA_RESULTADOS.md` ainda cita esse arquivo como registro histórico.

## Performance (laboratório)

Playwright + Chrome, mediana de 3 execuções, com interações nas demonstrações; mobile 390 × 844 com CPU 4×.

| Medida | Antes (mobile) | Depois (mobile) | Antes (desktop) | Depois (desktop) |
|---|---:|---:|---:|---:|
| LCP | 620 ms | 624 ms | 180 ms | 172 ms |
| CLS | 0 | 0 | 0,064 | 0,017 |
| INP (aproximação por event timing) | 144 ms | 80 ms | 48 ms | 48 ms |

- Os valores ficam dentro das metas do plano (LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1) neste ambiente de laboratório. Não são dados de campo.
- **Lighthouse não foi executado**: a ferramenta não está instalada no projeto e não foi baixada. A meta de Lighthouse ≥ 90 fica sem evidência.
- Peso (gzip), em relação a `ce2229e`:
  - HTML: 13,7 → 11,5 KB.
  - CSS (styles + experiences): 23,2 → 21,8 KB.
  - JS: `app.js` 3,9 → 3,1 KB; módulos das experiências ≈ 23,3 KB.
  - Imagens novas (versões de 480 px, carregamento tardio): 46,5 KB.

## Capturas

Em `docs/redesign-v4/`:

- `baseline-*.jpg` e `final-*.jpg`: desktop 1440 e mobile 390, primeira dobra e página completa. Comparam o antes e o depois.
- `baseline-texto.json` e `final-texto.json`: contagens completas por seção.

Os testes também atualizaram `screenshots/`, incluindo `Luminor_Galeria_Automacao_*`, `Luminor_Painel_*` e `Luminor_Integracoes_*`. As capturas `Luminor_Equipe_*` e `Luminor_Claro_simulador_*` ficaram obsoletas e não foram apagadas.

## Problemas encontrados e correções

- O painel inline aparecia vazio: antes ele era montado só ao abrir o diálogo. Agora é montado ao carregar.
- A linha da trilha do método passava da última etapa. O fim da linha agora é calculado pela largura das colunas.
- As capturas pegavam o cabeçalho fixo e cortavam nomes. O script de captura deixa o cabeçalho estático e usa larguras fixas.
- O corte de texto passou da faixa do plano (70%). Linhas úteis foram devolvidas até −59,8%.

## Pendências

- Revisar a branch e decidir sobre o envio ao GitHub para gerar o preview da Vercel.
  - A branch inclui a V3.1 (E01–E05), que também não está na `main`.
- Depois de qualquer merge na `main`, rodar `npm run seo:check` no domínio publicado.
- Rodar Lighthouse (por exemplo, no PageSpeed Insights) no preview da Vercel para ter evidência da meta ≥ 90.
- Validar os novos eventos no DebugView do GA4 depois da publicação.
- Opcional: apagar as capturas obsoletas da cena da equipe em `screenshots/`.
