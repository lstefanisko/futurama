import React, { useState, useEffect } from 'react';

const slides = [
  {
    title: "Quantum Cities",
    desc: "Floating urban structures powered by zero-point energy.",
    img: "https://images.unsplash.com/photo-1590212151175-e58edd96185b?auto=format&fit=crop&q=80&w=1200",
  },
  {
    title: "Neural Sync",
    desc: "Human consciousness interfaced directly with global networks.",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
  },
  {
    title: "Mars Colonies",
    desc: "Sustainable terraforming projects across the Martian surface.",
    img: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=1200",
  }
];

const Carousel: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-[3rem] overflow-hidden group">
      {slides.map((slide, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
        >
          <img src={slide.img} className="w-full h-full object-cover" alt={slide.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
            <h4 className="text-4xl font-orbitron font-bold text-white mb-4 neon-glow">{slide.title}</h4>
            <p className="text-zinc-300 text-lg max-w-lg">{slide.desc}</p>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrent(idx)}
            className={`w-12 h-1 rounded-full transition-all ${idx === current ? 'bg-cyan-500' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;