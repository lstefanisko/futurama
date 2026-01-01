
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface VisionStreamProps {
  lang: Language;
}

const VisionStream: React.FC<VisionStreamProps> = ({ lang }) => {
  const t = translations[lang];

  const nodes = [
    { title: "SYNTHETIC_EVO", year: "2054", impact: "HIGH", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600", color: "#00f3ff" },
    { title: "CULTURAL_DRIFT", year: "2088", impact: "CRITICAL", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600", color: "#00f3ff" },
    { title: "PLANETARY_EQU", year: "2062", impact: "MEDIUM", img: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600", color: "#00f3ff" },
    { title: "NEURAL_ART", year: "2054", impact: "LOW", img: "https://images.unsplash.com/photo-1547891261-389196b8a042?auto=format&fit=crop&q=80&w=600", color: "#00f3ff" },
    { title: "MAGLEV_CORE", year: "2088", impact: "HIGH", img: "https://images.unsplash.com/photo-1532187878419-4824e8677f52?auto=format&fit=crop&q=80&w=600", color: "#00f3ff" },
    { title: "GENETIC_FORGE", year: "2062", impact: "MEDIUM", img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600", color: "#00f3ff" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-white/5 border border-white/10">
      {nodes.map((node, i) => (
        <div key={i} className="group bg-black/40 border-[0.5px] border-white/5 flex flex-col p-10 transition-all hover:bg-accent/5 cursor-pointer min-h-[450px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="px-3 py-1 border border-white/20 text-[9px] font-orbitron font-black text-white tracking-[0.3em] uppercase backdrop-blur-md">
              FIXED_{node.year}
            </div>
            <div className="w-2 h-2 bg-accent shadow-[0_0_10px_#00f3ff] rounded-full" />
          </div>

          <div className="flex-1 flex flex-col justify-center py-12 relative z-10">
            <h4 className="text-4xl font-orbitron font-black text-white leading-none uppercase group-hover:text-accent transition-colors tracking-tighter">
              {node.title}
            </h4>
          </div>

          <div className="accent-line opacity-20 group-hover:opacity-100 transition-opacity mb-8 relative z-10" />

          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] font-mono text-white font-bold uppercase tracking-widest">
              IMPACT: <span className={node.impact === 'CRITICAL' ? 'text-red-500' : 'text-accent'}>{node.impact}</span>
            </span>
            <svg className="w-5 h-5 text-white/20 group-hover:text-accent transition-all group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="3"/></svg>
          </div>
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000">
             <img src={node.img} className="w-full h-full object-cover" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default VisionStream;
