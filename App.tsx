
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
      document.title = `FutureForecast | Neural Oracle`;
    }
  }, [prediction]);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          fetchUserProfile(session.user.id, session.user.email!);
        }
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          fetchUserProfile(session.user.id, session.user.email!);
        } else {
          setUser(null);
          setVault([]);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setUser({ id: userId, email, is_pro: data.is_pro, predictions_count: data.predictions_count || 0 });
    } else {
      const newProfile = { id: userId, email, is_pro: false, predictions_count: 0 };
      await supabase.from('profiles').insert([newProfile]);
      setUser(newProfile);
    }
    loadVault(userId);
  };

  const loadVault = async (userId: string) => {
    const data = await fetchUserVault(userId);
    setVault(data);
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
    if (!user?.is_pro && selectedYear > 2045) {
      setView('pricing');
      return;
    }
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

  const handlePaymentSuccess = async (planId: string, orderDetails: any) => {
    if (user && supabase) {
      try {
        await supabase.from('profiles').update({ is_pro: true, last_payment_id: orderDetails.id }).eq('id', user.id);
        setUser({ ...user, is_pro: true });
        setView('explorer');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30">
      {!hasEntered && <LandingPage onEnter={() => setHasEntered(true)} />}

      <header className={`sticky top-0 z-[100] glass border-b border-white/5 px-8 py-5 transition-opacity duration-1000 ${hasEntered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="max-w-[1800px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setView('explorer'); setPrediction(null); }}>
            <div className="flex gap-0.5">
               <div className="w-1 h-3 bg-white" />
               <div className="w-1 h-5 bg-white" />
               <div className="w-1 h-2 bg-white" />
            </div>
            <h1 className="text-xl font-orbitron font-black tracking-[0.3em] text-white uppercase">{t.title}</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-12 text-[11px] font-orbitron font-black tracking-[0.4em]">
            {['explorer', 'vault', 'pricing'].map(v => (
              <button key={v} onClick={() => setView(v as any)} className={`relative py-2 transition-colors ${view === v ? 'text-white' : 'text-zinc-500 hover:text-white uppercase'}`}>
                {t[v as keyof typeof t] || v}
                {view === v && <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-white shadow-[0_0_10px_#fff]" />}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
             {user ? (
               <div className="flex items-center gap-4">
                 {user.is_pro && <span className="text-[9px] font-black bg-white text-black px-2 py-0.5 rounded uppercase">PRO</span>}
                 <button onClick={handleLogout} className="px-4 py-2 text-[9px] font-orbitron border border-white/20 text-white rounded hover:bg-white hover:text-black transition-all">OUT</button>
               </div>
             ) : (
               <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2 border border-white text-white font-orbitron font-black text-[10px] rounded hover:bg-white hover:text-black transition-all uppercase">Connect</button>
             )}
             <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="bg-transparent text-[10px] font-black text-zinc-500 uppercase outline-none">
                {['en', 'sk'].map(l => <option key={l} value={l} className="bg-[#000]">{l}</option>)}
             </select>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} lang={lang} />

      <div className={`transition-all duration-1000 ${hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
        {view === 'explorer' && (
          <main className="max-w-[1800px] mx-auto px-8 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <aside className="lg:col-span-3 space-y-8">
              <section className="glass-panel p-8 rounded-xl border border-white/5 sticky top-32">
                <h2 className="text-[10px] font-orbitron font-black text-zinc-500 mb-8 uppercase tracking-[0.5em]">{t.settings}</h2>
                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{t.timeline}</label>
                      <span className={`text-5xl font-orbitron font-black ${!user?.is_pro && selectedYear > 2045 ? 'text-zinc-700' : 'text-white'}`}>{selectedYear}</span>
                    </div>
                    <input type="range" min="2025" max="2100" step="5" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full" />
                    {!user?.is_pro && selectedYear > 2045 && (
                      <p className="mt-4 text-[9px] text-white/50 uppercase font-bold tracking-widest bg-white/5 p-3 border border-white/10 rounded">
                        ⚠️ {t.yearLimit}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {Object.values(Category).map((cat) => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)} 
                        className={`px-6 py-4 rounded text-[10px] font-orbitron font-bold text-left border transition-all ${selectedCategory === cat ? 'bg-white/10 border-white text-white' : 'bg-transparent border-white/5 text-zinc-600 hover:border-white/10'}`}
                      >
                        {t.categories[cat]}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleGenerate} 
                    disabled={isLoading} 
                    className={`w-full py-5 rounded text-[12px] font-orbitron font-black tracking-[0.5em] transition-all disabled:opacity-50 ${!user?.is_pro && selectedYear > 2045 ? 'bg-zinc-900 text-zinc-600 border border-white/10' : 'bg-white text-black hover:bg-zinc-200'}`}
                  >
                    {isLoading ? 'WORKING...' : t.generate}
                  </button>
                </div>
              </section>
              <section className="glass-panel p-8 rounded-xl border border-white/5">
                 <WorldMap data={prediction?.regionalImpact || []} lang={lang} isLoading={isLoading} />
              </section>
            </aside>

            <section className="lg:col-span-9">
              {isLoading ? (
                <div className="glass-panel rounded-xl h-[700px] flex flex-col items-center justify-center border border-white/5">
                  <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mb-8" />
                  <h3 className="text-xl font-orbitron font-black tracking-[0.5em] text-white animate-pulse uppercase">{t.loading}</h3>
                </div>
              ) : prediction ? (
                <div className="space-y-12 animate-in fade-in duration-700">
                  <PredictionCard prediction={prediction} lang={lang} isPro={user?.is_pro || false} onSave={() => {}} />
                  <VisionStream lang={lang} />
                </div>
              ) : (
                <div className="space-y-16">
                  <div className="text-center py-24 px-12 glass-panel border border-white/5 rounded-xl relative overflow-hidden flex flex-col items-center justify-center">
                     <p className="text-zinc-500 font-orbitron font-black uppercase tracking-[0.4em] text-lg mb-8 opacity-90 pb-4 max-w-4xl">
                       {t.slogan}
                     </p>
                     <h2 className="heading-hero font-orbitron text-white mb-4 uppercase">
                       {t.readyTitle}
                     </h2>
                  </div>
                  <Carousel category={selectedCategory} />
                  <VisionStream lang={lang} />
                </div>
              )}
            </section>
          </main>
        )}

        {view === 'pricing' && (
          <div className="max-w-[1800px] mx-auto px-8 pt-12 pb-24">
            <PricingSection lang={lang} user={user} onPlanSelected={() => setView('explorer')} onPaymentSuccess={handlePaymentSuccess} />
          </div>
        )}

        {view === 'vault' && (
          <main className="max-w-[1800px] mx-auto px-8 pt-12 pb-24">
             <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-12 uppercase">
                <h2 className="text-6xl font-orbitron font-black tracking-tighter uppercase">{t.vault}</h2>
                <span className="text-[12px] font-mono text-zinc-500 font-bold tracking-[0.5em]">LOGS: {vault.length}</span>
             </div>
             {vault.length === 0 ? (
               <div className="p-32 glass-panel border border-white/5 rounded-xl text-center">
                  <p className="text-zinc-600 font-orbitron uppercase tracking-[1em] text-[12px]">{t.vaultEmpty}</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {vault.map(p => (
                   <div key={p.id} className="cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => { setPrediction(p); setView('explorer'); window.scrollTo(0,0); }}>
                      <PredictionCard prediction={p} lang={lang} isPro={user?.is_pro || false} />
                   </div>
                 ))}
               </div>
             )}
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
