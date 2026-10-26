import { useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import type { WeatherData } from '../../services/dataAdapter';
import { useTheme } from '../../context/ThemeContext';

interface ForecastTimelineProps {
  samples: WeatherData[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export default function ForecastTimeline({
  samples,
  selectedIndex,
  onSelectIndex,
  isPlaying,
  onTogglePlay,
  onReset
}: ForecastTimelineProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      onSelectIndex((selectedIndex + 1) % samples.length);
    }, 750);

    return () => clearInterval(timer);
  }, [isPlaying, selectedIndex, samples.length, onSelectIndex]);

  // Helper to step backward/forward
  const handleStep = (delta: number) => {
    const nextIdx = Math.max(0, Math.min(samples.length - 1, selectedIndex + delta));
    onSelectIndex(nextIdx);
  };

  // Generate milestone ticks: Show 11 surrounding timestamps centered around selectedIndex
  // or key intervals with compact labels: "17 SEP", "11Z"
  const visibleTicks = useMemo(() => {
    // Show 13 time markers around the selected index
    const half = 6;
    let start = Math.max(0, selectedIndex - half);
    let end = Math.min(samples.length - 1, start + 12);
    if (end - start < 12) {
      start = Math.max(0, end - 12);
    }

    const ticks = [];
    for (let i = start; i <= end; i++) {
      const s = samples[i];
      if (!s) continue;

      // Extract day and hour, e.g. "17 SEP", "11Z"
      const dateParts = s.valid_time_raw.split(/[\sT]+/);
      const [dateStr, timeStr] = dateParts;
      const [, month, day] = (dateStr || '').split('-');
      const [hour] = (timeStr || '').split(':');

      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const mName = monthNames[parseInt(month, 10) - 1] || 'SEP';

      const isConvectivePeak = s.reference >= 6.0;

      ticks.push({
        index: i,
        dayStr: `${day} ${mName}`,
        hourStr: `${hour}Z`,
        precip: Math.max(s.ecmwf, s.gfs, s.icon, s.reference),
        refPrecip: s.reference,
        isConvectivePeak
      });
    }
    return ticks;
  }, [samples, selectedIndex]);

  return (
    <div
      className={`flex-shrink-0 h-13 px-3 py-1.5 rounded-xl cloud-card flex items-center justify-between gap-3 shadow-md border backdrop-blur-md transition-colors ${
        isLight ? 'bg-white/90 border-sky-200/90 text-slate-800' : 'bg-[#0a1528]/90 border-slate-800 text-slate-200'
      }`}
    >
      {/* ── LEFT: PLAYBACK CONTROLS (Section 10) ─────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all shadow-xs ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
          title={isPlaying ? 'Pause forecast timeline' : 'Auto-play timeline across cases'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <button
          onClick={() => handleStep(-1)}
          disabled={selectedIndex === 0}
          className={`p-1 rounded-lg border transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          } disabled:opacity-30`}
          title="Previous Timestep (-1h)"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleStep(1)}
          disabled={selectedIndex === samples.length - 1}
          className={`p-1 rounded-lg border transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          } disabled:opacity-30`}
          title="Next Timestep (+1h)"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onReset}
          className={`p-1 rounded-lg border transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Reset to default event"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── CENTER: INTERACTIVE HORIZONTAL TIMESTAMPS (Section 10) ────────── */}
      <div
        ref={timelineScrollRef}
        className="flex-1 min-w-0 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5"
      >
        {visibleTicks.map((tick) => {
          const isSelected = tick.index === selectedIndex;
          return (
            <div
              key={tick.index}
              onClick={() => onSelectIndex(tick.index)}
              className={`flex-1 min-w-[50px] max-w-[80px] py-0.5 px-1 rounded-lg text-center cursor-pointer transition-all border flex flex-col justify-center ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102 font-bold'
                  : tick.isConvectivePeak
                  ? isLight
                    ? 'bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100'
                    : 'bg-amber-950/40 border-amber-700 text-amber-200 hover:bg-amber-900/60'
                  : isLight
                  ? 'bg-white/80 border-slate-200 text-slate-600 hover:bg-sky-50 hover:border-sky-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div
                className={`text-[8px] leading-tight font-sans ${
                  isSelected ? 'text-blue-100 font-extrabold' : 'opacity-70'
                }`}
              >
                {tick.dayStr}
              </div>
              <div
                className={`text-[10px] font-mono leading-tight font-extrabold ${
                  isSelected ? 'text-white' : ''
                }`}
              >
                {tick.hourStr}
              </div>
              {tick.refPrecip > 0 && (
                <div
                  className={`text-[7.5px] font-mono leading-tight ${
                    isSelected ? 'text-blue-100 font-bold' : 'text-blue-600 font-semibold'
                  }`}
                >
                  {tick.refPrecip.toFixed(1)}mm
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── RIGHT: CONTINUOUS SCRUBBER SLIDER & INDEX COUNTER ──────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={0}
              max={samples.length - 1}
              value={selectedIndex}
              onChange={(e) => onSelectIndex(parseInt(e.target.value, 10))}
              className="w-24 sm:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              title="Scrub timeline across 269 historical cases"
            />
          </div>
          <span className="text-[9px] font-mono opacity-70">
            Case {selectedIndex + 1} / {samples.length}
          </span>
        </div>
      </div>
    </div>
  );
}
