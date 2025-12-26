"use client";
import { useState } from "react";
import { Search, Loader2, Sparkles, Command } from "lucide-react";

export default function SmartSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if(!query) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/search", { method: "POST", body: JSON.stringify({query}), headers: {"Content-Type":"application/json"}});
      setResults(await res.json());
    } catch(e) {} finally { setLoading(false); }
  };

  return (
    <div className="relative z-40 w-full max-w-4xl mx-auto mb-8">
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-white rounded-full shadow-2xl flex items-center p-2 pl-6">
           <Sparkles className="text-rose-500 animate-pulse mr-4" size={24} />
           <input 
             className="w-full py-4 text-xl font-bold text-slate-800 placeholder:text-slate-300 bg-transparent outline-none tracking-tight"
             placeholder="Search schemes with AI..." 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && handleSearch()}
           />
           <button onClick={handleSearch} className="bg-black text-white p-4 rounded-full hover:scale-105 transition-transform flex items-center justify-center">
             {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
           </button>
        </div>
      </div>

      {/* Modern Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-[110%] left-4 right-4 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden p-2 animate-in slide-in-from-top-4">
           {results.map((scheme: any) => (
             <div key={scheme._id} className="p-4 rounded-xl hover:bg-slate-100/80 cursor-pointer flex justify-between items-center group transition-colors">
               <div>
                 <h4 className="font-bold text-slate-900 text-lg">{scheme.name}</h4>
                 <p className="text-sm text-slate-500 line-clamp-1">{scheme.description}</p>
               </div>
               <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">{(scheme.score*100).toFixed(0)}%</div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}