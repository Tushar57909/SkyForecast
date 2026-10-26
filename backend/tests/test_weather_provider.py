import pytest
from datetime import datetime
from app.services.weather.providers.openmeteo import OpenMeteoProvider
from app.services.weather.models import NormalizedForecastRecord
import httpx

class MockResponse:
    def __init__(self, json_data, status_code=200):
        self._json_data = json_data
        self.status_code = status_code

    def json(self):
        return self._json_data
        
    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError("Error", request=None, response=self)

@pytest.mark.asyncio
async def test_openmeteo_fetch_current_forecast(monkeypatch):
    provider = OpenMeteoProvider()
    
    # Mock data structure resembling Open-Meteo response
    mock_data = {
        "latitude": 21.0,
        "longitude": 79.0,
        "generationtime_ms": 1.23,
        "utc_offset_seconds": 0,
        "timezone": "UTC",
        "timezone_abbreviation": "UTC",
        "elevation": 300.0,
        "hourly_units": {
            "time": "unixtime",
            "precipitation": "mm",
            "temperature_2m": "celsius"
        },
        "hourly": {
            "time": [1695859200, 1695862800], # Example timestamps
            "precipitation": [0.0, 1.5],
            "temperature_2m": [25.0, 26.5]
        }
    }

    async def mock_get(*args, **kwargs):
        return MockResponse(mock_data)

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    records = await provider.fetch_current_forecast(
        model_code="ECMWF",
        latitudes=[21.0],
        longitudes=[79.0],
        variables=["prcp", "temp"],
        forecast_days=1
    )

    assert len(records) == 4 # 2 variables * 2 timestamps
    
    prcp_records = [r for r in records if r.variable_code == "prcp"]
    temp_records = [r for r in records if r.variable_code == "temp"]
    
    assert len(prcp_records) == 2
    assert prcp_records[1].value == 1.5
    assert prcp_records[1].lead_hours == 1 # Second timestamp is 1 hr after first
    assert prcp_records[1].unit == "mm"
    
    assert temp_records[0].value == 25.0
    assert temp_records[0].unit == "celsius"
    
    # Init time should match first timestamp
    assert prcp_records[0].initialization_time == datetime.utcfromtimestamp(1695859200)

@pytest.mark.asyncio
async def test_openmeteo_invalid_model():
    provider = OpenMeteoProvider()
    with pytest.raises(ValueError, match="not supported"):
        await provider.fetch_current_forecast(
            model_code="UNKNOWN",
            latitudes=[21.0],
            longitudes=[79.0],
            variables=["prcp"]
        )
