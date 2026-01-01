
import React, { useState, useEffect } from 'react';
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
  const [audioError, setAudioError] = useState<string | null>(null);
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
    setAudioError(null);
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
      setAudioError("Audio synthesis failed.");
    }
  };

  const handleImageGen = async () => {
    setIsGeneratingImg(true);
    try {
      const url = await generateFutureImage(prediction);
      if (url) setImgUrl(url);
    } catch (err) {
      console.error(err);
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
    <div className="glass-panel overflow-hidden reveal-anim border-accent/20">
      
      {/* Visual Simulation Frame */}
      <div className="relative h-[700px] bg-black overflow-hidden border-b border-white/10 group">
        {imgUrl ? (
          <>
            <img src={imgUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-[2000ms] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            <div className="absolute top-10 left-10 flex items-center gap-5">
               <div className="w-3 h-3 bg-accent animate-ping rounded-full shadow-[0_0_15px_#00f3ff]" />
               <span className="text-[12px] font-mono text-white font-black tracking-widest uppercase bg-black/60 px-5 py-2 backdrop-blur-2xl border border-white/10">STREAM_ACTIVE // NEURAL_RENDER</span>
            </div>

            <div className="absolute bottom-10 left-10 right-10 flex gap-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
               <input 
                 type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)}
                 placeholder="INJECT PARAMETERS TO MODIFY SIMULATION..."
                 className="flex-1 bg-black/80 backdrop-blur-3xl border border-white/20 px-8 py-6 text-xs font-mono outline-none focus:border-accent text-white uppercase tracking-widest"
               />
               <button 
                 onClick={async () => {
                    setIsEditingImg(true);
                    const url = await editFutureImage(imgUrl!, editPrompt);
                    if(url) setImgUrl(url);
                    setIsEditingImg(false);
                 }}
                 className="px-12 py-6 bg-accent text-black font-black text-[11px] tracking-widest uppercase hover:bg-white transition-all shadow-[0_0_30px_rgba(0,243,255,0.4)]"
               >
                 {isEditingImg ? 'ADAPTING...' : 'REFRACT_VIEW'}
               </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-black/80 raw-grid">
             <button onClick={handleImageGen} disabled={isGeneratingImg} className="flex flex-col items-center gap-10 group">
                <div className="w-24 h-24 border border-accent/30 flex items-center justify-center rotate-45 group-hover:border-accent group-hover:bg-accent/5 transition-all duration-1000">
                   <div className="w-6 h-6 bg-accent/20 group-hover:bg-accent shadow-[0_0_20px_#00f3ff] transition-all" />
                </div>
                <span className="text-accent font-orbitron font-black tracking-[0.8em] text-[11px] uppercase glow-text">
                  {isGeneratingImg ? 'Synthesizing...' : 'Initialize_Visual_Link'}
                </span>
             </button>
          </div>
        )}
      </div>

      <div className="p-10 md:p-24 space-y-32">
        {/* Dossier Header */}
        <div className="flex flex-col 2xl:flex-row justify-between items-start gap-16">
          <div className="flex-1 space-y-12">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-accent" />
                  <span className="text-[13px] font-orbitron font-black text-accent tracking-[0.5em] uppercase">{prediction.category} // YEAR_{prediction.year}</span>
               </div>
               <div className="h-px flex-1 bg-white/10" />
               <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Confidence_{prediction.probability}%</span>
            </div>
            
            <h3 className="text-7xl md:text-9xl font-inter font-black text-white tracking-tightest leading-[0.85] uppercase">
              {prediction.title}
            </h3>
            
            <p className="text-3xl md:text-4xl text-white font-light border-l-8 border-accent pl-16 leading-tight italic max-w-5xl">
              {prediction.summary}
            </p>
          </div>
          
          <div className="2xl:w-1/4 text-right space-y-6 pt-12">
             <div className="text-[11px] font-orbitron font-black text-white/30 uppercase tracking-widest">Sim_Impact_Index</div>
             <div className="text-7xl font-orbitron font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {prediction.impactLevel}
             </div>
             <div className="h-[2px] w-full bg-accent/20" />
          </div>
        </div>

        {/* Dense Analysis Content */}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-32 border-t border-white/10 pt-24">
          <div className="2xl:col-span-8 space-y-16">
             <div className="flex items-center gap-8">
                <h4 className="text-[12px] font-orbitron font-black text-accent tracking-widest uppercase">Temporal_Logic_Stream</h4>
                <div className="h-px flex-1 bg-accent/20" />
             </div>
             <div className="text-white/90 text-xl md:text-2xl font-light leading-relaxed whitespace-pre-line bg-white/[0.02] p-12 md:p-16 border border-white/10 rounded-sm">
                {prediction.analysis}
             </div>

             {/* Verification Grounding */}
             {prediction.sources && prediction.sources.length > 0 && (
               <div className="space-y-8 pt-12">
                  <h4 className="text-[11px] font-orbitron font-black text-white/20 tracking-widest uppercase">Verified_Grounding_Nodes</h4>
                  <div className="flex flex-wrap gap-5">
                    {prediction.sources.map((src, idx) => (
                      <a 
                        key={idx} href={src.uri} target="_blank" rel="noopener noreferrer"
                        className="px-6 py-4 bg-white/5 border border-white/10 text-[11px] font-mono text-white/60 hover:text-accent hover:border-accent transition-all uppercase tracking-widest flex items-center gap-3"
                      >
                        <div className="w-1.5 h-1.5 bg-accent/50" />
                        {src.title}
                      </a>
                    ))}
                  </div>
               </div>
             )}
          </div>

          {/* Side Operational Matrix */}
          <aside className="2xl:col-span-4 space-y-24">
            <div className="space-y-12">
               <h4 className="text-[12px] font-orbitron font-black text-white tracking-widest uppercase">Regional_Refraction</h4>
               <div className="space-y-10">
                  {prediction.regionalImpact.map((impact, i) => (
                    <div key={i} className="space-y-5">
                       <div className="flex justify-between items-end">
                          <span className="text-[14px] font-orbitron font-black text-white uppercase tracking-wider">{impact.region}</span>
                          <span className="text-accent font-orbitron font-black text-2xl">{impact.value}%</span>
                       </div>
                       <div className="h-1 bg-white/5 w-full">
                          <div className="h-full bg-accent shadow-[0_0_15px_#00f3ff]" style={{ width: `${impact.value}%` }} />
                       </div>
                       <p className="text-[11px] text-white/40 uppercase font-mono tracking-widest leading-loose">{impact.description}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Neural Oracle Query */}
            <div className="glass-panel p-10 border-accent/20 space-y-8">
               <h4 className="text-[12px] font-orbitron font-black text-white tracking-widest uppercase">Neural_Oracle_Inquiry</h4>
               <p className="text-[11px] text-white/40 uppercase font-mono tracking-wider">Input complex parameters to cross-examine this specific temporal branch.</p>
               <input 
                 type="text" value={analysisQuery} onChange={(e) => setAnalysisQuery(e.target.value)}
                 className="w-full bg-black/60 border border-white/10 px-6 py-6 text-xs font-mono outline-none focus:border-accent text-white uppercase tracking-widest"
                 placeholder="AWAITING INPUT..."
               />
               <button 
                 onClick={handleDeepAnalysis} disabled={isAnalyzing}
                 className="w-full py-6 bg-transparent border border-accent text-accent font-black text-[11px] tracking-widest uppercase hover:bg-accent hover:text-black transition-all"
               >
                 {isAnalyzing ? "CONSULTING..." : "COMMIT_INQUIRY"}
               </button>
               {analysisResult && (
                 <div className="mt-6 p-8 bg-accent/5 border border-accent/20 text-xs font-mono text-accent leading-relaxed reveal-anim">
                   <div className="mb-4 text-[9px] text-accent/50">ORACLE_RESPONSE:</div>
                   {analysisResult}
                 </div>
               )}
            </div>

            <TaskList predictionId={prediction.id} lang={lang} />
          </aside>
        </div>

        {/* Data Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-12 pt-24 border-t border-white/10">
           <div className="flex gap-8">
             <button 
               onClick={() => { onSave && onSave(prediction); setIsSaved(true); }}
               className={`px-12 py-6 text-[12px] font-orbitron font-black tracking-widest uppercase transition-all shadow-xl ${isSaved ? 'bg-white/10 text-white/30 border border-white/5' : 'bg-white text-black hover:bg-accent'}`}
             >
               {isSaved ? 'NODE_COMMITTED' : 'SAVE_SIMULATION'}
             </button>
             <button 
               onClick={handlePlayAudio}
               className={`p-6 border-2 transition-all ${isPlayingAudio ? 'border-accent bg-accent text-black' : 'border-white/20 text-white hover:border-accent'}`}
             >
               {isPlayingAudio ? (
                 <div className="flex gap-1 h-6 items-center px-4">
                    <div className="w-1.5 h-4 bg-black animate-pulse"></div>
                    <div className="w-1.5 h-6 bg-black animate-pulse delay-75"></div>
                    <div className="w-1.5 h-3 bg-black animate-pulse delay-150"></div>
                 </div>
               ) : (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" /></svg>
               )}
             </button>
           </div>
           
           <div className="flex flex-col items-end gap-3">
             <span className="text-[11px] font-mono text-white/20 uppercase tracking-widest">Temporal_Node_ID</span>
             <span className="text-[14px] font-mono text-accent font-black bg-accent/5 px-6 py-3 border border-accent/20 uppercase tracking-[0.3em]">
               {prediction.id.toUpperCase()}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
