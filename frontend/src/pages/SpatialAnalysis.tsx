import {
  Map as MapIcon,
  Compass
} from 'lucide-react';
import AerisMap from '../components/map/AerisMap';

export default function SpatialAnalysis() {
  return (
    <div className="space-y-4 pb-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MapIcon className="w-6 h-6 text-sky-400" />
            Spatial GIS Analysis & Radar Grid
          </h1>
          <p className="text-sm text-slate-300 font-normal mt-0.5">
            High-resolution geospatial meteorological workstation for Maharashtra & Central India
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-[#091834]/80 border border-blue-800/40 text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            Projection: WGS84 // EPSG:4326
          </span>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="grid grid-cols-1 gap-4">
        <AerisMap />
      </div>

      {/* Regional Station Table */}
      <div className="aeris-card p-5 rounded-2xl border border-blue-900/40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Regional AWS Synoptic Network // Central India & Vidarbha
          </h3>
          <span className="text-xs text-slate-400 font-semibold">6 Real Stations Monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-blue-900/40 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">Coordinates</th>
                <th className="py-2.5 px-3">Elevation</th>
                <th className="py-2.5 px-3">Air Temp</th>
                <th className="py-2.5 px-3">24h Precip</th>
                <th className="py-2.5 px-3">Model Agreement</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/20 text-slate-200">
              <tr className="hover:bg-blue-950/30 transition-colors">
                <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Nagpur (Safdarjung AWS)
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-400">21.1458°N, 79.0882°E</td>
                <td className="py-2.5 px-3">310 m</td>
                <td className="py-2.5 px-3 font-semibold text-white">28.0°C</td>
                <td className="py-2.5 px-3 font-bold text-sky-400">4.8 mm</td>
                <td className="py-2.5 px-3 font-semibold text-emerald-400">92% High</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                    ONLINE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-blue-950/30 transition-colors">
                <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Chandrapur AWS
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-400">19.9615°N, 79.2961°E</td>
                <td className="py-2.5 px-3">189 m</td>
                <td className="py-2.5 px-3 font-semibold text-white">29.2°C</td>
                <td className="py-2.5 px-3 font-bold text-sky-400">8.4 mm</td>
                <td className="py-2.5 px-3 font-semibold text-emerald-400">88% High</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                    ONLINE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-blue-950/30 transition-colors">
                <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Amravati AWS
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-400">20.9374°N, 77.7796°E</td>
                <td className="py-2.5 px-3">343 m</td>
                <td className="py-2.5 px-3 font-semibold text-white">27.1°C</td>
                <td className="py-2.5 px-3 font-bold text-sky-400">3.2 mm</td>
                <td className="py-2.5 px-3 font-semibold text-amber-400">76% Med</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                    ONLINE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
