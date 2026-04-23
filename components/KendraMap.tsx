"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2, Navigation, MapPin } from "lucide-react";

// Fix for default Leaflet marker icons in Next.js
const userIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom icon for Kendra centers (different color via CSS filter)
const kendraIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "kendra-marker",
});

// Helper to recenter map when user moves
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

/**
 * Haversine distance calculation (client-side fallback).
 * Used when API doesn't return pre-computed distance.
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function KendraMap() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [kendras, setKendras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation([latitude, longitude]);
          fetchKendras(latitude, longitude);
        },
        (err) => {
          console.warn("Location access denied:", err.message);
          setLocation([23.2599, 77.4126]); // Default Bhopal
          fetchKendras(23.2599, 77.4126);
        }
      );
    }
  }, []);

  const fetchKendras = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/kendras?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      
      // Enrich with distance if not provided by API
      const enriched = data.map((k: any) => ({
        ...k,
        distance_km: k.distance_km || haversineDistance(
          lat, lng,
          k.location?.coordinates?.[1] || 0,
          k.location?.coordinates?.[0] || 0
        ),
      }));
      
      // Sort by distance (nearest first)
      enriched.sort((a: any, b: any) => (a.distance_km || 0) - (b.distance_km || 0));
      
      setKendras(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !location) {
    return (
      <div 
        className="h-96 flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-200"
        role="status"
        aria-label="Loading map"
      >
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="sr-only">Loading map and nearby centers...</span>
      </div>
    );
  }

  return (
    <div 
      className="relative h-[600px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-indigo-200/50"
      role="region"
      aria-label="Sahayak Kendra Map showing nearby government service centers"
    >
      <MapContainer center={location} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ChangeView center={location} />

        {/* User Marker */}
        <Marker position={location} icon={userIcon}>
          <Popup>
            <div className="font-bold text-slate-900">📍 You are here</div>
          </Popup>
        </Marker>

        {/* Kendra Markers — sorted by proximity */}
        {kendras.map((k) => (
          <Marker 
            key={k._id} 
            position={[
              k.location?.coordinates?.[1] || 0, 
              k.location?.coordinates?.[0] || 0
            ]} 
            icon={kendraIcon}
          >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <h3 className="font-bold text-slate-900 text-sm">{k.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{k.address}</p>
                
                {/* Distance Badge */}
                <div className="flex items-center gap-1 mt-2 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full w-fit" aria-label={`${k.distance_km} kilometers away`}>
                  <Navigation size={10} />
                  <span className="text-[10px] font-bold">{k.distance_km} km away</span>
                </div>
                
                {/* Services */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {k.services?.map((s: string) => (
                    <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{s}</span>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <a 
                    href={`tel:${k.contact}`} 
                    className="flex-1 text-center bg-slate-900 text-white text-xs py-1.5 rounded-lg font-bold"
                    aria-label={`Call ${k.name}`}
                  >
                    Call Now
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${k.location?.coordinates?.[1]},${k.location?.coordinates?.[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-indigo-500 text-white text-xs py-1.5 rounded-lg font-bold"
                    aria-label={`Get directions to ${k.name}`}
                  >
                    Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Overlay Badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2" role="status" aria-live="polite">
         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
         <span className="text-xs font-bold text-slate-700">{kendras.length} Centers Found</span>
      </div>

      {/* Distance List Panel */}
      {kendras.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-3 max-h-[180px] overflow-y-auto w-[220px]" role="list" aria-label="Nearby centers sorted by distance">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MapPin size={10} /> Nearest Centers
          </h4>
          {kendras.slice(0, 5).map((k, i) => (
            <div key={k._id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0" role="listitem">
              <span className="text-[11px] font-medium text-slate-700 truncate max-w-[140px]">{k.name}</span>
              <span className="text-[10px] font-bold text-indigo-600 whitespace-nowrap">{k.distance_km} km</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}