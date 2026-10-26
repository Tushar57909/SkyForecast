import { useMemo } from 'react';
import type { WeatherData } from '../../services/dataAdapter';
import {
  Activity,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DisagreementInspectorProps {
  currentSample: WeatherData;
  activeModels: {
    ecmwf: boolean;
    gfs: boolean;
    icon: boolean;
    reference: boolean;
  };
  highlightedModel: 'ecmwf' | 'gfs' | 'icon' | 'reference' | null;
  onHighlightModel: (model: 'ecmwf' | 'gfs' | 'icon' | 'reference' | null) => void;
}

export default function DisagreementInspector({
  currentSample,
  activeModels,
  highlightedModel,
  onHighlightModel
}: DisagreementInspectorProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Model statistics & errors at current selected timestamp
  const stats = useMemo(() => {
    const { ecmwf, gfs, icon, reference } = currentSample;
    const modelVals = [ecmwf, gfs, icon];
    const min = Math.min(...modelVals);
    const max = Math.max(...modelVals);
    const spread = max - min;
    const mean = (ecmwf + gfs + icon) / 3;

    // Absolute error vs ERA5 REFERENCE
    const errEcmwf = Math.abs(ecmwf - reference);
    const errGfs = Math.abs(gfs - reference);
    const errIcon = Math.abs(icon - reference);
    const maxErr = Math.max(errEcmwf, errGfs, errIcon, 0.1);

    // Spread position: 0 to 4 mm+
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

  // Format compact valid time
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
      {/* ── 1. HEADER: SELECTED TIMESTEP & STATION ────────────────────────── */}
      <div
        className={`pb-1.5 border-b flex-shrink-0 flex items-center justify-between ${
          isLight ? 'border-sky-200/80' : 'border-slate-800'
        }`}
      >
        <div>
          <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-500">
            SELECTED TIMESTEP
          </span>
          <div className="font-mono text-xs font-black text-blue-600">
            {compactTime} (T+24h)
          </div>
        </div>

        <div
          className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono ${
            isLight
              ? 'bg-sky-50 border-sky-200 text-sky-950 font-bold'
              : 'bg-sky-950/60 border-sky-800 text-sky-200 font-bold'
          }`}
        >
          ERA5 REF: {currentSample.reference.toFixed(1)} mm
        </div>
      </div>

      {/* ── 2. MODEL DISAGREEMENT & SPREAD MODULE ─────────────────────────── */}
      <div
        className={`my-1 p-2 rounded-xl border flex-shrink-0 ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-extrabold uppercase tracking-wide">
              MODEL SPREAD (NWP DISAGREEMENT)
            </span>
          </div>
          <span className="font-mono text-xs font-black text-blue-600">
            {stats.spread.toFixed(1)} mm
          </span>
        </div>

        {/* Spread Low-High Bar */}
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
            style={{ left: `${stats.spreadPct}%` }}
          />

          <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mt-0.5 uppercase">
            <span>LOW SPREAD (0 mm)</span>
            <span className="text-slate-500 font-sans font-bold">
              Mean: {stats.mean.toFixed(1)} mm
            </span>
            <span>HIGH SPREAD (&gt;4 mm)</span>
          </div>
        </div>
      </div>

      {/* ── 3. MODEL VS ERA5 REFERENCE ERROR BARS ─────────────────────────── */}
      <div
        className={`my-0.5 p-2 rounded-xl border flex-shrink-0 ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wide">
            ERROR RELATIVE TO ERA5 REFERENCE
          </span>
          <span className="text-[8.5px] font-mono text-slate-400">|Forecast - ERA5|</span>
        </div>

        <div className="space-y-1 font-mono text-[10px]">
          {/* ECMWF */}
          <div
            onClick={() => onHighlightModel(highlightedModel === 'ecmwf' ? null : 'ecmwf')}
            className={`flex items-center gap-1.5 cursor-pointer p-0.5 rounded transition-all ${
              highlightedModel === 'ecmwf' ? 'bg-blue-100/60' : ''
            } ${!activeModels.ecmwf ? 'opacity-35 line-through' : ''}`}
          >
            <span className="w-11 text-[9px] font-bold text-blue-600">ECMWF</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (stats.errEcmwf / stats.maxErr) * 100)}%`
                }}
              />
            </div>
            <span className="w-9 text-right font-bold">{stats.errEcmwf.toFixed(1)} mm</span>
          </div>

          {/* GFS */}
          <div
            onClick={() => onHighlightModel(highlightedModel === 'gfs' ? null : 'gfs')}
            className={`flex items-center gap-1.5 cursor-pointer p-0.5 rounded transition-all ${
              highlightedModel === 'gfs' ? 'bg-emerald-100/60' : ''
            } ${!activeModels.gfs ? 'opacity-35 line-through' : ''}`}
          >
            <span className="w-11 text-[9px] font-bold text-emerald-600">GFS</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (stats.errGfs / stats.maxErr) * 100)}%`
                }}
              />
            </div>
            <span className="w-9 text-right font-bold">{stats.errGfs.toFixed(1)} mm</span>
          </div>

          {/* ICON */}
          <div
            onClick={() => onHighlightModel(highlightedModel === 'icon' ? null : 'icon')}
            className={`flex items-center gap-1.5 cursor-pointer p-0.5 rounded transition-all ${
              highlightedModel === 'icon' ? 'bg-rose-100/60' : ''
            } ${!activeModels.icon ? 'opacity-35 line-through' : ''}`}
          >
            <span className="w-11 text-[9px] font-bold text-rose-500">ICON</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (stats.errIcon / stats.maxErr) * 100)}%`
                }}
              />
            </div>
            <span className="w-9 text-right font-bold">{stats.errIcon.toFixed(1)} mm</span>
          </div>
        </div>
      </div>

      {/* ── 4. COMPACT MODEL COMPARISON TABLE ─────────────────────────────── */}
      <div
        className={`my-0.5 p-1.5 rounded-xl border flex-shrink-0 ${
          isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="text-[9px] font-extrabold uppercase tracking-wide text-slate-500 mb-1">
          NWP BENCHMARK AT VALID TIME
        </div>

        <table className="w-full text-left font-mono text-[9.5px]">
          <thead>
            <tr className="border-b text-[8.5px] uppercase tracking-wider text-slate-400">
              <th className="pb-0.5">Model</th>
              <th className="pb-0.5 text-right">Precip</th>
              <th className="pb-0.5 text-right">Error vs REF</th>
              <th className="pb-0.5 text-right">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr className={!activeModels.ecmwf ? 'opacity-35' : ''}>
              <td className="py-0.5 font-bold text-blue-600">ECMWF IFS</td>
              <td className="py-0.5 text-right">{currentSample.ecmwf.toFixed(1)} mm</td>
              <td className="py-0.5 text-right font-bold">-{stats.errEcmwf.toFixed(1)}</td>
              <td className="py-0.5 text-right text-amber-600 font-sans font-semibold">Under</td>
            </tr>
            <tr className={!activeModels.gfs ? 'opacity-35' : ''}>
              <td className="py-0.5 font-bold text-emerald-600">GFS NOAA</td>
              <td className="py-0.5 text-right">{currentSample.gfs.toFixed(1)} mm</td>
              <td className="py-0.5 text-right font-bold">-{stats.errGfs.toFixed(1)}</td>
              <td className="py-0.5 text-right text-amber-600 font-sans font-semibold">Under</td>
            </tr>
            <tr className={!activeModels.icon ? 'opacity-35' : ''}>
              <td className="py-0.5 font-bold text-rose-500">ICON DWD</td>
              <td className="py-0.5 text-right">{currentSample.icon.toFixed(1)} mm</td>
              <td className="py-0.5 text-right font-bold">-{stats.errIcon.toFixed(1)}</td>
              <td className="py-0.5 text-right text-amber-600 font-sans font-semibold">Under</td>
            </tr>
            <tr className={`font-bold ${!activeModels.reference ? 'opacity-35' : ''}`}>
              <td className="py-0.5 text-slate-600">ERA5 REF</td>
              <td className="py-0.5 text-right">{currentSample.reference.toFixed(1)} mm</td>
              <td className="py-0.5 text-right text-emerald-600">0.0</td>
              <td className="py-0.5 text-right text-slate-500 font-sans">Reference</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── 5. ADAPTIVE AI BLEND INNOVATION MODULE ────────────────────────── */}
      <div
        className={`p-2 rounded-xl border flex-shrink-0 ${
          isLight
            ? 'bg-gradient-to-b from-sky-50 to-blue-50/40 border-sky-200'
            : 'bg-gradient-to-b from-sky-950/40 to-blue-950/20 border-sky-800/60'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-[9.5px] font-black uppercase tracking-wide">
              WHY ADAPTIVE BLENDING IS NEEDED
            </span>
          </div>
          <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            PENDING ML EXECUTION
          </span>
        </div>

        <p className="text-[8.5px] leading-tight text-slate-600 dark:text-slate-300">
          Individual NWP models suffer intermittent convective biases (e.g. ECMWF & GFS missed 6.1mm rain event). PS 26081 uses ML dynamic weighting to dynamically blend models based on localized historical reliability.
        </p>

        {/* Architecture flow indicator */}
        <div className="mt-1.5 flex items-center justify-between text-[8px] font-mono">
          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-200">
            Multi-NWP Inputs
          </span>
          <span className="text-slate-400 font-bold">➔</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-950 font-bold border border-cyan-300">
            XGBoost Dynamic Weighting
          </span>
          <span className="text-slate-400 font-bold">➔</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
            Optimized Blend
          </span>
        </div>
      </div>
    </div>
  );
}
