
import React, { useState } from 'react';
import { Language, PricingPlan, Currency } from '../types';
import { translations } from '../translations';

interface PricingSectionProps {
  lang: Language;
  user: any;
  onPlanSelected: (planId: string) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ lang, user, onPlanSelected }) => {
  const t = translations[lang];
  const [currency, setCurrency] = useState<Currency>(lang === 'sk' ? 'EUR' : 'USD');

  const currencies: { code: Currency; symbol: string }[] = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
  ];

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'GUEST NODE',
      description: 'Foundational entry to temporal labs.',
      price: { USD: '0', EUR: '0', GBP: '0', JPY: '0', CNY: '0' },
      period: '/free',
      features: ['Standard Predictions', 'Timeline 2045', 'Public Archive Access', 'Standard Accuracy']
    },
    {
      id: 'pro',
      name: 'VISIONARY PRO',
      description: 'Maximum temporal resolution. No limits.',
      price: { USD: '29', EUR: '27', GBP: '23', JPY: '4200', CNY: '210' },
      period: t.perMonth,
      isPopular: true,
      features: ['Full 2100 Timeline', 'AI Image Generation', 'Neural TTS Output', 'Grounding Data Search', 'Encrypted Vault Storage']
    },
    {
      id: 'enterprise',
      name: 'ORACLE CORE',
      description: 'API integration and singular logic access.',
      price: { USD: '99', EUR: '95', GBP: '80', JPY: '14500', CNY: '715' },
      period: t.perMonth,
      features: ['White-Label Reports', 'Direct API Access', 'Custom Model Tuning', 'Priority Server Node', '24/7 Neural Support']
    }
  ];

  return (
    <section>
      <div className="text-center mb-24">
         <span className="text-cyan-500 font-orbitron font-black tracking-[1em] text-[11px] mb-8 block">SYSTEM_ACCESS_MODELS</span>
         <h2 className="text-8xl font-orbitron font-black tracking-tighter mb-8">CHOOSE YOUR ACCESS</h2>
         <div className="flex justify-center gap-2">
            {currencies.map(c => (
              <button 
                key={c.code} 
                onClick={() => setCurrency(c.code)}
                className={`px-4 py-2 text-[10px] font-black border transition-colors ${currency === c.code ? 'bg-cyan-500 text-black border-cyan-500' : 'text-zinc-600 border-white/10 hover:border-white/20'}`}
              >
                {c.code}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`pricing-card glass-panel rounded-xl p-12 border flex flex-col ${plan.isPopular ? 'border-cyan-500/50 bg-cyan-500/[0.02]' : 'border-white/5'}`}>
            {plan.isPopular && (
              <div className="mb-8 inline-block"><span className="bg-cyan-500 text-black px-4 py-1 text-[10px] font-black tracking-widest uppercase">MOST POWERFUL</span></div>
            )}
            <h3 className={`text-3xl font-orbitron font-black mb-4 ${plan.isPopular ? 'text-cyan-400' : 'text-white'}`}>{plan.name}</h3>
            <p className="text-zinc-500 text-sm mb-12 font-medium">{plan.description}</p>
            
            <div className="mb-12 border-y border-white/5 py-8">
              <span className="text-7xl font-orbitron font-black tracking-tighter">
                {currencies.find(c => c.code === currency)?.symbol}{plan.price[currency]}
              </span>
              <span className="text-zinc-600 font-mono text-sm ml-2 font-bold">{plan.period}</span>
            </div>

            <ul className="space-y-6 mb-16 flex-grow">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-4 text-zinc-300 text-sm font-bold group">
                  <div className={`w-1.5 h-1.5 rounded-full ${plan.isPopular ? 'bg-cyan-500' : 'bg-white/10'} group-hover:scale-150 transition-transform`} />
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => {
                if (plan.id === 'basic') onPlanSelected(plan.id);
                else window.open('https://www.paypal.com/checkout', '_blank');
              }} 
              className={`w-full py-6 font-orbitron font-black text-[12px] tracking-[0.4em] transition-all ${plan.isPopular ? 'bg-cyan-500 text-black hover:bg-white shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-white/5 border border-white/10 hover:border-white/20'}`}
            >
              INITIALIZE_LINK
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
