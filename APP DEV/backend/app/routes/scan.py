"""
Scan Summary and Educational Risk Assessment Route
Processes client-side probe results and returns comprehensive risk telemetry.
"""
from fastapi import APIRouter
from backend.app.models.schemas import ScanSummaryRequest, ScanSummaryResponse
from backend.app.services.risk_analyzer import RiskAnalyzerService

router = APIRouter(tags=["Scan"])


@router.post("/api/scan-summary", response_model=ScanSummaryResponse)
async def generate_scan_summary(payload: ScanSummaryRequest):
    """
    Analyzes observed browser capabilities, evaluates exposure surface,
    and returns an educational threat assessment.
    """
    return RiskAnalyzerService.calculate_exposure(
        probe=payload.probe,
        precise_location=payload.precise_location
    )
