"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

// Context to share the navigation function
const TransitionContext = createContext({
  navigate: (path: string) => {},
});

export const useTransition = () => useContext(TransitionContext);

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Turn off loading state when the URL actually changes
  useEffect(() => {
    setIsTransitioning(false);
  }, [pathname]);

  const navigate = async (path: string) => {
    if (path === pathname) return; // Don't animate if staying on same page
    
    setIsTransitioning(true);

    // FORCE a delay so the animation is visible (Cinematic Effect)
    await new Promise((resolve) => setTimeout(resolve, 800)); // 0.8s wait

    router.push(path);
  };

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {/* GLOBAL LOADING OVERLAY */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FDFBF7] animate-in fade-in duration-300">
          
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
               <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
                 S
               </div>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 animate-pulse">
            Sahayak <span className="text-rose-500">X</span>
          </h2>
          <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Taking you there...
          </p>
        </div>
      )}
      
      {children}
    </TransitionContext.Provider>
  );
}