"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Globe, Sparkles, AudioWaveform } from "lucide-react";

interface VoiceAssistantProps {
  onUpdate: (data: any) => void;
  currentData: any;
}

export default function VoiceAssistant({ onUpdate, currentData }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [transcript, setTranscript] = useState("");

  // Initialize Speech Recognition
  let recognition: any = null;
  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    // @ts-ignore
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
  }

  const startListening = () => {
    if (!recognition) {
      alert("Voice support not available. Try Chrome.");
      return;
    }

    recognition.lang = lang;
    recognition.start();
    setIsListening(true);
    setTranscript("Listening...");

    recognition.onresult = async (event: any) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(`"${spokenText}"`);
      setIsListening(false);
      await processVoiceInput(spokenText);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      setTranscript("Try again.");
    };
    
    recognition.onend = () => setIsListening(false);
  };

  const processVoiceInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/process-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      onUpdate({ ...currentData, ...data });
      setTranscript("Updated!");
    } catch (err) {
      setTranscript("Error processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-orange-200 transition-all">
      
      {/* Background Gradient Blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <Mic size={20} />
            </span>
            Project Vaani
          </h3>
          <p className="text-xs text-slate-400 font-medium ml-1 mt-1">Multilingual Voice Agent</p>
        </div>
        
        {/* Language Pill */}
        <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100">
          <button 
            onClick={() => setLang("en-IN")}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${lang === "en-IN" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang("hi-IN")}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${lang === "hi-IN" ? "bg-orange-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* VISUALIZER AREA */}
      <div className="relative h-32 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center overflow-hidden mb-4">
        
        {isListening ? (
          /* ACTIVE STATE: Waving Bars Animation */
          <div className="flex items-center gap-1.5 h-12">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 bg-gradient-to-t from-orange-500 to-rose-500 rounded-full animate-wave"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: '100%' 
                }}
              ></div>
            ))}
            <style jsx>{`
              @keyframes wave {
                0%, 100% { height: 20%; opacity: 0.5; }
                50% { height: 100%; opacity: 1; }
              }
              .animate-wave {
                animation: wave 1s ease-in-out infinite;
              }
            `}</style>
          </div>
        ) : isProcessing ? (
          /* PROCESSING STATE */
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <Sparkles className="text-orange-500" size={24} />
            <span className="text-xs font-bold text-orange-400">Processing...</span>
          </div>
        ) : (
          /* IDLE STATE */
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <AudioWaveform size={32} className="opacity-20" />
            <span className="text-xs font-medium">Tap mic to speak</span>
          </div>
        )}

      </div>

      {/* Transcript / Instructions */}
      <div className="min-h-[20px] mb-4 text-center">
        <p className="text-xs font-medium text-slate-500 truncate px-4">
          {transcript || (lang === "hi-IN" ? "Boliye: 'Meri umar 25 hai...'" : "Try: 'I am a 25 year old farmer...'")}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={startListening}
        disabled={isListening || isProcessing}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2
          ${isListening 
            ? "bg-rose-500 text-white shadow-rose-500/30 scale-95" 
            : "bg-slate-900 text-white shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98]"
          }`}
      >
        {isListening ? (
          <>Stop Listening</>
        ) : (
          <><Mic size={16} /> Start Recording</>
        )}
      </button>
    </div>
  );
}