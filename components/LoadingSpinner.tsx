import React from 'react';
import { SPINNER_SM, SPINNER_MD, SPINNER_LG } from '../utils/styleConstants';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message, className = '' }) => {
  const spinnerClass = size === 'sm' ? SPINNER_SM : size === 'lg' ? SPINNER_LG : SPINNER_MD;
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${spinnerClass} shadow-[0_0_20px_rgba(6,182,212,0.4)]`} />
      {message && (
        <h3 className="text-xl font-orbitron font-black tracking-[0.5em] text-cyan-500 animate-pulse mt-8">
          {message}
        </h3>
      )}
    </div>
  );
};

export default LoadingSpinner;
