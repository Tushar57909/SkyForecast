from typing import List, Dict
from app.models.weather import ForecastRun

def get_baseline_1_simple_average(forecasts: List[ForecastRun]) -> Dict:
    """
    Baseline 1: Simple arithmetic mean of ECMWF, GFS, and ICON.
    Weights are equal: 33.3% each.
    """
    if not forecasts:
        return None
        
    temps = [f.temperature for f in forecasts if f.temperature is not None]
    rains = [f.rainfall for f in forecasts if f.rainfall is not None]
    
    avg_temp = sum(temps) / len(temps) if temps else None
    avg_rain = sum(rains) / len(rains) if rains else None
    
    weight = 1.0 / len(forecasts)
    
    return {
        "temperature": avg_temp,
        "rainfall": avg_rain,
        "ecmwf_weight": weight if any("ECMWF" in f.model.name for f in forecasts) else 0.0,
        "gfs_weight": weight if any("GFS" in f.model.name for f in forecasts) else 0.0,
        "icon_weight": weight if any("ICON" in f.model.name for f in forecasts) else 0.0,
        "confidence": 0.50 # Baseline confidence
    }

def get_baseline_2_historical_weights(forecasts: List[ForecastRun], region: str = "India") -> Dict:
    """
    Baseline 2: Fixed historical weighting based on generalized prior knowledge.
    Example: ECMWF (50%), GFS (30%), ICON (20%)
    """
    if not forecasts:
        return None
        
    weights = {"ECMWF": 0.5, "GFS": 0.3, "ICON": 0.2}
    
    blended_temp = 0.0
    blended_rain = 0.0
    total_weight = 0.0
    
    for f in forecasts:
        for key in weights.keys():
            if key in f.model.name:
                w = weights[key]
                if f.temperature is not None:
                    blended_temp += f.temperature * w
                if f.rainfall is not None:
                    blended_rain += f.rainfall * w
                total_weight += w
                break
                
    if total_weight > 0:
        blended_temp /= total_weight
        blended_rain /= total_weight
        
    return {
        "temperature": blended_temp if total_weight > 0 else None,
        "rainfall": blended_rain if total_weight > 0 else None,
        "ecmwf_weight": weights["ECMWF"],
        "gfs_weight": weights["GFS"],
        "icon_weight": weights["ICON"],
        "confidence": 0.65 # Higher confidence than baseline 1
    }
