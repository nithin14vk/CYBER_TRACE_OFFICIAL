"""
CyberTrace: Digital Exposure Lab - Main Application
FastAPI server with strict privacy protections, zero-log policies, and static assets.
"""
import time
import hashlib
from collections import defaultdict
from pathlib import Path

from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.app.config import settings
from backend.app.routes import health, network, scan, threat

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Educational Cybersecurity Awareness Lab simulating digital footprint exposure.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# In-memory transient rate limiter: hashes client IP into a bucket
# Stored solely in volatile memory; never written to disk or database.
RATE_LIMIT_BUCKETS = defaultdict(list)


@app.middleware("http")
async def security_and_privacy_middleware(request: Request, call_next):
    """
    Enforces rate-limiting, privacy zero-logging, and browser security headers.
    """
    # 1. Rate Limiting via ephemeral IP Hash
    client_ip = request.client.host if request.client else "127.0.0.1"
    # Create a non-reversible salt-hash of the IP to avoid storing raw IPs even in memory
    ip_hash = hashlib.sha256(f"{client_ip}-cybertrace-salt".encode()).hexdigest()[:16]
    now = time.time()

    # Prune timestamps older than 60 seconds
    timestamps = [t for t in RATE_LIMIT_BUCKETS[ip_hash] if now - t < 60]
    if len(timestamps) >= settings.RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "Rate limit exceeded",
                "message": "Too many requests. Please wait a minute before running another scan.",
                "educational_note": "Rate limiting protects web services from denial of service and automated scraping."
            }
        )
    timestamps.append(now)
    RATE_LIMIT_BUCKETS[ip_hash] = timestamps

    # 2. Process Request
    response: Response = await call_next(request)

    # 3. Add Defensive Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Privacy-Policy"] = "Strict-Zero-Persistence"

    return response


# Add CORS Middleware for local lab flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router)
app.include_router(network.router)
app.include_router(scan.router)
app.include_router(threat.router)

# Resolve path to frontend assets
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"

if FRONTEND_DIR.exists():
    # Mount frontend static directory for /static prefix
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    # Mount direct asset directories for relative root requests
    if (FRONTEND_DIR / "css").exists():
        app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    if (FRONTEND_DIR / "js").exists():
        app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")
    if (FRONTEND_DIR / "vendor").exists():
        app.mount("/vendor", StaticFiles(directory=str(FRONTEND_DIR / "vendor")), name="vendor")

    @app.get("/")
    async def serve_index():
        """Serves the main single page application."""
        index_file = FRONTEND_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "Frontend index.html not found"}
