
import React, { useState, useEffect, useMemo } from 'react';
import { Prediction, Language, RegionalImpact } from '../types';
import { translations } from '../translations';
import { generateFutureImage, editFutureImage, generateFutureAudio, decode, decodeAudioData } from '../services/geminiService';
import TaskList from './TaskList';

interface PredictionCardProps {
  prediction: Prediction;
  lang: Language;
  isPro: boolean;
}

type SortOrder = 'none' | 'asc' | 'desc';

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, lang, isPro }) => {
  const t = translations[lang];
  const [imgUrl, setImgUrl] = useState<string | null>(prediction.imageUrl || null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeRegion, setActiveRegion] = useState<RegionalImpact | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditingImg, setIsEditingImg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  
  // Create a unique ID for this specific prediction to associate tasks
  const predictionId = useMemo(() => {
    return `${prediction.year}-${prediction.category}-${prediction.title.replace(/\s+/g, '-').toLowerCase()}`;
  }, [prediction]);

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
      } else {
        throw new Error("No data received");
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

  const handleImageEdit = async () => {
    if (!imgUrl || !editPrompt.trim() || isEditingImg) return;
    setIsEditingImg(true);
    setErrorMsg(null);
    try {
      const updatedUrl = await editFutureImage(imgUrl, editPrompt);
      if (updatedUrl) {
        setImgUrl(updatedUrl);
        setEditPrompt("");
      }
    } catch (error) {
      setErrorMsg(lang === 'sk' ? "Úprava zlyhala." : "Edit failed.");
    } finally { setIsEditingImg(false); }
  };

  const toggleSort = () => {
    if (sortOrder === 'none') setSortOrder('desc');
    else if (sortOrder === 'desc') setSortOrder('asc');
    else setSortOrder('none');
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
                      onKeyDown={(e) => e.key === 'Enter' && handleImageEdit()}
                      className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-zinc-500 outline-none"
                    />
                    <button onClick={handleImageEdit} disabled={isEditingImg || !editPrompt.trim()} className="px-6 py-2 bg-cyan-500 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
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
            {isPlayingAudio ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" /></svg> : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828a1 1 0 010-1.415z" /></svg>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <h4 className="text-[12px] font-orbitron font-bold text-cyan-400 uppercase tracking-[0.4em] flex items-center gap-4">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                {lang === 'sk' ? 'Podrobné predpovede podľa regiónov' : 'Detailed regional predictions'}
              </h4>
              <div className="flex items-center gap-3">
                 <button onClick={toggleSort} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-orbitron font-bold text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all uppercase">
                    {sortOrder === 'none' ? t.sortDefault : sortOrder === 'desc' ? t.sortMaxMin : t.sortMinMax}
                 </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedRegionalImpact.map((impact, idx) => (
                <div key={`${impact.region}-${idx}`} onClick={() => setActiveRegion(impact)} className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-orbitron font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wider">{impact.region}</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">{impact.value}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000" style={{ width: `${impact.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 bg-white/[0.01] rounded-[2.5rem] border border-white/5 p-8">
            <TaskList predictionId={predictionId} lang={lang} />
          </div>
        </div>

        {activeRegion && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" onClick={() => setActiveRegion(null)} />
            <div className="relative glass w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
              <div className="p-8 lg:p-12 border-b border-white/5 flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-orbitron font-bold text-cyan-500 uppercase tracking-[0.4em]">{t.regionalDetail}</span>
                  <h2 className="text-4xl lg:text-5xl font-orbitron font-bold text-white neon-glow">{activeRegion.region}</h2>
                </div>
                <button onClick={() => setActiveRegion(null)} className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg>
                </button>
              </div>
              <div className="p-8 lg:p-12 overflow-y-auto custom-scrollbar flex-1">
                <div className="p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/20 mb-8 text-center">
                   <div className="text-5xl font-orbitron font-bold text-cyan-400">{activeRegion.value}%</div>
                </div>
                <h4 className="text-[10px] font-orbitron font-bold text-zinc-500 uppercase tracking-[0.4em] mb-4">{t.depthAnalysis}</h4>
                <p className="text-xl lg:text-2xl text-zinc-300 leading-relaxed font-light">{activeRegion.description}</p>
              </div>
              <div className="p-8 bg-zinc-950 border-t border-white/10 flex justify-end">
                <button onClick={() => setActiveRegion(null)} className="px-12 py-4 bg-white text-black rounded-2xl font-orbitron font-bold text-xs uppercase tracking-[0.2em] hover:bg-cyan-500 transition-all">{t.close}</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 pt-12 border-t border-white/5">
          <div className="space-y-8">
            <h4 className="text-[12px] font-orbitron font-bold text-cyan-400 uppercase tracking-[0.4em] flex items-center gap-3">{t.analysisLabel}</h4>
            <div className="p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5"><p className="text-zinc-400 text-lg leading-relaxed">{prediction.analysis}</p></div>
          </div>
          <div className="space-y-8">
            <h4 className="text-[12px] font-orbitron font-bold text-zinc-500 uppercase tracking-[0.4em]">{lang === 'sk' ? 'Kľúčové body' : 'Key points'}</h4>
            <div className="grid gap-4">
              {prediction.points.map((p, i) => (
                <div key={i} className="flex gap-6 p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group/item">
                  <span className="text-cyan-500 font-orbitron font-bold opacity-30">0{i+1}</span>
                  <p className="text-zinc-400 group-hover:text-white transition-colors">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {prediction.sources && prediction.sources.length > 0 && (
          <div className="mb-16 pt-12 border-t border-white/5">
            <h4 className="text-[11px] font-orbitron font-bold text-zinc-600 uppercase tracking-[0.4em] mb-8">Neural Grounding</h4>
            <div className="flex flex-wrap gap-4">
              {prediction.sources.map((source, idx) => (
                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-xs text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-3">
                  <span className="truncate max-w-[220px]">{source.title}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2"/></svg>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-10 pt-12 border-t border-white/5">
          <div className="flex gap-10 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-600 uppercase font-bold mb-3 tracking-widest">Impact Factor</span>
              <span className="text-[11px] font-orbitron font-bold uppercase px-5 py-2 rounded-xl border bg-cyan-500/10 border-cyan-500/40 text-cyan-400">{prediction.impactLevel}</span>
            </div>
          </div>
          <button className="w-full sm:w-auto px-12 py-5 bg-white text-black hover:bg-cyan-500 rounded-2xl text-xs font-bold font-orbitron uppercase tracking-[0.3em] transition-all">{t.shareVision}</button>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
