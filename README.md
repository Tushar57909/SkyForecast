# Hybrid AI–NWP Multi-Model Forecast Blending System

This repository contains the source code for the Smart India Hackathon (SIH) 2026 solution for Problem Statement 26081 (MoES, NCMRWF).

## 1. Problem Statement
**Title:** Hybrid AI–NWP Multi-Model Forecast Blending System
The system ingests forecasts from multiple Numerical Weather Prediction (NWP) models (ECMWF, GFS, ICON) and uses AI to dynamically determine the optimal weight for each model based on region, season, lead time, and recent performance.

## 2. System Architecture
The project follows a microservices architecture:
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, MapLibre GL JS
- **Backend:** Python, FastAPI, PostgreSQL
- **ML & Data Pipeline:** XGBoost, Celery, Redis, Pandas

## 3. Installation & Docker

Ensure you have Docker and Docker Compose installed.

1. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
2. Start the services:
   ```bash
   docker compose up -d
   ```

## Current Status
Foundation setup completed. Weather ingestion, ML engine and production dashboard are not implemented yet.
