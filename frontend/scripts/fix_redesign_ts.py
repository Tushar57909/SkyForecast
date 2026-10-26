import os

base_dir = r"d:\SkyForecast\frontend"

# Fix Evaluation.tsx
eval_path = os.path.join(base_dir, "src/pages/Evaluation.tsx")
with open(eval_path, "r", encoding="utf-8") as f:
    eval_code = f.read()
eval_code = eval_code.replace("import { DEMO_DATA } from '../services/dataAdapter';\n\n", "")
with open(eval_path, "w", encoding="utf-8") as f:
    f.write(eval_code)

# Fix ForecastExplorer.tsx
fe_path = os.path.join(base_dir, "src/pages/ForecastExplorer.tsx")
with open(fe_path, "r", encoding="utf-8") as f:
    fe_code = f.read()
fe_code = fe_code.replace("setSelectedTimeIndex(e.activeTooltipIndex);", "setSelectedTimeIndex(Number(e.activeTooltipIndex));")
fe_code = fe_code.replace("x={activeData.valid_time}", "x={activeData.valid_time as any}")
with open(fe_path, "w", encoding="utf-8") as f:
    f.write(fe_code)

# Fix Overview.tsx
ov_path = os.path.join(base_dir, "src/pages/Overview.tsx")
with open(ov_path, "r", encoding="utf-8") as f:
    ov_code = f.read()
ov_code = ov_code.replace("const latestData = DEMO_DATA.length > 0 ? DEMO_DATA[DEMO_DATA.length - 1] : null;\n\n", "")
with open(ov_path, "w", encoding="utf-8") as f:
    f.write(ov_code)

print("Fixed redesign TS errors.")
