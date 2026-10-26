import os

base_dir = r"d:\SkyForecast\frontend"

# Fix ForecastExplorer.tsx
fe_path = os.path.join(base_dir, "src/pages/ForecastExplorer.tsx")
with open(fe_path, "r", encoding="utf-8") as f:
    fe_code = f.read()
fe_code = fe_code.replace(", AreaChart, Area", "")
with open(fe_path, "w", encoding="utf-8") as f:
    f.write(fe_code)

# Fix ModelWeights.tsx
mw_path = os.path.join(base_dir, "src/pages/ModelWeights.tsx")
with open(mw_path, "r", encoding="utf-8") as f:
    mw_code = f.read()
mw_code = mw_code.replace("LineChart, Line, ", "")
with open(mw_path, "w", encoding="utf-8") as f:
    f.write(mw_code)

# Fix Overview.tsx
ov_path = os.path.join(base_dir, "src/pages/Overview.tsx")
with open(ov_path, "r", encoding="utf-8") as f:
    ov_code = f.read()
ov_code = ov_code.replace("import { DEMO_DATA } from '../services/dataAdapter';\n\n", "")
with open(ov_path, "w", encoding="utf-8") as f:
    f.write(ov_code)

print("Fixed unused imports.")
