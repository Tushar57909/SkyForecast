from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, CheckConstraint, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class ModelWeight(Base):
    __tablename__ = "model_weights"

    id = Column(Integer, primary_key=True, index=True)
    forecast_time = Column(DateTime(timezone=True), nullable=False)
    grid_point_id = Column(Integer, ForeignKey("grid_points.id"), nullable=False)
    lead_hours = Column(Integer, nullable=False)
    model_id = Column(Integer, ForeignKey("weather_models.id"), nullable=False)
    weight = Column(Float, nullable=False)
    weight_method = Column(String) # dynamic_ai, fixed, average
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    grid_point = relationship("GridPoint")
    model = relationship("WeatherModel")
    model_version = relationship("ModelVersion")

    __table_args__ = (
        CheckConstraint('weight >= 0 AND weight <= 1', name='check_valid_weight'),
        UniqueConstraint('forecast_time', 'grid_point_id', 'lead_hours', 'model_id', 'model_version_id', name='uq_model_weight'),
    )

class BlendedForecast(Base):
    __tablename__ = "blended_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    forecast_time = Column(DateTime(timezone=True), nullable=False)
    grid_point_id = Column(Integer, ForeignKey("grid_points.id"), nullable=False)
    variable_id = Column(Integer, ForeignKey("weather_variables.id"), nullable=False)
    lead_hours = Column(Integer, nullable=False)
    blended_value = Column(Float, nullable=False)
    confidence = Column(Float)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    grid_point = relationship("GridPoint")
    weather_variable = relationship("WeatherVariable")
    model_version = relationship("ModelVersion")

    __table_args__ = (
        Index('ix_blended_forecasts_query', 'grid_point_id', 'variable_id', 'forecast_time'),
    )

class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("weather_models.id"), nullable=True) # Null if it's AI blend or baseline
    method_name = Column(String) # For non-NWP methods (e.g. "AI Blend", "Simple Average")
    variable_id = Column(Integer, ForeignKey("weather_variables.id"), nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    lead_hours = Column(Integer, nullable=False)
    evaluation_start = Column(DateTime(timezone=True), nullable=False)
    evaluation_end = Column(DateTime(timezone=True), nullable=False)
    mae = Column(Float)
    rmse = Column(Float)
    correlation = Column(Float)
    skill_score = Column(Float)
    sample_count = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, index=True, nullable=False) # heavy_rainfall, heatwave_risk
    severity = Column(String, nullable=False) # High, Medium, Low
    grid_point_id = Column(Integer, ForeignKey("grid_points.id"), nullable=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    variable_id = Column(Integer, ForeignKey("weather_variables.id"), nullable=True)
    forecast_time = Column(DateTime(timezone=True), nullable=False)
    threshold = Column(Float)
    predicted_value = Column(Float)
    confidence = Column(Float)
    source = Column(String) # e.g. AI-Blend
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
