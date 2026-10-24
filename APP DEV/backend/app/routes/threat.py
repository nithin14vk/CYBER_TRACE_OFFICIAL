"""
Threat Intelligence Scenarios Route
Supplies educational attack chains, pivot tactics, and defense strategies.
"""
from typing import List
from fastapi import APIRouter
from backend.app.models.schemas import ThreatScenario
from backend.app.services.threat_intel import ThreatIntelService

router = APIRouter(tags=["Threat Intelligence"])


@router.get("/api/threat-intel/scenarios", response_model=List[ThreatScenario])
async def list_threat_scenarios():
    """
    Returns the repository of structured educational cybersecurity scenarios
    for student learning and discussion.
    """
    return ThreatIntelService.get_scenarios()
