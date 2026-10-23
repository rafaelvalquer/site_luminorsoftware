(() => {
  'use strict';
  const allowed = new Set(['page_view','view_service','click_diagnostico','click_whatsapp','form_validation_error','generate_lead']);
  let active = false;
  let initialized = false;
  let pageViewSent = false;
  const config = () => window.LUMINOR_CONFIG || {};
  const consent = () => window.LuminorConsent?.getState() === 'accepted';
  const clean = value => String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);

  function event(name, params = {}) {
    if (!allowed.has(name) || !active || !consent()) return false;
    const safe = {};
    for (const key of ['page_type','service_slug','cta_location','contact_channel']) {
      if (params[key]) safe[key] = clean(params[key]);
    }
    if (name === 'page_view') {
      safe.page_location = `${location.origin}${location.pathname}`;
      safe.page_title = String(document.title || '').slice(0,120);
    }
    if (window.gtag) window.gtag('event', name, safe);
    return true;
  }

  function initialize() {
    const id = config().analyticsId;
    if (!consent() || !/^G-[A-Z0-9]+$/.test(id || '') || initialized) return false;
    initialized = true;
    active = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('consent','update',{analytics_storage:'granted'});
    window.gtag('config', id, {send_page_view:false,anonymize_ip:true});
    const script = document.createElement('script');
    script.id = 'luminor-ga4';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
    if (!pageViewSent) {
      pageViewSent = true;
      event('page_view',{page_type:document.body?.dataset.pageType || 'home'});
      if(document.body?.dataset.pageType === 'service') event('view_service',{page_type:'service',service_slug:document.body.dataset.serviceSlug});
    }
    return true;
  }

  function revoke() {
    if (!active && !initialized) return;
    active = false;
    if (window.gtag) window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    document.querySelector('#luminor-ga4')?.remove();
    initialized = false;
    const host = location.hostname;
    const rootDomain = host === 'luminorsoftware.com.br' || host.endsWith('.luminorsoftware.com.br') ? '.luminorsoftware.com.br' : '';
    const domains = [...new Set([host, rootDomain, ''])];
    const names = ['_ga','_gid','_gat',...Object.keys(document.cookie.split(';').reduce((out,item)=>{const key=item.trim().split('=')[0];if(key.startsWith('_ga_'))out[key]=1;return out},{}))];
    for (const name of names) for (const path of ['/',location.pathname || '/']) for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}${domain?`; Domain=${domain}`:''}; SameSite=Lax`;
    }
  }

  document.addEventListener('luminor:consent', e => e.detail?.state === 'accepted' ? initialize() : revoke());
  document.addEventListener('click', e => {
    const target = e.target.closest?.('[data-event],[data-whatsapp],a[href^="mailto:"]');
    if (!target) return;
    if (target.dataset.event === 'click_diagnostico') event('click_diagnostico',{page_type:document.body?.dataset.pageType || 'home',cta_location:target.dataset.ctaLocation || 'site'});
    if (target.hasAttribute('data-whatsapp') || target.href?.includes('wa.me/')) event('click_whatsapp',{page_type:document.body?.dataset.pageType || 'home',cta_location:target.dataset.ctaLocation || 'site',contact_channel:'whatsapp'});
  });
  document.addEventListener('luminor:form-validation-error', () => event('form_validation_error',{page_type:'home'}));
  window.LuminorAnalytics = Object.freeze({track:event,initialize,revoke,isActive:()=>active});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
})();
