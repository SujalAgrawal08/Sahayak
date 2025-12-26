"use client";
import { X, FileText, CheckCircle, ExternalLink } from "lucide-react";

interface SchemeModalProps {
  scheme: any;
  onClose: () => void;
}

export default function SchemeModal({ scheme, onClose }: SchemeModalProps) {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase">Government Scheme</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle size={10} /> Eligible</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{scheme.scheme_name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} className="text-slate-500" /></button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="prose prose-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Overview</h3>
            <p className="text-slate-600 leading-relaxed">{scheme.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Benefits</h3>
            <ul className="grid gap-2">
               {/* Fallback if no benefits array exists */}
               {(scheme.benefits?.length ? scheme.benefits : ["Direct Benefit Transfer", "Financial Assistance"]).map((b: string, i: number) => (
                 <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                   <div className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" /> {b}
                 </li>
               ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg">Close</button>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
            Apply Online <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}