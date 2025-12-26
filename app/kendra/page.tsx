"use client";

import dynamic from "next/dynamic";
import { Navigation, MapPin } from "lucide-react";

// Lazy load the map (Critical for Leaflet)
const KendraMap = dynamic(() => import("@/components/KendraMap"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-[2.5rem]"></div>
});

export default function KendraPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm mb-6">
           <Navigation size={14} className="text-indigo-600" /> 
           <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sahayak Kendra Locator</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
          Find Help <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Near You.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Locate verified Common Service Centres (CSCs) to apply for schemes, update documents, and get biometric verification offline.
        </p>
      </div>

      {/* Map Section */}
      <div className="relative z-10">
        <KendraMap />
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-16">
        <InfoCard icon={<MapPin className="text-white"/>} title=" verified Centers" desc="All centers listed are government authorized CSC points." color="bg-indigo-500" />
        <InfoCard icon={<Navigation className="text-white"/>} title="Live Navigation" desc="Get precise directions to the center from your location." color="bg-cyan-500" />
        <InfoCard icon={<MapPin className="text-white"/>} title="Offline Support" desc="Get help with biometric updates and document scanning." color="bg-rose-500" />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-start gap-4 hover:-translate-y-1 transition-transform">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}