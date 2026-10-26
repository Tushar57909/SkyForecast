import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-4 pb-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-sky-400" />
            Meteorological Reports & Data Export
          </h1>
          <p className="text-sm text-slate-300 font-normal mt-0.5">
            Generate operational synoptic weather bulletins and download multi-model datasets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-colors">
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Synoptic Bulletin</span>
          </button>
        </div>
      </div>

      {/* Available Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Report 1 */}
        <div className="aeris-card p-5 rounded-2xl border border-blue-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40">
                DAILY SYNOPSIS
              </span>
              <span className="text-[11px] text-slate-400">PDF • 1.4 MB</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-2">
              Central India 24h Synoptic Precipitation Synthesis
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Complete multi-model divergence review, dynamic AI weights attribution, and regional radar echo analysis.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Generated: Today 02:00 UTC</span>
            <button className="px-3 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Download className="w-3 h-3" />
              Download
            </button>
          </div>
        </div>

        {/* Report 2 */}
        <div className="aeris-card p-5 rounded-2xl border border-blue-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                RAW DATASET
              </span>
              <span className="text-[11px] text-slate-400">CSV • 18.9 KB</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-2">
              269 Aligned Test Cases // ECMWF + GFS + ICON + ERA5
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Standardized tabular format containing real NWP forecasts, 6 atmospheric predictors, and ERA5 ground references.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Verified On-Disk File</span>
            <button className="px-3 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <FileSpreadsheet className="w-3 h-3" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Report 3 */}
        <div className="aeris-card p-5 rounded-2xl border border-blue-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                VERIFICATION AUDIT
              </span>
              <span className="text-[11px] text-slate-400">JSON • 420 KB</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-2">
              Statistical Error Metrics & CSI Reliability Table
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Contingency tables, Brier skill scores, Pearson correlation coefficients, and lead-time decay curve logs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Benchmark Mode: Active</span>
            <button className="px-3 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Download className="w-3 h-3" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
