"""
Educational Threat Intelligence and Scenario Simulation Service
Provides curriculum-grade cybersecurity explanations, attack vectors, and simulated personas.
"""
from typing import List
from backend.app.models.schemas import ThreatScenario, SimulatedPersona


class ThreatIntelService:
    @staticmethod
    def get_simulated_persona() -> SimulatedPersona:
        """
        Returns a fictional simulated demo persona to illustrate how attackers combine
        observed browser data with data broker breaches.
        """
        return SimulatedPersona(
            name="Alex Morgan",
            role="Simulated Cybersecurity Analyst (Demo Persona)",
            status_label="SIMULATED",
            simulated_email="alex.morgan.demo@example-corp.internal",
            simulated_phone="+1 (555) 019-2834",
            simulated_iccid="89014103211118510720 (SIM Card Serial)",
            simulated_imsi="310410123456789 (Subscriber Identity)",
            simulated_hashed_pwd="$2b$12$e8r9aK...[Simulated Leaked Hash from Dark Web Dump]",
            educational_lesson=(
                "CRITICAL SECURITY PRINCIPLE: Standard websites CANNOT extract your SIM card number, "
                "phone number, local files, or saved passwords directly through the browser sandbox. "
                "However, if an attacker learns your approximate location, company, and email from "
                "a public forum or data broker, they craft targeted spear-phishing lures to trick you "
                "into voluntarily submitting these private credentials."
            )
        )

    @staticmethod
    def get_scenarios() -> List[ThreatScenario]:
        """Returns standard cybersecurity scenarios taught in college awareness curricula."""
        return [
            ThreatScenario(
                id="ip-profiling",
                title="IP-Based Profiling & Geo-Targeted Social Engineering",
                category="Network Layer",
                threat_level="Moderate",
                summary="How network telemetry allows websites to identify your ISP, approximate metro area, and corporate network.",
                how_it_works=[
                    "Every web packet requires a source IP address for TCP/IP routing.",
                    "Web servers query public BGP tables and Autonomous System Numbers (ASN) to determine your internet service provider.",
                    "Attackers use this to identify whether you are browsing from a university campus, a Fortune 500 office, or a residential fiber line.",
                    "Spear-phishing emails are customized with the victim's city, local utility names, or regional bank branding to boost trust."
                ],
                real_world_impact="Targeted phishing emails boasting a 300% higher click-through rate compared to generic spam.",
                defensive_action="Use trusted encrypted VPN tunnels or Tor for sensitive browsing to shield your origin ASN and approximate geographic hub."
            ),
            ThreatScenario(
                id="browser-fingerprinting",
                title="Stateless Device Fingerprinting Without Cookies",
                category="Client-Side Surface",
                threat_level="High",
                summary="Synthesizing subtle hardware and software attributes (WebGL, canvas, audio, screen) into a persistent cross-site tracking identifier.",
                how_it_works=[
                    "Web browsers expose graphics card details (WebGL renderer), audio latency, screen resolution, and CPU core counts to render web media.",
                    "A fingerprinting script queries 30+ non-sensitive browser APIs simultaneously.",
                    "According to the Panopticlick / EFF AmIUnique studies, combining these factors produces an identifier unique to 1 in 286,000 devices.",
                    "Even if cookies, local storage, and history are wiped, the same browser produces identical mathematical hashes on subsequent visits."
                ],
                real_world_impact="Cross-site user tracking across disparate web domains without user awareness or cookie consent banner compliance.",
                defensive_action="Enable browser fingerprinting resistance (e.g., Firefox privacy.resistFingerprinting, Brave Shields, or Safari system font protection)."
            ),
            ThreatScenario(
                id="phishing-impersonation",
                title="Phishing Landing Pages & Voluntary Disclosure Exploitation",
                category="Social Engineering",
                threat_level="Critical",
                summary="How malicious websites leverage benign browser cues to craft convincing login clones and credential harvesting traps.",
                how_it_works=[
                    "Ordinary websites cannot read your credentials directly from your password manager or OS keychain.",
                    "Adversaries build high-fidelity clones of Microsoft 365, Google Workspace, or University single sign-on (SSO) portals.",
                    "The fake page pre-fills the victim's detected language, corporate domain (inferred from ASN/IP), and device layout to reduce suspicion.",
                    "The victim voluntarily types their username, password, and active 2FA code directly into the attacker's server form."
                ],
                real_world_impact="Account takeover, corporate enterprise intrusion, and multi-factor authentication (MFA) bypass via real-time reverse proxies (Evilginx).",
                defensive_action="Mandate FIDO2/WebAuthn hardware security keys (which bind authentication to the verified cryptographic domain name), verify top-level domains, and avoid clicking unverified links."
            ),
            ThreatScenario(
                id="credential-reuse",
                title="Credential Stuffing & Dark Web Data Broker Correlation",
                category="Identity & Authentication",
                threat_level="High",
                summary="Combining browser metadata with third-party breach dumps to systematically compromise secondary accounts.",
                how_it_works=[
                    "Billions of usernames and hashed/plaintext passwords from historic data breaches circulate in public leak databases.",
                    "Automated botnets run credential-stuffing tools against thousands of e-commerce, banking, and university portals simultaneously.",
                    "If a student reuses the same password across multiple services, compromising one minor forum yields access to their primary mailbox."
                ],
                real_world_impact="Automated unauthorized financial transfers, identity theft, and cascading account lockouts.",
                defensive_action="Deploy an open-source or commercial password manager (e.g., Bitwarden, 1Password) to generate 16+ character unique passwords for every service, backed by hardware 2FA."
            ),
            ThreatScenario(
                id="permission-overreach",
                title="Unnecessary Browser Permission Overreach (GPS, WebRTC, Sensors)",
                category="Application Permissions",
                threat_level="High",
                summary="Exploiting passive approval habits to obtain high-precision physical coordinates and internal LAN topology.",
                how_it_works=[
                    "Standard web APIs permit websites to request precise GPS hardware coordinates, microphone, camera, and notification feeds.",
                    "Once granted, modern mobile and desktop browsers retain permission indefinitely until manually revoked in site settings.",
                    "WebRTC ICE candidate exchanges historically leaked local private LAN IP addresses (e.g., 192.168.1.105), exposing enterprise network layouts.",
                    "Attackers employ deceptive UI patterns (e.g., 'Click Allow to prove you are not a robot') to solicit permissions."
                ],
                real_world_impact="Physical stalking, exact apartment-level geotracking, and internal subnet reconnaissance.",
                defensive_action="Default browser permissions to 'Block' or 'Ask Every Time', routinely audit granted permissions in browser privacy settings, and use WebRTC mDNS masking."
            ),
            ThreatScenario(
                id="shortened-urls",
                title="Deceptive Shortened URLs & Transparent Tracking Redirects",
                category="Web Navigation",
                threat_level="Moderate",
                summary="Obscuring malicious destinations and weaponizing URL query parameters to profile individual recipients.",
                how_it_works=[
                    "URL shorteners (e.g., bit.ly, tinyurl) compress long URLs and conceal the true destination domain from email security scanners.",
                    "Marketing and tracking systems append unique UTM parameters (e.g., ?user_id=83742) to links sent in SMS or phishing messages.",
                    "When the victim clicks, the redirect server records the IP, user-agent, timestamp, and query parameter, matching the device to the victim's phone number.",
                    "The victim is then redirected to an exploit kit or malicious malware download."
                ],
                real_world_impact="Bypassing perimeter email gateways, precision spear-phishing tracking, and drive-by malware drops.",
                defensive_action="Inspect shortened URLs with link expansion tools (e.g., checkshorturl) or curl HEAD requests before opening, and enable browser safe-browsing protection."
            )
        ]
