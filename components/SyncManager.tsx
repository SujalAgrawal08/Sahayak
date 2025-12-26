"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function SyncManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [showSyncing, setShowSyncing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = async () => {
      setIsOnline(true);
      setShowSyncing(true);
      // Simulate data syncing to server
      await new Promise(r => setTimeout(r, 2000));
      setShowSyncing(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showSyncing) return null; // Invisible when everything is normal

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in">
      <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
        !isOnline 
          ? "bg-slate-900/90 text-white border-slate-800" 
          : "bg-emerald-500/90 text-white border-emerald-400"
      }`}>
        
        {!isOnline && (
          <>
            <div className="relative">
              <WifiOff size={20} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-slate-900"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Offline Mode</span>
              <span className="text-[10px] text-slate-300 font-medium">Changes saved to Vault</span>
            </div>
          </>
        )}

        {isOnline && showSyncing && (
          <>
             <RefreshCw size={20} className="animate-spin" />
             <div className="flex flex-col">
              <span className="text-sm font-bold">Back Online</span>
              <span className="text-[10px] text-emerald-100 font-medium">Syncing data...</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}