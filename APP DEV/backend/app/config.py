"""
CyberTrace: Digital Exposure Lab - Backend Configuration
Educational cybersecurity lab settings and privacy guarantees.
"""
from typing import List
import os

class Settings:
    APP_NAME: str = "CyberTrace: Digital Exposure Lab"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Server host and port
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Strict Privacy Guarantees
    # Under no circumstances are visitor IPs or coordinates written to disk or database
    STRICT_PRIVACY_MODE: bool = True
    ENABLE_DATABASE_PERSISTENCE: bool = False
    LOG_CLIENT_IPS: bool = False
    
    # Trusted Proxies (only trust X-Forwarded-For from these addresses)
    TRUSTED_PROXIES: List[str] = [
        "127.0.0.1",
        "::1"
    ]
    
    # Rate Limiting: max requests per minute per client IP hash
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # IP Geolocation service configuration
    # Uses free public endpoint with timeout and offline graceful fallback
    GEO_SERVICE_URL: str = os.getenv("GEO_SERVICE_URL", "http://ip-api.com/json")
    GEO_SERVICE_TIMEOUT: float = float(os.getenv("GEO_SERVICE_TIMEOUT", "2.5"))
    
    # Educational Simulation Metadata
    SIMULATION_DISCLAIMER: str = (
        "CyberTrace is an educational cybersecurity simulation created for "
        "academic and awareness purposes. No sensitive data is collected, "
        "stored, or shared. All personal identity credentials shown are fictional simulations."
    )

settings = Settings()
