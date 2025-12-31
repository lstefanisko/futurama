
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface VisionStreamProps {
  lang: Language;
}

const VisionStream: React.FC<VisionStreamProps> = ({ lang }) => {
  const t = translations[lang];

  const nodes = [
    { title: "Neo-Glacier Rebirth", year: "2072", impact: "High", img: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&q=80&w=400" },
    { title: "Lunar Elevator Hub", year: "2094", impact: "Critical", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" },
    { title: "Bionic Forestation", year: "2068", impact: "Medium", img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400" },
    { title: "Neural Art Synthesis", year: "2054", impact: "Low", img: "https://images.unsplash.com/photo-1547891261-389196b8a042?auto=format&fit=crop&q=80&w=400" },
    { title: "Maglev Trans-Atlantic", year: "2088", impact: "High", img: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=400" },
    { title: "Post-Organic Cuisine", year: "2062", impact: "Medium", img: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <section className="space-y-12 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-2 border-cyan-500/50 pl-8">
        <div>
          <h3 className="text-[12px] font-orbitron font-black text-cyan-500 tracking-[0.5em] uppercase mb-4">{t.visionStreamTitle}</h3>
          <p className="text-zinc-500 font-medium max-w-xl">{t.visionStreamDesc}</p>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Nodes</div>
              <div className="text-2xl font-orbitron font-black text-white">409.2k</div>
           </div>
           <div className="text-right">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Temporal Drift</div>
              <div className="text-2xl font-orbitron font-black text-cyan-500">0.004s</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {nodes.map((node, i) => (
          <div key={i} className="group relative glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer">
            <div className="aspect-[4/3] relative">
              <img 
                src={node.img} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                alt={node.title}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />
              
              <div className="absolute top-4 left-4">
                 <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[9px] font-orbitron font-black text-white tracking-widest">
                   FIXED_{node.year}
                 </span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-xl font-orbitron font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{node.title}</h4>
                 <div className={`w-2 h-2 rounded-full ${node.impact === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} />
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">IMPACT_LVL: {node.impact}</span>
                 <svg className="w-4 h-4 text-zinc-700 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2.5"/></svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(VisionStream);
