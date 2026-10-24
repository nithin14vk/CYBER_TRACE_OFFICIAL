/**
 * CyberTrace: Digital Exposure Lab - Educational Modal Viewer
 * Presents deep-dive cybersecurity explanations for students.
 */
class ModalViewer {
  static init() {
    const backdrop = document.getElementById('educationalModalBackdrop');
    const closeBtn = document.getElementById('modalCloseBtn');
    const dismissBtn = document.getElementById('modalDismissBtn');

    if (closeBtn) closeBtn.addEventListener('click', ModalViewer.close);
    if (dismissBtn) dismissBtn.addEventListener('click', ModalViewer.close);

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) ModalViewer.close();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') ModalViewer.close();
    });
  }

  /**
   * Opens the modal with educational content for a specific key.
   */
  static show(explainerKey) {
    const data = CyberTraceConfig.EDUCATIONAL_EXPLAINERS[explainerKey];
    if (!data) return;

    const modal = document.getElementById('educationalModalBackdrop');
    const titleEl = document.getElementById('modalTitleText');
    const statusEl = document.getElementById('modalStatusBadge');
    const specEl = document.getElementById('modalWebStandardText');
    const whyEl = document.getElementById('modalWhyExposedText');
    const misuseEl = document.getElementById('modalAttackerMisuseText');
    const protectEl = document.getElementById('modalProtectionText');

    if (titleEl) titleEl.textContent = data.title;
    if (specEl) specEl.textContent = data.webStandard;
    if (whyEl) whyEl.textContent = data.whyExposed;
    if (misuseEl) misuseEl.textContent = data.attackerMisuse;
    if (protectEl) protectEl.textContent = data.howToProtect;

    if (statusEl) {
      const statusDef = CyberTraceConfig.STATUS[data.status] || CyberTraceConfig.STATUS.OBSERVED;
      statusEl.className = `status-badge ${statusDef.className}`;
      statusEl.textContent = statusDef.label;
    }

    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  static close() {
    const modal = document.getElementById('educationalModalBackdrop');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

window.ModalViewer = ModalViewer;
