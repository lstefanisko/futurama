
import React, { useEffect, useRef } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; z: number; originX: number; originY: number }[] = [];
    
    const ROWS = 55; // Hustejšia sieť
    const COLS = 85;
    const SPACING = 22;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          particles.push({
            x: 0,
            y: 0,
            z: 0,
            originX: (j - COLS / 2) * SPACING,
            originY: (i - ROWS / 2) * SPACING
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.current.y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    const draw = (time: number) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const fov = 700;

      particles.forEach((p, i) => {
        const dist = Math.sqrt(p.originX * p.originX + p.originY * p.originY);
        // Vyššia amplitúda a frekvencia vĺn pre "výraznejší pohyb"
        const wave1 = Math.sin(dist * 0.015 - time * 0.003) * 70; 
        const wave2 = Math.cos(p.originX * 0.008 + time * 0.002) * 40;
        
        const mouseDist = Math.sqrt(
          Math.pow(p.originX - mouse.current.x * 600, 2) + 
          Math.pow(p.originY - mouse.current.y * 600, 2)
        );
        const interaction = Math.max(0, 150 - mouseDist * 0.4) * 2;

        const z = wave1 + wave2 + interaction + 200;
        const scale = fov / (fov + z);
        
        const x = centerX + p.originX * scale;
        const y = centerY + p.originY * scale + interaction * 0.3;

        const alpha = Math.min(1, (scale * 0.9) * (1 - dist / 1800));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        
        const size = Math.max(0.6, scale * 2.5);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    draw(0);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      <div className="absolute top-10 left-10 flex items-center gap-4 mix-blend-difference">
         <div className="w-12 h-[1px] bg-white opacity-60" />
         <span className="text-[9px] font-orbitron font-black tracking-[0.5em] text-white uppercase">Neural Oracle v3.1</span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="px-6 py-2 border border-white/10 text-[10px] font-orbitron font-black tracking-[0.5em] text-white uppercase backdrop-blur-md">
            ESTABLISHED_2025
          </span>
        </div>

        <div className="space-y-4 mb-16">
          <h2 className="text-7xl md:text-[12rem] font-orbitron font-black text-white tracking-tighter leading-[0.8] uppercase animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Unlock your<br />
            <span className="font-thin opacity-30 lowercase italic tracking-[-0.08em]">future growth</span>
          </h2>
        </div>

        <button 
          onClick={onEnter}
          className="group relative px-20 py-10 border border-white/5 hover:border-white transition-all duration-700 overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500"
        >
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]" />
          <span className="relative z-10 text-white group-hover:text-black font-orbitron font-black text-[11px] tracking-[0.8em] transition-colors duration-500 uppercase">
            Initialize Core
          </span>
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
    </div>
  );
};

export default LandingPage;
