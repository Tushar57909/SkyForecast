import os
import glob

base_dir = r"d:\SkyForecast\frontend"

# Remove unused React imports
for root, _, files in os.walk(os.path.join(base_dir, "src")):
    for f in files:
        if f.endswith(".tsx"):
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file:
                lines = file.readlines()
            
            with open(filepath, "w", encoding="utf-8") as file:
                for line in lines:
                    if "import React" in line and "useState" not in line:
                        continue
                    if "import React, { useState }" in line:
                        line = "import { useState } from 'react';\n"
                    file.write(line)

# Fix ForecastExplorer type error
fe_path = os.path.join(base_dir, "src/pages/ForecastExplorer.tsx")
with open(fe_path, "r", encoding="utf-8") as f:
    fe_code = f.read()
fe_code = fe_code.replace("tickFormatter={(t) => new Date(t).toLocaleDateString()}", "tickFormatter={(t: any) => new Date(t).toLocaleDateString()}")
fe_code = fe_code.replace("labelFormatter={(t) => new Date(t).toLocaleString()}", "labelFormatter={(t: any) => new Date(t).toLocaleString()}")
with open(fe_path, "w", encoding="utf-8") as f:
    f.write(fe_code)

# Fix dataAdapter.ts strict types
da_path = os.path.join(base_dir, "src/services/dataAdapter.ts")
with open(da_path, "r", encoding="utf-8") as f:
    da_code = f.read()

type_def = """
export interface WeatherData {
  valid_time: Date;
  init_time: Date;
  lead_hours: number;
  location_id: string;
  ecmwf: number;
  gfs: number;
  icon: number;
  reference: number;
  ai_weight_ecmwf: number | null;
  ai_weight_gfs: number | null;
  ai_weight_icon: number | null;
  ai_blend: number | null;
}

"""
da_code = da_code.replace("export const DEMO_DATA = demoDataRaw.map(d => ({", type_def + "export const DEMO_DATA: WeatherData[] = demoDataRaw.map(d => ({")
with open(da_path, "w", encoding="utf-8") as f:
    f.write(da_code)

print("Fixed TS errors.")
