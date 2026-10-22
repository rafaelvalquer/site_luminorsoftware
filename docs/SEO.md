# SEO técnico — Luminor Software

## Endereços e publicação

A implementação usa `https://luminorsoftware.com.br` como origem canônica definida no plano. `public/sitemap.xml` é gerado pelo comando `npm run build`, que também é executado pela configuração Vercel. O servidor local imita URLs limpas e redireciona `.html` e barras finais para a URL preferencial.

No painel Vercel, confirme que `luminorsoftware.com.br` está vinculado ao projeto e definido como domínio principal. Para redirecionamento de `www`, vincule também `www.luminorsoftware.com.br`; a regra em `vercel.json` só pode operar quando esse hostname está associado. A Vercel provisiona HTTPS para domínios configurados; não publique até verificar DNS, certificado e o comportamento de `/`, páginas HTML, assets, API e sitemap em uma URL de produção.

O projeto Vercel conectado ainda não foi localizado nesta sessão. Assim, configuração de domínio, deploy e testes HTTP públicos permanecem pendentes. Não foi enviado sitemap ao Google.

## Verificações locais

```bash
npm test
npm run build
```

Os testes verificam metadados únicos, canonicals, sitemap, JSON-LD, links internos, disponibilidade de conteúdo sem JavaScript, URLs limpas e preservação das rotas de API e assets.

## GA4 e Search Console

O campo `analyticsId` em `public/assets/js/config.js` permanece vazio de propósito. Quando houver um identificador `G-...` pertencente à empresa, configure-o ali e valide os eventos com consentimento. O evento `click_whatsapp` registra apenas a abertura/clique para iniciar a conversa, não confirma que uma mensagem foi enviada. Não inclua nome, telefone, e-mail ou texto livre de formulário nos eventos.

Depois do deploy, o responsável pela propriedade deve confirmar a verificação do domínio no Search Console, enviar `https://luminorsoftware.com.br/sitemap.xml` e inspecionar a homepage e as páginas de serviço. Acompanhamento e indexação dependem da conta Google e não foram realizados localmente.

## Dados estruturados

Organization publica somente marca, URL, logo e canais comerciais já informados. Razão social, CNPJ, endereço, perfis sociais e avaliações não foram inventados. Páginas de serviço incluem `Service`; páginas com hierarquia visível incluem `BreadcrumbList`.

## Desempenho

As verificações responsivas de navegador cobrem 320 a 1440 px, movimento reduzido e a interação atual. Não existe deployment público acessível nem projeto Vercel conectado nesta sessão; por isso, Lighthouse de produção e métricas de campo Core Web Vitals ainda precisam ser medidos após a publicação. Métricas laboratoriais locais não substituem dados de campo.
