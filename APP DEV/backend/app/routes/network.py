"""
Network Information Route
Inspects incoming client connection and HTTP headers.
"""
from fastapi import APIRouter, Request
from backend.app.models.schemas import NetworkInfoResponse
from backend.app.services.network_service import NetworkService

router = APIRouter(tags=["Network"])


@router.get("/api/network-info", response_model=NetworkInfoResponse)
async def get_network_info(request: Request):
    """
    Returns the client's public/gateway IP, approximate ISP/routing location,
    and HTTP protocol headers sent by the visitor's browser.
    """
    return NetworkService.analyze_request(request)
