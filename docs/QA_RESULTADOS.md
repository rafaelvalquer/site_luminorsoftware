# QA — Resultados executados

Verificações realizadas em 22/10/2026 na versão local com o posicionamento de automação sob medida.

## Backend Node

Comando: `npm test`.

- PASSOU — acesso a HTML/CSS e metadados básicos.
- PASSOU — diretórios `server/` e `data/` inacessíveis por HTTP.
- PASSOU — rejeição de contato incompleto.
- PASSOU — recebimento de lead com UUID e gravação em JSONL privado.
- PASSOU — validação de eventos permitidos.

## Frontend Chrome / Playwright

Prévia gerada com `python scripts/build_standalone.py`. Verificação com `node tests/browser_check.cjs`, usando Playwright do runtime e `CHROMIUM_PATH` apontando para o Chrome instalado.

- PASSOU — larguras 320, 375, 390, 768, 900, 1024 e 1440 pixels, sem rolagem horizontal.
- PASSOU — abertura e fechamento do menu mobile e tecla Escape.
- PASSOU — experiência interativa e método com quatro etapas, três exemplos de processos e âncoras internas válidas.
- PASSOU — dashboard Semana/Mês, canvas com cinco documentos e prévias, quatro tickets com filtros Todos/Pendentes/Em andamento/Resolvidos.
- PASSOU — troca de cenário reinicia a sequência e limpa período, filtro e seleção de documento.
- PASSOU — cinco personagens e estados Antes/Depois responsivos.
- PASSOU — animação automática, pausa, continuação e replay; dados percorrem visualmente as conexões.
- PASSOU — movimento reduzido impede reprodução automática, aplica resultados sem transições e pausa uma animação ao mudar a preferência.
- PASSOU — botões dos serviços e exemplos selecionam o interesse correto no formulário.
- PASSOU — navegação do menu e abertura de perguntas frequentes por teclado.
- PASSOU — CTA da equipe seleciona automação no formulário preservando a descrição existente.
- PASSOU — mensagens de validação de campos obrigatórios.
- PASSOU — ausência de exceções JavaScript nas páginas de teste.

Capturas atualizadas em `screenshots/Luminor_Desktop.png` e `screenshots/Luminor_Mobile.png`. Conferência visual da abertura em desktop e celular concluída.

## Identidade clara — branco e azul

Auditoria com `node tests/visual_check.cjs` em 390 e 1440 px.

- PASSOU — contraste de texto mínimo de 4,5:1, calculado com estilos do navegador e fundos compostos; degradê avaliado pelo tom mais escuro.
- PASSOU — quatro estados da transformação, três resultados específicos, documento selecionado, equipe Antes/Depois, banner de cookies, menu mobile e FAQ aberto.
- PASSOU — campos e placeholders, foco de teclado, validação, falha de envio e sucesso com respostas locais simuladas, sem gravar leads.
- PASSOU — páginas de privacidade e 404 no tema claro.
- Conferência visual e capturas em `screenshots/Luminor_Claro_*`.

## Personagens maiores e movimento fluido

Verificação com `node tests/team_motion_check.cjs`.

- PASSOU — personagens ampliados em 60%, cinco computadores e personagens inteiros dentro da cena.
- PASSOU — transição capturada quadro a quadro sem retorno à origem: deslocamento de 0 px nos cinco personagens no momento da mudança de fase.
- PASSOU — braços continuam digitando na fase de trabalho focado.
- PASSOU — verificação geral em sete larguras, incluindo pausa, repetição e movimento reduzido.

## Ainda exigem homologação no ambiente final

- Lighthouse/Core Web Vitals em hospedagem real.
- Integrações oficiais de WhatsApp, e-mail, CRM/webhook e GA4 — só após configuração/credenciais.
- Segurança e retenção de dados em banco persistente de produção.
- Validação jurídica da política de privacidade e dos dados institucionais.
- Qualquer prova social ou case real precisa de autorização.
