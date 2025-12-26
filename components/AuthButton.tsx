"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, ChevronDown, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function AuthButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (session) {
    return (
      <div className="relative">
        {/* Compact Profile Trigger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group"
        >
          {session.user?.image ? (
            <div className="relative w-8 h-8">
              <Image 
                src={session.user.image} 
                alt="Profile" 
                fill
                className="rounded-full border border-slate-200 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <User size={16} />
            </div>
          )}
          
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{session.user?.name?.split(" ")[0]}</p>
          </div>
          
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>

        {/* Floating Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 animate-in fade-in zoom-in-95 z-50">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
              <p className="text-xs font-semibold text-slate-800 truncate">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 hover:scale-105 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"
    >
      <LogIn size={16} /> Sign In
    </button>
  );
}