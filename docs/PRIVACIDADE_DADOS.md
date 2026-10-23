# Inventário de dados e fornecedores — Luminor Software

**Escopo:** comportamento do código local revisado em 22/10/2026. Este inventário registra o que foi observado; não substitui validação jurídica, contratos com fornecedores ou confirmação das configurações de produção.

| Origem | Dados observados | Finalidade | Destino/fornecedor | Retenção e estado |
|---|---|---|---|---|
| Formulário no site | Nome, empresa, telefone, e-mail opcional, categoria e descrição livre | Preparar contato comercial solicitado pelo visitante | O navegador monta mensagem e abre `wa.me`; só é enviada ao WhatsApp/Meta se a pessoa confirmar no aplicativo | O site estático não armazena esses campos. Retenção após o recebimento no WhatsApp depende do controlador e ainda não foi definida. |
| Alternativa sem JavaScript | Dados que a pessoa decidir incluir no e-mail | Responder ao contato iniciado pela pessoa | Cliente de e-mail do visitante → `rafael.valquer@gmail.com` | O site não transmite nem armazena; retenção da caixa de e-mail precisa ser definida. |
| Preferência de métricas | `accepted` ou `rejected` | Reaplicar a escolha entre páginas | `localStorage` no navegador, chave `luminor-analytics-consent` | Permanece até alteração/limpeza pelo visitante; não é enviada ao servidor. Estado `pending` não é persistido. |
| Google Analytics 4 (GA4) opcional | Eventos permitidos (`page_view`, `view_service`, cliques e erro de validação), tipo de página, slug de serviço, local do CTA e canal | Métricas de uso e intenção comercial | Propriedade GA4 Luminor Software, fluxo Web `https://luminorsoftware.com.br/`, somente após consentimento; ID `G-VWCKL7GFG2` configurado localmente | Configuração observada no GA4 em 22/10/2026: eventos retidos por 2 meses; dados de usuário por 14 meses, com redefinição do prazo após nova atividade. Coleta granular de localização e dispositivo está ativada; Google Signals está desativado; User-ID e coleta de dados fornecidos pelo usuário não estão configurados. A alteração do site ainda não foi publicada e a coleta em produção não foi validada. |
| Infraestrutura de hospedagem | Dados técnicos de requisição necessários à entrega e segurança, conforme configuração do provedor | Servir páginas e proteger a infraestrutura | Vercel no deploy estático planejado; domínio e deploy ainda precisam ser confirmados | Prazo, regiões, logs e retenção dependem das configurações/contrato do projeto e não foram confirmados. |
| API Node local | Campos enviados diretamente a `POST /api/leads` e eventos `POST /api/events` | Persistência local de demonstração/teste | JSONL em `data/`, fora de `public/` | O formulário do site não chama essa API; Vercel publica somente `public/`. Retenção local, controle de acesso e descarte precisam de política antes de uso real. |

## Bases legais e responsabilidades

O texto do formulário solicita autorização para responder ao contato, mas a base legal adequada para o recebimento e tratamento comercial precisa ser definida pelo controlador com assessoria jurídica. Analytics é opcional e só inicia após a preferência `accepted`. Não presumir que a autorização de analytics vale para outros fins.

Razão social, identificação formal do controlador, endereço, responsável por direitos, critérios de retenção, rotina de descarte, controle interno de acesso e mecanismos de transferência internacional não foram fornecidos. O e-mail comercial confirmado é `rafael.valquer@gmail.com`; ele pode receber pedidos de titulares até que a empresa confirme o canal oficial do controlador.

## Controles implementados

- Os parâmetros de Analytics são allowlisted e não incluem nome, e-mail, telefone ou descrição livre.
- Clique para abrir WhatsApp é medido como intenção, nunca como lead recebido.
- O evento `generate_lead` não é disparado no fluxo atual, pois o site não recebe confirmação de envio no WhatsApp.
- O módulo de Analytics não carrega sem consentimento e ID GA4 válido; revogação bloqueia novos eventos e tenta remover cookies `_ga*` do domínio aplicável.
- A propriedade GA4 e o fluxo Web da Luminor foram criados; a medição otimizada automática está desligada. A retenção observada é de 2 meses para eventos e 14 meses para dados de usuário, com redefinição após atividade; coleta granular de localização/dispositivo está ativada, enquanto Google Signals, User-ID e dados fornecidos pelo usuário estão desativados/não configurados. A política permanece preliminar até completar a revisão dos fornecedores, retenção e transferências.
- A alternativa estática de contato é um link de e-mail; o formulário não envia dados à API local na Vercel.

## Pendências para a versão definitiva

1. Confirmar controlador, razão social e canal formal para titulares.
2. Aprovar finalidades e bases legais com assessoria jurídica.
3. Definir retenção, acesso, descarte e resposta a solicitações.
4. Conferir contratos, localização e retenção efetiva dos fornecedores.
5. Revisar este inventário e a política após qualquer mudança no fluxo ou ativação do GA4.

## Procedimento operacional para revisar a política

Antes de publicar qualquer alteração que mude dados ou fornecedores:

1. Conferir o fluxo real no código e listar cada campo, evento, cookie/armazenamento, finalidade e destino.
2. Obter do controlador as bases legais, prazos/critério de retenção, acessos, descarte e canal para titulares; não preencher por estimativa.
3. Conferir contratos, localização e transferências dos fornecedores que efetivamente recebam dados.
4. Atualizar este inventário e `public/privacidade.html`, registrar a data de revisão e submeter a política a revisão jurídica.
5. Rodar `npm test` e os testes de navegador de consentimento antes de publicar; verificar a página em computador e celular.
6. Depois da publicação, confirmar a versão servida e que todos os links de privacidade e preferências continuam funcionando.

Não remover o aviso de política preliminar ou o `noindex` enquanto os dados institucionais, tratamentos e revisão jurídica estiverem pendentes.
