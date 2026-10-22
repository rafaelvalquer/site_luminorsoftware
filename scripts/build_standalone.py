"""Gera prévia HTML autônoma de interface, sem servidor de leads."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]
html=(p/'public/index.html').read_text(encoding='utf-8')
css=(p/'public/assets/css/styles.css').read_text(encoding='utf-8')
config=(p/'public/assets/js/config.js').read_text(encoding='utf-8')
js=(p/'public/assets/js/app.js').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="/assets/css/styles.css">', f'<style>\n{css}\n</style>')
html=html.replace('<script src="/assets/js/config.js" defer></script>',f'<script>\n{config}\n</script>')
html=html.replace('<script src="/assets/js/app.js" defer></script>',f'<script>\n{js}\n</script>')
html=html.replace('href="/privacidade.html"','href="#politica-demonstracao"')
from urllib.parse import quote
favicon=(p/'public/assets/img/favicon.svg').read_text(encoding='utf-8')
html=html.replace('href="/assets/img/favicon.svg"', 'href="data:image/svg+xml,'+quote(favicon,safe='')+'"')
html=html.replace('</main>','<section id="politica-demonstracao" class="wrap preview-privacy"><strong>Política de privacidade da demonstração</strong><p>Ao preencher o formulário, o WhatsApp abre com a mensagem pronta. Os dados só são enviados quando você confirma no WhatsApp. A política preliminar está em <code>public/privacidade.html</code> e requer validação jurídica antes da publicação.</p></section></main>')
html=html.replace('name="robots" content="index,follow"','name="robots" content="noindex,nofollow"')
out=p/'PREVIA_AUTONOMA.html'
out.write_text(html, encoding='utf-8')
print(str(out),out.stat().st_size)
