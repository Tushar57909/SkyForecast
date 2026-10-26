class UnitConversionError(ValueError):
    pass

def convert_unit(value: float, source_unit: str, target_unit: str, variable_code: str) -> float:
    """
    Deterministic unit conversion.
    Raises UnitConversionError if conversion is not supported or unit is unknown.
    """
    if value is None:
        return None

    s = source_unit.strip().lower()
    t = target_unit.strip().lower()

    if s == t:
        return value

    if variable_code == "temp":
        if s == "fahrenheit" and t == "°c":
            return (value - 32.0) * 5.0 / 9.0
        elif s == "kelvin" and t == "°c":
            return value - 273.15
        elif s == "°c" and t == "fahrenheit":
            return (value * 9.0 / 5.0) + 32.0
        
    elif variable_code == "wind":
        if s == "km/h" and t == "m/s":
            return value / 3.6
        elif s == "mph" and t == "m/s":
            return value * 0.44704
        elif s == "knots" and t == "m/s":
            return value * 0.514444

    elif variable_code == "prcp":
        if s == "inch" and t == "mm":
            return value * 25.4

    raise UnitConversionError(f"Unsupported unit conversion from '{source_unit}' to '{target_unit}' for {variable_code}")
