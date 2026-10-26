import asyncio
import sys
from datetime import datetime
import random

# Mocking the models for CLI eval
from app.services.weather.processing.models import AlignedForecastRecord
from app.services.weather.evaluation import ForecastEvaluator

def run_evaluation():
    print("Starting Scientific Evaluation (Mock Data)...")
    
    # Generate 100 mock aligned records for precipitation 24h
    records = []
    random.seed(42)
    for i in range(100):
        ref_val = max(0.0, random.gauss(5, 5))
        records.append(AlignedForecastRecord(
            forecast_time=datetime(2026, 10, 1),
            lead_hours=24,
            grid_point_id="india_test",
            latitude=20.0,
            longitude=80.0,
            variable_code="prcp",
            unit="mm",
            reference_value=ref_val,
            ecmwf_value=max(0.0, ref_val + random.gauss(0, 1.5)), # MAE ~ 1.2
            gfs_value=max(0.0, ref_val + random.gauss(0, 2.5)),   # MAE ~ 2.0
            icon_value=max(0.0, ref_val + random.gauss(0, 3.0)),  # MAE ~ 2.4
        ))

    evaluator = ForecastEvaluator(db_session=None)
    
    # Inject mock records manually for the demo instead of DB
    class MockEvaluator(ForecastEvaluator):
        def evaluate_period(self, *args, **kwargs):
            kwargs['methods'] = ["ECMWF", "GFS", "ICON", "simple_average", "fixed_weight", "ai_dynamic_blend"]
            return super().evaluate_period(*args, **kwargs)

    # Monkey patch for local test execution
    evaluator.evaluate_period = MockEvaluator.evaluate_period.__get__(evaluator, ForecastEvaluator)
    # Re-inject the local array logic
    # In real code, DB query replaces this. We'll just run the same logic here:
    
    methods = ["ECMWF", "GFS", "ICON", "simple_average", "fixed_weight", "ai_dynamic_blend"]
    y_true = []
    y_pred = {m: [] for m in methods}
    
    for r in records:
        y_true.append(r.reference_value)
        y_pred["ECMWF"].append(r.ecmwf_value)
        y_pred["GFS"].append(r.gfs_value)
        y_pred["ICON"].append(r.icon_value)
        y_pred["simple_average"].append((r.ecmwf_value + r.gfs_value + r.icon_value) / 3.0)
        y_pred["fixed_weight"].append(r.ecmwf_value * 0.5 + r.gfs_value * 0.3 + r.icon_value * 0.2)
        
        # dynamic blend fallback
        blend = evaluator.ai_blend.generate_blend(
            "prcp", r.forecast_time, None, 24, r.latitude, r.longitude, 
            r.ecmwf_value, r.gfs_value, r.icon_value
        )
        y_pred["ai_dynamic_blend"].append(blend.blended_value)

    print("\nEvaluation Results (24h Precipitation):")
    print("-" * 75)
    print(f"{'Method':<20} | {'MAE':<8} | {'RMSE':<8} | {'Bias':<8} | {'Skill (v Avg)':<12}")
    print("-" * 75)
    
    # Simple average for skill score ref
    ref_rmse = evaluator.calculate_metrics(y_pred["simple_average"], y_true)["rmse"]
    
    for method in methods:
        m = evaluator.calculate_metrics(y_pred[method], y_true)
        skill = 1.0 - (m["rmse"] / ref_rmse) if method != "simple_average" else 0.0
        
        print(f"{method:<20} | {m['mae']:<8.3f} | {m['rmse']:<8.3f} | {m['bias']:<8.3f} | {skill:<12.3f}")

if __name__ == "__main__":
    run_evaluation()
