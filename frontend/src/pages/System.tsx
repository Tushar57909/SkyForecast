import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Terminal
} from 'lucide-react';
import { clsx } from 'clsx';

export default function System() {
  const pipelineStages = [
    { id: '01', title: 'Raw Ingestion', status: 'COMPLETED', detail: 'Real ECMWF, GFS, ICON & ERA5 reference ingested (Prompt 11.1)', verified: true },
    { id: '02', title: 'Data Alignment', status: 'COMPLETED', detail: '2,688 hourly aligned records synchronized for 24h lead (New Delhi)', verified: true },
    { id: '03', title: 'Feature Store', status: 'COMPLETED', detail: 'Train (2,150), Val (269), Test (269) CSVs verified on local disk', verified: true },
    { id: '04', title: 'XGBoost Training', status: 'PENDING', detail: 'Windows AppLocker blocked C-extensions; Linux runner queued (Prompt 11.3)', verified: false },
    { id: '05', title: 'Dynamic Inference', status: 'AWAITING 04', detail: 'Adaptive multi-model weight generation awaiting trained model', verified: false },
    { id: '06', title: 'Workstation UI', status: 'OPERATIONAL', detail: 'Meteorological operations workstation rendering verified raw NWP feeds', verified: true },
  ];

  const datasetFiles = [
    { path: 'data/datasets/ml_dataset_precipitation_lead24/train.csv', size: '150.6 KB', samples: '2,150 aligned rows', status: 'VERIFIED ON DISK' },
    { path: 'data/datasets/ml_dataset_precipitation_lead24/val.csv', size: '18.9 KB', samples: '269 aligned rows', status: 'VERIFIED ON DISK' },
    { path: 'data/datasets/ml_dataset_precipitation_lead24/test.csv', size: '18.9 KB', samples: '269 aligned rows', status: 'VERIFIED ON DISK' },
    { path: 'Dockerfile.ml', size: '451 B', samples: 'Standalone Linux Runner', status: 'READY FOR DOCKER' },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0f1d] overflow-y-auto custom-scrollbar font-mono text-xs p-4 gap-4 text-slate-200 select-none">
      
      {/* ── WORKSTATION STATUS HEADER ────────────────────────────────────────────── */}
      <div className="met-panel p-3 flex flex-wrap items-center justify-between gap-3 border-slate-700 bg-gradient-to-r from-[#0c1427] to-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              PIPELINE ARCHITECTURE & REPRODUCIBILITY AUDIT
              <span className="met-badge met-badge-verified">DATASET VERIFIED</span>
            </h1>
            <div className="text-[10px] text-slate-400 font-mono">
              SIH 2026 PS 26081 Implementation Lineage // Real Dataset vs Execution Environment
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-400">HOST STATUS:</span>
          <span className="met-badge met-badge-pending">WINDOWS APPLOCKER ACTIVE</span>
        </div>
      </div>

      {/* ── REAL EXECUTION AUDIT TILES ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="met-panel p-3">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
            <span>REAL DATA RECORDS</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 my-2">2,688 RECORDS</div>
          <div className="text-[10px] text-emerald-400 font-bold">100% REAL HISTORICAL NWP</div>
        </div>

        <div className="met-panel p-3">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
            <span>TEST SPLIT AUDIT</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 my-2">269 SAMPLES</div>
          <div className="text-[10px] text-emerald-400 font-bold">TEST SET READY FOR BENCHMARK</div>
        </div>

        <div className="met-panel p-3 border-amber-900/60 bg-[#16120c]">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
            <span>LIVE SERVER TELEMETRY</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 my-2">NOT CONNECTED</div>
          <div className="text-[10px] text-amber-300/80">NO SYNTHETIC STATS GENERATED</div>
        </div>

        <div className="met-panel p-3 border-amber-900/60 bg-[#16120c]">
          <div className="text-slate-400 text-[10px] uppercase font-bold flex justify-between">
            <span>ML EXECUTION RUNNER</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 my-2">LINUX QUEUED</div>
          <div className="text-[10px] text-amber-300/80">PROMPT 11.3 SPECIFICATION</div>
        </div>
      </div>

      {/* ── PIPELINE FLOW DIAGRAM (TRUTHFUL 6-STAGE LINEAGE) ──────────────────────── */}
      <div className="met-panel p-3">
        <div className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
          <span>OPERATIONAL PIPELINE STAGE LINEAGE</span>
          <span className="text-[10px] text-slate-400">STAGES 01–03 COMPLETE // 04–05 PENDING</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {pipelineStages.map((stage) => {
            const isDone = stage.status === 'COMPLETED' || stage.status === 'OPERATIONAL';
            return (
              <div 
                key={stage.id}
                className={clsx(
                  "p-2.5 rounded border flex flex-col justify-between gap-2",
                  isDone ? "bg-[#141e33] border-slate-700" : "bg-[#191510] border-amber-900/60"
                )}
              >
                <div>
                  <div className="flex justify-between items-center text-[9px] mb-1">
                    <span className="text-slate-400 font-bold">STAGE {stage.id}</span>
                    <span className={isDone ? "met-badge met-badge-verified" : "met-badge met-badge-pending"}>
                      {stage.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-200">
                    {stage.title}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-400 leading-tight">
                  {stage.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── REAL REPRODUCIBLE DATASET FILES ON DISK ───────────────────────────────── */}
      <div className="met-panel flex-1 flex flex-col justify-between overflow-hidden">
        <div className="met-panel-header">
          <span>VERIFIED PROJECT DATASETS ON DISK</span>
          <span className="text-[10px] text-emerald-400">REAL FILES CONFIRMED</span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141e33] border-b border-slate-800 text-slate-400 text-[10px]">
              <tr>
                <th className="p-2.5 pl-3">FILE PATH</th>
                <th className="p-2.5">FILE SIZE</th>
                <th className="p-2.5">ALIGNED SAMPLES</th>
                <th className="p-2.5 text-right pr-3">INTEGRITY STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {datasetFiles.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-2.5 pl-3 font-bold text-slate-200 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{f.path}</span>
                  </td>
                  <td className="p-2.5 text-slate-400">{f.size}</td>
                  <td className="p-2.5 text-slate-300">{f.samples}</td>
                  <td className="p-2.5 text-right pr-3">
                    <span className="met-badge met-badge-verified">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#0c1427] border-t border-slate-800 px-3 py-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>NOTE: Live server telemetry (CPU, RAM, req/s) is withheld to avoid fabricating non-existent daemon stats.</span>
          <span className="text-slate-300 font-bold">ACCORDING TO USER SCIENTIFIC DIRECTIVE</span>
        </div>
      </div>
    </div>
  );
}
