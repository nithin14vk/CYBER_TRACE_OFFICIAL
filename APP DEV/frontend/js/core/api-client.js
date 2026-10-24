/**
 * CyberTrace: Digital Exposure Lab - API Client
 * Manages communication with FastAPI backend endpoints.
 */
class ApiClient {
  /**
   * Fetches health status and privacy mode assurance.
   */
  static async getHealth() {
    try {
      const res = await fetch(CyberTraceConfig.ENDPOINTS.HEALTH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend /api/health unreachable, using local fallback:', err);
      return {
        status: 'operational-offline',
        service: 'CyberTrace: Digital Exposure Lab',
        version: '1.0.0',
        privacy_mode: 'Client-Side Strict Isolation',
        persistence_active: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Requests network & IP inspection from the server.
   */
  static async getNetworkInfo() {
    try {
      const res = await fetch(CyberTraceConfig.ENDPOINTS.NETWORK_INFO);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend /api/network-info unreachable, using simulated local network payload:', err);
      return {
        status: 'success',
        client_ip: '127.0.0.1 (Localhost / Private Gateway)',
        is_proxy_forwarded: false,
        geo: {
          ip: '127.0.0.1',
          ip_version: 'IPv4',
          is_private_or_local: true,
          city: 'Local Gateway / Lab Subnet',
          region: 'Local Interface (RFC 1918)',
          country: 'Private Network',
          country_code: 'LOC',
          latitude: 37.7749,
          longitude: -122.4194,
          isp: 'Local Loopback Interface',
          asn: 'AS0 Private Lab',
          source: 'Client Local Adapter (Offline Fallback)',
          disclaimer: 'Local or Private IP detected. Websites running in your local lab cannot resolve external WAN locations without public internet routing.'
        },
        headers: {
          user_agent: navigator.userAgent,
          accept_language: navigator.language
        },
        tls_http_hints: {
          http_version: '1.1',
          scheme: window.location.protocol.replace(':', '')
        },
        educational_note: 'Every HTTP connection requires TCP/IP handshakes that naturally reveal IP and socket routing information.'
      };
    }
  }

  /**
   * Submits client telemetry probe and optional location data to produce risk analysis.
   */
  static async submitScanSummary(probeData, preciseLocation = null) {
    const payload = {
      probe: probeData,
      precise_location: preciseLocation,
      client_timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(CyberTraceConfig.ENDPOINTS.SCAN_SUMMARY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend /api/scan-summary unreachable, calculating client-side fallback:', err);
      return ApiClient.calculateOfflineScanSummary(probeData, preciseLocation);
    }
  }

  /**
   * Retrieves educational threat scenarios from backend.
   */
  static async getThreatScenarios() {
    try {
      const res = await fetch(CyberTraceConfig.ENDPOINTS.THREAT_SCENARIOS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend /api/threat-intel/scenarios unreachable, using bundled knowledge base:', err);
      return ApiClient.getBundledScenarios();
    }
  }

  /**
   * Client-side fallback calculator if server connection is severed.
   */
  static calculateOfflineScanSummary(probe, preciseLocation) {
    let score = 25; // baseline
    if (probe.webgl_renderer && !probe.webgl_renderer.includes('Masked')) score += 20;
    if (probe.hardware_concurrency) score += 10;
    if (probe.device_memory_gb) score += 8;
    if (probe.screen_resolution) score += 7;
    if (preciseLocation && preciseLocation.granted) score += 25;

    score = Math.min(score, 100);
    const tier = score <= 35 ? 'Minimal' : score <= 60 ? 'Moderate' : score <= 80 ? 'Elevated' : 'High';

    return {
      status: 'success',
      total_risk_score: score,
      risk_level: tier,
      score_breakdown: {
        browser_identity: 12,
        hardware_entropy: probe.webgl_renderer ? 22 : 10,
        network_routing: 20,
        temporal_display: 12,
        permission_grant: preciseLocation && preciseLocation.granted ? 25 : 0
      },
      score_calculation_explanation: 'Composite score evaluated from passive browser telemetry, hardware uniqueness, and permission state.',
      entropy_analysis: {
        estimated_bits_of_entropy: 14.2,
        uniqueness_ratio: '1 in ~25,000 devices',
        stateless_tracking_feasibility: 'High',
        primary_entropy_driver: 'WebGL Unmasked Renderer & Hardware Concurrency'
      },
      observed_items_count: 9,
      permission_required_count: preciseLocation && preciseLocation.granted ? 1 : 0,
      simulated_items_count: 4,
      inaccessible_items_count: 5,
      risk_factors: [
        {
          category: 'Hardware Telemetry',
          title: 'Unmasked WebGL Graphics Adapter',
          impact: 'High',
          score_points: 20,
          technical_detail: `Model: ${probe.webgl_renderer || 'Default'}`,
          attacker_pivot: 'Stateless device fingerprinting without cookies.',
          defense_mitigation: 'Use fingerprint-resistant browsers or extensions like CanvasBlocker.'
        }
      ],
      simulated_persona: {
        name: 'Alex Morgan',
        role: 'Simulated Corporate Employee',
        status_label: 'SIMULATED',
        simulated_email: 'alex.morgan.demo@example-corp.internal',
        simulated_phone: '+1 (555) 019-2834',
        simulated_iccid: '89014103211118510720',
        simulated_imsi: '310410123456789',
        simulated_hashed_pwd: '$2b$12$e8r...[Simulated Leaked Hash]',
        educational_lesson: 'Standard websites CANNOT extract SIM serial numbers, phone numbers, or passwords directly through the browser sandbox.'
      },
      actionable_mitigations: [
        'Verify URLs carefully before entering any credentials.',
        'Never grant high-privilege browser permissions to unverified sites.',
        'Use unique passwords and hardware MFA (FIDO2).'
      ],
      disclaimer: 'Educational simulation only. No data is stored or harvested.'
    };
  }

  /**
   * Bundled scenarios for offline lab demonstrations.
   */
  static getBundledScenarios() {
    return [
      {
        id: 'ip-profiling',
        title: 'IP-Based Profiling & Geo-Targeted Social Engineering',
        category: 'Network Layer',
        threat_level: 'Moderate',
        summary: 'How network telemetry allows websites to identify your ISP, approximate metro area, and corporate network.',
        how_it_works: [
          'Every TCP/IP packet reveals source IP address.',
          'Servers query BGP routing databases to determine ISP and ASN.',
          'Threat actors customize spear-phishing lures with local city/utility references.'
        ],
        real_world_impact: 'Targeted phishing with significantly higher conversion rates.',
        defensive_action: 'Use encrypted VPNs or Tor to mask your origin ISP.'
      },
      {
        id: 'browser-fingerprinting',
        title: 'Stateless Device Fingerprinting Without Cookies',
        category: 'Client-Side Surface',
        threat_level: 'High',
        summary: 'Synthesizing hardware and software attributes (WebGL, canvas, audio, screen) into a persistent cross-site tracking identifier.',
        how_it_works: [
          'Browsers query GPU, screen, and CPU cores via WebGL and CSSOM.',
          'Combining 30+ non-sensitive APIs produces a signature unique to 1 in 280,000+ devices.',
          'Persistent across private/incognito tabs and cookie purges.'
        ],
        real_world_impact: 'Cross-site tracking without cookie consent compliance.',
        defensive_action: 'Enable browser fingerprint protection (Firefox resistFingerprinting, Brave Shields).'
      },
      {
        id: 'phishing-impersonation',
        title: 'Phishing Landing Pages & Voluntary Disclosure Exploitation',
        category: 'Social Engineering',
        threat_level: 'Critical',
        summary: 'How attackers leverage benign browser cues to craft convincing login clones.',
        how_it_works: [
          'Adversaries build high-fidelity copies of corporate SSO portals.',
          'The page pre-fills the victim’s detected language and corporate domain to reduce suspicion.',
          'The victim voluntarily enters their credentials and 2FA code.'
        ],
        real_world_impact: 'Enterprise account takeover via reverse-proxy kits (Evilginx).',
        defensive_action: 'Use FIDO2 WebAuthn hardware keys and verify top-level domains.'
      },
      {
        id: 'credential-reuse',
        title: 'Credential Stuffing & Dark Web Data Broker Correlation',
        category: 'Identity & Authentication',
        threat_level: 'High',
        summary: 'Combining browser metadata with third-party breach dumps to systematically compromise secondary accounts.',
        how_it_works: [
          'Breached credentials circulate on public dark web forums.',
          'Automated botnets test reused passwords across thousands of portals simultaneously.',
          'Compromising one minor forum grants access to corporate or banking portals.'
        ],
        real_world_impact: 'Identity theft and cascading account lockouts.',
        defensive_action: 'Use a password manager to generate unique 16+ character passwords.'
      },
      {
        id: 'permission-overreach',
        title: 'Unnecessary Browser Permission Overreach (GPS, WebRTC, Sensors)',
        category: 'Application Permissions',
        threat_level: 'High',
        summary: 'Exploiting passive approval habits to obtain high-precision physical coordinates.',
        how_it_works: [
          'Web APIs permit requesting GPS, microphone, and camera access.',
          'Once granted, permissions often persist indefinitely.',
          'Malicious sites track real-time physical movements with sub-10 meter precision.'
        ],
        real_world_impact: 'Physical stalking and precise residential location mapping.',
        defensive_action: 'Keep location permissions default to "Always Block" or "Ask Every Time".'
      },
      {
        id: 'shortened-urls',
        title: 'Deceptive Shortened URLs & Transparent Tracking Redirects',
        category: 'Web Navigation',
        threat_level: 'Moderate',
        summary: 'Concealing malicious destinations and tracking query parameters.',
        how_it_works: [
          'Shorteners conceal destination domains from email filters.',
          'Unique tracking tokens correlate clicks with specific recipients.',
          'Redirects route victims to credential harvesters or malware drops.'
        ],
        real_world_impact: 'Phishing tracking and perimeter filter evasion.',
        defensive_action: 'Use link expanders or curl HEAD requests before clicking unfamiliar links.'
      }
    ];
  }
}

window.ApiClient = ApiClient;
