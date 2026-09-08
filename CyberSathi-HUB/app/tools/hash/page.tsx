'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Terminal as TerminalIcon, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { analyzeHash } from '@/src/actions/hash';

// Background to maintain the Red Team aesthetic
const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center bg-no-repeat opacity-40"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
  </div>
);

export default function HashIdentifier() {
  const [hashInput, setHashInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runForensicScan = async () => {
    if (!hashInput.trim()) return;
    
    setIsScanning(true);
    setError(null);
    setReport(null);

    // Call the Server Action which securely hits your Python API
    const response = await analyzeHash(hashInput.trim());

    if (response.error) {
      setError(response.error);
    } else if (response.status === 'success') {
      setReport(response.forensic_report);
    } else {
      setError("Unknown error occurred during analysis.");
    }
    
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-red-500/30 overflow-y-auto relative p-6 md:p-12">
      <CyberBackground />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors font-mono text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Return to Command Center
          </Link>
          <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-neutral-800 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
            <span className="text-xs font-mono text-neutral-300 tracking-wider">Engine: Port 5002</span>
          </div>
        </div>

        {/* Tool Title */}
        <div className="mb-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-black border border-neutral-800 flex items-center justify-center shadow-lg">
            <Search className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 drop-shadow-md">Hash Identifier</h1>
            <p className="text-neutral-400 font-mono text-sm">Cryptographic Signature & Forensic Analysis Engine</p>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 p-8 rounded-3xl shadow-2xl h-fit">
            <label className="block text-xs font-mono text-red-500 mb-4 uppercase tracking-wider">Intercepted Hash String</label>
            <textarea 
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="w-full bg-black/80 border border-neutral-700 focus:border-red-500 rounded-xl px-5 py-4 text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono min-h-[120px] resize-none"
              placeholder="Paste MD5, SHA-1, SHA-256, bcrypt, etc..."
            />

            <button 
              onClick={runForensicScan}
              disabled={isScanning || hashInput.length === 0}
              className="w-full mt-6 bg-black hover:bg-red-600/20 border border-neutral-700 hover:border-red-500 text-white disabled:opacity-50 disabled:hover:border-neutral-700 disabled:hover:bg-black rounded-xl py-4 font-bold tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isScanning ? (
                <><Activity className="w-5 h-5 animate-spin text-red-500" /> ANALYZING SIGNATURE...</>
              ) : (
                <><Search className="w-5 h-5" /> INITIATE FORENSIC SCAN</>
              )}
            </button>
          </div>

          {/* Right Column: Output Terminal */}
          <div className="bg-black/90 border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[400px]">
            {/* Terminal Header */}
            <div className="bg-neutral-900/80 border-b border-neutral-800 px-6 py-3 flex items-center gap-4">
              <TerminalIcon className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase">Forensic Output Terminal</span>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm overflow-y-auto flex-1 relative">
              {!isScanning && !report && !error && (
                <div className="text-neutral-600 h-full flex items-center justify-center">
                  [ Awaiting Hash Input ]
                </div>
              )}

              {isScanning && (
                <div className="text-red-500 animate-pulse">
                  &gt; Establishing connection to Python backend (Port 5002)...<br/>
                  &gt; Transmitting payload...<br/>
                  &gt; Running heuristic length checks...<br/>
                  &gt; Matching known cryptographic signatures...
                </div>
              )}

              {error && (
                <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">CONNECTION FAILURE</p>
                    <p className="text-xs opacity-80">{error}</p>
                    <p className="text-xs mt-2 opacity-80">Did you remember to run `python app.py` in your Sentinel-Hash-Identifier folder?</p>
                  </div>
                </div>
              )}

              {report && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="text-emerald-500 mb-4">&gt; Analysis Complete. Results returned from engine.</div>
                  <pre className="text-neutral-300 whitespace-pre-wrap break-all">
                    {/* JSON.stringify makes whatever your Python script returned look like a cool terminal output */}
                    {JSON.stringify(report, null, 2)}
                  </pre>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}