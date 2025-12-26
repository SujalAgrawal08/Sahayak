"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2, Navigation } from "lucide-react";

// Fix for default Leaflet marker icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper to recenter map when user moves
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
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
          alert("Location access denied. Showing default view (India).");
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
      setKendras(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !location) return <div className="h-96 flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-200"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="relative h-[600px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-indigo-200/50">
      <MapContainer center={location} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ChangeView center={location} />

        {/* User Marker */}
        <Marker position={location} icon={icon}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Kendra Markers */}
        {kendras.map((k) => (
          <Marker 
            key={k._id} 
            position={[k.location.coordinates[1], k.location.coordinates[0]]} 
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-slate-900">{k.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{k.address}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {k.services.map((s: string) => (
                    <span key={s} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{s}</span>
                  ))}
                </div>
                <a href={`tel:${k.contact}`} className="block mt-3 text-center bg-slate-900 text-white text-xs py-1.5 rounded-lg font-bold">Call Now</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Overlay Badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
         <span className="text-xs font-bold text-slate-700">{kendras.length} Centers Found</span>
      </div>
    </div>
  );
}