
import React from 'react';
import { Language, PricingPlan } from '../types';
import { translations } from '../translations';

interface PricingSectionProps {
  lang: Language;
  user: any;
  onPlanSelected: (planId: string) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ lang, user, onPlanSelected }) => {
  const t = translations[lang];

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: lang === 'sk' ? 'Prieskumník' : 'Explorer',
      description: lang === 'sk' ? 'Základné trendy zadarmo.' : 'Basic trends for free.',
      price: '0',
      period: t.perMonth,
      features: ['Základné predpovede', 'Mapa dopadu']
    },
    {
      id: 'pro',
      name: lang === 'sk' ? 'Analytik' : 'Analyst',
      description: lang === 'sk' ? 'Hĺbkové vedecké dáta.' : 'Deep scientific data.',
      price: '29',
      period: t.perMonth,
      isPopular: true,
      features: ['Neobmedzené simulácie', 'Export dát', 'Vedecké podklady']
    }
  ];

  const handleBuy = (planId: string) => {
    if (!user) {
        alert(t.loginRequired);
        return;
    }
    
    if (planId === 'basic') {
        onPlanSelected(planId);
        return;
    }

    window.open('https://www.paypal.com/ncp/payment/TVOJ_KOD_TLACIDLA', '_blank');
    alert("Po dokončení platby sa váš účet zmení na PRO (simulácia).");
    onPlanSelected(planId);
  };

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-orbitron font-bold dark:text-white text-zinc-900 mb-4">{t.plans}</h2>
        <p className="text-zinc-500 dark:text-zinc-400">{lang === 'sk' ? 'Vyberte si úroveň prístupu k budúcnosti.' : 'Choose your level of access to the future.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`glass rounded-3xl p-10 border ${plan.isPopular ? 'border-cyan-500 shadow-2xl' : 'border-zinc-200 dark:border-white/10'}`}>
            <h3 className="text-2xl font-orbitron font-bold dark:text-white text-zinc-900 mb-2">{plan.name}</h3>
            <div className="text-4xl font-bold dark:text-white text-zinc-900 mb-6">€{plan.price}<span className="text-sm text-zinc-500">/mesiac</span></div>
            <ul className="space-y-4 mb-10">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleBuy(plan.id)}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${plan.isPopular ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-zinc-100 dark:bg-white/5 dark:text-white text-zinc-900 border border-zinc-200 dark:border-white/10'}`}
            >
              {plan.price === '0' ? t.choosePlan : t.payNow}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
