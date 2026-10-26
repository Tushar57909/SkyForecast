import os
import json
import pytest
from scripts.build_local_dataset import LocalDatasetBuilder

def test_file_discovery(tmp_path):
    raw_dir = tmp_path / "raw"
    datasets_dir = tmp_path / "datasets"
    
    for model in ["ecmwf", "gfs", "icon", "reference"]:
        model_dir = raw_dir / model
        model_dir.mkdir(parents=True)
        (model_dir / "test.csv").write_text("test")

    builder = LocalDatasetBuilder(str(raw_dir), str(datasets_dir))
    builder.scan_files()
    
    assert len(builder.raw_inventory) == 4
    sources = [i["source"] for i in builder.raw_inventory]
    assert set(sources) == {"ecmwf", "gfs", "icon", "reference"}

def test_empty_directory(tmp_path):
    raw_dir = tmp_path / "raw"
    datasets_dir = tmp_path / "datasets"
    builder = LocalDatasetBuilder(str(raw_dir), str(datasets_dir))
    builder.run()
    assert len(builder.raw_inventory) == 0
