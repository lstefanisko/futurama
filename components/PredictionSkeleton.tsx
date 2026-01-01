import React from 'react';

interface PredictionSkeletonProps {
  loadingText: string;
}

const PredictionSkeleton: React.FC<PredictionSkeletonProps> = ({ loadingText }) => {
  return (
    <div className="glossy-panel rounded-none overflow-hidden animate-pulse">
      {/* Header Image Area Skeleton */}
      <div className="relative h-[500px] bg-zinc-900/50 overflow-hidden border-b-[0.5px] border-accent/10 shimmer-bg">
        {/* Scan line effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-accent/20 shadow-[0_0_15px_#00f3ff] animate-scan z-10" />
        
        <div className="h-full flex flex-col items-center justify-center relative z-20">
           <div className="w-16 h-16 border-[0.5px] border-accent/20 rounded flex items-center justify-center mb-6">
              <div className="w-2 h-2 bg-accent/40 animate-ping" />
           </div>
           <span className="text-accent/60 font-orbitron font-black tracking-[0.4em] text-[10px] uppercase animate-pulse">
             {loadingText}
           </span>
        </div>
      </div>

      <div className="p-8 md:p-12 space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
               <div className="h-3 w-32 bg-white/5 rounded relative overflow-hidden shimmer-bg" />
               <div className="w-12 h-[0.5px] bg-white/10" />
               <div className="h-3 w-24 bg-white/5 rounded relative overflow-hidden shimmer-bg" />
            </div>
            
            <div className="space-y-4">
              <div className="h-16 w-3/4 bg-white/10 rounded relative overflow-hidden shimmer-bg" />
              <div className="h-16 w-1/2 bg-white/10 rounded relative overflow-hidden shimmer-bg" />
            </div>

            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-white/5 rounded relative overflow-hidden shimmer-bg" />
              <div className="h-4 w-full bg-white/5 rounded relative overflow-hidden shimmer-bg" />
              <div className="h-4 w-2/3 bg-white/5 rounded relative overflow-hidden shimmer-bg" />
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="h-2 w-16 bg-white/5 rounded relative overflow-hidden shimmer-bg" />
             <div className="h-10 w-32 bg-white/10 rounded relative overflow-hidden shimmer-bg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t-[0.5px] border-white/10">
          <div className="lg:col-span-8 space-y-10">
             <div className="h-3 w-40 bg-white/5 rounded relative overflow-hidden shimmer-bg" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="p-6 border-[0.5px] border-white/5 space-y-4 relative overflow-hidden shimmer-bg">
                     <div className="flex justify-between">
                        <div className="h-3 w-20 bg-white/5 rounded" />
                        <div className="h-3 w-8 bg-white/5 rounded" />
                     </div>
                     <div className="h-[1px] bg-white/5 w-full" />
                  </div>
                ))}
             </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="h-3 w-24 bg-white/5 rounded relative overflow-hidden shimmer-bg" />
             <div className="h-40 w-full bg-white/5 rounded-2xl relative overflow-hidden shimmer-bg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionSkeleton;