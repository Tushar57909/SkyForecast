import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Clock
} from 'lucide-react';

export default function Alerts() {
  return (
    <div className="space-y-4 pb-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-sky-400" />
            Meteorological Alerts & Guidance
          </h1>
          <p className="text-sm text-slate-300 font-normal mt-0.5">
            Automated threshold exceedance notifications and IMD synoptic weather advisories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            2 ACTIVE BULLETINS
          </span>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {/* Alert 1: Orange Warning */}
        <div className="aeris-card p-5 rounded-2xl border-l-4 border-l-amber-500 border-blue-900/40 bg-gradient-to-r from-amber-950/30 to-[#0b1a36]/80">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    ORANGE ALERT
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Valid: Next 12 Hours (Until 18:00 UTC)
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">
                  Convective Squall & Thunderstorm with Lightning // Nagpur & Wardha
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Atmospheric sounding profiles indicate high convective instability (CAPE &gt; 1800 J/kg) over Eastern Vidarbha. Heavy rain bursts exceeding 35 mm/h accompanied by gusty winds (35–45 km/h) are expected.
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> Districts: Nagpur, Wardha, Bhandara
                  </span>
                  <span className="text-emerald-400">Exceedance Probability: 78%</span>
                </div>
              </div>
            </div>
            <button className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors">
              View Protocol
            </button>
          </div>
        </div>

        {/* Alert 2: Yellow Watch */}
        <div className="aeris-card p-5 rounded-2xl border-l-4 border-l-yellow-500 border-blue-900/40 bg-gradient-to-r from-yellow-950/20 to-[#0b1a36]/80">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-yellow-500 text-slate-950">
                    YELLOW WATCH
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Valid: Next 24 Hours
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">
                  Localized Waterlogging Risk in Low-Lying Urban Basins // Nagpur City
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Continuous multi-model ensemble agreement shows accumulated rainfall between 35–70 mm. Municipal drainage networks may experience localized backflow in Sitabuldi and Dharampeth catchments.
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> Sector: Nagpur Municipal Corporation
                  </span>
                  <span className="text-sky-300">Exceedance Probability: 64%</span>
                </div>
              </div>
            </div>
            <button className="px-3.5 py-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 text-xs font-bold transition-colors">
              View Protocol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
