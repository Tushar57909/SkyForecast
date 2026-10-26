from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints

app = FastAPI(
    title="SkyForecast API",
    description="Hybrid AI-NWP Multi-Model Forecast Blending System for SIH 2026",
    version="1.0.0"
)

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api/v1")

from sqlalchemy.orm import Session
from fastapi import Depends
import redis
import os
from sqlalchemy import text
from app.core.database import get_db

@app.get("/api/v1/health")
def health_check(db: Session = Depends(get_db)):
    """Comprehensive system health check endpoint"""
    health_status = {
        "status": "healthy",
        "services": {
            "api": "healthy",
            "database": "unknown",
            "redis": "unknown"
        }
    }
    
    # Check Database
    try:
        db.execute(text("SELECT 1"))
        health_status["services"]["database"] = "healthy"
    except Exception:
        health_status["status"] = "unhealthy"
        health_status["services"]["database"] = "unhealthy"
        
    # Check Redis
    try:
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        r = redis.from_url(redis_url)
        if r.ping():
            health_status["services"]["redis"] = "healthy"
    except Exception:
        health_status["status"] = "unhealthy"
        health_status["services"]["redis"] = "unhealthy"
        
    return health_status
