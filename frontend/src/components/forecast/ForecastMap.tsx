import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { WeatherData } from '../../services/dataAdapter';
import {
  RotateCcw,
  Plus,
  Minus,
  Lock
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ForecastMapProps {
  currentSample: WeatherData;
  activeModels: {
    ecmwf: boolean;
    gfs: boolean;
    icon: boolean;
    reference: boolean;
  };
  onSelectStation?: () => void;
  isStationSelected?: boolean;
}

// Light Canvas Basemap Style
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

export default function ForecastMap({
  currentSample,
  activeModels,
  onSelectStation,
  isStationSelected = true
}: ForecastMapProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Map mode selector: PRECIPITATION | MODELS | REFERENCE | AI BLEND (PENDING)
  const [mapMode, setMapMode] = useState<'precipitation' | 'models' | 'reference'>('precipitation');

  const delhiLng = currentSample.longitude || 77.2090;
  const delhiLat = currentSample.latitude || 28.6139;

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: isLight ? MAP_STYLE_LIGHT : MAP_STYLE_DARK,
      center: [delhiLng + 0.5, delhiLat - 0.2], // Centered nicely with space for overlays
      zoom: 6.2,
      minZoom: 4,
      maxZoom: 12,
      attributionControl: false
    });

    mapInstance.current = map;

    map.on('load', () => {
      // Create rich meteorological station point marker
      const el = document.createElement('div');
      el.className = 'station-point-marker cursor-pointer group';
      el.id = 'new-delhi-station-marker';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <!-- Pulsing Beacon Halo -->
          <span class="absolute w-8 h-8 rounded-full ${
            currentSample.reference > 1.0 ? 'bg-sky-500/30' : 'bg-blue-500/20'
          } animate-ping"></span>
          <span class="absolute w-6 h-6 rounded-full ${
            currentSample.reference > 1.0 ? 'bg-sky-400/40' : 'bg-blue-400/25'
          }"></span>

          <!-- Inner Solid Pin -->
          <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
          </div>

          <!-- Meteorological Station Badge Tag -->
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md transition-all ${
            isLight
              ? 'bg-white/95 text-slate-900 border border-sky-300'
              : 'bg-[#0f1d35]/95 text-white border border-slate-600'
          } flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>New Delhi (Safdarjung)</span>
            <span class="font-mono text-blue-600 font-extrabold">${
              mapMode === 'reference'
                ? currentSample.reference.toFixed(1) + ' mm (ERA5)'
                : currentSample.icon.toFixed(1) + ' mm'
            }</span>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        if (onSelectStation) onSelectStation();
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([delhiLng, delhiLat])
        .addTo(map);

      markerRef.current = marker;
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapInstance.current = null;
    };
  }, [isLight]);

  // Update marker HTML when sample, mode or selection changes
  useEffect(() => {
    if (!markerRef.current) return;
    const el = markerRef.current.getElement();
    if (!el) return;

    const precipVal =
      mapMode === 'reference'
        ? `${currentSample.reference.toFixed(1)} mm (ERA5)`
        : mapMode === 'models'
        ? `ICON: ${currentSample.icon.toFixed(1)} | GFS: ${currentSample.gfs.toFixed(1)}`
        : `Precip: ${currentSample.icon.toFixed(1)} mm`;

    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <!-- Pulsing Beacon Halo -->
        <span class="absolute w-8 h-8 rounded-full ${
          currentSample.reference > 1.0 ? 'bg-sky-500/30' : 'bg-blue-500/20'
        } animate-ping"></span>
        <span class="absolute w-6 h-6 rounded-full ${
          currentSample.reference > 1.0 ? 'bg-sky-400/40' : 'bg-blue-400/25'
        }"></span>

        <!-- Inner Solid Pin -->
        <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center ring-2 ${
          isStationSelected ? 'ring-blue-400' : 'ring-transparent'
        }">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        </div>

        <!-- Meteorological Station Badge Tag -->
        <div class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md transition-all ${
          isLight
            ? 'bg-white/95 text-slate-900 border border-sky-300'
            : 'bg-[#0f1d35]/95 text-white border border-slate-600'
        } flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>New Delhi</span>
          <span class="font-mono text-blue-600 font-extrabold">${precipVal}</span>
        </div>
      </div>
    `;
  }, [currentSample, mapMode, isLight, isStationSelected]);

  // Recenter map
  const handleRecenter = useCallback(() => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({
      center: [delhiLng + 0.5, delhiLat - 0.2],
      zoom: 6.2,
      duration: 1000
    });
  }, [delhiLng, delhiLat]);

  const handleZoomIn = () => {
    if (mapInstance.current) mapInstance.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstance.current) mapInstance.current.zoomOut();
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-sky-200/80 bg-slate-100 flex flex-col">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full min-h-0 relative z-0" />

      {/* ── TOP-LEFT: MAP MODE SELECTOR (Section 7) ───────────────────────── */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 p-1 rounded-xl backdrop-blur-md shadow-md border text-xs font-semibold bg-white/90 border-sky-200/90 text-slate-800">
        <button
          onClick={() => setMapMode('precipitation')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            mapMode === 'precipitation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          PRECIPITATION
        </button>

        <button
          onClick={() => setMapMode('models')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            mapMode === 'models'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          MODELS
        </button>

        <button
          onClick={() => setMapMode('reference')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            mapMode === 'reference'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          REFERENCE (ERA5)
        </button>

        {/* AI BLEND (VISIBLY DISABLED / PENDING PER SECTION 7) */}
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100/90 text-slate-400 border border-dashed border-slate-300 cursor-not-allowed select-none"
          title="AI Dynamic Blending pending offline training execution. No fake spatial surfaces."
        >
          <Lock className="w-3 h-3 text-slate-400" />
          <span>AI BLEND</span>
          <span className="ml-0.5 px-1 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            PENDING
          </span>
        </div>
      </div>

      {/* ── TOP-RIGHT: MAP CONTROLS & SUBTLE "POINT DATA" BADGE (Section 6) ─ */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-2">
        {/* Subtle Required POINT DATA Badge */}
        <div
          className={`px-2.5 py-1 rounded-xl backdrop-blur-md shadow-md border text-[10px] font-bold flex items-center gap-1.5 ${
            isLight
              ? 'bg-white/90 border-sky-200 text-sky-950'
              : 'bg-[#0f1d35]/90 border-slate-700 text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="tracking-wide">POINT DATA</span>
          <span className="opacity-60 font-mono">• 24h Lead</span>
        </div>

        {/* Zoom & Recenter Controls */}
        <div
          className={`flex items-center p-0.5 rounded-xl backdrop-blur-md shadow-md border ${
            isLight
              ? 'bg-white/90 border-sky-200 text-slate-700'
              : 'bg-[#0f1d35]/90 border-slate-700 text-slate-200'
          }`}
        >
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-lg hover:bg-sky-100/70 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-lg hover:bg-sky-100/70 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRecenter}
            className="p-1 rounded-lg hover:bg-sky-100/70 transition-colors"
            title="Recenter New Delhi"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM-LEFT: SCALE & GEOGRAPHIC CONTEXT (Section 6) ───────────── */}
      <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-2">
        {/* Geographic context tag */}
        <div
          className={`px-2 py-0.5 rounded-lg backdrop-blur-md text-[10px] font-mono border ${
            isLight
              ? 'bg-white/85 border-sky-200/80 text-slate-700 shadow-xs'
              : 'bg-[#0f1d35]/85 border-slate-700 text-slate-300'
          }`}
        >
          <span>India IMD Domain • Safdarjung AWS (VIDP)</span>
        </div>

        {/* Map Scale Graphic */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg backdrop-blur-md text-[10px] font-mono border ${
            isLight
              ? 'bg-white/85 border-sky-200/80 text-slate-600 shadow-xs'
              : 'bg-[#0f1d35]/85 border-slate-700 text-slate-400'
          }`}
        >
          <div className="w-8 h-1 bg-slate-500 rounded-full" />
          <span>100 km</span>
        </div>
      </div>

      {/* ── BOTTOM-RIGHT: ACTIVE MODEL LEGEND ON MAP ──────────────────────── */}
      <div
        className={`absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 rounded-xl backdrop-blur-md shadow-sm border text-[10px] font-mono flex items-center gap-2.5 ${
          isLight
            ? 'bg-white/90 border-sky-200/90 text-slate-700'
            : 'bg-[#0f1d35]/90 border-slate-700 text-slate-300'
        }`}
      >
        <span className="font-sans font-bold text-[9px] uppercase tracking-wider text-slate-500">
          Models:
        </span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span className={activeModels.ecmwf ? 'font-bold' : 'line-through opacity-40'}>ECMWF</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className={activeModels.gfs ? 'font-bold' : 'line-through opacity-40'}>GFS</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className={activeModels.icon ? 'font-bold' : 'line-through opacity-40'}>ICON</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-0.5 bg-slate-500" />
          <span className={activeModels.reference ? 'font-bold' : 'line-through opacity-40'}>ERA5</span>
        </div>
      </div>
    </div>
  );
}
