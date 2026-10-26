from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.weather import ForecastRun
from app.schemas.weather import ForecastResponseBase, BlendedForecastResponse
from app.services.blending import get_baseline_1_simple_average, get_baseline_2_historical_weights
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/forecast/raw", response_model=List[ForecastResponseBase])
def get_raw_forecasts(lat: float, lon: float, db: Session = Depends(get_db)):
    """Retrieve raw forecast points from all models for a coordinate."""
    forecasts = db.query(ForecastRun).filter(
        ForecastRun.latitude == lat,
        ForecastRun.longitude == lon
    ).order_by(ForecastRun.forecast_time).all()
    return forecasts

@router.get("/forecast/blended", response_model=BlendedForecastResponse)
def get_blended_forecast(lat: float, lon: float, time: datetime, method: str = "baseline2", db: Session = Depends(get_db)):
    """Retrieve the blended forecast for a specific location and time."""
    # Fetch all available models for this exact target time and coordinate
    forecasts = db.query(ForecastRun).filter(
        ForecastRun.latitude == lat,
        ForecastRun.longitude == lon,
        ForecastRun.forecast_time == time
    ).all()
    
    if not forecasts:
        raise HTTPException(status_code=404, detail="No forecast data found for this time/location")
        
    if method == "baseline1":
        result = get_baseline_1_simple_average(forecasts)
    elif method == "baseline2":
        result = get_baseline_2_historical_weights(forecasts)
    else:
        # Dynamic AI method will be integrated here in Phase 3
        result = get_baseline_2_historical_weights(forecasts)
        
    return {
        "forecast_time": time,
        "latitude": lat,
        "longitude": lon,
        **result
    }
