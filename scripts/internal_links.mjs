export function normalizePageUrl(value, base, origin) {
  try {
    const url = new URL(value.replaceAll('&amp;', '&'), base);
    if (url.origin !== origin) return null;
    url.search = '';
    url.hash = '';
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith('/index.html')) path = path.slice(0, -'index.html'.length);
    else if (path.endsWith('.html')) path = path.slice(0, -'.html'.length);
    if (path.length > 1) path = path.replace(/\/$/, '');
    return `${origin}${path}`;
  } catch {
    return null;
  }
}

export function extractInternalPageLinks(html, pageUrl, origin) {
  const links = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const normalized = normalizePageUrl(match[1], pageUrl, origin);
    if (normalized) links.add(normalized);
  }
  return links;
}
