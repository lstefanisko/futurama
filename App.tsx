
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Category, Prediction, Language, UserProfile } from './types';
import { getFuturePrediction } from './services/geminiService';
import PredictionCard from './components/PredictionCard';
import WorldMap from './components/WorldMap';
import PricingSection from './components/PricingSection';
import Carousel from './components/Carousel';
import VisionStream from './components/VisionStream';
import AuthModal from './components/AuthModal';
import { translations } from './translations';
import { supabase, fetchUserVault } from './services/supabaseService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'explorer' | 'pricing' | 'vault' | 'dashboard'>('explorer');
  const [selectedYear, setSelectedYear] = useState<number>(2035);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.TECHNOLOGY);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vault, setVault] = useState<Prediction[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const t = translations[lang];

  useEffect(() => {
    if (prediction) {
      document.title = `${prediction.title} | ${prediction.year}`;
    } else {
      document.title = `${t.title} | AI ORACLE`;
    }
  }, [prediction, t.title]);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser({ id: session.user.id, email: session.user.email!, is_pro: false, predictions_count: 0 });
          loadVault(session.user.id);
        }
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser({ id: session.user.id, email: session.user.email!, is_pro: false, predictions_count: 0 });
          loadVault(session.user.id);
        } else {
          setUser(null);
          setVault([]);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const loadVault = async (userId: string) => {
    const data = await fetchUserVault(userId);
    setVault(data);
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      setVault([]);
      setView('explorer');
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const data = await getFuturePrediction(selectedYear, selectedCategory, lang);
      const newPrediction: Prediction = { ...data, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
      setPrediction(newPrediction);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010409] text-white selection:bg-cyan-500/30">
      <header className="sticky top-0 z-[100] glass border-b border-white/5 px-8 py-5">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setView('explorer'); setPrediction(null); }}>
            <h1 className="text-xl font-orbitron font-black tracking-[0.3em] text-white">{t.title}</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-12 text-[11px] font-orbitron font-black tracking-[0.4em]">
            {['explorer', 'vault', 'pricing'].map(v => (
              <button 
                key={v}
                onClick={() => setView(v as any)} 
                className={`relative py-2 transition-colors ${view === v ? 'text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
              >
                {t[v === 'pricing' ? 'pricing' : v === 'explorer' ? 'explorer' : 'vault']}
                {view === v && <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
             {user ? (
               <button onClick={handleLogout} className="px-4 py-2 text-[9px] font-orbitron border border-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all">DISCONNECT</button>
             ) : (
               <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2 bg-cyan-500 text-black font-orbitron font-black text-[10px] rounded hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">CONNECT</button>
             )}
             <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="bg-transparent text-[10px] font-black text-zinc-500 uppercase outline-none">
                {['en', 'sk'].map(l => <option key={l} value={l} className="bg-[#0d1117]">{l}</option>)}
             </select>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} lang={lang} />

      {view === 'explorer' && (
        <main className="max-w-[1800px] mx-auto px-8 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Controls */}
          <aside className="lg:col-span-3 space-y-8">
            <section className="glass-panel p-8 rounded-xl border border-white/5 sticky top-32">
              <h2 className="text-[10px] font-orbitron font-black text-zinc-500 mb-8 uppercase tracking-[0.5em]">{t.settings}</h2>
              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{t.timeline}</label>
                    <span className="text-5xl font-orbitron font-black text-cyan-400">{selectedYear}</span>
                  </div>
                  <input type="range" min="2025" max="2100" step="5" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  {Object.values(Category).map((cat) => (
                    <button 
                      key={cat} 
                      onClick={() => handleCategorySelect(cat)} 
                      className={`px-6 py-4 rounded text-[10px] font-orbitron font-bold text-left border transition-all ${selectedCategory === cat ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-transparent border-white/5 text-zinc-600 hover:border-white/10'}`}
                    >
                      {t.categories[cat]}
                    </button>
                  ))}
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-5 bg-cyan-500 text-black font-orbitron font-black rounded text-[12px] tracking-[0.5em] hover:bg-white shadow-[0_10px_30px_rgba(6,182,212,0.2)] active:scale-95 disabled:opacity-50">
                  {isLoading ? 'WORKING...' : t.generate}
                </button>
              </div>
            </section>
            <section className="glass-panel p-8 rounded-xl border border-white/5">
               <WorldMap data={prediction?.regionalImpact || []} lang={lang} isLoading={isLoading} />
            </section>
          </aside>

          {/* Results Area */}
          <section className="lg:col-span-9">
            {isLoading ? (
              <div className="glass-panel rounded-xl h-[700px] flex flex-col items-center justify-center border border-white/5">
                <div className="w-16 h-16 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
                <h3 className="text-xl font-orbitron font-black tracking-[0.5em] text-cyan-500 animate-pulse">{t.loading}</h3>
              </div>
            ) : prediction ? (
              <div className="space-y-12 animate-in fade-in duration-700">
                <PredictionCard prediction={prediction} lang={lang} isPro={true} onSave={() => {}} />
                <VisionStream lang={lang} />
              </div>
            ) : (
              <div className="space-y-16">
                <div className="text-center py-24 px-12 glass-panel border border-cyan-500/10 rounded-xl relative overflow-hidden flex flex-col items-center justify-center">
                   <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/30 animate-scan pointer-events-none" />
                   
                   <p className="text-cyan-400 font-orbitron font-black uppercase tracking-[0.4em] text-lg md:text-xl lg:text-2xl mb-8 opacity-90 border-b border-cyan-500/20 pb-4 max-w-4xl">
                     {t.slogan}
                   </p>

                   <h2 className="heading-hero font-orbitron text-white text-glow mb-4 uppercase">
                     {t.readyTitle}
                   </h2>
                </div>
                
                <section>
                  <Carousel category={selectedCategory} />
                </section>

                <VisionStream lang={lang} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="glass-panel p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-8">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="2" strokeLinecap="round"/></svg>
                      </div>
                      <h5 className="text-2xl font-orbitron font-black text-white mb-4 uppercase">Neural Grounding</h5>
                      <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Every prediction is verified across 100+ high-fidelity global research nodes using Google Search integration.</p>
                   </div>
                   <div className="glass-panel p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-8">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-2.58.344l-1.791-.358a2 2 0 01-1.238-1.238l-.358-1.791a4 4 0 01.344-2.58l.337-.675a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022L10 3" strokeWidth="2" strokeLinecap="round"/></svg>
                      </div>
                      <h5 className="text-2xl font-orbitron font-black text-white mb-4 uppercase">Visual Synthesis</h5>
                      <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Powered by Gemini 2.5 Flash, generating cinematic visual representations of future architectures and life.</p>
                   </div>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {view === 'pricing' && (
        <div className="max-w-[1800px] mx-auto px-8 pt-12 pb-24 animate-in fade-in duration-700">
          <PricingSection lang={lang} user={user} onPlanSelected={() => setView('explorer')} />
        </div>
      )}

      {view === 'vault' && (
        <main className="max-w-[1800px] mx-auto px-8 pt-12 pb-24 animate-in fade-in duration-700">
           <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-12">
              <h2 className="text-6xl font-orbitron font-black tracking-tighter">NEURAL VAULT</h2>
              <span className="text-[12px] font-mono text-cyan-500 font-bold tracking-[0.5em]">VECTORS: {vault.length}</span>
           </div>
           {vault.length === 0 ? (
             <div className="p-32 glass-panel border border-white/5 rounded-xl text-center">
                <p className="text-zinc-600 font-orbitron uppercase tracking-[1em] text-[12px]">{t.vaultEmpty}</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {vault.map(p => (
                 <div key={p.id} className="cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => { setPrediction(p); setView('explorer'); window.scrollTo(0,0); }}>
                    <PredictionCard prediction={p} lang={lang} isPro={true} />
                 </div>
               ))}
             </div>
           )}
        </main>
      )}
      <Analytics />
    </div>
  );
};

export default App;
