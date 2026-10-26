import os
import json
import logging
from datetime import datetime
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

def get_data_paths():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
    dataset_dir = os.path.join(base_dir, "datasets/ml_dataset_precipitation_lead24")
    return {
        "train": os.path.join(dataset_dir, "train.csv"),
        "val": os.path.join(dataset_dir, "val.csv"),
        "test": os.path.join(dataset_dir, "test.csv"),
        "metadata_out": os.path.join(base_dir, "metadata/real_ai_experiment_v1.json"),
        "predictions_out": os.path.join(base_dir, "metadata/ai_test_predictions_v1.csv"),
        "model_dir": os.path.abspath(os.path.join(os.path.dirname(__file__), "../saved_models/weighting"))
    }

def build_features(df):
    """
    Constructs explicitly approved features.
    No reference variables allowed here (leakage audit).
    """
    df_feat = df.copy()
    
    # Time features
    if not pd.api.types.is_datetime64_any_dtype(df_feat["init_time"]):
        df_feat["init_time"] = pd.to_datetime(df_feat["init_time"])
        
    df_feat["month"] = df_feat["init_time"].dt.month
    df_feat["day_of_year"] = df_feat["init_time"].dt.dayofyear
    df_feat["sin_day_of_year"] = np.sin(2 * np.pi * df_feat["day_of_year"] / 365.25)
    df_feat["cos_day_of_year"] = np.cos(2 * np.pi * df_feat["day_of_year"] / 365.25)
    df_feat["initialization_hour"] = df_feat["init_time"].dt.hour
    
    # Forecasts
    df_feat["ecmwf_forecast"] = df_feat["ecmwf_precipitation"]
    df_feat["gfs_forecast"] = df_feat["gfs_precipitation"]
    df_feat["icon_forecast"] = df_feat["icon_precipitation"]
    
    # Spread
    forecast_cols = ["ecmwf_forecast", "gfs_forecast", "icon_forecast"]
    df_feat["model_mean"] = df_feat[forecast_cols].mean(axis=1)
    df_feat["model_spread"] = df_feat[forecast_cols].std(axis=1).fillna(0)
    
    # Differences
    df_feat["ecmwf_minus_gfs"] = df_feat["ecmwf_forecast"] - df_feat["gfs_forecast"]
    df_feat["ecmwf_minus_icon"] = df_feat["ecmwf_forecast"] - df_feat["icon_forecast"]
    df_feat["gfs_minus_icon"] = df_feat["gfs_forecast"] - df_feat["icon_forecast"]
    
    features = [
        "month", "sin_day_of_year", "cos_day_of_year", "initialization_hour", "lead_hours",
        "ecmwf_forecast", "gfs_forecast", "icon_forecast",
        "model_mean", "model_spread",
        "ecmwf_minus_gfs", "ecmwf_minus_icon", "gfs_minus_icon"
    ]
    return df_feat, features

def main():
    paths = get_data_paths()
    
    logging.info("Loading CSV datasets...")
    try:
        train_df = pd.read_csv(paths["train"])
        val_df = pd.read_csv(paths["val"])
        test_df = pd.read_csv(paths["test"])
    except Exception as e:
        logging.error(f"Failed to load CSV: {e}")
        return
        
    logging.info(f"Loaded train={len(train_df)}, val={len(val_df)}, test={len(test_df)}")
    
    # Feature Engineering
    train_feat, feature_names = build_features(train_df)
    val_feat, _ = build_features(val_df)
    test_feat, _ = build_features(test_df)
    
    # Targets: Target is negative absolute error (reliability target). Higher is better.
    for df in [train_feat, val_feat, test_feat]:
        df["ecmwf_target"] = -abs(df["ecmwf_forecast"] - df["reference_precipitation"])
        df["gfs_target"] = -abs(df["gfs_forecast"] - df["reference_precipitation"])
        df["icon_target"] = -abs(df["icon_forecast"] - df["reference_precipitation"])
        
    # Training XGBoost
    models = {}
    metrics = {}
    
    xgb_params = {
        "objective": "reg:squarederror",
        "n_estimators": 100,
        "max_depth": 3,
        "learning_rate": 0.1,
        "random_state": 42
    }
    
    for model_name in ["ecmwf", "gfs", "icon"]:
        logging.info(f"Training XGBoost for {model_name}...")
        model = xgb.XGBRegressor(**xgb_params)
        model.fit(
            train_feat[feature_names], 
            train_feat[f"{model_name}_target"],
            eval_set=[(val_feat[feature_names], val_feat[f"{model_name}_target"])],
            verbose=False
        )
        models[model_name] = model
        
        # Save model
        model_path = os.path.join(paths["model_dir"], model_name, "model_v1.0.0.joblib")
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(model, model_path)
        
        # Evaluate reliability
        preds = model.predict(val_feat[feature_names])
        metrics[model_name] = {
            "val_mae": float(mean_absolute_error(val_feat[f"{model_name}_target"], preds)),
            "val_rmse": float(np.sqrt(mean_squared_error(val_feat[f"{model_name}_target"], preds)))
        }

    # Inference on Test Set
    logging.info("Running inference on Test set...")
    for model_name in ["ecmwf", "gfs", "icon"]:
        test_feat[f"{model_name}_score"] = models[model_name].predict(test_feat[feature_names])
        
    # Softmax for weights
    scores = test_feat[["ecmwf_score", "gfs_score", "icon_score"]].values
    exp_scores = np.exp(scores - np.max(scores, axis=1, keepdims=True))
    weights = exp_scores / np.sum(exp_scores, axis=1, keepdims=True)
    
    test_feat["ecmwf_weight"] = weights[:, 0]
    test_feat["gfs_weight"] = weights[:, 1]
    test_feat["icon_weight"] = weights[:, 2]
    
    # Blended forecast
    test_feat["ai_blended_forecast"] = (
        test_feat["ecmwf_forecast"] * test_feat["ecmwf_weight"] +
        test_feat["gfs_forecast"] * test_feat["gfs_weight"] +
        test_feat["icon_forecast"] * test_feat["icon_weight"]
    )
    
    # Simple average
    test_feat["simple_average"] = test_feat[["ecmwf_forecast", "gfs_forecast", "icon_forecast"]].mean(axis=1)
    
    # Fixed weights (e.g. ECMWF=0.5, GFS=0.3, ICON=0.2)
    test_feat["fixed_weight"] = test_feat["ecmwf_forecast"] * 0.5 + test_feat["gfs_forecast"] * 0.3 + test_feat["icon_forecast"] * 0.2

    # Final evaluation metrics
    final_metrics = {}
    baselines = ["ecmwf_forecast", "gfs_forecast", "icon_forecast", "simple_average", "fixed_weight", "ai_blended_forecast"]
    
    ref = test_feat["reference_precipitation"]
    for b in baselines:
        pred = test_feat[b]
        mse = mean_squared_error(ref, pred)
        final_metrics[b] = {
            "MAE": float(mean_absolute_error(ref, pred)),
            "RMSE": float(np.sqrt(mse)),
            "Bias": float(np.mean(pred - ref))
        }
    
    # RMSE relative skill score
    sa_rmse = final_metrics["simple_average"]["RMSE"]
    for b in baselines:
        final_metrics[b]["RMSE_Skill_Score"] = float(1.0 - (final_metrics[b]["RMSE"] / sa_rmse)) if sa_rmse > 0 else 0.0

    # Save outputs
    experiment_results = {
        "dataset_version": "prototype_v1",
        "model_version": "1.0.0",
        "feature_version": "1.0.0",
        "variable": "precipitation",
        "lead_hours": 24,
        "location": "new_delhi",
        "train_samples": len(train_df),
        "validation_samples": len(val_df),
        "test_samples": len(test_df),
        "evaluation_period": "test_set",
        "metrics": final_metrics,
        "weight_statistics": {
            "ecmwf": {"mean": float(test_feat["ecmwf_weight"].mean()), "std": float(test_feat["ecmwf_weight"].std())},
            "gfs": {"mean": float(test_feat["gfs_weight"].mean()), "std": float(test_feat["gfs_weight"].std())},
            "icon": {"mean": float(test_feat["icon_weight"].mean()), "std": float(test_feat["icon_weight"].std())}
        },
        "fallback_count": 0,
        "fallback_percentage": 0.0,
        "execution_timestamp": datetime.utcnow().isoformat()
    }
    
    os.makedirs(os.path.dirname(paths["metadata_out"]), exist_ok=True)
    with open(paths["metadata_out"], "w") as f:
        json.dump(experiment_results, f, indent=2)
        
    cols_to_save = [
        "valid_time", "init_time", "lead_hours",
        "ecmwf_forecast", "gfs_forecast", "icon_forecast", "reference_precipitation",
        "ecmwf_score", "gfs_score", "icon_score",
        "ecmwf_weight", "gfs_weight", "icon_weight",
        "ai_blended_forecast"
    ]
    test_feat[cols_to_save].to_csv(paths["predictions_out"], index=False)
    
    logging.info("Training and evaluation complete.")

if __name__ == "__main__":
    main()
