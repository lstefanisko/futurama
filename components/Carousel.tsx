
import React, { useState, useEffect } from 'react';
import { Category } from '../types';

interface CarouselProps {
  category: Category;
}

const categorySlides: Record<Category, { title: string; desc: string; img: string; year: string }[]> = {
  [Category.TECHNOLOGY]: [
    {
      title: "Quantum Cities",
      desc: "Floating urban structures powered by zero-point energy and gravity modulation.",
      img: "https://images.unsplash.com/photo-1590212151175-e58edd96185b?auto=format&fit=crop&q=80&w=1200",
      year: "2085"
    },
    {
      title: "Neural Sync",
      desc: "Human consciousness interfaced directly with global hyper-networks.",
      img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
      year: "2060"
    },
    {
      title: "Self-Assembling Infrastructure",
      desc: "Nanobots creating mega-structures in hours without human labor.",
      img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200",
      year: "2095"
    }
  ],
  [Category.SOCIETY]: [
    {
      title: "Meta-Governance",
      desc: "Algorithmic decision-making models replacing traditional political systems.",
      img: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=1200",
      year: "2055"
    },
    {
      title: "Universal Credit Systems",
      desc: "Post-scarcity economies ensuring luxury-level basic needs for all.",
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
      year: "2070"
    },
    {
      title: "Virtual Heritage Archives",
      desc: "Full sensory reconstruction of lost cultures for future generations.",
      img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1200",
      year: "2100"
    }
  ],
  [Category.ENVIRONMENT]: [
    {
      title: "Atmospheric Restoration",
      desc: "Global arrays of carbon-capture towers reversing climate shifts.",
      img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
      year: "2065"
    },
    {
      title: "Neo-Biomes",
      desc: "Synthetically enhanced flora providing natural light and air purification.",
      img: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=1200",
      year: "2080"
    },
    {
      title: "Ocean Habitat Spheres",
      desc: "Self-sustaining aquatic civilizations harvesting thermal energy.",
      img: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?auto=format&fit=crop&q=80&w=1200",
      year: "2090"
    }
  ],
  [Category.HEALTH]: [
    {
      title: "Biological immortality",
      desc: "Cellular rejuvenation through daily nanobot micro-maintenance.",
      img: "https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?auto=format&fit=crop&q=80&w=1200",
      year: "2090"
    },
    {
      title: "Synthetic Organ Printing",
      desc: "On-demand vital organ replacement via personal bio-printers.",
      img: "https://images.unsplash.com/photo-1532187878419-4824e8677f52?auto=format&fit=crop&q=80&w=1200",
      year: "2045"
    },
    {
      title: "Cognitive Expansion",
      desc: "External brain modules providing unlimited processing power.",
      img: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=1200",
      year: "2075"
    }
  ],
  [Category.SPACE]: [
    {
      title: "Mars Terraforming",
      desc: "Sustainable terraforming projects across the Red Planet's surface.",
      img: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=1200",
      year: "2095"
    },
    {
      title: "Asteroid Resource Hubs",
      desc: "Automated extraction of heavy metals from the asteroid belt.",
      img: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200",
      year: "2080"
    },
    {
      title: "Interstellar Arcologies",
      desc: "Generation ships fueled by fusion power for deep-space transit.",
      img: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&q=80&w=1200",
      year: "2100"
    }
  ]
};

const Carousel: React.FC<CarouselProps> = ({ category }) => {
  const slides = categorySlides[category] || categorySlides[Category.TECHNOLOGY];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [category]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl border border-white/5">
      {slides.map((slide, idx) => (
        <div 
          key={`${category}-${idx}`}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
        >
          <img 
            src={slide.img} 
            className="w-full h-full object-cover" 
            alt={slide.title}
            loading={idx === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#010409] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute bottom-16 left-16 right-16 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-cyan-400 font-orbitron font-black text-[10px] tracking-widest uppercase rounded">
                PROJECTED: {slide.year}
              </span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <h4 className="text-7xl font-orbitron font-black text-white mb-6 text-glow tracking-tighter uppercase">{slide.title}</h4>
            <p className="text-zinc-300 text-xl max-w-2xl leading-relaxed font-medium italic">"{slide.desc}"</p>
          </div>
        </div>
      ))}
      
      <div className="absolute top-12 right-12 flex flex-col gap-3 z-20">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(idx);
            }}
            className={`w-1.5 transition-all rounded-full ${idx === current ? 'h-16 bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.8)]' : 'h-8 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(Carousel);
