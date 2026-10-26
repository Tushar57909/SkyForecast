import { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Clock } from 'lucide-react';
import type { WeatherData } from '../../services/dataAdapter';

interface TimelineScrubberProps {
  samples: WeatherData[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
}

export default function TimelineScrubber({
  samples,
  selectedIndex,
  onSelectIndex,
  hoveredIndex,
  onHoverIndex
}: TimelineScrubberProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const currentSample = samples[activeIndex] || samples[0];

  // Auto-play stepper through historical timeline
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = window.setInterval(() => {
        onSelectIndex((selectedIndex + 1) % samples.length);
      }, 500);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, selectedIndex, samples.length, onSelectIndex]);

  // Extract date segments for header milestones
  const dateSegments = useMemo(() => {
    const segments: Array<{ dateStr: string; startIndex: number; count: number }> = [];
    let curDate = '';
    let curStart = 0;
    let curCount = 0;

    samples.forEach((s, idx) => {
      if (s.valid_date_str !== curDate) {
        if (curCount > 0) {
          segments.push({ dateStr: curDate, startIndex: curStart, count: curCount });
        }
        curDate = s.valid_date_str;
        curStart = idx;
        curCount = 1;
      } else {
        curCount++;
      }
    });
    if (curCount > 0) {
      segments.push({ dateStr: curDate, startIndex: curStart, count: curCount });
    }
    return segments;
  }, [samples]);

  const handleStep = (delta: number) => {
    const next = Math.max(0, Math.min(samples.length - 1, selectedIndex + delta));
    onSelectIndex(next);
  };

  const handleResetToStart = () => {
    setIsPlaying(false);
    onSelectIndex(0);
  };

  // Jump directly to key meteorological event (Sep 17, 11:00 UTC with 6.1mm ERA5)
  const handleJumpToPeakEvent = () => {
    const peakIdx = samples.findIndex(s => s.reference >= 5.0 || s.valid_time_raw.includes('2026-09-17 11:00'));
    if (peakIdx !== -1) {
      onSelectIndex(peakIdx);
    }
  };

  return (
    <div className="w-full bg-[#070e1b] border border-slate-800 rounded-lg p-2.5 font-mono select-none">
      {/* ── TOP CONTROLS & SELECTED TIMESTAMP BADGE ────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
        {/* Playback & Step Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Scrubbing' : 'Play Timeline'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={() => handleStep(-1)}
            disabled={selectedIndex <= 0}
            title="Step Back -1 Hour"
            className="p-1 rounded bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleStep(1)}
            disabled={selectedIndex >= samples.length - 1}
            title="Step Forward +1 Hour"
            className="p-1 rounded bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetToStart}
            title="Reset to First Sample (09 Sep 19:00 UTC)"
            className="p-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleJumpToPeakEvent}
            title="Jump to Convective Rain Event (17 Sep 11:00 UTC)"
            className="px-2 py-1 rounded bg-sky-950/80 border border-sky-700/50 hover:bg-sky-900 text-[10px] text-sky-300 font-semibold transition-colors"
          >
            Peak Rain (17 Sep 11Z)
          </button>
        </div>

        {/* Selected Valid Time Display */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">VALID TIME:</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-sky-950/70 border border-sky-600/60 text-sky-200 text-xs font-bold tracking-wide flex items-center gap-2 shadow-sm">
            <span>{currentSample ? currentSample.valid_time_formatted : 'SELECTING...'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-800/60 text-sky-300 font-normal">
              {activeIndex + 1}/{samples.length}
            </span>
          </div>

          <div className="text-[10px] text-slate-400">
            INIT: <span className="text-slate-300">{currentSample ? currentSample.init_time_formatted : ''}</span>
          </div>
        </div>
      </div>

      {/* ── DATE TRACK HEADER (NO OVERCROWDING) ─────────────────────────── */}
      <div className="relative w-full flex h-5 border-b border-slate-800/60 text-[10px] text-slate-400 font-semibold overflow-hidden">
        {dateSegments.map(seg => {
          const widthPercent = (seg.count / samples.length) * 100;
          return (
            <div
              key={seg.dateStr + seg.startIndex}
              style={{ width: `${widthPercent}%` }}
              className="border-r border-slate-800/80 pl-1 flex items-center justify-start overflow-hidden whitespace-nowrap text-slate-400 bg-slate-900/40"
            >
              <span className="truncate">{seg.dateStr.replace(' 2026', '')}</span>
            </div>
          );
        })}
      </div>

      {/* ── INTERACTIVE SCRUBBER BAR (269 TEST SAMPLES) ─────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full h-11 bg-[#040811] cursor-pointer group mt-1 rounded overflow-hidden"
        onMouseLeave={() => onHoverIndex(null)}
      >
        {/* Sample tick columns & rain intensity bars */}
        <div className="absolute inset-0 flex items-end">
          {samples.map((sample, idx) => {
            const isSelected = idx === selectedIndex;
            const isHovered = idx === hoveredIndex;
            const maxPrecip = Math.max(sample.ecmwf, sample.gfs, sample.icon, sample.reference);
            const barHeightPercent = maxPrecip > 0 ? Math.min(100, Math.max(15, (maxPrecip / 6.1) * 90)) : 6;

            let barColor = 'bg-slate-800';
            if (maxPrecip > 3.0) {
              barColor = 'bg-red-500';
            } else if (maxPrecip > 1.0) {
              barColor = 'bg-amber-400';
            } else if (maxPrecip > 0.0) {
              barColor = 'bg-sky-400';
            }

            return (
              <div
                key={sample.valid_time_raw}
                onClick={() => onSelectIndex(idx)}
                onMouseEnter={() => onHoverIndex(idx)}
                style={{ width: `${100 / samples.length}%` }}
                className={`h-full flex items-end justify-center transition-colors ${
                  isSelected ? 'bg-sky-500/20' : isHovered ? 'bg-slate-700/30' : 'hover:bg-slate-800/50'
                }`}
              >
                {/* Hourly Precipitation Indicator Bar */}
                <div
                  style={{ height: `${barHeightPercent}%` }}
                  className={`w-full mx-[0.5px] rounded-t-[1px] transition-all ${
                    isSelected ? 'bg-white' : barColor
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Selected Scrubber Needle */}
        <div
          style={{
            left: `${((selectedIndex + 0.5) / samples.length) * 100}%`
          }}
          className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_#38bdf8] pointer-events-none z-10 -translate-x-1/2"
        >
          <div className="w-2.5 h-2.5 bg-sky-400 border border-white rounded-full -translate-x-[4px] -translate-y-1 shadow-md" />
        </div>

        {/* Hover Needle */}
        {hoveredIndex !== null && hoveredIndex !== selectedIndex && (
          <div
            style={{
              left: `${((hoveredIndex + 0.5) / samples.length) * 100}%`
            }}
            className="absolute top-0 bottom-0 w-[1.5px] bg-sky-300/70 border-dashed pointer-events-none z-10 -translate-x-1/2"
          >
            <div className="w-2 h-2 bg-sky-200 rounded-full -translate-x-[3px] -translate-y-1 opacity-70" />
          </div>
        )}
      </div>

      {/* ── FOOTER: SPARKLINE SCALE & METEOROLOGICAL HINT ───────────────── */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[1px] bg-slate-800 inline-block" /> Dry (0.0mm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[1px] bg-sky-400 inline-block" /> Light (&lt;1mm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[1px] bg-amber-400 inline-block" /> Mod (&gt;1mm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[1px] bg-red-500 inline-block" /> Heavy (&gt;3mm)
          </span>
        </div>
        <div>
          Click timeline to lock step • Hover to inspect point values
        </div>
      </div>
    </div>
  );
}
