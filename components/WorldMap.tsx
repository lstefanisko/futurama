
import React, { useState } from 'react';
import { RegionalImpact, Language } from '../types';
import { translations } from '../translations';

const WorldMap: React.FC<{ data: RegionalImpact[], lang: Language }> = ({ data, lang }) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<{ min: number, max: number } | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<RegionalImpact | null>(null);
  const t = translations[lang];

  const regions = [
    { id: 'na', name: 'Severná Amerika', path: 'M 10 20 L 40 20 L 45 40 L 15 45 Z' },
    { id: 'sa', name: 'Južná Amerika', path: 'M 35 50 L 50 50 L 45 80 L 35 80 Z' },
    { id: 'eu', name: 'Európa', path: 'M 45 15 L 60 15 L 65 30 L 50 35 Z' },
    { id: 'af', name: 'Afrika', path: 'M 45 40 L 65 40 L 70 75 L 50 75 Z' },
    { id: 'as', name: 'Ázia', path: 'M 60 10 L 90 10 L 95 50 L 65 55 Z' },
    { id: 'oc', name: 'Oceánia', path: 'M 80 65 L 95 65 L 95 85 L 80 85 Z' },
  ];

  const legendItems = [
    { label: t.legend.low, min: 0, max: 25 },
    { label: t.legend.med, min: 26, max: 50 },
    { label: t.legend.high, min: 51, max: 75 },
    { label: t.legend.crit, min: 76, max: 100 },
  ];

  const getImpact = (name: string) => data.find(d => d.region.toLowerCase().includes(name.toLowerCase().split(' ')[0]));

  const isLevelActive = (val: number) => {
    if (!hoveredLevel) return false;
    return val >= hoveredLevel.min && val <= hoveredLevel.max;
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          {regions.map(r => {
            const impact = getImpact(r.name);
            const val = impact ? impact.value : 0;
            const isActive = isLevelActive(val);
            const isIndividualHover = hoveredRegion === r.id;
            
            // Saturation logic: Base is low opacity, hover is high-saturation cyan
            const fillOpacity = isIndividualHover || isActive 
                ? Math.max(0.4, val / 100 + 0.2) 
                : Math.max(0.05, val / 250);
            
            return (
              <path 
                key={r.id} 
                d={r.path} 
                className="cursor-pointer transition-all duration-500 ease-in-out"
                fill={`rgba(34, 211, 238, ${fillOpacity})`}
                stroke={isIndividualHover || isActive ? "rgba(34, 211, 238, 0.8)" : "rgba(148, 163, 184, 0.15)"}
                strokeWidth={isIndividualHover || isActive ? "0.8" : "0.4"}
                strokeLinejoin="round"
                onMouseEnter={() => setHoveredRegion(r.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => impact && setSelectedInfo(impact)}
                style={{
                    filter: isIndividualHover || isActive ? 'drop-shadow(0 0 2px rgba(34, 211, 238, 0.3))' : 'none'
                }}
              />
            );
          })}
        </svg>

        {selectedInfo && (
          <div className="absolute inset-0 z-50 glass rounded-3xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
             <button onClick={() => setSelectedInfo(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
             </button>
             <h4 className="text-lg font-orbitron font-bold dark:text-white text-zinc-900 mb-4">{selectedInfo.region}</h4>
             <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">{selectedInfo.description}</p>
             <div className="flex justify-between items-center pt-4 border-t border-white/10">
               <span className="text-xs font-bold text-zinc-500 uppercase">{t.intensity}</span>
               <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{selectedInfo.value}%</span>
             </div>
          </div>
        )}
      </div>

      {/* Interactive Legend */}
      <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.impactLegend}</span>
          <span className="text-[9px] font-mono text-zinc-400 opacity-50">SCAL_ID: V2.5</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {legendItems.map((item) => (
            <div 
              key={item.label}
              onMouseEnter={() => setHoveredLevel({ min: item.min, max: item.max })}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`group cursor-crosshair transition-all duration-300 p-2 rounded-lg border ${
                hoveredLevel && hoveredLevel.min === item.min 
                  ? 'bg-cyan-500/10 border-cyan-500/40' 
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <div 
                className="h-1.5 w-full rounded-full mb-2 transition-all duration-300 group-hover:scale-y-125" 
                style={{ 
                    backgroundColor: `rgba(34, 211, 238, ${Math.max(0.1, item.max/100)})`,
                    boxShadow: hoveredLevel && hoveredLevel.min === item.min ? '0 0 8px rgba(34, 211, 238, 0.4)' : 'none'
                }} 
              />
              <span className={`block text-[8px] font-bold uppercase text-center transition-colors duration-300 ${
                hoveredLevel && hoveredLevel.min === item.min ? 'text-cyan-400' : 'text-zinc-500'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
