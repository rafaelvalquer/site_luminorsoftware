// Auxiliares de DOM das experiências. Todo conteúdo dinâmico entra como texto, nunca como HTML.
const SVG_NS = 'http://www.w3.org/2000/svg';

export const $ = (query, root = document) => root.querySelector(query);
export const $$ = (query, root = document) => Array.from(root.querySelectorAll(query));

function apply(node, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value === null || value === undefined) continue;
    if (key === 'class') node.setAttribute('class', value);
    else if (key === 'text') node.textContent = String(value);
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'style') for (const [prop, val] of Object.entries(value)) node.style.setProperty(prop, String(val));
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  return node;
}

function append(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(typeof child === 'object' ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Cria um elemento HTML: el('button', { type: 'button', text: 'Ok' }). */
export function el(tag, attrs = {}, ...children) {
  return append(apply(document.createElement(tag), attrs), children);
}

/** Cria um elemento SVG. */
export function svg(tag, attrs = {}, ...children) {
  return append(apply(document.createElementNS(SVG_NS, tag), attrs), children);
}

/** Ícone do sprite da página (#i-*), decorativo. */
export function icon(id, className = 'icon') {
  return svg('svg', { class: className, 'aria-hidden': 'true' }, svg('use', { href: `#i-${id}` }));
}

/**
 * Substitui o conteúdo de um contêiner preservando o foco do teclado:
 * o elemento focado é reencontrado pelo mesmo data-focus-key depois da troca.
 */
export function replaceChildrenKeepingFocus(container, ...children) {
  const active = document.activeElement;
  const key = container.contains(active) ? active?.dataset?.focusKey : null;
  container.replaceChildren(...children.flat(Infinity).filter(Boolean));
  if (key) container.querySelector(`[data-focus-key="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
}

/** Formata reais sem depender da localidade do navegador. */
export function money(value) {
  const [int, cents] = Number(value).toFixed(2).split('.');
  return `R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${cents}`;
}
