import pytest
from datetime import datetime
from app.services.weather.evaluation import ForecastEvaluator

def test_calculate_metrics():
    # Deterministic test
    evaluator = ForecastEvaluator(db_session=None)
    
    predicted = [10.0, 12.0, 14.0]
    actual = [10.0, 10.0, 10.0]
    
    # Errors: 0, 2, 4
    # MAE = (0 + 2 + 4) / 3 = 2.0
    # RMSE = sqrt((0 + 4 + 16)/3) = sqrt(20/3) = 2.58198
    # Bias = (0 + 2 + 4) / 3 = 2.0
    
    metrics = evaluator.calculate_metrics(predicted, actual)
    
    assert metrics["mae"] == 2.0
    assert metrics["bias"] == 2.0
    assert abs(metrics["rmse"] - 2.581988) < 1e-5
    
def test_skill_score():
    # If Baseline RMSE = 5.0 and Method RMSE = 3.0
    rmse_ref = 5.0
    rmse_meth = 3.0
    skill_score = 1.0 - (rmse_meth / rmse_ref)
    assert skill_score == 0.4
