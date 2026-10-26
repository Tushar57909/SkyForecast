import pandas as pd
import numpy as np

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts contextual features for the ML model.
    Expected columns: forecast_time, latitude, longitude, lead_hours, ecmwf_pred, gfs_pred, icon_pred
    """
    df = df.copy()
    
    # Time-based features
    df['forecast_time'] = pd.to_datetime(df['forecast_time'])
    df['month'] = df['forecast_time'].dt.month
    df['hour'] = df['forecast_time'].dt.hour
    
    # Model disagreement / spread
    # If models strongly disagree, the AI might trust the historically most stable one
    df['model_variance'] = df[['ecmwf_pred', 'gfs_pred', 'icon_pred']].var(axis=1)
    df['model_spread'] = df[['ecmwf_pred', 'gfs_pred', 'icon_pred']].max(axis=1) - df[['ecmwf_pred', 'gfs_pred', 'icon_pred']].min(axis=1)
    
    return df
