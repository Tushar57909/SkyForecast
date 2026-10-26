import { useState, useMemo, useCallback } from 'react';
import ComparisonControlStrip from '../components/comparison/ComparisonControlStrip';
import MultiModelChart from '../components/comparison/MultiModelChart';
import DisagreementInspector from '../components/comparison/DisagreementInspector';
import ForecastTimeline from '../components/forecast/ForecastTimeline';
import {
  DEMO_DATA,
  type WeatherData
} from '../services/dataAdapter';

/**
 * Model Comparison Workstation (/comparison)
 * SIH Problem Statement 26081 — Multi-Model Meteorological Analysis Workstation
 *
 * Visually compares ECMWF IFS, GFS NOAA, and ICON DWD against ERA5 REFERENCE.
 * Single viewport workspace with ZERO page scrolling at 1366x768, 1440x900, 1920x1080.
 * Visually emphasizes NWP disagreement and why adaptive ML multi-model blending is needed.
 * Real 269 aligned historical cases used exclusively.
 */
export default function ModelComparison() {
  const samples = DEMO_DATA;

  // Default selection: convective rain event at 17 SEP 2026 11:00 UTC (index 184)
  const defaultEventIndex = useMemo(() => {
    const idx = samples.findIndex(s => s.valid_time_raw.includes('2026-09-17 11:00'));
    return idx !== -1 ? idx : 184;
  }, [samples]);

  const [selectedIndex, setSelectedIndex] = useState<number>(defaultEventIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [windowMode, setWindowMode] = useState<'48h' | '72h' | 'all'>('72h');

  // Active models visibility
  const [activeModels, setActiveModels] = useState({
    ecmwf: true,
    gfs: true,
    icon: true,
    reference: true
  });

  // Highlighted isolated model (clicking a model isolates its trajectory)
  const [highlightedModel, setHighlightedModel] = useState<'ecmwf' | 'gfs' | 'icon' | 'reference' | null>(null);

  const currentSample: WeatherData = samples[selectedIndex] || samples[0];

  // Toggle model visibility
  const handleToggleModel = useCallback((model: 'ecmwf' | 'gfs' | 'icon' | 'reference') => {
    setActiveModels(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
  }, []);

  // Isolate/highlight a specific model trajectory
  const handleHighlightModel = useCallback((model: 'ecmwf' | 'gfs' | 'icon' | 'reference' | null) => {
    setHighlightedModel(model);
    if (model) {
      // Ensure the highlighted model is active
      setActiveModels(prev => ({
        ...prev,
        [model]: true
      }));
    }
  }, []);

  // Show all models with equal weight
  const handleSelectAllModels = useCallback(() => {
    setActiveModels({
      ecmwf: true,
      gfs: true,
      icon: true,
      reference: true
    });
    setHighlightedModel(null);
  }, []);

  // Reset to default event
  const handleReset = useCallback(() => {
    setSelectedIndex(defaultEventIndex);
    setIsPlaying(false);
    handleSelectAllModels();
    setWindowMode('72h');
  }, [defaultEventIndex, handleSelectAllModels]);

  const handleJumpToEvent = useCallback(() => {
    setSelectedIndex(defaultEventIndex);
  }, [defaultEventIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <div className="w-full h-full min-h-0 overflow-hidden flex flex-col justify-between gap-2 select-none font-sans">
      {/* ── ROW 1: COMPARISON CONTROL STRIP ──────────────────────────────── */}
      <ComparisonControlStrip
        currentSample={currentSample}
        activeModels={activeModels}
        highlightedModel={highlightedModel}
        onToggleModel={handleToggleModel}
        onHighlightModel={handleHighlightModel}
        onSelectAllModels={handleSelectAllModels}
        windowMode={windowMode}
        onSelectWindowMode={setWindowMode}
        onJumpToEvent={handleJumpToEvent}
        onReset={handleReset}
      />

      {/* ── ROW 2: MAIN MULTI-MODEL DIVERGENCE CHART & INSPECTOR ──────────── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* Large Multi-Model Comparison Canvas (~67% width) */}
        <div className="lg:col-span-8 h-full min-h-0 overflow-hidden">
          <MultiModelChart
            samples={samples}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            activeModels={activeModels}
            highlightedModel={highlightedModel}
            onHighlightModel={handleHighlightModel}
            windowMode={windowMode}
          />
        </div>

        {/* Right Disagreement & Error Inspector Panel (~33% width) */}
        <div className="lg:col-span-4 h-full min-h-0 overflow-hidden">
          <DisagreementInspector
            currentSample={currentSample}
            activeModels={activeModels}
            highlightedModel={highlightedModel}
            onHighlightModel={handleHighlightModel}
          />
        </div>
      </div>

      {/* ── ROW 3: SYNCHRONIZED FORECAST TIMELINE ─────────────────────────── */}
      <ForecastTimeline
        samples={samples}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onReset={handleReset}
      />
    </div>
  );
}
