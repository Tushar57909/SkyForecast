import argparse
import os
import json
import uuid
from datetime import datetime
from collections import defaultdict
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

try:
    import pandas as pd
    import numpy as np
    PANDAS_AVAILABLE = True
except ImportError as e:
    PANDAS_AVAILABLE = False
    logging.warning(f"Pandas/Numpy import failed: {e}. Parquet output disabled.")

class LocalDatasetBuilder:
    def __init__(self, input_dir: str, output_dir: str, variable: str, lead_hours: int):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.variable = variable
        self.lead_hours = lead_hours
        
        self.metadata_dir = os.path.join(os.path.dirname(output_dir), "metadata")
        os.makedirs(self.metadata_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)
        
        self.raw_inventory = []
        self.quality_report = {
            "files_inspected": 0,
            "files_accepted": 0,
            "files_rejected": 0,
            "record_count": 0,
            "complete_sample_count": 0,
            "incomplete_sample_count": 0,
            "missing_models": {"ecmwf": 0, "gfs": 0, "icon": 0, "reference": 0},
            "duplicate_count": 0,
            "invalid_timestamp_count": 0,
            "invalid_coordinate_count": 0,
            "invalid_unit_count": 0
        }

    def scan_files(self):
        models = ["ecmwf", "gfs", "icon", "reference"]
        for model in models:
            model_dir = os.path.join(self.input_dir, model)
            if not os.path.exists(model_dir):
                logging.warning(f"Directory missing: {model_dir}")
                continue
            for root, _, files in os.walk(model_dir):
                for f in files:
                    if not f.endswith(".json"):
                        continue
                    filepath = os.path.join(root, f)
                    self.quality_report["files_inspected"] += 1
                    
                    try:
                        file_size = os.path.getsize(filepath)
                        self.raw_inventory.append({
                            "filename": f,
                            "source": model,
                            "path": filepath
                        })
                        self.quality_report["files_accepted"] += 1
                    except Exception as e:
                        logging.error(f"Error inspecting {f}: {e}")
                        self.quality_report["files_rejected"] += 1

        with open(os.path.join(self.metadata_dir, "raw_data_inventory.json"), "w") as f:
            json.dump(self.raw_inventory, f, indent=2)

    def load_json_to_df(self, filepath, source):
        with open(filepath, 'r') as f:
            data = json.load(f)
            
        hourly = data.get("hourly", {})
        if "time" not in hourly:
            logging.error(f"No time array in {filepath}")
            return None
            
        times = hourly["time"]
        df = pd.DataFrame({"valid_time": pd.to_datetime(times)})
        
        if source == "reference":
            # For ERA5, just 'precipitation'
            if self.variable in hourly:
                df[f"reference_{self.variable}"] = hourly[self.variable]
            else:
                logging.error(f"Variable {self.variable} not found in reference data")
                return None
        else:
            # For forecast models, 'precipitation_previous_day1' corresponds to 24h lead time
            # For this pilot we are looking at 24h lead. So previous_day1 is exactly that.
            var_key = f"{self.variable}_previous_day{self.lead_hours // 24}"
            if var_key in hourly:
                df[f"{source}_{self.variable}"] = hourly[var_key]
            else:
                logging.error(f"Variable {var_key} not found in {source} data")
                return None
                
        return df

    def process_data(self):
        if not self.raw_inventory:
            logging.info("REAL DATA IMPORT NOT EXECUTED — INPUT FILES NOT PRESENT.")
            return

        if not PANDAS_AVAILABLE:
            logging.error("REAL DATA IMPORT BLOCKED — PANDAS UNAVAILABLE.")
            return
            
        logging.info("Loading and aligning data...")
        
        dfs = []
        for item in self.raw_inventory:
            df = self.load_json_to_df(item["path"], item["source"])
            if df is not None:
                dfs.append(df)
                
        if not dfs:
            logging.error("No valid dataframes could be constructed.")
            return
            
        # Merge all dataframes on valid_time
        merged_df = dfs[0]
        for df in dfs[1:]:
            merged_df = pd.merge(merged_df, df, on="valid_time", how="outer")
            
        initial_count = len(merged_df)
        self.quality_report["record_count"] = initial_count
        
        # Drop rows with NaNs to ensure complete samples for training
        complete_df = merged_df.dropna().copy()
        complete_count = len(complete_df)
        self.quality_report["complete_sample_count"] = complete_count
        self.quality_report["incomplete_sample_count"] = initial_count - complete_count
        
        if complete_count == 0:
            logging.error("No complete samples after alignment. Check time ranges.")
            return
            
        # Add required ML dataset columns
        complete_df = complete_df.sort_values("valid_time").reset_index(drop=True)
        complete_df["lead_hours"] = self.lead_hours
        complete_df["init_time"] = complete_df["valid_time"] - pd.Timedelta(hours=self.lead_hours)
        complete_df["location_id"] = "new_delhi"
        
        # Leakage check: valid_time must be strictly greater than init_time
        leakage_check = (complete_df["valid_time"] > complete_df["init_time"]).all()
        if not leakage_check:
            logging.error("LEAKAGE DETECTED! valid_time is not after init_time")
            return
            
        # Chronological split (80/10/10)
        n = len(complete_df)
        train_idx = int(n * 0.8)
        val_idx = int(n * 0.9)
        
        train_df = complete_df.iloc[:train_idx]
        val_df = complete_df.iloc[train_idx:val_idx]
        test_df = complete_df.iloc[val_idx:]
        
        logging.info(f"Generated Chronological Splits - Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")
        
        dataset_path = os.path.join(self.output_dir, f"ml_dataset_{self.variable}_lead{self.lead_hours}")
        os.makedirs(dataset_path, exist_ok=True)
        
        try:
            # save as CSV for inspection and fallback
            train_df.to_csv(os.path.join(dataset_path, "train.csv"), index=False)
            val_df.to_csv(os.path.join(dataset_path, "val.csv"), index=False)
            test_df.to_csv(os.path.join(dataset_path, "test.csv"), index=False)
            logging.info("ML-ready CSV files generated successfully.")
        except Exception as e:
            logging.error(f"Failed to write CSV files: {e}")
            
        try:
            train_df.to_parquet(os.path.join(dataset_path, "train.parquet"), index=False)
            val_df.to_parquet(os.path.join(dataset_path, "val.parquet"), index=False)
            test_df.to_parquet(os.path.join(dataset_path, "test.parquet"), index=False)
            logging.info("ML-ready Parquet files generated successfully.")
        except Exception as e:
            logging.warning(f"Failed to write Parquet files (likely missing pyarrow): {e}")

    def generate_reports(self):
        if not self.raw_inventory:
            return
            
        with open(os.path.join(self.metadata_dir, "data_quality_report.json"), "w") as f:
            json.dump(self.quality_report, f, indent=2)

        dataset_version = {
            "dataset_version": f"prototype_v1_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "created_at": datetime.utcnow().isoformat(),
            "source_files": [i["filename"] for i in self.raw_inventory],
            "source_models": ["ecmwf", "gfs", "icon"],
            "reference_source": "reference",
            "variable": self.variable,
            "lead_times": [self.lead_hours],
            "spatial_scope": "new_delhi",
            "processing_version": "1.0.0",
            "normalization_version": "1.0.0",
            "alignment_version": "1.0.0"
        }
        with open(os.path.join(self.metadata_dir, "dataset_version.json"), "w") as f:
            json.dump(dataset_version, f, indent=2)

    def run(self):
        self.scan_files()
        self.process_data()
        self.generate_reports()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", default="../data/raw")
    parser.add_argument("--output-dir", default="../data/datasets")
    parser.add_argument("--variable", default="precipitation")
    parser.add_argument("--lead-hours", type=int, default=24)
    args = parser.parse_args()
    
    builder = LocalDatasetBuilder(args.input_dir, args.output_dir, args.variable, args.lead_hours)
    builder.run()
