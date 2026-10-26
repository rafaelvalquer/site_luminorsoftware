/** Servidor HTTP sem dependências externas. Node.js >= 20.
 *  Demonstração local: leads gravados em JSONL protegido fora de public/.
 *  Para produção: configure LEADS_DATA_DIR em volume persistente, segurança de rede
 *  e webhook/CRM com confirmação de recebimento. */
import {createServer} from 'node:http';
import {readFile, appendFile, mkdir, stat} from 'node:fs/promises';
import {resolve, join, extname, relative, sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const dataDir=resolve(process.env.LEADS_DATA_DIR||fileURLToPath(new URL('../data/',import.meta.url)));
const port=Number(process.env.PORT||4173);
const webhook=process.env.LEADS_WEBHOOK_URL||'';
const allowedExt=new Set(['.html','.js','.css','.svg','.png','.jpg','.jpeg','.webp','.ico','.txt','.xml','.woff2']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.woff2':'font/woff2'};
const memoryRate=new Map();
const eventTypes=new Set(['click_diagnostico','lead_enviado','click_whatsapp','view_solucao','demo_interacao','simulador_concluido']);
function send(res,code,payload,headers={}){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(payload))}
function ipKey(req){return req.socket.remoteAddress||'unknown'}
function rateCheck(req,limit,interval){const key=(req.url||'')+'|'+ipKey(req),now=Date.now(),old=memoryRate.get(key)||[];const updated=old.filter(t=>now-t<interval);if(updated.length>=limit)return false;updated.push(now);memoryRate.set(key,updated);return true}
async function readJson(req,limit=18000){if(!req.headers['content-type']?.startsWith('application/json'))throw Object.assign(new Error('O corpo deve estar em formato JSON.'),{status:415});let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw Object.assign(new Error('Corpo excede o tamanho permitido.'),{status:413});chunks.push(chunk)}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw Object.assign(new Error('JSON inválido.'),{status:400})}}
const clean=(v,max)=>typeof v==='string'?v.trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max):'';
function validate(data){const d={name:clean(data.name,100),company:clean(data.company,120),phone:clean(data.phone,20),email:clean(data.email,160),interest:clean(data.interest,80),problem:clean(data.problem,1500),consent:data.consent===true,website:clean(data.website,200)};
 const digits=d.phone.replace(/\D/g,'');if(d.name.length<2||d.company.length<2||digits.length<10||digits.length>13||d.problem.length<12||!d.consent)return {error:'Preencha nome, empresa, telefone, desafio e consentimento.'};if(d.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))return {error:'E-mail inválido.'};if(!['Ainda estou avaliando','Automação de processos internos','De planilhas para aplicações','Atendimento pelo WhatsApp','Outro processo','Agentes de IA e Atendimento','Sistemas de Gestão Sob Medida','Automação e Integrações'].includes(d.interest))d.interest='Ainda estou avaliando';return {value:d}}
async function safeAppend(file,obj){await mkdir(dataDir,{recursive:true,mode:0o700});await appendFile(join(dataDir,file),JSON.stringify(obj)+'\n',{mode:0o600})}
async function notifyWebhook(record){if(!webhook)return;try{const r=await fetch(webhook,{method:'POST',headers:{'Content-Type':'application/json','X-Luminor-Source':'site'},body:JSON.stringify(record),signal:AbortSignal.timeout(8000)});if(!r.ok)console.error('Webhook falhou:',r.status)}catch(err){console.error('Webhook indisponível:',err.message)}}
async function requestHandler(req,res){const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);const path=url.pathname;res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()');
 // Política de conteúdo sem scripts inline; fonts e gráficos locais, GA4 opcionais por consentimento.
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
 if(path==='/api/health'&&req.method==='GET')return send(res,200,{ok:true,form:'local-persistence',configuredWebhook:Boolean(webhook)});
 if(path==='/api/leads'&&req.method==='POST'){if(!rateCheck(req,6,3600000))return send(res,429,{error:'Limite temporário de tentativas excedido. Tente mais tarde.'},{'Retry-After':'3600'});
  try{const payload=await readJson(req),parsed=validate(payload);if(parsed.error)return send(res,400,{error:parsed.error});if(parsed.value.website)return send(res,200,{ok:true,id:'ignorado'});const rec={id:randomUUID(),createdAt:new Date().toISOString(),...parsed.value};delete rec.website;await safeAppend('leads.jsonl',rec);send(res,201,{ok:true,id:rec.id});void notifyWebhook(rec);return}catch(err){console.error('Erro ao registrar solicitação:',err.message);return send(res,err.status||500,{error:err.status?err.message:'Erro interno ao registrar. Solicitação não confirmada.'})}}
 if(path==='/api/events'&&req.method==='POST'){if(!rateCheck(req,500,3600000))return send(res,429,{error:'Muitas solicitações.'});try{const p=await readJson(req,2000);if(!eventTypes.has(p.event))return send(res,400,{error:'Evento desconhecido'});await safeAppend('events.jsonl',{event:p.event,section:clean(p.section,60),scenario:clean(p.scenario,60),at:new Date().toISOString()});return send(res,204,{})}catch(e){return send(res,e.status||500,{error:e.status?e.message:'Falha ao registrar evento'})}}
 if(path.startsWith('/api/'))return send(res,404,{error:'Rota não encontrada'});
 if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'Método não permitido'});
 let requested;try{requested=decodeURIComponent(path)}catch{return send(res,400,{error:'URL inválida'})}
 const target=resolve(root,'.'+requested);const rel=relative(root,target);if(rel.startsWith('..')||rel.includes('..'+sep)||extname(target)&&!allowedExt.has(extname(target)))return send(res,403,{error:'Acesso negado'});
 if(requested!=='/'&&requested.endsWith('/')){const canonicalPath=requested.replace(/\/+$/,'');return res.writeHead(308,{Location:`${canonicalPath}${url.search}`,'Cache-Control':'public, max-age=86400'}).end()}
 if(requested.endsWith('.html')&&requested!=='/index.html'){const canonicalPath=requested.slice(0,-5);return res.writeHead(308,{Location:`${canonicalPath||'/'}${url.search}`,'Cache-Control':'public, max-age=86400'}).end()}
 let file=requested==='/'?join(root,'index.html'):target;let body;
 try{body=await readFile(file)}catch{if(!extname(target)){try{file=target+'.html';await stat(file)}catch{try{file=join(target,'index.html');await stat(file)}catch{file=join(root,'404.html');return res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}).end(await readFile(file))}}}else{file=join(root,'404.html');return res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}).end(await readFile(file))}body=await readFile(file)}
 const type=mime[extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type,'Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=86400'});if(req.method==='HEAD')return res.end();res.end(body)
}
export const server=createServer((req,res)=>{requestHandler(req,res).catch(err=>{console.error('request error',err);if(!res.headersSent)send(res,500,{error:'Erro interno'});else res.end()})});
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))server.listen(port,'0.0.0.0',()=>console.log(`Luminor em http://localhost:${port}`));
