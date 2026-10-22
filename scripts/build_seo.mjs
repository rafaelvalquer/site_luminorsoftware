import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
export const siteOrigin='https://luminorsoftware.com.br';
const publicRoot=fileURLToPath(new URL('../public/',import.meta.url));
async function htmlFiles(dir=publicRoot){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.isDirectory())out.push(...await htmlFiles(join(dir,entry.name)));else if(extname(entry.name)==='.html')out.push(join(dir,entry.name))}return out}
export async function getIndexablePages(){const pages=[];for(const file of await htmlFiles()){const html=await readFile(file,'utf8');if(/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html))continue;const rel=relative(publicRoot,file).split(sep).join('/');let route=rel==='index.html'?'/':rel.endsWith('/index.html')?`/${rel.slice(0,-'index.html'.length).replace(/\/$/,'')}`:`/${rel.slice(0,-'.html'.length)}`;pages.push({file,route,canonical:`${siteOrigin}${route==='/'?'/':route}`})}return pages.sort((a,b)=>a.route.localeCompare(b.route))}
export async function buildSitemap(){const pages=await getIndexablePages();const entries=pages.map(({canonical})=>`  <url><loc>${canonical.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</loc></url>`).join('\n');const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;await writeFile(join(publicRoot,'sitemap.xml'),xml,'utf8');return {count:pages.length,xml}}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){const result=await buildSitemap();console.log(`Sitemap gerado com ${result.count} páginas indexáveis.`)}
