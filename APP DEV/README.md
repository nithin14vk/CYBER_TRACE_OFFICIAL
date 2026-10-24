# CyberTrace: Digital Exposure Lab

**CyberTrace** is an interactive, curriculum-grade cybersecurity awareness laboratory and digital exposure simulation designed for college students, security analysts, and ethical penetration testing classes.

It reveals in real time how much information modern web browsers passively communicate to websites, how threat actors correlate benign telemetry into stateless fingerprints, and how phishing campaigns exploit voluntary user disclosure.

---

## Academic & Privacy Guarantees

CyberTrace is an **educational simulation**, NOT a credential harvester, malware platform, or covert surveillance tool.

* **Strict Zero-Persistence**: No visitor IP addresses, GPS coordinates, or browser telemetry are stored in any database or written to disk logs.
* **No Covert Exploits**: Operates entirely within standard W3C browser APIs and respects browser sandboxing.
* **Simulated Identity Context**: Sensitive data elements (SIM serial numbers, private phone numbers, password hashes) use fictional demo profiles (**Alex Morgan**) to illustrate dark-web breach correlation without endangering user privacy.
* **Mandatory Field Labels**: Every item displayed is explicitly tagged:
  * `[OBSERVED]`: Genuinely transmitted by your browser or network socket.
  * `[PERMISSION REQUIRED]`: Requires explicit browser permission dialog.
  * `[SIMULATED]`: Educational demo data from fictional records.
  * `[NOT ACCESSIBLE TO THIS WEBSITE]`: Blocked by browser and OS sandboxing.

---

## Directory Architecture

```
d:\APP DEV\
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py             # Settings, rate limits, privacy constants
│   │   ├── main.py               # FastAPI app, security middleware, static asset mounting
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py        # Pydantic schemas with strict validation
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py         # GET /api/health
│   │   │   ├── network.py        # GET /api/network-info
│   │   │   ├── scan.py           # POST /api/scan-summary
│   │   │   └── threat.py         # GET /api/threat-intel/scenarios
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── network_service.py # Safe IP extraction, headers inspection, GeoIP
│   │       ├── risk_analyzer.py   # Educational scoring & entropy engine
│   │       └── threat_intel.py    # Threat scenarios, attack surfaces & demo persona
│   └── tests/
│       ├── __init__.py
│       └── test_cybertrace.py    # Zero-dependency test suite
├── frontend/
│   ├── index.html                # Single-page interactive lab interface
│   ├── css/
│   │   ├── variables.css         # Dark cybersecurity palette, neon accents & tokens
│   │   ├── base.css              # Typography, layout, scanlines & cyber grid
│   │   ├── components.css        # Buttons, cards, status tags, badges, modals
│   │   └── scan.css              # Radar animation, Leaflet map, gauge & reveal layout
│   └── js/
│       ├── config.js             # Endpoints, status mappings & educational knowledge base
│       ├── core/
│       │   ├── browser-probe.js  # W3C browser API telemetry extractor
│       │   ├── api-client.js     # Robust FastAPI client with offline fallback
│       │   └── risk-calculator.js # Client-side risk & entropy helpers
│       └── ui/
│           ├── dashboard.js      # Card renderer with status tags & explainers
│           ├── gauge-widget.js   # Canvas-based animated cybernetic threat gauge
│           ├── map-viewer.js     # Leaflet OpenStreetMap (Approx IP vs Precise GPS)
│           ├── modal-viewer.js   # Interactive educational deep-dive popup
│           └── reveal-section.js # Truthful awareness reveal & safety checklist
├── .env.example                  # Environment configuration template
├── requirements.txt              # Python package dependencies
├── run.py                        # Single-command launcher for Windows & VS Code
├── test_runner.py                # Automated test runner script
└── README.md                     # Comprehensive project documentation
```

---

## Installation & Setup Instructions

### Prerequisites
* **Python 3.11+** installed and added to your system `PATH`.
* Any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Brave, or Safari).

### Quick Start (Windows / PowerShell)

1. **Clone or Navigate to the Project Root**:
   ```powershell
   cd "d:\APP DEV"
   ```

2. **(Optional) Create and Activate a Virtual Environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Launch CyberTrace**:
   ```powershell
   python run.py
   ```
   *The launcher starts the Uvicorn ASGI server and automatically opens `http://127.0.0.1:8000` in your default browser.*

---

## Running in Visual Studio Code

1. Open the project folder in VS Code:
   ```powershell
   code "d:\APP DEV"
   ```
2. Press <kbd>Ctrl</kbd> + <kbd>`</kbd> to open the integrated terminal.
3. Select the Python interpreter:
   * Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
   * Type `Python: Select Interpreter`
   * Choose your Python 3.11+ environment
4. To run with live reload for development:
   ```powershell
   uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```
5. Navigate to [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## API Documentation

When the application is running, interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

### 1. Health Status
* **Endpoint**: `GET /api/health`
* **Purpose**: Reports backend operational status and confirms active zero-persistence privacy mode.
* **Response**:
  ```json
  {
    "status": "operational",
    "service": "CyberTrace: Digital Exposure Lab",
    "version": "1.0.0",
    "privacy_mode": "Strict In-Memory Zero-Persistence (No DB / No Disk Logs)",
    "persistence_active": false,
    "timestamp": "2026-10-24T10:45:00Z"
  }
  ```

### 2. Network & Header Telemetry
* **Endpoint**: `GET /api/network-info`
* **Purpose**: Inspects client TCP socket and HTTP headers without storing raw IP strings.
* **Key Fields**:
  * `client_ip`: WAN or private gateway IP.
  * `is_proxy_forwarded`: Boolean indicating if `X-Forwarded-For` was validated against trusted proxies.
  * `geo`: Approximate region, ISP, and Autonomous System (ASN).
  * `headers`: User-Agent, Accept-Language, Sec-CH-UA hints.

### 3. Scan Summary & Threat Assessment
* **Endpoint**: `POST /api/scan-summary`
* **Payload**:
  ```json
  {
    "probe": {
      "user_agent": "Mozilla/5.0 ...",
      "language": "en-US",
      "screen_resolution": "1920x1080",
      "viewport_size": "1920x950",
      "timezone": "America/New_York",
      "timezone_offset_minutes": -300,
      "hardware_concurrency": 8,
      "device_memory_gb": 16.0,
      "webgl_renderer": "ANGLE (NVIDIA GeForce RTX 3070)",
      "webgl_vendor": "Google Inc. (NVIDIA)"
    },
    "precise_location": {
      "granted": false
    },
    "client_timestamp": "2026-10-24T10:45:00Z"
  }
  ```
* **Response**: Returns overall score (0–100), risk tier, itemized points breakdown, entropy analysis, risk factors, and fictional breach scenario.

### 4. Threat Scenarios
* **Endpoint**: `GET /api/threat-intel/scenarios`
* **Purpose**: Returns the curriculum library of 6 core attack vectors and mitigations.

---

## Automated Test Suite

CyberTrace includes a zero-dependency test suite utilizing Python's built-in `unittest` runner.

### Running Tests
Execute:
```powershell
python test_runner.py
```
Or directly with the standard library:
```powershell
python -m unittest -v backend.tests.test_cybertrace
```

### Test Coverage
* `test_is_private_ip`: RFC 1918 and loopback IP subnet detection.
* `test_trusted_proxy_header_handling`: Verifies untrusted `X-Forwarded-For` spoofing attempts are blocked.
* `test_resolve_ip_geo_loopback`: Validates local IP disclaimers and offline fallback.
* `test_exposure_calculation_without_gps`: Validates passive score bounds and entropy estimation.
* `test_exposure_calculation_with_gps`: Confirms permission elevation score delta (+25 pts).
* `test_health_route`, `test_network_info_route`, `test_scan_summary_route`, `test_threat_scenarios_route`: Validates route handlers and schemas.

---

## How the Scan Works (Technical Deep-Dive)

1. **Passive Browser Probing**:
   * Standard W3C APIs (`screen`, `navigator`, `Intl`) extract display resolution, device pixel ratio, color depth, and timezone.
   * `WEBGL_debug_renderer_info` queries the client's GPU driver and model. Because graphics adapters vary widely, GPU strings contribute substantial identifying entropy (~14.8 bits).
   * CPU logical cores (`navigator.hardwareConcurrency`) and RAM capacity (`navigator.deviceMemory`) are evaluated.

2. **Network Telemetry**:
   * The backend receives the client's TCP socket and extracts public IP and routing headers.
   * Queries public BGP tables to identify the Autonomous System Number (ASN) and carrier.
   * Explains that IP geolocation reflects routing facilities (10–50 km radius), not residential addresses.

3. **Active Permission Elevation (GPS Demo)**:
   * The application NEVER requests GPS automatically on load.
   * When the user clicks the demonstration button, `navigator.geolocation.getCurrentPosition` invokes the native OS permission prompt.
   * If granted, the map renders an exact amber pin (&plusmn;15 m) against the broad cyan ISP circle, highlighting the stark difference between passive routing metadata and active permission grants.
   * If denied, the browser sandboxing boundary is affirmed.

4. **Simulated Breach Correlation**:
   * Explains how attackers use public leak databases (data brokers, combo lists) to link anonymous browser fingerprints with real-world identities.

---

## College Cybersecurity Classroom Demonstration Checklist

Use this structured lesson plan to present CyberTrace to students:

* [ ] **Step 1: Introduction (5 min)**
  * Introduce the concept of stateless browser fingerprinting vs stateful cookie tracking.
  * Show the CyberTrace home page, review the educational scope, and explain zero-persistence privacy.
* [ ] **Step 2: Trigger the Live Scan (3 min)**
  * Click **START EXPOSURE SCAN**.
  * Observe the radar sweep and real-time telemetry ticker as client-side and server-side attributes are collected.
* [ ] **Step 3: Analyze the Exposure Matrix (10 min)**
  * Review the **Exposure Score** and **Entropy Ratio** (~1 in 28,000 devices).
  * Click `[EXPLAIN]` on the **WebGL GPU Renderer** card: explain how 3D games need GPU access, but ad networks use it as a persistent identifier.
  * Point out the **Status Badges**: emphasize that ordinary websites CANNOT see SIM card serials, passwords, or phone numbers.
* [ ] **Step 4: Demonstrate Location Permission (7 min)**
  * Point out the Cyan ISP circle on the Leaflet map (explain BGP routing hubs).
  * Click **DEMONSTRATE PRECISE LOCATION PERMISSION**.
  * First demonstrate denying permission: show how the browser sandbox protects exact physical coordinates.
  * Then demonstrate granting permission: watch the amber pin plot exact GPS coordinates (&plusmn;15 m) and observe the score increase by +25 points.
* [ ] **Step 5: Threat Scenarios & Pivot Chains (10 min)**
  * Walk through the **Alex Morgan** simulated persona.
  * Explain how spear-phishers use IP geolocation to customize regional lures and bypass traditional email filters.
* [ ] **Step 6: Awareness Reveal & Defensive Hardening (10 min)**
  * Review the **"YOUR DIGITAL FOOTPRINT IS MORE VISIBLE THAN YOU THINK"** reveal table.
  * Discuss defense strategies: FIDO2 WebAuthn keys, password managers, letterboxing, and browser fingerprinting resistance flags.
  * Click **RESTART EDUCATIONAL DEMONSTRATION** to wrap up.
