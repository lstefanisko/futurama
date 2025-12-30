
import React, { useState, useEffect } from 'react';
import { Category, Prediction, Language } from './types';
import { getFuturePrediction } from './services/geminiService';
import PredictionCard from './components/PredictionCard';
import WorldMap from './components/WorldMap';
import PricingSection from './components/PricingSection';
import Carousel from './components/Carousel';
import { translations } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'explorer' | 'pricing' | 'vault'>('explorer');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedYear, setSelectedYear] = useState<number>(2035);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.TECHNOLOGY);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [genCount, setGenCount] = useState<number>(0);
  const [vault, setVault] = useState<Prediction[]>([]);
  
  const t = translations[lang];

  const loadingSteps = [
    t.loading,
    lang === 'sk' ? 'Inicializujem neurónovú sieť...' : 'Initializing neural engine...',
    lang === 'en' ? 'Resolving probability matrix...' : 'Synthesizing...'
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) { setTheme(savedTheme); document.body.className = savedTheme; }
    
    const savedGenCount = localStorage.getItem('gen_count');
    if (savedGenCount) setGenCount(parseInt(savedGenCount));
    
    const savedPro = localStorage.getItem('is_pro');
    if (savedPro === 'true') setIsPro(true);

    const savedVault = localStorage.getItem('neural_vault');
    if (savedVault) setVault(JSON.parse(savedVault));
  }, []);

  const saveToVault = (p: Prediction) => {
    const updatedVault = [p, ...vault.filter(item => item.id !== p.id)].slice(0, 20);
    setVault(updatedVault);
    localStorage.setItem('neural_vault', JSON.stringify(updatedVault));
  };

  const handleGenerate = async () => {
    if (!isPro && genCount >= 3) { setView('pricing'); return; }
    setIsLoading(true);
    setLoadingStep(0);
    const interval = setInterval(() => setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev)), 1800);
    try {
      const data = await getFuturePrediction(selectedYear, selectedCategory, lang);
      const newPrediction: Prediction = { ...data, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
      setPrediction(newPrediction);
      if (!isPro) {
        const newCount = genCount + 1;
        setGenCount(newCount);
        localStorage.setItem('gen_count', newCount.toString());
      }
    } catch (error) {
      alert("Temporal Link Failed: " + error);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'explorer', label: t.explorer },
    { id: 'vault', label: t.vault },
    { id: 'pricing', label: t.pricing },
  ];

  const languages = ['en', 'sk', 'fr', 'it', 'ja', 'es', 'pl', 'de', 'pt', 'zh'];

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${theme} selection:bg-cyan-500/30`}>
      <header className="sticky top-0 z-[100] glass border-b border-white/5 px-8 py-6 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6 cursor-pointer group" onClick={() => { setView('explorer'); setPrediction(null); }}>
            <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-500">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-2xl font-orbitron font-bold tracking-tighter dark:text-white text-zinc-900 uppercase">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-10 text-[11px] font-orbitron font-bold uppercase tracking-[0.4em]">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setView(item.id as any)} className={`transition-all hover:text-cyan-400 ${view === item.id ? 'text-cyan-400' : 'text-zinc-500'}`}>{item.label}</button>
              ))}
            </nav>
            <div className="flex gap-1 glass p-1 rounded-2xl border border-white/10 max-w-[200px] overflow-x-auto custom-scrollbar">
                {languages.map(code => (
                    <button key={code} onClick={() => setLang(code as any)} className={`px-2 py-1 rounded-xl text-[9px] font-orbitron font-bold transition-all ${lang === code ? 'bg-cyan-500 text-black' : 'text-zinc-500'}`}>{code.toUpperCase()}</button>
                ))}
            </div>
          </div>
        </div>
      </header>

      {view === 'explorer' && (
        <main className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-10">
            <section className="glass rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden">
              <div className="scan-line animate-scan opacity-10" />
              <h2 className="text-[11px] font-orbitron font-bold text-zinc-500 mb-10 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-2 h-2 bg-cyan-500 rounded-full" />{t.settings}</h2>
              <div className="space-y-12">
                <div>
                  <div className="flex justify-between items-end mb-8">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t.timeline}</label>
                    <span className="text-4xl font-orbitron font-bold text-cyan-400 leading-none">{selectedYear}</span>
                  </div>
                  <input type="range" min="2025" max={isPro ? 2100 : 2045} step="5" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none accent-cyan-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-8">{t.sector}</label>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.values(Category).map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-5 rounded-2xl text-[11px] font-orbitron font-bold text-left border ${selectedCategory === cat ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-white/[0.02] border-transparent text-zinc-500'}`}>{t.categories[cat]}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-6 bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-4 tracking-[0.3em]">
                  {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>{t.generate}</>}
                </button>
              </div>
            </section>
          </div>
          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="glass rounded-[3rem] h-[700px] flex flex-col items-center justify-center p-20 text-center border border-white/10 relative">
                <div className="scan-line animate-scan" />
                <h3 className="text-3xl font-orbitron font-bold text-cyan-400 uppercase tracking-widest animate-pulse">{loadingSteps[loadingStep]}</h3>
              </div>
            ) : prediction ? (
              <PredictionCard prediction={prediction} lang={lang} isPro={isPro} onSave={saveToVault} />
            ) : (
              <div className="space-y-12">
                <Carousel />
                <div className="glass rounded-[3rem] p-16 border border-white/10 text-center">
                  <h3 className="text-4xl font-orbitron font-bold text-white mb-6 uppercase tracking-tight">{t.readyTitle}</h3>
                  <p className="text-zinc-500 text-xl font-light leading-relaxed max-w-lg mx-auto">{t.readyDesc}</p>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {view === 'vault' && (
        <main className="max-w-7xl mx-auto px-6 mt-16 space-y-12">
          <h2 className="text-5xl font-orbitron font-bold text-white mb-10">{t.vault}</h2>
          {vault.length === 0 ? (
            <div className="glass p-20 rounded-[3rem] text-center border border-white/10">
              <p className="text-zinc-500">{t.vaultEmpty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {vault.map(p => (
                <div key={p.id} className="cursor-pointer" onClick={() => { setPrediction(p); setView('explorer'); }}>
                  <PredictionCard prediction={p} lang={lang} isPro={isPro} />
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {view === 'pricing' && (
        <PricingSection lang={lang} user={{id:1}} onPlanSelected={() => {setIsPro(true); setView('explorer');}} />
      )}
    </div>
  );
};

export default App;
