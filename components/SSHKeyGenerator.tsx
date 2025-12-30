
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface SSHKeyGeneratorProps {
  lang: Language;
  userId?: string;
}

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

const SSHKeyGenerator: React.FC<SSHKeyGeneratorProps> = ({ lang, userId }) => {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);
  
  const t = translations[lang];

  const generateSSHKey = async () => {
    setIsGenerating(true);
    try {
      // Generate RSA key pair using Web Crypto API
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      // Export public key
      const exportedPublicKey = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      
      // Export private key
      const exportedPrivateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );

      // Convert to PEM format
      const publicKeyPEM = arrayBufferToPEM(exportedPublicKey, 'PUBLIC KEY');
      const privateKeyPEM = arrayBufferToPEM(exportedPrivateKey, 'PRIVATE KEY');

      // Convert to SSH format
      const publicKeySSH = pemToSSH(publicKeyPEM, userId || 'user');

      setKeyPair({
        publicKey: publicKeySSH,
        privateKey: privateKeyPEM,
      });
    } catch (error) {
      console.error('Error generating SSH key:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const arrayBufferToPEM = (buffer: ArrayBuffer, label: string): string => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
    return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
  };

  const pemToSSH = (pem: string, comment: string): string => {
    // For simplicity, we'll create a basic SSH format
    const base64Key = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    return `ssh-rsa ${base64Key} ${comment}@futureforecast`;
  };

  const copyToClipboard = async (text: string, isPublic: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isPublic) {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      } else {
        setCopiedPrivate(true);
        setTimeout(() => setCopiedPrivate(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadKey = (key: string, filename: string) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-orbitron font-black tracking-tighter text-white mb-2">
            {t.sshKeys}
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            Generate SSH keys for secure API access and authentication
          </p>
        </div>
        <button
          onClick={generateSSHKey}
          disabled={isGenerating}
          className="px-8 py-4 bg-cyan-500 text-black font-orbitron font-black text-[11px] rounded-xl hover:bg-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 uppercase tracking-[0.3em]"
        >
          {isGenerating ? t.generating : t.generateKey}
        </button>
      </div>

      {keyPair && (
        <div className="space-y-6 animate-in fade-in duration-700">
          {/* Warning Banner */}
          <div className="glass-panel p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-yellow-500 text-sm font-mono">
                {t.keyWarning}
              </p>
            </div>
          </div>

          {/* Public Key */}
          <div className="glass-panel p-8 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-orbitron font-black text-zinc-500 uppercase tracking-[0.5em]">
                {t.publicKey}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(keyPair.publicKey, true)}
                  className="px-4 py-2 text-[9px] font-orbitron border border-cyan-500/20 text-cyan-500 rounded hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-wider"
                >
                  {copiedPublic ? t.keyCopied : t.copyKey}
                </button>
                <button
                  onClick={() => downloadKey(keyPair.publicKey, 'id_rsa.pub')}
                  className="px-4 py-2 text-[9px] font-orbitron border border-cyan-500/20 text-cyan-500 rounded hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-wider"
                >
                  {t.downloadKey}
                </button>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-lg border border-white/5 overflow-x-auto">
              <code className="text-cyan-400 text-xs font-mono break-all whitespace-pre-wrap">
                {keyPair.publicKey}
              </code>
            </div>
          </div>

          {/* Private Key */}
          <div className="glass-panel p-8 rounded-xl border border-red-500/20 bg-red-500/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-orbitron font-black text-red-500 uppercase tracking-[0.5em]">
                {t.privateKey}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(keyPair.privateKey, false)}
                  className="px-4 py-2 text-[9px] font-orbitron border border-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all uppercase tracking-wider"
                >
                  {copiedPrivate ? t.keyCopied : t.copyKey}
                </button>
                <button
                  onClick={() => downloadKey(keyPair.privateKey, 'id_rsa')}
                  className="px-4 py-2 text-[9px] font-orbitron border border-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all uppercase tracking-wider"
                >
                  {t.downloadKey}
                </button>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-lg border border-red-500/10 overflow-x-auto max-h-[400px] overflow-y-auto">
              <code className="text-red-400 text-xs font-mono break-all whitespace-pre-wrap">
                {keyPair.privateKey}
              </code>
            </div>
          </div>
        </div>
      )}

      {!keyPair && !isGenerating && (
        <div className="glass-panel p-24 rounded-xl border border-white/5 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-zinc-600 font-orbitron uppercase tracking-[1em] text-[12px]">
            {lang === 'sk' ? 'Žiadne kľúče' : 'No keys generated'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SSHKeyGenerator;
