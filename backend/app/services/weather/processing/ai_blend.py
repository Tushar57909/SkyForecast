import sys
import os
import math
from typing import Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime
import logging

# Ensure ml package is reachable for inference import if running dynamically
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../ml/src")))

try:
    from inference.predict import get_dynamic_weights
    INFERENCE_AVAILABLE = True
except ImportError:
    INFERENCE_AVAILABLE = False
    logging.warning("ML inference module could not be imported.")

class AIBlendForecastResult(BaseModel):
    variable_code: str
    forecast_time: datetime
    initialization_time: Optional[datetime] = None
    lead_hours: int
    latitude: float
    longitude: float
    
    ecmwf_value: float
    gfs_value: float
    icon_value: float
    
    ecmwf_score: Optional[float] = None
    gfs_score: Optional[float] = None
    icon_score: Optional[float] = None
    
    ecmwf_weight: float
    gfs_weight: float
    icon_weight: float
    
    blended_value: float
    weight_method: str
    model_version: Optional[str] = None
    feature_version: Optional[str] = None
    fallback_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

def blend_forecasts(
    ecmwf_value: float,
    gfs_value: float,
    icon_value: float,
    ecmwf_weight: float,
    gfs_weight: float,
    icon_weight: float
) -> float:
    """Pure mathematical blend of forecasts. Validates weights."""
    if any(not math.isfinite(w) for w in [ecmwf_weight, gfs_weight, icon_weight]):
        raise ValueError("Weights must be finite numbers.")
        
    if any(w < 0 for w in [ecmwf_weight, gfs_weight, icon_weight]):
        raise ValueError("Weights cannot be negative.")
        
    total_weight = ecmwf_weight + gfs_weight + icon_weight
    if not math.isclose(total_weight, 1.0, rel_tol=1e-5):
        raise ValueError(f"Weights must sum to 1.0 (Sum = {total_weight})")

    return (ecmwf_value * ecmwf_weight) + (gfs_value * gfs_weight) + (icon_value * icon_weight)

class AIBlendService:
    def __init__(self, allow_fallback: bool = True):
        self.allow_fallback = allow_fallback

    def generate_blend(
        self,
        variable_code: str,
        forecast_time: datetime,
        initialization_time: Optional[datetime],
        lead_hours: int,
        latitude: float,
        longitude: float,
        ecmwf_value: Optional[float],
        gfs_value: Optional[float],
        icon_value: Optional[float]
    ) -> AIBlendForecastResult:
        
        fallback_reason = None
        weight_method = "dynamic_ai"
        weights = None
        scores = {}

        # 1. Validate complete data
        if None in (ecmwf_value, gfs_value, icon_value):
            if not self.allow_fallback:
                raise ValueError("Missing model forecast value(s).")
            fallback_reason = "Missing model forecast value(s)"
        
        # 2. Try ML inference
        if fallback_reason is None:
            if not INFERENCE_AVAILABLE:
                fallback_reason = "Inference module unavailable"
            else:
                try:
                    # In get_dynamic_weights, it expects: month, hour, lat, lon, lead_hours, ecmwf_pred, gfs_pred, icon_pred
                    weights = get_dynamic_weights(
                        month=forecast_time.month,
                        hour=forecast_time.hour,
                        lat=latitude,
                        lon=longitude,
                        lead_hours=lead_hours,
                        ecmwf_pred=ecmwf_value,
                        gfs_pred=gfs_value,
                        icon_pred=icon_value
                    )
                    
                    if weights.get("ecmwf", 0) == 0.5 and weights.get("gfs", 0) == 0.3:
                        # get_dynamic_weights internally fell back to baseline 2 because models were missing
                        fallback_reason = "ML models not found"
                        weight_method = "fallback"
                    else:
                        # Dynamic weights succeeded
                        # We don't expose raw scores from get_dynamic_weights directly out of its signature right now,
                        # so we use weights as pseudo-scores for transparency.
                        scores = {"ecmwf": weights["ecmwf"], "gfs": weights["gfs"], "icon": weights["icon"]}
                        
                except Exception as e:
                    fallback_reason = f"Inference failure: {str(e)}"
                    logging.exception(fallback_reason)

        # 3. Fallback logic
        if fallback_reason:
            if not self.allow_fallback:
                raise ValueError(f"AI blend failed: {fallback_reason}")
                
            weight_method = "fallback"
            weights = {"ecmwf": 1/3, "gfs": 1/3, "icon": 1/3}

            # If any value is None, we need to adjust weights equally among remaining?
            # Prompt says: "If one is missing: do NOT silently calculate a three-model blend using only two models... use an explicit incomplete-data state or fallback".
            # "Default fallback: equal weights: ECMWF=1/3, GFS=1/3, ICON=1/3".
            # If a value is missing, the fallback math will fail unless we impute or throw.
            if None in (ecmwf_value, gfs_value, icon_value):
                # Cannot calculate 1/3 blend if a value is None.
                raise ValueError(f"Missing models; cannot calculate blend. Reason: {fallback_reason}")

        # 4. Calculate Blend
        try:
            blended_value = blend_forecasts(
                ecmwf_value=ecmwf_value,
                gfs_value=gfs_value,
                icon_value=icon_value,
                ecmwf_weight=weights["ecmwf"],
                gfs_weight=weights["gfs"],
                icon_weight=weights["icon"]
            )
        except ValueError as e:
            raise ValueError(f"Weight validation failed: {str(e)}")

        return AIBlendForecastResult(
            variable_code=variable_code,
            forecast_time=forecast_time,
            initialization_time=initialization_time,
            lead_hours=lead_hours,
            latitude=latitude,
            longitude=longitude,
            ecmwf_value=ecmwf_value,
            gfs_value=gfs_value,
            icon_value=icon_value,
            ecmwf_score=scores.get("ecmwf"),
            gfs_score=scores.get("gfs"),
            icon_score=scores.get("icon"),
            ecmwf_weight=weights["ecmwf"],
            gfs_weight=weights["gfs"],
            icon_weight=weights["icon"],
            blended_value=blended_value,
            weight_method=weight_method,
            fallback_reason=fallback_reason,
            model_version="xgb_v1" if weight_method == "dynamic_ai" else None,
            feature_version="feat_v1" if weight_method == "dynamic_ai" else None
        )
