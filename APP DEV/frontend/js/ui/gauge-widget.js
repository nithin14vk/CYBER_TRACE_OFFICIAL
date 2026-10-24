/**
 * CyberTrace: Digital Exposure Lab - Risk Gauge Widget
 * Renders an animated high-tech cybersecurity dial gauge on HTML5 Canvas.
 */
class RiskGaugeWidget {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.currentScore = 0;
    this.targetScore = 0;
    this.animationFrame = null;
  }

  /**
   * Sets and animates to the new risk score (0-100).
   */
  renderScore(score, tier) {
    if (!this.canvas || !this.ctx) return;
    this.targetScore = Math.max(0, Math.min(100, Math.round(score)));

    // Cancel any ongoing animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const duration = 1200; // ms
    const startTime = performance.now();
    const startScore = this.currentScore;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      this.currentScore = Math.round(startScore + (this.targetScore - startScore) * ease);
      this.drawGauge(this.currentScore);

      // Update text in DOM
      const scoreEl = document.getElementById('gaugeNumericScore');
      if (scoreEl) scoreEl.textContent = this.currentScore;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.updateTierPill(tier);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Draws the arc, ticks, and neon indicator on canvas.
   */
  drawGauge(score) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height - 20;
    const radius = 95;

    const startAngle = Math.PI; // 180 deg
    const endAngle = 2 * Math.PI; // 360 deg

    // 1. Background Arc Track
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Determine Neon Color based on score
    let strokeGradient = ctx.createLinearGradient(0, centerY, width, centerY);
    if (score <= 35) {
      strokeGradient.addColorStop(0, '#00ff9d');
      strokeGradient.addColorStop(1, '#00f0ff');
    } else if (score <= 65) {
      strokeGradient.addColorStop(0, '#00f0ff');
      strokeGradient.addColorStop(1, '#ffb703');
    } else if (score <= 85) {
      strokeGradient.addColorStop(0, '#ffb703');
      strokeGradient.addColorStop(1, '#ff3366');
    } else {
      strokeGradient.addColorStop(0, '#ff3366');
      strokeGradient.addColorStop(1, '#bd00ff');
    }

    // 3. Active Score Arc
    const scoreAngle = startAngle + (score / 100) * (endAngle - startAngle);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, scoreAngle);
    ctx.lineWidth = 14;
    ctx.strokeStyle = strokeGradient;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 12;
    ctx.shadowColor = score <= 35 ? 'rgba(0, 255, 157, 0.4)' : score <= 65 ? 'rgba(255, 183, 3, 0.4)' : 'rgba(255, 51, 102, 0.4)';
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // 4. Subtle Inner Grid Ticks
    const numTicks = 20;
    for (let i = 0; i <= numTicks; i++) {
      const angle = startAngle + (i / numTicks) * Math.PI;
      const innerR = radius - 18;
      const outerR = radius - 12;

      const x1 = centerX + Math.cos(angle) * innerR;
      const y1 = centerY + Math.sin(angle) * innerR;
      const x2 = centerX + Math.cos(angle) * outerR;
      const y2 = centerY + Math.sin(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
    }
  }

  /**
   * Updates tier pill badge style.
   */
  updateTierPill(tier) {
    const pill = document.getElementById('gaugeTierPill');
    if (!pill) return;

    pill.className = 'gauge-tier-pill';
    const tierLower = (tier || 'moderate').toLowerCase();
    pill.classList.add(`tier-${tierLower}`);
    pill.textContent = `${tier || 'Moderate'} Exposure Level`;
  }
}

window.RiskGaugeWidget = RiskGaugeWidget;
