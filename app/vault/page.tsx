"use client";

import { useTransition } from "@/components/TransitionProvider";
import { Database, Shield, WifiOff, ArrowLeft, FileText, Check } from "lucide-react";

export default function VaultPage() {
  const { navigate } = useTransition();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-4xl mx-auto">
      
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
         <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
            <Database size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black mb-4">Offline Vault</h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Secure local storage. Your forms and documents are saved here instantly, even when the internet is down.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield size={20} className="text-emerald-500" /> Local Encrypted Data
        </h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage: 2.4 MB Used</span>
      </div>

      <div className="grid gap-4">
        <VaultItem 
          title="PM Kisan Application Draft" 
          date="Saved 2 mins ago" 
          size="12 KB"
          status="Pending Sync"
        />
        <VaultItem 
          title="Income Certificate Scan" 
          date="Saved yesterday" 
          size="2.4 MB"
          status="Synced"
        />
      </div>

    </div>
  );
}

function VaultItem({ title, date, size, status }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-lg transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500">{date} • {size}</p>
        </div>
      </div>
      
      <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${
        status === "Synced" 
          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
          : "bg-amber-50 text-amber-600 border-amber-100"
      }`}>
        {status === "Pending Sync" ? <WifiOff size={12} /> : <Check size={12} />}
        {status}
      </div>
    </div>
  );
}