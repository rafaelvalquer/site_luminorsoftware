// Gera PREVIA_AUTONOMA.html: a página inicial em um único arquivo, sem servidor de leads.
// Os módulos de assets/js/experiences são empacotados em um script comum, porque o navegador
// não carrega módulos ES a partir de file://.
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n');
const base64 = file => readFileSync(join(root, file)).toString('base64');
const replaceAll = (text, from, to) => {
  if (!text.includes(from)) throw new Error(`Trecho não encontrado em index.html: ${from.slice(0, 80)}`);
  return text.split(from).join(to);
};

const IMPORT = /^import\s*\{([^}]*)\}\s*from\s*'(\.\/[\w-]+\.js)';[ \t]*$/gm;
const EXPORT = /^export\s+(async\s+function|function|const|let|class)\s+([\w$]+)/gm;

/** Empacota um grafo de módulos simples (imports nomeados relativos, exports declarativos). */
export function bundleModules(entry) {
  const order = [];
  const seen = new Set();
  const id = file => '__module_' + relative(root, file).replace(/[^\w]/g, '_');
  const visit = file => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const [, , spec] of readFileSync(file, 'utf8').matchAll(IMPORT)) visit(resolve(dirname(file), spec));
    order.push(file);
  };
  visit(entry);
  return order.map(file => {
    const exported = [];
    let source = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
      .replace(IMPORT, (_, names, spec) => `const {${names.replace(/\s+as\s+/g, ': ')}} = ${id(resolve(dirname(file), spec))};`)
      .replace(EXPORT, (_, kind, name) => { exported.push(name); return `${kind} ${name}`; });
    if (/^\s*(import|export)\b/m.test(source)) throw new Error(`Sintaxe de módulo não suportada em ${relative(root, file)}`);
    return `const ${id(file)} = (() => {\n${source}\nreturn { ${exported.join(', ')} };\n})();`;
  }).join('\n');
}

export function buildStandalone() {
  let html = read('public/index.html');
  let css = read('public/assets/css/styles.css');
  css = replaceAll(css, 'url(/assets/fonts/inter-latin-wght-normal.woff2)', `url(data:font/woff2;base64,${base64('public/assets/fonts/inter-latin-wght-normal.woff2')})`);
  html = replaceAll(html, '<link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>', '');
  html = replaceAll(html, '<link rel="stylesheet" href="/assets/css/styles.css">', `<style>\n${css}\n</style>`);
  html = replaceAll(html, '<link rel="stylesheet" href="/assets/css/experiences.css">', `<style>\n${read('public/assets/css/experiences.css')}\n</style>`);
  html = html.replace(/\s*<link rel="modulepreload" href="[^"]+">/g, '');
  for (const name of ['config', 'analytics', 'consent', 'app']) {
    html = replaceAll(html, `<script src="/assets/js/${name}.js" defer></script>`, `<script>\n${read(`public/assets/js/${name}.js`)}\n</script>`);
  }
  const bundle = bundleModules(join(root, 'public/assets/js/experiences/index.js'));
  html = replaceAll(html, '<script type="module" src="/assets/js/experiences/index.js"></script>', `<script>\n(() => {\n'use strict';\n${bundle}\n})();\n</script>`);
  html = replaceAll(html, 'href="/privacidade"', 'href="#politica-demonstracao"');
  html = replaceAll(html, '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">', '');
  html = replaceAll(html, '<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">', '');
  html = replaceAll(html, 'href="/assets/img/favicon-192.png"', `href="data:image/png;base64,${base64('public/assets/img/favicon-192.png')}"`);
  html = replaceAll(html, 'src="/assets/img/luminor-symbol.svg"', `src="data:image/svg+xml;base64,${base64('public/assets/img/luminor-symbol.svg')}"`);
  // Capturas das demonstrações: só a versão menor, embutida, para a prévia abrir sem servidor.
  html = html.replace(/ srcset="[^"]*\/assets\/img\/demos\/[^"]*"/g, '');
  html = html.replace(/src="\/assets\/img\/demos\/([\w-]+\.webp)"/g, (_, file) => `src="data:image/webp;base64,${base64(`public/assets/img/demos/${file}`)}"`);
  html = replaceAll(html, '</main>', '<section id="politica-demonstracao" class="wrap preview-privacy"><strong>Política de privacidade da demonstração</strong><p>Ao preencher o formulário, o WhatsApp abre com a mensagem pronta. Os dados só são enviados quando você confirma no WhatsApp. A política preliminar está em <code>public/privacidade.html</code> e requer validação jurídica antes da publicação.</p></section></main>');
  html = replaceAll(html, 'name="robots" content="index,follow"', 'name="robots" content="noindex,nofollow"');
  html = html.replace(/\s*<link rel="canonical" href="https:\/\/luminorsoftware\.com\.br\/">/g, '');
  html = html.replace(/\s*<meta property="og:url" content="https:\/\/luminorsoftware\.com\.br\/">/g, '');
  return html;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = join(root, 'PREVIA_AUTONOMA.html');
  writeFileSync(out, buildStandalone());
  console.log(out, statSync(out).size);
}
