import asyncio
import os
from datetime import datetime, timedelta
from app.worker.celery_app import celery_app
from app.core.database import SessionLocal
from app.services.weather.providers.openmeteo import OpenMeteoProvider
from app.services.weather.ingestion import WeatherIngestionService
from app.core.config import settings

@celery_app.task(name="ingest_current_forecast")
def task_ingest_current_forecast(model_code: str, variables: list, forecast_days: int = 5):
    """Celery task to ingest current forecast for India bounding box."""
    db = SessionLocal()
    try:
        provider = OpenMeteoProvider()
        service = WeatherIngestionService(db, provider)
        
        latitudes = [settings.WEATHER_DEFAULT_LAT_MIN, settings.WEATHER_DEFAULT_LAT_MAX]
        longitudes = [settings.WEATHER_DEFAULT_LON_MIN, settings.WEATHER_DEFAULT_LON_MAX]

        # Use asyncio.run since Celery tasks are sync by default
        result = asyncio.run(
            service.ingest_current_forecast(
                model_code=model_code,
                latitudes=latitudes,
                longitudes=longitudes,
                variables=variables,
                forecast_days=forecast_days
            )
        )
        return result.model_dump()
    finally:
        db.close()

@celery_app.task(name="ingest_historical_forecast")
def task_ingest_historical_forecast(model_code: str, variables: list, start_date: str, end_date: str):
    db = SessionLocal()
    try:
        provider = OpenMeteoProvider()
        service = WeatherIngestionService(db, provider)
        
        latitudes = [settings.WEATHER_DEFAULT_LAT_MIN, settings.WEATHER_DEFAULT_LAT_MAX]
        longitudes = [settings.WEATHER_DEFAULT_LON_MIN, settings.WEATHER_DEFAULT_LON_MAX]

        result = asyncio.run(
            service.ingest_historical_forecast(
                model_code=model_code,
                latitudes=latitudes,
                longitudes=longitudes,
                variables=variables,
                start_date=start_date,
                end_date=end_date
            )
        )
        return result.model_dump()
    finally:
        db.close()

@celery_app.task(name="ingest_reference_data")
def task_ingest_reference_data(dataset_code: str, variables: list, start_date: str, end_date: str):
    db = SessionLocal()
    try:
        provider = OpenMeteoProvider()
        service = WeatherIngestionService(db, provider)
        
        latitudes = [settings.WEATHER_DEFAULT_LAT_MIN, settings.WEATHER_DEFAULT_LAT_MAX]
        longitudes = [settings.WEATHER_DEFAULT_LON_MIN, settings.WEATHER_DEFAULT_LON_MAX]

        result = asyncio.run(
            service.ingest_reference_data(
                dataset_code=dataset_code,
                latitudes=latitudes,
                longitudes=longitudes,
                variables=variables,
                start_date=start_date,
                end_date=end_date
            )
        )
        return result.model_dump()
    finally:
        db.close()
