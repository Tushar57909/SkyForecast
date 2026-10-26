from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class NormalizedForecastRecord(BaseModel):
    model_code: str
    provider: str
    initialization_time: datetime
    forecast_time: datetime
    lead_hours: int
    latitude: float
    longitude: float
    variable_code: str
    value: Optional[float]
    unit: str
    source: str
    run_identifier: str
    metadata: Optional[Dict[str, Any]] = None

class NormalizedReferenceRecord(BaseModel):
    dataset_code: str
    provider: str
    observation_time: datetime
    latitude: float
    longitude: float
    variable_code: str
    value: Optional[float]
    unit: str

class IngestionResult(BaseModel):
    provider: str
    model: str
    requested_period: str
    records_received: int = 0
    records_normalized: int = 0
    records_inserted: int = 0
    records_skipped: int = 0
    duplicates: int = 0
    missing_values: int = 0
    validation_errors: int = 0
    duration_seconds: float = 0.0
    status: str = "success"
    errors: List[str] = Field(default_factory=list)
