// Ponto de entrada das experiências interativas da página inicial (módulo nativo).
import { setupAutomationFlow } from './automation-flow.js';
import { createCompactOutcome } from './dashboard.js';

const mounted = [];

/** Eventos de uso das demonstrações; analytics.js decide se envia (consentimento e lista permitida). */
function track(name, params = {}) {
  try { window.LuminorAnalytics?.track(name, { page_type: 'home', ...params }); } catch { /* métricas nunca quebram a página */ }
}

function init() {
  const flowRoot = document.getElementById('automation-demo');
  const outcomeRoot = document.getElementById('scenario-outcome');
  if (flowRoot && outcomeRoot) mounted.push(setupAutomationFlow(flowRoot, { outcome: createCompactOutcome(outcomeRoot), track }));

  // Leitura para testes e depuração: estado do fluxo e temporizadores ainda ativos.
  window.LuminorExperiences = Object.freeze({
    pendingTimers: () => mounted.reduce((sum, item) => sum + item.pendingTimers(), 0),
    flowState: () => mounted[0]?.getState?.(),
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
