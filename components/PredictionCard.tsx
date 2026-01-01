import React, { useState, useEffect, useMemo } from 'react';
import { Prediction, Language } from '../types';
import { translations } from '../translations';
import { generateFutureImage, editFutureImage, generateFutureAudio, deepTemporalAnalysis, decode, decodeAudioData } from '../services/geminiService';
import TaskList from './TaskList';

interface PredictionCardProps {
  prediction: Prediction;
  lang: Language;
  isPro: boolean;
  onSave?: (prediction: Prediction) => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, lang, isPro, onSave }) => {
  const t = translations[lang];
  const [imgUrl, setImgUrl] = useState<string | null>(prediction.imageUrl || null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditingImg, setIsEditingImg] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [analysisQuery, setAnalysisQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    setImgUrl(prediction.imageUrl || null);
    setIsSaved(false);
    setAnalysisResult(null);
  }, [prediction]);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
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
      }
    } catch (e) { 
      setIsPlayingAudio(false);
    }
  };

  const handleImageGen = async () => {
    setIsGeneratingImg(true);
    try {
      const url = await generateFutureImage(prediction);
      if (url) setImgUrl(url);
    } finally { setIsGeneratingImg(false); }
  };

  const handleDeepAnalysis = async () => {
    if (!analysisQuery.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const result = await deepTemporalAnalysis(prediction, analysisQuery, lang);
      setAnalysisResult(result);
    } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="glossy-panel rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative h-[550px] bg-zinc-900 overflow-hidden border-b border-accent/20">
        {imgUrl ? (
          <>
            <img src={imgUrl} className={`w-full h-full object-cover transition-transform duration-1000 ${isEditingImg ? 'scale-110 blur-xl opacity-20' : 'opacity-80'}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            <div className="absolute bottom-8 left-8 right-8 flex gap-2">
               <input 
                  type="text" 
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Inject visual parameters..."
                  className="flex-1 bg-black/80 backdrop-blur-md border border-white/20 px-4 py-3 text-xs font-mono outline-none focus:border-accent transition-all text-white"
               />
               <button onClick={async () => {
                  setIsEditingImg(true);
                  const url = await editFutureImage(imgUrl, editPrompt);
                  if (url) setImgUrl(url);
                  setIsEditingImg(false);
                  setEditPrompt("");
               }} className="px-8 py-3 bg-accent text-black font-black text-[10px] tracking-widest uppercase hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                 RE-RENDER
               </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-black/40">
             <button onClick={handleImageGen} disabled={isGeneratingImg} className="flex flex-col items-center gap-6 group">
                <div className="w-20 h-20 border border-accent/40 flex items-center justify-center group-hover:border-accent transition-all neon-glow bg-black/20">
                   <div className={`w-3 h-3 bg-accent ${isGeneratingImg ? 'animate-ping' : ''}`} />
                </div>
                <span className="text-accent font-orbitron font-black tracking-[0.5em] text-[11px] uppercase text-neon">
                  {isGeneratingImg ? 'EXTRACTING_VISUALS...' : 'VISUALIZE_TIMELINE'}
                </span>
             </button>
          </div>
        )}
      </div>

      <div className="p-10 md:p-16">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
               <span className="text-[10px] font-mono text-accent tracking-[0.4em] uppercase font-black">Sector_{prediction.category}</span>
               <div className="w-12 h-[1px] bg-white/10" />
               <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Confidence: {prediction.probability}%</span>
            </div>
            <h3 className="text-5xl md:text-8xl font-orbitron font-black text-white tracking-tighter mb-10 leading-none text-neon">
              {prediction.title}
            </h3>
            <p className="text-xl md:text-2xl text-zinc-300 font-light leading-relaxed max-w-4xl border-l-2 border-accent/40 pl-8 italic">
              {prediction.summary}
            </p>
          </div>
          
          <div className="flex flex-col items-end bg-white/5 p-6 border border-white/10">
             <div className="text-[10px] font-mono text-accent uppercase tracking-[0.4em] mb-3 font-black">Impact_Level</div>
             <div className="text-4xl font-orbitron font-black text-white tracking-tighter uppercase text-neon">
                {prediction.impactLevel}
             </div>
          </div>
        </div>

        {/* Deep Analysis Section */}
        <div className="mb-20 border border-white/10 p-10 bg-black/60 shadow-2xl">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-2 h-2 bg-accent animate-pulse shadow-[0_0_10px_#00f3ff]" />
              <h4 className="text-[12px] font-orbitron font-black text-white tracking-[0.4em] uppercase">Temporal Logic Node</h4>
           </div>
           
           <div className="flex gap-4 mb-10">
              <input 
                type="text" 
                value={analysisQuery}
                onChange={(e) => setAnalysisQuery(e.target.value)}
                placeholder="Query specific temporal ripple effects..."
                className="flex-1 bg-white/5 border-b border-white/20 px-4 py-3 text-sm focus:border-accent outline-none transition-all text-white placeholder:text-zinc-600"
              />
              <button 
                onClick={handleDeepAnalysis} 
                disabled={isAnalyzing}
                className="px-10 py-3 border border-accent text-accent text-[11px] font-black tracking-widest uppercase hover:bg-accent hover:text-black transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]"
              >
                {isAnalyzing ? "SYNCING..." : "INVOKE"}
              </button>
           </div>

           {analysisResult && (
             <div className="text-zinc-200 text-sm leading-relaxed font-mono bg-black/80 p-8 border border-accent/20 animate-in fade-in duration-500">
                <div className="text-accent text-[9px] mb-4 tracking-widest">ANALYSIS_RESULT:</div>
                {analysisResult}
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-16 border-t border-white/10">
          <div className="lg:col-span-8">
             <h4 className="text-[12px] font-orbitron font-black text-white/40 tracking-[0.6em] mb-12 uppercase">Regional_Matrix_Data</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {prediction.regionalImpact.map((impact, i) => (
                  <div key={i} className="group p-8 border border-white/5 bg-white/[0.02] hover:border-accent/40 transition-all">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-[11px] font-orbitron font-black text-white/70 uppercase tracking-widest">{impact.region}</span>
                        <span className="text-accent font-mono text-xs font-black">{impact.value}%</span>
                     </div>
                     <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
                        <div className="h-full bg-accent shadow-[0_0_15px_#00f3ff]" style={{ width: `${impact.value}%` }} />
                     </div>
                     <p className="mt-4 text-[10px] text-zinc-500 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                       {impact.description}
                     </p>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="lg:col-span-4 bg-white/[0.01] p-8 border border-white/5">
             <TaskList predictionId={prediction.id} lang={lang} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 mt-20 pt-16 border-t border-white/10">
           <button onClick={() => { onSave && onSave(prediction); setIsSaved(true); }} className={`px-12 py-5 neon-btn text-[11px] font-orbitron font-black tracking-[0.5em] uppercase ${isSaved ? 'opacity-30 pointer-events-none' : 'bg-accent text-black'}`}>
             {isSaved ? '[ COMMIT_SUCCESS ]' : '[ COMMIT_TO_CORE ]'}
           </button>
           <button onClick={handlePlayAudio} className="p-5 border border-white/10 text-accent hover:border-accent hover:bg-accent/5 transition-all">
              {isPlayingAudio ? (
                <div className="flex gap-1.5 h-4 items-center px-2">
                  <div className="w-1 h-3 bg-accent animate-pulse" />
                  <div className="w-1 h-4 bg-accent animate-pulse delay-75" />
                  <div className="w-1 h-2 bg-accent animate-pulse delay-150" />
                </div>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" /></svg>
              )}
           </button>
           <div className="ml-auto text-right">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-[0.4em] mb-1">Temporal_Identity</div>
              <div className="text-[12px] font-mono text-white/80 font-black">ID: {prediction.id.toUpperCase()}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;