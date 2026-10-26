from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class QCFlag(str, Enum):
    VALID = "VALID"
    MISSING = "MISSING"
    INVALID = "INVALID"
    OUT_OF_RANGE = "OUT_OF_RANGE"
    TIME_MISMATCH = "TIME_MISMATCH"
    SPATIAL_MISMATCH = "SPATIAL_MISMATCH"
    UNIT_ERROR = "UNIT_ERROR"

class PrecipitationSemantics(str, Enum):
    HOURLY_ACCUMULATION = "HOURLY_ACCUMULATION"
    DAILY_ACCUMULATION = "DAILY_ACCUMULATION"

class AlignedForecastRecord(BaseModel):
    # Time keys
    forecast_time: datetime
    initialization_time: Optional[datetime] = None
    lead_hours: Optional[int] = None

    # Spatial keys
    grid_point_id: str  # e.g., india_21.00_79.00
    latitude: float
    longitude: float

    # Variables
    variable_code: str
    unit: str

    # Values from different models
    ecmwf_value: Optional[float] = None
    gfs_value: Optional[float] = None
    icon_value: Optional[float] = None
    
    # Reference value for the same forecast_time
    reference_value: Optional[float] = None

    # QC and Metadata
    quality_flags: List[QCFlag] = Field(default_factory=list)
    regridding_method: Optional[str] = None
    precipitation_semantics: Optional[PrecipitationSemantics] = None
