from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, CheckConstraint, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class ForecastRun(Base):
    __tablename__ = "forecast_runs"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("weather_models.id"), nullable=False)
    initialization_time = Column(DateTime(timezone=True), nullable=False)
    run_identifier = Column(String)
    source = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    model = relationship("WeatherModel")

    __table_args__ = (
        UniqueConstraint('model_id', 'initialization_time', 'run_identifier', name='uq_forecast_run'),
        Index('ix_forecast_runs_init_time', 'initialization_time'),
    )

class ForecastValue(Base):
    __tablename__ = "forecast_values"

    id = Column(Integer, primary_key=True, index=True)
    forecast_run_id = Column(Integer, ForeignKey("forecast_runs.id"), nullable=False)
    grid_point_id = Column(Integer, ForeignKey("grid_points.id"), nullable=False)
    variable_id = Column(Integer, ForeignKey("weather_variables.id"), nullable=False)
    forecast_time = Column(DateTime(timezone=True), nullable=False)
    lead_hours = Column(Integer, nullable=False)
    value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    forecast_run = relationship("ForecastRun")
    grid_point = relationship("GridPoint")
    weather_variable = relationship("WeatherVariable")

    __table_args__ = (
        CheckConstraint('lead_hours >= 0', name='check_valid_lead_hours'),
        Index('ix_forecast_values_query', 'forecast_run_id', 'grid_point_id', 'variable_id', 'forecast_time'),
        Index('ix_forecast_values_time', 'forecast_time'),
    )

class ReferenceValue(Base):
    __tablename__ = "reference_values"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("reference_datasets.id"), nullable=False)
    grid_point_id = Column(Integer, ForeignKey("grid_points.id"), nullable=False)
    variable_id = Column(Integer, ForeignKey("weather_variables.id"), nullable=False)
    observation_time = Column(DateTime(timezone=True), nullable=False)
    value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dataset = relationship("ReferenceDataset")
    grid_point = relationship("GridPoint")
    weather_variable = relationship("WeatherVariable")

    __table_args__ = (
        Index('ix_reference_values_query', 'dataset_id', 'grid_point_id', 'variable_id', 'observation_time'),
    )
