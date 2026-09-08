'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, ArrowLeft, Terminal, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { analyzePassword } from '@/src/actions/password';

const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center bg-no-repeat opacity-40"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
  </div>
);

export default function PasswordAnalyzer() {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDeepScan = async () => {
    if (!passwordInput) return;
    
    setIsScanning(true);
    setError(null);
    setReport(null);

    const response = await analyzePassword(passwordInput);

    if (response.error) {
      setError(response.error);
    } else {
      // Catching the payload from your Python engine
      setReport(response.report || response);
    }
    
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-red-500/30 overflow-y-auto relative p-6 md:p-12">
      <CyberBackground />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors font-mono text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Return to Command Center
          </Link>
          <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-neutral-800 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
            <span className="text-xs font-mono text-neutral-300 tracking-wider">Engine: Port 5000</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-black border border-neutral-800 flex items-center justify-center shadow-lg">
            <Key className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 drop-shadow-md">Password Analyzer</h1>
            <p className="text-neutral-400 font-mono text-sm">Cryptographic Entropy & Breach Verification Engine</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 p-8 rounded-3xl shadow-2xl h-fit">
            <label className="block text-xs font-mono text-red-500 mb-4 uppercase tracking-wider">Target Payload (String)</label>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-black/80 border border-neutral-700 focus:border-red-500 rounded-xl px-5 py-4 text-xl text-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono pr-12"
                placeholder="Enter credential to analyze..."
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>

            <button 
              onClick={runDeepScan}
              disabled={isScanning || passwordInput.length === 0}
              className="w-full mt-8 bg-black hover:bg-red-600/20 border border-neutral-700 hover:border-red-500 text-white disabled:opacity-50 disabled:hover:border-neutral-700 disabled:hover:bg-black rounded-xl py-4 font-bold tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isScanning ? (
                <><Activity className="w-5 h-5 animate-spin text-red-500" /> QUERYING BACKEND ENGINE...</>
              ) : (
                <><Terminal className="w-5 h-5" /> INITIATE DEEP SCAN</>
              )}
            </button>
          </div>

          {/* Output Terminal */}
          <div className="bg-black/90 border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[400px]">
            <div className="bg-neutral-900/80 border-b border-neutral-800 px-6 py-3 flex items-center gap-4">
              <Terminal className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase">Engine Output</span>
            </div>
            
            <div className="p-6 font-mono text-sm overflow-y-auto flex-1 relative flex flex-col">
              {!isScanning && !report && !error && (
                <div className="text-neutral-600 h-full flex items-center justify-center text-center m-auto">
                  [ Awaiting string input for cryptographic breakdown ]
                </div>
              )}

              {isScanning && (
                <div className="text-red-500 animate-pulse space-y-2">
                  <p>&gt; Establishing connection to Port 5000...</p>
                  <p>&gt; Calculating Shannon entropy...</p>
                  <p>&gt; Cross-referencing known breach databases...</p>
                  <p>&gt; Evaluating brute-force resilience...</p>
                </div>
              )}

              {error && (
                <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">CONNECTION FAILURE</p>
                    <p className="text-xs opacity-80">{error}</p>
                    <p className="text-xs mt-2 opacity-80">Make sure your Python app.py is running on Port 5000.</p>
                  </div>
                </div>
              )}

              {report && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                  <div className="text-emerald-500 mb-4">&gt; Analysis Complete. Raw data returned from engine:</div>
                  <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
                    <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all">
                      {JSON.stringify(report, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}