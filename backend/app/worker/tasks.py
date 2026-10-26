from app.worker.celery_app import celery_app
from app.services.open_meteo import fetch_forecast_sync
from app.core.database import SessionLocal
from app.models.weather import ForecastRun, WeatherModel
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Base coordinate for India (Initial Prototype Focus)
INDIA_LAT = 20.5937
INDIA_LON = 78.9629

@celery_app.task
def fetch_all_forecasts():
    """Scheduled task to pull forecasts from all 3 primary models."""
    models_to_fetch = ["ecmwf_ifs04", "gfs_seamless", "icon_seamless"]
    
    for model_name in models_to_fetch:
        # Trigger an asynchronous job for each model
        fetch_and_store_forecast.delay(INDIA_LAT, INDIA_LON, model_name)
        
    return f"Triggered background fetches for {len(models_to_fetch)} models."

@celery_app.task
def fetch_and_store_forecast(lat: float, lon: float, open_meteo_model_name: str):
    """Worker task to fetch specific model data and save to DB."""
    logger.info(f"Fetching {open_meteo_model_name} for ({lat}, {lon})")
    
    try:
        data = fetch_forecast_sync(lat, lon, open_meteo_model_name)
        
        times = data.get("hourly", {}).get("time", [])
        temps = data.get("hourly", {}).get("temperature_2m", [])
        precips = data.get("hourly", {}).get("precipitation", [])
        winds = data.get("hourly", {}).get("wind_speed_10m", [])
        
        db = SessionLocal()
        
        # Ensure model exists in the DB (map ecmwf_ifs04 -> ECMWF)
        internal_name = open_meteo_model_name.split("_")[0].upper()
        model_record = db.query(WeatherModel).filter(WeatherModel.name == internal_name).first()
        
        if not model_record:
            model_record = WeatherModel(name=internal_name, provider="Open-Meteo", active=True)
            db.add(model_record)
            db.commit()
            db.refresh(model_record)
            
        initialization_time = datetime.utcnow()
        
        # Extract forecast data
        for i in range(min(24, len(times))): # Storing 24 hours of forecast for the prototype step
            forecast_dt = datetime.fromisoformat(times[i])
            lead_time = i 
            
            run = ForecastRun(
                model_id=model_record.id,
                initialization_time=initialization_time,
                forecast_time=forecast_dt,
                lead_hours=lead_time,
                latitude=lat,
                longitude=lon,
                temperature=temps[i],
                rainfall=precips[i],
                wind_speed=winds[i]
            )
            db.add(run)
            
        db.commit()
        db.close()
        
        logger.info(f"Successfully saved {open_meteo_model_name} forecast to DB.")
        return True
        
    except Exception as e:
        logger.error(f"Failed to fetch or save {open_meteo_model_name}: {str(e)}")
        return False
