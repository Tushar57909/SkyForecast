from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Weather Model Schemas
class WeatherModelBase(BaseModel):
    name: str
    code: str
    provider: str
    description: Optional[str] = None
    resolution: Optional[float] = None
    active: bool = True

class WeatherModelResponse(WeatherModelBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Region Schemas
class RegionBase(BaseModel):
    name: str
    code: Optional[str] = None
    type: Optional[str] = None
    country_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RegionResponse(RegionBase):
    id: int
    parent_region_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Forecast Schemas
class ForecastValueBase(BaseModel):
    forecast_time: datetime
    lead_hours: int
    value: float

class ForecastResponse(ForecastValueBase):
    id: int
    forecast_run_id: int
    grid_point_id: int
    variable_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Evaluation Schemas
class ModelEvaluationBase(BaseModel):
    method_name: Optional[str] = None
    lead_hours: int
    evaluation_start: datetime
    evaluation_end: datetime
    mae: Optional[float] = None
    rmse: Optional[float] = None
    correlation: Optional[float] = None
    skill_score: Optional[float] = None
    sample_count: Optional[int] = None

class ModelEvaluationResponse(ModelEvaluationBase):
    id: int
    model_id: Optional[int] = None
    variable_id: int
    region_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    alert_type: str
    severity: str
    forecast_time: datetime
    threshold: Optional[float] = None
    predicted_value: Optional[float] = None
    confidence: Optional[float] = None
    source: Optional[str] = None
    status: str = "active"

class AlertResponse(AlertBase):
    id: int
    grid_point_id: Optional[int] = None
    region_id: Optional[int] = None
    variable_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
