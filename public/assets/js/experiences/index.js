// Ponto de entrada das experiências interativas da homepage (módulos ES nativos, sem build).
import { setupAutomationFlow } from './automation-flow.js';
import { createCompactOutcome, createDashboardPanel } from './dashboard.js';
import { setupIntegrationLab } from './integrations.js';
import { setupGallery } from './gallery.js';
import { setupProcessRunner } from './process-runner.js';
import { prefersReducedMotion } from './motion.js';

const controllers = {};

function track(name, params = {}) {
  try { window.LuminorAnalytics?.track(name, { page_type: 'home', ...params }); } catch {}
}

/** Leva a pessoa do resultado compacto do hero ao painel completo da galeria. */
function exploreDashboard({ scenario, period }) {
  const { gallery, dashboard } = controllers;
  gallery.show('gestao');
  dashboard.open({ scenario, period });
  const panel = gallery.panel('gestao');
  panel.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' });
  const title = document.getElementById('dashboard-title');
  title.tabIndex = -1;
  title.focus({ preventScroll: true });
}

function init() {
  if (window.LuminorExperiences) return;
  const galleryRoot = document.getElementById('tech-gallery');
  const panelRoot = document.getElementById('dashboard-panel');
  if (panelRoot) controllers.dashboard = createDashboardPanel(panelRoot, { track, pageSize: 5 });
  const runnerRoot = document.getElementById('process-runner');
  if (runnerRoot) controllers.runner = setupProcessRunner(runnerRoot, { track });
  const labRoot = document.getElementById('integration-lab');
  if (labRoot) controllers.lab = setupIntegrationLab(labRoot, { track });
  if (galleryRoot) {
    controllers.gallery = setupGallery(galleryRoot, {
      track,
      // Uma demonstração que sai de cena não continua rodando escondida.
      onChange() { controllers.runner?.pause(); controllers.lab?.finish(); },
    });
  }

  const flowRoot = document.getElementById('automation-demo');
  const outcomeRoot = document.getElementById('scenario-outcome');
  if (flowRoot && outcomeRoot) {
    const canExplore = controllers.gallery && controllers.dashboard;
    controllers.flow = setupAutomationFlow(flowRoot, { outcome: createCompactOutcome(outcomeRoot, { onExplore: canExplore ? exploreDashboard : undefined }), track });
    if (!canExplore) outcomeRoot.classList.add('no-explore');
  }

  window.LuminorExperiences = Object.freeze({
    pendingTimers: () => Object.values(controllers).reduce((sum, item) => sum + (item.pendingTimers?.() ?? 0), 0),
    flowState: () => controllers.flow?.getState(),
    dashboardState: () => controllers.dashboard?.getState(),
    labState: () => controllers.lab?.getState(),
    runnerState: () => controllers.runner?.getState(),
    galleryState: () => controllers.gallery?.getState(),
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
