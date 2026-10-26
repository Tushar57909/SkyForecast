import time
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from app.models.metadata import WeatherModel, WeatherVariable, ReferenceDataset
from app.models.geographic import GridPoint
from app.models.forecast import ForecastRun, ForecastValue, ReferenceValue
from app.services.weather.models import NormalizedForecastRecord, NormalizedReferenceRecord, IngestionResult
from app.services.weather.providers.base import WeatherProvider

class WeatherIngestionService:
    def __init__(self, db: Session, provider: WeatherProvider):
        self.db = db
        self.provider = provider
        
        # Caches to avoid repeated DB hits during a single batch
        self._model_cache: Dict[str, int] = {}
        self._var_cache: Dict[str, int] = {}
        self._grid_cache: Dict[str, int] = {}
        self._run_cache: Dict[str, int] = {}
        self._ref_dataset_cache: Dict[str, int] = {}

    def _get_model_id(self, code: str) -> Optional[int]:
        if code not in self._model_cache:
            model = self.db.query(WeatherModel).filter(WeatherModel.code == code).first()
            if model:
                self._model_cache[code] = model.id
        return self._model_cache.get(code)

    def _get_variable_id(self, code: str) -> Optional[int]:
        if code not in self._var_cache:
            var = self.db.query(WeatherVariable).filter(WeatherVariable.code == code).first()
            if var:
                self._var_cache[code] = var.id
        return self._var_cache.get(code)
        
    def _get_dataset_id(self, code: str) -> Optional[int]:
        if code not in self._ref_dataset_cache:
            ds = self.db.query(ReferenceDataset).filter(ReferenceDataset.name == code).first()
            if ds:
                self._ref_dataset_cache[code] = ds.id
        return self._ref_dataset_cache.get(code)

    def _get_or_create_grid_point(self, lat: float, lon: float) -> int:
        # Create a deterministic grid key using 2 decimal places for normalization
        grid_key = f"{lat:.2f}_{lon:.2f}"
        if grid_key not in self._grid_cache:
            # Check DB
            pt = self.db.query(GridPoint).filter(GridPoint.grid_key == grid_key).first()
            if not pt:
                pt = GridPoint(latitude=lat, longitude=lon, grid_key=grid_key)
                self.db.add(pt)
                self.db.commit()
                self.db.refresh(pt)
            self._grid_cache[grid_key] = pt.id
        return self._grid_cache[grid_key]

    def _get_or_create_forecast_run(self, model_id: int, init_time: datetime, identifier: str, source: str) -> int:
        run_key = f"{model_id}_{init_time.isoformat()}_{identifier}"
        if run_key not in self._run_cache:
            run = self.db.query(ForecastRun).filter(
                ForecastRun.model_id == model_id,
                ForecastRun.initialization_time == init_time,
                ForecastRun.run_identifier == identifier
            ).first()
            
            if not run:
                run = ForecastRun(
                    model_id=model_id,
                    initialization_time=init_time,
                    run_identifier=identifier,
                    source=source
                )
                self.db.add(run)
                self.db.commit()
                self.db.refresh(run)
            self._run_cache[run_key] = run.id
        return self._run_cache[run_key]

    async def ingest_current_forecast(
        self,
        model_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        forecast_days: int = 5
    ) -> IngestionResult:
        start_time = time.time()
        result = IngestionResult(
            provider=self.provider.provider_name,
            model=model_code,
            requested_period=f"current_{forecast_days}_days"
        )

        try:
            records = await self.provider.fetch_current_forecast(
                model_code=model_code,
                latitudes=latitudes,
                longitudes=longitudes,
                variables=variables,
                forecast_days=forecast_days
            )
            result.records_received = len(records)
            self._persist_forecast_records(records, result)
        except Exception as e:
            result.status = "error"
            result.errors.append(str(e))
        
        result.duration_seconds = time.time() - start_time
        return result

    async def ingest_historical_forecast(
        self,
        model_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        start_date: str,
        end_date: str
    ) -> IngestionResult:
        start_time = time.time()
        result = IngestionResult(
            provider=self.provider.provider_name,
            model=model_code,
            requested_period=f"{start_date}_to_{end_date}"
        )

        try:
            records = await self.provider.fetch_historical_forecast(
                model_code=model_code,
                latitudes=latitudes,
                longitudes=longitudes,
                variables=variables,
                start_date=start_date,
                end_date=end_date
            )
            result.records_received = len(records)
            self._persist_forecast_records(records, result)
        except Exception as e:
            result.status = "error"
            result.errors.append(str(e))
        
        result.duration_seconds = time.time() - start_time
        return result

    async def ingest_reference_data(
        self,
        dataset_code: str,
        latitudes: List[float],
        longitudes: List[float],
        variables: List[str],
        start_date: str,
        end_date: str
    ) -> IngestionResult:
        start_time = time.time()
        result = IngestionResult(
            provider=self.provider.provider_name,
            model=dataset_code,
            requested_period=f"{start_date}_to_{end_date}"
        )

        try:
            records = await self.provider.fetch_reference_data(
                dataset_code=dataset_code,
                latitudes=latitudes,
                longitudes=longitudes,
                variables=variables,
                start_date=start_date,
                end_date=end_date
            )
            result.records_received = len(records)
            self._persist_reference_records(records, result)
        except Exception as e:
            result.status = "error"
            result.errors.append(str(e))
        
        result.duration_seconds = time.time() - start_time
        return result

    def _persist_forecast_records(self, records: List[NormalizedForecastRecord], result: IngestionResult):
        for rec in records:
            if rec.value is None:
                result.missing_values += 1
                result.records_skipped += 1
                continue

            model_id = self._get_model_id(rec.model_code)
            var_id = self._get_variable_id(rec.variable_code)

            if not model_id or not var_id:
                result.validation_errors += 1
                result.records_skipped += 1
                continue

            result.records_normalized += 1

            grid_id = self._get_or_create_grid_point(rec.latitude, rec.longitude)
            run_id = self._get_or_create_forecast_run(
                model_id=model_id,
                init_time=rec.initialization_time,
                identifier=rec.run_identifier,
                source=rec.source
            )

            # Idempotency check: see if record already exists
            existing = self.db.query(ForecastValue).filter(
                ForecastValue.forecast_run_id == run_id,
                ForecastValue.grid_point_id == grid_id,
                ForecastValue.variable_id == var_id,
                ForecastValue.forecast_time == rec.forecast_time
            ).first()

            if existing:
                result.duplicates += 1
                result.records_skipped += 1
                continue

            # Validate based on Prompt rules
            if rec.lead_hours < 0:
                result.validation_errors += 1
                result.records_skipped += 1
                continue

            val = ForecastValue(
                forecast_run_id=run_id,
                grid_point_id=grid_id,
                variable_id=var_id,
                forecast_time=rec.forecast_time,
                lead_hours=rec.lead_hours,
                value=rec.value
            )
            
            try:
                self.db.add(val)
                self.db.commit()
                result.records_inserted += 1
            except IntegrityError:
                self.db.rollback()
                result.duplicates += 1
                result.records_skipped += 1

    def _persist_reference_records(self, records: List[NormalizedReferenceRecord], result: IngestionResult):
        for rec in records:
            if rec.value is None:
                result.missing_values += 1
                result.records_skipped += 1
                continue

            dataset_id = self._get_dataset_id(rec.dataset_code)
            var_id = self._get_variable_id(rec.variable_code)

            if not dataset_id or not var_id:
                result.validation_errors += 1
                result.records_skipped += 1
                continue

            result.records_normalized += 1

            grid_id = self._get_or_create_grid_point(rec.latitude, rec.longitude)

            # Idempotency check
            existing = self.db.query(ReferenceValue).filter(
                ReferenceValue.dataset_id == dataset_id,
                ReferenceValue.grid_point_id == grid_id,
                ReferenceValue.variable_id == var_id,
                ReferenceValue.observation_time == rec.observation_time
            ).first()

            if existing:
                result.duplicates += 1
                result.records_skipped += 1
                continue

            val = ReferenceValue(
                dataset_id=dataset_id,
                grid_point_id=grid_id,
                variable_id=var_id,
                observation_time=rec.observation_time,
                value=rec.value
            )
            
            try:
                self.db.add(val)
                self.db.commit()
                result.records_inserted += 1
            except IntegrityError:
                self.db.rollback()
                result.duplicates += 1
                result.records_skipped += 1
