import httpx
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.services.weather.providers.base import WeatherProvider
from app.services.weather.models import NormalizedForecastRecord, NormalizedReferenceRecord
from app.services.weather.normalizer import get_provider_variable, get_canonical_variable, normalize_unit
from app.core.config import settings

class OpenMeteoProvider(WeatherProvider):
    def __init__(self):
        self.base_url = settings.OPEN_METEO_BASE_URL
        self.historical_url = settings.OPEN_METEO_HISTORICAL_BASE_URL
        self.timeout = settings.OPEN_METEO_TIMEOUT_SECONDS
        self.retries = settings.WEATHER_REQUEST_RETRIES
        self.backoff = settings.WEATHER_REQUEST_BACKOFF_SECONDS
        self.provider_name = "openmeteo"

        # Model mapping for open-meteo
        self.model_map = {
            "ECMWF": "ecmwf_ifs025",
            "GFS": "gfs_seamless",
            "ICON": "icon_seamless"
        }

    async def _fetch_with_retries(self, url: str, params: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for attempt in range(self.retries):
                try:
                    response = await client.get(url, params=params)
                    response.raise_for_status()
                    return response.json()
                except (httpx.RequestError, httpx.HTTPStatusError) as e:
                    if attempt == self.retries - 1:
                        raise e
                    await asyncio.sleep(self.backoff * (2 ** attempt))
        return {}

    async def fetch_current_forecast(
        self,
        model_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        forecast_days: int = 5
    ) -> List[NormalizedForecastRecord]:
        
        om_model = self.model_map.get(model_code)
        if not om_model:
            raise ValueError(f"Model {model_code} not supported by Open-Meteo provider.")

        om_vars = [get_provider_variable(self.provider_name, v) for v in variables]
        
        params = {
            "latitude": latitudes,
            "longitude": longitudes,
            "hourly": om_vars,
            "models": om_model,
            "wind_speed_unit": "ms", # canonical
            "precipitation_unit": "mm", # canonical
            "temperature_unit": "celsius", # canonical
            "forecast_days": forecast_days,
            "timeformat": "unixtime",
            "timezone": "UTC"
        }

        data = await self._fetch_with_retries(self.base_url + "/forecast", params)
        return self._parse_forecast_response(data, model_code, is_historical=False)

    async def fetch_historical_forecast(
        self,
        model_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        start_date: str,
        end_date: str
    ) -> List[NormalizedForecastRecord]:
        
        om_model = self.model_map.get(model_code)
        if not om_model:
            raise ValueError(f"Model {model_code} not supported by Open-Meteo provider.")

        om_vars = [get_provider_variable(self.provider_name, v) for v in variables]
        
        params = {
            "latitude": latitudes,
            "longitude": longitudes,
            "hourly": om_vars,
            "models": om_model,
            "wind_speed_unit": "ms",
            "precipitation_unit": "mm",
            "temperature_unit": "celsius",
            "start_date": start_date,
            "end_date": end_date,
            "timeformat": "unixtime",
            "timezone": "UTC"
        }

        data = await self._fetch_with_retries(self.historical_url + "/forecast", params)
        return self._parse_forecast_response(data, model_code, is_historical=True)

    async def fetch_reference_data(
        self,
        dataset_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        start_date: str,
        end_date: str
    ) -> List[NormalizedReferenceRecord]:
        
        if dataset_code != "ERA5":
            raise ValueError(f"Reference dataset {dataset_code} not supported.")

        om_vars = [get_provider_variable(self.provider_name, v) for v in variables]
        
        params = {
            "latitude": latitudes,
            "longitude": longitudes,
            "hourly": om_vars,
            "wind_speed_unit": "ms",
            "precipitation_unit": "mm",
            "temperature_unit": "celsius",
            "start_date": start_date,
            "end_date": end_date,
            "timeformat": "unixtime",
            "timezone": "UTC"
        }

        data = await self._fetch_with_retries(self.historical_url + "/archive", params)
        return self._parse_reference_response(data, dataset_code)

    def _parse_forecast_response(self, data: Dict[str, Any], model_code: str, is_historical: bool) -> List[NormalizedForecastRecord]:
        records = []
        
        # Open-Meteo returns an array of results if multiple coordinates requested
        if isinstance(data, dict) and "latitude" in data:
            results = [data]
        elif isinstance(data, list):
            results = data
        else:
            return records

        for res in results:
            lat = res.get("latitude")
            lon = res.get("longitude")
            hourly = res.get("hourly", {})
            times = hourly.get("time", [])
            
            # For current forecasts, OpenMeteo gives us the generation time, but for historical it might differ.
            # In a true NWP system we want the strict initialization time.
            # Open-meteo provides `generationtime_ms` for current models but it is a processing timestamp.
            # We will use the first hour of the forecast as a proxy for init_time if not explicitly provided as previous runs.
            if not times:
                continue

            init_time = datetime.utcfromtimestamp(times[0])
            run_identifier = f"{model_code}_{init_time.strftime('%Y%m%d_%H')}"

            for key, values_list in hourly.items():
                if key == "time":
                    continue
                
                canonical_var = get_canonical_variable(self.provider_name, key)
                unit = res.get("hourly_units", {}).get(key, "")

                for i, val in enumerate(values_list):
                    if val is None:
                        continue
                    
                    forecast_time = datetime.utcfromtimestamp(times[i])
                    lead_hours = int((forecast_time - init_time).total_seconds() / 3600)
                    
                    if lead_hours < 0:
                        continue # Valid time cannot be before init time for forecasts
                        
                    norm_val = normalize_unit(canonical_var, val, unit)

                    records.append(NormalizedForecastRecord(
                        model_code=model_code,
                        provider=self.provider_name,
                        initialization_time=init_time,
                        forecast_time=forecast_time,
                        lead_hours=lead_hours,
                        latitude=lat,
                        longitude=lon,
                        variable_code=canonical_var,
                        value=norm_val,
                        unit=unit,
                        source="openmeteo_historical" if is_historical else "openmeteo_current",
                        run_identifier=run_identifier
                    ))

        return records

    def _parse_reference_response(self, data: Dict[str, Any], dataset_code: str) -> List[NormalizedReferenceRecord]:
        records = []
        if isinstance(data, dict) and "latitude" in data:
            results = [data]
        elif isinstance(data, list):
            results = data
        else:
            return records

        for res in results:
            lat = res.get("latitude")
            lon = res.get("longitude")
            hourly = res.get("hourly", {})
            times = hourly.get("time", [])

            for key, values_list in hourly.items():
                if key == "time":
                    continue
                
                canonical_var = get_canonical_variable(self.provider_name, key)
                unit = res.get("hourly_units", {}).get(key, "")

                for i, val in enumerate(values_list):
                    if val is None:
                        continue
                    
                    obs_time = datetime.utcfromtimestamp(times[i])
                    norm_val = normalize_unit(canonical_var, val, unit)

                    records.append(NormalizedReferenceRecord(
                        dataset_code=dataset_code,
                        provider=self.provider_name,
                        observation_time=obs_time,
                        latitude=lat,
                        longitude=lon,
                        variable_code=canonical_var,
                        value=norm_val,
                        unit=unit
                    ))
        return records
