import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from app.models.base import Base
from app.models.metadata import WeatherModel, WeatherVariable, ReferenceDataset
from app.models.geographic import GridPoint
from app.models.forecast import ForecastRun, ForecastValue

# Use an in-memory SQLite database for fast unit testing of schema logic
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_database_connection(db):
    """Test that connection works and tables are created."""
    assert db.execute(text("SELECT 1")).scalar() == 1

def test_seed_and_crud(db):
    """Test basic CRUD operations on metadata tables."""
    wm = WeatherModel(name="Test Model", code="TEST", provider="Test Provider")
    db.add(wm)
    db.commit()
    db.refresh(wm)
    assert wm.id is not None
    assert wm.code == "TEST"

def test_foreign_key_relationships(db):
    """Test that relationships work correctly."""
    wm = db.query(WeatherModel).filter_by(code="TEST").first()
    
    fr = ForecastRun(
        model_id=wm.id, 
        initialization_time=datetime(2026, 9, 28, 0, 0, 0),
        run_identifier="20260928_00"
    )
    db.add(fr)
    db.commit()
    db.refresh(fr)
    
    assert fr.model.code == "TEST"

def test_check_constraints(db):
    """Test that invalid values violate constraints."""
    
    # Invalid Lead Time
    with pytest.raises(IntegrityError):
        invalid_val = ForecastValue(
            forecast_run_id=1,
            grid_point_id=1,
            variable_id=1,
            forecast_time=datetime(2026, 9, 28, 6, 0, 0),
            lead_hours=-5, # Invalid!
            value=10.0
        )
        db.add(invalid_val)
        db.commit()
    db.rollback()

    # Invalid Coordinate
    with pytest.raises(IntegrityError):
        invalid_grid = GridPoint(
            latitude=150.0, # Invalid (> 90)
            longitude=0.0,
            grid_key="invalid_pt"
        )
        db.add(invalid_grid)
        db.commit()
    db.rollback()
