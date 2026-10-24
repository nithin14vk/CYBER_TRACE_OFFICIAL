/**
 * CyberTrace: Digital Exposure Lab - Awareness Reveal Section
 * Concludes the educational demonstration with clear safety lessons and restart controls.
 */
class RevealSection {
  static init() {
    const restartBtn = document.getElementById('restartDemoBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
    }
  }

  /**
   * Updates dynamic values in the reveal comparison table.
   */
  static updateRevealTable(scanResponse) {
    const obsCount = document.getElementById('revealObservedCount');
    const permCount = document.getElementById('revealPermissionCount');
    const simCount = document.getElementById('revealSimulatedCount');
    const inaccCount = document.getElementById('revealInaccessibleCount');

    if (obsCount) obsCount.textContent = `${scanResponse.observed_items_count || 9} Parameters`;
    if (permCount) permCount.textContent = `${scanResponse.permission_required_count || 0} APIs`;
    if (simCount) simCount.textContent = `${scanResponse.simulated_items_count || 4} Demo Records`;
    if (inaccCount) inaccCount.textContent = `${scanResponse.inaccessible_items_count || 5} Protected Bounds`;
  }
}

window.RevealSection = RevealSection;
