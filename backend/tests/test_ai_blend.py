import pytest
from datetime import datetime
from app.services.weather.processing.ai_blend import blend_forecasts, AIBlendService

def test_blend_forecasts_math():
    # 0.5*10 + 0.3*20 + 0.2*30 = 5 + 6 + 6 = 17
    result = blend_forecasts(10, 20, 30, 0.5, 0.3, 0.2)
    assert result == 17.0

def test_blend_forecasts_invalid_weights():
    with pytest.raises(ValueError, match="sum to 1.0"):
        blend_forecasts(10, 20, 30, 0.5, 0.5, 0.5)

    with pytest.raises(ValueError, match="negative"):
        blend_forecasts(10, 20, 30, 1.2, -0.1, -0.1)

def test_ai_blend_service_fallback():
    service = AIBlendService(allow_fallback=True)
    
    # ML unavailable/mocked to fail, or models not found.
    # We should get fallback equal weights if all inputs are present.
    result = service.generate_blend(
        variable_code="prcp",
        forecast_time=datetime(2026, 9, 10, 0),
        initialization_time=datetime(2026, 9, 9, 0),
        lead_hours=24,
        latitude=21.0,
        longitude=79.0,
        ecmwf_value=12.0,
        gfs_value=12.0,
        icon_value=12.0
    )
    
    assert result.weight_method == "fallback"
    assert result.fallback_reason is not None
    assert result.ecmwf_weight == 1/3
    assert result.blended_value == 12.0

def test_ai_blend_service_missing_data():
    service = AIBlendService(allow_fallback=True)
    
    with pytest.raises(ValueError, match="Missing models"):
        service.generate_blend(
            variable_code="prcp",
            forecast_time=datetime(2026, 9, 10, 0),
            initialization_time=datetime(2026, 9, 9, 0),
            lead_hours=24,
            latitude=21.0,
            longitude=79.0,
            ecmwf_value=12.0,
            gfs_value=None,
            icon_value=12.0
        )
