"use client";

import { signIn } from "next-auth/react";
import { Mic, ScanEye, Zap, ArrowRight, LayoutGrid, Globe, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FDFBF7]">
      
      {/* 1. Background Effects (Aurora + Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      {/* 2. Main Hero Content */}
      {/* Added pt-48 to create the GAP you requested between Navbar and Text */}
      <div className="relative pt-48 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:scale-105 transition-transform cursor-default">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">V2.0 Now Live: Multi-modal Analysis</span>
        </div>
        
        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
          Governance meets <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-fuchsia-600 to-indigo-600 animate-gradient">
            Artificial Intelligence.
          </span>
        </h1>
        
        {/* Subhead */}
        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Sahayak X aggregates <span className="text-slate-900 font-bold">5,000+ schemes</span> using Vector Search, OCR, and Voice Recognition to deliver personalized citizen services.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <button 
            onClick={() => signIn("google")}
            className="group bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/20 hover:scale-105 hover:shadow-slate-900/40"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
            <span>Continue with Google</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
          
          <button className="px-8 py-4 rounded-full text-lg font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
            <Globe size={20} /> How it works
          </button>
        </div>
      </div>

      {/* 3. Feature Grid (Floating Cards) */}
      <div className="max-w-6xl mx-auto px-4 mt-10 grid md:grid-cols-3 gap-6 pb-32 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
        <FeatureCard 
          icon={<Mic className="text-white" size={24} />}
          color="bg-orange-500"
          title="Project Vaani"
          desc="Speak in Hinglish. Our Llama-3 engine understands 12+ dialects instantly."
          delay="delay-0"
        />
        <FeatureCard 
          icon={<ScanEye className="text-white" size={24} />}
          color="bg-indigo-500"
          title="Project Netra"
          desc="Upload blurry IDs. We extract data with 99% accuracy using Computer Vision."
          delay="delay-100"
        />
        <FeatureCard 
          icon={<LayoutGrid className="text-white" size={24} />}
          color="bg-rose-500"
          title="Vector Engine"
          desc="Semantic search finds schemes based on 'meaning', not just keywords."
          delay="delay-200"
        />
      </div>
    </div>
  );
}

// Reusable Feature Card Component
function FeatureCard({ icon, color, title, desc, delay }: any) {
  return (
    <div className={`p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 hover:bg-white transition-all duration-500 group ${delay}`}>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}