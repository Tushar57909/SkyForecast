import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.metadata import WeatherModel, WeatherVariable, ReferenceDataset
from app.models.geographic import GridPoint
from app.models.forecast import ForecastRun, ForecastValue, ReferenceValue

from app.services.weather.processing.qc import validate_physical_bounds, validate_coordinates, QCFlag
from app.services.weather.processing.unit_conversion import convert_unit, UnitConversionError
from app.services.weather.processing.alignment import AlignmentService, Regridder
from app.services.weather.processing.models import AlignedForecastRecord

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Setup test fixtures
    m_ecmwf = WeatherModel(name="ECMWF", code="ECMWF", provider="ECMWF")
    m_gfs = WeatherModel(name="GFS", code="GFS", provider="NOAA")
    v_temp = WeatherVariable(code="temp", name="Temperature", unit="°C")
    d_era5 = ReferenceDataset(name="ERA5", provider="ECMWF")
    
    db.add_all([m_ecmwf, m_gfs, v_temp, d_era5])
    db.commit()
    
    init_time = datetime(2026, 9, 1, 0, 0, 0)
    fcst_time = datetime(2026, 9, 3, 0, 0, 0)
    
    fr_ecmwf = ForecastRun(model_id=m_ecmwf.id, initialization_time=init_time, run_identifier="E1")
    fr_gfs = ForecastRun(model_id=m_gfs.id, initialization_time=init_time, run_identifier="G1")
    
    gp1 = GridPoint(latitude=20.0, longitude=80.0, grid_key="india_20.00_80.00")
    
    db.add_all([fr_ecmwf, fr_gfs, gp1])
    db.commit()
    
    fv_ecmwf = ForecastValue(forecast_run_id=fr_ecmwf.id, grid_point_id=gp1.id, variable_id=v_temp.id, forecast_time=fcst_time, lead_hours=48, value=25.0)
    fv_gfs = ForecastValue(forecast_run_id=fr_gfs.id, grid_point_id=gp1.id, variable_id=v_temp.id, forecast_time=fcst_time, lead_hours=48, value=26.0)
    
    rv_era5 = ReferenceValue(dataset_id=d_era5.id, grid_point_id=gp1.id, variable_id=v_temp.id, observation_time=fcst_time, value=25.5)
    
    db.add_all([fv_ecmwf, fv_gfs, rv_era5])
    db.commit()
    
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_unit_conversion():
    assert convert_unit(32.0, "fahrenheit", "°c", "temp") == 0.0
    assert convert_unit(0.0, "°c", "fahrenheit", "temp") == 32.0
    assert convert_unit(10.0, "km/h", "m/s", "wind") == pytest.approx(2.777, 0.01)
    
    with pytest.raises(UnitConversionError):
        convert_unit(10.0, "unknown", "°c", "temp")

def test_quality_control():
    assert validate_physical_bounds(-5.0, "prcp") == QCFlag.OUT_OF_RANGE
    assert validate_physical_bounds(5.0, "prcp") is None
    assert validate_physical_bounds(200.0, "wind") == QCFlag.OUT_OF_RANGE
    assert validate_physical_bounds(-150.0, "temp") == QCFlag.OUT_OF_RANGE
    
    assert validate_coordinates(100.0, 0.0) == QCFlag.INVALID
    assert validate_coordinates(20.0, 80.0) is None

def test_grid_key():
    assert Regridder.get_grid_key(20.12, 80.12) == "india_20.00_80.00"

def test_alignment_service(db):
    service = AlignmentService(db)
    v_temp = db.query(WeatherVariable).filter_by(code="temp").first()
    d_era5 = db.query(ReferenceDataset).filter_by(name="ERA5").first()
    
    fcst_time = datetime(2026, 9, 3, 0, 0, 0)
    records = service.align_forecasts_for_time(
        forecast_time=fcst_time,
        lead_hours=48,
        variable_id=v_temp.id,
        models_to_include=["ECMWF", "GFS"],
        reference_dataset_id=d_era5.id
    )
    
    assert len(records) == 1
    rec = records[0]
    
    assert rec.ecmwf_value == 25.0
    assert rec.gfs_value == 26.0
    assert rec.reference_value == 25.5
    assert rec.lead_hours == 48
    assert rec.grid_point_id == "india_20.00_80.00"
    assert len(rec.quality_flags) == 0
