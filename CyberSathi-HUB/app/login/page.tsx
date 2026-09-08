'use client';

import { useState } from 'react';
import { Shield, Lock, User, AlertTriangle } from 'lucide-react';
import { createClient } from '@/src/utils/supabase';
import { useRouter } from 'next/navigation';

const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center bg-no-repeat opacity-40"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
  </div>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push('/'); // Redirect to Command Center on success
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      setError("Registration logged. Check your email for verification.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-white font-sans flex items-center justify-center p-6 relative">
      <CyberBackground />
      
      <div className="relative z-10 w-full max-w-md bg-black/80 border border-neutral-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-black border border-neutral-800 flex items-center justify-center shadow-lg mb-4">
            <Shield className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Sentinel Auth</h1>
          <p className="text-neutral-500 font-mono text-xs mt-2 uppercase tracking-widest">Restricted Access</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs text-red-500 font-mono mt-0.5">{error}</p>
          </div>
        )}

        <form className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Operator Email"
              className="w-full bg-black border border-neutral-700 focus:border-red-500 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none transition-all font-mono"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passphrase"
              className="w-full bg-black border border-neutral-700 focus:border-red-500 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none transition-all font-mono"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm tracking-widest transition-colors font-mono disabled:opacity-50"
            >
              LOGIN
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 font-bold py-3 rounded-xl text-sm tracking-widest transition-colors font-mono disabled:opacity-50"
            >
              REGISTER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}