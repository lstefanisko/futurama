
import React, { useState, useEffect, useMemo } from 'react';
import { Prediction, Language, RegionalImpact } from '../types';
import { translations } from '../translations';
import { generateFutureImage, editFutureImage, generateFutureAudio, deepTemporalAnalysis, decode, decodeAudioData } from '../services/geminiService';
import TaskList from './TaskList';
import LoadingSpinner from './LoadingSpinner';
import { ORBITRON_LABEL_SM, ORBITRON_LABEL_MD } from '../utils/styleConstants';

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
  const [audioError, setAudioError] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditingImg, setIsEditingImg] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [isSaved, setIsSaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [analysisQuery, setAnalysisQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    setImgUrl(prediction.imageUrl || null);
    setIsSaved(false);
    setAudioError(false);
    setAnalysisResult(null);
    setAnalysisQuery("");
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
    setAudioError(false);
    try {
      const audioBase64 = await generateFutureAudio(prediction.summary, lang);
      if (audioBase64) {
        const AudioCtxClass = (window.AudioContext || (window as any).webkitAudioContext);
        const audioCtx = new AudioCtxClass({ sampleRate: 24000 });
        const decoded = decode(audioBase64);
        const buffer = await decodeAudioData(decoded, audioCtx);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start();
      } else {
        throw new Error("Empty audio data");
      }
    } catch (e) { 
      setAudioError(true);
      setIsPlayingAudio(false);
      setTimeout(() => setAudioError(false), 3000);
    }
  };

  const handleImageGen = async () => {
    setIsGeneratingImg(true);
    try {
      const url = await generateFutureImage(prediction);
      if (url) setImgUrl(url);
    } finally { setIsGeneratingImg(false); }
  };

  const handleImageEdit = async () => {
    if (!imgUrl || !editPrompt.trim()) return;
    setIsEditingImg(true);
    try {
      const url = await editFutureImage(imgUrl, editPrompt);
      if (url) setImgUrl(url);
    } finally { setIsEditingImg(false); setEditPrompt(""); }
  };

  const handleDeepAnalysis = async () => {
    if (!analysisQuery.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const result = await deepTemporalAnalysis(prediction, analysisQuery, lang);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `FutureForecast ${prediction.year}: ${prediction.title}`,
      text: `${prediction.summary}\n\nVisualized by FutureForecast AI Oracle. Category: ${prediction.category}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        const textToCopy = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(textToCopy);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative h-[600px] bg-black overflow-hidden group">
        {imgUrl ? (
          <>
            <img src={imgUrl} className={`w-full h-full object-cover transition-transform duration-1000 ${isEditingImg ? 'scale-110 blur-sm opacity-60' : 'group-hover:scale-105'}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#010409] via-[#010409]/10 to-transparent" />
            
            {isEditingImg && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/10 animate-scan pointer-events-none" />
                <div className="relative z-30 flex flex-col items-center">
                  <LoadingSpinner size="lg" />
                  <span className="text-cyan-400 font-orbitron font-black tracking-[0.6em] text-[14px] uppercase animate-pulse mt-8">
                    Neural Re-Processing...
                  </span>
                </div>
              </div>
            )}
            
            <div className={`absolute bottom-10 left-10 right-10 transition-all duration-500 ${isEditingImg ? 'opacity-30 pointer-events-none scale-95' : 'opacity-100'}`}>
               <div className="flex gap-4 p-2 bg-[#010409]/80 border border-white/10 rounded-xl backdrop-blur-md">
                 <input 
                  type="text" 
                  value={editPrompt}
                  disabled={isEditingImg}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Neural Command for Visualization..."
                  className="flex-1 bg-transparent px-6 py-4 text-sm font-bold outline-none placeholder:text-zinc-600 disabled:opacity-50"
                 />
                 <button onClick={handleImageEdit} disabled={isEditingImg} className="px-10 py-4 bg-cyan-500 text-black font-black text-[10px] tracking-widest rounded uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                   {isEditingImg ? 'RE-CALCULATING...' : 'RE-RENDER'}
                 </button>
               </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-zinc-950/50 border-b border-white/5">
             <button onClick={handleImageGen} disabled={isGeneratingImg} className="flex flex-col items-center gap-4 group">
                <div className="p-10 rounded-full border border-cyan-500/20 bg-cyan-500/5 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="1.5"/></svg>
                </div>
                <span className="text-cyan-500 font-orbitron font-black tracking-[0.5em] text-[12px] uppercase">
                  {isGeneratingImg ? 'GENERATING VECTORS...' : 'INITIALIZE VISUALIZATION'}
                </span>
             </button>
          </div>
        )}
      </div>

      <div className="p-16">
        <div className="flex justify-between items-start gap-12 mb-16">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-10">
               <span className="px-5 py-1.5 bg-cyan-500 text-black font-orbitron font-black text-[10px] tracking-widest uppercase rounded-full">
                 {prediction.category}
               </span>
               <span className="text-zinc-600 font-mono text-[11px] font-black uppercase">Fid: {prediction.probability}%</span>
            </div>
            <h3 className="text-8xl font-orbitron font-black tracking-tighter text-white mb-10 text-glow leading-[0.9]">
              {prediction.title}
            </h3>
            <p className="text-4xl text-zinc-400 font-bold leading-tight max-w-5xl italic border-l-4 border-cyan-500 pl-10 py-4 bg-cyan-500/5">
              "{prediction.summary}"
            </p>
          </div>
          
          <div className="text-right">
             <div className="text-[10px] font-orbitron font-black text-zinc-600 uppercase mb-4 tracking-[0.4em]">Intensity</div>
             <div className={`text-6xl font-orbitron font-black ${prediction.impactLevel === 'Critical' ? 'text-red-500' : 'text-cyan-400'}`}>
                {prediction.impactLevel.toUpperCase()}
             </div>
          </div>
        </div>

        {/* Neural Analysis Section */}
        <div className="mb-20 glass-panel p-10 rounded-2xl border border-cyan-500/10">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h4 className={`${ORBITRON_LABEL_MD} text-cyan-400`}>DEEP NEURAL INSIGHT</h4>
           </div>
           
           {!analysisResult && (
             <div className="flex gap-4">
                <input 
                  type="text" 
                  value={analysisQuery}
                  onChange={(e) => setAnalysisQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeepAnalysis()}
                  placeholder="Ask the Oracle about specific temporal consequences..."
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-sm font-bold focus:border-cyan-500/50 outline-none transition-all"
                />
                <button 
                  onClick={handleDeepAnalysis} 
                  disabled={isAnalyzing || !analysisQuery.trim()}
                  className="px-8 bg-cyan-500 text-black font-orbitron font-black text-[10px] tracking-widest rounded-xl hover:bg-white disabled:opacity-50 transition-all"
                >
                  {isAnalyzing ? "THINKING..." : "QUERY"}
                </button>
             </div>
           )}

           {isAnalyzing && (
             <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in">
                <LoadingSpinner size="sm" />
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mt-6">Processing complex temporal vectors...</p>
             </div>
           )}

           {analysisResult && (
             <div className="animate-in slide-in-from-top-4 duration-700">
                <div className="text-zinc-300 text-lg leading-relaxed font-bold bg-cyan-500/5 p-8 rounded-xl border border-cyan-500/10 mb-6 whitespace-pre-wrap">
                   {analysisResult}
                </div>
                <button onClick={() => setAnalysisResult(null)} className="text-[10px] font-orbitron font-black text-cyan-500/50 hover:text-cyan-500 tracking-[0.4em] uppercase">
                   RESET_ANALYSIS_CHANNEL
                </button>
             </div>
           )}
        </div>

        {/* Prediction Sources / Neural Grounding */}
        {prediction.sources && prediction.sources.length > 0 && (
          <div className="mb-16 border-t border-white/5 pt-10">
             <h4 className="text-[12px] font-orbitron font-black text-white/40 tracking-[0.5em] uppercase mb-8">{t.sourcesTitle}</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prediction.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group glass-panel p-6 rounded-xl border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all flex items-center gap-4"
                  >
                    <div className="p-3 rounded-lg bg-white/5 text-cyan-500 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeWidth="1.5"/></svg>
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[11px] font-orbitron font-black text-white truncate mb-1">{source.title}</div>
                      <div className="text-[9px] font-mono text-zinc-500 truncate">{source.uri}</div>
                    </div>
                  </a>
                ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
          <div className="lg:col-span-7">
             <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                <h4 className="text-[14px] font-orbitron font-black tracking-[0.4em] text-white">REGIONAL IMPACTS</h4>
                <div className="flex gap-2">
                  {['none', 'asc', 'desc'].map(s => (
                    <button key={s} onClick={() => setSortOrder(s as any)} className={`px-4 py-1.5 text-[9px] font-black border transition-colors ${sortOrder === s ? 'bg-cyan-500 text-black border-cyan-500' : 'text-zinc-600 border-white/5 hover:border-white/10'}`}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedRegionalImpact.map((impact, i) => (
                  <div key={i} className="p-8 bg-white/[0.015] border border-white/5 rounded hover:border-cyan-500/30 transition-colors">
                     <div className="flex justify-between mb-4">
                        <span className="text-[12px] font-orbitron font-black text-white">{impact.region.toUpperCase()}</span>
                        <span className="text-cyan-400 font-mono font-black">{impact.value}%</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" style={{ width: `${impact.value}%` }} />
                     </div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="lg:col-span-5">
             <TaskList predictionId={prediction.id} lang={lang} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-10 pt-16 border-t border-white/5">
          <div className="flex gap-6 relative">
             <button onClick={() => { onSave && onSave(prediction); setIsSaved(true); }} disabled={isSaved} className={`px-12 py-5 border font-orbitron font-black text-[12px] tracking-[0.5em] transition-all ${isSaved ? 'bg-white/5 text-zinc-600 border-transparent' : 'border-white/10 text-white hover:bg-white/10'}`}>
               {isSaved ? "COMMITTED" : "COMMIT TO VAULT"}
             </button>
             <div className="relative group">
               <button onClick={handlePlayAudio} className={`p-5 border transition-all ${audioError ? 'border-red-500/50 text-red-500' : 'border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-black'}`}>
                  {isPlayingAudio ? (
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-current animate-pulse" />
                      <div className="w-1 h-6 bg-current animate-pulse delay-75" />
                      <div className="w-1 h-4 bg-current animate-pulse delay-150" />
                    </div>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" /></svg>
                  )}
               </button>
               {audioError && (
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded animate-in fade-in slide-in-from-bottom-2">
                   {lang === 'sk' ? "SYNTÉZA ZLYHALA" : "SYNTHESIS FAILED"}
                 </div>
               )}
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-6">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Temporal Signature</span>
                <span className="text-[11px] font-mono text-zinc-400 font-bold">NODE_{prediction.id.slice(0, 10)}</span>
             </div>
             <button 
                onClick={handleShare}
                className="px-8 py-5 border border-white/10 text-white font-orbitron font-black text-[12px] tracking-[0.5em] hover:bg-white/5 transition-all flex items-center gap-4 relative"
             >
               {copySuccess ? "LINK_COPIED" : "SHARE"}
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
               </svg>
             </button>
             <button className="px-12 py-5 bg-white text-black font-orbitron font-black text-[12px] tracking-[0.5em] hover:bg-cyan-500 shadow-xl active:scale-95">SHARE VISION</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
