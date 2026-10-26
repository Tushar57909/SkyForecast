import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base
from app.models.metadata import WeatherModel, WeatherVariable, ReferenceDataset

def seed_database():
    db = SessionLocal()

    # 1. Seed Weather Models
    models = [
        {"name": "ECMWF IFS", "code": "ECMWF", "provider": "ECMWF", "resolution": 0.25, "description": "European Centre for Medium-Range Weather Forecasts"},
        {"name": "NOAA GFS", "code": "GFS", "provider": "NOAA", "resolution": 0.25, "description": "Global Forecast System"},
        {"name": "DWD ICON", "code": "ICON", "provider": "DWD", "resolution": 0.125, "description": "Icosahedral Nonhydrostatic Weather and Climate Model"}
    ]

    for m in models:
        existing = db.query(WeatherModel).filter_by(code=m["code"]).first()
        if not existing:
            db.add(WeatherModel(**m))

    # 2. Seed Weather Variables
    variables = [
        {"code": "prcp", "name": "Precipitation", "unit": "mm", "aggregation_type": "sum", "description": "Total precipitation over the lead time interval"},
        {"code": "temp", "name": "Temperature", "unit": "Celsius", "aggregation_type": "mean", "description": "Temperature at 2m above ground"},
        {"code": "wind", "name": "Wind Speed", "unit": "m/s", "aggregation_type": "mean", "description": "Wind speed at 10m above ground"}
    ]

    for v in variables:
        existing = db.query(WeatherVariable).filter_by(code=v["code"]).first()
        if not existing:
            db.add(WeatherVariable(**v))

    # 3. Seed Reference Datasets
    datasets = [
        {"name": "ERA5", "provider": "Copernicus/ECMWF", "resolution": 0.25, "description": "Fifth generation of ECMWF atmospheric reanalyses"}
    ]

    for d in datasets:
        existing = db.query(ReferenceDataset).filter_by(name=d["name"]).first()
        if not existing:
            db.add(ReferenceDataset(**d))

    db.commit()
    db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
