"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp } from "lucide-react";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-4 text-sm text-slate-400 font-medium animate-pulse">Crunching numbers...</div>;

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Metric Card (Modern Gradient) */}
        <div className="md:col-span-1 bg-gradient-to-br from-indigo-500 to-rose-500 p-8 rounded-[2rem] text-white shadow-lg shadow-indigo-200 relative overflow-hidden flex flex-col justify-center items-center group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={80} />
          </div>
          <TrendingUp size={48} className="mb-4 text-white/90" />
          <span className="text-6xl font-black tracking-tighter mb-2">{data.total}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Total Queries</span>
        </div>

        {/* Chart (Clean Look) */}
        <div className="md:col-span-2 bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Category Distribution</h3>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                 <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
              </div>
           </div>
           
           <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.categories}>
                 <XAxis 
                    dataKey="name" 
                    fontSize={12} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    dy={10}
                 />
                 <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'}}
                 />
                 <Bar 
                    dataKey="value" 
                    fill="#f43f5e" 
                    radius={[6, 6, 6, 6]} 
                    barSize={40}
                 />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}