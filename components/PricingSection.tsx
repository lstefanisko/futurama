
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
  const [currency, setCurrency] = useState<Currency>(lang === 'ja' ? 'JPY' : lang === 'zh' ? 'CNY' : lang === 'sk' || lang === 'de' ? 'EUR' : 'USD');

  const currencies: { code: Currency; symbol: string }[] = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'CNY', symbol: '¥' },
  ];

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: lang === 'en' ? 'Explorer' : t.categories.SOCIETY,
      description: 'Entry-level simulation access.',
      price: { USD: '0', EUR: '0', GBP: '0', JPY: '0', CNY: '0' },
      period: t.perMonth,
      features: ['Basic Predictions', 'Global Impact Map', '1 AI Visualization/mo']
    },
    {
      id: 'pro',
      name: 'Visionary',
      description: 'Full temporal resolution.',
      price: { USD: '29', EUR: '27', GBP: '23', JPY: '4200', CNY: '210' },
      period: t.perMonth,
      isPopular: true,
      features: ['Unlimited 2100+ Access', 'Full Neural Audio', 'Deep Data Grounding', 'Priority Rendering']
    },
    {
      id: 'enterprise',
      name: 'Oracle',
      description: 'API & Custom Modeling.',
      price: { USD: '99', EUR: '92', GBP: '78', JPY: '14500', CNY: '715' },
      period: t.perMonth,
      features: ['API Access', 'Custom Temporal Bracketing', 'Dedicated Support', 'Whitelabel Export']
    }
  ];

  const handleBuy = (planId: string) => {
    if (planId === 'basic') { onPlanSelected(planId); return; }
    window.open('https://www.paypal.com/checkout', '_blank');
    onPlanSelected(planId);
  };

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="flex justify-center flex-wrap gap-2 mb-10">
          {currencies.map(curr => (
            <button 
              key={curr.code}
              onClick={() => setCurrency(curr.code)} 
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${currency === curr.code ? 'bg-cyan-500 text-black border-cyan-500' : 'border-white/10 text-zinc-500 hover:text-white'}`}
            >
              {curr.symbol} {curr.code}
            </button>
          ))}
        </div>
        <h2 className="text-5xl font-orbitron font-bold dark:text-white text-zinc-900 mb-6">{t.plans}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`glass rounded-[3rem] p-12 border transition-all hover:scale-[1.02] ${plan.isPopular ? 'border-cyan-500 bg-cyan-500/[0.03] shadow-[0_0_50px_rgba(34,211,238,0.1)]' : 'border-white/10'}`}>
            <h3 className="text-2xl font-orbitron font-bold dark:text-white text-zinc-900 mb-4">{plan.name}</h3>
            <div className="text-5xl font-bold dark:text-white text-zinc-900 mb-8">
              {currencies.find(c => c.code === currency)?.symbol}{plan.price[currency]}
              <span className="text-sm text-zinc-500 font-normal"> {plan.period}</span>
            </div>
            <ul className="space-y-6 mb-12">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <svg className="w-5 h-5 text-cyan-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleBuy(plan.id)} className={`w-full py-5 rounded-2xl font-orbitron font-bold uppercase text-xs transition-all ${plan.isPopular ? 'bg-cyan-500 text-black' : 'bg-white/5 border border-white/10 text-white'}`}>
              {plan.price[currency] === '0' ? t.choosePlan : t.payNow}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
