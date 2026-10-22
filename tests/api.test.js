import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const port= 18000+Math.floor(Math.random()*1000);const origin=`http://127.0.0.1:${port}`;
const temp=await mkdtemp(join(tmpdir(),'luminor-test-'));
const proc=spawn(process.execPath,['server/index.js'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),LEADS_DATA_DIR:temp},stdio:'ignore'});
for(let i=0;i<70;i++){try{const r=await fetch(origin+'/api/health');if(r.ok)break}catch{}await sleep(75)}
test('HTML, CSS e SEO disponibilizados',async()=>{const r=await fetch(origin+'/');const h=await r.text();assert.equal(r.status,200);assert.match(h,/name="viewport"/);assert.match(h,/name="description"/);assert.match(h,/id="lead-form"/);assert.match(h,/id="processos"/);assert.match(h,/id="team-experience"/);assert.equal((await fetch(origin+'/assets/css/styles.css')).status,200)});
test('não expõe arquivos do servidor',async()=>{const r=await fetch(origin+'/server/index.js');assert.notEqual(r.status,200);const r2=await fetch(origin+'/data/leads.jsonl');assert.notEqual(r2.status,200)});
test('validação de lead recusa campos vazios',async()=>{const r=await fetch(origin+'/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'A'})});assert.equal(r.status,400)});
test('lead válido é persistido e retorna id real',async()=>{const body={name:'Maria Teste',company:'Empresa Exemplo',phone:'11999998888',email:'teste@exemplo.com',interest:'Automação de processos internos',problem:'Quero integrar meu estoque com pedidos.',consent:true,website:''};const r=await fetch(origin+'/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(r.status,201);const a=await r.json();assert.match(a.id,/^[a-f0-9-]{36}$/);const log=await readFile(join(temp,'leads.jsonl'),'utf8');assert.match(log,/Maria Teste/);assert.match(log,/Automação de processos internos/);assert.match(log,RegExp(a.id));assert.doesNotMatch(log,/"website"/)});
test('eventos aceitam apenas nomes conhecidos',async()=>{const headers={'Content-Type':'application/json'};const ok=await fetch(origin+'/api/events',{method:'POST',headers,body:JSON.stringify({event:'demo_interacao',scenario:'pedido'})});assert.equal(ok.status,204);const bad=await fetch(origin+'/api/events',{method:'POST',headers,body:JSON.stringify({event:'invalido'})});assert.equal(bad.status,400)});
test.after(async()=>{proc.kill('SIGTERM');await sleep(100);await rm(temp,{recursive:true,force:true})});
