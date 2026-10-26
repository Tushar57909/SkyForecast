import {
  Radio,
  Zap,
  Eye
} from 'lucide-react';
import AerisMap from '../components/map/AerisMap';

export default function LiveIntelligence() {
  return (
    <div className="space-y-4 pb-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-sky-400" />
            Live Meteorological Intelligence
          </h1>
          <p className="text-sm text-slate-300 font-normal mt-0.5">
            Real-time Doppler radar sweeps, INSAT-3D thermal radiance, and storm convection tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            RADAR FEED: ONLINE (100% QUALITY)
          </span>
        </div>
      </div>

      {/* Map & Live Convective Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <AerisMap />
        </div>

        {/* Real-time telemetry panels */}
        <div className="lg:col-span-4 space-y-4">
          {/* Convection Cell Tracking */}
          <div className="aeris-card p-5 rounded-2xl border border-blue-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Active Convective Cells
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                1 CELL DETECTED
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#091834]/80 border border-blue-900/30">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>Cell #NGP-04 (Vidarbha Core)</span>
                  <span className="text-rose-400">46 dBZ Peak</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Speed: 18 km/h • Heading: 075° (ENE) • Echo Top: 12.4 km
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091834]/80 border border-blue-900/30">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>Lightning Stroke Density</span>
                  <span className="text-amber-400">14 flashes / 10min</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Concentrated over Chandrapur & Wardha border
                </div>
              </div>
            </div>
          </div>

          {/* INSAT-3DR Satellite Stream */}
          <div className="aeris-card p-5 rounded-2xl border border-blue-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-400" />
                Satellite Radiance Stream
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">TIR1 (10.8 µm)</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-blue-900/30">
                <span className="text-slate-300">Minimum Cloud Top Temp:</span>
                <span className="font-bold text-cyan-300">-64.2°C (Vigorous)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-blue-900/30">
                <span className="text-slate-300">Water Vapor Brightness:</span>
                <span className="font-bold text-white">238 K (Mid-troposphere)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-300">Solar Insolation:</span>
                <span className="font-bold text-white">520 W/m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
