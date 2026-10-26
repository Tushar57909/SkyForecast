import asyncio
import httpx
import json
import os

async def check_open_meteo():
    os.makedirs("../data/metadata", exist_ok=True)
    
    capabilities = {}
    
    # Check historical forecast availability (ECMWF)
    url_hist_forecast = "https://historical-forecast-api.open-meteo.com/v1/forecast"
    params_hist = {
        "latitude": 28.6139,
        "longitude": 77.2090, # New Delhi
        "start_date": "2024-01-01",
        "end_date": "2024-01-03",
        "hourly": "precipitation",
        "models": "ecmwf_ifs025,gfs_seamless,icon_seamless"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(url_hist_forecast, params=params_hist)
            if r.status_code == 200:
                data = r.json()
                capabilities["historical_forecast_status"] = "success"
                capabilities["historical_forecast_models"] = ["ecmwf_ifs025", "gfs_seamless", "icon_seamless"]
                capabilities["historical_forecast_variables"] = ["precipitation"]
            else:
                capabilities["historical_forecast_status"] = f"failed: {r.status_code} {r.text}"
        except Exception as e:
            capabilities["historical_forecast_status"] = f"error: {repr(e)}"
            
        # Check reference (ERA5)
        url_archive = "https://archive-api.open-meteo.com/v1/archive"
        params_ref = {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "start_date": "2024-01-01",
            "end_date": "2024-01-03",
            "hourly": "precipitation"
        }
        try:
            r = await client.get(url_archive, params=params_ref)
            if r.status_code == 200:
                data = r.json()
                capabilities["reference_status"] = "success"
                capabilities["reference_dataset"] = "ERA5"
                capabilities["reference_variables"] = ["precipitation"]
            else:
                capabilities["reference_status"] = f"failed: {r.status_code} {r.text}"
        except Exception as e:
            capabilities["reference_status"] = f"error: {repr(e)}"

    with open("../data/metadata/provider_capabilities.json", "w") as f:
        json.dump(capabilities, f, indent=4)
        
    print(json.dumps(capabilities, indent=2))

if __name__ == "__main__":
    asyncio.run(check_open_meteo())
