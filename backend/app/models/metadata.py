from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class WeatherModel(Base):
    __tablename__ = "weather_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    provider = Column(String, nullable=False)
    description = Column(String)
    resolution = Column(Float)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class WeatherVariable(Base):
    __tablename__ = "weather_variables"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    description = Column(String)
    aggregation_type = Column(String) # e.g., sum, mean, max
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ReferenceDataset(Base):
    __tablename__ = "reference_datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    provider = Column(String)
    description = Column(String)
    resolution = Column(Float)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, unique=True, nullable=False)
    algorithm = Column(String)
    training_start = Column(DateTime(timezone=True))
    training_end = Column(DateTime(timezone=True))
    features_hash = Column(String)
    artifact_path = Column(String)
    status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
