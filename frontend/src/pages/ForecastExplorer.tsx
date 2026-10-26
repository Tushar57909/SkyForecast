import { useState, useMemo, useCallback } from 'react';
import ForecastControlStrip from '../components/forecast/ForecastControlStrip';
import ForecastMap from '../components/forecast/ForecastMap';
import ForecastInspector from '../components/forecast/ForecastInspector';
import ForecastTimeline from '../components/forecast/ForecastTimeline';
import ModelComparisonChart from '../components/forecast/ModelComparisonChart';
import {
  DEMO_DATA,
  type WeatherData
} from '../services/dataAdapter';

/**
 * Forecast Workspace (/forecast)
 * SIH Problem Statement 26081 — Multi-Model Meteorological Analysis Workstation
 *
 * MAP + TIME + MODELS + POINT ANALYSIS
 * Viewport: Strict 100vh with zero vertical scrollbars at 1366x768, 1440x900, 1920x1080.
 * Uses real 269 aligned historical test cases for New Delhi (Safdarjung, 24h lead).
 * Real models: ECMWF, GFS, ICON vs ERA5 reference.
 * AI Blend status: Truthfully displayed as PENDING ML EXECUTION.
 */
export default function ForecastExplorer() {
  const samples = DEMO_DATA;

  // Default selection: convective rain event at 17 SEP 2026 11:00 UTC (index 184)
  const defaultEventIndex = useMemo(() => {
    const idx = samples.findIndex(s => s.valid_time_raw.includes('2026-09-17 11:00'));
    return idx !== -1 ? idx : 184;
  }, [samples]);

  const [selectedIndex, setSelectedIndex] = useState<number>(defaultEventIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isStationSelected, setIsStationSelected] = useState<boolean>(true);

  // Active Model Line Visibility States (Section 8)
  const [activeModels, setActiveModels] = useState({
    ecmwf: true,
    gfs: true,
    icon: true,
    reference: true
  });

  const currentSample: WeatherData = samples[selectedIndex] || samples[0];

  // Toggle individual model
  const handleToggleModel = useCallback((model: 'ecmwf' | 'gfs' | 'icon' | 'reference') => {
    setActiveModels(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
  }, []);

  // Select all models
  const handleSelectAllModels = useCallback(() => {
    setActiveModels({
      ecmwf: true,
      gfs: true,
      icon: true,
      reference: true
    });
  }, []);

  // Reset to default convective test case
  const handleReset = useCallback(() => {
    setSelectedIndex(defaultEventIndex);
    setIsPlaying(false);
    setIsStationSelected(true);
    handleSelectAllModels();
  }, [defaultEventIndex, handleSelectAllModels]);

  const handleJumpToEvent = useCallback(() => {
    setSelectedIndex(defaultEventIndex);
    setIsStationSelected(true);
  }, [defaultEventIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <div className="w-full h-full min-h-0 overflow-hidden flex flex-col justify-between gap-2 select-none font-sans">
      {/* ── ROW 1: FORECAST CONTROL STRIP (Section 5) ────────────────────── */}
      <ForecastControlStrip
        currentSample={currentSample}
        activeModels={activeModels}
        onToggleModel={handleToggleModel}
        onSelectAllModels={handleSelectAllModels}
        onReset={handleReset}
        onJumpToEvent={handleJumpToEvent}
      />

      {/* ── ROW 2: MAIN WORKSPACE (HERO MAP + FORECAST INSPECTOR) (Section 4, 6, 9) ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* Map Hero Canvas (lg:col-span-8 = ~67% width) */}
        <div className="lg:col-span-8 h-full min-h-0 overflow-hidden">
          <ForecastMap
            currentSample={currentSample}
            activeModels={activeModels}
            onSelectStation={() => setIsStationSelected(true)}
            isStationSelected={isStationSelected}
          />
        </div>

        {/* Right Inspector Panel (lg:col-span-4 = ~33% width) */}
        <div className="lg:col-span-4 h-full min-h-0 overflow-hidden">
          <ForecastInspector
            currentSample={currentSample}
            activeModels={activeModels}
            onToggleModel={handleToggleModel}
          />
        </div>
      </div>

      {/* ── ROW 3: FORECAST TIMELINE (Section 10) ────────────────────────── */}
      <ForecastTimeline
        samples={samples}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onReset={handleReset}
      />

      {/* ── ROW 4: MODEL COMPARISON CHART (Section 11) ───────────────────── */}
      <ModelComparisonChart
        samples={samples}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        activeModels={activeModels}
        onToggleModel={handleToggleModel}
      />
    </div>
  );
}
