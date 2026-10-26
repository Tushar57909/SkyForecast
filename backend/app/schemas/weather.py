from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ForecastResponseBase(BaseModel):
    forecast_time: datetime
    lead_hours: int
    latitude: float
    longitude: float
    temperature: Optional[float]
    rainfall: Optional[float]
    wind_speed: Optional[float]
    
    class Config:
        from_attributes = True

class BlendedForecastResponse(BaseModel):
    forecast_time: datetime
    latitude: float
    longitude: float
    temperature: Optional[float]
    rainfall: Optional[float]
    
    # Weights visualization
    ecmwf_weight: float
    gfs_weight: float
    icon_weight: float
    
    confidence: float
