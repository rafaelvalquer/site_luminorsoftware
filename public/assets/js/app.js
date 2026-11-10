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

  // As demonstrações interativas da homepage vivem em assets/js/experiences/.
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
  // Entrada suave dos cartões e da trilha do método ao entrarem na tela (só transform e opacidade).
  function setupReveal(){const cards=$$('.solutions .solution-card,.method-principles'),track=$('.method-track');const all=[...cards,track].filter(Boolean);if(!all.length)return;
    if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches){all.forEach(el=>el.classList.add('is-visible'));return}
    document.documentElement.classList.add('has-reveal');cards.forEach((el,i)=>{el.setAttribute('data-reveal','');el.style.transitionDelay=(i%4)*70+'ms'});
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;el.classList.add('is-visible');observer.unobserve(el);if(el.hasAttribute('data-reveal'))setTimeout(()=>{el.style.transitionDelay=''},900)}},{threshold:.15});all.forEach(el=>observer.observe(el))}
  function init(){const year=$('#year');if(year)year.textContent=new Date().getFullYear();if($('#menu-btn')&&$('#nav'))setupNav();setupHeaderShadow();setupReveal();setupSolutionActions();setupContacts();setupForm()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
