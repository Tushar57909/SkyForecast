import {
  MapPin,
  Calendar,
  Clock,
  Compass,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import type { WeatherData } from '../../services/dataAdapter';
import { useTheme } from '../../context/ThemeContext';

interface ForecastControlStripProps {
  currentSample: WeatherData;
  activeModels: {
    ecmwf: boolean;
    gfs: boolean;
    icon: boolean;
    reference: boolean;
  };
  onToggleModel: (model: 'ecmwf' | 'gfs' | 'icon' | 'reference') => void;
  onSelectAllModels: () => void;
  onReset: () => void;
  onJumpToEvent: () => void;
}

export default function ForecastControlStrip({
  currentSample,
  activeModels,
  onToggleModel,
  onSelectAllModels,
  onReset,
  onJumpToEvent
}: ForecastControlStripProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const allSelected =
    activeModels.ecmwf &&
    activeModels.gfs &&
    activeModels.icon &&
    activeModels.reference;

  return (
    <div
      className={`flex-shrink-0 h-9 px-3 rounded-xl flex items-center justify-between gap-2 text-xs backdrop-blur-md shadow-sm border transition-colors ${
        isLight
          ? 'bg-white/90 border-sky-200/90 text-slate-800'
          : 'bg-[#0b162a]/90 border-slate-800/80 text-slate-200'
      }`}
    >
      {/* Left: Metadata Chips (Variable, Region, Location, Lead, Run) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {/* Variable */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold text-[11px] border whitespace-nowrap flex-shrink-0 ${
            isLight
              ? 'bg-sky-50 border-sky-200 text-sky-900'
              : 'bg-sky-950/60 border-sky-800/60 text-sky-300'
          }`}
        >
          <span className="text-[9px] uppercase tracking-wider opacity-60">VAR:</span>
          <span>Precipitation (mm)</span>
        </div>

        {/* Region */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold text-[11px] border whitespace-nowrap flex-shrink-0 ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}
        >
          <Compass className="w-3 h-3 text-sky-600" />
          <span>India</span>
        </div>

        {/* Location */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-bold text-[11px] border whitespace-nowrap flex-shrink-0 ${
            isLight
              ? 'bg-sky-100/80 border-sky-300 text-sky-950'
              : 'bg-sky-900/40 border-sky-700/60 text-sky-200'
          }`}
        >
          <MapPin className="w-3 h-3 text-sky-600" />
          <span>New Delhi</span>
          <span className="text-[10px] font-mono opacity-70">(28.61°N, 77.21°E)</span>
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
          <span>LEAD: 24h</span>
        </div>

        {/* Run */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[11px] border whitespace-nowrap flex-shrink-0 ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}
        >
          <Calendar className="w-3 h-3 text-emerald-500" />
          <span>RUN: Historical (269 cases)</span>
        </div>
      </div>

      {/* Right: Model Mode Toggles & Valid Time Badge */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Model Toggles Segment */}
        <div
          className={`flex items-center p-0.5 rounded-lg border text-[11px] font-semibold ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <button
            onClick={onSelectAllModels}
            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
              allSelected
                ? isLight
                  ? 'bg-white text-sky-900 shadow-xs font-bold'
                  : 'bg-slate-800 text-white font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ALL
          </button>

          <button
            onClick={() => onToggleModel('ecmwf')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
              activeModels.ecmwf
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle ECMWF (0.1° / 9km IFS)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
            <span>ECMWF</span>
          </button>

          <button
            onClick={() => onToggleModel('gfs')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
              activeModels.gfs
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle GFS (0.25° NOAA Global)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            <span>GFS</span>
          </button>

          <button
            onClick={() => onToggleModel('icon')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
              activeModels.icon
                ? 'bg-rose-500 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle ICON (DWD Global 13km)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
            <span>ICON</span>
          </button>

          <button
            onClick={() => onToggleModel('reference')}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
              activeModels.reference
                ? 'bg-slate-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle ERA5 Ground Truth Reference"
          >
            <span className="w-1.5 h-0.5 bg-slate-300" />
            <span>ERA5</span>
          </button>
        </div>

        {/* Valid Time Display */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-bold border ${
            isLight
              ? 'bg-sky-100/90 border-sky-300 text-sky-950 shadow-xs'
              : 'bg-sky-950/80 border-sky-800 text-sky-200'
          }`}
        >
          <span className="text-[9px] uppercase tracking-wider text-sky-600 font-sans">VALID:</span>
          <span>{currentSample.valid_time_formatted}</span>
        </div>

        {/* Quick jump to convective rain event */}
        <button
          onClick={onJumpToEvent}
          className={`p-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-colors ${
            isLight
              ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900 shadow-xs'
              : 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-800 text-amber-200'
          }`}
          title="Jump to 17 Sep 11:00 UTC Rain Event (6.1 mm)"
        >
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span className="hidden sm:inline">Rain Event</span>
        </button>

        {/* Reset button */}
        <button
          onClick={onReset}
          className={`p-1 rounded-lg border transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Reset to initial event state"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
