
import React, { useState, useEffect, useRef } from 'react';
import { Language, PricingPlan, Currency } from '../types';
import { translations } from '../translations';

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
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan.id === 'basic') return;

    // Dynamically load PayPal SDK if not present
    const clientId = (window as any).PAYPAL_CLIENT_ID || 'test';
    const scriptId = 'paypal-js-sdk';
    
    const renderButtons = () => {
      if (paypalContainerRef.current && (window as any).paypal) {
        paypalContainerRef.current.innerHTML = '';
        try {
          (window as any).paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'white',
              shape: 'rect',
              label: 'pay',
              tagline: false,
              height: 48
            },
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  reference_id: plan.id,
                  description: `FutureForecast ${plan.name} Access`,
                  amount: {
                    currency_code: currency,
                    value: plan.price[currency]
                  }
                }]
              });
            },
            onApprove: async (data: any, actions: any) => {
              const order = await actions.order.capture();
              onSuccess(plan.id, order);
            },
            onError: (err: any) => {
              console.error('PayPal Button Error:', err);
              setError('Payment system initialization failed.');
            }
          }).render(paypalContainerRef.current).catch((e: any) => {
             // Catch potential unhandled exceptions during render (race conditions)
             console.warn('PayPal render suppressed:', e);
          });
        } catch (err) {
          console.error('PayPal critical failure:', err);
          setError('Could not initialize PayPal.');
        }
      }
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
      script.async = true;
      script.onload = () => setSdkLoaded(true);
      script.onerror = () => setError('SDK Load failed');
      document.head.appendChild(script);
    } else {
      // Script exists, check if global 'paypal' is ready
      if ((window as any).paypal) {
        setSdkLoaded(true);
      } else {
        script.addEventListener('load', () => setSdkLoaded(true));
      }
    }

    if (sdkLoaded) {
      renderButtons();
    }

    return () => {
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = '';
      }
    };
  }, [plan, currency, sdkLoaded]);

  if (plan.id === 'basic') {
    return (
      <button 
        onClick={() => onSuccess('basic', null)} 
        className="w-full py-6 font-orbitron font-black text-[12px] tracking-[0.4em] bg-white/5 border border-white/10 hover:border-white/20 transition-all uppercase"
      >
        INITIALIZE_GUEST_NODE
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-[9px] font-bold uppercase text-center tracking-widest">
          {error}
        </div>
      ) : (
        <div ref={paypalContainerRef} className="min-h-[50px] transition-opacity duration-500" />
      )}
      <p className="text-[9px] text-zinc-600 text-center font-bold tracking-widest uppercase">
        Secure Encrypted Transaction
      </p>
    </div>
  );
};

const PricingSection: React.FC<PricingSectionProps> = ({ lang, user, onPlanSelected, onPaymentSuccess }) => {
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
         <span className="text-white/40 font-orbitron font-black tracking-[1em] text-[11px] mb-8 block">SYSTEM_ACCESS_MODELS</span>
         <h2 className="text-8xl font-orbitron font-black tracking-tighter mb-8 uppercase">Choose access</h2>
         <div className="flex justify-center gap-2">
            {currencies.map(c => (
              <button 
                key={c.code} 
                onClick={() => setCurrency(c.code)}
                className={`px-4 py-2 text-[10px] font-black border transition-colors ${currency === c.code ? 'bg-white text-black border-white' : 'text-zinc-600 border-white/10 hover:border-white/20'}`}
              >
                {c.code}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`pricing-card glass-panel rounded-xl p-12 border flex flex-col relative overflow-hidden ${plan.isPopular ? 'border-white/30 bg-white/[0.02]' : 'border-white/5'} ${user?.is_pro && plan.id === 'pro' ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {plan.isPopular && (
              <div className="mb-8 inline-block">
                <span className="bg-white text-black px-4 py-1 text-[10px] font-black tracking-widest uppercase">MOST POWERFUL</span>
              </div>
            )}
            
            <h3 className={`text-3xl font-orbitron font-black mb-4 ${plan.isPopular ? 'text-white' : 'text-white/60'}`}>{plan.name}</h3>
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
                  <div className={`w-1.5 h-1.5 rounded-full ${plan.isPopular ? 'bg-white' : 'bg-white/10'} group-hover:scale-150 transition-transform`} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {user?.is_pro && plan.id === 'pro' ? (
                <div className="w-full py-6 text-center text-white font-orbitron font-bold text-xs uppercase tracking-widest border border-white/20 bg-white/10">
                  Currently Active
                </div>
              ) : (
                <PayPalButton 
                  plan={plan} 
                  currency={currency} 
                  onSuccess={(id, details) => {
                    if (id === 'basic') onPlanSelected(id);
                    else onPaymentSuccess?.(id, details);
                  }} 
                />
              )}
            </div>
            
            {plan.isPopular && <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[60px] pointer-events-none" />}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
