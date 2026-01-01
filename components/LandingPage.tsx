
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface LandingPageProps {
  onEnter: () => void;
  lang: Language;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, lang }) => {
  const t = translations[lang] || translations.en;

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center overflow-hidden">
      {/* Immersive Video Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-60 scale-110"
        >
          <source src="https://cdn.pixabay.com/video/2021/04/12/70860-537443152_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Decorative Technical Borders */}
      <div className="absolute top-10 left-10 right-10 bottom-10 border border-white/10 pointer-events-none">
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-accent" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-accent" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-accent" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-accent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl px-12">
        <div className="mb-6 flex items-center gap-4 reveal-anim" style={{ animationDelay: '0.2s' }}>
          <div className="h-[1px] w-12 bg-accent/50" />
          <span className="text-[11px] font-orbitron font-bold tracking-[0.8em] text-accent uppercase glow-text">
            NEURAL_SIMULATION_V4.0
          </span>
          <div className="h-[1px] w-12 bg-accent/50" />
        </div>

        <h1 className="text-7xl md:text-[12rem] font-inter font-black text-white tracking-tightest leading-[0.8] mb-10 reveal-anim uppercase" style={{ animationDelay: '0.4s' }}>
          THE <br />
          <span className="text-accent italic drop-shadow-[0_0_30px_rgba(0,243,255,0.3)]">FUTURE</span> <br />
          OF US.
        </h1>

        <p className="text-lg md:text-2xl text-white/60 font-inter font-light max-w-2xl mx-auto mb-16 leading-relaxed reveal-anim" style={{ animationDelay: '0.6s' }}>
          {t.readyDesc || "Navigating the complexities of our upcoming century through probabilistic neural modeling."}
        </p>

        <div className="reveal-anim" style={{ animationDelay: '0.8s' }}>
          <button 
            onClick={onEnter}
            className="group relative px-20 py-8 bg-white text-black font-orbitron font-black text-sm tracking-[0.4em] uppercase hover:bg-accent transition-all duration-700 shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-[0_0_70px_rgba(0,243,255,0.6)]"
          >
            <span className="relative z-10">{t.cta || "INITIALIZE_SYSTEM"}</span>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0" />
          </button>
        </div>
      </div>

      {/* Dynamic Data Stream Footer */}
      <div className="absolute bottom-16 w-full px-20 flex justify-between items-end opacity-40 text-[9px] font-mono tracking-widest text-white uppercase">
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <span className="text-accent">D_LOAD:</span>
            <span className="animate-pulse">SYNCHRONIZING_PLANETARY_NODES...</span>
          </div>
          <div className="flex gap-4">
            <span className="text-accent">COORDS:</span>
            <span>37.7749° N, 122.4194° W</span>
          </div>
        </div>
        <div className="text-right flex flex-col gap-2">
          <span>LATENCY: 0.04ms</span>
          <span>© 2025 NEURAL SIMULATION NETWORKS</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
