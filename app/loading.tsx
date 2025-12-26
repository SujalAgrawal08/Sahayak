"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] z-[9999]">
      
      {/* Animated Logo Container */}
      <div className="relative mb-8">
        {/* Pulsing Background Rings */}
        <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping"></div>
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse delay-75"></div>
        
        {/* Main Logo */}
        <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 z-10">
           <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
             S
           </div>
        </div>
        
        {/* Spinning Ring */}
        <div className="absolute -inset-4 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin"></div>
      </div>

      {/* Loading Text */}
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 animate-pulse">
        Sahayak <span className="text-rose-500">X</span>
      </h2>
      <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
        <Loader2 size={14} className="animate-spin" />
        Preparing your dashboard...
      </p>

    </div>
  );
}