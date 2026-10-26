import os

base_dir = r"d:\SkyForecast\frontend"

files = {
    "src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-slate-800 bg-slate-100 antialiased font-sans;
  }
}

.maplibregl-popup-content {
  @apply rounded-none shadow-md border border-slate-300 p-2 font-sans;
}
""",

    "src/layouts/MainLayout.tsx": """import { Outlet, NavLink } from 'react-router-dom';
import { Map, Scale, Activity, AlertTriangle, Settings, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { name: 'Overview', to: '/overview', icon: LayoutDashboard },
  { name: 'Workspace', to: '/forecast', icon: Map },
  { name: 'Weights', to: '/weights', icon: Scale },
  { name: 'Evaluation', to: '/evaluation', icon: Activity },
  { name: 'Guidance', to: '/alerts', icon: AlertTriangle },
  { name: 'System', to: '/system', icon: Settings },
];

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f3f4f6] text-slate-900 font-sans overflow-hidden">
      {/* Dense Scientific Header */}
      <header className="h-12 bg-slate-900 text-slate-300 flex items-center justify-between px-4 flex-shrink-0 text-xs border-b border-slate-700">
        <div className="flex items-center gap-6">
          <div className="font-bold text-white tracking-wide text-sm flex items-center gap-2">
            SKYFORECAST <span className="text-slate-500 font-normal">|</span> <span className="text-slate-400 font-medium tracking-normal text-xs uppercase">Operations Console</span>
          </div>
          <nav className="flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors uppercase tracking-wider',
                    isActive
                      ? 'bg-slate-700 text-white shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )
                }
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4 text-slate-400 font-mono">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <span>DATA: <span className="text-amber-400">HISTORICAL</span></span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <span>LOC: NEW DELHI</span>
          </div>
          <div className="flex items-center gap-2">
            <span>ML PIPELINE: <span className="text-slate-500">PENDING</span></span>
          </div>
        </div>
      </header>
      
      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden bg-slate-100 flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}
""",

    "src/pages/Overview.tsx": """import { DEMO_DATA } from '../services/dataAdapter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function Overview() {
  const latestData = DEMO_DATA.length > 0 ? DEMO_DATA[DEMO_DATA.length - 1] : null;

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      {/* Top Context */}
      <div className="bg-white border border-slate-300 shadow-sm p-3 flex gap-8 text-sm">
        <div><span className="text-slate-500 font-semibold uppercase text-[10px]">Location</span><br/><span className="font-mono">New Delhi (28.61°N 77.21°E)</span></div>
        <div><span className="text-slate-500 font-semibold uppercase text-[10px]">Variable</span><br/><span className="font-mono">Precipitation (mm)</span></div>
        <div><span className="text-slate-500 font-semibold uppercase text-[10px]">Lead</span><br/><span className="font-mono">24h</span></div>
        <div><span className="text-slate-500 font-semibold uppercase text-[10px]">Reference</span><br/><span className="font-mono">ERA5 Reanalysis</span></div>
        <div className="ml-auto text-right border-l border-slate-200 pl-4">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Samples</span><br/><span className="font-mono">{DEMO_DATA.length} historical records</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Main Chart */}
        <div className="flex-[2] bg-white border border-slate-300 shadow-sm flex flex-col">
          <div className="border-b border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 uppercase">
            Historical Forecast Overview
          </div>
          <div className="flex-1 min-h-[300px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DEMO_DATA.slice(-100)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="valid_time" tickFormatter={(t: any) => new Date(t).toLocaleDateString()} tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} unit="mm" />
                <Tooltip labelFormatter={(t: any) => new Date(t).toLocaleString()} contentStyle={{fontSize: '12px'}} />
                <Line type="monotone" dataKey="reference" name="ERA5" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="ecmwf" name="ECMWF" stroke="#2563eb" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="gfs" name="GFS" stroke="#16a34a" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="icon" name="ICON" stroke="#dc2626" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Panel */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white border border-slate-300 shadow-sm">
            <div className="border-b border-slate-200 px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 uppercase">
              Model Status
            </div>
            <table className="w-full text-xs text-left">
              <tbody>
                <tr className="border-b border-slate-100"><td className="px-3 py-2 font-mono">ECMWF</td><td className="px-3 py-2 text-emerald-600">Available</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-2 font-mono">GFS</td><td className="px-3 py-2 text-emerald-600">Available</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-2 font-mono">ICON</td><td className="px-3 py-2 text-emerald-600">Available</td></tr>
                <tr className="border-b border-slate-100"><td className="px-3 py-2 font-mono">ERA5</td><td className="px-3 py-2 text-slate-600">Reference</td></tr>
                <tr><td className="px-3 py-2 font-mono">AI BLEND</td><td className="px-3 py-2 text-amber-500">Pending</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-slate-300 shadow-sm flex-1 p-4">
             <div className="text-xs font-semibold text-slate-700 uppercase mb-2">Blend Status</div>
             <div className="text-amber-700 bg-amber-50 border border-amber-200 text-xs p-3 rounded">
               <span className="font-bold">AI dynamic weighting: PENDING</span>
               <p className="mt-1">ML execution environment unavailable (Windows AppLocker active). Awaiting Linux runner environment.</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Summary */}
      <div className="bg-white border border-slate-300 shadow-sm p-4 text-xs text-slate-600">
         <div className="font-semibold uppercase mb-1">Model Agreement Analysis</div>
         <div>Model agreement analysis unavailable for current dataset. Minimum grid required for spatial divergence metrics.</div>
      </div>
    </div>
  );
}
""",

    "src/pages/ForecastExplorer.tsx": """import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getForecastData } from '../services/dataAdapter';
import WeatherMap from '../components/map/WeatherMap';
import { clsx } from 'clsx';

export default function ForecastExplorer() {
  const [leadTime, setLeadTime] = useState(24);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null);
  const [visibleModels, setVisibleModels] = useState({ ecmwf: true, gfs: true, icon: true, reference: true, ai: true });
  
  const rawData = useMemo(() => getForecastData('new_delhi', leadTime), [leadTime]);
  const data = useMemo(() => rawData.slice(-50), [rawData]); // limit to 50 for dense view
  
  // Default to last valid time if none selected
  const activeIndex = selectedTimeIndex !== null ? selectedTimeIndex : data.length - 1;
  const activeData = data[activeIndex] || null;

  return (
    <div className="h-full flex flex-col bg-slate-200 p-2 gap-2 overflow-hidden">
      {/* CONTROL STRIP */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-800 text-white px-3 py-1.5 text-xs shadow">
        <div className="flex items-center gap-2 border-r border-slate-600 pr-2">
          <span className="text-slate-400">Var:</span>
          <select className="bg-slate-700 border-none outline-none py-0.5"><option>Precipitation</option></select>
        </div>
        <div className="flex items-center gap-2 border-r border-slate-600 pr-2">
          <span className="text-slate-400">Reg:</span>
          <select className="bg-slate-700 border-none outline-none py-0.5"><option>India</option></select>
        </div>
        <div className="flex items-center gap-2 border-r border-slate-600 pr-2">
          <span className="text-slate-400">Loc:</span>
          <select className="bg-slate-700 border-none outline-none py-0.5"><option>New Delhi</option></select>
        </div>
        <div className="flex items-center gap-2 border-r border-slate-600 pr-2">
          <span className="text-slate-400">Lead:</span>
          <select value={leadTime} onChange={(e) => setLeadTime(Number(e.target.value))} className="bg-slate-700 border-none outline-none py-0.5">
            <option value={24}>24h</option>
            <option value={48} disabled>48h</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Selected Valid Time:</span>
          <span className="font-mono text-emerald-400">{activeData ? new Date(activeData.valid_time).toLocaleString() : 'N/A'}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-2 overflow-hidden">
        {/* MAP */}
        <div className="flex-[2] bg-slate-300 relative border border-slate-400 shadow-sm flex flex-col">
          <WeatherMap data={activeData} />
          {/* Timeline Overlay at bottom of Map */}
          <div className="absolute bottom-0 w-full h-16 bg-white/90 border-t border-slate-300 flex flex-col">
             <div className="text-[10px] uppercase font-bold text-slate-600 px-2 py-1 bg-slate-100 border-b border-slate-200">Forecast Timeline (Select to update)</div>
             <div className="flex-1 flex items-center px-2 overflow-x-auto gap-1">
               {data.map((d, i) => (
                 <div 
                   key={i} 
                   onClick={() => setSelectedTimeIndex(i)}
                   className={clsx(
                     "flex-shrink-0 h-6 w-8 text-[9px] flex items-center justify-center cursor-pointer border",
                     i === activeIndex ? "bg-blue-600 text-white border-blue-700 font-bold" : "bg-white text-slate-600 hover:bg-slate-200 border-slate-300"
                   )}
                 >
                   {new Date(d.valid_time).getHours()}h
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* RIGHT PANEL - POINT FORECAST & COMPARISON */}
        <div className="flex-1 w-[400px] flex flex-col gap-2 overflow-hidden">
          {/* Point Panel */}
          <div className="bg-white border border-slate-300 shadow-sm p-3">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">
               Point Forecast — New Delhi
             </div>
             {activeData ? (
               <table className="w-full text-xs font-mono text-left">
                 <tbody>
                   <tr><td className="py-1 text-slate-600"><input type="checkbox" checked={visibleModels.ecmwf} onChange={()=>setVisibleModels(p=>({...p, ecmwf: !p.ecmwf}))} className="mr-2"/>ECMWF</td><td className="py-1 text-right">{activeData.ecmwf.toFixed(2)}</td></tr>
                   <tr><td className="py-1 text-slate-600"><input type="checkbox" checked={visibleModels.gfs} onChange={()=>setVisibleModels(p=>({...p, gfs: !p.gfs}))} className="mr-2"/>GFS</td><td className="py-1 text-right">{activeData.gfs.toFixed(2)}</td></tr>
                   <tr><td className="py-1 text-slate-600"><input type="checkbox" checked={visibleModels.icon} onChange={()=>setVisibleModels(p=>({...p, icon: !p.icon}))} className="mr-2"/>ICON</td><td className="py-1 text-right">{activeData.icon.toFixed(2)}</td></tr>
                   <tr className="border-t border-slate-100"><td className="py-1 font-bold"><input type="checkbox" checked={visibleModels.reference} onChange={()=>setVisibleModels(p=>({...p, reference: !p.reference}))} className="mr-2"/>ERA5 (Ref)</td><td className="py-1 text-right font-bold">{activeData.reference.toFixed(2)}</td></tr>
                   <tr className="border-t border-slate-100"><td className="py-1 text-blue-800"><input type="checkbox" checked={visibleModels.ai} onChange={()=>setVisibleModels(p=>({...p, ai: !p.ai}))} className="mr-2"/>AI BLEND</td><td className="py-1 text-right text-blue-800">Pending</td></tr>
                 </tbody>
               </table>
             ) : <div className="text-xs text-slate-500">No data selected</div>}
          </div>

          {/* Model Comparison Chart */}
          <div className="bg-white border border-slate-300 shadow-sm flex-1 flex flex-col overflow-hidden">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2 border-b border-slate-100 bg-slate-50">
               Model Comparison
             </div>
             <div className="flex-1 p-2 min-h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data} onClick={(e) => {
                   if(e && e.activeTooltipIndex !== undefined) setSelectedTimeIndex(e.activeTooltipIndex);
                 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                   <XAxis dataKey="valid_time" tickFormatter={(t: any) => new Date(t).getHours() + 'h'} tick={{fontSize: 9}} interval="preserveStartEnd" />
                   <YAxis tick={{fontSize: 9}} width={30} />
                   <Tooltip labelFormatter={(t: any) => new Date(t).toLocaleString()} contentStyle={{fontSize: '10px', padding: '4px'}} />
                   {activeData && <ReferenceLine x={activeData.valid_time} stroke="#cbd5e1" strokeDasharray="3 3" />}
                   
                   {visibleModels.ecmwf && <Line type="monotone" dataKey="ecmwf" stroke="#2563eb" dot={false} strokeWidth={1} isAnimationActive={false} />}
                   {visibleModels.gfs && <Line type="monotone" dataKey="gfs" stroke="#16a34a" dot={false} strokeWidth={1} isAnimationActive={false} />}
                   {visibleModels.icon && <Line type="monotone" dataKey="icon" stroke="#dc2626" dot={false} strokeWidth={1} isAnimationActive={false} />}
                   {visibleModels.reference && <Line type="stepAfter" dataKey="reference" stroke="#64748b" dot={false} strokeWidth={2} isAnimationActive={false} />}
                 </LineChart>
               </ResponsiveContainer>
             </div>
             
             {/* Small Table */}
             <div className="h-32 border-t border-slate-200 overflow-y-auto">
               <table className="w-full text-[10px] text-left border-collapse">
                 <thead className="bg-slate-50 sticky top-0">
                   <tr><th className="p-1 border-b">Time</th><th className="p-1 border-b">ECMWF Err</th><th className="p-1 border-b">GFS Err</th><th className="p-1 border-b">ICON Err</th></tr>
                 </thead>
                 <tbody className="font-mono">
                   {data.slice().reverse().map((d, idx) => (
                     <tr key={idx} className={clsx("border-b border-slate-100 hover:bg-slate-50 cursor-pointer", (data.length - 1 - idx) === activeIndex && "bg-blue-50") } onClick={() => setSelectedTimeIndex(data.length - 1 - idx)}>
                       <td className="p-1">{new Date(d.valid_time).toLocaleDateString()}</td>
                       <td className="p-1 text-red-500">{(d.ecmwf - d.reference).toFixed(1)}</td>
                       <td className="p-1 text-red-500">{(d.gfs - d.reference).toFixed(1)}</td>
                       <td className="p-1 text-red-500">{(d.icon - d.reference).toFixed(1)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
""",

    "src/components/map/WeatherMap.tsx": """import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { WeatherData } from '../../services/dataAdapter';

interface MapProps {
  data: WeatherData | null;
}

export default function WeatherMap({ data }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    if (map.current) return; 
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [78.9629, 20.5937],
      zoom: 3.5,
      interactive: true
    });
    
    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    
    class ResetControl {
      onAdd(m: maplibregl.Map) {
        const div = document.createElement('div');
        div.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = '<span style="font-size:10px; font-weight:bold;">RESET</span>';
        btn.className = 'px-2 py-1';
        btn.onclick = () => m.flyTo({ center: [78.9629, 20.5937], zoom: 3.5 });
        div.appendChild(btn);
        return div;
      }
      onRemove(_m: maplibregl.Map) {}
    }
    map.current.addControl(new ResetControl(), 'top-right');
  }, []);

  useEffect(() => {
    if (!map.current || !data) return;
    const lngLat: [number, number] = [77.2, 28.6];
    
    if (!marker.current) {
      marker.current = new maplibregl.Marker({ color: '#334155' }).setLngLat(lngLat).addTo(map.current);
    }
    
    if (!popup.current) {
      popup.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 25 })
        .setLngLat(lngLat)
        .addTo(map.current);
    }
    
    popup.current.setHTML(`
      <div class="text-[10px] leading-tight">
        <div class="font-bold border-b border-slate-200 pb-1 mb-1 text-slate-800">New Delhi</div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">ECMWF</span><span class="font-mono">${data.ecmwf.toFixed(1)}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">GFS</span><span class="font-mono">${data.gfs.toFixed(1)}</span></div>
        <div class="flex justify-between gap-4"><span class="text-slate-500">ICON</span><span class="font-mono">${data.icon.toFixed(1)}</span></div>
        <div class="flex justify-between gap-4 border-t border-slate-100 mt-1 pt-1"><span class="text-slate-500">ERA5</span><span class="font-mono font-bold">${data.reference.toFixed(1)}</span></div>
      </div>
    `);
  }, [data]);

  return (
    <div className="w-full h-full relative bg-slate-100">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-2 left-2 bg-white/90 border border-slate-300 p-2 text-[10px] shadow-sm">
        <div className="font-bold text-slate-700 tracking-wider">POINT DATA ONLY</div>
        <div className="text-slate-500">Spatial grid data unavailable for current dataset.</div>
      </div>
    </div>
  );
}
""",

    "src/pages/ModelWeights.tsx": """export default function ModelWeights() {
  return (
    <div className="h-full p-6 flex flex-col max-w-5xl mx-auto w-full">
      <div className="border-b border-slate-300 pb-2 mb-4">
        <h1 className="text-xl font-semibold text-slate-800">MODEL WEIGHT ANALYSIS</h1>
      </div>
      
      <div className="flex gap-4 text-xs font-mono mb-6 bg-white p-2 border border-slate-200 shadow-sm">
        <div className="border-r border-slate-200 pr-4 text-slate-500">LOC: <span className="text-slate-800">NEW DELHI</span></div>
        <div className="border-r border-slate-200 pr-4 text-slate-500">VAR: <span className="text-slate-800">PRECIP</span></div>
        <div className="text-slate-500">LEAD: <span className="text-slate-800">24h</span></div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="border border-slate-300 bg-white shadow-sm">
          <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 text-[10px] font-bold text-slate-600 tracking-widest uppercase">
            WEIGHT EVOLUTION
          </div>
          <div className="h-64 bg-slate-50 flex items-center justify-center p-6 text-center">
            <div>
              <div className="text-sm font-bold text-slate-700 tracking-wider mb-2">DYNAMIC WEIGHTS NOT AVAILABLE</div>
              <div className="text-xs text-slate-500 max-w-md">No trained weighting artifact is currently available for this dataset. ML execution is pending (Windows AppLocker restriction).</div>
            </div>
          </div>
        </div>

        <div className="border border-slate-300 bg-white shadow-sm p-4 text-xs text-slate-700">
          <div className="font-bold mb-2">WEIGHT CONTEXT</div>
          <p className="mb-2">Future AI models will condition on the following dimensions to derive contextual weights:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Region / Topography</li>
            <li>Season / Climatology</li>
            <li>Lead time decay</li>
            <li>Recent model error (last N days)</li>
            <li>Forecast spread / Uncertainty</li>
            <li>Weather regime classification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/Evaluation.tsx": """import { DEMO_DATA } from '../services/dataAdapter';

export default function Evaluation() {
  return (
    <div className="h-full p-6 flex flex-col max-w-5xl mx-auto w-full">
      <div className="border-b border-slate-300 pb-2 mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">SCIENTIFIC EVALUATION</h1>
          <div className="text-xs text-slate-500 mt-1 font-mono">EVAL PERIOD: 2026-06-01 to 2026-09-20 | VAR: PRECIP | LEAD: 24h</div>
        </div>
      </div>
      
      <div className="bg-white border border-slate-300 shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 text-[10px] font-bold text-slate-600 tracking-widest uppercase">
          METHOD COMPARISON TABLE
        </div>
        <table className="w-full text-xs text-left text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px]">
            <tr>
              <th className="p-3">Method</th>
              <th className="p-3 text-right">MAE</th>
              <th className="p-3 text-right">RMSE</th>
              <th className="p-3 text-right">Bias</th>
              <th className="p-3 text-right">Correlation</th>
              <th className="p-3 text-right">Skill Score</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {['ECMWF', 'GFS', 'ICON', 'Simple Average', 'Fixed Weight'].map(method => (
              <tr key={method} className="border-b border-slate-100">
                <td className="p-3">{method}</td>
                <td className="p-3 text-right text-slate-400">N/A</td>
                <td className="p-3 text-right text-slate-400">N/A</td>
                <td className="p-3 text-right text-slate-400">N/A</td>
                <td className="p-3 text-right text-slate-400">N/A</td>
                <td className="p-3 text-right text-slate-400">N/A</td>
              </tr>
            ))}
            <tr className="bg-blue-50/50">
              <td className="p-3 font-bold text-blue-900">AI Dynamic Blend</td>
              <td colSpan={5} className="p-3 text-center text-[10px] text-blue-600 font-sans tracking-wide">
                PENDING ML EXECUTION
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500 bg-slate-100 border border-slate-200 p-3 rounded">
        Note: Skill score is relative to the project's defined simple-average baseline. Positive values indicate improvement over baseline.
      </div>
    </div>
  );
}
""",

    "src/pages/Alerts.tsx": """export default function Alerts() {
  return (
    <div className="h-full p-6 flex flex-col max-w-5xl mx-auto w-full">
      <div className="border-b border-slate-300 pb-2 mb-4">
        <h1 className="text-xl font-semibold text-slate-800">ALERT / GUIDANCE WORKSPACE</h1>
        <div className="text-xs text-slate-500 mt-1 font-mono">Automated forecast guidance — not an official government warning.</div>
      </div>

      <div className="flex gap-4 mb-4">
        <select className="border border-slate-300 text-xs p-1.5 shadow-sm bg-white"><option>Hazard: All</option></select>
        <select className="border border-slate-300 text-xs p-1.5 shadow-sm bg-white"><option>Region: India</option></select>
        <select className="border border-slate-300 text-xs p-1.5 shadow-sm bg-white"><option>Severity: All</option></select>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px]">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Location</th>
              <th className="p-3">Hazard</th>
              <th className="p-3">Signal</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-500">
                <div className="font-bold text-sm mb-1">No guidance</div>
                The current dataset does not exceed threshold criteria for severe meteorological events.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
""",

    "src/pages/System.tsx": """export default function System() {
  return (
    <div className="h-full p-6 flex flex-col max-w-3xl mx-auto w-full">
      <div className="border-b border-slate-300 pb-2 mb-6">
        <h1 className="text-xl font-semibold text-slate-800">DATA LINEAGE PIPELINE</h1>
      </div>

      <div className="space-y-1">
        {[
          { step: 'DATA SOURCES', status: 'READY', desc: 'ECMWF, GFS, ICON, ERA5 detected', color: 'emerald' },
          { step: 'INGESTION', status: 'READY', desc: 'JSON parsing completed', color: 'emerald' },
          { step: 'VALIDATION', status: 'READY', desc: 'Schema checks passed', color: 'emerald' },
          { step: 'HISTORICAL DATASET', status: 'READY', desc: '269 aligned samples generated', color: 'emerald' },
          { step: 'FEATURE ENGINEERING', status: 'PENDING', desc: 'Awaiting container environment', color: 'amber' },
          { step: 'WEIGHT MODEL', status: 'PENDING', desc: 'XGBoost blocked by AppLocker', color: 'amber' },
          { step: 'AI BLEND', status: 'PENDING', desc: 'Awaiting weights', color: 'amber' },
          { step: 'EVALUATION', status: 'PENDING', desc: 'Awaiting blend generation', color: 'amber' },
          { step: 'DASHBOARD', status: 'READY', desc: 'Operational UI rendering', color: 'emerald' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white border border-slate-200 p-3 shadow-sm text-xs font-mono">
            <div className={`w-32 font-bold text-slate-700`}>{item.step}</div>
            <div className={`w-4 h-4 rounded-full border-2 border-${item.color}-500 ${item.color === 'emerald' ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
            <div className={`w-20 font-bold text-${item.color}-600`}>{item.status}</div>
            <div className="text-slate-500 font-sans">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Redesigned frontend structure generated.")
