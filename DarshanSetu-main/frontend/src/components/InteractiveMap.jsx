import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const InteractiveMap = ({ filters, setFilters }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.8));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleFilter = (key) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Mock markers/data
  const markers = {
    cctv: [
      { id: 'c1', x: 220, y: 150, label: 'CCTV Zone 1' },
      { id: 'c2', x: 290, y: 120, label: 'CCTV Complex' },
      { id: 'c3', x: 150, y: 220, label: 'CCTV Alipiri Path' },
      { id: 'c4', x: 380, y: 240, label: 'CCTV Exit' }
    ],
    entry: [
      { id: 'e1', x: 120, y: 250, label: 'Alipiri Gate' },
      { id: 'e2', x: 80, y: 140, label: 'Srivari Mettu' }
    ],
    exit: [
      { id: 'ex1', x: 360, y: 190, label: 'North Exit Gate' },
      { id: 'ex2', x: 280, y: 280, label: 'South Exit' }
    ],
    highDensity: [
      { id: 'h1', x: 280, y: 130, r: 35, color: '#ef4444', label: 'Vaikuntha Complex Area' },
      { id: 'h2', x: 220, y: 170, r: 25, color: '#f59e0b', label: 'Inner Ring Road' },
      { id: 'h3', x: 140, y: 230, r: 20, color: '#10b981', label: 'Alipiri Checking Point' }
    ]
  };

  return (
    <div style={styles.card} className="card">
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <div style={styles.title}>LIVE CROWD OVERVIEW</div>
          <div style={styles.subtitle}>Tirumala Hills - Real-time Geographic Distribution</div>
        </div>
        
        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={{...styles.legendDot, backgroundColor: '#ef4444'}}></span>
            <span>High (80-100%)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{...styles.legendDot, backgroundColor: '#f59e0b'}}></span>
            <span>Moderate (50-80%)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{...styles.legendDot, backgroundColor: '#10b981'}}></span>
            <span>Low (0-50%)</span>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div 
        style={styles.mapArea}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Controls Overlay */}
        <div style={styles.controls}>
          <button className="control-btn" style={styles.controlBtn} onClick={handleZoomIn} title="Zoom In"><ZoomIn size={14} /></button>
          <button className="control-btn" style={styles.controlBtn} onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={14} /></button>
          <button className="control-btn" style={styles.controlBtn} onClick={handleReset} title="Reset View"><Maximize size={14} /></button>
        </div>

        {/* SVG Drawing Canvas */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 500 350"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease'
          }}
        >
          {/* Defs for gradients */}
          <defs>
            <radialGradient id="highGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mediumGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lowGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="75%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Map Base - Topography / Hills */}
          {/* Hill patches */}
          <path d="M-20,380 C80,300 120,320 220,380 Z" fill="#f1f5f9" opacity="0.6" />
          <path d="M120,100 C200,60 280,70 380,100 C430,70 480,90 520,100 L520,380 L120,380 Z" fill="#f1f5f9" opacity="0.4" />
          <path d="M300,-50 C380,-10 420,-20 520,-50 L520,200 Z" fill="#f1f5f9" opacity="0.3" />

          {/* Road Networks / Pathways */}
          {/* Alipiri Path */}
          <path d="M 120,250 Q 150,210 200,200 T 260,140" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
          <path d="M 120,250 Q 150,210 200,200 T 260,140" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

          {/* Srivari Mettu Path */}
          <path d="M 80,140 Q 140,150 200,160 T 260,140" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          <path d="M 80,140 Q 140,150 200,160 T 260,140" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />

          {/* Temple Ring Road */}
          <ellipse cx="280" cy="140" rx="60" ry="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <ellipse cx="280" cy="140" rx="60" ry="40" fill="none" stroke="#cbd5e1" strokeWidth="4" />

          {/* Exit Road */}
          <path d="M 340,140 Q 400,150 420,200 T 450,300" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          <path d="M 340,140 Q 400,150 420,200 T 450,300" fill="none" stroke="#cbd5e1" strokeWidth="3" />

          {/* Key Structures */}
          {/* Alipiri Checkpoint */}
          <rect x="110" y="240" width="20" height="20" rx="4" fill="#64748b" opacity="0.8" />
          <text x="120" y="275" fontSize="8" fontWeight="600" textAnchor="middle" fill="#64748b">Alipiri</text>

          {/* Srivari Mettu Checkpoint */}
          <rect x="70" y="130" width="20" height="20" rx="4" fill="#64748b" opacity="0.8" />
          <text x="80" y="165" fontSize="8" fontWeight="600" textAnchor="middle" fill="#64748b">Srivari Mettu</text>

          {/* Vaikuntha Queue Complex */}
          <rect x="290" y="110" width="35" height="25" rx="5" fill="#1e3a8a" opacity="0.85" />
          <rect x="295" y="115" width="25" height="15" rx="2" fill="#bfdbfe" opacity="0.3" />
          <text x="310" y="102" fontSize="8" fontWeight="700" textAnchor="middle" fill="#1e3a8a">Vaikuntha Complex</text>

          {/* Tirumala Temple Centre */}
          <polygon points="265,130 280,115 295,130 290,150 270,150" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <circle cx="280" cy="133" r="6" fill="#ef4444" opacity="0.7" />
          <text x="280" y="162" fontSize="9" fontWeight="800" textAnchor="middle" fill="#d97706">TIRUMALA TEMPLE</text>

          {/* Heatmap overlay (Render only if highDensity filter is active) */}
          {filters.highDensity && (
            <>
              {/* Vaikuntha Complex Heatmap (Critical) */}
              <circle cx="285" cy="130" r="55" fill="url(#highGlow)" />
              <circle cx="285" cy="130" r="12" fill="#ef4444" opacity="0.15" />
              <circle cx="285" cy="130" r="6" fill="#ef4444" opacity="0.4">
                <animate attributeName="r" values="4;16;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Ring Road Heatmap (Warning) */}
              <circle cx="220" cy="150" r="40" fill="url(#mediumGlow)" />
              <circle cx="220" cy="150" r="5" fill="#f59e0b" opacity="0.4">
                <animate attributeName="r" values="3;10;3" dur="2.5s" repeatCount="indefinite" />
              </circle>

              {/* Alipiri Gate Heatmap (Normal) */}
              <circle cx="130" cy="245" r="30" fill="url(#lowGlow)" />
            </>
          )}

          {/* Entry Gate markers */}
          {filters.entryPoints && markers.entry.map(marker => (
            <g key={marker.id} transform={`translate(${marker.x}, ${marker.y})`}>
              <circle cx="0" cy="0" r="8" fill="#10b981" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
              <path d="M-4,-2 L0,-6 L4,-2 M0,-6 L0,6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}

          {/* Exit Gate markers */}
          {filters.exitPoints && markers.exit.map(marker => (
            <g key={marker.id} transform={`translate(${marker.x}, ${marker.y})`}>
              <circle cx="0" cy="0" r="8" fill="#f59e0b" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
              <path d="M-4,2 L0,6 L4,2 M0,-6 L0,6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}

          {/* CCTV Camera markers */}
          {filters.cctv && markers.cctv.map(marker => (
            <g key={marker.id} transform={`translate(${marker.x}, ${marker.y})`} style={{ cursor: 'pointer' }}>
              <circle cx="0" cy="0" r="7" fill="#2563eb" />
              <path d="M-3,-2 H2 V1 H-3 Z M2,-1 L4,-3 V1 L2,-1" fill="#ffffff" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" />
            </g>
          ))}
        </svg>

        {/* Floating overlay indicators (e.g. Labels) */}
        <div style={{...styles.mapLabel, top: '40%', left: '16%'}}>Srivari Mettu</div>
        <div style={{...styles.mapLabel, top: '70%', left: '26%'}}>Alipiri Path</div>
        <div style={{...styles.mapLabel, top: '22%', left: '55%'}}>Vaikuntha Complex</div>
        <div style={{...styles.mapLabel, top: '48%', left: '58%'}}>Temple Area</div>
      </div>

      {/* Checkboxes Row */}
      <div style={styles.footer}>
        <label style={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            checked={filters.entryPoints} 
            onChange={() => toggleFilter('entryPoints')} 
            style={styles.checkbox}
          />
          <span style={{...styles.checkboxColor, backgroundColor: '#10b981'}}></span>
          <span style={styles.checkboxText}>Entry Points</span>
        </label>
        
        <label style={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            checked={filters.exitPoints} 
            onChange={() => toggleFilter('exitPoints')} 
            style={styles.checkbox}
          />
          <span style={{...styles.checkboxColor, backgroundColor: '#f59e0b'}}></span>
          <span style={styles.checkboxText}>Exit Points</span>
        </label>
        
        <label style={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            checked={filters.highDensity} 
            onChange={() => toggleFilter('highDensity')} 
            style={styles.checkbox}
          />
          <span style={{...styles.checkboxColor, backgroundColor: '#ef4444'}}></span>
          <span style={styles.checkboxText}>High Density</span>
        </label>
        
        <label style={styles.checkboxContainer}>
          <input 
            type="checkbox" 
            checked={filters.cctv} 
            onChange={() => toggleFilter('cctv')} 
            style={styles.checkbox}
          />
          <span style={{...styles.checkboxColor, backgroundColor: '#2563eb'}}></span>
          <span style={styles.checkboxText}>CCTV</span>
        </label>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '425px',
    boxShadow: 'var(--shadow-card)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '0.8px',
  },
  subtitle: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    marginTop: '2px',
  },
  legend: {
    display: 'flex',
    gap: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  legendDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  mapArea: {
    flex: 1,
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    position: 'relative',
  },
  controls: {
    position: 'absolute',
    left: '12px',
    top: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 10,
  },
  controlBtn: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.15s ease',
  },
  mapLabel: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: '8px',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '2px 4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
    marginTop: '12px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
    width: '14px',
    height: '14px',
    borderRadius: '4px',
    accentColor: 'var(--color-blue)',
  },
  checkboxColor: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  checkboxText: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  }
};

export default InteractiveMap;
