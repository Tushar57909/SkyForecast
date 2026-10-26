from typing import List, Dict, Tuple, Optional
from datetime import datetime

from app.models.metadata import WeatherModel
from app.models.geographic import GridPoint
from app.models.forecast import ForecastValue, ReferenceValue
from app.services.weather.processing.models import AlignedForecastRecord, QCFlag, PrecipitationSemantics
from app.services.weather.processing.qc import validate_physical_bounds, validate_coordinates

class CommonGridConfig:
    # India bounding box approx
    LAT_MIN = 8.0
    LAT_MAX = 37.0
    LON_MIN = 68.0
    LON_MAX = 97.0
    RESOLUTION = 0.25

class Regridder:
    """
    Spatial normalization and regridding.
    Currently uses simple nearest-neighbor resolution snapping.
    """
    @staticmethod
    def get_grid_key(lat: float, lon: float, resolution: float = CommonGridConfig.RESOLUTION) -> str:
        """Deterministic grid key (nearest neighbor snap)."""
        snapped_lat = round(lat / resolution) * resolution
        snapped_lon = round(lon / resolution) * resolution
        return f"india_{snapped_lat:.2f}_{snapped_lon:.2f}"
    
    @staticmethod
    def is_within_bounds(lat: float, lon: float) -> bool:
        return (CommonGridConfig.LAT_MIN <= lat <= CommonGridConfig.LAT_MAX and
                CommonGridConfig.LON_MIN <= lon <= CommonGridConfig.LON_MAX)

class AlignmentService:
    """
    Aligns multiple NWP model forecasts and reference data temporally and spatially.
    """
    def __init__(self, db_session):
        self.db = db_session

    def align_forecasts_for_time(
        self,
        forecast_time: datetime,
        lead_hours: int,
        variable_id: int,
        models_to_include: List[str] = ["ECMWF", "GFS", "ICON"],
        reference_dataset_id: Optional[int] = None
    ) -> List[AlignedForecastRecord]:
        
        # 1. Fetch Forecast Values for this specific valid time & lead time
        # We need the model code, so we join with ForecastRun and WeatherModel
        from app.models.forecast import ForecastRun
        
        query_fcst = self.db.query(ForecastValue, WeatherModel.code, GridPoint.latitude, GridPoint.longitude)\
            .join(ForecastRun, ForecastValue.forecast_run_id == ForecastRun.id)\
            .join(WeatherModel, ForecastRun.model_id == WeatherModel.id)\
            .join(GridPoint, ForecastValue.grid_point_id == GridPoint.id)\
            .filter(
                ForecastValue.forecast_time == forecast_time,
                ForecastValue.lead_hours == lead_hours,
                ForecastValue.variable_id == variable_id,
                WeatherModel.code.in_(models_to_include)
            ).all()

        # 2. Fetch Reference Values for this valid time
        query_ref = []
        if reference_dataset_id:
            query_ref = self.db.query(ReferenceValue, GridPoint.latitude, GridPoint.longitude)\
                .join(GridPoint, ReferenceValue.grid_point_id == GridPoint.id)\
                .filter(
                    ReferenceValue.observation_time == forecast_time,
                    ReferenceValue.variable_id == variable_id,
                    ReferenceValue.dataset_id == reference_dataset_id
                ).all()

        # 3. Group by deterministic grid key
        aligned_map: Dict[str, AlignedForecastRecord] = {}

        # Helper to get/create record
        def get_or_create_record(lat: float, lon: float, ftime: datetime, lhours: int) -> AlignedForecastRecord:
            grid_key = Regridder.get_grid_key(lat, lon)
            if grid_key not in aligned_map:
                flags = []
                coord_flag = validate_coordinates(lat, lon)
                if coord_flag: flags.append(coord_flag)
                if not Regridder.is_within_bounds(lat, lon):
                    flags.append(QCFlag.SPATIAL_MISMATCH)

                aligned_map[grid_key] = AlignedForecastRecord(
                    forecast_time=ftime,
                    lead_hours=lhours,
                    grid_point_id=grid_key,
                    latitude=round(lat / CommonGridConfig.RESOLUTION) * CommonGridConfig.RESOLUTION,
                    longitude=round(lon / CommonGridConfig.RESOLUTION) * CommonGridConfig.RESOLUTION,
                    variable_code="canonical", # Simplification for now, pass it from caller
                    unit="canonical", # Simplification
                    quality_flags=flags,
                    regridding_method="nearest_neighbor"
                )
            return aligned_map[grid_key]

        # Populate forecast data
        for fv, model_code, lat, lon in query_fcst:
            rec = get_or_create_record(lat, lon, forecast_time, lead_hours)
            
            val = fv.value
            qc = validate_physical_bounds(val, "temp") # generic
            if qc:
                rec.quality_flags.append(qc)
                
            if model_code == "ECMWF": rec.ecmwf_value = val
            elif model_code == "GFS": rec.gfs_value = val
            elif model_code == "ICON": rec.icon_value = val
            
            rec.initialization_time = fv.forecast_run.initialization_time

        # Populate reference data
        for rv, lat, lon in query_ref:
            rec = get_or_create_record(lat, lon, forecast_time, lead_hours)
            rec.reference_value = rv.value

        return list(aligned_map.values())
