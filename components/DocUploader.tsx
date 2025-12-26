"use client";
import { useState } from "react";
import { Upload, X, Loader2, ScanEye, CheckCircle } from "lucide-react";
import Image from "next/image";
import { convertPdfToImage } from "@/lib/pdfConverter";

export default function DocUploader({ onDataExtracted }: { onDataExtracted: (d: any) => void, currentFormData: any }) {
  const [file, setFile] = useState<any>(null);
  const [status, setStatus] = useState("idle");

  // (Handle File Logic same as before, simplified for UI demo)
  const handleFile = async (e: any) => { /* logic */ }; 
  const scanDocument = async () => { /* logic */ };

  return (
    <div className="p-6 rounded-[1.8rem] bg-indigo-50/50 hover:bg-indigo-50 transition-colors relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2"><ScanEye size={18}/> Project Netra</h3>
        <span className="text-[10px] font-bold bg-indigo-200 text-indigo-800 px-2 py-1 rounded-md">V2.0</span>
      </div>

      {!file ? (
        <label className="block w-full h-32 border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-white transition-all">
          <Upload className="text-indigo-400 mb-2" />
          <span className="text-xs font-bold text-indigo-400">Drop ID Proof</span>
          <input type="file" className="hidden" onChange={handleFile} />
        </label>
      ) : (
        <div className="bg-white p-3 rounded-2xl shadow-sm flex gap-3 items-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden relative">
            <Image src={file.preview} alt="Doc" fill className="object-cover" />
          </div>
          <div className="flex-1">
             <p className="text-xs font-bold truncate">{file.file.name}</p>
             <button onClick={scanDocument} className="text-[10px] font-bold text-indigo-600 hover:underline">Start Scan</button>
          </div>
        </div>
      )}
    </div>
  );
}