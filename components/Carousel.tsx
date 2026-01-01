
import React, { useState, useEffect } from 'react';
import { Category } from '../types';

interface CarouselProps {
  category: Category;
}

const categorySlides: Record<Category, { title: string; desc: string; img: string; year: string }[]> = {
  [Category.SINGULARITY]: [
    {
      title: "Sentient Web",
      desc: "The global network achieves self-awareness, managing planetary resources autonomously.",
      img: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=1200",
      year: "2048"
    },
    {
      title: "Mind Uploading",
      desc: "Human consciousness begins transitioning into crystalline digital substrate.",
      img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
      year: "2072"
    }
  ],
  [Category.META_SOCIETY]: [
    {
      title: "Algorithmic Democracy",
      desc: "AI-driven voting models ensure perfect representation for all citizens.",
      img: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=1200",
      year: "2055"
    }
  ],
  [Category.ECO_CORE]: [
    {
      title: "Regen-Architecture",
      desc: "Cities that breathe, capturing CO2 and producing clean oxygen through bio-walls.",
      img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
      year: "2065"
    }
  ],
  [Category.BIO_GENETICS]: [
    {
      title: "The Age of Immortals",
      desc: "Genetic repair kits become affordable, extending life expectancy beyond 150 years.",
      img: "https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?auto=format&fit=crop&q=80&w=1200",
      year: "2088"
    }
  ],
  [Category.GALACTIC_AXIS]: [
    {
      title: "Europa Colonies",
      desc: "First permanent human settlements under the ice of Jupiter's moon.",
      img: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200",
      year: "2095"
    }
  ]
};

const Carousel: React.FC<CarouselProps> = ({ category }) => {
  const slides = categorySlides[category] || categorySlides[Category.SINGULARITY];
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
    <div className="relative w-full h-[800px] rounded-[4rem] overflow-hidden group shadow-2xl border border-white/5 bg-black">
      {slides.map((slide, idx) => (
        <div 
          key={`${category}-${idx}`}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
        >
          <img src={slide.img} className="w-full h-full object-cover grayscale opacity-60" alt={slide.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          <div className="absolute bottom-24 left-24 right-24 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="flex items-center gap-6 mb-10">
              <span className="px-8 py-3 bg-accent text-black font-inter font-black text-xs tracking-widest uppercase rounded-full">
                PROJECTED: {slide.year}
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <h4 className="text-8xl font-inter font-black text-white mb-10 tracking-tighter uppercase leading-[0.85]">{slide.title}</h4>
            <p className="text-white/50 text-3xl max-w-4xl leading-relaxed font-light italic border-l-8 border-accent pl-12">"{slide.desc}"</p>
          </div>
        </div>
      ))}
      
      <div className="absolute top-24 right-24 flex flex-col gap-6 z-20">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrent(idx)}
            className={`w-1.5 transition-all duration-500 rounded-full ${idx === current ? 'h-32 bg-accent' : 'h-16 bg-white/10 hover:bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
