import { 
  AlertTriangle,
  FileCode,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function ModelWeights() {
  const plannedFeatures = [
    { name: 'Atmospheric Moisture Flux (850 hPa)', code: 'q_flux_850', role: 'Drives advective precipitation volume', status: 'PENDING' },
    { name: 'Forecast Lead Time (+24h)', code: 'lead_time_hrs', role: 'Modulates synoptic vs mesoscale model reliability', status: 'PENDING' },
    { name: 'Multi-Model Spread (StdDev)', code: 'ens_spread_std', role: 'Signals atmospheric regime predictability', status: 'PENDING' },
    { name: 'Convective Available Potential Energy', code: 'cape_jkg', role: 'Discriminates deep convective vs stratiform regimes', status: 'PENDING' },
    { name: 'Rolling 7-Day Model Bias', code: 'rolling_bias_7d', role: 'Corrects persistent systematic provider drift', status: 'PENDING' },
    { name: 'Station Elevation & Terrain', code: 'topo_elev_m', role: 'Resolves orographic boundary friction', status: 'PENDING' },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0f1d] overflow-y-auto custom-scrollbar font-mono text-xs p-4 gap-4 text-slate-200 select-none">
      
      {/* ── WORKSTATION STATUS HEADER ────────────────────────────────────────────── */}
      <div className="met-panel p-3 flex flex-wrap items-center justify-between gap-3 border-amber-800/80 bg-gradient-to-r from-[#191510] to-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              DYNAMIC WEIGHT ALLOCATION ENGINE // XGBOOST ML PIPELINE
              <span className="met-badge met-badge-pending">EXECUTION PENDING</span>
            </h1>
            <div className="text-[10px] text-slate-400 font-mono">
              Windows host AppLocker prevented native scientific ML training. Linux ML execution runner queued.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-400">PIPELINE STAGE:</span>
          <span className="met-badge met-badge-pending">PROMPT 11.3 LINUX RUNNER REQUIRED</span>
        </div>
      </div>

      {/* ── SCIENTIFIC INTEGRITY AUDIT: REAL VS PENDING ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1 */}
        <div className="met-panel p-3">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
            <span>ALIGNED TEST SAMPLES</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 my-2">269 SAMPLES</div>
          <div className="text-[10px] text-emerald-400 font-bold">VERIFIED ON DISK (test.csv)</div>
        </div>

        {/* Metric 2 */}
        <div className="met-panel p-3">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
            <span>TRAIN / VAL SPLIT</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 my-2">2,150 / 269</div>
          <div className="text-[10px] text-emerald-400 font-bold">TOTAL 2,688 ALIGNED RECORDS</div>
        </div>

        {/* Metric 3 */}
        <div className="met-panel p-3 border-amber-900/60 bg-[#16120c]">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
            <span>AI DYNAMIC WEIGHTS</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 my-2">NOT AVAILABLE</div>
          <div className="text-[10px] text-amber-300/80">PENDING MODEL EXECUTION</div>
        </div>

        {/* Metric 4 */}
        <div className="met-panel p-3 border-amber-900/60 bg-[#16120c]">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
            <span>FEATURE GAIN METRICS</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 my-2">NOT EXECUTED</div>
          <div className="text-[10px] text-amber-300/80">NO SYNTHETIC DATA GENERATED</div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE: WEIGHT STATUS & PLANNED FEATURE STORE ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        
        {/* Left Col: Real Model Status & Pending Weight Matrix */}
        <div className="met-panel p-3 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
              <span>WEIGHT ALLOCATION MATRIX</span>
              <span className="text-[10px] text-amber-400 font-mono">[STANDBY]</span>
            </div>

            <div className="space-y-3">
              {/* ECMWF IFS Weight */}
              <div className="p-3 rounded bg-[#141e33] border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-sky-400">ECMWF IFS (0.1°) Weight [w_ecmwf]</span>
                  <span className="met-badge met-badge-pending">PENDING</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  Dynamic weight conditioned on moisture flux and lead time (+24h). Awaiting XGBoost regression coefficient.
                </div>
              </div>

              {/* GFS NCEP Weight */}
              <div className="p-3 rounded bg-[#141e33] border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-emerald-400">GFS NCEP (0.25°) Weight [w_gfs]</span>
                  <span className="met-badge met-badge-pending">PENDING</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  Dynamic weight conditioned on rolling 7-day bias and synoptic spread. Awaiting XGBoost regression coefficient.
                </div>
              </div>

              {/* ICON DWD Weight */}
              <div className="p-3 rounded bg-[#141e33] border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-amber-400">ICON DWD (0.06°) Weight [w_icon]</span>
                  <span className="met-badge met-badge-pending">PENDING</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  Dynamic weight conditioned on CAPE and local elevation. Awaiting XGBoost regression coefficient.
                </div>
              </div>

              {/* Combined Blended Prediction */}
              <div className="p-3 rounded bg-[#191510] border border-amber-900/60">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-amber-300">Blended Forecast Formulation</span>
                  <span className="text-amber-400 font-mono font-bold">Y_blend = ∑ w_i · X_i</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Current Status: <strong className="text-amber-400">NOT AVAILABLE</strong>. No synthetic or placeholder blended values are rendered.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>CONSTRAINTS: w_i ≥ 0, ∑ w_i = 1.0 (Softmax)</span>
            <span className="text-cyan-400">STANDBY FOR LINUX EXECUTION</span>
          </div>
        </div>

        {/* Right Col: Planned Feature Matrix & Mathematical Specification */}
        <div className="met-panel p-3 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
              <span>ATMOSPHERIC CONDITIONING FEATURE REPOSITORY</span>
              <span className="text-[10px] text-slate-400 font-mono">6 FEATURES</span>
            </div>

            <div className="space-y-2">
              {plannedFeatures.map((feat, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#141e33] border border-slate-800 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200 text-xs">{feat.name}</span>
                    <span className="met-badge met-badge-standby">{feat.status}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>CODE: <code className="text-cyan-400">{feat.code}</code></span>
                    <span>{feat.role}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 rounded bg-[#070d19] border border-slate-800">
              <div className="text-[10px] font-bold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>SCIENTIFIC INTEGRITY DECLARATION</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                In strict accordance with SIH PS 26081 guidelines, this workstation refuses to fabricate weights or generate synthetic feature importance percentages. Real ML evaluation requires native C-extension execution in the Linux container runner.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[9px] text-slate-500 font-mono">
            PIPELINE DEFINED IN ml/training/ AND Dockerfile.ml
          </div>
        </div>
      </div>
    </div>
  );
}
