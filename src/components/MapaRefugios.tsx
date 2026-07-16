import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Refugio, REFUGIOS, DISTRITOS } from '../data/refugios';

declare const L: any;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distKmText(r: Refugio, lat: number, lng: number) {
  const d = haversineKm(lat, lng, r.lat, r.lng);
  return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
}

const MAPBOX_TOKEN = '';

export default function MapaRefugios() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [leafletReady, setLeafletReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // Load Leaflet from CDN once
  useEffect(() => {
    if ((window as any).__leafletLoaded) { setLeafletReady(true); return; }
    if ((window as any).__leafletLoading) return;
    (window as any).__leafletLoading = true;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      (window as any).__leafletLoaded = true;
      setLeafletReady(true);
    };
    document.body.appendChild(script);
  }, []);

  const filtered = useMemo(() => {
    return REFUGIOS.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDistrict = !districtFilter || r.district === districtFilter;
      return matchSearch && matchDistrict;
    });
  }, [searchQuery, districtFilter]);

  // Initialize map once Leaflet is ready
  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: false }).setView([-13.065, -76.38], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [leafletReady]);

  // Update markers when filter or data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !leafletReady) return;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    if (filtered.length === 0) return;

    const bounds: any[] = [];
    filtered.forEach((r) => {
      const isHighlight = r.id === 'mascotas-undc';
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px;
          background: ${isHighlight ? '#fc9d41' : '#00346f'};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ${isHighlight ? 'animation: undc-marker-pulse 1.5s ease-in-out infinite;' : ''}
        "><div style="
          transform: rotate(45deg);
          display: flex; align-items: center; justify-content: center;
          height: 100%; width: 100%;
          font-size: 14px;
        ">🐾</div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([r.lat, r.lng], { icon }).addTo(map);
      bounds.push([r.lat, r.lng]);

      const userDist = userLocation
        ? `<p style="font-size:10px;color:#94a3b8;margin-top:4px">~${distKmText(r, userLocation.lat, userLocation.lng)} de ti</p>`
        : '';

      marker.bindPopup(`
        <div style="min-width:220px;font-family:system-ui,sans-serif">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:18px">🐾</span>
            <h3 style="font-weight:700;font-size:13px;color:#1e293b;margin:0">${r.name}</h3>
          </div>
          <div style="font-size:11px;color:#64748b">
            <p style="margin:2px 0;display:flex;align-items:center;gap:4px">
              <span style="font-size:14px;color:#94a3b8">📍</span>
              ${r.address}, ${r.district}
            </p>
            <p style="margin:2px 0">🐶 Perros: ${r.dogs} &nbsp; 🐱 Gatos: ${r.cats}</p>
            <p style="margin:2px 0;display:flex;align-items:center;gap:4px">
              <span style="font-size:14px;color:#94a3b8">🕒</span>
              ${r.schedule}
            </p>
            <p style="margin:2px 0;display:flex;align-items:center;gap:4px">
              <span style="font-size:14px;color:#94a3b8">📞</span>
              ${r.phone}
            </p>
            ${userDist}
          </div>
          <div style="margin-top:10px">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}"
               target="_blank" rel="noopener noreferrer"
               style="display:block;text-align:center;background:#00346f;color:white;font-size:10px;font-weight:700;padding:6px 12px;border-radius:8px;text-decoration:none">
              Cómo llegar
            </a>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [leafletReady, filtered, userLocation]);

  return (
    <section className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 space-y-3">
          <span className="inline-block bg-[#00346f]/10 text-[#00346f] font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Mapa Interactivo
          </span>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900">
            Refugios y Veterinarias
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Encuentra refugios, albergues y centros de atención veterinaria cerca de la Universidad Nacional de Cañete.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="flex-grow relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar refugio por nombre..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f] rounded-xl"
            />
          </div>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00346f] rounded-xl"
          >
            <option value="">Todos los distritos</option>
            {DISTRITOS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div
          ref={containerRef}
          className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md"
          style={{ height: '480px', background: '#f1f5f9' }}
        >
          {!leafletReady && (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Cargando mapa...
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(r => (
            <div
              key={r.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:shadow-md hover:border-[#00346f]/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-xs text-slate-900">{r.name}</h4>
                <span className="text-[10px] bg-[#00346f]/10 text-[#00346f] font-bold px-2 py-0.5 rounded-full">
                  {r.district}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                {r.address}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-slate-600">
                <span>🐶 {r.dogs}</span>
                <span>🐱 {r.cats}</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  {r.schedule}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-[#00346f] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#002450] transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">directions</span>
                  Cómo llegar
                </a>
                {userLocation && (
                  <span className="text-[10px] text-slate-400 self-center ml-auto">
                    ~{distKmText(r, userLocation.lat, userLocation.lng)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {searchQuery && filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">
            No se encontraron refugios con el nombre "{searchQuery}"
          </div>
        )}
      </div>

      <style>{`
        @keyframes undc-marker-pulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 2px 16px rgba(252,157,65,0.6); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
        }
      `}</style>
    </section>
  );
}
