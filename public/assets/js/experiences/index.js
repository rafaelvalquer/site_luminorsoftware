// Ponto de entrada das experiências interativas da página inicial (módulo nativo).
import { setupAutomationFlow } from './automation-flow.js';
import { createCompactOutcome } from './dashboard.js';

const mounted = [];

function init() {
  const flowRoot = document.getElementById('automation-demo');
  const outcomeRoot = document.getElementById('scenario-outcome');
  if (flowRoot && outcomeRoot) mounted.push(setupAutomationFlow(flowRoot, { outcome: createCompactOutcome(outcomeRoot) }));

  // Leitura para testes e depuração: quantos temporizadores seguem ativos.
  window.LuminorExperiences = Object.freeze({
    pendingTimers: () => mounted.reduce((sum, item) => sum + item.pendingTimers(), 0),
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
