"use client";

import dynamic from "next/dynamic"; // React Flow must be client-side only
import { Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTransition } from "@/components/TransitionProvider";

const SchemeGraph = dynamic(() => import("@/components/SchemeGraph"), { ssr: false });

export default function GraphPage() {
  const { navigate } = useTransition();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors">
             <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Scheme <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Ecosystem.</span>
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl">
            Interactive dependency graph showing relationships between Ministries, Categories, and Welfare Schemes.
          </p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="w-3 h-3 rounded-full bg-slate-900"></span> Ministry
          <span className="w-3 h-3 rounded-full bg-white border border-slate-300 ml-2"></span> Scheme
        </div>
      </div>

      {/* The Graph Visualizer */}
      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <SchemeGraph />
      </div>

    </div>
  );
}