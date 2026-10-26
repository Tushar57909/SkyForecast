import { useMemo, useState, useRef } from 'react';
import type { WeatherData } from '../../services/dataAdapter';
import { useTheme } from '../../context/ThemeContext';
import { BarChart3 } from 'lucide-react';

interface ModelComparisonChartProps {
  samples: WeatherData[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  activeModels: {
    ecmwf: boolean;
    gfs: boolean;
    icon: boolean;
    reference: boolean;
  };
  onToggleModel: (model: 'ecmwf' | 'gfs' | 'icon' | 'reference') => void;
}

export default function ModelComparisonChart({
  samples,
  selectedIndex,
  onSelectIndex,
  activeModels,
  onToggleModel
}: ModelComparisonChartProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const svgRef = useRef<SVGSVGElement>(null);

  // View window: 48h (48 cases), 72h (72 cases), or 'all' (269 cases)
  const [windowMode, setWindowMode] = useState<'48h' | '72h' | 'all'>('72h');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compute slice of data based on windowMode and selectedIndex
  const { visibleData, startIndex, endIndex } = useMemo(() => {
    if (windowMode === 'all') {
      return {
        visibleData: samples,
        startIndex: 0,
        endIndex: samples.length - 1
      };
    }

    const windowSize = windowMode === '48h' ? 48 : 72;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(0, selectedIndex - half);
    let end = Math.min(samples.length - 1, start + windowSize - 1);
    if (end - start < windowSize - 1) {
      start = Math.max(0, end - windowSize + 1);
    }

    return {
      visibleData: samples.slice(start, end + 1),
      startIndex: start,
      endIndex: end
    };
  }, [samples, selectedIndex, windowMode]);

  // Max precipitation value for Y-axis scaling (at least 7 mm for the convective peak)
  const maxPrecip = useMemo(() => {
    let max = 7.0;
    for (const d of visibleData) {
      max = Math.max(max, d.ecmwf, d.gfs, d.icon, d.reference);
    }
    return Math.ceil(max * 1.15); // +15% margin
  }, [visibleData]);

  // SVG Chart Geometry
  const chartWidth = 900;
  const chartHeight = 110;
  const padding = { top: 12, right: 20, bottom: 22, left: 35 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Coordinate mappers
  const getX = (idxInVisible: number) => {
    if (visibleData.length <= 1) return padding.left;
    return padding.left + (idxInVisible / (visibleData.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return padding.top + innerHeight - (Math.max(0, val) / maxPrecip) * innerHeight;
  };

  // Build SVG Paths
  const paths = useMemo(() => {
    const makePath = (field: 'ecmwf' | 'gfs' | 'icon' | 'reference') => {
      if (visibleData.length === 0) return '';
      return visibleData.reduce((acc, d, i) => {
        const x = getX(i);
        const y = getY(d[field]);
        return `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }, '');
    };

    return {
      ecmwf: makePath('ecmwf'),
      gfs: makePath('gfs'),
      icon: makePath('icon'),
      reference: makePath('reference')
    };
  }, [visibleData, maxPrecip]);

  // Selected item and its X coordinate
  const currentItemInVisible = selectedIndex >= startIndex && selectedIndex <= endIndex;
  const selectedX = currentItemInVisible ? getX(selectedIndex - startIndex) : null;

  // Active sample to display in tooltip (either hover or selected)
  const activeTooltipIndex = hoverIndex !== null ? hoverIndex : selectedIndex;
  const activeTooltipSample = samples[activeTooltipIndex] || samples[0];

  // Mouse move handler over SVG to synchronize hovering
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || visibleData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clientX - (padding.left / chartWidth) * rect.width) / ((innerWidth / chartWidth) * rect.width)));
    const targetIdxInVisible = Math.round(ratio * (visibleData.length - 1));
    const globalIdx = Math.max(0, Math.min(samples.length - 1, startIndex + targetIdxInVisible));
    setHoverIndex(globalIdx);
    onSelectIndex(globalIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || visibleData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clientX - (padding.left / chartWidth) * rect.width) / ((innerWidth / chartWidth) * rect.width)));
    const targetIdxInVisible = Math.round(ratio * (visibleData.length - 1));
    const globalIdx = Math.max(0, Math.min(samples.length - 1, startIndex + targetIdxInVisible));
    onSelectIndex(globalIdx);
  };

  // Generate X-axis ticks (e.g. 6-7 ticks)
  const xTicks = useMemo(() => {
    const ticks = [];
    const count = Math.min(7, visibleData.length);
    for (let i = 0; i < count; i++) {
      const idxInVis = Math.round((i / (count - 1)) * (visibleData.length - 1));
      const s = visibleData[idxInVis];
      if (s) {
        // e.g. "17 SEP 12Z"
        const parts = s.valid_time_raw.split(/[\sT]+/);
        const [dStr, tStr] = parts;
        const [, m, d] = (dStr || '').split('-');
        const [h] = (tStr || '').split(':');
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const label = `${d} ${months[parseInt(m, 10) - 1] || 'SEP'} ${h}Z`;
        ticks.push({
          x: getX(idxInVis),
          label
        });
      }
    }
    return ticks;
  }, [visibleData]);

  // Y-axis grid lines: 0, 2, 4, 6 mm
  const yTicks = useMemo(() => {
    const ticks = [0];
    const step = maxPrecip > 8 ? 4 : 2;
    for (let v = step; v <= maxPrecip; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [maxPrecip]);

  return (
    <div
      className={`flex-shrink-0 h-[155px] px-3.5 py-1.5 rounded-xl cloud-card flex flex-col justify-between shadow-md border backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/90 border-sky-200/90 text-slate-900'
          : 'bg-[#0a1528]/90 border-slate-800 text-slate-100'
      }`}
    >
      {/* ── HEADER STRIP: TITLE + MODEL TOGGLE LEGEND + WINDOW MODE ─────── */}
      <div
        className={`flex items-center justify-between pb-1 border-b text-xs flex-shrink-0 ${
          isLight ? 'border-sky-200/80' : 'border-slate-800'
        }`}
      >
        {/* Left: Title & Variable */}
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-extrabold uppercase tracking-wide text-xs">
            MODEL FORECAST COMPARISON
          </span>
          <span className="text-[10px] font-mono opacity-60">
            (Precipitation mm • Safdarjung AWS)
          </span>
        </div>

        {/* Center: Model Toggles Legend (Section 8 & 11) */}
        <div className="flex items-center gap-2 text-[10px] font-semibold">
          {/* ECMWF */}
          <button
            onClick={() => onToggleModel('ecmwf')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
              activeModels.ecmwf
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>ECMWF</span>
          </button>

          {/* GFS */}
          <button
            onClick={() => onToggleModel('gfs')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
              activeModels.gfs
                ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>GFS</span>
          </button>

          {/* ICON */}
          <button
            onClick={() => onToggleModel('icon')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
              activeModels.icon
                ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>ICON</span>
          </button>

          {/* ERA5 */}
          <button
            onClick={() => onToggleModel('reference')}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
              activeModels.reference
                ? 'bg-slate-100 text-slate-700 font-bold border border-slate-300'
                : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-slate-600" />
            <span>ERA5 REF</span>
          </button>
        </div>

        {/* Right: Window Selectors & Live Readout */}
        <div className="flex items-center gap-2">
          {/* Synchronized Readout Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${
              isLight
                ? 'bg-sky-50 border-sky-200 text-sky-950 font-bold'
                : 'bg-sky-950/60 border-sky-800 text-sky-200 font-bold'
            }`}
          >
            <span className="text-blue-600">E:{activeTooltipSample.ecmwf.toFixed(1)}</span>
            <span className="text-emerald-600">G:{activeTooltipSample.gfs.toFixed(1)}</span>
            <span className="text-rose-600">I:{activeTooltipSample.icon.toFixed(1)}</span>
            <span className="text-slate-500">REF:{activeTooltipSample.reference.toFixed(1)}</span>
          </div>

          {/* Window Mode Segment */}
          <div
            className={`flex items-center p-0.5 rounded-lg border text-[10px] font-semibold ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              onClick={() => setWindowMode('48h')}
              className={`px-1.5 py-0.2 rounded transition-colors ${
                windowMode === '48h'
                  ? 'bg-white shadow-xs text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              48h
            </button>
            <button
              onClick={() => setWindowMode('72h')}
              className={`px-1.5 py-0.2 rounded transition-colors ${
                windowMode === '72h'
                  ? 'bg-white shadow-xs text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              72h
            </button>
            <button
              onClick={() => setWindowMode('all')}
              className={`px-1.5 py-0.2 rounded transition-colors ${
                windowMode === 'all'
                  ? 'bg-white shadow-xs text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Full Series
            </button>
          </div>
        </div>
      </div>

      {/* ── CHART CANVAS: RESPONSIVE SVG ─────────────────────────────────── */}
      <div className="flex-1 w-full min-h-0 relative select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <defs>
            <linearGradient id="chart-cursor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={isLight ? '#e2e8f0' : '#1e293b'}
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? 'none' : '3 3'}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className={`text-[8.5px] font-mono ${
                    isLight ? 'fill-slate-600' : 'fill-slate-400'
                  }`}
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-Axis Ticks & Labels */}
          {xTicks.map((t, idx) => (
            <text
              key={idx}
              x={t.x}
              y={chartHeight - 4}
              textAnchor="middle"
              className={`text-[8.5px] font-mono ${
                isLight ? 'fill-slate-600' : 'fill-slate-400'
              }`}
            >
              {t.label}
            </text>
          ))}

          {/* Model Curves */}
          {/* ERA5 Ground Truth Reference (Neutral Gray / Dashed per Section 8) */}
          {activeModels.reference && (
            <path
              d={paths.reference}
              fill="none"
              stroke="#64748b"
              strokeWidth="2.2"
              strokeDasharray="4 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-150"
            />
          )}

          {/* ECMWF (Blue per Section 8) */}
          {activeModels.ecmwf && (
            <path
              d={paths.ecmwf}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-150"
            />
          )}

          {/* GFS (Green per Section 8) */}
          {activeModels.gfs && (
            <path
              d={paths.gfs}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-150"
            />
          )}

          {/* ICON (Red per Section 8) */}
          {activeModels.icon && (
            <path
              d={paths.icon}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-150"
            />
          )}

          {/* Selected Timestamp Vertical Cursor Line (Synchronized with Timeline) */}
          {selectedX !== null && (
            <g>
              {/* Vertical Guide Line */}
              <line
                x1={selectedX}
                y1={padding.top}
                x2={selectedX}
                y2={padding.top + innerHeight}
                stroke="#2563eb"
                strokeWidth="1.8"
                strokeDasharray="2 2"
              />

              {/* Dots on Curves */}
              {activeModels.reference && (
                <circle
                  cx={selectedX}
                  cy={getY(samples[selectedIndex]?.reference || 0)}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2"
                />
              )}

              {activeModels.ecmwf && (
                <circle
                  cx={selectedX}
                  cy={getY(samples[selectedIndex]?.ecmwf || 0)}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
              )}

              {activeModels.gfs && (
                <circle
                  cx={selectedX}
                  cy={getY(samples[selectedIndex]?.gfs || 0)}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              )}

              {activeModels.icon && (
                <circle
                  cx={selectedX}
                  cy={getY(samples[selectedIndex]?.icon || 0)}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
