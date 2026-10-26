import asyncio
import sys
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.services.weather.providers.openmeteo import OpenMeteoProvider
from app.services.weather.ingestion import WeatherIngestionService

async def run_smoke_test():
    print("Starting small real-data smoke test...")
    db = SessionLocal()
    try:
        provider = OpenMeteoProvider()
        service = WeatherIngestionService(db, provider)
        
        # Test just one location in India (e.g., Nagpur center)
        latitudes = [21.14]
        longitudes = [79.08]
        variables = ["prcp", "temp", "wind"]

        print("Fetching ECMWF current forecast (1 day)...")
        result = await service.ingest_current_forecast(
            model_code="ECMWF",
            latitudes=latitudes,
            longitudes=longitudes,
            variables=variables,
            forecast_days=1
        )
        
        print("\nIngestion Result:")
        for k, v in result.model_dump().items():
            print(f"  {k}: {v}")

        if result.status == "error":
            print("\nError occurred during smoke test. The external API might be unreachable.")
            sys.exit(1)
        elif result.records_inserted > 0 or result.duplicates > 0:
            print("\nSmoke test succeeded! Records were inserted into the database or properly skipped as duplicates.")
        else:
            print("\nWarning: No records were inserted, but no error was thrown.")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_smoke_test())
