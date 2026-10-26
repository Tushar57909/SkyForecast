from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from app.services.weather.models import NormalizedForecastRecord, NormalizedReferenceRecord

class WeatherProvider(ABC):
    @abstractmethod
    async def fetch_current_forecast(
        self,
        model_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        forecast_days: int = 5
    ) -> List[NormalizedForecastRecord]:
        """Fetch current forecast from the provider."""
        pass

    @abstractmethod
    async def fetch_historical_forecast(
        self,
        model_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        start_date: str,
        end_date: str
    ) -> List[NormalizedForecastRecord]:
        """Fetch archived forecasts from the provider."""
        pass

    @abstractmethod
    async def fetch_reference_data(
        self,
        dataset_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        start_date: str,
        end_date: str
    ) -> List[NormalizedReferenceRecord]:
        """Fetch reference/reanalysis data (e.g., ERA5) from the provider."""
        pass
