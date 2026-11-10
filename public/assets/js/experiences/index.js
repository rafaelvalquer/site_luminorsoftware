// Ponto de entrada das experiências interativas da página inicial (módulo nativo).
import { setupAutomationFlow } from './automation-flow.js';
import { createCompactOutcome, createDashboardDialog } from './dashboard.js';
import { setupIntegrationLab } from './integrations.js';

const controllers = {};

/** Eventos de uso das demonstrações; analytics.js decide se envia (consentimento e lista permitida). */
function track(name, params = {}) {
  try { window.LuminorAnalytics?.track(name, { page_type: 'home', ...params }); } catch { /* métricas nunca quebram a página */ }
}

function init() {
  // Uma única montagem por página, mesmo que o módulo seja avaliado de novo.
  if (window.LuminorExperiences) return;

  const dialogRoot = document.getElementById('dashboard-dialog');
  if (dialogRoot && typeof dialogRoot.showModal === 'function') controllers.dashboard = createDashboardDialog(dialogRoot, { track });

  const flowRoot = document.getElementById('automation-demo');
  const outcomeRoot = document.getElementById('scenario-outcome');
  if (flowRoot && outcomeRoot) {
    const onExplore = controllers.dashboard ? options => controllers.dashboard.open(options) : undefined;
    controllers.flow = setupAutomationFlow(flowRoot, { outcome: createCompactOutcome(outcomeRoot, { onExplore }), track });
    if (!controllers.dashboard) outcomeRoot.classList.add('no-explore');
  }

  const labRoot = document.getElementById('integration-lab');
  if (labRoot) controllers.lab = setupIntegrationLab(labRoot, { track });

  // Leitura para testes e depuração: estado das experiências e temporizadores ainda ativos.
  window.LuminorExperiences = Object.freeze({
    pendingTimers: () => Object.values(controllers).reduce((sum, item) => sum + (item.pendingTimers?.() ?? 0), 0),
    flowState: () => controllers.flow?.getState(),
    dashboardState: () => controllers.dashboard?.getState(),
    labState: () => controllers.lab?.getState(),
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
