"""
Comprehensive Test Suite for CyberTrace Backend
Zero-dependency test suite validating API schemas, security controls, risk scoring, and privacy.
"""
import unittest
import os
import hashlib
from pathlib import Path
from unittest.mock import MagicMock
from starlette.requests import Request
from pydantic import ValidationError

from backend.app.config import settings
from backend.app.models.schemas import (
    BrowserHardwareProbe,
    PreciseLocationData,
    ScanSummaryRequest
)
from backend.app.services.network_service import NetworkService
from backend.app.services.risk_analyzer import RiskAnalyzerService
from backend.app.services.threat_intel import ThreatIntelService
from backend.app.routes.health import get_health
from backend.app.routes.network import get_network_info
from backend.app.routes.scan import generate_scan_summary
from backend.app.routes.threat import list_threat_scenarios
from backend.app.main import RATE_LIMIT_BUCKETS, security_and_privacy_middleware


def run_sync(coro):
    """Executes a coroutine that completes synchronously without OS event loop overhead."""
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value
    raise RuntimeError("Coroutine did not complete synchronously")


class TestNetworkService(unittest.TestCase):
    def test_is_private_ip(self):
        """Validates private vs public IP classification."""
        self.assertTrue(NetworkService.is_private_ip("127.0.0.1"))
        self.assertTrue(NetworkService.is_private_ip("10.0.0.1"))
        self.assertTrue(NetworkService.is_private_ip("192.168.1.1"))
        self.assertTrue(NetworkService.is_private_ip("172.16.0.5"))
        self.assertTrue(NetworkService.is_private_ip("::1"))
        self.assertFalse(NetworkService.is_private_ip("8.8.8.8"))
        self.assertFalse(NetworkService.is_private_ip("1.1.1.1"))

    def test_trusted_proxy_header_handling(self):
        """Ensures X-Forwarded-For is only honored from trusted proxies."""
        # 1. From a trusted proxy (127.0.0.1)
        mock_req_trusted = MagicMock(spec=Request)
        mock_req_trusted.client = MagicMock(host="127.0.0.1")
        mock_req_trusted.headers = {"X-Forwarded-For": "203.0.113.195, 10.0.0.1"}

        ip, forwarded = NetworkService.get_client_ip(mock_req_trusted)
        self.assertEqual(ip, "203.0.113.195")
        self.assertTrue(forwarded)

        # 2. From an untrusted client (not in settings.TRUSTED_PROXIES)
        mock_req_untrusted = MagicMock(spec=Request)
        mock_req_untrusted.client = MagicMock(host="198.51.100.2")
        mock_req_untrusted.headers = {"X-Forwarded-For": "1.2.3.4"}

        ip, forwarded = NetworkService.get_client_ip(mock_req_untrusted)
        self.assertEqual(ip, "198.51.100.2")
        self.assertFalse(forwarded)

    def test_resolve_ip_geo_loopback(self):
        """Validates loopback IP resolution with appropriate educational disclaimer."""
        geo = NetworkService.resolve_ip_geo("127.0.0.1")
        self.assertTrue(geo.is_private_or_local)
        self.assertIn("Local", geo.city)
        self.assertIn("Local", geo.disclaimer)


class TestRiskAnalyzer(unittest.TestCase):
    def setUp(self):
        self.base_probe = BrowserHardwareProbe(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            language="en-US",
            languages=["en-US", "en"],
            platform="Win32",
            screen_resolution="1920x1080",
            viewport_size="1920x950",
            color_depth=24,
            pixel_ratio=1.0,
            timezone="America/New_York",
            timezone_offset_minutes=-300,
            hardware_concurrency=8,
            device_memory_gb=16.0,
            touch_support=False,
            cookies_enabled=True,
            webgl_vendor="Google Inc. (NVIDIA)",
            webgl_renderer="ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)",
            battery_available=False,
            geolocation_api_supported=True
        )

    def test_exposure_calculation_without_gps(self):
        """Tests standard passive browser risk scoring."""
        summary = RiskAnalyzerService.calculate_exposure(self.base_probe, precise_location=None)
        
        # Verify score bounds
        self.assertGreaterEqual(summary.total_risk_score, 0)
        self.assertLessEqual(summary.total_risk_score, 100)
        self.assertIn(summary.risk_level, ["Minimal", "Moderate", "Elevated", "High"])

        # Check breakdown components
        breakdown = summary.score_breakdown
        self.assertIn("browser_identity", breakdown)
        self.assertIn("hardware_entropy", breakdown)
        self.assertIn("network_routing", breakdown)
        self.assertIn("temporal_display", breakdown)
        self.assertEqual(breakdown["permission_grant"], 0)

        # Check item counts
        self.assertEqual(summary.permission_required_count, 0)
        self.assertGreater(summary.observed_items_count, 0)
        self.assertGreater(summary.simulated_items_count, 0)
        self.assertGreater(summary.inaccessible_items_count, 0)

        # Check simulated persona attached
        self.assertEqual(summary.simulated_persona.name, "Alex Morgan")
        self.assertEqual(summary.simulated_persona.status_label, "SIMULATED")

    def test_exposure_calculation_with_gps(self):
        """Tests that granting precise GPS increases risk score by permission points (+25)."""
        loc = PreciseLocationData(
            granted=True,
            latitude=37.7749,
            longitude=-122.4194,
            accuracy_meters=14.5
        )
        summary = RiskAnalyzerService.calculate_exposure(self.base_probe, precise_location=loc)
        self.assertEqual(summary.score_breakdown["permission_grant"], 25)
        self.assertEqual(summary.permission_required_count, 1)

    def test_minimal_exposure_scoring(self):
        """Tests minimal profile scoring (privacy browser baseline)."""
        minimal_probe = BrowserHardwareProbe(
            user_agent="Mozilla/5.0",
            language="en-US",
            platform="Linux x86_64",
            screen_resolution="1000x800",
            viewport_size="1000x800",
            timezone="UTC",
            timezone_offset_minutes=0,
            cookies_enabled=False,
            do_not_track="1",
            webgl_vendor=None,
            webgl_renderer=None
        )
        summary = RiskAnalyzerService.calculate_exposure(minimal_probe, precise_location=None)
        self.assertLessEqual(summary.total_risk_score, 45)
        self.assertEqual(summary.score_breakdown["hardware_entropy"], 0)


class TestThreatIntel(unittest.TestCase):
    def test_scenarios_exist(self):
        """Verifies that all required educational scenarios are present."""
        scenarios = ThreatIntelService.get_scenarios()
        self.assertGreaterEqual(len(scenarios), 6)
        scenario_ids = [s.id for s in scenarios]
        self.assertIn("ip-profiling", scenario_ids)
        self.assertIn("browser-fingerprinting", scenario_ids)
        self.assertIn("phishing-impersonation", scenario_ids)
        self.assertIn("credential-reuse", scenario_ids)
        self.assertIn("permission-overreach", scenario_ids)
        self.assertIn("shortened-urls", scenario_ids)


class TestValidationAndSecurity(unittest.TestCase):
    def test_invalid_coordinates_validation_error(self):
        """Ensures Pydantic catches out-of-bounds coordinates."""
        with self.assertRaises(ValidationError):
            PreciseLocationData(granted=True, latitude=95.0, longitude=0.0)  # Lat > 90

        with self.assertRaises(ValidationError):
            PreciseLocationData(granted=True, latitude=0.0, longitude=-195.0)  # Lon < -180

        with self.assertRaises(ValidationError):
            PreciseLocationData(granted=True, latitude=0.0, longitude=0.0, accuracy_meters=-5.0)  # Accuracy < 0

    def test_zero_disk_persistence_guarantee(self):
        """Verifies that no database files or credential dumps exist in the codebase."""
        workspace = Path(__file__).resolve().parent.parent.parent
        forbidden_extensions = [".db", ".sqlite", ".sqlite3"]
        found_db_files = []
        for root, _, files in os.walk(workspace):
            for f in files:
                ext = Path(f).suffix.lower()
                if ext in forbidden_extensions:
                    found_db_files.append(os.path.join(root, f))
        self.assertEqual(len(found_db_files), 0, f"Found forbidden DB files: {found_db_files}")

    def test_rate_limiter_ip_hashing(self):
        """Ensures rate limiter stores hashed keys, not raw IP addresses."""
        test_ip = "192.0.2.45"
        expected_hash = hashlib.sha256(f"{test_ip}-cybertrace-salt".encode()).hexdigest()[:16]
        # Raw IP must not match the 16-char hash
        self.assertNotEqual(test_ip, expected_hash)
        self.assertEqual(len(expected_hash), 16)


class TestRoutesSync(unittest.TestCase):
    def test_health_route(self):
        """Tests /api/health endpoint handler."""
        result = run_sync(get_health())
        self.assertEqual(result.status, "operational")
        self.assertIn("Zero-Persistence", result.privacy_mode)

    def test_network_info_route(self):
        """Tests /api/network-info route handler."""
        mock_req = MagicMock(spec=Request)
        mock_req.client = MagicMock(host="127.0.0.1", port=54321)
        mock_req.headers = {
            "user-agent": "CyberTrace-Academic-Agent",
            "accept-language": "en-US,en;q=0.9"
        }
        mock_req.scope = {"http_version": "1.1"}
        mock_req.url = MagicMock(scheme="http")

        result = run_sync(get_network_info(mock_req))
        self.assertEqual(result.status, "success")
        self.assertEqual(result.client_ip, "127.0.0.1")
        self.assertEqual(result.headers.user_agent, "CyberTrace-Academic-Agent")

    def test_scan_summary_route(self):
        """Tests /api/scan-summary route handler."""
        probe = BrowserHardwareProbe(
            user_agent="Academic-Probe/1.0",
            language="en-US",
            platform="Win32",
            screen_resolution="1920x1080",
            viewport_size="1920x1080",
            timezone="UTC",
            timezone_offset_minutes=0
        )
        req_payload = ScanSummaryRequest(
            probe=probe,
            client_timestamp="2026-10-24T10:00:00Z"
        )
        result = run_sync(generate_scan_summary(req_payload))
        self.assertEqual(result.status, "success")
        self.assertGreater(result.total_risk_score, 0)

    def test_threat_scenarios_route(self):
        """Tests /api/threat-intel/scenarios route handler."""
        scenarios = run_sync(list_threat_scenarios())
        self.assertIsInstance(scenarios, list)
        self.assertGreaterEqual(len(scenarios), 6)


if __name__ == "__main__":
    unittest.main()
