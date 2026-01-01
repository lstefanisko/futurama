
import React, { useState, useEffect } from 'react';
import { Category, Prediction, Language, UserProfile } from './types';
import { getFuturePrediction } from './services/geminiService';
import PredictionCard from './components/PredictionCard';
import WorldMap from './components/WorldMap';
import PricingSection from './components/PricingSection';
import Carousel from './components/Carousel';
import VisionStream from './components/VisionStream';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import { translations } from './translations';
import { supabase, fetchUserVault } from './services/supabaseService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [view, setView] = useState<'explorer' | 'pricing' | 'vault'>('explorer');
  const [selectedYear, setSelectedYear] = useState<number>(2035);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.TECHNOLOGY);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vault, setVault] = useState<Prediction[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const t = translations[lang];

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) fetchUserProfile(session.user.id, session.user.email!);
      });
    }
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setUser({ id: userId, email, is_pro: data.is_pro, predictions_count: data.predictions_count || 0 });
    loadVault(userId);
  };

  const loadVault = async (userId: string) => {
    const data = await fetchUserVault(userId);
    setVault(data);
  };

  const handleGenerate = async () => {
    if (!user?.is_pro && selectedYear > 2045) { setView('pricing'); return; }
    setIsLoading(true);
    try {
      const data = await getFuturePrediction(selectedYear, selectedCategory, lang);
      setPrediction({ ...data, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {!hasEntered && <LandingPage onEnter={() => setHasEntered(true)} />}

      <header className={`fixed top-0 w-full z-[100] transition-opacity duration-1000 ${hasEntered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="mx-auto flex justify-between items-center px-12 py-6 border-b-[0.5px] border-white/10 backdrop-blur-3xl bg-black/40">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setView('explorer'); setPrediction(null); }}>
            <div className="w-1.5 h-1.5 bg-accent shadow-[0_0_10px_#00f3ff] group-hover:scale-125 transition-all" />
            <h1 className="text-lg font-orbitron font-black tracking-[0.4em] text-white uppercase">{t.title}</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-orbitron font-black tracking-[0.5em] text-white/40">
            {['explorer', 'vault', 'pricing'].map(v => (
              <button key={v} onClick={() => setView(v as any)} className={`hover:text-accent transition-colors ${view === v ? 'text-accent' : ''}`}>
                {t[v as keyof typeof t] || v.toUpperCase()}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
             <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2 border-[0.5px] border-white/20 text-[9px] font-orbitron font-black tracking-widest hover:border-accent hover:text-accent transition-all uppercase">
               {user ? 'PROFILE' : 'CONNECT'}
             </button>
             <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="bg-transparent text-[10px] font-black text-zinc-600 outline-none hover:text-white transition-colors">
                {['en', 'sk'].map(l => <option key={l} value={l} className="bg-black">{l}</option>)}
             </select>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} lang={lang} />

      <main className={`transition-all duration-1000 pt-32 px-12 ${hasEntered ? 'opacity-100' : 'opacity-0 translate-y-20'}`}>
        {view === 'explorer' && (
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">
            <aside className="lg:col-span-3 space-y-8">
              <div className="glossy-panel p-8 space-y-12">
                <div>
                   <label className="text-[9px] font-mono text-accent uppercase tracking-[0.4em] block mb-6">Timeline_Anchor</label>
                   <div className="text-6xl font-orbitron font-black text-white mb-4">{selectedYear}</div>
                   <input type="range" min="2025" max="2100" step="5" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full accent-accent" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-accent uppercase tracking-[0.4em] block mb-4">Sector_Select</label>
                  {Object.values(Category).map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full py-3 px-4 border-[0.5px] text-[10px] font-orbitron font-black text-left transition-all ${selectedCategory === cat ? 'border-accent bg-accent/10 text-accent' : 'border-white/5 text-white/30 hover:text-white'}`}>
                      {t.categories[cat]}
                    </button>
                  ))}
                </div>

                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-5 neon-btn bg-accent text-black font-orbitron font-black text-[11px] tracking-[0.6em]">
                  {isLoading ? 'SYNCING...' : '[ INVOKE ]'}
                </button>
              </div>

              <WorldMap data={prediction?.regionalImpact || []} lang={lang} isLoading={isLoading} />
            </aside>

            <section className="lg:col-span-9 space-y-12">
              {isLoading ? (
                <div className="glossy-panel h-[600px] flex flex-col items-center justify-center">
                   <div className="w-12 h-12 border-[0.5px] border-accent/20 border-t-accent rounded-full animate-spin mb-6" />
                   <div className="text-[10px] font-orbitron font-black text-accent tracking-[0.5em] animate-pulse">EXTRACTING_POSSIBILITIES</div>
                </div>
              ) : prediction ? (
                <PredictionCard prediction={prediction} lang={lang} isPro={user?.is_pro || false} />
              ) : (
                <div className="space-y-24">
                  <div className="text-center py-20 border-[0.5px] border-white/5">
                     <h2 className="text-8xl md:text-[10rem] font-orbitron font-black text-white/5 tracking-tighter uppercase pointer-events-none">NEURAL ORACLE</h2>
                     <p className="text-xl text-white/40 font-light tracking-[0.3em] uppercase -mt-12">{t.slogan}</p>
                  </div>
                  <Carousel category={selectedCategory} />
                  <VisionStream lang={lang} />
                </div>
              )}
            </section>
          </div>
        )}

        {view === 'pricing' && <PricingSection lang={lang} user={user} onPlanSelected={() => setView('explorer')} />}
        
        {view === 'vault' && (
           <div className="max-w-[1200px] mx-auto py-12">
              <h2 className="text-5xl font-orbitron font-black text-white tracking-tighter mb-12 uppercase">Temporal Vault</h2>
              {vault.length === 0 ? (
                <div className="py-40 border-[0.5px] border-white/5 text-center text-white/20 font-orbitron uppercase tracking-widest">No data committed to core.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {vault.map(p => <div key={p.id} onClick={() => { setPrediction(p); setView('explorer'); }} className="cursor-pointer hover:brightness-125 transition-all"><PredictionCard prediction={p} lang={lang} isPro={true} /></div>)}
                </div>
              )}
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
