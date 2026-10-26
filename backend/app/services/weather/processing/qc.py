from typing import Optional, List
from app.services.weather.processing.models import QCFlag

def validate_physical_bounds(value: float, variable_code: str) -> Optional[QCFlag]:
    """
    Apply conservative physical bounds to reject impossible values.
    Returns OUT_OF_RANGE if physically impossible, otherwise None.
    """
    if value is None:
        return QCFlag.MISSING

    if variable_code == "prcp":
        # Precipitation cannot be negative
        if value < 0.0:
            return QCFlag.OUT_OF_RANGE
            
    elif variable_code == "wind":
        # Wind speed cannot be negative or absurdly high (> 150 m/s is > 500 km/h)
        if value < 0.0 or value > 150.0:
            return QCFlag.OUT_OF_RANGE
            
    elif variable_code == "temp":
        # Temperature bounds in Celsius (Earth extremes: ~ -90C to +60C)
        if value < -100.0 or value > 70.0:
            return QCFlag.OUT_OF_RANGE

    return None

def validate_coordinates(lat: float, lon: float) -> Optional[QCFlag]:
    """Check if coordinates are valid."""
    if lat is None or lon is None:
        return QCFlag.MISSING
    if not (-90.0 <= lat <= 90.0):
        return QCFlag.INVALID
    if not (-180.0 <= lon <= 180.0):
        return QCFlag.INVALID
    return None
