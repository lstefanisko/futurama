import React from 'react';
import { ORBITRON_HEADING } from '../utils/styleConstants';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="glass-panel p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-8">
        {icon}
      </div>
      <h5 className={`text-2xl ${ORBITRON_HEADING} text-white mb-4 uppercase`}>{title}</h5>
      <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">{description}</p>
    </div>
  );
};

export default FeatureCard;
