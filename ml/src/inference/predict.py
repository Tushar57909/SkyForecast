import joblib
import pandas as pd
import numpy as np
import os

_MODELS = None

def load_models(model_path: str = None):
    global _MODELS
    if _MODELS is None:
        if not model_path:
            # Fallback path if called from backend root
            model_path = os.path.join(os.path.dirname(__file__), "../../../ml/saved_models/xgboost_error_predictors.joblib")
            
        try:
            _MODELS = joblib.load(model_path)
        except FileNotFoundError:
            _MODELS = None
    return _MODELS

def get_dynamic_weights(month: int, hour: int, lat: float, lon: float, lead_hours: int, ecmwf_pred: float, gfs_pred: float, icon_pred: float) -> dict:
    """
    Predicts the expected error for each model and converts it into blending weights.
    Higher predicted error = Lower assigned weight.
    """
    models = load_models()
    
    if not models:
        # Graceful fallback to Baseline 2 if models aren't trained yet
        return {"ecmwf": 0.5, "gfs": 0.3, "icon": 0.2}
        
    variance = np.var([ecmwf_pred, gfs_pred, icon_pred])
    spread = max([ecmwf_pred, gfs_pred, icon_pred]) - min([ecmwf_pred, gfs_pred, icon_pred])
    
    X = pd.DataFrame([{
        'month': month,
        'hour': hour,
        'latitude': lat,
        'longitude': lon,
        'lead_hours': lead_hours,
        'model_variance': variance,
        'model_spread': spread
    }])
    
    # Predict absolute errors
    pred_err_ecmwf = models['ecmwf'].predict(X)[0]
    pred_err_gfs = models['gfs'].predict(X)[0]
    pred_err_icon = models['icon'].predict(X)[0]
    
    # Convert errors to weights (Inverse of error)
    # Add a small epsilon to prevent division by zero
    eps = 1e-6
    inv_ecmwf = 1.0 / (pred_err_ecmwf + eps)
    inv_gfs = 1.0 / (pred_err_gfs + eps)
    inv_icon = 1.0 / (pred_err_icon + eps)
    
    total_inv = inv_ecmwf + inv_gfs + inv_icon
    
    return {
        "ecmwf": float(inv_ecmwf / total_inv),
        "gfs": float(inv_gfs / total_inv),
        "icon": float(inv_icon / total_inv)
    }
