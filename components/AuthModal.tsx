
import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { Language } from '../types';
import { INPUT_BASE, ORBITRON_LABEL_SM } from '../utils/styleConstants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert(lang === 'sk' ? 'Skontrolujte si email pre potvrdenie registrácie.' : 'Check your email for confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative glass w-full max-w-md rounded-[2.5rem] border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.15)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-10 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-orbitron font-bold text-white uppercase tracking-tighter">
              {isSignUp ? (lang === 'sk' ? 'Nová Identita' : 'New Identity') : (lang === 'sk' ? 'Prístup' : 'Access')}
            </h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className={`${ORBITRON_LABEL_SM} text-zinc-500 block mb-2`}>Email Hash</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_BASE}
                placeholder="neural@network.io"
              />
            </div>
            <div>
              <label className={`${ORBITRON_LABEL_SM} text-zinc-500 block mb-2`}>Access Key</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT_BASE}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-[10px] text-red-500 uppercase font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-5 bg-cyan-500 text-black font-orbitron font-bold rounded-xl shadow-lg hover:bg-white transition-all uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {loading ? (lang === 'sk' ? 'Overujem...' : 'Authorizing...') : (isSignUp ? (lang === 'sk' ? 'Registrovať' : 'Create Identity') : (lang === 'sk' ? 'Vstúpiť' : 'Enter Network'))}
            </button>
          </form>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-8 text-[10px] font-bold text-zinc-500 hover:text-cyan-400 uppercase tracking-widest text-center transition-colors"
          >
            {isSignUp 
              ? (lang === 'sk' ? 'Máte účet? Prihláste sa' : 'Already have an identity? Login') 
              : (lang === 'sk' ? 'Nemáte účet? Zaregistrujte sa' : 'No identity detected? Sign up')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
