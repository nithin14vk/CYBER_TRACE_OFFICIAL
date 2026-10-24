/**
 * CyberTrace: Digital Exposure Lab - Client Browser Probe
 * Extracts non-sensitive telemetry exposed by standard W3C browser APIs.
 */
class BrowserProbe {
  /**
   * Executes complete client-side extraction.
   * Returns a promise resolving to the probe data payload.
   */
  static async collectTelemetry() {
    const nav = window.navigator;
    const scr = window.screen;

    // 1. Basic Navigator Telemetry
    const userAgent = nav.userAgent || 'Unknown Browser';
    const language = nav.language || 'en-US';
    const languages = Array.isArray(nav.languages) ? [...nav.languages] : [language];
    const platform = nav.platform || 'Unknown Platform';
    const cookiesEnabled = Boolean(nav.cookieEnabled);
    const doNotTrack = nav.doNotTrack || (window.doNotTrack ? '1' : 'unspecified');
    const globalPrivacyControl = Boolean(nav.globalPrivacyControl);

    // 2. Display and Viewport Dimensions
    const screenResolution = `${scr.width || 0}x${scr.height || 0}`;
    const viewportSize = `${window.innerWidth || 0}x${window.innerHeight || 0}`;
    const colorDepth = Number(scr.colorDepth || 24);
    const pixelRatio = Number(window.devicePixelRatio || 1.0);

    // 3. Temporal Telemetry (Timezone & Offset)
    let timezone = 'UTC';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
      timezone = 'UTC';
    }
    const timezoneOffsetMinutes = new Date().getTimezoneOffset();

    // 4. Hardware Specs (Cores & RAM)
    const hardwareConcurrency = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null;
    const deviceMemoryGb = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null;
    const touchSupport = Boolean(
      'ontouchstart' in window ||
      nav.maxTouchPoints > 0 ||
      (nav.msMaxTouchPoints && nav.msMaxTouchPoints > 0)
    );

    // 5. WebGL Graphics Adapter (GPU) Extraction
    const { webglVendor, webglRenderer } = BrowserProbe.extractWebGLInfo();

    // 6. Battery API Status (Graceful fallback)
    const batteryInfo = await BrowserProbe.extractBatteryInfo();

    // 7. Network Connection Hints
    const connectionInfo = BrowserProbe.extractConnectionInfo();

    // 8. Geolocation Support Check
    const geolocationSupported = Boolean('geolocation' in nav);

    return {
      user_agent: userAgent,
      language: language,
      languages: languages,
      platform: platform,
      screen_resolution: screenResolution,
      viewport_size: viewportSize,
      color_depth: colorDepth,
      pixel_ratio: pixelRatio,
      timezone: timezone,
      timezone_offset_minutes: timezoneOffsetMinutes,
      hardware_concurrency: hardwareConcurrency,
      device_memory_gb: deviceMemoryGb,
      touch_support: touchSupport,
      cookies_enabled: cookiesEnabled,
      do_not_track: String(doNotTrack),
      global_privacy_control: globalPrivacyControl,
      webgl_vendor: webglVendor,
      webgl_renderer: webglRenderer,
      battery_available: batteryInfo.available,
      battery_level_pct: batteryInfo.level,
      battery_charging: batteryInfo.charging,
      connection_type: connectionInfo.type,
      connection_downlink_mbps: connectionInfo.downlink,
      connection_rtt_ms: connectionInfo.rtt,
      geolocation_api_supported: geolocationSupported
    };
  }

  /**
   * Extracts unmasked GPU vendor and model using the standard WebGL extension.
   */
  static extractWebGLInfo() {
    let webglVendor = 'Standard Virtual Adapter / Masked';
    let webglRenderer = 'WebGL Render Context Default';

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || webglVendor;
          webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || webglRenderer;
        } else {
          webglVendor = gl.getParameter(gl.VENDOR) || webglVendor;
          webglRenderer = gl.getParameter(gl.RENDERER) || webglRenderer;
        }
      }
    } catch (e) {
      webglVendor = 'Blocked by Privacy Shield / Unsupported';
      webglRenderer = 'Masked GPU Hardware';
    }

    return { webglVendor, webglRenderer };
  }

  /**
   * Reads battery level if Battery Status API is available.
   */
  static async extractBatteryInfo() {
    if ('getBattery' in navigator && typeof navigator.getBattery === 'function') {
      try {
        const battery = await navigator.getBattery();
        return {
          available: true,
          level: Math.round(battery.level * 100),
          charging: battery.charging
        };
      } catch (e) {
        // Battery API blocked by permissions or flags
      }
    }
    return {
      available: false,
      level: null,
      charging: null
    };
  }

  /**
   * Reads Network Information API hints.
   */
  static extractConnectionInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      return {
        type: conn.effectiveType || conn.type || 'Standard Broadband',
        downlink: typeof conn.downlink === 'number' ? conn.downlink : null,
        rtt: typeof conn.rtt === 'number' ? conn.rtt : null
      };
    }
    return {
      type: 'Broadband / LAN',
      downlink: null,
      rtt: null
    };
  }
}

window.BrowserProbe = BrowserProbe;
