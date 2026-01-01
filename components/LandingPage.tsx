
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
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { originX: number; originY: number }[] = [];
    
    const ROWS = 40;
    const COLS = 60;
    const SPACING = 35;

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
            originX: (j - COLS / 2) * SPACING,
            originY: (i - ROWS / 2) * SPACING
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX - window.innerWidth / 2);
      mouse.current.y = (e.clientY - window.innerHeight / 2);
    };

    const draw = (time: number) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const fov = 1200;

      particles.forEach((p, idx) => {
        const dist = Math.sqrt(p.originX * p.originX + p.originY * p.originY);
        const wave = Math.sin(dist * 0.005 - time * 0.002) * 50;
        
        const dx = p.originX - mouse.current.x * 0.3;
        const dy = p.originY - mouse.current.y * 0.3;
        const mDist = Math.sqrt(dx * dx + dy * dy);
        const interaction = Math.max(0, 150 - mDist * 0.25) * 2;

        const z = wave + interaction + 500;
        const scale = fov / (fov + z);
        
        const x = centerX + p.originX * scale;
        const y = centerY + p.originY * scale;

        // Accent coloring for some particles
        if (idx % 25 === 0) {
          ctx.fillStyle = '#00f3ff';
          ctx.globalAlpha = scale * 0.8;
        } else {
          ctx.fillStyle = '#fff';
          ctx.globalAlpha = scale * 0.4;
        }
        
        const size = Math.max(0.4, scale * 1.5);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.globalAlpha = 1.0;
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
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none blur-[1px] opacity-80" 
      />
      
      {/* HUD Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 flex gap-4 items-center">
          <div className="w-8 h-[0.5px] bg-accent"></div>
          <span className="text-[10px] font-mono tracking-[0.5em] text-accent/80 uppercase">Node_Active: 0x4F2A</span>
        </div>
        <div className="absolute bottom-10 right-10 flex flex-col items-end gap-1">
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">Resonance Level</span>
          <div className="w-32 h-[2px] bg-white/10 overflow-hidden">
            <div className="h-full bg-accent w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="px-4 py-1 border-[0.5px] border-accent/30 text-[9px] font-orbitron font-black tracking-[0.6em] text-accent uppercase backdrop-blur-md">
            ESTABLISHED_2100
          </span>
        </div>

        <div className="mb-16 select-none">
          <h2 className="text-5xl md:text-8xl font-orbitron font-black text-white tracking-tighter leading-[0.9] uppercase mb-1">
            UNLOCK YOUR<br />
            <span className="text-accent text-neon">FUTURE GROWTH</span>
          </h2>
          <div className="w-24 h-[1px] bg-accent/40 mx-auto mt-8"></div>
        </div>

        <button 
          onClick={onEnter}
          className="group relative px-12 py-5 neon-btn bg-black/40 backdrop-blur-xl"
        >
          <span className="relative z-10 text-white group-hover:text-black font-orbitron font-black text-[10px] tracking-[1em] transition-colors duration-500 uppercase">
            [ INITIALIZE ]
          </span>
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
    </div>
  );
};

export default LandingPage;
