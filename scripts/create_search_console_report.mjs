import {readFile,writeFile} from 'node:fs/promises';
const xml=await readFile('public/sitemap.xml','utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const q=s=>'"'+String(s).replaceAll('"','""')+'"';
const header=['URL','Tipo de página','Data da última consulta','Status de indexação','Último rastreamento informado pelo Google','Canonical informada pelo Google','Motivo da exclusão','Ação corretiva','Status da correção'];
const rows=[header,...urls.map(u=>[u,u.includes('/servicos/')?'serviço':u.includes('/segmentos/')?'segmento':u.includes('/conteudos')?'conteúdo':'home','','Não consultado','','','','Inspecionar URL no Search Console após acesso autorizado','Pendente'])];
await writeFile('reports/search-console-status.csv','\uFEFF'+rows.map(r=>r.map(q).join(',')).join('\r\n')+'\r\n','utf8');
