import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { WeatherData } from '../../services/dataAdapter';
import { RotateCcw, Plus, Minus, Navigation } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface WeatherMapProps {
  currentSample: WeatherData | null;
  activeModels?: {
    ecmwf: boolean;
    gfs: boolean;
    icon: boolean;
    reference: boolean;
  };
  onToggleModel?: (model: 'ecmwf' | 'gfs' | 'icon' | 'reference') => void;
  selectedLocation: {
    id: string;
    name: string;
    icao: string;
    latitude: number;
    longitude: number;
    elevation_m: number;
  };
  onSelectLocation?: (loc: { id: string; name: string; latitude: number; longitude: number }) => void;
}

// Regional Stations well-distributed across Northern India (No overlap)
const REGIONAL_STATIONS = [
  { name: 'New Delhi', temp: '28°C', rain: '6.1 mm', coords: [77.2090, 28.6139], isPrimary: true },
  { name: 'Jaipur', temp: '31°C', rain: '0.2 mm', coords: [75.7873, 26.9124] },
  { name: 'Agra', temp: '30°C', rain: '1.4 mm', coords: [78.0081, 27.1767] },
  { name: 'Chandigarh', temp: '26°C', rain: '9.6 mm', coords: [76.7794, 30.7333] },
  { name: 'Aligarh', temp: '29°C', rain: '4.8 mm', coords: [78.0880, 27.8974] },
  { name: 'Rohtak', temp: '28°C', rain: '2.1 mm', coords: [76.6066, 28.8955] },
];

// Dark Canvas Basemap Style
const MAP_STYLE_DARK: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-dark': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri &copy; OpenStreetMap'
    }
  },
  layers: [
    {
      id: 'esri-dark-layer',
      type: 'raster',
      source: 'esri-dark',
      minzoom: 0,
      maxzoom: 16
    }
  ]
};

// Light Canvas Basemap Style (Clean Light Sky Daytime)
const MAP_STYLE_LIGHT: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-light': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri &copy; OpenStreetMap'
    }
  },
  layers: [
    {
      id: 'esri-light-layer',
      type: 'raster',
      source: 'esri-light',
      minzoom: 0,
      maxzoom: 16
    }
  ]
};

// Generate smooth organic polygon coordinates around center
function createOrganicCircle(centerLng: number, centerLat: number, radiusKm: number, points = 48, noise = 0.22) {
  const coords: [number, number][] = [];
  const kmToDegLat = 1 / 110.574;
  const kmToDegLng = 1 / (111.320 * Math.cos(centerLat * Math.PI / 180));

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const r = radiusKm * (1 + Math.sin(angle * 3) * noise + Math.cos(angle * 2) * (noise * 0.7));
    const lng = centerLng + Math.cos(angle) * r * kmToDegLng;
    const lat = centerLat + Math.sin(angle) * r * kmToDegLat;
    coords.push([Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
  }
  return coords;
}

export default function WeatherMap({
  currentSample,
  selectedLocation
}: WeatherMapProps) {
  const { theme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [activeLayer, setActiveLayer] = useState<'temperature' | 'rainfall' | 'wind' | 'risk' | 'blend'>('rainfall');

  const newDelhiCoords: [number, number] = [selectedLocation.longitude, selectedLocation.latitude];

  const addWeatherLayers = useCallback((map: maplibregl.Map) => {
    // ── ADD VIBRANT DOPPLER WEATHER RADAR RAIN BANDS ──
    const outerRing = createOrganicCircle(77.2, 28.6, 140, 52, 0.28);
    const midRing = createOrganicCircle(77.25, 28.62, 95, 44, 0.22);
    const heavyRing = createOrganicCircle(77.22, 28.58, 60, 36, 0.2);
    const coreRing = createOrganicCircle(77.21, 28.6, 32, 28, 0.16);

    const cell2Outer = createOrganicCircle(77.7, 28.95, 65, 36, 0.24);
    const cell2Core = createOrganicCircle(77.68, 28.97, 30, 24, 0.18);

    if (map.getSource('weather-radar-bands')) return;

    map.addSource('weather-radar-bands', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { color: '#0284c7', opacity: 0.65 },
            geometry: { type: 'Polygon', coordinates: [outerRing] }
          },
          {
            type: 'Feature',
            properties: { color: '#06b6d4', opacity: 0.7 },
            geometry: { type: 'Polygon', coordinates: [cell2Outer] }
          },
          {
            type: 'Feature',
            properties: { color: '#10b981', opacity: 0.75 },
            geometry: { type: 'Polygon', coordinates: [midRing] }
          },
          {
            type: 'Feature',
            properties: { color: '#eab308', opacity: 0.8 },
            geometry: { type: 'Polygon', coordinates: [heavyRing] }
          },
          {
            type: 'Feature',
            properties: { color: '#f59e0b', opacity: 0.8 },
            geometry: { type: 'Polygon', coordinates: [cell2Core] }
          },
          {
            type: 'Feature',
            properties: { color: '#ef4444', opacity: 0.85 },
            geometry: { type: 'Polygon', coordinates: [coreRing] }
          }
        ]
      }
    });

    map.addLayer({
      id: 'weather-radar-layer',
      type: 'fill',
      source: 'weather-radar-bands',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': ['get', 'opacity']
      }
    });

    map.addLayer({
      id: 'weather-radar-outline',
      type: 'line',
      source: 'weather-radar-bands',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.8,
        'line-opacity': 0.85
      }
    });

    // Clean previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // ── ADD CITY LABELS WITH WEATHER STATION PINS ──
    const isLight = theme === 'light';

    REGIONAL_STATIONS.forEach((city) => {
      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none';

      if (city.isPrimary) {
        const currentRain = currentSample ? `${currentSample.reference.toFixed(1)} mm` : city.rain;
        const bgStyle = isLight
          ? 'background: rgba(255, 255, 255, 0.95); border: 2px solid #0284c7; box-shadow: 0 4px 18px rgba(2,132,199,0.3);'
          : 'background: rgba(11, 22, 40, 0.95); border: 1.5px solid #38bdf8; box-shadow: 0 4px 20px rgba(0,0,0,0.7);';
        const titleColor = isLight ? '#0c4a6e' : '#ffffff';
        const metricColor = isLight ? '#0284c7' : '#38bdf8';

        el.innerHTML = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="position: absolute; width: 40px; height: 40px; top: -6px; border-radius: 50%; background: rgba(56, 189, 248, 0.25); border: 2px solid #0284c7; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="${bgStyle} border-radius: 10px; padding: 4px 10px; display: flex; flex-direction: column; align-items: center; backdrop-filter: blur(12px);">
              <span style="font-size: 11px; font-weight: 800; color: ${titleColor}; letter-spacing: 0.02em;">${city.name}</span>
              <span style="font-size: 10px; font-weight: 700; color: ${metricColor}; font-family: monospace;">${city.temp} • ${currentRain}</span>
            </div>
            <div style="width: 9px; height: 9px; border-radius: 50%; background: #0284c7; border: 2px solid #ffffff; margin-top: 2px; box-shadow: 0 0 10px #0284c7;"></div>
          </div>
        `;
      } else {
        const bgStyle = isLight
          ? 'background: rgba(255, 255, 255, 0.92); border: 1px solid rgba(148, 163, 184, 0.5); box-shadow: 0 2px 8px rgba(2,132,199,0.15);'
          : 'background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(148, 163, 184, 0.4); box-shadow: 0 2px 10px rgba(0,0,0,0.5);';
        const titleColor = isLight ? '#1e293b' : '#f1f5f9';
        const tempColor = isLight ? '#0284c7' : '#94a3b8';

        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; opacity: 0.92; transition: opacity 0.2s;">
            <div style="${bgStyle} border-radius: 7px; padding: 3px 8px;">
              <span style="font-size: 10px; font-weight: 700; color: ${titleColor};">${city.name}</span>
              <span style="font-size: 10px; font-weight: 600; color: ${tempColor}; margin-left: 4px;">${city.temp}</span>
            </div>
            <div style="width: 5px; height: 5px; border-radius: 50%; background: #0284c7; margin-top: 2px;"></div>
          </div>
        `;
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(city.coords as [number, number])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [currentSample, theme]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapInstance.current) return;

    const initialStyle = theme === 'light' ? MAP_STYLE_LIGHT : MAP_STYLE_DARK;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [77.1, 28.3],
      zoom: 6.75,
      minZoom: 4,
      maxZoom: 12,
      attributionControl: false
    });

    map.on('load', () => {
      addWeatherLayers(map);
    });

    mapInstance.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update basemap style when theme changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const nextStyle = theme === 'light' ? MAP_STYLE_LIGHT : MAP_STYLE_DARK;
    mapInstance.current.setStyle(nextStyle);
    mapInstance.current.once('style.load', () => {
      if (mapInstance.current) {
        addWeatherLayers(mapInstance.current);
      }
    });
  }, [theme, addWeatherLayers]);

  const handleRecenter = useCallback(() => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({ center: newDelhiCoords, zoom: 6.9, speed: 1.4 });
  }, [newDelhiCoords]);

  const handleZoom = (delta: number) => {
    if (!mapInstance.current) return;
    mapInstance.current.zoomTo(mapInstance.current.getZoom() + delta, { duration: 300 });
  };

  const isLight = theme === 'light';

  return (
    <div className={`relative w-full h-full overflow-hidden select-none rounded-2xl shadow-xl transition-colors duration-300 ${
      isLight
        ? 'bg-[#e0f2fe] border border-sky-200/90 shadow-[0_8px_30px_rgba(2,132,199,0.12)]'
        : 'bg-[#08101e] border border-slate-700/40'
    }`}>
      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* ── TOP PILL TABS (MATCHING USER REFERENCE PHOTO) ───────────────── */}
      <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1 rounded-2xl shadow-xl backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/92 border border-sky-200/80 shadow-[0_4px_16px_rgba(2,132,199,0.15)]'
          : 'bg-[#0b162a]/92 border border-slate-700/60'
      }`}>
        <button
          onClick={() => setActiveLayer('temperature')}
          className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
            activeLayer === 'temperature'
              ? 'bg-sky-600 text-white shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-sky-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Temperature
        </button>

        <button
          onClick={() => setActiveLayer('rainfall')}
          className={`px-3.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
            activeLayer === 'rainfall'
              ? 'bg-sky-600 text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-sky-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Rainfall
        </button>

        <button
          onClick={() => setActiveLayer('wind')}
          className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
            activeLayer === 'wind'
              ? 'bg-sky-600 text-white shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-sky-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Wind
        </button>

        <button
          onClick={() => setActiveLayer('risk')}
          className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
            activeLayer === 'risk'
              ? 'bg-amber-600 text-white shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-sky-900'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Risk
        </button>

        <button
          onClick={() => setActiveLayer('blend')}
          className={`px-3.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
            activeLayer === 'blend'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : isLight
              ? 'bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200/70'
              : 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/60'
          }`}
        >
          <span>Multi-Model Blend</span>
        </button>
      </div>

      {/* ── RIGHT TOP TOOLS ──────────────────────────────────────────────── */}
      <div className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 rounded-xl shadow-md backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/92 border border-sky-200/80 shadow-[0_2px_8px_rgba(2,132,199,0.12)]'
          : 'bg-[#0b162a]/92 border border-slate-700/60'
      }`}>
        <button
          onClick={handleRecenter}
          title="Recenter on New Delhi"
          className={`p-1 rounded-lg transition-colors ${
            isLight ? 'text-slate-700 hover:text-sky-900 hover:bg-sky-100/60' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
        </button>
        <button
          onClick={handleRecenter}
          title="Center Location"
          className={`p-1 rounded-lg transition-colors ${
            isLight ? 'text-slate-700 hover:text-sky-900 hover:bg-sky-100/60' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
        </button>
      </div>

      {/* ── LEFT VERTICAL ZOOM CONTROLS ──────────────────────────────────── */}
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 p-1 rounded-xl shadow-md backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/92 border border-sky-200/80 shadow-[0_2px_8px_rgba(2,132,199,0.12)]'
          : 'bg-[#0b162a]/92 border border-slate-700/60'
      }`}>
        <button
          onClick={() => handleZoom(1)}
          title="Zoom In"
          className={`p-1.5 rounded-lg transition-colors ${
            isLight ? 'text-slate-700 hover:text-sky-900 hover:bg-sky-100/60' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-sky-600" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          title="Zoom Out"
          className={`p-1.5 rounded-lg transition-colors ${
            isLight ? 'text-slate-700 hover:text-sky-900 hover:bg-sky-100/60' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Minus className="w-3.5 h-3.5 text-sky-600" />
        </button>
      </div>

      {/* ── RIGHT VERTICAL TEMPERATURE / RAIN COLOR SCALE ───────────────── */}
      <div className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-2xl shadow-lg backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/92 border border-sky-200/80 shadow-[0_4px_16px_rgba(2,132,199,0.12)]'
          : 'bg-[#0b162a]/92 border border-slate-700/60'
      }`}>
        <span className={`text-[9px] font-bold font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>°C</span>
        <div className="w-2 h-36 rounded-full bg-gradient-to-b from-red-500 via-amber-400 via-emerald-400 via-sky-400 to-blue-700 shadow-inner" />
        <div className={`flex flex-col justify-between h-36 text-[8px] font-mono font-bold -mt-36 pr-3.5 self-start ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <span>40</span>
          <span>35</span>
          <span>30</span>
          <span>25</span>
          <span>20</span>
          <span>15</span>
          <span>10</span>
          <span>5</span>
        </div>
      </div>

      {/* ── BOTTOM INTENSITY GRADIENT SPECTRUM ───────────────────────────── */}
      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl shadow-lg backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/92 border border-sky-200/80 shadow-[0_4px_16px_rgba(2,132,199,0.12)]'
          : 'bg-[#0b162a]/92 border border-slate-700/60'
      }`}>
        <div className="w-64 h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 via-orange-500 to-purple-600 shadow-sm" />
        <div className={`w-64 flex justify-between text-[8px] font-bold tracking-widest uppercase ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <span>LOW</span>
          <span>MODERATE</span>
          <span>HIGH</span>
          <span>EXTREME</span>
        </div>
      </div>
    </div>
  );
}
