
import React, { useState, useEffect } from 'react';
import { Category, Prediction, Language, UserProfile } from './types';
import { getFuturePrediction } from './services/geminiService';
import PredictionCard from './components/PredictionCard';
import WorldMap from './components/WorldMap';
import PricingSection from './components/PricingSection';
import VisionStream from './components/VisionStream';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import PredictionSkeleton from './components/PredictionSkeleton';
import { translations } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [view, setView] = useState<'explorer' | 'pricing' | 'vault' | 'methodology' | 'legal'>('explorer');
  const [selectedYear, setSelectedYear] = useState<number>(2054);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.SINGULARITY);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const t = translations[lang] || translations.en;

  const handleGenerate = async () => {
    setIsLoading(true);
    setView('explorer');
    try {
      const data = await getFuturePrediction(selectedYear, selectedCategory, lang);
      setPrediction({
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
    } finally { 
      setIsLoading(false); 
    }
  };

  const NavItem = ({ id, label }: { id: typeof view, label: string }) => (
    <button 
      onClick={() => setView(id)} 
      className={`text-[11px] font-orbitron font-black tracking-widest uppercase transition-all whitespace-nowrap px-6 py-4 border-b-2 ${view === id ? 'text-accent border-accent' : 'text-white/40 border-transparent hover:text-white'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-black font-inter relative">
      {/* Immersive Background Core */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <video 
          autoPlay muted loop playsInline 
          className={`w-full h-full object-cover transition-opacity duration-2000 ${hasEntered ? 'opacity-30' : 'opacity-0'}`}
        >
          <source src="https://cdn.pixabay.com/video/2021/04/09/70479-535805562_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10" />
      </div>

      {!hasEntered && <LandingPage lang={lang} onEnter={() => setHasEntered(true)} />}

      {/* Technical Header */}
      <header className={`fixed top-0 w-full z-[100] glass border-b border-white/10 transition-all duration-1000 ${hasEntered ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-[1920px] mx-auto flex justify-between items-center px-10 py-0">
          <div className="flex items-center gap-6 py-6 cursor-pointer group" onClick={() => { setView('explorer'); setPrediction(null); }}>
             <div className="w-3 h-3 bg-accent group-hover:rotate-90 transition-transform duration-500 shadow-[0_0_15px_#00f3ff]" />
             <span className="text-xl font-orbitron font-black tracking-tighter text-white uppercase">{t.title}</span>
          </div>

          <nav className="hidden lg:flex items-center h-full">
            <NavItem id="explorer" label={t.timeline} />
            <NavItem id="vault" label={t.archive} />
            <NavItem id="pricing" label={t.membership} />
            <NavItem id="methodology" label={t.howItWorks} />
          </nav>

          <div className="flex items-center gap-8 py-6">
             <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2 bg-white text-black text-[11px] font-orbitron font-black tracking-widest hover:bg-accent transition-all uppercase">
               AUTH_SESSION
             </button>
             <select 
               value={lang} 
               onChange={(e) => setLang(e.target.value as any)} 
               className="bg-transparent text-[11px] font-orbitron font-bold text-white/50 outline-none cursor-pointer border-l border-white/10 pl-5 uppercase hover:text-white"
             >
                {Object.keys(translations).map(l => <option key={l} value={l} className="bg-dark text-white">{l.toUpperCase()}</option>)}
             </select>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} lang={lang} />

      {/* Main UI Flux */}
      <main className={`relative z-10 transition-all duration-1000 pt-32 px-10 pb-40 min-h-screen ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {view === 'explorer' && (
          <div className="max-w-[1920px] mx-auto">
            {/* The AXIS - Temporal Controller */}
            <div className="glass-panel p-10 mb-20 flex flex-col xl:flex-row items-center gap-16 border border-white/5">
              <div className="w-full xl:w-1/3 space-y-6">
                <div className="flex justify-between items-end">
                   <label className="text-[11px] font-orbitron font-bold text-accent/50 uppercase tracking-widest">{t.yearLabel}</label>
                   <span className="text-7xl font-orbitron font-black text-white glow-text leading-none">{selectedYear}</span>
                </div>
                <input 
                  type="range" min="2025" max="2100" value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                  className="w-full accent-accent bg-white/5 h-[1px] rounded-none appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                />
                <div className="flex justify-between text-[9px] font-mono text-white/20 tracking-widest uppercase">
                  <span>Start_2025</span>
                  <span>Horizon_2100</span>
                </div>
              </div>

              <div className="w-full xl:flex-1">
                 <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-px bg-white/5">
                    {Object.values(Category).map((cat) => (
                      <button 
                        key={cat} onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-6 text-[10px] font-orbitron font-bold border-0 transition-all tracking-widest text-center ${selectedCategory === cat ? 'bg-accent text-black' : 'bg-black text-white/40 hover:bg-white/5 uppercase'}`}
                      >
                        {t.categories[cat]}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="w-full xl:w-1/5">
                <button 
                  onClick={handleGenerate} disabled={isLoading}
                  className="w-full py-8 bg-white text-black font-orbitron font-black text-[13px] tracking-[0.4em] uppercase hover:bg-accent transition-all disabled:opacity-50 relative group overflow-hidden"
                >
                  <span className="relative z-10">{isLoading ? 'PROCESSING...' : t.generate}</span>
                  <div className="absolute inset-0 bg-accent translate-x-full group-hover:translate-x-0 transition-transform duration-500 z-0" />
                </button>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-20 items-start">
               {/* Metadata Column */}
               <div className="2xl:col-span-3 space-y-12">
                  <div className="glass-panel p-10 border-white/10">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-[11px] font-orbitron font-black text-accent tracking-widest uppercase">Spacial_Matrix</h3>
                      <div className="w-4 h-[1px] bg-accent/30" />
                    </div>
                    <WorldMap data={prediction?.regionalImpact || []} lang={lang} isLoading={isLoading} />
                  </div>
                  
                  <div className="glass-panel p-10 border-white/10 space-y-8">
                    <h3 className="text-[11px] font-orbitron font-black text-white/30 tracking-widest uppercase">System_Telemetry</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-white/20 uppercase">Core_Refraction</span>
                        <span className="text-accent">98.4%</span>
                      </div>
                      <div className="h-[2px] bg-white/5">
                        <div className="h-full bg-accent shadow-[0_0_10px_#00f3ff]" style={{ width: '98%' }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-white/20 uppercase">Prob_Density</span>
                        <span className="text-accent">High</span>
                      </div>
                    </div>
                  </div>
               </div>
               
               {/* Simulation Frame */}
               <div className="2xl:col-span-9">
                  {isLoading ? (
                    <PredictionSkeleton loadingText={t.loading} />
                  ) : prediction ? (
                    <PredictionCard prediction={prediction} lang={lang} isPro={true} />
                  ) : (
                    <div className="space-y-32">
                      <div className="max-w-4xl space-y-12">
                        <h2 className="text-[7rem] font-inter font-black text-white leading-[0.85] tracking-tightest uppercase reveal-anim">
                          THE CENTURY <br />
                          IS <span className="text-accent italic glow-text">UNWRITTEN.</span>
                        </h2>
                        <p className="text-2xl text-white/50 leading-relaxed font-light max-w-3xl border-l-4 border-accent pl-12 reveal-anim" style={{ animationDelay: '0.2s' }}>
                          {t.readyDesc} Select a temporal node and initiate a simulation to visualize humanity's drift across the next 75 years.
                        </p>
                      </div>
                      <div className="reveal-anim" style={{ animationDelay: '0.4s' }}>
                        <VisionStream lang={lang} />
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {view === 'pricing' && <PricingSection lang={lang} onPlanSelected={() => setView('explorer')} />}
        
        {view === 'methodology' && (
          <div className="max-w-5xl mx-auto py-20 space-y-20 animate-in fade-in slide-in-from-bottom-10">
            <h2 className="text-8xl font-inter font-black uppercase tracking-tightest text-white">{t.methodology}</h2>
            <div className="h-px w-full bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 text-lg leading-relaxed text-white/70 font-light">
              <div className="space-y-10">
                <p>
                  Our engine utilizes the <strong>Gemini 3 Pro</strong> neural core to process over 4.2 petabytes of cross-disciplinary data, ranging from climatological shifts to patent adoption rates.
                </p>
                <div className="p-10 bg-accent/5 border border-accent/20">
                   <h4 className="font-orbitron font-black text-accent text-sm mb-6 uppercase tracking-widest">Logic: Probabilistic Convergence</h4>
                   <p className="text-sm font-mono text-white/50 leading-loose">
                     History is not a line, but a field of possibilities. We calculate the path of least resistance for technological and social adoption.
                   </p>
                </div>
              </div>
              <div className="space-y-12">
                 {[
                   { id: '01', title: 'Data Extraction', desc: 'Real-time scraping of patent offices, research papers, and industrial whitebooks.' },
                   { id: '02', title: 'Sentiment Drift', desc: 'Analyzing cultural momentum to predict adoption speed of radical changes.' },
                   { id: '03', title: 'Neural Synthesis', desc: 'Gemini 3 Pro constructs a high-fidelity visual and narrative ' + 'fixed point' + '.' }
                 ].map(step => (
                   <div key={step.id} className="flex gap-8">
                     <span className="text-5xl font-orbitron font-black text-white/10">{step.id}</span>
                     <div>
                       <h5 className="font-orbitron font-bold text-white mb-3 uppercase tracking-widest">{step.title}</h5>
                       <p className="text-sm text-white/40 font-mono">{step.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {view === 'legal' && (
          <div className="max-w-4xl mx-auto py-20 space-y-20 animate-in fade-in">
             <h2 className="text-7xl font-inter font-black uppercase tracking-tightest text-white">Protocols</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {['privacy', 'terms', 'cookies', 'gdpr'].map(k => (
                 <div key={k} className="glass-panel p-10 hover:border-accent/40 transition-all cursor-pointer group">
                   <h4 className="text-accent font-orbitron font-black text-sm mb-4 uppercase tracking-widest group-hover:text-white transition-colors">{t.legal[k]}</h4>
                   <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.3em]">State: Certified // Hash: 0x2A...4B</p>
                 </div>
               ))}
             </div>
             <div className="text-center pt-24">
               <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.6em] leading-loose max-w-3xl mx-auto">
                 {t.legal.disclaimer}
               </p>
             </div>
          </div>
        )}

        {view === 'vault' && (
          <div className="max-w-5xl mx-auto py-40 text-center space-y-12 animate-in fade-in">
             <div className="w-24 h-24 border border-white/10 mx-auto flex items-center justify-center rotate-45 relative overflow-hidden bg-white/[0.02]">
                <div className="w-6 h-6 bg-accent/30 animate-ping" />
                <div className="absolute inset-0 shimmer opacity-10" />
             </div>
             <h2 className="text-5xl font-orbitron font-black uppercase tracking-widest text-white">{t.archive}</h2>
             <p className="text-white/20 uppercase tracking-widest text-[12px] font-mono">No encrypted temporal nodes found in this session.</p>
          </div>
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="relative z-10 border-t border-white/10 py-24 bg-black/90 backdrop-blur-2xl">
        <div className="max-w-[1920px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <span className="text-2xl font-orbitron font-black tracking-widest text-white uppercase">{t.title}</span>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">Node_Status: Online // Version_Core: 4.5.1</span>
          </div>
          
          <div className="lg:col-span-4 flex justify-center gap-12">
            {['privacy', 'terms', 'gdpr'].map(k => (
              <button key={k} onClick={() => setView('legal')} className="text-[10px] font-mono text-white/40 hover:text-accent uppercase tracking-widest transition-colors">
                {t.legal[k]}
              </button>
            ))}
          </div>
          
          <div className="lg:col-span-4 text-center lg:text-right">
             <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest leading-loose">
               © 2025 NEURAL SIMULATION NETWORKS <br />
               OPERATING UNDER PROTOCOL: FUTUREFORECAST
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
