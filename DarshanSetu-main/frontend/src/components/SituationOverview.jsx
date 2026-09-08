import React from 'react';
import { ShieldCheck, Users, Cloud } from 'lucide-react';

const SituationOverview = ({ stats, t }) => {
  const overviewCards = [
    {
      title: t.systemStatus,
      value: stats.systemStatus,
      label: t.operational,
      icon: ShieldCheck,
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0'
    },
    {
      title: t.currentCrowd,
      value: stats.currentCrowd.toLocaleString(),
      label: t.liveCount,
      icon: Users,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe'
    },
    {
      title: t.weatherImpact,
      value: stats.weatherImpact,
      label: t.viewDetails,
      icon: Cloud,
      color: '#0d9488',
      bgColor: '#f0fdfa',
      borderColor: '#99f6e4'
    },
    {
      title: t.reportingAccuracy,
      value: `${stats.aiConfidence}%`,
      label: t.operatorVerified,
      icon: ShieldCheck,
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Top Header Row */}
      <div style={styles.headerRow}>
        <div style={styles.title}>{t.situationOverview}</div>
      </div>

      {/* Grid of Cards */}
      <div style={styles.grid}>
        {overviewCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card" style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>{card.title}</span>
                <div style={{
                  ...styles.iconContainer, 
                  backgroundColor: card.bgColor,
                  border: `1px solid ${card.borderColor}`
                }}>
                  <Icon size={16} color={card.color} />
                </div>
              </div>
              <div style={styles.cardBody}>
                <div style={{...styles.value, color: 'var(--text-primary)'}}>
                  {card.value}
                </div>
                {card.title === t.systemStatus ? (
                  <div style={styles.statusLabelContainer}>
                    <span style={{...styles.badgeDot, backgroundColor: '#10b981'}}></span>
                    <span style={{...styles.cardLabel, color: '#10b981', fontWeight: '600'}}>{card.label}</span>
                  </div>
                ) : (
                  <span style={styles.cardLabel}>{card.label}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded CSS for spin keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '0.8px',
  },
  refreshContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
  },
  timeLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  refreshButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    display: 'block',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.2s ease',
    height: '104px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  iconContainer: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',  
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '6px',
  },
  value: {
    fontSize: '22px',
    fontWeight: '800',
    lineHeight: '1.1',
  },
  cardLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    marginTop: '2px',
  },
  statusLabelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px',
  },
  badgeDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
  }
};

export default SituationOverview;
