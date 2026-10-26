import { useMemo } from 'react';
import type { WeatherData } from '../../services/dataAdapter';
import {
  MapPin,
  Activity,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ForecastInspectorProps {
  currentSample: WeatherData;
  activeModels: {
    ecmwf: boolean;
    gfs: boolean;
    icon: boolean;
    reference: boolean;
  };
  onToggleModel: (model: 'ecmwf' | 'gfs' | 'icon' | 'reference') => void;
}

export default function ForecastInspector({
  currentSample,
  activeModels,
  onToggleModel
}: ForecastInspectorProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // 1. Model agreement & spread calculation (ECMWF, GFS, ICON)
  const agreement = useMemo(() => {
    const { ecmwf, gfs, icon, reference } = currentSample;
    const modelVals = [ecmwf, gfs, icon];
    const min = Math.min(...modelVals);
    const max = Math.max(...modelVals);
    const spread = max - min;
    const mean = (ecmwf + gfs + icon) / 3;

    // Error vs Reference |forecast - ERA5|
    const errEcmwf = Math.abs(ecmwf - reference);
    const errGfs = Math.abs(gfs - reference);
    const errIcon = Math.abs(icon - reference);
    const maxErr = Math.max(errEcmwf, errGfs, errIcon, 0.1);

    // Spread position: 0 mm = 5%, 4 mm+ = 95%
    const spreadPct = Math.min(95, Math.max(5, (spread / 4) * 100));

    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      mean: Number(mean.toFixed(2)),
      spread: Number(spread.toFixed(2)),
      spreadPct,
      errEcmwf: Number(errEcmwf.toFixed(2)),
      errGfs: Number(errGfs.toFixed(2)),
      errIcon: Number(errIcon.toFixed(2)),
      maxErr
    };
  }, [currentSample]);

  // Extract compact valid time string (e.g., "17 SEP • 11:00 UTC")
  const compactTime = useMemo(() => {
    const formatted = currentSample.valid_time_formatted || '';
    const parts = formatted.split(' ');
    if (parts.length >= 5) {
      return `${parts[0]} ${parts[1]} • ${parts[3]} UTC`;
    }
    return formatted;
  }, [currentSample.valid_time_formatted]);

  return (
    <div
      className={`h-full min-h-0 overflow-hidden cloud-card p-2.5 flex flex-col justify-between shadow-xl backdrop-blur-xl transition-colors ${
        isLight ? 'text-slate-900' : 'text-slate-100'
      }`}
    >
      {/* ── HEADER: LOCATION & COORDINATES (Section 9) ────────────────────── */}
      <div
        className={`pb-1.5 border-b flex-shrink-0 flex items-center justify-between ${
          isLight ? 'border-sky-200/80' : 'border-slate-800'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span
              className={`text-xs font-black tracking-tight uppercase ${
                isLight ? 'text-sky-950' : 'text-white'
              }`}
            >
              NEW DELHI
            </span>
            <span className="text-[10px] font-mono opacity-60">VIDP</span>
          </div>
          <div
            className={`text-[9.5px] font-mono leading-none mt-0.5 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            28.6139°N 77.2090°E • Elev 216m
          </div>
        </div>

        {/* Valid time badge */}
        <div
          className={`px-2 py-0.5 rounded-lg text-right border ${
            isLight
              ? 'bg-sky-50 border-sky-200 text-sky-950'
              : 'bg-sky-950/60 border-sky-800 text-sky-200'
          }`}
        >
          <div className="text-[8.5px] uppercase tracking-wider text-sky-600 font-bold leading-none">
            VALID
          </div>
          <div className="text-[10px] font-mono font-bold leading-tight mt-0.5">
            {compactTime}
          </div>
        </div>
      </div>

      {/* ── SECTION 1: MODEL VALUES GRID (Section 9) ──────────────────────── */}
      <div className="flex-shrink-0 my-0.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">
            Model Values (24h Lead)
          </span>
          <span className="text-[8.5px] font-mono text-slate-400">Precip (mm)</span>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[11px]">
          {/* ECMWF */}
          <div
            onClick={() => onToggleModel('ecmwf')}
            className={`px-2 py-1 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
              activeModels.ecmwf
                ? isLight
                  ? 'bg-blue-50/80 border-blue-200 shadow-xs'
                  : 'bg-blue-950/40 border-blue-800'
                : 'opacity-40 bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
              <span className="font-bold text-[10px]">ECMWF</span>
            </div>
            <span className="font-mono font-black text-blue-600">
              {currentSample.ecmwf.toFixed(1)} mm
            </span>
          </div>

          {/* GFS */}
          <div
            onClick={() => onToggleModel('gfs')}
            className={`px-2 py-1 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
              activeModels.gfs
                ? isLight
                  ? 'bg-emerald-50/80 border-emerald-200 shadow-xs'
                  : 'bg-emerald-950/40 border-emerald-800'
                : 'opacity-40 bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
              <span className="font-bold text-[10px]">GFS</span>
            </div>
            <span className="font-mono font-black text-emerald-600">
              {currentSample.gfs.toFixed(1)} mm
            </span>
          </div>

          {/* ICON */}
          <div
            onClick={() => onToggleModel('icon')}
            className={`px-2 py-1 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
              activeModels.icon
                ? isLight
                  ? 'bg-rose-50/80 border-rose-200 shadow-xs'
                  : 'bg-rose-950/40 border-rose-800'
                : 'opacity-40 bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              <span className="font-bold text-[10px]">ICON</span>
            </div>
            <span className="font-mono font-black text-rose-600">
              {currentSample.icon.toFixed(1)} mm
            </span>
          </div>

          {/* ERA5 Reference */}
          <div
            onClick={() => onToggleModel('reference')}
            className={`px-2 py-1 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
              activeModels.reference
                ? isLight
                  ? 'bg-slate-100/90 border-slate-300 shadow-xs'
                  : 'bg-slate-800/60 border-slate-700'
                : 'opacity-40 bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-slate-600 flex-shrink-0" />
              <span className="font-bold text-[10px]">ERA5</span>
            </div>
            <span className="font-mono font-black text-slate-700">
              {currentSample.reference.toFixed(1)} mm
            </span>
          </div>
        </div>

        {/* AI Blend (Pending per Section 3 & 9) */}
        <div
          className={`mt-1 px-2 py-0.5 rounded-lg border border-dashed flex items-center justify-between ${
            isLight
              ? 'bg-sky-50/60 border-sky-200 text-sky-950'
              : 'bg-sky-950/30 border-sky-800/60 text-sky-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[10px] font-bold">AI BLEND</span>
          </div>
          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            PENDING
          </span>
        </div>
      </div>

      {/* ── SECTION 2: MODEL AGREEMENT & SPREAD (Section 12) ──────────────── */}
      <div
        className={`my-0.5 p-1.5 rounded-xl border flex-shrink-0 ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-600" />
            <span className="text-[9.5px] font-extrabold uppercase tracking-wide">
              MODEL SPREAD
            </span>
          </div>
          <span className="font-mono text-xs font-black text-blue-600">
            {agreement.spread.toFixed(1)} mm
          </span>
        </div>

        {/* Visual Spread Bar (LOW ─────●──────── HIGH) */}
        <div className="relative pt-0.5 pb-0.5">
          <div className="h-1.5 w-full bg-slate-200 rounded-full relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full"
              style={{ width: '100%' }}
            />
          </div>

          {/* Indicator Dot */}
          <div
            className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow-md -translate-x-1/2"
            style={{ left: `${agreement.spreadPct}%` }}
          />

          <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mt-0.5 uppercase">
            <span>LOW (0 mm)</span>
            <span className="text-slate-500 font-sans font-bold">
              Mean: {agreement.mean.toFixed(1)} mm
            </span>
            <span>HIGH (&gt;4 mm)</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: MODEL VS REFERENCE (ERROR BARS) (Section 13) ───────── */}
      <div
        className={`my-0.5 p-1.5 rounded-xl border flex-shrink-0 ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9.5px] font-extrabold uppercase tracking-wide">
            ERROR VS ERA5 (|Forecast - Ref|)
          </span>
          <span className="text-[8px] font-mono text-slate-400">Abs Error (mm)</span>
        </div>

        <div className="space-y-0.5 font-mono text-[9.5px]">
          {/* ECMWF Error */}
          <div className="flex items-center gap-1.5">
            <span className="w-10 text-[8.5px] font-bold text-blue-600">ECMWF</span>
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (agreement.errEcmwf / agreement.maxErr) * 100)}%`
                }}
              />
            </div>
            <span className="w-8 text-right font-bold">{agreement.errEcmwf.toFixed(1)}</span>
          </div>

          {/* GFS Error */}
          <div className="flex items-center gap-1.5">
            <span className="w-10 text-[8.5px] font-bold text-emerald-600">GFS</span>
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (agreement.errGfs / agreement.maxErr) * 100)}%`
                }}
              />
            </div>
            <span className="w-8 text-right font-bold">{agreement.errGfs.toFixed(1)}</span>
          </div>

          {/* ICON Error */}
          <div className="flex items-center gap-1.5">
            <span className="w-10 text-[8.5px] font-bold text-rose-500">ICON</span>
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (agreement.errIcon / agreement.maxErr) * 100)}%`
                }}
              />
            </div>
            <span className="w-8 text-right font-bold">{agreement.errIcon.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: FUTURE AI BLEND AREA (Section 14) ──────────────────── */}
      <div
        className={`p-1.5 rounded-xl border flex-shrink-0 ${
          isLight
            ? 'bg-gradient-to-b from-sky-50 to-blue-50/40 border-sky-200'
            : 'bg-gradient-to-b from-sky-950/40 to-blue-950/20 border-sky-800/60'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-600" />
            <span className="text-[9.5px] font-extrabold uppercase tracking-wide">
              AI BLEND ARCHITECTURE
            </span>
          </div>
          <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            PENDING ML EXECUTION
          </span>
        </div>

        {/* Future Flow Visualization: ECMWF/GFS/ICON -> DYNAMIC WEIGHTING -> BLENDED FORECAST */}
        <div className="flex items-center justify-between gap-1 text-[8.5px] font-mono">
          {/* Step 1: Input NWP Models */}
          <div className="flex-1 py-0.5 px-1 rounded-md bg-blue-50/90 border border-blue-200 text-center">
            <span className="font-extrabold text-blue-700 leading-tight">
              ECMWF • GFS • ICON
            </span>
          </div>

          <span className="text-slate-400 font-bold">→</span>

          {/* Step 2: Dynamic Weighting */}
          <div className="flex-1 py-0.5 px-1 rounded-md bg-cyan-50 border border-cyan-300 text-center">
            <span className="font-extrabold text-cyan-900 leading-tight">
              Dynamic Blend
            </span>
          </div>

          <span className="text-slate-400 font-bold">→</span>

          {/* Step 3: Blended Forecast */}
          <div className="flex-1 py-0.5 px-1 rounded-md bg-amber-50 border border-amber-300 text-center">
            <span className="font-extrabold text-amber-800 leading-tight">
              Awaiting Artifact
            </span>
          </div>
        </div>

        <div className="mt-0.5 text-[7.5px] text-center text-slate-500 font-sans">
          Models combined dynamically based on localized historical reliability.
        </div>
      </div>
    </div>
  );
}
