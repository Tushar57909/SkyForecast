import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  CloudRain,
  Droplets,
  Wind,
  Eye,
  Activity,
  Compass,
  Gauge,
  Thermometer,
  Cloud
} from 'lucide-react';
import WeatherMap from '../components/map/WeatherMap';
import {
  RainSunCloudIcon,
  RainCloudIcon,
  PartlyCloudyIcon,
  SunnyIcon,
  MoonStarsIcon
} from '../components/common/WeatherIcons';
import {
  DEMO_DATA,
  STATION_METADATA,
  type WeatherData
} from '../services/dataAdapter';
import { useTheme } from '../context/ThemeContext';

/**
 * Overview Section — Forecast Intelligence Workstation
 * Preserves the approved Overview page design with the cloudy weather theme,
 * circular confidence gauge, weather radar map, 24-hour timeline, and key observation modules.
 */
export default function Overview() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const samples = DEMO_DATA;

  // Default selection: convective rain event at 17 SEP 2026 11:00 UTC (index 184)
  const defaultIndex = useMemo(() => {
    const idx = samples.findIndex(s => s.valid_time_raw.includes('2026-09-17 11:00'));
    return idx !== -1 ? idx : 0;
  }, [samples]);

  const [selectedIndex, setSelectedIndex] = useState<number>(defaultIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentSample: WeatherData = samples[selectedIndex] || samples[0];

  const handleReset = useCallback(() => {
    setSelectedIndex(defaultIndex);
    setIsPlaying(false);
  }, [defaultIndex]);

  // Stepping controls
  const handleStep = (delta: number) => {
    setSelectedIndex(prev => Math.max(0, Math.min(samples.length - 1, prev + delta)));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Calculate real model consensus & agreement score
  const modelStats = useMemo(() => {
    if (!currentSample) return { min: 0, max: 0, spread: 0, mean: 0, agreementScore: 87 };
    const { ecmwf, gfs, icon } = currentSample;
    const vals = [ecmwf, gfs, icon];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const spread = max - min;
    const mean = (ecmwf + gfs + icon) / 3;
    const agreementScore = Math.max(65, Math.min(96, Math.round(92 - spread * 12)));
    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      spread: Number(spread.toFixed(2)),
      mean: Number(mean.toFixed(2)),
      agreementScore
    };
  }, [currentSample]);

  // 7 Horizon Milestone Samples (NOW, +3H, +6H, +9H, +12H, +18H, +24H)
  const timelineMilestones = useMemo(() => {
    const offsets = [
      { label: 'NOW', delta: 0, temp: 28, rainProb: 64, iconType: 'rain-sun' },
      { label: '+3H', delta: 3, temp: 29, rainProb: 45, iconType: 'cloudy-sun' },
      { label: '+6H', delta: 6, temp: 30, rainProb: 28, iconType: 'cloudy-sun' },
      { label: '+9H', delta: 9, temp: 32, rainProb: 15, iconType: 'sun' },
      { label: '+12H', delta: 12, temp: 31, rainProb: 12, iconType: 'sun' },
      { label: '+18H', delta: 18, temp: 31, rainProb: 8, iconType: 'moon' },
      { label: '+24H', delta: 24, temp: 28, rainProb: 6, iconType: 'moon' }
    ];

    return offsets.map(({ label, delta, temp, rainProb, iconType }) => {
      const idx = Math.min(samples.length - 1, selectedIndex + delta);
      const s = samples[idx] || currentSample;
      const maxPrecip = Math.max(s.ecmwf, s.gfs, s.icon, s.reference);
      return {
        label,
        index: idx,
        sample: s,
        temp,
        rainProb,
        iconType,
        maxPrecip,
        ecmwf: s.ecmwf,
        gfs: s.gfs,
        icon: s.icon,
        reference: s.reference
      };
    });
  }, [samples, selectedIndex, currentSample]);

  // Sine Wave Coordinates for the 24-hour timeline
  const wavePoints = useMemo(() => {
    return [
      { x: 50, y: 22 },
      { x: 150, y: 19 },
      { x: 250, y: 15 },
      { x: 350, y: 11 },
      { x: 450, y: 13 },
      { x: 550, y: 16 },
      { x: 650, y: 22 }
    ];
  }, []);

  const waveSvgPath = useMemo(() => {
    const p = wavePoints;
    let d = `M ${p[0].x} ${p[0].y}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i];
      const p1 = p[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [wavePoints]);

  const waveFillPath = useMemo(() => {
    return `${waveSvgPath} L 650 36 L 50 36 Z`;
  }, [waveSvgPath]);

  return (
    <div className={`w-full h-full min-h-0 overflow-hidden flex flex-col justify-between gap-2.5 select-none font-sans transition-colors duration-300 ${
      isLight ? 'text-slate-900' : 'text-slate-100'
    }`}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ROW 1: HEADER & FORECAST CONFIDENCE CIRCULAR GAUGE (AS IN PHOTO)     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-1">
        {/* Left: Titles & Meteorological Synthesis */}
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight leading-none ${
            isLight ? 'text-sky-950' : 'text-white'
          }`}>
            Forecast Intelligence
          </h1>
          <p className={`text-xs font-medium mt-1 ${
            isLight ? 'text-sky-800/80' : 'text-slate-400'
          }`}>
            AI-blended atmospheric forecast with multi-model agreement analysis
          </p>
          <div className={`flex items-center gap-2 text-[10px] mt-0.5 ${
            isLight ? 'text-sky-700' : 'text-slate-400'
          }`}>
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3 text-sky-600" />
              Updated 2 min ago
            </span>
            <span>•</span>
            <span>Next refresh 10 min</span>
          </div>
        </div>

        {/* Right: Circular Radial Forecast Confidence Gauge (Exact Match) */}
        <div className={`flex items-center gap-3.5 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-md transition-colors ${
          isLight
            ? 'bg-white/90 border border-sky-200/90 shadow-[0_4px_20px_rgba(2,132,199,0.12)]'
            : 'bg-[#0f1d35]/85 border border-slate-700/50'
        }`}>
          {/* Circular Progress Meter */}
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className={isLight ? 'text-sky-100' : 'text-slate-800'}
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-sky-600"
                strokeDasharray={`${modelStats.agreementScore}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute text-xs font-bold tracking-tight ${
              isLight ? 'text-sky-950 font-extrabold' : 'text-white'
            }`}>
              {modelStats.agreementScore}%
            </span>
          </div>

          {/* Description Text */}
          <div className="flex flex-col">
            <span className={`text-xs font-bold leading-tight ${
              isLight ? 'text-sky-950' : 'text-white'
            }`}>
              Forecast Confidence
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              High confidence
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ROW 2: MAP (~67%) + CURRENT CONDITIONS PANEL (~33%)                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-[250px] max-h-[410px] grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Weather Map Canvas (lg:col-span-8 = ~67% width) */}
        <div className="lg:col-span-8 h-full min-h-0">
          <WeatherMap
            currentSample={currentSample}
            selectedLocation={STATION_METADATA}
          />
        </div>

        {/* Right Current Conditions Panel (lg:col-span-4 = ~33% width) */}
        <div className="lg:col-span-4 h-full min-h-0 cloud-card p-3.5 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
          <div>
            {/* Header: Location & Station Navigation */}
            <div className={`flex items-center justify-between border-b pb-2 ${
              isLight ? 'border-sky-200/80' : 'border-slate-700/40'
            }`}>
              <span className={`text-xs font-bold ${
                isLight ? 'text-sky-950' : 'text-white'
              }`}>
                Current Conditions
              </span>
              <button
                onClick={() => navigate('/spatial')}
                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                  isLight ? 'text-sky-700 hover:text-sky-950' : 'text-slate-400 hover:text-sky-300'
                }`}
              >
                <span>New Delhi, India</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Primary Hero Display: Big 28°C + 3D Cloud Rain Illustration */}
            <div className="flex items-center justify-between mt-3 px-1">
              <div>
                <div className={`text-4xl font-black tracking-tight leading-none ${
                  isLight ? 'text-sky-950' : 'text-white'
                }`}>
                  28°C
                </div>
                <div className={`text-xs font-semibold mt-1 ${
                  isLight ? 'text-sky-700' : 'text-slate-400'
                }`}>
                  Feels like 30°C
                </div>
              </div>

              {/* Rich 3D Weather Icon from Reference Photo */}
              <div className="w-14 h-14 flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(2,132,199,0.35)]">
                <RainSunCloudIcon className="w-14 h-14" />
              </div>
            </div>

            {/* 4 Weather Conditions Metric Grid (As in Photo) */}
            <div className="mt-3.5 space-y-2 text-xs">
              {/* Rain Probability */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CloudRain className="w-4 h-4 text-sky-600" />
                  <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Rain Probability
                  </span>
                </div>
                <span className={`font-bold text-xs ${isLight ? 'text-sky-950 font-extrabold' : 'text-white'}`}>
                  64%
                </span>
              </div>

              {/* Humidity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Humidity
                  </span>
                </div>
                <span className={`font-bold text-xs ${isLight ? 'text-sky-950 font-extrabold' : 'text-white'}`}>
                  74%
                </span>
              </div>

              {/* Wind */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wind className="w-4 h-4 text-sky-600" />
                  <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Wind
                  </span>
                </div>
                <span className={`font-bold text-xs ${isLight ? 'text-sky-950 font-extrabold' : 'text-white'}`}>
                  14 km/h W-SW
                </span>
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Visibility
                  </span>
                </div>
                <span className={`font-bold text-xs ${isLight ? 'text-sky-950 font-extrabold' : 'text-white'}`}>
                  8.2 km
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Cloudy Weather Advisory Banner */}
          <div className={`mt-2.5 pt-2 border-t ${isLight ? 'border-sky-200/80' : 'border-slate-700/40'}`}>
            <div className={`p-2.5 rounded-xl flex items-center gap-2.5 ${
              isLight
                ? 'bg-gradient-to-r from-sky-100/90 to-blue-100/80 border border-sky-300/80 shadow-sm'
                : 'bg-gradient-to-r from-sky-950/60 to-blue-950/40 border border-sky-500/20'
            }`}>
              <RainCloudIcon className="w-5 h-5 flex-shrink-0" />
              <div className={`text-[11px] font-semibold leading-tight ${
                isLight ? 'text-sky-950' : 'text-slate-200'
              }`}>
                {currentSample.reference > 1.0
                  ? `Moderate rain expected in next 6 hours (${currentSample.reference.toFixed(1)} mm accumulated).`
                  : 'Overcast stratus cloud ceiling with light mist expected.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ROW 3: NEXT 24 HOURS TIMELINE WITH LUMINOUS SINE WAVE GRAPH         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 cloud-card px-4 py-2.5 flex flex-col justify-between shadow-xl">
        {/* Header Strip with Controls */}
        <div className={`flex items-center justify-between pb-1.5 border-b text-xs font-mono ${
          isLight ? 'border-sky-200/80' : 'border-slate-700/40'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span className={`font-bold text-xs tracking-wide ${isLight ? 'text-sky-950' : 'text-white'}`}>
              Next 24 Hours
            </span>
          </div>

          {/* Timeline Playback Controls & Timestamp */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                isPlaying
                  ? 'bg-amber-600 text-white'
                  : isLight
                  ? 'bg-white border border-sky-200 text-sky-900 hover:bg-sky-50 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => handleStep(-1)}
              className={`p-1 rounded-lg transition-colors ${
                isLight ? 'bg-white border border-sky-200 text-sky-900 hover:bg-sky-50 shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="-1 Hour"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleStep(1)}
              className={`p-1 rounded-lg transition-colors ${
                isLight ? 'bg-white border border-sky-200 text-sky-900 hover:bg-sky-50 shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="+1 Hour"
            >
              <ChevronRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleReset}
              className={`p-1 rounded-lg transition-colors ${
                isLight ? 'bg-white border border-sky-200 text-sky-900 hover:bg-sky-50 shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <div className={`ml-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
              isLight
                ? 'bg-sky-100/90 border border-sky-300 text-sky-900 shadow-sm'
                : 'bg-slate-800/90 border border-slate-700 text-sky-300'
            }`}>
              VALID: {currentSample.valid_time_formatted}
            </div>
          </div>
        </div>

        {/* 7 Time Columns with Continuous Luminous Sine Wave Curve */}
        <div className="relative pt-1">
          {/* SVG Continuous Spline Curve Across the Timeline */}
          <div className="absolute inset-x-0 top-6 h-8 pointer-events-none">
            <svg viewBox="0 0 700 36" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isLight ? '#0284c7' : '#38bdf8'} stopOpacity={isLight ? '0.22' : '0.35'} />
                  <stop offset="100%" stopColor={isLight ? '#0284c7' : '#38bdf8'} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Fill under wave */}
              <path d={waveFillPath} fill="url(#wave-gradient)" />
              {/* Spline line */}
              <path d={waveSvgPath} fill="none" stroke={isLight ? '#0284c7' : '#38bdf8'} strokeWidth="2.5" />
              {/* Milestone Dots */}
              {wavePoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke={isLight ? '#0284c7' : '#0284c7'}
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>

          {/* 7 Columns Content */}
          <div className="grid grid-cols-7 gap-2 relative z-10 text-center font-mono">
            {timelineMilestones.map((m, idx) => {
              const isCurrent = m.index === selectedIndex;
              return (
                <div
                  key={m.label + idx}
                  onClick={() => setSelectedIndex(m.index)}
                  className={`py-1 px-1 rounded-xl cursor-pointer transition-all ${
                    isCurrent
                      ? isLight
                        ? 'bg-sky-100/90 border border-sky-400 shadow-sm'
                        : 'bg-sky-900/40 border border-sky-400 shadow-sm'
                      : isLight
                      ? 'hover:bg-sky-100/50'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Timestamp Label */}
                  <div className={`text-[10px] font-bold uppercase ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {m.label}
                  </div>

                  {/* Weather Condition Icon */}
                  <div className="flex justify-center my-0.5 h-6 items-center">
                    {m.iconType === 'rain-sun' && <RainCloudIcon className="w-5 h-5" />}
                    {m.iconType === 'cloudy-sun' && <PartlyCloudyIcon className="w-5 h-5" />}
                    {m.iconType === 'sun' && <SunnyIcon className="w-5 h-5" />}
                    {m.iconType === 'moon' && <MoonStarsIcon className="w-5 h-5" />}
                  </div>

                  {/* Temperature */}
                  <div className={`text-xs font-extrabold mt-2 ${
                    isLight ? 'text-sky-950 font-black' : 'text-white'
                  }`}>
                    {m.temp}°C
                  </div>

                  {/* Rain Probability */}
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-sky-600">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{m.rainProb}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ROW 4: 4 BOTTOM INSIGHT MODULES (EXACTLY MATCHING PHOTO)             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Module 1: Weather Insights (3 Micro-Cards) */}
        <div className="cloud-card p-3 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              isLight ? 'text-sky-950' : 'text-white'
            }`}>
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              Weather Insights
            </span>
            <span className="text-[10px] text-sky-600 font-semibold cursor-pointer hover:underline">
              View all &gt;
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* Rainfall Trend */}
            <div className="cloud-tile p-1.5 flex flex-col justify-between">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center mb-1 ${
                isLight ? 'bg-sky-100 text-sky-700' : 'bg-sky-900/60 text-sky-400'
              }`}>
                <CloudRain className="w-3 h-3" />
              </div>
              <div className={`text-[9px] font-bold leading-tight ${isLight ? 'text-sky-950' : 'text-white'}`}>
                Rainfall Trend
              </div>
              <div className={`text-[8.5px] mt-0.5 leading-tight truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Moderate rain likely
              </div>
            </div>

            {/* Temperature Trend */}
            <div className="cloud-tile p-1.5 flex flex-col justify-between">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center mb-1 ${
                isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/60 text-amber-400'
              }`}>
                <Thermometer className="w-3 h-3" />
              </div>
              <div className={`text-[9px] font-bold leading-tight ${isLight ? 'text-sky-950' : 'text-white'}`}>
                Temp Trend
              </div>
              <div className={`text-[8.5px] mt-0.5 leading-tight truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Steady 28–32°C
              </div>
            </div>

            {/* Wind Pattern */}
            <div className="cloud-tile p-1.5 flex flex-col justify-between">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center mb-1 ${
                isLight ? 'bg-teal-100 text-teal-700' : 'bg-teal-900/60 text-teal-400'
              }`}>
                <Compass className="w-3 h-3" />
              </div>
              <div className={`text-[9px] font-bold leading-tight ${isLight ? 'text-sky-950' : 'text-white'}`}>
                Wind Pattern
              </div>
              <div className={`text-[8.5px] mt-0.5 leading-tight truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                W-SW 14 km/h
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Key Observations */}
        <div className="cloud-card p-3 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              isLight ? 'text-sky-950' : 'text-white'
            }`}>
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              Key Observations
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                <Activity className="w-3 h-3 text-emerald-600" />
                Monsoon Activity
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                isLight
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                  : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
              }`}>
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                <Cloud className="w-3 h-3 text-sky-600" />
                Cloud Cover
              </span>
              <span className={`font-bold ${isLight ? 'text-sky-950' : 'text-white'}`}>78%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                <Gauge className="w-3 h-3 text-amber-600" />
                Pressure (sea level)
              </span>
              <span className={`font-bold ${isLight ? 'text-sky-950' : 'text-white'}`}>1008 hPa</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                <Droplets className="w-3 h-3 text-blue-600" />
                Dew Point
              </span>
              <span className={`font-bold ${isLight ? 'text-sky-950' : 'text-white'}`}>24°C</span>
            </div>
          </div>
        </div>

        {/* Module 3: Recent Updates */}
        <div className="cloud-card p-3 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              isLight ? 'text-sky-950' : 'text-white'
            }`}>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Recent Updates
            </span>
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 truncate font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                Rainfall detected in Delhi NCR
              </span>
              <span className={`font-mono text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>2m ago</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 truncate font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                Model agreement high (&gt;87%)
              </span>
              <span className={`font-mono text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>6m ago</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 truncate font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                No severe storm warnings
              </span>
              <span className={`font-mono text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>12m ago</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 truncate font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                Satellite radar scan updated
              </span>
              <span className={`font-mono text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>18m ago</span>
            </div>
          </div>
        </div>

        {/* Module 4: Quick Actions */}
        <div className="cloud-card p-3 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              isLight ? 'text-sky-950' : 'text-white'
            }`}>
              Quick Actions
            </span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => navigate('/comparison')}
              className="w-full py-1 px-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-[11px] font-bold flex items-center justify-between transition-all shadow-sm"
            >
              <span>View Model Comparison</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigate('/spatial')}
              className={`w-full py-1 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-colors border ${
                isLight
                  ? 'bg-white hover:bg-sky-50 text-slate-800 border-sky-200/90 shadow-sm'
                  : 'bg-[#14233c] hover:bg-[#1c3154] text-slate-200 border-slate-700/60'
              }`}
            >
              <span>Explore Spatial Analysis</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className={`w-full py-1 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-colors border ${
                isLight
                  ? 'bg-white hover:bg-sky-50 text-slate-800 border-sky-200/90 shadow-sm'
                  : 'bg-[#14233c] hover:bg-[#1c3154] text-slate-200 border-slate-700/60'
              }`}
            >
              <span>Download Report</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>

            <button
              onClick={() => navigate('/alerts')}
              className={`w-full py-1 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-colors border ${
                isLight
                  ? 'bg-white hover:bg-sky-50 text-slate-800 border-sky-200/90 shadow-sm'
                  : 'bg-[#14233c] hover:bg-[#1c3154] text-slate-200 border-slate-700/60'
              }`}
            >
              <span>Set Alert</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
