/**
 * CyberTrace: Digital Exposure Lab - Frontend Configuration & Educational Knowledge Base
 */
const apiOrigin = (typeof window !== 'undefined' && window.location.protocol === 'file:')
  ? 'http://127.0.0.1:8000'
  : '';

const CyberTraceConfig = {
  // API Endpoints (served by FastAPI backend)
  API_BASE: apiOrigin,
  ENDPOINTS: {
    HEALTH: `${apiOrigin}/api/health`,
    NETWORK_INFO: `${apiOrigin}/api/network-info`,
    SCAN_SUMMARY: `${apiOrigin}/api/scan-summary`,
    THREAT_SCENARIOS: `${apiOrigin}/api/threat-intel/scenarios`
  },

  // Mandatory Status Classifications
  STATUS: {
    OBSERVED: {
      label: 'OBSERVED',
      className: 'badge-observed',
      desc: 'Observed directly through standard browser APIs or TCP/IP connection metadata.'
    },
    PERMISSION_REQUIRED: {
      label: 'PERMISSION REQUIRED',
      className: 'badge-permission',
      desc: 'Requires explicit user authorization through an operating-system or browser prompt.'
    },
    SIMULATED: {
      label: 'SIMULATED',
      className: 'badge-simulated',
      desc: 'Fictional demo scenario illustrating how attackers correlate public leaks with observed metadata.'
    },
    INACCESSIBLE: {
      label: 'NOT ACCESSIBLE TO THIS WEBSITE',
      className: 'badge-inaccessible',
      desc: 'Strictly blocked by modern browser sandboxing, operating system boundaries, and permission models.'
    }
  },

  // Educational Explanations for Every Exposure Field
  EDUCATIONAL_EXPLAINERS: {
    'user-agent': {
      title: 'Browser User-Agent & Platform Signature',
      status: 'OBSERVED',
      webStandard: 'RFC 9110 HTTP/1.1 & Navigator.userAgent API',
      whyExposed: 'Originally designed in 1993 so web servers could deliver HTML/CSS styled specifically for Mosaic vs Netscape, or mobile vs desktop browsers.',
      attackerMisuse: 'Attackers inspect the exact browser version and OS build to serve targeted browser exploits (e.g., zero-day WebKit or V8 vulnerabilities) tailored to unpatched devices.',
      howToProtect: 'Modern browsers are transitioning to User-Agent Client Hints (Sec-CH-UA) to freeze and simplify User-Agents. In Firefox, enabling privacy.resistFingerprinting spoofs a generic baseline.'
    },
    'webgl-gpu': {
      title: 'WebGL Unmasked Graphics Adapter (GPU)',
      status: 'OBSERVED',
      webStandard: 'Khronos Group WebGL WEBGL_debug_renderer_info Extension',
      whyExposed: 'Created so interactive 3D web apps, games, and CAD tools could detect whether hardware acceleration is supported and optimize graphic shader pipelines.',
      attackerMisuse: 'Your GPU model and graphics driver combination is extremely distinctive (high entropy). Tracking networks use it as a stateless device fingerprint that survives clearing cookies, cache, and history.',
      howToProtect: 'Use privacy-focused browsers like Brave or Tor Browser, or install extensions like CanvasBlocker that return generic virtual GPUs like "Mesa OffScreen".'
    },
    'cpu-cores': {
      title: 'Hardware Concurrency (CPU Cores)',
      status: 'OBSERVED',
      webStandard: 'W3C HTML5 Navigator.hardwareConcurrency Specification',
      whyExposed: 'Allows web applications (like video conferencing or video editors) to spawn the optimal number of Web Workers without overloading the CPU.',
      attackerMisuse: 'Combined with GPU and RAM, CPU core counts (e.g., 6, 8, 12, 16) reduce the pool of matching devices in a regional subnet to a minuscule fraction.',
      howToProtect: 'Hardened browsers clamp hardwareConcurrency to 2 or 4 to prevent fine-grained hardware profiling.'
    },
    'device-memory': {
      title: 'Device Memory (RAM Capacity)',
      status: 'OBSERVED',
      webStandard: 'W3C Device Memory 1.0 Specification',
      whyExposed: 'Helps websites serve lightweight low-memory assets on budget devices (e.g. 2GB phones) and rich assets on 16GB+ workstations.',
      attackerMisuse: 'Acts as another entropy multiplier for persistent cross-site device identification.',
      howToProtect: 'Browsers quantify values to broad buckets (0.25, 0.5, 1, 2, 4, 8) to reduce entropy, though combined with other fields it still narrows identification.'
    },
    'display-geometry': {
      title: 'Screen & Viewport Geometry',
      status: 'OBSERVED',
      webStandard: 'CSSOM View Module (Screen.width, Screen.height, devicePixelRatio)',
      whyExposed: 'Indispensable for responsive web design, ensuring images and layouts scale correctly across smartphones, tablets, 4K monitors, and laptops.',
      attackerMisuse: 'Unusual resolutions (e.g., dual monitor spanned desktops, high-DPI scaling) create highly distinctive fingerprints across different websites.',
      howToProtect: 'Tor Browser and Mullvad Browser use "Letterboxing" — inserting gray borders around web pages to keep the apparent viewport at fixed standard increments.'
    },
    'timezone-clock': {
      title: 'System Timezone & Clock Offset',
      status: 'OBSERVED',
      webStandard: 'ECMAScript Internationalization API (Intl.DateTimeFormat)',
      whyExposed: 'Ensures web applications display meeting times, calendar bookings, and flight schedules in the visitor’s local civil time.',
      attackerMisuse: 'Allows trackers to immediately verify the physical geographic slice of the globe the user resides in, even when using basic proxies.',
      howToProtect: 'Privacy configurations can spoof the browser timezone to UTC (Coordinated Universal Time).'
    },
    'network-ip': {
      title: 'Public IP Address & Autonomous System (ASN)',
      status: 'OBSERVED',
      webStandard: 'IETF RFC 791 (IPv4) / RFC 8200 (IPv6) TCP/IP Protocol',
      whyExposed: 'The fundamental addressing mechanism of the internet: without your public IP, the web server cannot route responses back to your device.',
      attackerMisuse: 'Determines your Internet Service Provider, corporate or university affiliation, and metropolitan hub. Threat actors target IP ranges for DDoS or port scanning.',
      howToProtect: 'Route traffic through an encrypted VPN tunnel, Onion routing (Tor), or Apple iCloud Private Relay to replace your origin IP with a data center egress node.'
    },
    'precise-gps': {
      title: 'High-Precision Geolocation (GPS / Wi-Fi Triangulation)',
      status: 'PERMISSION_REQUIRED',
      webStandard: 'W3C Geolocation API Specification (navigator.geolocation)',
      whyExposed: 'Powers navigation, ride-sharing, food delivery, and local weather apps that need exact physical positions.',
      attackerMisuse: 'Malicious sites exploit habitual "Allow" clicks to geolocate physical homes, offices, and real-time movement with sub-10 meter precision.',
      howToProtect: 'Never grant location permission to ordinary content websites. In browser settings, set Location permissions to "Always Block" or "Ask Every Time".'
    },
    'sim-identifiers': {
      title: 'SIM Card Identifiers (ICCID & IMSI)',
      status: 'INACCESSIBLE',
      webStandard: 'Protected by OS Sandboxing & Cellular Modem Hardware Separation',
      whyExposed: 'NEVER EXPOSED TO WEBSITES. Only native mobile operating system telephony daemons with root/carrier privileges can read SIM card serials.',
      attackerMisuse: 'Because websites CANNOT read this, attackers execute SIM-swap fraud or social engineer mobile carriers using leaked names, addresses, and fake IDs.',
      howToProtect: 'Set a SIM PIN code on your phone so the SIM cannot be moved to another phone, and place a verbal passcode / port-out freeze with your mobile carrier.'
    },
    'phone-number': {
      title: 'Visitor Private Mobile Phone Number',
      status: 'INACCESSIBLE',
      webStandard: 'Protected by Browser Sandbox & Privacy Isolation',
      whyExposed: 'NEVER EXPOSED TO WEBSITES. No standard web browser API provides access to the SIM card phone number.',
      attackerMisuse: 'Attackers create fake sweepstakes or SMS verification traps to trick users into voluntarily typing their phone number into a form.',
      howToProtect: 'Be cautious where you enter your primary phone number. Use VoIP aliases (e.g. Google Voice, MySudo) for non-essential web registrations.'
    },
    'saved-passwords': {
      title: 'Browser Password Manager Vaults',
      status: 'INACCESSIBLE',
      webStandard: 'Encrypted OS Keychain / DPAPI / Master Key Protection',
      whyExposed: 'NEVER EXPOSED TO WEBSITES. Passwords stored in Chrome, Edge, or Firefox vaults are encrypted on disk and only injected into verified matching domain forms.',
      attackerMisuse: 'Adversaries deploy "InfoStealer" malware (e.g., RedLine, LummaC2) via malicious downloads or cracked software to extract credentials from disk.',
      howToProtect: 'Never run unverified executables. Use independent open-source password managers (e.g. Bitwarden) with biometric unlock and master passphrases.'
    },
    'sms-otp': {
      title: 'Mobile Banking & SMS OTP Verification Codes',
      status: 'INACCESSIBLE',
      webStandard: 'Protected by Cellular SMS Sandboxing & WebOTP API Strict Origin Binding',
      whyExposed: 'NEVER EXPOSED TO WEBSITES without user approval. The modern WebOTP API requires the SMS to explicitly name the exact domain in the text message.',
      attackerMisuse: 'Adversaries operate reverse-proxy phishing kits (e.g., Evilginx) that prompt the victim to manually type the 6-digit code into a fake login screen.',
      howToProtect: 'Never disclose OTP codes over the phone or on unverified URLs. Transition from SMS 2FA to hardware FIDO2 security keys (YubiKey).'
    }
  }
};

window.CyberTraceConfig = CyberTraceConfig;
