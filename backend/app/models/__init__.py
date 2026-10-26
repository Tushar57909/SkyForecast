# This file imports all models to make them available for Base.metadata.create_all() or Alembic.
from .base import Base
from .metadata import WeatherModel, WeatherVariable, ReferenceDataset, ModelVersion
from .geographic import Region, GridPoint
from .forecast import ForecastRun, ForecastValue, ReferenceValue
from .ai_blending import ModelWeight, BlendedForecast, ModelEvaluation, Alert

__all__ = [
    "Base",
    "WeatherModel",
    "WeatherVariable",
    "ReferenceDataset",
    "ModelVersion",
    "Region",
    "GridPoint",
    "ForecastRun",
    "ForecastValue",
    "ReferenceValue",
    "ModelWeight",
    "BlendedForecast",
    "ModelEvaluation",
    "Alert"
]
