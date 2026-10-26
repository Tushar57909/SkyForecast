import os
import csv
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "../../data/datasets/ml_dataset_precipitation_lead24/test.csv")
out_path = os.path.join(base_dir, "src/data/demo_data.json")

data = []
if os.path.exists(csv_path):
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print(f"Generated {out_path} with {len(data)} records.")
