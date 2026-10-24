"""
Digital Footprint and Risk Score Analysis Service
Evaluates passive exposure, hardware uniqueness (entropy), and provides educational risk scoring.
"""
from typing import Dict, Any, List
from backend.app.models.schemas import (
    BrowserHardwareProbe,
    PreciseLocationData,
    ScanSummaryResponse,
    RiskFactor,
    SimulatedPersona
)
from backend.app.services.threat_intel import ThreatIntelService


class RiskAnalyzerService:
    @staticmethod
    def calculate_exposure(
        probe: BrowserHardwareProbe,
        precise_location: PreciseLocationData = None
    ) -> ScanSummaryResponse:
        """
        Calculates an educational exposure index (0-100) based on observed browser properties.
        Transparently explains how every point is allocated.
        """
        score_breakdown = {
            "browser_identity": 0,
            "hardware_entropy": 0,
            "network_routing": 0,
            "temporal_display": 0,
            "permission_grant": 0
        }

        risk_factors: List[RiskFactor] = []

        # 1. Browser & Platform Identity (Max: 15 pts)
        browser_pts = 5  # Base web protocol overhead
        if "Windows" in probe.platform or "Mac" in probe.platform or "Linux" in probe.platform:
            browser_pts += 5
        if probe.cookies_enabled:
            browser_pts += 3
        if probe.do_not_track is None or probe.do_not_track == "unspecified":
            browser_pts += 2
        score_breakdown["browser_identity"] = min(browser_pts, 15)

        risk_factors.append(RiskFactor(
            category="Browser Signature",
            title="User-Agent & Platform Disclosure",
            impact="Low",
            score_points=score_breakdown["browser_identity"],
            technical_detail=f"Browser platform reported as '{probe.platform}' with language '{probe.language}'. Cookies enabled: {probe.cookies_enabled}.",
            attacker_pivot="Allows attackers to craft platform-specific exploits (e.g., targeting known Windows DLLs or Safari WebKit vulnerabilities).",
            defense_mitigation="Use browsers with Client Hints reduction or User-Agent spoofing to blend with common desktop baselines."
        ))

        # 2. Hardware Uniqueness & WebGL Fingerprinting (Max: 25 pts)
        hardware_pts = 0
        has_webgl = bool(probe.webgl_renderer and probe.webgl_vendor)
        if has_webgl:
            hardware_pts += 12
            risk_factors.append(RiskFactor(
                category="Hardware Telemetry",
                title="Unmasked WebGL Graphics Adapter (GPU) Extraction",
                impact="High",
                score_points=12,
                technical_detail=f"Direct GPU model revealed: '{probe.webgl_renderer}' by '{probe.webgl_vendor}'.",
                attacker_pivot="GPUs are extremely high entropy. Knowing the exact graphics card and driver build allows long-term user tracking even across private/incognito tabs.",
                defense_mitigation="Install privacy tools (e.g., CanvasBlocker, Firefox privacy.resistFingerprinting) that mask WebGL vendor strings with generic virtual values."
            ))

        if probe.hardware_concurrency:
            hardware_pts += 6
        if probe.device_memory_gb:
            hardware_pts += 4
        if probe.touch_support:
            hardware_pts += 3
        score_breakdown["hardware_entropy"] = min(hardware_pts, 25)

        # 3. Temporal & Display Geometry (Max: 15 pts)
        display_pts = 0
        if probe.screen_resolution:
            display_pts += 6
        if probe.pixel_ratio and probe.pixel_ratio != 1.0:
            display_pts += 3
        if probe.timezone:
            display_pts += 6
        score_breakdown["temporal_display"] = min(display_pts, 15)

        risk_factors.append(RiskFactor(
            category="Temporal & Display",
            title="Screen Geometry & Local Timezone Correlation",
            impact="Medium",
            score_points=score_breakdown["temporal_display"],
            technical_detail=f"Display: {probe.screen_resolution} @ {probe.pixel_ratio}x pixel ratio. Timezone: {probe.timezone} ({probe.timezone_offset_minutes}m offset).",
            attacker_pivot="Correlating screen geometry with timezone narrows down geographic location to a specific slice of the globe without requesting GPS.",
            defense_mitigation="Use standard window sizes or letterboxing features in privacy browsers like Tor or Mullvad Browser."
        ))

        # 4. Network & Routing Exposure (Standard baseline: 20 pts)
        network_pts = 20
        score_breakdown["network_routing"] = network_pts
        risk_factors.append(RiskFactor(
            category="Network Routing",
            title="Public WAN IP & ISP Routing Telemetry",
            impact="Medium",
            score_points=20,
            technical_detail="TCP/IP socket automatically communicates client public IP, port, and Autonomous System routing nodes.",
            attacker_pivot="Enables network-level geo-lookup, ISP brand identification, and DDoS targeting.",
            defense_mitigation="Use a trustworthy no-log VPN, Cloudflare WARP, or Tor circuit to decouple physical IP from web activity."
        ))

        # 5. Permission Vulnerability (GPS Location) (Max: 25 pts)
        permission_pts = 0
        if precise_location and precise_location.granted:
            permission_pts = 25
            acc_str = f"{precise_location.accuracy_meters:.1f} meters" if precise_location.accuracy_meters else "N/A"
            risk_factors.append(RiskFactor(
                category="Active Permissions",
                title="High-Precision Physical GPS Permission Granted",
                impact="Critical",
                score_points=25,
                technical_detail=f"Precise physical coordinates provided via Geolocation API with accuracy within {acc_str}.",
                attacker_pivot="Permits stalking, real-time physical tracking, residential address determination, and pattern-of-life surveillance.",
                defense_mitigation="Never grant location permission to non-mapping websites. Keep browser location permission default setting on 'Always Block'."
            ))
        else:
            permission_pts = 0
            risk_factors.append(RiskFactor(
                category="Active Permissions",
                title="Precise GPS Location Kept Sandboxed",
                impact="Low",
                score_points=0,
                technical_detail="Browser Geolocation permission was not granted. Only approximate IP-level geolocation is visible to the website.",
                attacker_pivot="Attacker cannot determine your exact building, house, or street location.",
                defense_mitigation="Continue enforcing strict browser permission policies."
            ))
        score_breakdown["permission_grant"] = permission_pts

        total_risk_score = sum(score_breakdown.values())
        total_risk_score = min(max(total_risk_score, 0), 100)

        # Risk tier classification
        if total_risk_score <= 35:
            risk_level = "Minimal"
        elif total_risk_score <= 60:
            risk_level = "Moderate"
        elif total_risk_score <= 80:
            risk_level = "Elevated"
        else:
            risk_level = "High"

        # Item categorization counts
        observed_items = 9  # User-Agent, Language, Platform, Screen, Viewport, WebGL, Cores, RAM, Timezone
        permission_required_items = 1 if (precise_location and precise_location.granted) else 0
        simulated_items = 4  # Demo Persona, Simulated Leaked Password Hash, Simulated Breached Record, Simulated Dark Web Dump
        inaccessible_items = 5  # SIM ICCID, SIM IMSI, Private Mobile Number, Local OS Files, Browser Vault Passwords

        calculation_explanation = (
            f"Total Score ({total_risk_score}/100) is calculated from 5 objective vectors: "
            f"Browser Signature ({score_breakdown['browser_identity']}/15), "
            f"Hardware Entropy ({score_breakdown['hardware_entropy']}/25), "
            f"Network Telemetry ({score_breakdown['network_routing']}/20), "
            f"Temporal/Display ({score_breakdown['temporal_display']}/15), and "
            f"Permission Elevation ({score_breakdown['permission_grant']}/25). "
            "NOTE: This is an educational informational exposure score, NOT an indicator of malware infection or security breach."
        )

        entropy_analysis = {
            "estimated_bits_of_entropy": 14.8 if has_webgl else 9.2,
            "uniqueness_ratio": "1 in ~28,000 devices" if has_webgl else "1 in ~580 devices",
            "stateless_tracking_feasibility": "High" if has_webgl else "Moderate",
            "primary_entropy_driver": "WebGL Unmasked Renderer & Hardware Concurrency" if has_webgl else "Screen Resolution & Timezone"
        }

        actionable_mitigations = [
            "Verify URLs carefully before entering any credentials or personal info.",
            "Never grant high-privilege browser permissions (Location, Camera, Microphone) to unverified websites.",
            "Use a reputable password manager with randomized 16+ character passwords to nullify credential stuffing.",
            "Enable FIDO2 hardware keys (YubiKey) or app-based MFA on all academic and personal accounts.",
            "Review browser privacy settings to resist fingerprinting and clear third-party storage on exit.",
            "Use an encrypted VPN tunnel or Tor when connected to public Wi-Fi networks."
        ]

        return ScanSummaryResponse(
            status="success",
            total_risk_score=total_risk_score,
            risk_level=risk_level,
            score_breakdown=score_breakdown,
            score_calculation_explanation=calculation_explanation,
            entropy_analysis=entropy_analysis,
            observed_items_count=observed_items,
            permission_required_count=permission_required_items,
            simulated_items_count=simulated_items,
            inaccessible_items_count=inaccessible_items,
            risk_factors=risk_factors,
            simulated_persona=ThreatIntelService.get_simulated_persona(),
            actionable_mitigations=actionable_mitigations,
            disclaimer=ThreatIntelService.get_simulated_persona().educational_lesson
        )
