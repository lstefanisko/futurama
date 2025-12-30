
import React, { useState, useEffect, useMemo } from 'react';
import { Prediction, Language, RegionalImpact } from '../types';
import { translations } from '../translations';
import { generateFutureImage, editFutureImage, generateFutureAudio, decode, decodeAudioData } from '../services/geminiService';
import TaskList from './TaskList';

interface PredictionCardProps {
  prediction: Prediction;
  lang: Language;
  isPro: boolean;
  onSave?: (prediction: Prediction) => void;
}

type SortOrder = 'none' | 'asc' | 'desc';

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, lang, isPro, onSave }) => {
  const t = translations[lang];
  const [imgUrl, setImgUrl] = useState<string | null>(prediction.imageUrl || null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeRegion, setActiveRegion] = useState<RegionalImpact | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditingImg, setIsEditingImg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [isSaved, setIsSaved] = useState(false);
  
  const predictionId = prediction.id;

  const [freeImagesUsed, setFreeImagesUsed] = useState<number>(() => {
    return parseInt(localStorage.getItem('free_images_used') || '0');
  });

  const canGenerateImage = isPro || freeImagesUsed < 1;

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    setSortOrder('none');
    setImgUrl(prediction.imageUrl || null);
    setIsSaved(false);
  }, [prediction]);

  const sortedRegionalImpact = useMemo(() => {
    if (sortOrder === 'none') return prediction.regionalImpact;
    return [...prediction.regionalImpact].sort((a, b) => {
      if (sortOrder === 'asc') return a.value - b.value;
      return b.value - a.value;
    });
  }, [prediction.regionalImpact, sortOrder]);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    setErrorMsg(null);
    try {
      const audioBase64 = await generateFutureAudio(prediction.summary, lang);
      if (audioBase64) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decoded = decode(audioBase64);
        const buffer = await decodeAudioData(decoded, audioCtx);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start();
      }
    } catch (error) {
      setErrorMsg(lang === 'sk' ? "Audio zlyhalo." : "Audio failed.");
      setIsPlayingAudio(false);
    }
  };

  const handleImageGen = async () => {
    if (!canGenerateImage) { alert(t.proOnly); return; }
    setIsGeneratingImg(true);
    setErrorMsg(null);
    try {
      const url = await generateFutureImage(prediction);
      if (url) {
        setImgUrl(url);
        if (!isPro) {
          const newCount = freeImagesUsed + 1;
          setFreeImagesUsed(newCount);
          localStorage.setItem('free_images_used', newCount.toString());
        }
      }
    } catch (error) {
      setErrorMsg(lang === 'sk' ? "Vizualizácia zlyhala." : "Visualization failed.");
    } finally { setIsGeneratingImg(false); }
  };

  const handleDownload = () => {
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `FUTURAMA_${prediction.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToVault = () => {
    if (onSave) {
      onSave({ ...prediction, imageUrl: imgUrl || undefined });
      setIsSaved(true);
    }
  };

  return (
    <div className="glass rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="scan-line animate-scan" />
      
      <div className="relative group">
        {imgUrl ? (
          <div className="relative w-full overflow-hidden">
            <div className="h-96 md:h-[32rem] w-full overflow-hidden">
                <img src={imgUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Future visualization" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>
            <div className="absolute top-6 right-6 flex gap-3">
              <button onClick={handleDownload} className="p-3 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 text-cyan-400 hover:text-white transition-all shadow-xl group/btn">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </button>
            </div>
            <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 z-20">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-orbitron font-bold text-cyan-400 bg-cyan-500/10 px-4 py-1 rounded-full border border-cyan-500/20 uppercase tracking-[0.3em]">Neural Mod Active</span>
                     {isEditingImg && <span className="text-[9px] font-orbitron text-cyan-500 animate-pulse uppercase tracking-widest">Re-sequencing...</span>}
                     {errorMsg && <span className="text-[9px] font-orbitron text-red-500 uppercase bg-red-500/10 px-3 py-1 rounded-full animate-bounce">{errorMsg}</span>}
                  </div>
                  <div className="flex gap-2 p-1.5 bg-zinc-950/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl focus-within:border-cyan-500/50 transition-all">
                    <input 
                      type="text" 
                      placeholder={lang === 'sk' ? "Uprav scénu..." : "Edit scene..."}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-zinc-500 outline-none"
                    />
                    <button onClick={handleImageGen} className="px-6 py-2 bg-cyan-500 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                      {lang === 'sk' ? 'Upraviť' : 'Edit'}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <button onClick={handleImageGen} disabled={isGeneratingImg || (!canGenerateImage && !isPro)} className={`w-full h-80 flex flex-col items-center justify-center gap-4 transition-all border-b border-white/5 bg-white/5 hover:bg-white/10`}>
            {isGeneratingImg ? <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" /> : <div className="text-center"><span className="text-xs font-bold text-cyan-400 uppercase tracking-[0.3em] block">{t.visualize}</span></div>}
          </button>
        )}
      </div>

      <div className="p-8 lg:p-14">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] font-bold bg-cyan-500 text-black px-4 py-1.5 rounded-full uppercase tracking-tighter">{t.categories[prediction.category]}</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">Target: {prediction.year}</span>
            </div>
            <h3 className="text-5xl lg:text-6xl font-orbitron font-bold text-white leading-[1.1] neon-glow">{prediction.title}</h3>
          </div>
          <div className="bg-cyan-500/5 p-8 rounded-[2.5rem] border border-cyan-500/20 min-w-[160px] text-center backdrop-blur-xl">
            <div className="text-4xl font-orbitron font-bold text-cyan-400">{prediction.probability}%</div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mt-2">{t.probabilityLabel}</div>
          </div>
        </div>

        <div className="relative mb-16 group">
          <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-500 to-transparent rounded-full" />
          <p className="text-zinc-300 leading-relaxed italic text-2xl lg:text-3xl pl-6 py-4">"{prediction.summary}"</p>
          <button onClick={handlePlayAudio} disabled={isPlayingAudio} className={`absolute -right-4 top-1/2 -translate-y-1/2 p-5 rounded-full glass border border-cyan-500/30 text-cyan-400 hover:scale-110 transition-all ${isPlayingAudio ? 'animate-pulse bg-cyan-500/20' : ''}`}>
             <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <h4 className="text-[12px] font-orbitron font-bold text-cyan-400 uppercase tracking-[0.4em] flex items-center gap-4">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                {t.globalImpact}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prediction.regionalImpact.map((impact, idx) => (
                <div key={idx} onClick={() => setActiveRegion(impact)} className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">{impact.region}</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">{impact.value}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${impact.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 bg-white/[0.01] rounded-[2.5rem] border border-white/5 p-8">
            <TaskList predictionId={predictionId} lang={lang} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-10 pt-12 border-t border-white/5">
          <div className="flex gap-4">
             <button onClick={handleSaveToVault} disabled={isSaved} className={`px-10 py-5 rounded-2xl text-xs font-bold font-orbitron uppercase tracking-[0.3em] transition-all border ${isSaved ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
               {isSaved ? "SAVED" : t.saveVault}
             </button>
             <button className="px-10 py-5 bg-white text-black hover:bg-cyan-500 rounded-2xl text-xs font-bold font-orbitron uppercase tracking-[0.3em] transition-all">{t.shareVision}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
