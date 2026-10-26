import httpx
from typing import Dict, Any

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"

def fetch_forecast_sync(lat: float, lon: float, model: str) -> Dict[str, Any]:
    """
    Fetch forecast data from Open-Meteo for a specific coordinate and model synchronously (for Celery workers).
    Supported models: ecmwf_ifs04, gfs_seamless, icon_seamless
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["temperature_2m", "precipitation", "wind_speed_10m"],
        "models": model,
        "timezone": "auto"
    }
    
    with httpx.Client() as client:
        response = client.get(OPEN_METEO_BASE_URL, params=params)
        response.raise_for_status()
        return response.json()
