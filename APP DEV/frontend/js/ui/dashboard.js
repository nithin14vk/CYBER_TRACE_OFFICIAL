/**
 * CyberTrace: Digital Exposure Lab - Dashboard UI Renderer
 * Renders observed and simulated cards with mandatory status badges.
 */
class DashboardRenderer {
  /**
   * Updates all metrics, counters, and cards from backend scan response and client probe.
   */
  static renderScanResults(scanResponse, networkInfo, probeData) {
    DashboardRenderer.renderMetricsBar(scanResponse);
    DashboardRenderer.renderNetworkCard(networkInfo, probeData);
    DashboardRenderer.renderHardwareCard(probeData);
    DashboardRenderer.renderDisplayCard(probeData);
    DashboardRenderer.renderSimulatedPersonaCard(scanResponse.simulated_persona);
    DashboardRenderer.renderInaccessibleCard();
    DashboardRenderer.renderScenarios(scanResponse.risk_factors);
    DashboardRenderer.bindExplainButtons();
  }

  /**
   * Top metrics bar: score, counts, entropy
   */
  static renderMetricsBar(response) {
    const observedEl = document.getElementById('countObserved');
    const permEl = document.getElementById('countPermission');
    const simEl = document.getElementById('countSimulated');
    const inaccEl = document.getElementById('countInaccessible');
    const entropyEl = document.getElementById('metricEntropyRatio');
    const entropyBitsEl = document.getElementById('metricEntropyBits');

    if (observedEl) observedEl.textContent = response.observed_items_count || 9;
    if (permEl) permEl.textContent = response.permission_required_count || 0;
    if (simEl) simEl.textContent = response.simulated_items_count || 4;
    if (inaccEl) inaccEl.textContent = response.inaccessible_items_count || 5;

    if (entropyEl && response.entropy_analysis) {
      entropyEl.textContent = response.entropy_analysis.uniqueness_ratio || '1 in ~28,000';
    }
    if (entropyBitsEl && response.entropy_analysis) {
      entropyBitsEl.textContent = `~${response.entropy_analysis.estimated_bits_of_entropy || 14.5} bits of entropy`;
    }

    const calcExpEl = document.getElementById('scoreExplanationText');
    if (calcExpEl) {
      calcExpEl.textContent = response.score_calculation_explanation;
    }
  }

  /**
   * Renders Network & Routing Card
   */
  static renderNetworkCard(networkInfo, probe) {
    const geo = networkInfo.geo || {};
    const headers = networkInfo.headers || {};
    const tls = networkInfo.tls_http_hints || {};

    const container = document.getElementById('networkCardBody');
    if (!container) return;

    container.innerHTML = `
      <div class="data-row">
        <span class="data-label">
          Client IP Address:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="network-ip">Explain</button>
        </span>
        <span class="data-value highlight-cyan">${networkInfo.client_ip || '127.0.0.1'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">ISP / Carrier:</span>
        <span class="data-value">${geo.isp || 'Local Network Interface'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Autonomous System (ASN):</span>
        <span class="data-value">${geo.asn || 'AS0 Localhost / Private'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Approximate Metro Region:</span>
        <span class="data-value">${geo.city || 'Local Hub'}, ${geo.country || 'Local Subnet'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">HTTP Protocol & Scheme:</span>
        <span class="data-value">${tls.http_version || '1.1'} via ${(tls.scheme || 'http').toUpperCase()}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Accept-Language Header:</span>
        <span class="data-value">${headers.accept_language || probe.language || 'en-US'}</span>
      </div>
    `;

    // Update IP geo text banner
    const geoText = document.getElementById('approxGeoSummaryText');
    if (geoText) {
      geoText.textContent = `${geo.city || 'Local Area'}, ${geo.region || 'Subnet'}, ${geo.country || 'Internal'}`;
    }
    const ispText = document.getElementById('approxIspSummaryText');
    if (ispText) {
      ispText.textContent = `${geo.isp || 'Local Router Gateway'} (${geo.asn || 'AS0'})`;
    }
    const disclaimerText = document.getElementById('approxGeoDisclaimerText');
    if (disclaimerText) {
      disclaimerText.textContent = geo.disclaimer || 'IP geolocation reflects ISP routing gateways, not physical house addresses.';
    }
  }

  /**
   * Renders Hardware & Device Fingerprint Card
   */
  static renderHardwareCard(probe) {
    const container = document.getElementById('hardwareCardBody');
    if (!container) return;

    const batteryText = probe.battery_available 
      ? `${probe.battery_level_pct}% (${probe.battery_charging ? 'Charging' : 'Discharging'})` 
      : 'Restricted / Not Supported';

    const memoryText = probe.device_memory_gb ? `${probe.device_memory_gb} GB reported` : 'Masked / Standard';
    const coresText = probe.hardware_concurrency ? `${probe.hardware_concurrency} Logical Cores` : 'Unknown';

    container.innerHTML = `
      <div class="data-row">
        <span class="data-label">
          WebGL GPU Renderer:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="webgl-gpu">Explain</button>
        </span>
        <span class="data-value highlight-cyan">${probe.webgl_renderer || 'Default WebGL Renderer'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">WebGL GPU Vendor:</span>
        <span class="data-value">${probe.webgl_vendor || 'Default Vendor'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">
          CPU Hardware Cores:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="cpu-cores">Explain</button>
        </span>
        <span class="data-value highlight-green">${coresText}</span>
      </div>
      <div class="data-row">
        <span class="data-label">
          Device RAM Memory:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="device-memory">Explain</button>
        </span>
        <span class="data-value">${memoryText}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Connection Type / Speed:</span>
        <span class="data-value">${probe.connection_type || 'Broadband'} (${probe.connection_downlink_mbps ? probe.connection_downlink_mbps + ' Mbps' : 'Standard'})</span>
      </div>
      <div class="data-row">
        <span class="data-label">Battery Telemetry Status:</span>
        <span class="data-value">${batteryText}</span>
      </div>
    `;
  }

  /**
   * Renders Display & Temporal Card
   */
  static renderDisplayCard(probe) {
    const container = document.getElementById('displayCardBody');
    if (!container) return;

    container.innerHTML = `
      <div class="data-row">
        <span class="data-label">
          Screen Resolution:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="display-geometry">Explain</button>
        </span>
        <span class="data-value highlight-cyan">${probe.screen_resolution} (${probe.color_depth}-bit color)</span>
      </div>
      <div class="data-row">
        <span class="data-label">Current Viewport Size:</span>
        <span class="data-value">${probe.viewport_size}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Device Pixel Ratio:</span>
        <span class="data-value">${probe.pixel_ratio}x Retina / HiDPI</span>
      </div>
      <div class="data-row">
        <span class="data-label">
          System Timezone:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="timezone-clock">Explain</button>
        </span>
        <span class="data-value highlight-green">${probe.timezone} (Offset: ${probe.timezone_offset_minutes} mins)</span>
      </div>
      <div class="data-row">
        <span class="data-label">Touch Screen Capabilities:</span>
        <span class="data-value">${probe.touch_support ? 'Enabled (Touch Screen)' : 'Disabled (Standard Mouse/Trackpad)'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">
          Browser User-Agent:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="user-agent">Explain</button>
        </span>
        <span class="data-value" style="font-size: 0.75rem;">${probe.user_agent}</span>
      </div>
    `;
  }

  /**
   * Renders Simulated Identity Correlation Card (Alex Morgan Demo)
   */
  static renderSimulatedPersonaCard(persona) {
    const container = document.getElementById('simulatedPersonaBody');
    if (!container) return;

    container.innerHTML = `
      <div class="cyber-notice notice-info" style="margin-top: 0;">
        <i class="icon-info">ℹ</i>
        <span><strong>EDUCATIONAL SCENARIO:</strong> This demonstrates how attackers bridge anonymous browser footprints with compromised corporate records obtained from data brokers.</span>
      </div>
      <div class="data-row">
        <span class="data-label">Fictional Demo Name:</span>
        <span class="data-value highlight-cyan">${persona.name || 'Alex Morgan'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Simulated Corporate Profile:</span>
        <span class="data-value">${persona.role || 'Cybersecurity Analyst'}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Simulated Work Email:</span>
        <span class="data-value">${persona.simulated_email}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Simulated Breached Mobile:</span>
        <span class="data-value highlight-amber">${persona.simulated_phone}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Simulated Leaked Password Hash:</span>
        <span class="data-value highlight-red" style="font-size: 0.72rem;">${persona.simulated_hashed_pwd}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.85rem; line-height: 1.45;">
        ${persona.educational_lesson}
      </div>
    `;
  }

  /**
   * Renders the Protected / Inaccessible to Ordinary Websites Card
   */
  static renderInaccessibleCard() {
    const container = document.getElementById('inaccessibleCardBody');
    if (!container) return;

    container.innerHTML = `
      <div class="cyber-notice notice-inaccessible" style="margin-top: 0;">
        <span><strong>BROWSER SANDBOX PROTECTION:</strong> Modern browsers and mobile operating systems strictly prevent ordinary websites from querying hardware SIM IDs, device files, or passwords.</span>
      </div>
      <div class="data-row">
        <span class="data-label">
          SIM Card Serial (ICCID):
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="sim-identifiers">Explain</button>
        </span>
        <span class="data-value highlight-red">[BLOCKED BY OS SANDBOX]</span>
      </div>
      <div class="data-row">
        <span class="data-label">SIM Subscriber ID (IMSI):</span>
        <span class="data-value highlight-red">[BLOCKED BY OS SANDBOX]</span>
      </div>
      <div class="data-row">
        <span class="data-label">
          Visitor Mobile Phone Number:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="phone-number">Explain</button>
        </span>
        <span class="data-value highlight-red">[NO BROWSER API ACCESS]</span>
      </div>
      <div class="data-row">
        <span class="data-label">
          Password Manager Vaults:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="saved-passwords">Explain</button>
        </span>
        <span class="data-value highlight-red">[ENCRYPTED AT REST]</span>
      </div>
      <div class="data-row">
        <span class="data-label">
          SMS OTP Verification Codes:
          <button class="btn-cyber btn-cyber-sm btn-cyber-outline btn-explain" data-key="sms-otp">Explain</button>
        </span>
        <span class="data-value highlight-red">[REQUIRES USER INPUT]</span>
      </div>
    `;
  }

  /**
   * Renders threat intelligence scenarios in grid.
   */
  static renderScenarios(factors) {
    const container = document.getElementById('scenariosContainer');
    if (!container) return;

    ApiClient.getThreatScenarios().then(scenarios => {
      container.innerHTML = scenarios.map(sc => `
        <div class="cyber-card scenario-card">
          <div>
            <div class="card-header-flex">
              <span class="status-badge ${sc.threat_level === 'Critical' ? 'badge-inaccessible' : sc.threat_level === 'High' ? 'badge-permission' : 'badge-observed'}">
                ${sc.threat_level} THREAT
              </span>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--cyber-cyan);">${sc.category}</span>
            </div>
            <h3 class="scenario-title">${sc.title}</h3>
            <p class="scenario-summary">${sc.summary}</p>
            <ul class="scenario-chain-list">
              ${sc.how_it_works.map(step => `<li>• ${step}</li>`).join('')}
            </ul>
            <div class="scenario-impact-box">
              <strong>Real-World Impact:</strong> ${sc.real_world_impact}
            </div>
          </div>
          <div style="font-size: 0.8rem; color: var(--cyber-green); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem;">
            <strong>Defense:</strong> ${sc.defensive_action}
          </div>
        </div>
      `).join('');
    });
  }

  /**
   * Binds click listeners to all [EXPLAIN] buttons.
   */
  static bindExplainButtons() {
    document.querySelectorAll('.btn-explain').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.currentTarget.getAttribute('data-key');
        if (key && window.ModalViewer) {
          window.ModalViewer.show(key);
        }
      });
    });
  }
}

window.DashboardRenderer = DashboardRenderer;
