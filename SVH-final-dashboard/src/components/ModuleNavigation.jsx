import React from 'react';
import { Users, TrendingUp, Car, ArrowRight } from 'lucide-react';

const ModuleNavigation = ({ activeModule, setActiveModule }) => {
  const cards = [
    {
      id: 'live-crowd',
      title: 'Live Crowd',
      desc: 'Monitor real-time crowd density.',
      statusText: 'Live Monitoring',
      icon: Users,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
      btnColor: '#2563eb'
    },
    {
      id: 'forecast',
      title: 'Crowd Forecast',
      desc: 'Predict crowd levels using historical patterns.',
      statusText: 'Trend Analysis',
      icon: TrendingUp,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe',
      btnColor: '#8b5cf6'
    },
    {
      id: 'traffic',
      title: 'Traffic',
      desc: 'Monitor traffic movement around the event.',
      statusText: 'Live Tracking',
      icon: Car,
      color: '#0d9488',
      bgColor: '#f0fdfa',
      borderColor: '#99f6e4',
      btnColor: '#0d9488'
    }
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeModule === card.id;
        return (
          <div 
            key={card.id} 
            className="card"
            style={{
              ...styles.card,
              borderLeft: `4px solid ${card.color}`,
              boxShadow: isActive ? `0 8px 30px rgba(148, 163, 184, 0.15), 0 0 0 2px ${card.color}` : 'var(--shadow-card)',
              transform: isActive ? 'translateY(-2px)' : 'none',
              borderColor: isActive ? card.color : '#e2e8f0'
            }}
            onClick={() => setActiveModule(card.id)}
          >
            <div style={styles.topRow}>
              <div style={{
                ...styles.iconContainer,
                backgroundColor: card.bgColor
              }}>
                <Icon size={18} color={card.color} />
              </div>
              <div style={styles.title}>{card.title}</div>
            </div>
            
            <p style={styles.desc}>{card.desc}</p>
            
            <div style={styles.bottomRow}>
              <div style={styles.statusContainer}>
                <span style={styles.statusDot}></span>
                <span style={styles.statusText}>{card.statusText}</span>
              </div>
              <button 
                className="arrow-btn"
                style={{
                  ...styles.arrowBtn,
                  backgroundColor: card.btnColor
                }}
              >
                <ArrowRight size={14} color="#ffffff" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '128px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  desc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    margin: '10px 0 12px 0',
    lineHeight: '1.4',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  arrowBtn: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease',
  }
};

export default ModuleNavigation;
