/**
 * CyberTrace: Digital Exposure Lab - Main Application Controller
 * Orchestrates probe execution, API integration, mapping, and awareness flow.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Global state references
  let clientProbeData = null;
  let serverNetworkInfo = null;
  let currentScanResponse = null;
  let preciseGpsData = null;

  // UI Component Instances
  const gaugeWidget = new RiskGaugeWidget('riskGaugeCanvas');
  const mapViewer = new MapViewer('exposureMap');
  ModalViewer.init();
  RevealSection.init();

  // DOM Elements
  const heroSection = document.getElementById('section-hero');
  const dashboardSection = document.getElementById('section-dashboard');
  const scanOverlay = document.getElementById('scanOverlay');
  const tickerText = document.getElementById('scanTickerText');
  const startScanBtn = document.getElementById('startScanBtn');
  const consentProceedBtn = document.getElementById('consentProceedBtn');
  const requestLocationBtn = document.getElementById('requestLocationBtn');
  const locationFeedback = document.getElementById('locationFeedbackBox');

  // Check health and display active privacy mode
  ApiClient.getHealth().then(health => {
    const pill = document.getElementById('healthStatusPill');
    if (pill && health.privacy_mode) {
      pill.title = `${health.service} v${health.version} - ${health.privacy_mode}`;
    }
  });

  /**
   * Starts the exposure scan sequence with animated telemetry ticker.
   */
  async function executeExposureScan() {
    // Show overlay
    if (scanOverlay) scanOverlay.classList.add('active');

    const tickerSteps = [
      'Establishing TCP/IP socket handshake...',
      'Observing client request headers & User-Agent...',
      'Probing CPU hardware concurrency & RAM limits...',
      'Querying WebGL graphics acceleration pipeline...',
      'Resolving approximate ISP autonomous system (BGP)...',
      'Evaluating device entropy & stateless fingerprint...',
      'Compiling educational threat telemetry...'
    ];

    let stepIndex = 0;
    const tickerInterval = setInterval(() => {
      if (tickerText && stepIndex < tickerSteps.length) {
        tickerText.textContent = tickerSteps[stepIndex];
        stepIndex++;
      }
    }, 280);

    try {
      // 1. Collect client browser probe
      clientProbeData = await BrowserProbe.collectTelemetry();

      // 2. Fetch server observed network & geo metadata
      serverNetworkInfo = await ApiClient.getNetworkInfo();

      // 3. Request server-side risk scoring
      currentScanResponse = await ApiClient.submitScanSummary(clientProbeData, preciseGpsData);

      // Brief delay to ensure user perceives scanning telemetry
      await new Promise(r => setTimeout(r, 1400));
      clearInterval(tickerInterval);

      // Hide overlay
      if (scanOverlay) scanOverlay.classList.remove('active');

      // Reveal dashboard
      if (heroSection) heroSection.style.display = 'none';
      if (dashboardSection) {
        dashboardSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Render dashboard contents
      DashboardRenderer.renderScanResults(currentScanResponse, serverNetworkInfo, clientProbeData);
      RevealSection.updateRevealTable(currentScanResponse);

      // Animate risk gauge
      gaugeWidget.renderScore(currentScanResponse.total_risk_score, currentScanResponse.risk_level);

      // Initialize map with approximate IP location
      const geo = serverNetworkInfo.geo || {};
      mapViewer.initMap(
        geo.latitude,
        geo.longitude,
        geo.city,
        geo.region,
        geo.country,
        geo.isp
      );

    } catch (err) {
      console.error('Scan execution error:', err);
      clearInterval(tickerInterval);
      if (scanOverlay) scanOverlay.classList.remove('active');
      alert('An error occurred during scanning. Using local diagnostic fallback.');
    }
  }

  // Event Listeners for Scan Triggers
  if (startScanBtn) {
    startScanBtn.addEventListener('click', () => {
      // Scroll to consent card
      const consentCard = document.getElementById('consentCard');
      if (consentCard) {
        consentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        executeExposureScan();
      }
    });
  }

  if (consentProceedBtn) {
    consentProceedBtn.addEventListener('click', () => {
      executeExposureScan();
    });
  }

  /**
   * Optional Location Demonstration: Requests user permission for precise GPS.
   * Educational note: NEVER invoked automatically.
   */
  if (requestLocationBtn) {
    requestLocationBtn.addEventListener('click', () => {
      if (!('geolocation' in navigator)) {
        showLocationFeedback('error', 'Geolocation API is not supported by this browser.');
        return;
      }

      showLocationFeedback('info', 'Browser permission prompt initiated. Please respond to the dialog in your browser bar.');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const accuracy = position.coords.accuracy || 20;

          preciseGpsData = {
            granted: true,
            latitude: lat,
            longitude: lon,
            accuracy_meters: accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          };

          const geoBadge = document.getElementById('geoDemoStatusBadge');
          if (geoBadge) {
            geoBadge.className = 'status-badge badge-permission';
            geoBadge.textContent = 'PERMISSION REQUIRED: GRANTED';
          }

          showLocationFeedback('success', `
            <strong>PERMISSION GRANTED:</strong> Precise GPS coordinates received: 
            <code>${lat.toFixed(6)}, ${lon.toFixed(6)}</code> (Accuracy: &plusmn;${Math.round(accuracy)}m).<br/>
            Notice on the map how the exact amber GPS pin differs from the broad cyan ISP routing hub!
          `);

          // Plot on map
          mapViewer.plotPreciseLocation(lat, lon, accuracy);

          // Re-evaluate risk score with GPS permission added (+25 pts)
          if (clientProbeData) {
            currentScanResponse = await ApiClient.submitScanSummary(clientProbeData, preciseGpsData);
            DashboardRenderer.renderMetricsBar(currentScanResponse);
            gaugeWidget.renderScore(currentScanResponse.total_risk_score, currentScanResponse.risk_level);
            RevealSection.updateRevealTable(currentScanResponse);
          }
        },
        (error) => {
          let msg = 'Location request canceled or failed.';
          const geoBadge = document.getElementById('geoDemoStatusBadge');
          if (error.code === error.PERMISSION_DENIED) {
            msg = '<strong>PERMISSION DENIED (SAFE):</strong> You successfully rejected the location prompt! The browser sandbox prevented this website from learning your physical GPS coordinates. Only broad IP-level geolocation remains visible.';
            if (geoBadge) {
              geoBadge.className = 'status-badge badge-observed';
              geoBadge.textContent = 'PERMISSION REQUIRED: DENIED';
            }
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Position unavailable: The device could not acquire satellite or Wi-Fi location fix.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out.';
          }
          showLocationFeedback('warning', msg);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  function showLocationFeedback(type, htmlContent) {
    if (!locationFeedback) return;
    locationFeedback.style.display = 'block';
    locationFeedback.className = `cyber-notice ${
      type === 'success' ? 'notice-shield' :
      type === 'warning' ? 'notice-warning' :
      type === 'error' ? 'notice-inaccessible' : 'notice-info'
    }`;
    locationFeedback.innerHTML = htmlContent;
  }
});
