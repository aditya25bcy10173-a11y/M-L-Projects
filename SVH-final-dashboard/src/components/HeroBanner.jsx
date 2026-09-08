import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CloudSun } from 'lucide-react';

const HeroBanner = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    return { dateStr, weekday };
  };

  const { dateStr, weekday } = formatDate(time);

  return (
    <div style={styles.banner}>
      {/* Left Info Column */}
      <div style={styles.leftCol}>
        <h1 style={styles.title}>Darshan Setu Crowd Management Platform</h1>
        <p style={styles.subtitle}>Coordinate • Monitor • Manage Public Crowds Efficiently</p>
        
        {/* Pills Grid */}
        <div style={styles.pillsGrid}>
          {/* Calendar Pill */}
          <div style={styles.pill}>
            <div style={{...styles.iconContainer, backgroundColor: '#eff6ff'}}>
              <Calendar size={15} color="#2563eb" />
            </div>
            <div style={styles.pillText}>
              <div style={styles.pillValue}>{dateStr}</div>
              <div style={styles.pillLabel}>{weekday}</div>
            </div>
          </div>

          {/* Live Time Pill */}
          <div style={styles.pill}>
            <div style={{...styles.iconContainer, backgroundColor: '#fef2f2'}}>
              <Clock size={15} color="#ef4444" />
            </div>
            <div style={styles.pillText}>
              <div style={styles.pillValue}>{formatTime(time)}</div>
              <div style={styles.pillLabel}>Live Time</div>
            </div>
          </div>

          {/* Current Event Pill */}
          <div style={styles.pill}>
            <div style={{...styles.iconContainer, backgroundColor: '#f0fdfa'}}>
              <MapPin size={15} color="#0d9488" />
            </div>
            <div style={styles.pillText}>
              <div style={styles.pillValue}>Tirumala Temple</div>
              <div style={styles.pillLabel}>Current Event</div>
            </div>
          </div>

          {/* Weather Pill */}
          <div style={styles.pill}>
            <div style={{...styles.iconContainer, backgroundColor: '#fffbeb'}}>
              <CloudSun size={15} color="#d97706" />
            </div>
            <div style={styles.pillText}>
              <div style={styles.pillValue}>28°C</div>
              <div style={styles.pillLabel}>Partly Cloudy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Graphic Column: Detailed Temple Silhouette SVG */}
      <div style={styles.rightCol}>
        <svg width="280" height="150" viewBox="0 0 300 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.templeSvg}>
          {/* Background hills */}
          <path d="M10 150 C 60 110, 120 120, 180 150 M140 150 C 200 90, 260 100, 300 150" stroke="#dbeafe" strokeWidth="2" opacity="0.6" strokeDasharray="4 4" />
          
          {/* Main Gopuram Structure (Central Tower) */}
          {/* Base */}
          <rect x="110" y="110" width="80" height="40" rx="3" fill="#bfdbfe" opacity="0.4" />
          <rect x="115" y="115" width="70" height="35" rx="2" fill="#93c5fd" opacity="0.3" />
          
          {/* Gopuram Level 1 */}
          <path d="M115 110 L125 75 L175 75 L185 110 Z" fill="#bfdbfe" opacity="0.5" />
          {/* Gopuram Level 2 */}
          <path d="M123 75 L131 48 L169 48 L177 75 Z" fill="#93c5fd" opacity="0.6" />
          {/* Gopuram Level 3 */}
          <path d="M129 48 L136 28 L164 28 L171 48 Z" fill="#60a5fa" opacity="0.4" />
          {/* Gopuram Top Dome (Kalasam) */}
          <path d="M136 28 C136 15, 164 15, 164 28 Z" fill="#2563eb" opacity="0.5" />
          {/* Kalasams (Spirals at the top) */}
          <line x1="144" y1="20" x2="144" y2="10" stroke="#1e3a8a" strokeWidth="2" opacity="0.8" />
          <line x1="150" y1="18" x2="150" y2="6" stroke="#1e3a8a" strokeWidth="2.5" opacity="0.8" />
          <line x1="156" y1="20" x2="156" y2="10" stroke="#1e3a8a" strokeWidth="2" opacity="0.8" />
          
          {/* Decorative Horizontal Lines & Pillars on Gopuram */}
          <line x1="117" y1="100" x2="183" y2="100" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
          <line x1="121" y1="90" x2="179" y2="90" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
          <line x1="125" y1="75" x2="175" y2="75" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
          <line x1="128" y1="65" x2="172" y2="65" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
          <line x1="131" y1="56" x2="169" y2="56" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
          <line x1="133" y1="48" x2="167" y2="48" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
          <line x1="136" y1="38" x2="164" y2="38" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />

          {/* Left Side Tower */}
          <rect x="75" y="120" width="30" height="30" rx="2" fill="#bfdbfe" opacity="0.3" />
          <path d="M77 120 L83 95 L97 95 L103 120 Z" fill="#bfdbfe" opacity="0.4" />
          <path d="M82 95 C82 85, 98 85, 98 95 Z" fill="#93c5fd" opacity="0.5" />
          <line x1="90" y1="87" x2="90" y2="80" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.8" />

          {/* Right Side Tower */}
          <rect x="195" y="120" width="30" height="30" rx="2" fill="#bfdbfe" opacity="0.3" />
          <path d="M197 120 L203 95 L217 95 L223 120 Z" fill="#bfdbfe" opacity="0.4" />
          <path d="M202 95 C202 85, 218 85, 218 95 Z" fill="#93c5fd" opacity="0.5" />
          <line x1="210" y1="87" x2="210" y2="80" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.8" />

          {/* Ground Line */}
          <line x1="20" y1="150" x2="280" y2="150" stroke="#93c5fd" strokeWidth="2.5" />
          
          {/* Subtle birds */}
          <path d="M40 30 Q45 25 50 30 Q55 25 60 30" stroke="#bfdbfe" strokeWidth="1.5" fill="none" opacity="0.8" />
          <path d="M240 25 Q243 21 246 25 Q249 21 252 25" stroke="#bfdbfe" strokeWidth="1.2" fill="none" opacity="0.8" />
          <path d="M255 35 Q258 32 261 35 Q264 32 267 35" stroke="#bfdbfe" strokeWidth="1" fill="none" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '1px solid #bfdbfe',
    borderRadius: '20px',
    padding: '24px 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    position: 'relative',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 2,
    flex: '1 1 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1e3a8a',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    marginTop: '-4px',
  },
  pillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '12px',
  },
  pill: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 4px rgba(148, 163, 184, 0.05)',
  },
  iconContainer: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pillText: {
    display: 'flex',
    flexDirection: 'column',
  },
  pillValue: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.2',
  },
  pillLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '500',
  },
  rightCol: {
    flex: '0 0 280px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
    userSelect: 'none',
  },
  templeSvg: {
    filter: 'drop-shadow(0 4px 8px rgba(147, 197, 253, 0.2))',
  }
};

export default HeroBanner;
