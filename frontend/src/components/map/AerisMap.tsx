import { useState, useRef, useEffect } from 'react';
import {
  Thermometer,
  CloudRain,
  Wind,
  ShieldAlert,
  Sparkles,
  Plus,
  Minus,
  Crosshair
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CityMarker {
  name: string;
  xPercent: number;
  yPercent: number;
  temp: string;
  isMain?: boolean;
}

const CITIES: CityMarker[] = [
  { name: 'Nagpur', xPercent: 50.8, yPercent: 32.5, temp: '28°C', isMain: true },
  { name: 'Chandrapur', xPercent: 55.4, yPercent: 44.0, temp: '29°C' },
  { name: 'Amravati', xPercent: 53.0, yPercent: 53.5, temp: '27°C' },
  { name: 'Aurangabad', xPercent: 39.5, yPercent: 37.0, temp: '26°C' },
  { name: 'Mumbai', xPercent: 28.5, yPercent: 45.0, temp: '29°C' },
  { name: 'Pune', xPercent: 34.0, yPercent: 54.0, temp: '25°C' }
];

export default function AerisMap() {
  const { theme } = useTheme();
  const [activeLayer, setActiveLayer] = useState<'temp' | 'rain' | 'wind' | 'risk' | 'ai'>('ai');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render high-definition Doppler radar convection overlay onto the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      const coreX = width * 0.54;
      const coreY = height * 0.38;

      // Outer diffuse rain plume (cyan to emerald green)
      const outerGrad = ctx.createRadialGradient(coreX - 20, coreY + 10, 20, coreX, coreY, width * 0.42);
      outerGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
      outerGrad.addColorStop(0.35, 'rgba(6, 182, 212, 0.35)');
      outerGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.15)');
      outerGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.ellipse(coreX - 10, coreY + 10, width * 0.38, height * 0.32, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Moderate convection band (yellow to amber)
      const midGrad = ctx.createRadialGradient(coreX + 15, coreY - 5, 10, coreX, coreY, width * 0.22);
      midGrad.addColorStop(0, 'rgba(245, 158, 11, 0.85)');
      midGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.7)');
      midGrad.addColorStop(0.85, 'rgba(34, 197, 94, 0.4)');
      midGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = midGrad;
      ctx.beginPath();
      ctx.ellipse(coreX + 15, coreY - 10, width * 0.18, height * 0.16, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Severe convective storm core (orange to scarlet red to violet/purple)
      const coreGrad = ctx.createRadialGradient(coreX + 25, coreY - 12, 2, coreX + 25, coreY - 12, width * 0.11);
      coreGrad.addColorStop(0, 'rgba(217, 70, 239, 0.95)');
      coreGrad.addColorStop(0.25, 'rgba(239, 68, 68, 0.9)');
      coreGrad.addColorStop(0.65, 'rgba(249, 115, 22, 0.85)');
      coreGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreX + 25, coreY - 12, width * 0.09, 0, Math.PI * 2);
      ctx.fill();

      // Secondary squall line near Aurangabad / Amravati
      const secGrad = ctx.createRadialGradient(width * 0.42, height * 0.48, 5, width * 0.42, height * 0.48, width * 0.14);
      secGrad.addColorStop(0, 'rgba(234, 179, 8, 0.5)');
      secGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.4)');
      secGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.fillStyle = secGrad;
      ctx.beginPath();
      ctx.ellipse(width * 0.42, height * 0.48, width * 0.12, height * 0.08, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeLayer]);

  return (
    <div className={`aeris-card relative rounded-2xl overflow-hidden flex flex-col h-[390px] border transition-colors duration-300 ${
      theme === 'light' ? 'border-sky-200/90 shadow-[0_4px_24px_rgba(12,74,110,0.06)]' : 'border-blue-900/40'
    }`}>
      {/* ── Top Layer Selection Bar ────────────────────────────────────────── */}
      <div className={`absolute top-3 left-3 z-30 flex items-center gap-1.5 backdrop-blur-md px-2 py-1.5 rounded-xl border shadow-md transition-colors ${
        theme === 'light'
          ? 'bg-white/90 border-slate-200/80 shadow-sm'
          : 'bg-[#091834]/85 border-blue-800/40'
      }`}>
        {/* Temperature */}
        <button
          onClick={() => setActiveLayer('temp')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeLayer === 'temp'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>Temperature</span>
        </button>

        {/* Rainfall */}
        <button
          onClick={() => setActiveLayer('rain')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeLayer === 'rain'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>Rainfall</span>
        </button>

        {/* Wind */}
        <button
          onClick={() => setActiveLayer('wind')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeLayer === 'wind'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Wind</span>
        </button>

        {/* Risk */}
        <button
          onClick={() => setActiveLayer('risk')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeLayer === 'risk'
              ? 'bg-blue-600 text-white shadow-md'
              : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Risk</span>
        </button>

        {/* AI Blend */}
        <button
          onClick={() => setActiveLayer('ai')}
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
            activeLayer === 'ai'
              ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.45)]'
              : theme === 'light'
              ? 'text-blue-600 hover:text-blue-800 hover:bg-sky-50'
              : 'text-sky-300 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Blend</span>
        </button>
      </div>

      {/* ── Zoom Controls on Left ─────────────────────────────────────────── */}
      <div className={`absolute top-1/2 -translate-y-1/2 left-3 z-30 flex flex-col gap-1.5 backdrop-blur-md p-1 rounded-xl border shadow-md transition-colors ${
        theme === 'light'
          ? 'bg-white/90 border-slate-200/80 shadow-sm'
          : 'bg-[#091834]/85 border-blue-800/40'
      }`}>
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
            theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-300 hover:text-white hover:bg-blue-800/50'
          }`}
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
            theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-300 hover:text-white hover:bg-blue-800/50'
          }`}
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
            theme === 'light'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-300 hover:text-white hover:bg-blue-800/50'
          }`}
          title="Reset View"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Vertical Temperature Scale on Right ────────────────────────────── */}
      <div className={`absolute top-8 right-3 z-30 flex flex-col items-center backdrop-blur-md py-2.5 px-1.5 rounded-xl border shadow-md text-[10px] font-semibold select-none transition-colors ${
        theme === 'light'
          ? 'bg-white/90 border-slate-200/80 text-slate-700 shadow-sm'
          : 'bg-[#091834]/85 border-blue-800/40 text-slate-300'
      }`}>
        <span className={`text-[11px] font-bold mb-1.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>°C</span>
        <span className="text-red-500 font-bold">40</span>
        {/* Gradient Thermometer Bar */}
        <div className="w-2.5 h-44 my-1 rounded-full bg-gradient-to-b from-[#ef4444] via-[#f59e0b] via-[#eab308] via-[#22c55e] via-[#06b6d4] to-[#2563eb] shadow-inner" />
        <span className="text-orange-500 font-bold">35</span>
        <span className="text-yellow-600 font-bold mt-1">30</span>
        <span className="text-emerald-600 font-bold mt-1">25</span>
        <span className="text-cyan-600 font-bold mt-1">20</span>
        <span className="text-sky-600 font-bold mt-1">15</span>
        <span className="text-blue-600 font-bold mt-1">10</span>
        <span className="text-blue-700 font-bold mt-1">5</span>
      </div>

      {/* ── Main Map Canvas & Graphic Underlay ─────────────────────────────── */}
      <div
        className={`relative w-full h-full overflow-hidden transition-all duration-300 origin-center ${
          theme === 'light' ? 'bg-[#d8e8f8]' : 'bg-[#071329]'
        }`}
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* High Tech Geospatial Vector Graphic of Maharashtra & Surrounds */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-90"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Terrain pattern */}
            <radialGradient id="land-glow-light" cx="45%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#edf4fc" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e2edf8" stopOpacity="1" />
            </radialGradient>
            <radialGradient id="land-glow-dark" cx="45%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#0d244a" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#081730" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#050e1f" stopOpacity="1" />
            </radialGradient>
            {/* Ocean */}
            <linearGradient id="ocean-grad-light" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c3ddfd" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
            <linearGradient id="ocean-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#030814" />
              <stop offset="100%" stopColor="#061226" />
            </linearGradient>
          </defs>

          {/* Ocean */}
          <rect
            x="0"
            y="0"
            width="1000"
            height="600"
            fill={theme === 'light' ? 'url(#ocean-grad-light)' : 'url(#ocean-grad-dark)'}
          />

          {/* India / Maharashtra Landmass contour */}
          <path
            d="M 180 0 L 220 120 L 210 240 L 250 310 L 280 400 L 270 480 L 290 600 L 1000 600 L 1000 0 Z"
            fill={theme === 'light' ? 'url(#land-glow-light)' : 'url(#land-glow-dark)'}
          />

          {/* Maharashtra Boundary Line */}
          <path
            d="M 230 180 C 270 170, 340 160, 420 170 C 500 180, 580 140, 680 160 C 720 170, 760 210, 780 260 C 790 320, 730 380, 690 410 C 640 450, 580 430, 510 440 C 420 460, 360 480, 320 450 C 280 430, 270 380, 250 310 C 240 260, 210 220, 230 180 Z"
            fill="none"
            stroke={theme === 'light' ? 'rgba(2, 132, 199, 0.45)' : 'rgba(56, 189, 248, 0.3)'}
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />

          {/* State Rivers & Technical Contours */}
          <path
            d="M 320 220 Q 420 260 520 280 T 700 290"
            fill="none"
            stroke={theme === 'light' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(14, 165, 233, 0.2)'}
            strokeWidth="1.2"
          />
          <path
            d="M 290 360 Q 400 370 540 390 T 670 420"
            fill="none"
            stroke={theme === 'light' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(14, 165, 233, 0.15)'}
            strokeWidth="1"
          />

          {/* State Label: MAHARASHTRA */}
          <text
            x="380"
            y="400"
            fill={theme === 'light' ? 'rgba(15, 23, 42, 0.25)' : 'rgba(255, 255, 255, 0.75)'}
            fontSize="26"
            fontWeight="800"
            letterSpacing="1.5"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            Maharashtra
          </text>
        </svg>

        {/* Dynamic Canvas Radar Convection Overlay */}
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className={`absolute inset-0 w-full h-full pointer-events-none opacity-90 ${
            theme === 'light' ? 'mix-blend-multiply' : 'mix-blend-screen'
          }`}
        />

        {/* ── City Markers & Tooltips ───────────────────────────────────────── */}
        {CITIES.map((city, idx) => {
          if (city.isMain) {
            return (
              <div
                key={idx}
                className="absolute z-20 flex flex-col items-center pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${city.xPercent}%`, top: `${city.yPercent}%` }}
              >
                {/* Tooltip Card: Nagpur 28°C */}
                <div className={`mb-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-lg flex flex-col items-center transition-colors ${
                  theme === 'light'
                    ? 'bg-white/95 border-sky-300 text-slate-900 shadow-[0_4px_16px_rgba(2,132,199,0.25)]'
                    : 'bg-[#091b3b]/90 border-blue-500/50 text-white shadow-[0_4px_20px_rgba(0,102,255,0.4)]'
                }`}>
                  <span className={`text-[12px] font-bold leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {city.name}
                  </span>
                  <span className={`text-[13px] font-black leading-tight ${theme === 'light' ? 'text-blue-600' : 'text-sky-300'}`}>
                    {city.temp}
                  </span>
                </div>

                {/* Pulsing Beacon Dot */}
                <div className="relative flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 beacon-pulse absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0284c7] border-2 border-white shadow-[0_0_8px_#0284c7]" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="absolute z-20 flex flex-col items-center pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${city.xPercent}%`, top: `${city.yPercent}%` }}
            >
              {/* City Label */}
              <span className={`text-[11px] font-bold transition-colors mb-0.5 ${
                theme === 'light'
                  ? 'text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] group-hover:text-blue-600'
                  : 'text-slate-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover:text-white'
              }`}>
                {city.name}
              </span>
              {/* Marker Dot */}
              <div className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${
                theme === 'light'
                  ? 'bg-slate-700 border border-white group-hover:bg-blue-600 group-hover:scale-125'
                  : 'bg-slate-300 border border-slate-900 group-hover:bg-cyan-400 group-hover:scale-125'
              }`} />
            </div>
          );
        })}

        {/* ── Bottom Rainbow Scale Bar ──────────────────────────────────────── */}
        <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center backdrop-blur-md py-1.5 px-6 rounded-xl border shadow-md w-[320px] transition-colors ${
          theme === 'light'
            ? 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
            : 'bg-[#091834]/85 border-blue-800/40 text-slate-300'
        }`}>
          {/* Continuous gradient strip */}
          <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#2563eb] via-[#06b6d4] via-[#22c55e] via-[#eab308] via-[#ef4444] to-[#c026d3] shadow-inner mb-1" />
          {/* Text labels */}
          <div className="w-full flex justify-between text-[9px] font-bold uppercase tracking-wider">
            <span>LOW</span>
            <span>MODERATE</span>
            <span>HIGH</span>
            <span>EXTREME</span>
          </div>
        </div>
      </div>
    </div>
  );
}
