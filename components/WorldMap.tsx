
import React, { useEffect, useRef, useState } from 'react';
import { RegionalImpact, Language } from '../types';
import { translations } from '../translations';

interface WorldMapProps {
  data: RegionalImpact[];
  lang: Language;
  isLoading?: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({ data, lang, isLoading = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotation = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: { x: number; y: number; z: number }[] = [];
    const particleCount = 1800;
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
      return { ...p, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
    };

    const rotateY = (p: {x:number, y:number, z:number}, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { ...p, x: p.x * cos + p.z * sin, z: -p.x * sin + p.z * cos };
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (!isDragging.current) {
        rotation.current.y += 0.005;
      }

      particles.forEach((p, i) => {
        let transformed = rotateX(p, rotation.current.x);
        transformed = rotateY(transformed, rotation.current.y);

        if (transformed.z > -radius) {
          const scale = 500 / (500 + transformed.z);
          const x = centerX + transformed.x * scale;
          const y = centerY + transformed.y * scale;
          const alpha = (transformed.z + radius) / (radius * 2.5);
          
          ctx.fillStyle = i % 20 === 0 ? '#00f3ff' : '#ffffff';
          ctx.globalAlpha = alpha * 0.5;
          ctx.beginPath();
          ctx.arc(x, y, scale * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientWidth;
      }
    };

    window.addEventListener('resize', resize);
    resize();
    initGlobe();
    draw(0);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [data]);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[10px] font-orbitron font-black text-accent tracking-[0.5em] uppercase">Holo_Globe_v2</h4>
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#00f3ff]" />
      </div>
      <div className="aspect-square glossy-panel rounded-full overflow-hidden relative cursor-move">
        <canvas ref={canvasRef} className="w-full h-full" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
             <span className="text-[10px] font-orbitron font-black text-white tracking-[0.4em] animate-pulse">SYNCING...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
