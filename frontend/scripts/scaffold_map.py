import os

base_dir = r"d:\SkyForecast\frontend"

map_tsx = """import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { WeatherData } from '../../services/dataAdapter';

interface MapProps {
  data: WeatherData | null;
  selectedModel: 'ecmwf' | 'gfs' | 'icon' | 'reference' | 'ai_blend';
}

export default function WeatherMap({ data, selectedModel }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    if (map.current) return; // initialize map only once
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [78.9629, 20.5937], // India center
      zoom: 3.5,
      interactive: true
    });
    
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Add custom reset control
    class ResetControl {
      onAdd(m: maplibregl.Map) {
        const div = document.createElement('div');
        div.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Reset';
        btn.className = 'px-2 py-1 text-xs font-medium';
        btn.onclick = () => {
          m.flyTo({ center: [78.9629, 20.5937], zoom: 3.5 });
        };
        div.appendChild(btn);
        return div;
      }
      onRemove(m: maplibregl.Map) {}
    }
    map.current.addControl(new ResetControl(), 'top-right');
  }, []);

  useEffect(() => {
    if (!map.current || !data) return;
    
    // New Delhi coordinates
    const lngLat: [number, number] = [77.2, 28.6];
    
    if (!marker.current) {
      marker.current = new maplibregl.Marker({ color: '#2563eb' })
        .setLngLat(lngLat)
        .addTo(map.current);
    }
    
    if (!popup.current) {
      popup.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
        .setLngLat(lngLat)
        .addTo(map.current);
    }
    
    let val = null;
    if (selectedModel === 'ai_blend') val = data.ai_blend;
    else val = data[selectedModel];
    
    const displayVal = val !== null ? `${val.toFixed(2)} mm` : 'N/A';
    
    popup.current.setHTML(`
      <div class="text-sm font-sans p-1 text-center">
        <div class="font-bold">New Delhi</div>
        <div class="text-xs text-slate-500 uppercase">${selectedModel}</div>
        <div class="font-medium text-blue-700 mt-1">${displayVal}</div>
      </div>
    `);
    
  }, [data, selectedModel]);

  return (
    <div className="relative w-full h-full border border-slate-200 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded shadow-sm border border-slate-200 text-xs text-slate-600 max-w-xs">
        <div className="font-semibold text-slate-800 mb-1">Spatial Data Limitation</div>
        Available spatial data currently limited to New Delhi historical point records.
      </div>
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded shadow-sm border border-slate-200 text-xs">
        <div className="font-semibold mb-1">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Data Point (Precipitation)</span>
        </div>
      </div>
    </div>
  );
}
"""

explorer_tsx = """import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getForecastData } from '../services/dataAdapter';
import WeatherMap from '../components/map/WeatherMap';

export default function ForecastExplorer() {
  const [leadTime, setLeadTime] = useState(24);
  const [selectedModel, setSelectedModel] = useState<'ecmwf'|'gfs'|'icon'|'reference'|'ai_blend'>('ecmwf');
  
  const rawData = useMemo(() => getForecastData('new_delhi', leadTime), [leadTime]);
  const data = useMemo(() => rawData.slice(-100), [rawData]); // last 100 entries
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="space-y-6 flex flex-col h-full pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Forecast Explorer</h1>
          <p className="text-slate-500 mt-1">Examine individual NWP models and blended output spatially and temporally.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Model:</label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="border border-slate-300 rounded shadow-sm text-sm p-2 bg-white min-w-[120px]"
            >
              <option value="ecmwf">ECMWF</option>
              <option value="gfs">GFS</option>
              <option value="icon">ICON</option>
              <option value="reference">ERA5 (Ref)</option>
              <option value="ai_blend" disabled>AI Blend (N/A)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Lead Time:</label>
            <select 
              value={leadTime} 
              onChange={(e) => setLeadTime(Number(e.target.value))}
              className="border border-slate-300 rounded shadow-sm text-sm p-2 bg-white"
            >
              <option value={24}>24 Hours</option>
              <option value={48} disabled>48 Hours (N/A)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[450px]">
        {/* Map Section */}
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <WeatherMap data={latestData} selectedModel={selectedModel} />
        </div>
        
        {/* Chart Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Precipitation Forecast (New Delhi)</h2>
          {data.length > 0 ? (
            <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="valid_time" tickFormatter={(t: any) => new Date(t).toLocaleDateString()} tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} unit="mm" />
                  <Tooltip labelFormatter={(t: any) => new Date(t).toLocaleString()} />
                  <Legend />
                  <Line type="monotone" dataKey="ecmwf" name="ECMWF" stroke="#2563eb" dot={false} strokeWidth={selectedModel === 'ecmwf' ? 3 : 1} />
                  <Line type="monotone" dataKey="gfs" name="GFS" stroke="#16a34a" dot={false} strokeWidth={selectedModel === 'gfs' ? 3 : 1} />
                  <Line type="monotone" dataKey="icon" name="ICON" stroke="#dc2626" dot={false} strokeWidth={selectedModel === 'icon' ? 3 : 1} />
                  <Line type="monotone" dataKey="reference" name="ERA5 (Ref)" stroke="#64748b" strokeDasharray="5 5" dot={false} strokeWidth={selectedModel === 'reference' ? 3 : 1} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              No data available for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"""

os.makedirs(os.path.join(base_dir, "src/components/map"), exist_ok=True)
with open(os.path.join(base_dir, "src/components/map/WeatherMap.tsx"), "w", encoding="utf-8") as f:
    f.write(map_tsx)
with open(os.path.join(base_dir, "src/pages/ForecastExplorer.tsx"), "w", encoding="utf-8") as f:
    f.write(explorer_tsx)

print("Scaffolded map successfully.")
