
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface PricingSectionProps {
  lang: Language;
  onPlanSelected: (planId: string) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ lang, onPlanSelected }) => {
  const t = translations[lang] || translations.en;

  const plans = [
    {
      id: 'free',
      name: 'Explorer',
      price: '$0',
      features: ['Up to year 2040', 'Basic text analysis', 'Community archive access'],
      cta: 'Current Plan',
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$24.99',
      features: ['Up to year 2065', 'AI visual generation', 'Audio summaries', 'Saved archive (50 slots)'],
      cta: 'Upgrade to Standard',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro Visionary',
      price: '$49.99',
      features: ['Full access to 2100', 'Ultra-HD Cinematic Visions', 'Personal AI Temporal Assistant', 'Unlimited archive', 'Priority data grounding'],
      cta: 'Go Pro',
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-24 px-8">
      <div className="text-center mb-20">
        <h2 className="text-5xl font-inter font-black text-white tracking-tighter mb-4">Choose your horizon</h2>
        <p className="text-xl text-white/40 max-w-2xl mx-auto">Select the depth of your insight into the next century.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`p-10 rounded-[3rem] flex flex-col border transition-all duration-500 ${
              plan.popular 
                ? 'bg-accent/5 border-accent shadow-[0_0_80px_rgba(0,243,255,0.1)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <h3 className="text-2xl font-inter font-bold text-white mb-2">{plan.name}</h3>
            <div className="mb-8">
              <span className="text-5xl font-inter font-black text-white">{plan.price}</span>
              <span className="text-white/30 ml-2">{t.plans.perMonth}</span>
            </div>
            
            <ul className="space-y-4 mb-12 flex-grow">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onPlanSelected(plan.id)}
              className={`w-full py-5 rounded-full font-inter font-bold text-sm tracking-widest uppercase transition-all ${
                plan.popular ? 'bg-accent text-black hover:bg-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingSection;
