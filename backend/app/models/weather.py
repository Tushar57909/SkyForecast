from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class WeatherModel(Base):
    __tablename__ = "weather_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # ECMWF, GFS, ICON
    provider = Column(String)
    resolution = Column(Float)
    description = Column(String, nullable=True)
    active = Column(Boolean, default=True)

    forecasts = relationship("ForecastRun", back_populates="model")


class ForecastRun(Base):
    __tablename__ = "forecast_runs"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("weather_models.id"))
    initialization_time = Column(DateTime, index=True)
    forecast_time = Column(DateTime, index=True)
    lead_hours = Column(Integer, index=True)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    
    # Variables
    rainfall = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    
    model = relationship("WeatherModel", back_populates="forecasts")


class ReferenceObservation(Base):
    __tablename__ = "reference_observations"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    
    rainfall = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)


class BlendedForecast(Base):
    __tablename__ = "blended_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    forecast_time = Column(DateTime, index=True)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    
    # Dynamic AI weights
    ecmwf_weight = Column(Float, nullable=True)
    gfs_weight = Column(Float, nullable=True)
    icon_weight = Column(Float, nullable=True)
    
    # Blended results
    blended_rainfall = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)


class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    evaluation_period = Column(String)
    lead_time = Column(Integer)
    region = Column(String, index=True)
    
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    correlation = Column(Float, nullable=True)
    skill_score = Column(Float, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, index=True)
    severity = Column(String)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    timestamp = Column(DateTime, index=True)
    
    threshold = Column(Float)
    predicted_value = Column(Float)
    confidence = Column(Float)
