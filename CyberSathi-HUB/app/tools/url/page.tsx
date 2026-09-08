'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft, Activity, AlertTriangle, ShieldAlert, ShieldCheck, Crosshair } from 'lucide-react';
import Link from 'next/link';
import { analyzeUrl } from '@/src/actions/url';

const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center bg-no-repeat opacity-40"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
  </div>
);

export default function UrlDetector() {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runUrlScan = async () => {
    if (!urlInput.trim()) return;
    
    setIsScanning(true);
    setError(null);
    setReport(null);

    const response = await analyzeUrl(urlInput.trim());

    if (response.error) {
      setError(response.error);
    } else {
      // Assuming your Python backend wraps the result in 'threat_assessment' or returns it directly
      setReport(response.threat_assessment || response);
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
            <span className="text-xs font-mono text-neutral-300 tracking-wider">Engine: Port 5001</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-black border border-neutral-800 flex items-center justify-center shadow-lg">
            <Globe className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 drop-shadow-md">URL Threat Detector</h1>
            <p className="text-neutral-400 font-mono text-sm">Heuristic Phishing & Malware Drop Zone Analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 p-8 rounded-3xl shadow-2xl h-fit">
            <label className="block text-xs font-mono text-red-500 mb-4 uppercase tracking-wider">Target Domain / URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Crosshair className="h-5 w-5 text-neutral-500" />
              </div>
              <input 
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-black/80 border border-neutral-700 focus:border-red-500 rounded-xl pl-12 pr-5 py-4 text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono"
                placeholder="https://suspicious-link.com/login..."
              />
            </div>

            <button 
              onClick={runUrlScan}
              disabled={isScanning || urlInput.length === 0}
              className="w-full mt-6 bg-black hover:bg-red-600/20 border border-neutral-700 hover:border-red-500 text-white disabled:opacity-50 disabled:hover:border-neutral-700 disabled:hover:bg-black rounded-xl py-4 font-bold tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isScanning ? (
                <><Activity className="w-5 h-5 animate-spin text-red-500" /> QUERYING HEURISTIC ENGINE...</>
              ) : (
                <><Globe className="w-5 h-5" /> INITIATE LINK SCAN</>
              )}
            </button>
          </div>

          {/* Output Terminal */}
          <div className="bg-black/90 border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[350px]">
            <div className="bg-neutral-900/80 border-b border-neutral-800 px-6 py-3 flex items-center gap-4">
              <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase">Target Telemetry</span>
            </div>
            
            <div className="p-6 font-mono text-sm overflow-y-auto flex-1 relative flex flex-col justify-center">
              {!isScanning && !report && !error && (
                <div className="text-neutral-600 text-center">
                  [ Enter URL to begin threat assessment ]
                </div>
              )}

              {isScanning && (
                <div className="text-red-500 animate-pulse space-y-2">
                  <p>&gt; Establishing connection to Port 5001...</p>
                  <p>&gt; Executing WHOIS domain lookups...</p>
                  <p>&gt; Checking against known phishing databases...</p>
                  <p>&gt; Analyzing URL entropy and obfuscation patterns...</p>
                </div>
              )}

              {error && (
                <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">CONNECTION FAILURE</p>
                    <p className="text-xs opacity-80">{error}</p>
                    <p className="text-xs mt-2 opacity-80">Check that your package.json boot script launched Port 5001 properly.</p>
                  </div>
                </div>
              )}

              {report && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-4">
                  {report.severity === 'HIGH' ? (
                    <ShieldAlert className="w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                  ) : report.severity === 'MEDIUM' ? (
                    <AlertTriangle className="w-16 h-16 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                  ) : (
                    <ShieldCheck className="w-16 h-16 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  )}
                  
                  <div>
                    <h2 className={`text-2xl font-bold tracking-widest uppercase ${
                      report.severity === 'HIGH' ? 'text-red-500' : report.severity === 'MEDIUM' ? 'text-orange-500' : 'text-emerald-500'
                    }`}>
                      {report.severity} RISK
                    </h2>
                    <p className="text-neutral-300 mt-2 text-lg">{report.verdict || "Analysis Complete"}</p>
                  </div>

                  <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 mt-4 text-left">
                    <pre className="text-xs text-neutral-400 whitespace-pre-wrap break-all">
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