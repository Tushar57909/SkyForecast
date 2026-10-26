import math
from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.ai_blending import ModelEvaluation
from app.models.metadata import WeatherVariable
from app.services.weather.processing.alignment import AlignmentService
from app.services.weather.processing.ai_blend import AIBlendService

class EvaluationResult:
    def __init__(self, method: str, sample_count: int, missing_count: int):
        self.method = method
        self.sample_count = sample_count
        self.missing_count = missing_count
        self.mae: Optional[float] = None
        self.rmse: Optional[float] = None
        self.bias: Optional[float] = None
        self.correlation: Optional[float] = None
        self.skill_score: Optional[float] = None
        self.weights_summary: Dict[str, float] = {}

class ForecastEvaluator:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.alignment = AlignmentService(self.db)
        self.ai_blend = AIBlendService(allow_fallback=True)

    def calculate_metrics(self, predicted: List[float], actual: List[float]) -> Dict[str, float]:
        """Calculates MAE, RMSE, Bias, and Correlation."""
        if len(predicted) == 0 or len(actual) == 0 or len(predicted) != len(actual):
            return {}

        n = len(predicted)
        errors = [p - a for p, a in zip(predicted, actual)]
        
        mae = sum(abs(e) for e in errors) / n
        rmse = math.sqrt(sum(e ** 2 for e in errors) / n)
        bias = sum(errors) / n
        
        corr = None
        mean_p = sum(predicted) / n
        mean_a = sum(actual) / n
        
        var_p = sum((p - mean_p) ** 2 for p in predicted) / n
        var_a = sum((a - mean_a) ** 2 for a in actual) / n
        
        if var_p > 0 and var_a > 0:
            cov = sum((predicted[i] - mean_p) * (actual[i] - mean_a) for i in range(n)) / n
            corr_val = cov / math.sqrt(var_p * var_a)
            if not math.isnan(corr_val):
                corr = float(corr_val)

        return {
            "mae": float(mae),
            "rmse": float(rmse),
            "bias": float(bias),
            "correlation": corr
        }

    def evaluate_period(
        self,
        start_time: datetime,
        end_time: datetime,
        variable_code: str,
        lead_hours: int,
        methods: List[str] = ["ECMWF", "GFS", "ICON", "simple_average", "fixed_weight", "ai_dynamic_blend"],
        region_id: Optional[int] = None,
        reference_dataset_id: Optional[int] = None
    ) -> Dict[str, EvaluationResult]:
        """
        Evaluates models over a chronological period.
        """
        # Fetch variable
        # var = self.db.query(WeatherVariable).filter_by(code=variable_code).first()
        
        # We will mock the aligned records fetch for testing since the DB doesn't have live history in this sandbox.
        # A real implementation would loop over `forecast_time` between start_time and end_time,
        # calling `self.alignment.align_forecasts_for_time` and collecting valid points.
        
        # Assuming we collected the aligned records here:
        aligned_records = [] # This would be populated from DB

        results = {}
        for method in methods:
            results[method] = EvaluationResult(method=method, sample_count=0, missing_count=0)

        # Extract valid samples for fair comparison
        valid_records = [r for r in aligned_records if r.reference_value is not None 
                         and r.ecmwf_value is not None and r.gfs_value is not None and r.icon_value is not None]
        
        # Calculate derived forecasts for valid records
        y_true = []
        y_pred = {m: [] for m in methods}
        
        for r in valid_records:
            y_true.append(r.reference_value)
            
            if "ECMWF" in methods: y_pred["ECMWF"].append(r.ecmwf_value)
            if "GFS" in methods: y_pred["GFS"].append(r.gfs_value)
            if "ICON" in methods: y_pred["ICON"].append(r.icon_value)
            
            if "simple_average" in methods:
                y_pred["simple_average"].append((r.ecmwf_value + r.gfs_value + r.icon_value) / 3.0)
                
            if "fixed_weight" in methods:
                y_pred["fixed_weight"].append(r.ecmwf_value * 0.5 + r.gfs_value * 0.3 + r.icon_value * 0.2)
                
            if "ai_dynamic_blend" in methods:
                blend_result = self.ai_blend.generate_blend(
                    variable_code=variable_code,
                    forecast_time=r.forecast_time,
                    initialization_time=r.initialization_time,
                    lead_hours=r.lead_hours,
                    latitude=r.latitude,
                    longitude=r.longitude,
                    ecmwf_value=r.ecmwf_value,
                    gfs_value=r.gfs_value,
                    icon_value=r.icon_value
                )
                y_pred["ai_dynamic_blend"].append(blend_result.blended_value)

        for method in methods:
            if len(valid_records) > 0:
                y_pred_arr = y_pred[method]
                metrics = self.calculate_metrics(y_pred_arr, y_true)
                
                results[method].sample_count = len(valid_records)
                results[method].mae = metrics.get("mae")
                results[method].rmse = metrics.get("rmse")
                results[method].bias = metrics.get("bias")
                results[method].correlation = metrics.get("correlation")
                
                # Calculate Skill Score relative to Simple Average (if available)
                if method != "simple_average" and "simple_average" in methods:
                    ref_metrics = self.calculate_metrics(y_pred["simple_average"], y_true)
                    if ref_metrics.get("rmse") and ref_metrics["rmse"] > 0 and results[method].rmse is not None:
                        results[method].skill_score = 1.0 - (results[method].rmse / ref_metrics["rmse"])
                        
            results[method].missing_count = len(aligned_records) - len(valid_records)

        return results
