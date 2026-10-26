import { useTheme } from '../../context/ThemeContext';

export default function AerisLogo({ className = "" }: { className?: string }) {
  const { theme } = useTheme();

  return (
    <div className={`flex items-center gap-3 ${className} select-none`}>
      {/* Handcrafted Meteorological Cloud Symbol */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 shadow-md">
        <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
          <defs>
            <linearGradient id="cloud-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="rain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          {/* Main Overcast Cumulus Cloud Body */}
          <path
            d="M9 20C6.79086 20 5 18.2091 5 16C5 13.9644 6.51688 12.2831 8.5 12.0355C9.20875 8.54483 12.2906 6 16 6C20.1466 6 23.5658 9.15589 23.9654 13.2081C25.7144 13.5855 27 15.1418 27 17C27 19.2091 25.2091 21 23 21H9"
            stroke="url(#cloud-grad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(56, 189, 248, 0.12)"
          />
          {/* Subtle Isobar / Atmospheric Streamline */}
          <path
            d="M7 24H21"
            stroke="#94a3b8"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M10 27H18"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography (Natural, Human-Designed) */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`text-lg font-extrabold tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            Sky<span className="text-sky-400">Forecast</span>
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 text-sky-300 border border-slate-700">
            NWP
          </span>
        </div>
        <span className={`text-[10px] font-medium tracking-normal mt-1 whitespace-nowrap ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
        }`}>
          Meteorological Workstation
        </span>
      </div>
    </div>
  );
}
