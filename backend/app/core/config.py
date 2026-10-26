import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "skyforecast")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "skyforecast")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "skyforecast")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")

    # Redis / Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Weather API Configuration
    OPEN_METEO_BASE_URL: str = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1")
    OPEN_METEO_HISTORICAL_BASE_URL: str = os.getenv("OPEN_METEO_HISTORICAL_BASE_URL", "https://archive-api.open-meteo.com/v1")
    OPEN_METEO_TIMEOUT_SECONDS: int = int(os.getenv("OPEN_METEO_TIMEOUT_SECONDS", "30"))
    WEATHER_REQUEST_RETRIES: int = int(os.getenv("WEATHER_REQUEST_RETRIES", "3"))
    WEATHER_REQUEST_BACKOFF_SECONDS: int = int(os.getenv("WEATHER_REQUEST_BACKOFF_SECONDS", "2"))

    # Geographic Bounding Box (India approximation)
    WEATHER_DEFAULT_LAT_MIN: float = float(os.getenv("WEATHER_DEFAULT_LAT_MIN", "8.0"))
    WEATHER_DEFAULT_LAT_MAX: float = float(os.getenv("WEATHER_DEFAULT_LAT_MAX", "37.0"))
    WEATHER_DEFAULT_LON_MIN: float = float(os.getenv("WEATHER_DEFAULT_LON_MIN", "68.0"))
    WEATHER_DEFAULT_LON_MAX: float = float(os.getenv("WEATHER_DEFAULT_LON_MAX", "97.0"))
    
    WEATHER_DEFAULT_RESOLUTION: float = float(os.getenv("WEATHER_DEFAULT_RESOLUTION", "0.25"))

    class Config:
        env_file = ".env"

settings = Settings()
