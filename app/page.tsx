"use client";

import { useState } from "react";
import {
  Loader2, Download, User, Wallet, LayoutGrid, CheckCircle, 
  ArrowRight, Sparkles, XCircle, Search
} from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";
import SmartSearch from "@/components/SmartSearch";
import { generatePDF } from "@/lib/pdfGenerator";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { useSession } from "next-auth/react";
import LandingPage from "@/components/LandingPage";
import DocUploader from "@/components/DocUploader";
import SchemeModal from "@/components/SchemeModal";
import { translations } from "@/lib/translations";

export default function Home() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [uiLang, setUiLang] = useState<"en" | "hi">("en");
  const t = translations[uiLang];

  const [formData, setFormData] = useState({
    age: "", income: "", gender: "Male", caste: "General", state: "MP", occupation: "Student",
  });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const checkEligibility = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/check-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, age: Number(formData.age), income: Number(formData.income) }),
      });
      setResults(await res.json());
    } catch (error) {
      alert("Error fetching schemes");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]"><Loader2 className="animate-spin text-rose-500" size={40}/></div>;
  if (status === "unauthenticated") return <LandingPage />;

  return (
    <main className="min-h-screen pt-36 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto font-sans">
      
      {/* 1. HERO SECTION (Fixed Gradient Text) */}
      <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-tight">
          Unlock your <br />
          {/* FIX: Replaced custom CSS with Tailwind utilities to prevent the 'Cyan Block' bug */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 animate-gradient">
            Full Potential.
          </span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          AI-powered discovery for 1.4 Billion Indians. <br className="hidden md:block"/>
          Upload. Speak. Search. We handle the rest.
        </p>

        {/* Language Toggles */}
        <div className="flex justify-center gap-2 pt-2">
           <button 
             onClick={() => setUiLang("en")} 
             className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${uiLang === "en" ? "bg-slate-900 text-white shadow-slate-300" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
           >
             English
           </button>
           <button 
             onClick={() => setUiLang("hi")} 
             className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${uiLang === "hi" ? "bg-orange-500 text-white shadow-orange-200" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
           >
             हिंदी
           </button>
        </div>
      </div>

      {/* 2. THE BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* BLOCK A: Smart Search (Span 12 cols) */}
        <div className="md:col-span-12 mb-4">
           <SmartSearch />
        </div>

        {/* BLOCK B: The Input Console (Span 4 cols) */}
        <div className="md:col-span-12 lg:col-span-4 space-y-6">
          
          {/* Voice Card */}
          <div className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
            <VoiceAssistant currentData={formData} onUpdate={(d) => setFormData(d)} />
          </div>

          {/* Scanner Card */}
          <div className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
             <DocUploader onDataExtracted={(d) => setFormData(p => ({...p, ...d}))} currentFormData={formData} />
          </div>

          {/* Manual Form Card */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
              <User className="text-rose-500" /> Manual Override
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Age</label>
                   <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all" placeholder="25" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Gender</label>
                   <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all appearance-none cursor-pointer">
                      <option>Male</option><option>Female</option><option>Other</option>
                   </select>
                </div>
              </div>
              
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Income (₹)</label>
                <div className="relative">
                   <Wallet className="absolute left-4 top-3.5 text-slate-400" size={18} />
                   <input name="income" type="number" value={formData.income} onChange={handleChange} className="w-full bg-slate-50 rounded-xl pl-11 pr-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all" placeholder="150000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Caste</label>
                   <select name="caste" value={formData.caste} onChange={handleChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500">
                     <option>General</option><option>OBC</option><option>SC</option><option>ST</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Occupation</label>
                   <select name="occupation" value={formData.occupation} onChange={handleChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500">
                     <option>Student</option><option>Farmer</option><option>Unemployed</option><option>Business</option>
                   </select>
                 </div>
              </div>

              <button onClick={checkEligibility} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2 mt-2">
                 {loading ? <Loader2 className="animate-spin" /> : <>Check Eligibility <ArrowRight size={18}/></>}
              </button>
            </div>
          </div>
        </div>

        {/* BLOCK C: The Results Feed (Span 8 cols) */}
        <div className="md:col-span-12 lg:col-span-8">
           {!results ? (
             <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center shadow-xl shadow-slate-200/50">
                <div className="w-32 h-32 bg-rose-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                   <LayoutGrid className="text-rose-400" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Waiting for Data</h3>
                <p className="text-slate-400">Your personalized scheme feed will appear here.</p>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                {/* Results Header */}
                <div className="flex justify-between items-center bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl">
                   <div>
                     <h3 className="text-2xl font-bold flex items-center gap-2"><CheckCircle className="text-emerald-400"/> Eligibility Report</h3>
                     <p className="text-slate-400 mt-1">{results.summary}</p>
                   </div>
                   <button onClick={() => generatePDF({ user: formData, eligibleSchemes: results.eligible })} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all border border-white/10">
                     <Download size={20} />
                   </button>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                   {results.eligible.map((scheme: any, idx: number) => (
                      <div key={idx} onClick={() => setSelectedScheme(scheme)} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="text-rose-500" size={60} />
                         </div>
                         <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">95% Match</span>
                         <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2 leading-tight pr-4">{scheme.scheme_name}</h3>
                         <div className="flex items-center gap-2 text-rose-500 font-bold text-sm group-hover:gap-3 transition-all mt-4">
                            View Details <ArrowRight size={16} />
                         </div>
                      </div>
                   ))}
                </div>

                {/* Ineligible (Clean List) */}
                {results.ineligible_preview.length > 0 && (
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2"><XCircle size={14}/> Not Eligible</h3>
                    <div className="space-y-3">
                      {results.ineligible_preview.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                           <span className="font-medium text-slate-600">{item.name}</span>
                           <span className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded">{item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
           )}
        </div>

        {/* BLOCK D: Analytics (Span 12 cols) */}
        <div className="md:col-span-12 mt-8">
           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
              <h3 className="font-bold text-slate-900 text-xl mb-8">Platform Intelligence</h3>
              <AnalyticsDashboard />
           </div>
        </div>
      </div>
      
      {/* Footer Text
      <div className="text-center mt-20 pb-10">
        <p className="text-slate-400 font-medium text-sm">Engineered by Sahayak X • 2025</p>
      </div> */}

      {selectedScheme && <SchemeModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />}
    </main>
  );
}