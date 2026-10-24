"""
Health and Status Routes
Provides health checks and reports the strict privacy mode status.
"""
from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.config import settings
from backend.app.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/api/health", response_model=HealthResponse)
async def get_health():
    """Returns the operational status and active privacy guarantees of the service."""
    return HealthResponse(
        status="operational",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        privacy_mode="Strict In-Memory Zero-Persistence (No DB / No Disk Logs)",
        persistence_active=settings.ENABLE_DATABASE_PERSISTENCE,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
