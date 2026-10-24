"""
Pydantic Schemas for CyberTrace API
Enforces input validation and structured responses for educational endpoints.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "operational"
    service: str
    version: str
    privacy_mode: str
    persistence_active: bool = False
    timestamp: str


class GeoInfo(BaseModel):
    ip: str
    ip_version: str
    is_private_or_local: bool
    city: Optional[str] = "Unknown / Local"
    region: Optional[str] = "Local Subnet"
    country: Optional[str] = "Local Network"
    country_code: Optional[str] = "LOC"
    postal_code: Optional[str] = "N/A"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    isp: Optional[str] = "Local Host / Loopback"
    asn: Optional[str] = "AS0 Private"
    source: str
    disclaimer: str


class ObservedHeaders(BaseModel):
    user_agent: Optional[str] = None
    accept_language: Optional[str] = None
    sec_ch_ua: Optional[str] = None
    sec_ch_ua_platform: Optional[str] = None
    sec_ch_ua_mobile: Optional[str] = None
    dnt: Optional[str] = None
    sec_gpc: Optional[str] = None
    upgrade_insecure_requests: Optional[str] = None


class NetworkInfoResponse(BaseModel):
    status: str = "success"
    client_ip: str
    is_proxy_forwarded: bool
    geo: GeoInfo
    headers: ObservedHeaders
    tls_http_hints: Dict[str, Any]
    educational_note: str


class BrowserHardwareProbe(BaseModel):
    user_agent: str = Field(..., max_length=1000)
    language: str = Field(..., max_length=50)
    languages: List[str] = Field(default_factory=list)
    platform: str = Field(..., max_length=100)
    screen_resolution: str = Field(..., max_length=50)
    viewport_size: str = Field(..., max_length=50)
    color_depth: int = Field(default=24, ge=1, le=64)
    pixel_ratio: float = Field(default=1.0, ge=0.1, le=10.0)
    timezone: str = Field(..., max_length=100)
    timezone_offset_minutes: int
    hardware_concurrency: Optional[int] = Field(default=None, ge=1, le=256)
    device_memory_gb: Optional[float] = Field(default=None, ge=0.1, le=1024.0)
    touch_support: bool = False
    cookies_enabled: bool = True
    do_not_track: Optional[str] = None
    global_privacy_control: Optional[bool] = None
    webgl_vendor: Optional[str] = Field(default=None, max_length=200)
    webgl_renderer: Optional[str] = Field(default=None, max_length=300)
    battery_available: bool = False
    battery_level_pct: Optional[int] = None
    battery_charging: Optional[bool] = None
    connection_type: Optional[str] = None
    connection_downlink_mbps: Optional[float] = None
    connection_rtt_ms: Optional[int] = None
    geolocation_api_supported: bool = True


class PreciseLocationData(BaseModel):
    granted: bool
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    accuracy_meters: Optional[float] = Field(default=None, ge=0.0)
    altitude: Optional[float] = None
    heading: Optional[float] = None
    speed: Optional[float] = None


class ScanSummaryRequest(BaseModel):
    probe: BrowserHardwareProbe
    precise_location: Optional[PreciseLocationData] = None
    client_timestamp: str = Field(..., max_length=100)


class RiskFactor(BaseModel):
    category: str
    title: str
    impact: str  # Low, Medium, High, Critical
    score_points: int
    technical_detail: str
    attacker_pivot: str
    defense_mitigation: str


class SimulatedPersona(BaseModel):
    name: str = "Alex Morgan"
    role: str = "Simulated Corporate Employee"
    status_label: str = "SIMULATED"
    simulated_email: str = "alex.morgan.demo@example-corp.internal"
    simulated_phone: str = "+1 (555) 019-2834"
    simulated_iccid: str = "89014103211118510720 (SIM Card Serial)"
    simulated_imsi: str = "310410123456789 (Subscriber Identity)"
    simulated_hashed_pwd: str = "$2b$12$e8r...[Simulated Leaked Hash]"
    educational_lesson: str


class ThreatScenario(BaseModel):
    id: str
    title: str
    category: str
    threat_level: str
    summary: str
    how_it_works: List[str]
    real_world_impact: str
    defensive_action: str


class ScanSummaryResponse(BaseModel):
    status: str = "success"
    total_risk_score: int
    risk_level: str  # Minimal, Moderate, Elevated, High
    score_breakdown: Dict[str, int]
    score_calculation_explanation: str
    entropy_analysis: Dict[str, Any]
    observed_items_count: int
    permission_required_count: int
    simulated_items_count: int
    inaccessible_items_count: int
    risk_factors: List[RiskFactor]
    simulated_persona: SimulatedPersona
    actionable_mitigations: List[str]
    disclaimer: str
