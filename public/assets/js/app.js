(() => {
  'use strict';
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
  const state = { lastInterest:'Ainda estou avaliando' };
  const config = window.LUMINOR_CONFIG || {};
  const icon=(id)=>`<svg class="icon" aria-hidden="true"><use href="#i-${id}"></use></svg>`;
  const safeText=(s)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  function showToast(text) {
    const el=$('#toast');if(!el)return;
    el.textContent=text;el.classList.add('show');clearTimeout(showToast.timer);
    showToast.timer=setTimeout(()=>el.classList.remove('show'),3500);
  }
  function menuClose(){const nav=$('#nav'),btn=$('#menu-btn');nav.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label','Abrir menu');document.body.classList.remove('menu-open')}
  function setupNav(){const btn=$('#menu-btn'),nav=$('#nav');btn.addEventListener('click',()=>{const open=btn.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');document.body.classList.toggle('menu-open',open)});
    $$('#nav a').forEach(a=>a.addEventListener('click',menuClose));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&btn.getAttribute('aria-expanded')==='true'){menuClose();btn.focus()}});
    document.addEventListener('click',e=>{if(btn.getAttribute('aria-expanded')==='true'&&!e.target.closest('.site-header'))menuClose()});
    window.matchMedia('(min-width:901px)').addEventListener('change',e=>{if(e.matches)menuClose()});
  }

  function setupAutomationDemo() {
    const root=$('#automation-demo');if(!root)return;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const scenarios={
      planilhas:{file:'controle_pedidos.xlsx',source:'Planilhas',result:'Aplicação',message:'Dados consolidados. Equipe no controle.',columns:['Pedido','Valor','Situação'],rows:[['#1048','R$ 320','Conferir'],['#1049','R$ 180','Copiar'],['#1050','R$ 460','Atualizar']],gain:'As planilhas viram uma visão clara da operação. Explore o dashboard.'},
      documentos:{file:'documentos_da_equipe',source:'Documentos',result:'Registros',message:'Informações extraídas. Revisão pela equipe.',gain:'Cada documento encontra seu lugar. Selecione um cartão para ver os dados.'},
      atendimento:{file:'mensagens_de_clientes',source:'WhatsApp',result:'Equipe',message:'Solicitações organizadas. Contexto com a equipe.',gain:'Conversas viram tickets com contexto e responsável. Explore os filtros.'}
    };
    const documents=[
      {id:'nf208',title:'Nota fiscal 208',category:'Nota fiscal',stage:0,fields:[['Fornecedor','Empresa A'],['Valor','R$ 320,00'],['Próxima etapa','Extrair informações']]},
      {id:'contrato',title:'Contrato comercial',category:'Contrato',stage:0,fields:[['Cliente','Empresa B'],['Vigência','12 meses'],['Próxima etapa','Revisar cláusulas']]},
      {id:'nf209',title:'Nota fiscal 209',category:'Nota fiscal',stage:1,fields:[['Fornecedor','Empresa C'],['Valor','R$ 180,00'],['Próxima etapa','Conferência humana']]},
      {id:'recibo',title:'Recibo de serviço',category:'Comprovante',stage:2,fields:[['Prestador','Empresa D'],['Valor','R$ 460,00'],['Situação','Classificado e organizado']]},
      {id:'pedido',title:'Pedido de compra',category:'Pedido',stage:2,fields:[['Código','PC 1050'],['Área','Operação'],['Situação','Classificado e organizado']]}
    ];
    const tickets=[{id:'1048',title:'Acompanhar pedido',owner:'Ana',status:'pendentes',label:'Pendente',initial:'A'}, {id:'1049',title:'Agendar uma visita',owner:'Bruno',status:'andamento',label:'Em andamento',initial:'B'}, {id:'1050',title:'Dúvida sobre pagamento',owner:'Carla',status:'resolvidos',label:'Resolvido',initial:'C'}, {id:'1051',title:'Solicitar orçamento',owner:'Ana',status:'pendentes',label:'Pendente',initial:'A'}];
    const captions=['Informações espalhadas e a mesma tarefa feita várias vezes.','A Luminor entende a rotina e mapeia as etapas que se repetem.','Criamos um fluxo sob medida que conecta dados, ferramentas e pessoas.'];
    const outcome=$('#scenario-outcome');
    let selected='planilhas',step=0,playing=false,timer=null,touched=false,period='semana',documentId=null,ticketFilter='todos';
    function resultHeader(title,subtitle){return `<div class="outcome-heading"><div><span class="outcome-kicker">RESULTADO POSSÍVEL</span><h3>${title}</h3></div>${icon('check')}</div><p class="outcome-subtitle">${subtitle}</p>`}
    function renderOutcome(){
      if(selected==='planilhas'){
        const month=period==='mes',values=month?[74,59,39]:[18,14,8],total=values.reduce((a,b)=>a+b,0);
        const points=month?'8,112 40,99 73,105 106,76 139,83 172,53 205,63 238,27 272,12':'8,112 52,95 96,103 140,69 184,76 228,39 272,30';
        outcome.innerHTML=resultHeader('Da planilha à visão do negócio','Dados reunidos em uma aplicação criada para sua operação.')+`<div class="dashboard-controls" role="group" aria-label="Período do dashboard"><button type="button" data-period="semana" aria-pressed="${!month}">Semana</button><button type="button" data-period="mes" aria-pressed="${month}">Mês</button></div><div class="dashboard-kpis"><div><span>Pedidos reunidos</span><strong>${total}</strong></div><div><span>Em análise</span><strong>${month?14:6}</strong></div><div><span>Fontes conectadas</span><strong>03</strong></div></div><div class="dashboard-charts"><div class="evolution-chart"><h4>Evolução de pedidos</h4><svg viewBox="0 0 280 135" role="img" aria-label="Evolução dos pedidos no período: ${month?'mês':'semana'}"><path class="chart-grid" d="M8 20H272M8 65H272M8 112H272"/><polygon class="chart-area" points="8,125 ${points} 272,125"/><polyline class="chart-line" points="${points}" pathLength="1"/></svg><div class="chart-axis"><span>${month?'Dia 1':'Seg'}</span><span>${month?'Dia 30':'Dom'}</span></div></div><div class="category-chart"><h4>Por área</h4>${['Comercial','Operação','Financeiro'].map((name,i)=>`<div class="category-bar"><span>${name}</span><strong>${values[i]}</strong><i style="--bar-width:${Math.round(values[i]/values[0]*100)}%"></i></div>`).join('')}</div></div><p class="outcome-note">Período selecionado: ${month?'mês':'semana'}</p>`;
      }else if(selected==='documentos'){
        const doc=documents.find(d=>d.id===documentId);
        outcome.innerHTML=resultHeader('Documentos com lugar e contexto','Um canvas para acompanhar cada etapa da organização.')+`<div class="document-canvas">${['Recebidos','Em análise','Organizados'].map((name,i)=>`<section class="document-column"><h4><span class="column-dot dot-${i}"></span>${name}<small>${documents.filter(d=>d.stage===i).length}</small></h4>${documents.filter(d=>d.stage===i).map(d=>`<button type="button" class="document-card" data-document="${d.id}" aria-pressed="${d.id===documentId}" aria-controls="document-detail">${icon('layer')}<strong>${d.title}</strong><span>${d.category}</span></button>`).join('')}</section>`).join('')}</div><div id="document-detail" class="document-detail" role="status">${doc?`<strong>${doc.title}</strong><dl><div><dt>Categoria</dt><dd>${doc.category}</dd></div>${doc.fields.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>`:'<span>Selecione um documento para explorar suas informações.</span>'}</div><p class="outcome-note">Extração e revisão configuradas para cada processo</p>`;
      }else{
        const filtered=tickets.filter(t=>ticketFilter==='todos'||t.status===ticketFilter);
        outcome.innerHTML=resultHeader('Cada conversa vira uma próxima ação','Tickets organizados, com responsável e situação visíveis.')+`<div class="ticket-filters" role="group" aria-label="Filtrar tickets por status">${[['todos','Todos'],['pendentes','Pendentes'],['andamento','Em andamento'],['resolvidos','Resolvidos']].map(([key,label])=>`<button type="button" data-ticket-filter="${key}" aria-pressed="${ticketFilter===key}">${label}</button>`).join('')}</div><ul class="ticket-list" aria-label="Tickets de atendimento">${filtered.map(t=>`<li class="ticket-row"><span class="ticket-avatar" aria-hidden="true">${t.initial}</span><div><span class="ticket-id">#${t.id} · WhatsApp</span><strong>${t.title}</strong><small>Responsável: ${t.owner}</small></div><span class="ticket-status status-${t.status}">${t.label}</span></li>`).join('')}</ul><p class="outcome-note" role="status">${filtered.length} ticket${filtered.length===1?'':'s'} neste filtro</p>`;
      }
    }
    function playLabel(){root.dataset.playing=String(playing);$('#demo-play-label').textContent=playing?'Pausar':step===3?'Rever transformação':step===0?'Ver transformação':'Continuar';$('#demo-play').setAttribute('aria-label',playing?'Pausar transformação':step===3?'Rever transformação':step===0?'Reproduzir transformação':'Continuar transformação');$('#demo-play>span').textContent=playing?'Ⅱ':step===3?'↻':'▶'}
    function pause(){clearTimeout(timer);playing=false;playLabel()}
    function setStep(next){step=next;root.dataset.step=String(step);outcome.hidden=step!==3;$$('[data-demo-step]',root).forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.demoStep)===step)));$('#demo-stage-copy').textContent=step===3?scenarios[selected].gain:captions[step];playLabel()}
    function schedule(){timer=setTimeout(()=>{if(step<3){setStep(step+1);schedule()}else pause()},1800)}
    function play(){if(motion.matches){setStep(3);pause();return}if(step===3)setStep(0);playing=true;playLabel();schedule()}
    function choose(name){
      pause();selected=name;root.dataset.scenario=name;period='semana';documentId=null;ticketFilter='todos';const scenario=scenarios[name];
      $$('[data-demo-scenario]',root).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.demoScenario===name)));
      $('#demo-source-name').textContent=scenario.file;$('#demo-node-source').textContent=scenario.source;$('#demo-node-result').textContent=scenario.result;$('#demo-result').textContent=scenario.message;
      if(name==='planilhas'){
        const cells=['','A','B','C','1',...scenario.columns,...scenario.rows.flatMap((row,i)=>[String(i+2),...row])];
        $('.sheet-grid',root).innerHTML=cells.map((cell,i)=>`<span class="${i>7&&i%4===3?'cell-wait':''}">${safeText(cell)}</span>`).join('');
      }
      $('#manual-preview').innerHTML=name==='documentos'?['Notas fiscais','Contrato_final_v3.pdf','Recibos','Pedido de compra'].map((label,i)=>`<div class="loose-document loose-${i}">${icon('layer')}<strong>${label}</strong><span>Conferir e organizar</span></div>`).join(''):name==='atendimento'?['Olá! Cadê meu pedido?','Pode agendar uma visita?','Preciso de um orçamento.','Alguém já respondeu?'].map((label,i)=>`<div class="loose-message loose-${i}">${icon('message')}<span>${label}</span></div>`).join(''):'';
      renderOutcome();setStep(0);
    }
    outcome.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      let selector;if(button.dataset.period){period=button.dataset.period;selector=`[data-period="${period}"]`}
      else if(button.dataset.document){documentId=button.dataset.document;selector=`[data-document="${documentId}"]`}
      else if(button.dataset.ticketFilter){ticketFilter=button.dataset.ticketFilter;selector=`[data-ticket-filter="${ticketFilter}"]`}
      else return;
      renderOutcome();$(selector,outcome).focus({preventScroll:true});
    });
    $$('[data-demo-scenario]',root).forEach(button=>button.addEventListener('click',()=>{touched=true;choose(button.dataset.demoScenario)}));
    $$('[data-demo-step]',root).forEach(button=>button.addEventListener('click',()=>{touched=true;pause();setStep(Number(button.dataset.demoStep))}));
    $('#demo-play').addEventListener('click',()=>{touched=true;if(playing)pause();else play()});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
    motion.addEventListener('change',()=>{if(motion.matches)pause()});
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting){pause();continue}if(entry.intersectionRatio>=.35&&!touched&&!motion.matches){touched=true;play()}}},{threshold:[0,.35]});
    choose('planilhas');observer.observe(root);
  }

  function setupTeamExperience(){
    const root=$('#team-experience');if(!root)return;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const phases=['before','transition','after'];let index=0,playing=false,touched=false,timer=null,travel=[];
    const copy={before:['Muita correria. Pouca clareza.','Informações dispersas, interrupções e tarefas repetitivas.','Cinco pessoas lidam com planilhas, mensagens e documentos espalhados.'],transition:['A rotina começa a se conectar.','As informações convergem para um fluxo de automação sob medida.','Documentos e solicitações convergem para uma automação central; as pessoas encontram suas estações.'],after:['Cada pessoa sabe onde focar.','Informação organizada, rotinas automatizadas e equipe com foco.','Cinco pessoas trabalham em estações organizadas e conectadas a uma automação central.']};
    function controls(){root.dataset.playing=String(playing);$('#team-play').innerHTML=playing?'Pausar <span aria-hidden="true">Ⅱ</span>':index===2?'Rever mudança <span aria-hidden="true">↻</span>':index===0?'Ver a mudança <span aria-hidden="true">▶</span>':'Continuar <span aria-hidden="true">▶</span>';$$('[data-team-state]',root).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.teamState===phases[index])))}
    function setPhase(next){
      const people=$$('.team-person',root),from=people.map(person=>getComputedStyle(person).transform);
      travel.forEach(animation=>animation.cancel());travel=[];
      index=next;const phase=phases[index];root.dataset.phase=phase;
      $('#team-scene-title').textContent=copy[phase][0];$('#team-status').textContent=copy[phase][1];$('#team-scene').setAttribute('aria-label',copy[phase][2]);controls();
      // Start at the exact position reached while running; no snap back to the route origin.
      if(next===1&&playing&&!motion.matches){
        travel=people.map((person,i)=>person.animate([{transform:from[i]},{transform:getComputedStyle(person).transform}],{duration:2700,easing:'cubic-bezier(.22,.7,.2,1)'}));
      }
    }
    function pause(){clearTimeout(timer);playing=false;controls();root.getAnimations({subtree:true}).forEach(animation=>animation.pause())}
    function schedule(){timer=setTimeout(()=>{if(index<2){setPhase(index+1);schedule()}else pause()},index===0?4400:index===1?3100:4600)}
    function play(){if(motion.matches){setPhase(2);pause();return}if(index===2)setPhase(0);playing=true;controls();root.getAnimations({subtree:true}).forEach(animation=>animation.play());schedule()}
    $$('[data-team-state]',root).forEach(b=>b.addEventListener('click',()=>{touched=true;pause();setPhase(b.dataset.teamState==='before'?0:2)}));
    $('#team-play').addEventListener('click',()=>{touched=true;if(playing)pause();else play()});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
    motion.addEventListener('change',()=>{if(motion.matches)pause()});
    const observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting){pause();continue}if(e.intersectionRatio>=.35&&!touched&&!motion.matches){touched=true;play()}}},{threshold:[0,.35]});observer.observe(root);setPhase(0);
  }

  function setupSolutionActions(){$$('.solution-cta').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.solution;$('#lead-interest').value=name;state.lastInterest=name;$('#contato').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});showToast('Selecionado: '+name)}));$$('[data-interest]').forEach(btn=>btn.addEventListener('click',()=>{$('#lead-interest').value=btn.dataset.interest}))}
  function validateLead(data){const errors=[];if(data.name.trim().length<2)errors.push('Informe seu nome.');if(data.company.trim().length<2)errors.push('Informe sua empresa.');const digits=data.phone.replace(/\D/g,'');if(digits.length<10||digits.length>13)errors.push('Informe um telefone com DDD válido.');if(data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))errors.push('E-mail inválido.');if(data.problem.trim().length<12)errors.push('Descreva o desafio com pelo menos 12 caracteres.');if(!data.consent)errors.push('Autorize o uso dos dados para resposta.');return errors}
  function setupForm(){const form=$('#lead-form');if(!form)return;const status=$('#form-status');$('#submit-lead')?.addEventListener('click',()=>form.requestSubmit());form.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form);const data={name:String(fd.get('name')||''),company:String(fd.get('company')||''),phone:String(fd.get('phone')||''),email:String(fd.get('email')||''),interest:String(fd.get('interest')||''),problem:String(fd.get('problem')||''),consent:fd.get('consent')==='on'};const errors=validateLead(data);status.className='form-status '+(errors.length?'error':'');status.textContent=errors.join(' ');if(errors.length){document.dispatchEvent(new CustomEvent('luminor:form-validation-error'));return}
    if(!/^\d{11,15}$/.test(config.whatsappE164||'')){status.className='form-status error';status.textContent='O canal de WhatsApp está indisponível no momento. Escreva para '+(config.contactEmail||'o e-mail comercial')+'.';return}
    const message=['Olá! Gostaria de solicitar um diagnóstico para minha empresa.','',`Nome: ${data.name}`,`Empresa: ${data.company}`,`Meu WhatsApp: ${data.phone}`,...(data.email?[`E-mail: ${data.email}`]:[]),`Processo: ${data.interest}`,'',`Como funciona hoje: ${data.problem}`].join('\n');const url=`https://wa.me/${config.whatsappE164}?text=${encodeURIComponent(message)}`;status.className='form-status ok';status.textContent='Mensagem preparada. Ela só será enviada quando você revisar e confirmar no WhatsApp.';const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.dataset.whatsapp='';link.dataset.ctaLocation='lead_form';link.textContent='Abrir WhatsApp com a mensagem';status.append(document.createTextNode(' '),link);link.click();
  })}
  function setupContacts(){const el=$('#business-contact');let lines=[];if(config.contactEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail))lines.push(`<a href="mailto:${encodeURIComponent(config.contactEmail)}">${safeText(config.contactEmail)}</a>`);if(config.whatsappE164&&/^\d{11,15}$/.test(config.whatsappE164)){const tel=config.whatsappE164;lines.push(`<a data-whatsapp href="https://wa.me/${tel}" target="_blank" rel="noopener noreferrer">WhatsApp comercial ↗</a>`);const link=document.createElement('a');link.href=`https://wa.me/${tel}`;link.className='whatsapp-floating';link.target='_blank';link.rel='noopener noreferrer';link.textContent='WhatsApp';link.setAttribute('aria-label','Conversar pelo WhatsApp');document.body.append(link);}
    if(lines.length)el.innerHTML='<strong>Fale com a equipe</strong><p>'+lines.join(' &nbsp;·&nbsp; ')+'</p>'+(config.cnpj?`<p>CNPJ: ${safeText(config.cnpj)}</p>`:'');
  }
  function init(){const year=$('#year');if(year)year.textContent=new Date().getFullYear();if($('#menu-btn')&&$('#nav'))setupNav();setupAutomationDemo();setupTeamExperience();setupSolutionActions();setupContacts();setupForm()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
