import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Navigation, Layers, Sun, Wind, Zap, Radio, Maximize2, Crosshair } from 'lucide-react';

export default function GeospatialMap() {
  const { 
    selectedState, 
    selectedCity, 
    selectedArea, 
    setSelectedArea, 
    availableAreas, 
    forecastData 
  } = useApp();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('scada'); // 'scada' or 'satellite'

  const coords = forecastData?.coordinates || { latitude: 22.9868, longitude: 72.3814 };
  const lat = coords.latitude || 22.9868;
  const lon = coords.longitude || 72.3814;

  const solarPark = forecastData?.solar_park || 'Solar PV Array';
  const windPark = forecastData?.wind_park || 'Wind Turbine Cluster';
  const substation = forecastData?.grid_operator || 'Substation Node';
  const areaName = forecastData?.selected_area || selectedArea || 'Active Zone';

  const schedule = forecastData?.hourly_schedule || [];
  const currentPoint = schedule[8] || schedule[0] || {};
  const solarMw = currentPoint.solar_generation_mw ?? 78.5;
  const windMw = currentPoint.wind_generation_mw ?? 14.2;
  const totalMw = currentPoint.total_renewable_mw ?? (solarMw + windMw);
  const status = currentPoint.system_status || 'SURPLUS';

  // 1. Load Leaflet script & CSS dynamically
  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Positron clean light tile layer
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive across small re-renders, clean up on unmount
    };
  }, [mapLoaded]);

  // 3. Update Markers & Fly-To when coordinates or area changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Smooth fly to new coordinates
    map.flyTo([lat, lon], 12, {
      animate: true,
      duration: 1.2
    });

    const L = window.L;

    // A. Substation Interconnection Marker (Center)
    const substationIcon = L.divIcon({
      className: 'custom-substation-pin',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <span class="absolute w-8 h-8 rounded-full bg-blue-500/20 animate-ping"></span>
          <div class="relative px-2 py-1 rounded-lg bg-slate-900 text-white border border-blue-400 shadow-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 transition-transform">
            <span class="w-2 h-2 rounded-full ${status === 'SURPLUS' ? 'bg-emerald-400' : status === 'DEFICIT' ? 'bg-amber-400' : 'bg-blue-400'} animate-pulse"></span>
            <span class="text-[11px] font-bold font-mono tracking-tight">${areaName}</span>
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    const subMarker = L.marker([lat, lon], { icon: substationIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: monospace; font-size: 12px; padding: 4px;">
          <strong style="color: #0f172a; font-size: 13px;">${areaName}</strong><br/>
          <span style="color: #2563eb;">Substation: ${substation}</span><br/>
          <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;"/>
          <span>Solar Output: <strong>${solarMw.toFixed(1)} MW</strong></span><br/>
          <span>Wind Output: <strong>${windMw.toFixed(1)} MW</strong></span><br/>
          <span>Total Generation: <strong style="color: #059669;">${totalMw.toFixed(1)} MW</strong></span><br/>
          <span>Dispatch Status: <strong>${status}</strong></span>
        </div>
      `);
    markersRef.current.push(subMarker);

    // B. Solar Plant Marker (Offset slightly North-West)
    const solarLat = lat + 0.022;
    const solarLon = lon - 0.025;
    const solarIcon = L.divIcon({
      className: 'custom-solar-pin',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div class="px-2 py-1 rounded-lg bg-amber-500 text-white border border-amber-300 shadow-md flex items-center gap-1 whitespace-nowrap">
            <span class="text-xs">☀️</span>
            <span class="text-[10px] font-mono font-bold">${solarMw.toFixed(0)} MW</span>
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });
    const solMarker = L.marker([solarLat, solarLon], { icon: solarIcon })
      .addTo(map)
      .bindPopup(`<strong>${solarPark}</strong><br/>Predicted Generation: ${solarMw.toFixed(1)} MW`);
    markersRef.current.push(solMarker);

    // C. Wind Turbine Marker (Offset slightly South-East)
    const windLat = lat - 0.024;
    const windLon = lon + 0.028;
    const windIcon = L.divIcon({
      className: 'custom-wind-pin',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div class="px-2 py-1 rounded-lg bg-cyan-600 text-white border border-cyan-300 shadow-md flex items-center gap-1 whitespace-nowrap">
            <span class="text-xs">💨</span>
            <span class="text-[10px] font-mono font-bold">${windMw.toFixed(0)} MW</span>
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });
    const wndMarker = L.marker([windLat, windLon], { icon: windIcon })
      .addTo(map)
      .bindPopup(`<strong>${windPark}</strong><br/>Predicted Generation: ${windMw.toFixed(1)} MW`);
    markersRef.current.push(wndMarker);

    // D. Add Interconnection Power Line (Polyline)
    const powerLine = L.polyline([
      [solarLat, solarLon],
      [lat, lon],
      [windLat, windLon]
    ], {
      color: '#3b82f6',
      weight: 2,
      opacity: 0.6,
      dashArray: '4, 6'
    }).addTo(map);
    markersRef.current.push(powerLine);

    // E. Plot other nearby areas in this city as clickable nodes
    if (availableAreas && availableAreas.length > 1) {
      availableAreas.forEach(ar => {
        if (ar.id !== selectedArea && ar.latitude && ar.longitude) {
          const areaPin = L.divIcon({
            className: 'nearby-area-pin',
            html: `
              <div class="flex items-center gap-1 bg-white border border-slate-300 rounded-md px-1.5 py-0.5 shadow-sm opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span class="text-[9px] font-mono text-slate-700 truncate max-w-[90px]">${ar.name.split('(')[0].trim()}</span>
              </div>
            `,
            iconSize: [0, 0]
          });

          const nearMarker = L.marker([ar.latitude, ar.longitude], { icon: areaPin })
            .addTo(map)
            .on('click', () => {
              setSelectedArea(ar.id);
            });
          markersRef.current.push(nearMarker);
        }
      });
    }

  }, [lat, lon, areaName, selectedArea, availableAreas, mapLoaded, solarMw, windMw, status]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 12, { duration: 0.8 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-4 lg:px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-mono">Geospatial Renewable Dispatch Map</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                GPS SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Interconnection: <strong className="text-slate-800">{areaName}</strong> • {substation}
            </p>
          </div>
        </div>

        {/* Telemetry pill & controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-600">
            <span>{lat.toFixed(4)}°N, {lon.toFixed(4)}°E</span>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handleRecenter}
              title="Recenter Map"
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="px-2 py-1 text-xs font-mono font-bold hover:bg-slate-100 text-slate-700 rounded cursor-pointer transition-colors"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="px-2 py-1 text-xs font-mono font-bold hover:bg-slate-100 text-slate-700 rounded cursor-pointer transition-colors"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* Map display area */}
      <div className="relative w-full h-[280px] sm:h-[340px] bg-slate-100">
        {/* Leaflet container */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Legend / Telemetry HUD */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl px-3 py-2 shadow-md flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-800 font-semibold">{solarMw.toFixed(0)} MW Solar</span>
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-slate-800 font-semibold">{windMw.toFixed(0)} MW Wind</span>
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-emerald-700 font-bold">{totalMw.toFixed(0)} MW RE Feed</span>
          </div>
        </div>

        {/* Quick Area Switcher Overlay in Top Right */}
        {availableAreas && availableAreas.length > 1 && (
          <div className="hidden md:flex absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-2.5 shadow-md flex-col gap-1 max-w-[210px]">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold px-1">Nearby Feeders:</span>
            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto">
              {availableAreas.map(ar => (
                <button
                  key={ar.id}
                  onClick={() => setSelectedArea(ar.id)}
                  className={`text-left px-2 py-1 rounded text-xs font-mono transition-all cursor-pointer truncate ${
                    ar.id === selectedArea 
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  • {ar.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
