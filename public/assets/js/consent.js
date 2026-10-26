(() => {
  'use strict';
  const key='luminor-analytics-consent';
  const valid=new Set(['accepted','rejected']);
  let state='pending';
  try { const saved=localStorage.getItem(key); if(valid.has(saved)) state=saved; } catch {}

  function ensureUI(){
    if(!document.querySelector('#cookie-banner')){
      const banner=document.createElement('section');banner.id='cookie-banner';banner.className='cookie-banner';banner.hidden=true;banner.setAttribute('aria-label','Preferências de métricas');
      banner.innerHTML='<p>As métricas opcionais só são ativadas se você autorizar. Você pode alterar sua escolha a qualquer momento. <a href="/privacidade">Saiba mais</a>.</p><div><button class="btn btn-secondary" id="cookies-reject" type="button">Somente essenciais</button><button class="btn btn-primary" id="cookies-accept" type="button">Aceitar métricas</button></div>';
      document.body.append(banner);
    }
    if(!document.querySelector('#cookie-settings')){
      const footer=document.querySelector('footer');
      if(footer){const button=document.createElement('button');button.id='cookie-settings';button.type='button';button.className='cookie-settings-link';button.textContent='Preferências de cookies';(footer.querySelector('.footer-bottom > div')||footer).append(button)}
    }
  }
  function set(next){if(!valid.has(next))return;state=next;try{localStorage.setItem(key,next)}catch{}const banner=document.querySelector('#cookie-banner');if(banner)banner.hidden=true;document.dispatchEvent(new CustomEvent('luminor:consent',{detail:{state}}))}
  function bind(){ensureUI();const banner=document.querySelector('#cookie-banner');if(state==='pending')banner.hidden=false;
    document.querySelector('#cookies-accept')?.addEventListener('click',()=>set('accepted'));
    document.querySelector('#cookies-reject')?.addEventListener('click',()=>set('rejected'));
    document.querySelector('#cookie-settings')?.addEventListener('click',()=>{banner.hidden=false;document.querySelector('#cookies-accept')?.focus()});
    if(state==='accepted')document.dispatchEvent(new CustomEvent('luminor:consent',{detail:{state}}));
  }
  window.LuminorConsent=Object.freeze({getState:()=>state,accept:()=>set('accepted'),reject:()=>set('rejected'),revoke:()=>set('rejected'),openPreferences:()=>{const banner=document.querySelector('#cookie-banner');if(banner)banner.hidden=false}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
