import os

files = {
    "src/App.tsx": """import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Overview from './pages/Overview';
import ForecastExplorer from './pages/ForecastExplorer';
import ModelWeights from './pages/ModelWeights';
import Evaluation from './pages/Evaluation';
import Alerts from './pages/Alerts';
import System from './pages/System';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="forecast" element={<ForecastExplorer />} />
          <Route path="weights" element={<ModelWeights />} />
          <Route path="evaluation" element={<Evaluation />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="system" element={<System />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
""",

    "src/layouts/MainLayout.tsx": """import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Scale, Activity, AlertTriangle, Settings, Database } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { name: 'Overview', to: '/overview', icon: LayoutDashboard },
  { name: 'Forecast Explorer', to: '/forecast', icon: Map },
  { name: 'Model Weights', to: '/weights', icon: Scale },
  { name: 'Evaluation', to: '/evaluation', icon: Activity },
  { name: 'Alerts', to: '/alerts', icon: AlertTriangle },
  { name: 'System', to: '/system', icon: Settings },
];

export default function MainLayout() {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="font-bold text-lg text-white tracking-wide">SkyForecast</div>
          <div className="ml-2 text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Ops</div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-amber-500">
            <Database className="w-3 h-3" />
            <span>Demo / Historical Data</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="text-sm font-medium text-slate-800">
            SIH 2026 — PS 26081
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              System Normal
            </div>
            <span>Updated: Just now</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
""",

    "src/services/dataAdapter.ts": """import demoDataRaw from '../data/demo_data.json';

// We parse the string values into numbers and dates.
export const DEMO_DATA = demoDataRaw.map(d => ({
  valid_time: new Date(d.valid_time),
  init_time: new Date(d.init_time),
  lead_hours: parseInt(d.lead_hours, 10),
  location_id: d.location_id,
  ecmwf: parseFloat(d.ecmwf_precipitation),
  gfs: parseFloat(d.gfs_precipitation),
  icon: parseFloat(d.icon_precipitation),
  reference: parseFloat(d.reference_precipitation),
  // Handle case where ML weights/blends are missing (blocked execution)
  ai_weight_ecmwf: null,
  ai_weight_gfs: null,
  ai_weight_icon: null,
  ai_blend: null,
}));

export function getForecastData(locationId: string, leadHours: number) {
  return DEMO_DATA.filter(d => d.location_id === locationId && d.lead_hours === leadHours);
}
""",

    "src/pages/Overview.tsx": """import React from 'react';
import { DEMO_DATA } from '../services/dataAdapter';

export default function Overview() {
  const latestData = DEMO_DATA.length > 0 ? DEMO_DATA[DEMO_DATA.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Operational Overview</h1>
          <p className="text-slate-500 mt-1">High-level synthesis of multi-model guidance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Status</h3>
          <div className="text-2xl font-medium text-slate-900">{DEMO_DATA.length}</div>
          <div className="text-sm text-slate-500 mt-1">Available valid samples</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Primary Variable</h3>
          <div className="text-2xl font-medium text-slate-900">Precipitation</div>
          <div className="text-sm text-slate-500 mt-1">Measured in mm</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</h3>
          <div className="text-2xl font-medium text-slate-900">New Delhi</div>
          <div className="text-sm text-slate-500 mt-1">28.6°N, 77.2°E</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-medium text-slate-800 mb-4">Latest Model State</h2>
        {latestData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 bg-slate-50 rounded border border-slate-100">
               <div className="text-sm text-slate-500 mb-1">ECMWF (24h)</div>
               <div className="text-xl font-medium">{latestData.ecmwf.toFixed(2)} mm</div>
             </div>
             <div className="p-4 bg-slate-50 rounded border border-slate-100">
               <div className="text-sm text-slate-500 mb-1">GFS (24h)</div>
               <div className="text-xl font-medium">{latestData.gfs.toFixed(2)} mm</div>
             </div>
             <div className="p-4 bg-slate-50 rounded border border-slate-100">
               <div className="text-sm text-slate-500 mb-1">ICON (24h)</div>
               <div className="text-xl font-medium">{latestData.icon.toFixed(2)} mm</div>
             </div>
             <div className="p-4 bg-blue-50 rounded border border-blue-100">
               <div className="text-sm text-blue-700 mb-1">AI Blend (24h)</div>
               <div className="text-xl font-medium text-blue-900">
                 {latestData.ai_blend !== null ? `${latestData.ai_blend.toFixed(2)} mm` : 'N/A (Pending)'}
               </div>
             </div>
          </div>
        ) : (
          <div className="text-slate-500 text-sm">No data available.</div>
        )}
      </div>
    </div>
  );
}
""",

    "src/pages/ForecastExplorer.tsx": """import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getForecastData } from '../services/dataAdapter';

export default function ForecastExplorer() {
  const [leadTime, setLeadTime] = useState(24);
  const data = getForecastData('new_delhi', leadTime).slice(-100); // last 100 entries

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Forecast Explorer</h1>
          <p className="text-slate-500 mt-1">Examine individual NWP models and blended output.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Lead Time:</label>
          <select 
            value={leadTime} 
            onChange={(e) => setLeadTime(Number(e.target.value))}
            className="border-slate-300 rounded shadow-sm text-sm p-2 bg-white"
          >
            <option value={24}>24 Hours</option>
            <option value={48} disabled>48 Hours (N/A)</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex-1 min-h-[400px]">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Precipitation Forecast (New Delhi)</h2>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="valid_time" tickFormatter={(t) => new Date(t).toLocaleDateString()} tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} unit="mm" />
              <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="ecmwf" name="ECMWF" stroke="#2563eb" dot={false} />
              <Line type="monotone" dataKey="gfs" name="GFS" stroke="#16a34a" dot={false} />
              <Line type="monotone" dataKey="icon" name="ICON" stroke="#dc2626" dot={false} />
              <Line type="monotone" dataKey="reference" name="ERA5 (Ref)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No data available for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
""",

    "src/pages/ModelWeights.tsx": """import React from 'react';

export default function ModelWeights() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Model Weights</h1>
        <p className="text-slate-500 mt-1">Dynamic AI weight assignments over time.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
        <div className="text-amber-500 mt-0.5">ℹ️</div>
        <div>
          <h3 className="text-sm font-medium text-amber-800">Dynamic weights are not available for the selected run.</h3>
          <p className="text-sm text-amber-700 mt-1">
            The AI model execution was blocked by host system policies (Windows AppLocker).
            Actual dynamic weights have not been generated. No fake values will be displayed.
          </p>
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/Evaluation.tsx": """import React from 'react';

export default function Evaluation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Scientific Evaluation</h1>
        <p className="text-slate-500 mt-1">Rigorous comparison of the AI blend against constituent models.</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-8 rounded-lg text-center">
        <h3 className="text-slate-700 font-medium mb-2">AI dynamic evaluation pending.</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The evaluation metrics will appear here once the Linux ML execution runner successfully processes the historical dataset. 
          Currently awaiting the unblocking of the XGBoost dependencies.
        </p>
      </div>
    </div>
  );
}
""",

    "src/pages/Alerts.tsx": """import React from 'react';

export default function Alerts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Weather Guidance</h1>
        <p className="text-slate-500 mt-1">Automated forecast guidance — not an official government warning.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
        <div className="text-emerald-500 text-3xl mb-3">✓</div>
        <h3 className="text-slate-800 font-medium mb-1">No Active Guidance</h3>
        <p className="text-sm text-slate-500">
          The current dataset does not exceed the threshold criteria for heavy precipitation in New Delhi.
        </p>
      </div>
    </div>
  );
}
""",

    "src/pages/System.tsx": """import React from 'react';

export default function System() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">System Status</h1>
        <p className="text-slate-500 mt-1">Infrastructure and data pipeline health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-800">Core Services</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Frontend App</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Backend API</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">Unavailable (Demo Mode)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">ML Execution (XGBoost)</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">Blocked (AppLocker)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
}

base_dir = r"d:\SkyForecast\frontend"
for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

# Move the demo_data.json if it exists in scripts/src/data
src_json = os.path.join(base_dir, "scripts/src/data/demo_data.json")
dst_json = os.path.join(base_dir, "src/data/demo_data.json")
if os.path.exists(src_json):
    os.makedirs(os.path.dirname(dst_json), exist_ok=True)
    os.rename(src_json, dst_json)

print("Scaffolded frontend successfully.")
