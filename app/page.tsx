"use client";

import { useState } from "react";
// import Link from "next/link"; 
import { useTransition } from "@/components/TransitionProvider"; 
import {
  Loader2,
  Download,
  User,
  Wallet,
  LayoutGrid,
  CheckCircle,
  ArrowRight,
  Sparkles,
  XCircle,
  MapPin,
  MessageCircle,
  Share2,
  Database,
} from "lucide-react";

import VoiceAssistant from "@/components/VoiceAssistant";
import SmartSearch from "@/components/SmartSearch";
import { generatePDF } from "@/lib/pdfGenerator";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { useSession } from "next-auth/react";
import LandingPage from "@/components/LandingPage";
import DocUploader from "@/components/DocUploader";
import SchemeModal from "@/components/SchemeModal";
import { translations } from "@/lib/translations"; // Ensure this matches Step 1

export default function Home() {
  const { data: session, status } = useSession();
  const { navigate } = useTransition();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  
  // Language State
  const [uiLang, setUiLang] = useState<"en" | "hi">("en");
  const t = translations[uiLang]; // Determines which text to show

  const [formData, setFormData] = useState({
    age: "",
    income: "",
    gender: "Male",
    caste: "General",
    state: "MP",
    occupation: "Student",
  });

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const checkEligibility = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/check-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          income: Number(formData.income),
        }),
      });
      setResults(await res.json());
    } catch (error) {
      alert("Error fetching schemes");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin text-rose-500" size={40} />
      </div>
    );
  if (status === "unauthenticated") return <LandingPage />;

  return (
    <main className="min-h-screen pt-36 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto font-sans" role="main" aria-label="SahayakX Dashboard">
      
      {/* 1. HERO SECTION (Dynamic) */}
      <div className="text-center mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-tight">
          {t.hero.title1} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 animate-gradient">
            {t.hero.title2}
          </span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
          <br className="hidden md:block" />
          {t.hero.subtitle2}
        </p>

        {/* Language Toggles */}
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => setUiLang("en")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
              uiLang === "en"
                ? "bg-slate-900 text-white shadow-slate-300"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setUiLang("hi")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
              uiLang === "hi"
                ? "bg-orange-500 text-white shadow-orange-200"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* 2. THE BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* BLOCK A: Smart Search (Dynamic) */}
        <div className="md:col-span-12">
          {/* We pass 'lang' prop so the placeholder changes */}
          <SmartSearch 
             onSelect={(scheme) => setSelectedScheme(scheme)} 
             lang={uiLang} 
          />
        </div>

        {/* QUICK ACTION ROW (Dynamic) */}
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            onClick={() => navigate("/kendra")}
            className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden h-32 flex items-center"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-100 rounded-bl-[2rem] opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="p-4 flex flex-col justify-center h-full relative z-10 w-full">
              <div className="bg-cyan-500 text-white p-2.5 rounded-xl shadow-lg shadow-cyan-500/30 w-fit mb-2 group-hover:rotate-6 transition-transform">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t.widgets.kendra}</h3>
              <p className="text-[10px] text-slate-500 font-medium">{t.widgets.kendraDesc}</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/community")}
            className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden h-32 flex items-center"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-[2rem] opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="p-4 flex flex-col justify-center h-full relative z-10 w-full">
              <div className="bg-orange-500 text-white p-2.5 rounded-xl shadow-lg shadow-orange-500/30 w-fit mb-2 group-hover:-rotate-6 transition-transform">
                <MessageCircle size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t.widgets.janManch}</h3>
              <p className="text-[10px] text-slate-500 font-medium">{t.widgets.janManchDesc}</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/tracker")}
            className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden h-32 flex items-center"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-bl-[2rem] opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="p-4 flex flex-col justify-center h-full relative z-10 w-full">
              <div className="bg-purple-500 text-white p-2.5 rounded-xl shadow-lg shadow-purple-500/30 w-fit mb-2 group-hover:rotate-6 transition-transform">
                <LayoutGrid size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t.widgets.tracker}</h3>
              <p className="text-[10px] text-slate-500 font-medium">{t.widgets.trackerDesc}</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/graph")}
            className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden h-32 flex items-center"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-100 rounded-bl-[2rem] opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="p-4 flex flex-col justify-center h-full relative z-10 w-full">
              <div className="bg-teal-500 text-white p-2.5 rounded-xl shadow-lg shadow-teal-500/30 w-fit mb-2 group-hover:-rotate-6 transition-transform">
                <Share2 size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t.widgets.graph}</h3>
              <p className="text-[10px] text-slate-500 font-medium">{t.widgets.graphDesc}</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/vault")}
            className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden h-32 flex items-center"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-200 rounded-bl-[2rem] opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="p-4 flex flex-col justify-center h-full relative z-10 w-full">
              <div className="bg-slate-700 text-white p-2.5 rounded-xl shadow-lg shadow-slate-700/30 w-fit mb-2 group-hover:rotate-6 transition-transform">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t.widgets.vault}</h3>
              <p className="text-[10px] text-slate-500 font-medium">{t.widgets.vaultDesc}</p>
            </div>
          </div>
        </div>

        {/* BLOCK B: Left Column (Tools) */}
        <div className="md:col-span-12 lg:col-span-4 space-y-6">
          <div className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
            <VoiceAssistant
              currentData={formData}
              onUpdate={(d) => setFormData(d)}
              lang={uiLang}
              onSearch={(query) => {
                // Trigger search by programmatically setting SmartSearch query
                const searchInput = document.getElementById('smart-search-input') as HTMLInputElement;
                if (searchInput) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                  nativeInputValueSetter?.call(searchInput, query);
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
              onNavigate={(target) => navigate(target)}
              onCheckEligibility={() => checkEligibility()}
              currentResults={results?.eligible}
            />
          </div>
          <div className="group bg-white rounded-[2rem] p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
            {/* Pass lang to Uploader */}
            <DocUploader
              onDataExtracted={(d) => setFormData((p) => ({ ...p, ...d }))}
              lang={uiLang}
            />
          </div>
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
              <User className="text-rose-500" /> {t.manual.title}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 ml-2 uppercase">
                    {t.manual.age}
                  </label>
                  <input
                    name="age"
                    type="number"
                    value={formData.age || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 ml-2 uppercase">
                    {t.manual.gender}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || "Male"}
                    onChange={handleChange}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all appearance-none cursor-pointer"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 ml-2 uppercase">
                  {t.manual.income}
                </label>
                <div className="relative">
                  <Wallet
                    className="absolute left-4 top-3.5 text-slate-400"
                    size={18}
                  />
                  <input
                    name="income"
                    type="number"
                    value={formData.income || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-50 rounded-xl pl-11 pr-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="150000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 ml-2 uppercase">
                    {t.manual.caste}
                  </label>
                  <select
                    name="caste"
                    value={formData.caste}
                    onChange={handleChange}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option>General</option>
                    <option>OBC</option>
                    <option>SC</option>
                    <option>ST</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 ml-2 uppercase">
                    {t.manual.occupation}
                  </label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option>Student</option>
                    <option>Farmer</option>
                    <option>Unemployed</option>
                    <option>Business</option>
                  </select>
                </div>
              </div>
              <button
                onClick={checkEligibility}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2 mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {t.manual.checkBtn} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* BLOCK C: The Results Feed (Dynamic) */}
        <div className="md:col-span-12 lg:col-span-8" role="region" aria-label="Eligibility results">
          {!results ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center shadow-xl shadow-slate-200/50">
              <div className="w-32 h-32 bg-rose-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <LayoutGrid className="text-rose-400" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {t.results.waitingTitle}
              </h3>
              <p className="text-slate-400">
                {t.results.waitingDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" /> {t.results.reportTitle}
                  </h3>
                  <p className="text-slate-400 mt-1">{results.summary}</p>
                </div>
                <button
                  onClick={() =>
                    generatePDF({
                      user: formData,
                      eligibleSchemes: results.eligible,
                    })
                  }
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all border border-white/10"
                >
                  <Download size={20} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {results.eligible.map((scheme: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedScheme(scheme)}
                    className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="text-rose-500" size={60} />
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      {t.results.match}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2 leading-tight pr-4">
                      {scheme.name}
                    </h3>
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-sm group-hover:gap-3 transition-all mt-4">
                      {t.results.viewDetails} <ArrowRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
              {results.ineligible_preview.length > 0 && (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                  <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                    <XCircle size={14} /> {t.results.notEligible}
                  </h3>
                  <div className="space-y-3">
                    {results.ineligible_preview
                      .slice(0, 3)
                      .map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="font-medium text-slate-600">
                            {item.name}
                          </span>
                          <span className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded">
                            {item.reason}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BLOCK D: Analytics */}
        <div className="md:col-span-12 mt-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="font-bold text-slate-900 text-xl mb-8">
              {t.analytics}
            </h3>
            <AnalyticsDashboard />
          </div>
        </div>
      </div>

      {selectedScheme && (
        <SchemeModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </main>
  );
}