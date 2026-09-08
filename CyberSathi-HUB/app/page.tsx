'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Globe, Search, Activity, Mail, Key, Server, Terminal, User, ChevronRight, Fingerprint, Radio, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { fetchThreatIntel } from '@/src/actions/intel';

// --- SHARED BACKGROUND COMPONENT ---
// This keeps the image persistent across all screens
const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    {/* UPDATED: Now referencing the .png file */}
    <div className="absolute inset-0 bg-[url('/cyber-bg.png')] bg-cover bg-center bg-no-repeat opacity-40"></div>
    {/* Dark vignette overlay to keep text readable */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
    {/* The subtle matrix grid */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
  </div>
);

// --- 1. LOGIN SCREEN COMPONENT ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 relative overflow-hidden">
      <CyberBackground />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 relative z-10 shadow-[0_0_50px_rgba(220,38,38,0.1)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase drop-shadow-md">Terminal Access</h1>
          <p className="text-neutral-400 text-sm mt-2 font-mono">Authenticate to proceed</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-red-500 mb-2 uppercase tracking-wider">Operator ID</label>
            <input type="text" required defaultValue="admin" className="w-full bg-black/80 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono" placeholder="Enter ID" />
          </div>
          <div>
            <label className="block text-xs font-mono text-red-500 mb-2 uppercase tracking-wider">Access Key</label>
            <input type="password" required defaultValue="password" className="w-full bg-black/80 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Fingerprint className="w-5 h-5" /> Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- 2. BOOT SEQUENCE COMPONENT ---
const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const bootLogs = [
    "INIT: Cybersathi Hub Core v2.0.4",
    "SECURE: Handshake verified. Establishing encrypted tunnel...",
    "SYS: Decrypting Operator profile...",
    "LOAD: Mounting Threat Intelligence Feed...",
    "LOAD: Initializing Hash Identifier ML models...",
    "LOAD: Booting URL Threat heuristics...",
    "READY: All microservices nominal. Access granted."
  ];

  useEffect(() => {
    let delay = 0;
    bootLogs.forEach((log, index) => {
      delay += Math.random() * 300 + 150; 
      setTimeout(() => {
        setLines(prev => [...prev, log]);
        if (index === bootLogs.length - 1) setTimeout(onComplete, 1000); 
      }, delay);
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }} transition={{ duration: 0.6 }} className="fixed inset-0 z-40 flex flex-col justify-center p-10 font-mono text-neutral-300">
      <CyberBackground />
      <div className="max-w-3xl w-full mx-auto relative z-10">
        <Shield className="w-16 h-16 mb-8 text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
        {lines.map((line, i) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-2 text-sm tracking-widest bg-black/40 inline-block px-2 rounded">
            <span className="text-red-500 mr-4">[{new Date().toISOString().substring(11, 23)}]</span>{line}
          </motion.div>
        ))}
        <div className="w-4 h-5 bg-red-500 animate-ping mt-4"></div>
      </div>
    </motion.div>
  );
};

// --- 3. ACTIVE SESSION TIMER COMPONENT ---
const SessionTimer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return <p className="text-2xl font-bold text-white font-mono tracking-widest">{formatTime(seconds)}</p>;
};

// --- 4. THREAT INTELLIGENCE FEED COMPONENT ---
const ThreatIntelFeed = () => {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntel = async () => {
      try {
        const data = await fetchThreatIntel();
        if (data && data.length > 0) {
          setNewsItems(data);
        } else {
          throw new Error("No data returned");
        }
      } catch {
        console.warn("Intel Feed Offline: Displaying cached intelligence.");
        setNewsItems([
          { source: "SYS-WARN", title: "Live feed unreachable. Displaying cached threat intelligence.", url: "#", time: "Just now" },
          { source: "CISA Alert", title: "Ransomware Actors Exploit Unpatched Remote Monitoring & Management", url: "https://www.cisa.gov", time: "Cached" },
          { source: "Hacker News", title: "Interlock Ransomware Exploits Cisco FMC Zero-Day CVE-2026-20131", url: "https://thehackernews.com", time: "Cached" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadIntel();
    const interval = setInterval(loadIntel, 300000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-12 relative z-10">
      <div className="flex items-center gap-3 mb-6 px-2">
        <Radio className="w-5 h-5 text-red-500 animate-pulse" />
        <h3 className="text-sm font-bold tracking-widest text-neutral-300 uppercase drop-shadow-md">Live Global Threat Intelligence</h3>
        <div className="h-px bg-neutral-800/80 flex-1 ml-4"></div>
      </div>
      
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/50 rounded-xl p-5 flex items-center gap-4 animate-pulse h-20">
              <div className="w-24 h-6 bg-red-500/10 rounded-md"></div>
              <div className="flex-1 h-4 bg-neutral-800/50 rounded-md"></div>
            </div>
          ))
        ) : (
          newsItems.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-xl p-5 hover:bg-neutral-800/90 hover:border-red-500/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 shrink-0 w-28 text-center">
                  {item.source}
                </span>
                <p className="text-sm font-medium text-neutral-200 leading-snug group-hover:text-white transition-colors">{item.title}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-neutral-400 font-mono w-16 text-right">{item.time}</span>
                <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

// --- 5. TOOL CARD LAUNCHER COMPONENT ---
const ToolLauncherCard = ({ name, icon, description, path }: { name: string, icon: React.ReactNode, description: string, path: string }) => (
  <section className="relative overflow-hidden bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between min-h-[260px] group hover:border-red-500/40 hover:shadow-[0_0_25px_rgba(220,38,38,0.15)] transition-all duration-300 shadow-lg">
    {/* Animated top indicator line */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-[2px] bg-red-500 transition-all duration-300 ease-in-out"></div>
    
    {/* Subtle radial background glow */}
    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>
    
    {/* Status indicator tag */}
    <span className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-neutral-500 group-hover:text-red-500 group-hover:border-red-500/30 transition-colors bg-black/60 px-2 py-0.5 rounded border border-neutral-800 uppercase z-10">
      READY
    </span>

    <div className="flex-1 flex flex-col relative z-10">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-black/80 rounded-xl border border-neutral-800 text-white group-hover:text-red-500 group-hover:border-red-500/30 transition-colors shrink-0 shadow-inner [&_svg]:w-6 [&_svg]:h-6">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-white drop-shadow-sm group-hover:text-red-500 transition-colors">{name}</h2>
      </div>
      <p className="text-xs text-neutral-300 leading-relaxed line-clamp-4 flex-1">{description}</p>
    </div>
    
    <Link href={path} className="w-full mt-6 relative z-10">
      <button className="w-full py-2.5 bg-black/80 hover:bg-red-600/20 border border-neutral-700 hover:border-red-500 text-white hover:text-red-500 rounded-xl font-semibold tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]">
        INITIATE SCAN <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </Link>
  </section>
);

// --- MAIN DASHBOARD STATE MANAGER ---
export default function Home() {
  const [appState, setAppState] = useState<'login' | 'booting' | 'dashboard'>('login');

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('operator_authenticated');
    if (sessionAuth === 'true') {
      setAppState('dashboard');
    }
  }, []);

  const tools = [
    { name: 'Password Analyzer', path: '/tools/password', icon: <Key className="w-8 h-8" />, desc: 'Evaluates cryptographic strength and entropy against brute-force attacks and known breach databases. Essential first line of defense against credential stuffing.' },
    { name: 'URL Threat Detector', path: '/tools/url', icon: <Globe className="w-8 h-8" />, desc: 'Analyzes suspicious web links using heuristic engines to identify zero-day phishing sites, malware drop zones, and malicious redirects. Prevents network compromise.' },
    { name: 'Hash Identifier', path: '/tools/hash', icon: <Search className="w-8 h-8" />, desc: 'Cryptographically analyzes given hash strings to determine their underlying hashing algorithm (MD5, SHA-256, bcrypt). Essential for reverse-engineering and malware analysis.' },
    { name: 'IP Tracker', path: '/tools/ip', icon: <Activity className="w-8 h-8" />, desc: 'Geolocates and assesses the threat reputation of target IP addresses by cross-referencing global botnet registries to pinpoint potential DDoS origin points.' },
    { name: 'Mal-Email Detector', path: '/tools/email', icon: <Mail className="w-8 h-8" />, desc: 'Scrutinizes email headers, routing metadata, and message payloads to detect spoofed senders and phishing attempts. Crucial for preventing ransomware infections.' },
    { name: 'Port Scanner', path: '/tools/port', icon: <Server className="w-8 h-8" />, desc: 'Probes target servers or network nodes to identify open communication ports and running services, revealing accidental exposures and unauthorized backdoors.' },
    { name: 'SSL Inspector', path: '/tools/ssl', icon: <Lock className="w-8 h-8" />, desc: 'Interrogates domain SSL/TLS certificates to verify cryptographic validity and trust chains. Prevents man-in-the-middle attacks by ensuring data remains unreadable in transit.' },
    { name: 'Malware Engine', path: '/tools/malware', icon: <Terminal className="w-8 h-8" />, desc: 'Performs deep static analysis and signature matching on suspicious files without execution, quarantining known malware strains and obfuscated malicious code.' },
  ];

  return (
    <>
      <AnimatePresence>
        {appState === 'login' && <LoginScreen onLogin={() => setAppState('booting')} />}
        {appState === 'booting' && <BootSequence onComplete={() => {
          sessionStorage.setItem('operator_authenticated', 'true');
          setAppState('dashboard');
        }} />}
      </AnimatePresence>

      {appState === 'dashboard' && (
        <div className="min-h-screen text-white font-sans selection:bg-red-500/30 overflow-y-auto pb-20 relative">
          <CyberBackground />
          
          <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
            {/* Header */}
            <header className="mb-12 bg-neutral-950/70 backdrop-blur-xl border border-neutral-800/80 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-6 z-10">
                <div className="w-20 h-20 rounded-full bg-black/80 border border-red-500/50 p-1 flex items-center justify-center relative shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                   <User className="w-10 h-10 text-neutral-300" />
                   <div className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-black rounded-full shadow-sm"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1 drop-shadow-md">Welcome, Operator</h1>
                  <p className="text-red-500 font-mono text-sm drop-shadow-sm">CYBERSATHI HUB CORE</p>
                </div>
              </div>

              <div className="flex gap-4 z-10">
                <div className="text-center px-6 py-3 bg-black/60 rounded-xl border border-neutral-800 backdrop-blur-sm shadow-inner">
                  <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wider">Session Time</p>
                  <SessionTimer />
                </div>
                <div className="text-center px-6 py-3 bg-black/60 rounded-xl border border-neutral-800 backdrop-blur-sm shadow-inner">
                  <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wider">Threats Blocked</p>
                  <p className="text-2xl font-bold text-white font-mono tracking-widest drop-shadow-sm">0</p>
                </div>
              </div>
            </header>

            {/* Tool Stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 relative z-10">
              {tools.map((tool) => (
                <ToolLauncherCard key={tool.name} name={tool.name} icon={tool.icon} description={tool.desc} path={tool.path} />
              ))}
            </div>

            {/* Threat Intel News Feed */}
            <ThreatIntelFeed />
          </main>
        </div>
      )}
    </>
  );
}
