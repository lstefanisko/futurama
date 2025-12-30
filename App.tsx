
import React, { useState, useEffect } from 'react';
import { Category, Prediction, Language } from './types';
import { getFuturePrediction } from './services/geminiService';
import PredictionCard from './components/PredictionCard';
import WorldMap from './components/WorldMap';
import PricingSection from './components/PricingSection';
import { translations } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('sk');
  const [view, setView] = useState<'explorer' | 'pricing'>('explorer');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedYear, setSelectedYear] = useState<number>(2035);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.TECHNOLOGY);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [genCount, setGenCount] = useState<number>(0);
  
  const t = translations[lang];

  const loadingSteps = [
    t.loading,
    lang === 'sk' ? 'Inicializujem neurónovú sieť...' : 'Initializing neural network...',
    lang === 'sk' ? 'Skenujem paralelné reality...' : 'Scanning parallel realities...',
    lang === 'sk' ? 'Kalkulujem pravdepodobnostné uzly...' : 'Calculating probability nodes...',
    lang === 'sk' ? 'Renderujem finálnu víziu...' : 'Rendering final vision...'
  ];

  // Dynamická aktualizácia titulku karty prehliadača
  useEffect(() => {
    if (prediction) {
      const categoryLabel = t.categories[prediction.category];
      document.title = `${prediction.year} | ${categoryLabel} - ${prediction.title}`;
    } else {
      document.title = `${t.title} - ${t.readyTitle}`;
    }
  }, [prediction, lang, t]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }
    const savedCount = localStorage.getItem('gen_count');
    if (savedCount) setGenCount(parseInt(savedCount));
    const savedPro = localStorage.getItem('is_pro');
    if (savedPro === 'true') setIsPro(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  const handleGenerate = async () => {
    if (!isPro && genCount >= 2) {
      setView('pricing');
      return;
    }
    setIsLoading(true);
    setLoadingStep(0);
    
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1800);

    try {
      const data = await getFuturePrediction(selectedYear, selectedCategory, lang);
      setPrediction(data);
      if (!isPro) {
        const newCount = genCount + 1;
        setGenCount(newCount);
        localStorage.setItem('gen_count', newCount.toString());
      }
    } catch (error) {
      console.error("AI Protocol Error:", error);
      alert("AI Protocol Error: " + error);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${theme} selection:bg-cyan-500/30`}>
      <header className="sticky top-0 z-[100] glass border-b border-white/5 px-6 py-5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setView('explorer'); setPrediction(null); }}>
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:rotate-[15deg] transition-all duration-500">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl font-orbitron font-bold tracking-tighter neon-glow dark:text-white text-zinc-900 uppercase">
              {t.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-[10px] font-orbitron font-bold uppercase tracking-[0.3em]">
              <button onClick={() => setView('explorer')} className={`transition-all hover:text-cyan-400 ${view === 'explorer' ? 'text-cyan-400' : 'text-zinc-500'}`}>{t.explorer}</button>
              <button onClick={() => setView('pricing')} className={`transition-all hover:text-cyan-400 ${view === 'pricing' ? 'text-cyan-400' : 'text-zinc-500'}`}>{t.pricing}</button>
            </nav>

            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

            <button onClick={toggleTheme} className="p-2.5 rounded-xl glass hover:border-cyan-500/40 text-zinc-500 hover:text-cyan-400 transition-all border border-white/5">
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            <div className="flex gap-1 glass p-1 rounded-xl border border-white/5 bg-white/[0.02]">
                {['sk', 'en', 'de', 'pl', 'es'].map(code => (
                    <button key={code} onClick={() => setLang(code as any)} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-orbitron font-bold transition-all ${lang === code ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-zinc-500 hover:text-white'}`}>{code.toUpperCase()}</button>
                ))}
            </div>
          </div>
        </div>
      </header>

      {view === 'explorer' ? (
        <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <section className="glass rounded-[2rem] p-8 border border-white/10 relative overflow-hidden">
              <div className="scan-line animate-scan opacity-10" />
              <h2 className="text-[10px] font-orbitron font-bold text-zinc-500 mb-8 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                {t.settings}
              </h2>
              
              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-end mb-6">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t.timeline}</label>
                    <span className="text-4xl font-orbitron font-bold text-cyan-400 leading-none">{selectedYear}</span>
                  </div>
                  <input 
                    type="range" 
                    min="2025" 
                    max={isPro ? 2100 : 2045} 
                    step="5" 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                    className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-500" 
                  />
                  {!isPro && <p className="text-[9px] text-zinc-600 mt-4 italic">{t.yearLimit}</p>}
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-6">{t.sector}</label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.values(Category).map((cat) => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)} 
                        className={`px-6 py-4 rounded-xl text-[10px] font-orbitron font-bold text-left transition-all border ${
                          selectedCategory === cat 
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' 
                            : 'bg-white/[0.02] border-transparent text-zinc-500 hover:border-white/10'
                        }`}
                      >
                        {t.categories[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGenerate} 
                  disabled={isLoading} 
                  className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black font-orbitron font-bold rounded-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      {t.generate}
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="glass rounded-[2rem] h-[600px] flex flex-col items-center justify-center p-12 text-center border border-white/10 overflow-hidden relative">
                <div className="scan-line animate-scan" />
                <div className="relative mb-10">
                   <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-cyan-500 rounded-lg animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.6)]" />
                   </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-orbitron font-bold text-cyan-400 uppercase tracking-widest animate-pulse">{loadingSteps[loadingStep]}</h3>
                  <div className="w-64 h-1.5 bg-zinc-800 rounded-full mx-auto overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-500" 
                      style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            ) : prediction ? (
              <PredictionCard prediction={prediction} lang={lang} isPro={isPro} />
            ) : (
              <div className="glass rounded-[2rem] h-[600px] flex flex-col items-center justify-center p-12 text-center border border-white/10 group">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-cyan-500/10 transition-colors border border-white/5">
                  <svg className="w-10 h-10 text-zinc-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-2xl font-orbitron font-bold dark:text-white text-zinc-900 mb-4">{t.readyTitle}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-xs">{t.readyDesc}</p>
              </div>
            )}
          </div>
        </main>
      ) : (
        <PricingSection 
          lang={lang} 
          user={{ id: '1' }} 
          onPlanSelected={(id) => {
            if (id === 'pro') setIsPro(true);
            setView('explorer');
          }} 
        />
      )}
    </div>
  );
};

export default App;
