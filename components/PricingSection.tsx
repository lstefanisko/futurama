import React, { useState, useEffect, useRef } from 'react';
import { Language, PricingPlan, Currency } from '../types';
import { translations } from '../translations';
import { getPlanSalesPitch } from '../services/geminiService';

interface PricingSectionProps {
  lang: Language;
  user: any;
  onPlanSelected: (planId: string) => void;
  onPaymentSuccess?: (planId: string, orderDetails: any) => void;
}

const PayPalButton: React.FC<{ 
  plan: PricingPlan; 
  currency: Currency; 
  onSuccess: (planId: string, details: any) => void;
}> = ({ plan, currency, onSuccess }) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (plan.id === 'basic') return;
    let isMounted = true;
    const clientId = (window as any).PAYPAL_CLIENT_ID || 'test';
    const scriptId = `paypal-sdk-${currency}`;

    const initPayPal = () => {
      const watchdog = setTimeout(() => {
        if (!isMounted) return;
        const paypal = (window as any).paypal;
        if (!paypal || !paypal.Buttons) {
          setShowFallback(true);
          setIsInitializing(false);
          return;
        }
        try {
          if (paypalContainerRef.current) {
            paypalContainerRef.current.innerHTML = '';
            paypal.Buttons({
              style: { layout: 'vertical', color: 'white', shape: 'rect', label: 'pay', tagline: false, height: 48 },
              createOrder: (data: any, actions: any) => actions.order.create({
                purchase_units: [{ reference_id: plan.id, description: `FutureForecast ${plan.name}`, amount: { currency_code: currency, value: plan.price[currency] } }]
              }),
              onApprove: async (data: any, actions: any) => {
                const order = await actions.order.capture();
                onSuccess(plan.id, order);
              },
              onError: () => setShowFallback(true)
            }).render(paypalContainerRef.current);
          }
        } catch (e) { setShowFallback(true); } finally { if (isMounted) setIsInitializing(false); }
      }, 600);
      return () => clearTimeout(watchdog);
    };

    const loadScript = () => {
      if ((window as any).paypal) { initPayPal(); return; }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons&disable-funding=venmo,credit`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => isMounted && initPayPal();
      script.onerror = () => { setShowFallback(true); setIsInitializing(false); };
      document.head.appendChild(script);
    };
    loadScript();
    return () => { isMounted = false; };
  }, [plan, currency]);

  if (plan.id === 'basic') return <button onClick={() => onSuccess('basic', null)} className="w-full py-6 bg-white/5 border border-white/10 hover:border-accent hover:text-accent transition-all font-orbitron font-black text-[11px] tracking-[0.4em] uppercase shadow-inner">[ FREE_ACCESS ]</button>;
  if (showFallback) return <button onClick={() => onSuccess(plan.id, { id: 'SIM_' + Date.now() })} className="w-full py-4 border border-accent/40 bg-accent/10 text-accent font-orbitron font-black text-[10px] tracking-widest uppercase hover:bg-accent hover:text-black transition-all shadow-[0_0_20px_rgba(0,243,255,0.15)]">[ SIMULATE_CONNECTION ]</button>;

  return (
    <div className="relative min-h-[48px]">
      {isInitializing && <div className="w-full h-12 bg-white/5 animate-pulse rounded border border-white/5 flex items-center justify-center"><span className="text-[8px] font-mono text-zinc-700 animate-pulse tracking-widest uppercase">TUNING_GATEWAY...</span></div>}
      <div ref={paypalContainerRef} className="overflow-hidden" />
    </div>
  );
};

const PricingSection: React.FC<PricingSectionProps> = ({ lang, user, onPlanSelected, onPaymentSuccess }) => {
  const t = translations[lang];
  const [currency, setCurrency] = useState<Currency>(lang === 'sk' ? 'EUR' : 'USD');
  const [pitches, setPitches] = useState<Record<string, string>>({});

  const currencies: { code: Currency; symbol: string }[] = [
    { code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' }, { code: 'JPY', symbol: '¥' }, { code: 'CNY', symbol: '¥' }
  ];

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'GUEST',
      description: t.planDetails.guest.desc,
      price: { USD: '0', EUR: '0', GBP: '0', JPY: '0', CNY: '0' },
      period: '/free',
      features: ['2045 Max Timeline', 'Public Text Archive', 'Standard Fidelity']
    },
    {
      id: 'pro',
      name: 'VISIONARY',
      description: t.planDetails.pro.desc,
      price: { USD: '29', EUR: '27', GBP: '23', JPY: '4200', CNY: '210' },
      period: t.perMonth,
      isPopular: true,
      features: ['2100 Max Timeline', 'AI Visual Synthesis', 'Neural TTS Audio', 'Deep Analysis Module']
    },
    {
      id: 'enterprise',
      name: 'ORACLE',
      description: t.planDetails.oracle.desc,
      price: { USD: '99', EUR: '95', GBP: '80', JPY: '14500', CNY: '715' },
      period: t.perMonth,
      features: ['Priority Pro-Model', 'API Access Nodes', 'Model Fine-tuning', 'Unlimited Synthesis']
    }
  ];

  useEffect(() => {
    plans.forEach(async (p) => {
      const pitch = await getPlanSalesPitch(p.name, lang);
      setPitches(prev => ({ ...prev, [p.id]: pitch }));
    });
  }, [lang]);

  return (
    <section className="py-20 relative px-6 lg:px-12">
      <div className="absolute inset-0 pointer-events-none bg-scan opacity-[0.02]" />

      <div className="max-w-7xl mx-auto mb-20">
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div>
              <span className="text-accent font-orbitron font-black tracking-[1em] text-[10px] mb-4 block uppercase text-neon">NODE_SUBSCRIPTION_LAYER</span>
              <h2 className="text-6xl md:text-8xl font-inter font-black tracking-tighter uppercase text-white leading-none">ACCESS TIERS</h2>
            </div>
            <div className="flex flex-wrap gap-2 bg-white/5 p-1 rounded-sm border border-white/10">
               {currencies.map(c => (
                 <button 
                  key={c.code} 
                  onClick={() => setCurrency(c.code)} 
                  className={`px-6 py-2 text-[10px] font-black transition-all ${currency === c.code ? 'bg-accent text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-zinc-500 hover:text-white'}`}
                 >
                   {c.code}
                 </button>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto relative z-10">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`glossy-panel p-10 flex flex-col relative group transition-all duration-500 hover:border-accent/50 ${plan.isPopular ? 'border-accent/40' : ''}`}
          >
            {plan.isPopular && <div className="absolute -top-4 left-10"><span className="bg-accent text-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.4)]">RECOMMENDED_NODE</span></div>}
            
            <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
              <div>
                <h3 className="text-3xl font-orbitron font-black text-white uppercase tracking-tighter mb-2">{plan.name}</h3>
                <p className="text-accent text-[10px] font-mono italic uppercase tracking-tighter min-h-[14px]">
                  {pitches[plan.id] || "SYNCHRONIZING..."}
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-orbitron font-black text-white">{currencies.find(c => c.code === currency)?.symbol}{plan.price[currency]}</span>
                <span className="text-zinc-500 text-[10px] block font-black uppercase tracking-tighter opacity-60">{plan.period}</span>
              </div>
            </div>

            <div className="space-y-8 mb-12">
               <div>
                  <h4 className="text-[10px] font-orbitron font-black text-white/40 tracking-[0.4em] uppercase mb-3">01_PROFILE</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed font-light">{plan.description}</p>
               </div>
               
               <div>
                  <h4 className="text-[10px] font-orbitron font-black text-white/40 tracking-[0.4em] uppercase mb-3">02_USAGE_MANUAL</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed italic border-l border-accent/30 pl-4">
                    {t.planDetails[plan.id as keyof typeof t.planDetails].usage}
                  </p>
               </div>
            </div>

            <ul className="space-y-4 mb-12 flex-grow border-t border-white/5 pt-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-100 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1 h-1 bg-accent shadow-[0_0_5px_#00f3ff]" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
               <PayPalButton plan={plan} currency={currency} onSuccess={(id, details) => { if (id === 'basic') onPlanSelected(id); else onPaymentSuccess?.(id, details); }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;