
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { RegionalImpact, Language } from '../types';
import { translations } from '../translations';

interface WorldMapProps {
  data: RegionalImpact[];
  lang: Language;
  isLoading?: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ data, lang, isLoading = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = translations[lang];
  const [selectedInfo, setSelectedInfo] = useState<RegionalImpact | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const rotation = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Region coordinates mapping (normalized -1 to 1 for spherical projection)
  // Memoize to avoid recreating on every render
  const regionCoords = useMemo<Record<string, { x: number, y: number, z: number }>>(() => ({
    'North America': { x: -0.5, y: 0.4, z: 0.76 },
    'South America': { x: -0.35, y: -0.4, z: 0.84 },
    'Europe': { x: 0.15, y: 0.5, z: 0.85 },
    'Africa': { x: 0.2, y: -0.1, z: 0.97 },
    'Asia': { x: 0.7, y: 0.4, z: 0.59 },
    'Oceania': { x: 0.8, y: -0.5, z: 0.35 },
  }), []);

  // Intersection Observer to detect visibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: { x: number; y: number; z: number }[] = [];
    // Reduced particle count for better performance
    const particleCount = 1200;
    const radius = 140;

    const initGlobe = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        particles.push({
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: radius * Math.sin(phi) * Math.sin(theta),
          z: radius * Math.cos(phi)
        });
      }
    };

    const rotateX = (p: {x:number, y:number, z:number}, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y = p.y * cos - p.z * sin;
      const z = p.y * sin + p.z * cos;
      return { ...p, y, z };
    };

    const rotateY = (p: {x:number, y:number, z:number}, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = p.x * cos + p.z * sin;
      const z = -p.x * sin + p.z * cos;
      return { ...p, x, z };
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientWidth; // Square aspect
      }
    };

    const draw = (time: number) => {
      // Skip rendering if not visible
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (!isDragging.current) {
        rotation.current.y += 0.005;
      }

      // Draw globe particles
      particles.forEach((p, i) => {
        let transformed = rotateX(p, rotation.current.x);
        transformed = rotateY(transformed, rotation.current.y);

        if (transformed.z > -radius * 0.5) { // Depth sorting simple
          const scale = 400 / (400 + transformed.z);
          const x = centerX + transformed.x * scale;
          const y = centerY + transformed.y * scale;
          
          const alpha = Math.max(0.05, (transformed.z + radius) / (radius * 2));
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, scale * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw impact markers
      data.forEach(impact => {
        const baseCoord = regionCoords[Object.keys(regionCoords).find(k => impact.region.includes(k)) || 'Asia'];
        if (baseCoord) {
          const sphereCoord = {
            x: baseCoord.x * radius,
            y: baseCoord.y * radius,
            z: baseCoord.z * radius
          };
          let transformed = rotateX(sphereCoord, rotation.current.x);
          transformed = rotateY(transformed, rotation.current.y);

          if (transformed.z > 0) {
            const scale = 400 / (400 + transformed.z);
            const x = centerX + transformed.x * scale;
            const y = centerY + transformed.y * scale;

            // Pulsing highlight
            const pulse = (Math.sin(time * 0.005) + 1) * 0.5;
            const impactSize = (impact.value / 10) * pulse * 15;

            ctx.shadowBlur = 15;
            ctx.shadowColor = 'white';
            ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(x, y, 3 + pulse * 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Outer ring
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * pulse})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, 10 + impactSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      rotation.current.y += dx * 0.01;
      rotation.current.x += dy * 0.01;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    resize();
    initGlobe();
    draw(0);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [data, isVisible]);

  return (
    <div className="relative space-y-8 select-none">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[10px] font-orbitron font-black text-white/40 tracking-[0.5em] uppercase">Global Neural Mesh</h4>
        <div className="flex gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
           <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Live Projection</span>
        </div>
      </div>

      <div className="relative aspect-square glass-panel rounded-full border border-white/5 overflow-hidden group cursor-move">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
             <div className="w-12 h-12 border border-white/20 border-t-white rounded-full animate-spin mb-4" />
             <span className="text-[9px] font-orbitron font-black text-white tracking-[0.3em] uppercase animate-pulse">Scanning Geodata...</span>
          </div>
        )}

        {/* Region List Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
           <div className="space-y-1">
              {data.slice(0, 3).map((impact, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className="w-1 h-3 bg-white/20" />
                   <span className="text-[8px] font-orbitron font-black text-white/60 uppercase tracking-widest">{impact.region}</span>
                </div>
              ))}
           </div>
           <div className="text-right">
              <span className="text-[20px] font-orbitron font-black text-white leading-none">
                 {data.length > 0 ? `${data.length} NODES` : '0 NODES'}
              </span>
           </div>
        </div>
      </div>

      {/* Manual Controls Hint */}
      <div className="text-center">
         <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Drag to rotate neural globe • Click regions for detail</p>
      </div>

      {/* Legend */}
      <div className="pt-6 border-t border-white/5 grid grid-cols-4 gap-2">
         {['MIN', 'MED', 'HIGH', 'CRIT'].map((label, i) => (
           <div key={label} className="flex flex-col gap-2">
              <div className="h-[1px] bg-white" style={{ opacity: 0.05 + i * 0.15 }} />
              <span className="text-[8px] font-orbitron font-black text-zinc-600 tracking-tighter">{label}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default React.memo(WorldMap);
