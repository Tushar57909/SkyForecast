from typing import Dict, Tuple

# Maps internal canonical variable codes to Open-Meteo current/historical variable names
PROVIDER_VARIABLE_MAP = {
    "openmeteo": {
        "prcp": "precipitation",
        "temp": "temperature_2m",
        "wind": "wind_speed_10m"
    }
}

CANONICAL_UNITS = {
    "prcp": "mm",
    "temp": "°C",
    "wind": "m/s"
}

def get_provider_variable(provider: str, canonical_var: str) -> str:
    """Map canonical variable to provider-specific variable string."""
    return PROVIDER_VARIABLE_MAP.get(provider, {}).get(canonical_var, canonical_var)

def get_canonical_variable(provider: str, provider_var: str) -> str:
    """Map provider-specific variable back to canonical variable string."""
    reverse_map = {v: k for k, v in PROVIDER_VARIABLE_MAP.get(provider, {}).items()}
    return reverse_map.get(provider_var, provider_var)

def normalize_unit(canonical_var: str, value: float, provider_unit: str) -> float:
    """Normalize values if provider units differ from canonical units."""
    if value is None:
        return value

    canonical_unit = CANONICAL_UNITS.get(canonical_var)
    if not canonical_unit:
        return value

    # Basic unit conversions if needed
    if canonical_var == "wind":
        if provider_unit == "km/h":
            return value / 3.6
    
    # We request the correct units from Open-Meteo anyway, so usually this is just a pass-through
    return value
