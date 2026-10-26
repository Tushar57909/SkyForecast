import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
from src.features.engineering import extract_features

def train_model(model_save_path: str):
    """
    Trains XGBoost to predict the absolute error of each model.
    The lower the predicted error, the higher the weight assigned during inference.
    """
    print("Generating Synthetic Historical Training Data (SIH Demo Fallback)...")
    
    # --- MOCK DATA GENERATION FOR SIH DEMO PREPARATION ---
    # Ensures the repo is runnable instantly without needing 100GB of historical ERA5 data.
    np.random.seed(42)
    dates = pd.date_range("2025-01-01", "2025-12-31", freq="H")
    df = pd.DataFrame({"forecast_time": dates})
    df['latitude'] = 20.59 + np.random.normal(0, 5, len(df))
    df['longitude'] = 78.96 + np.random.normal(0, 5, len(df))
    df['lead_hours'] = np.random.choice([24, 48, 72, 96, 120], len(df))
    
    # True target (e.g., Rainfall mm)
    df['true_val'] = np.random.uniform(0, 50, len(df))
    
    # Model predictions with varying synthetic accuracy based on lead time
    df['ecmwf_pred'] = df['true_val'] + np.random.normal(0, df['lead_hours']/10, len(df))
    df['gfs_pred'] = df['true_val'] + np.random.normal(0, df['lead_hours']/8, len(df))
    df['icon_pred'] = df['true_val'] + np.random.normal(0, df['lead_hours']/9, len(df))
    
    # The ML Task: Predict the Absolute Error of each model
    df['ecmwf_error'] = abs(df['ecmwf_pred'] - df['true_val'])
    df['gfs_error'] = abs(df['gfs_pred'] - df['true_val'])
    df['icon_error'] = abs(df['icon_pred'] - df['true_val'])
    
    # Feature Engineering
    df = extract_features(df)
    
    features = ['month', 'hour', 'latitude', 'longitude', 'lead_hours', 'model_variance', 'model_spread']
    
    X = df[features]
    
    print("Training ECMWF Error Predictor...")
    model_ecmwf = xgb.XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5)
    model_ecmwf.fit(X, df['ecmwf_error'])
    
    print("Training GFS Error Predictor...")
    model_gfs = xgb.XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5)
    model_gfs.fit(X, df['gfs_error'])
    
    print("Training ICON Error Predictor...")
    model_icon = xgb.XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5)
    model_icon.fit(X, df['icon_error'])
    
    # Save models
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump({'ecmwf': model_ecmwf, 'gfs': model_gfs, 'icon': model_icon}, model_save_path)
    print(f"Models successfully saved to {model_save_path}")

if __name__ == "__main__":
    # If run directly, output to the saved_models directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.join(current_dir, "../../saved_models/xgboost_error_predictors.joblib")
    train_model(target_path)
