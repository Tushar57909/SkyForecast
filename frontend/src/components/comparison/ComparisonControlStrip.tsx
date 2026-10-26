import {
  BarChart3,
  MapPin,
  Clock,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import type { WeatherData } from '../../services/dataAdapter';
import { useTheme } from '../../context/ThemeContext';

interface ComparisonControlStripProps {
  currentSample: WeatherData;
  activeModels: {
    ecmwf: boolean;
    gfs: boolean;
    icon: boolean;
    reference: boolean;
  };
  highlightedModel: 'ecmwf' | 'gfs' | 'icon' | 'reference' | null;
  onToggleModel: (model: 'ecmwf' | 'gfs' | 'icon' | 'reference') => void;
  onHighlightModel: (model: 'ecmwf' | 'gfs' | 'icon' | 'reference' | null) => void;
  onSelectAllModels: () => void;
  windowMode: '48h' | '72h' | 'all';
  onSelectWindowMode: (mode: '48h' | '72h' | 'all') => void;
  onJumpToEvent: () => void;
  onReset: () => void;
}

export default function ComparisonControlStrip({
  currentSample,
  activeModels,
  highlightedModel,
  onToggleModel,
  onHighlightModel,
  onSelectAllModels,
  windowMode,
  onSelectWindowMode,
  onJumpToEvent,
  onReset
}: ComparisonControlStripProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const allActive =
    activeModels.ecmwf &&
    activeModels.gfs &&
    activeModels.icon &&
    activeModels.reference &&
    highlightedModel === null;

  return (
    <div
      className={`flex-shrink-0 h-9 px-3 rounded-xl flex items-center justify-between gap-2 text-xs backdrop-blur-md shadow-sm border transition-colors ${
        isLight
          ? 'bg-white/90 border-sky-200/90 text-slate-800'
          : 'bg-[#0b162a]/90 border-slate-800/80 text-slate-200'
      }`}
    >
      {/* ── LEFT: WORKSTATION CONTEXT CHIPS ───────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 font-extrabold text-xs text-sky-950 dark:text-white whitespace-nowrap flex-shrink-0">
          <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Multi-NWP Comparison</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        {/* Station */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[11px] border whitespace-nowrap flex-shrink-0 ${
            isLight
              ? 'bg-sky-50 border-sky-200 text-sky-950'
              : 'bg-sky-950/60 border-sky-800/60 text-sky-200'
          }`}
        >
          <MapPin className="w-3 h-3 text-sky-600" />
          <span>New Delhi</span>
          <span className="text-[10px] font-mono opacity-65">(VIDP • 28.61°N)</span>
        </div>

        {/* Variable */}
        <div
          className={`px-2 py-0.5 rounded-lg font-mono text-[11px] border whitespace-nowrap flex-shrink-0 ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}
        >
          <span>Precipitation (mm)</span>
        </div>

        {/* Lead */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[11px] border whitespace-nowrap flex-shrink-0 ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}
        >
          <Clock className="w-3 h-3 text-amber-500" />
          <span>24h Lead</span>
        </div>
      </div>

      {/* ── RIGHT: MODEL TOGGLE / HIGHLIGHT SYSTEM + WINDOW + CONTROLS ────── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Model Toggles Segment */}
        <div
          className={`flex items-center p-0.5 rounded-lg border text-[11px] font-semibold ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          {/* ALL Button */}
          <button
            onClick={onSelectAllModels}
            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
              allActive
                ? isLight
                  ? 'bg-white text-sky-900 shadow-xs font-bold'
                  : 'bg-slate-800 text-white font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Show all models with equal weight"
          >
            ALL
          </button>

          {/* ECMWF */}
          <button
            onClick={() => onHighlightModel(highlightedModel === 'ecmwf' ? null : 'ecmwf')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
              highlightedModel === 'ecmwf'
                ? 'bg-blue-600 text-white font-black shadow-xs ring-2 ring-blue-300'
                : activeModels.ecmwf
                ? 'text-blue-700 hover:bg-blue-50 font-bold'
                : 'text-slate-400 line-through'
            }`}
            title="Click to isolate/highlight ECMWF (0.1° IFS)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>ECMWF</span>
          </button>

          {/* GFS */}
          <button
            onClick={() => onHighlightModel(highlightedModel === 'gfs' ? null : 'gfs')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
              highlightedModel === 'gfs'
                ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-300'
                : activeModels.gfs
                ? 'text-emerald-700 hover:bg-emerald-50 font-bold'
                : 'text-slate-400 line-through'
            }`}
            title="Click to isolate/highlight GFS (0.25° NOAA)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>GFS</span>
          </button>

          {/* ICON */}
          <button
            onClick={() => onHighlightModel(highlightedModel === 'icon' ? null : 'icon')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
              highlightedModel === 'icon'
                ? 'bg-rose-500 text-white font-black shadow-xs ring-2 ring-rose-300'
                : activeModels.icon
                ? 'text-rose-700 hover:bg-rose-50 font-bold'
                : 'text-slate-400 line-through'
            }`}
            title="Click to isolate/highlight ICON (13km DWD)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>ICON</span>
          </button>

          {/* ERA5 REFERENCE */}
          <button
            onClick={() => onToggleModel('reference')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
              activeModels.reference
                ? 'text-slate-700 font-bold hover:bg-slate-200'
                : 'text-slate-400 line-through'
            }`}
            title="Toggle ERA5 Reference Trajectory"
          >
            <span className="w-2 h-0.5 bg-slate-600" />
            <span>ERA5 REF</span>
          </button>
        </div>

        {/* Window Selector */}
        <div
          className={`flex items-center p-0.5 rounded-lg border text-[10px] font-semibold ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <button
            onClick={() => onSelectWindowMode('48h')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              windowMode === '48h'
                ? 'bg-white shadow-xs text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            48h
          </button>
          <button
            onClick={() => onSelectWindowMode('72h')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              windowMode === '72h'
                ? 'bg-white shadow-xs text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            72h
          </button>
          <button
            onClick={() => onSelectWindowMode('all')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              windowMode === 'all'
                ? 'bg-white shadow-xs text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All (269)
          </button>
        </div>

        {/* Valid time badge */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[10.5px] font-bold border whitespace-nowrap ${
            isLight
              ? 'bg-sky-100/90 border-sky-300 text-sky-950 shadow-xs'
              : 'bg-sky-950/80 border-sky-800 text-sky-200'
          }`}
        >
          <span className="text-[8.5px] uppercase tracking-wider text-sky-600 font-sans">
            VALID:
          </span>
          <span>{currentSample.valid_time_formatted}</span>
        </div>

        {/* Jump to convective event */}
        <button
          onClick={onJumpToEvent}
          className={`px-2 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-colors ${
            isLight
              ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900 shadow-xs'
              : 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-800 text-amber-200'
          }`}
          title="Jump to 17 Sep 11:00 UTC Rain Event"
        >
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span className="hidden sm:inline">17 Sep Rain Event</span>
        </button>

        {/* Reset button */}
        <button
          onClick={onReset}
          className={`p-1 rounded-lg border transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Reset comparison state"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
