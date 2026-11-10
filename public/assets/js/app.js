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

  // O exemplo interativo do hero (#automation-demo) vive em assets/js/experiences/.
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
  function setupContacts(){const el=$('#business-contact');let lines=[];if(config.contactEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail))lines.push(`<a href="mailto:${encodeURIComponent(config.contactEmail)}">${safeText(config.contactEmail)}</a>`);if(config.whatsappE164&&/^\d{11,15}$/.test(config.whatsappE164)){const tel=config.whatsappE164;lines.push(`<a data-whatsapp href="https://wa.me/${tel}" target="_blank" rel="noopener noreferrer">WhatsApp comercial ↗</a>`);const link=document.createElement('a');link.href=`https://wa.me/${tel}`;link.className='whatsapp-floating';link.target='_blank';link.rel='noopener noreferrer';link.dataset.whatsapp='';link.dataset.ctaLocation='floating';link.innerHTML=`${icon('message')}<span>WhatsApp</span>`;link.setAttribute('aria-label','Conversar pelo WhatsApp');document.body.append(link);
      // Recolhe o botão onde o contato já está na tela (formulário e rodapé), para não cobrir conteúdo.
      const zones=[$('#contato'),$('.site-footer')].filter(Boolean);if('IntersectionObserver' in window&&zones.length){const visible=new Set();const observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target);link.classList.toggle('is-hidden',visible.size>0)},{threshold:.05});zones.forEach(zone=>observer.observe(zone))}}
    if(lines.length)el.innerHTML='<strong>Fale com a equipe</strong><p>'+lines.join(' &nbsp;·&nbsp; ')+'</p>'+(config.cnpj?`<p>CNPJ: ${safeText(config.cnpj)}</p>`:'');
  }
  // Sombra sutil no cabeçalho fixo depois que a página rola.
  function setupHeaderShadow(){const header=$('.site-header');if(!header)return;const update=()=>header.classList.toggle('is-scrolled',window.scrollY>8);update();window.addEventListener('scroll',update,{passive:true})}
  function init(){const year=$('#year');if(year)year.textContent=new Date().getFullYear();if($('#menu-btn')&&$('#nav'))setupNav();setupHeaderShadow();setupTeamExperience();setupSolutionActions();setupContacts();setupForm()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
