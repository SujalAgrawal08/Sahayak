"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { TRANSLATIONS } from "@/lib/translations"; // <--- UPDATED PATH

interface SmartSearchProps {
  onSelect?: (scheme: any) => void;
  lang: "en" | "hi";
}

// FIX: Added 'lang' to the destructuring below
export default function SmartSearch({ onSelect, lang }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Debounce Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const res = await fetch('/api/search', {
            method: 'POST',
            body: JSON.stringify({ query })
          });
          const data = await res.json();
          setResults(data);
          setShowResults(true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safe access to dictionary
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50" ref={searchRef} role="search" aria-label="Smart scheme search">
      
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-200 via-purple-200 to-indigo-200 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity"></div>
        <div className="relative flex items-center bg-white rounded-full shadow-xl shadow-indigo-100/50 border border-white p-2 transition-transform group-hover:scale-[1.01]">
          <div className="pl-4 text-rose-500 animate-pulse">
            <Sparkles size={20} />
          </div>
          <input 
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-700 font-bold placeholder:text-slate-400 placeholder:font-medium"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            onFocus={() => { if(results.length > 0) setShowResults(true); }}
            role="combobox"
            aria-expanded={showResults}
            aria-controls="search-results-listbox"
            aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
            aria-label="Search for government schemes"
            id="smart-search-input"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, -1));
              } else if (e.key === 'Enter' && activeIndex >= 0 && onSelect) {
                e.preventDefault();
                onSelect(results[activeIndex]);
                setShowResults(false);
              } else if (e.key === 'Escape') {
                setShowResults(false);
              }
            }}
          />
          <button className="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 transition-colors">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </div>
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 animate-in slide-in-from-top-2" role="listbox" id="search-results-listbox" aria-label="Search results">
          {results.map((scheme, i) => (
            <div 
              key={i}
              id={`search-result-${i}`}
              role="option"
              aria-selected={activeIndex === i}
              onClick={() => {
                if (onSelect) {
                  onSelect(scheme);
                  setShowResults(false); 
                }
              }}
              className={`group flex items-start justify-between p-4 hover:bg-slate-50 rounded-3xl cursor-pointer transition-colors ${activeIndex === i ? 'bg-slate-50 ring-2 ring-indigo-200' : ''}`}
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                  {scheme.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {scheme.description}
                </p>
              </div>

              <div className="bg-slate-100 text-slate-600 p-2 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
          
          <div className="px-4 py-3 text-center border-t border-slate-50 mt-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              AI Powered Search
            </span>
          </div>
        </div>
      )}
    </div>
  );
}