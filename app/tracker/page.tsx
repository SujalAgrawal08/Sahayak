"use client";

import dynamic from "next/dynamic"; // Important for DnD
import { LayoutDashboard } from "lucide-react";

// Disable SSR for Drag & Drop
const KanbanBoard = dynamic(() => import("@/components/KanbanBoard"), { ssr: false });

export default function TrackerPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="mb-10">
         <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 px-4 py-1.5 rounded-full shadow-sm mb-4">
             <LayoutDashboard size={14} className="text-purple-600" /> 
             <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Application Tracker</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Applications.</span>
          </h1>
          <p className="text-slate-500 text-lg">
            Real-time status updates of all your submitted government scheme applications.
          </p>
      </div>

      {/* The Board */}
      <div className="overflow-x-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}