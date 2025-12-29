"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown"; 
import remarkGfm from "remark-gfm"; 

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Namaste! I am Sahayak Sarathi. Ask me anything about schemes." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg.content,
          history: messages.slice(-4) 
        }),
      });
      
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.reply,
        sources: data.sources
      }]);

    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I am facing network issues." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SIMPLE TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-colors ${isOpen ? "hidden" : "flex"}`}
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[380px] h-[550px] max-h-[80vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans"
          >
            {/* CLEAN HEADER */}
            <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-700">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Sahayak Sarathi</h3>
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    {/* Markdown Renderer */}
                    <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : ''}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h3: ({node, ...props}) => <h3 className="font-bold text-xs uppercase tracking-wider mb-1 mt-2 opacity-80" {...props} />,
                          strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="pl-1" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>

                    {/* Sources (Simple) */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-200 opacity-80">
                        <div className="flex flex-wrap gap-1">
                          {m.sources.map((s: any, idx: number) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  </div>
                </div>
              )}
            </div>

            {/* INPUT AREA (Standard) */}
            <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}