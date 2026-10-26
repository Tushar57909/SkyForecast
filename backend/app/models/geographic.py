from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True)
    type = Column(String) # country, state, district, analysis
    parent_region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    country_code = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    parent = relationship("Region", remote_side=[id])

class GridPoint(Base):
    __tablename__ = "grid_points"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    grid_key = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint('latitude >= -90 AND latitude <= 90', name='check_valid_latitude'),
        CheckConstraint('longitude >= -180 AND longitude <= 180', name='check_valid_longitude'),
        UniqueConstraint('grid_key', name='uq_grid_key'),
        UniqueConstraint('latitude', 'longitude', name='uq_lat_lon'),
    )
    
    region = relationship("Region")
