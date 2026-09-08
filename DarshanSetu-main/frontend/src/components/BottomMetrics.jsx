import React from 'react';
import { Users, Clock, Target, ShieldAlert, AlertTriangle, Timer } from 'lucide-react';

const BottomMetrics = ({ metrics }) => {
  // Sparkline data (path values for SVG)
  const sparklines = {
    visitors: "M 0 18 Q 15 12, 30 15 T 60 8 T 90 20 T 120 5",
    peakTime: "M 0 10 Q 15 22, 30 18 T 60 5 T 90 15 T 120 18",
    accuracy: "M 0 5 Q 15 8, 30 5 T 60 12 T 90 6 T 120 8",
    riskZones: "M 0 20 Q 15 22, 30 15 T 60 18 T 90 8 T 120 22",
    alerts: "M 0 10 Q 15 15, 30 8 T 60 12 T 90 20 T 120 12",
    waitingTime: "M 0 5 Q 15 10, 30 15 T 60 8 T 90 12 T 120 20"
  };

  const metricsConfig = [
    {
      id: 'visitors',
      title: "Today's Visitors",
      value: metrics.todayVisitors.toLocaleString(),
      change: `+${metrics.visitorsChange}%`,
      sub: 'vs yesterday',
      isPositive: true,
      icon: Users,
      color: '#2563eb',
      sparkColor: '#3b82f6',
      sparkPath: sparklines.visitors
    },
    {
      id: 'peakTime',
      title: 'Peak Time',
      value: metrics.peakTime,
      change: 'Expected',
      sub: '12:00 PM - 2:00 PM',
      isNeutral: true,
      icon: Clock,
      color: '#10b981',
      sparkColor: '#10b981',
      sparkPath: sparklines.peakTime
    },
    {
      id: 'accuracy',
      title: 'Prediction Accuracy',
      value: `${metrics.predictionAccuracy}%`,
      change: `+${metrics.accuracyChange}%`,
      sub: 'vs yesterday',
      isPositive: true,
      icon: Target,
      color: '#8b5cf6',
      sparkColor: '#8b5cf6',
      sparkPath: sparklines.accuracy
    },
    {
      id: 'riskZones',
      title: 'High Risk Zones',
      value: metrics.highRiskZones,
      change: `+${metrics.riskZonesChange}`,
      sub: 'vs yesterday',
      isPositive: false,
      icon: ShieldAlert,
      color: '#ef4444',
      sparkColor: '#ef4444',
      sparkPath: sparklines.riskZones
    },
    {
      id: 'alerts',
      title: 'Emergency Alerts',
      value: metrics.emergencyAlerts,
      change: `+${metrics.alertsChange} active`,
      sub: 'alerts reporting',
      isAlert: true,
      icon: AlertTriangle,
      color: '#f59e0b',
      sparkColor: '#f59e0b',
      sparkPath: sparklines.alerts
    },
    {
      id: 'waitingTime',
      title: 'Average Waiting Time',
      value: `${metrics.avgWaitingTime} mins`,
      change: `-${metrics.waitingTimeChange} mins`,
      sub: 'vs yesterday',
      isPositive: true, // Decreasing waiting time is positive!
      icon: Timer,
      color: '#0d9488',
      sparkColor: '#0d9488',
      sparkPath: sparklines.waitingTime
    }
  ];

  return (
    <div style={styles.grid}>
      {metricsConfig.map((metric) => {
        const Icon = metric.icon;
        
        // Determine color of badge
        let badgeColor = '#10b981';
        let badgeBg = '#ecfdf5';
        if (metric.isAlert || (!metric.isPositive && !metric.isNeutral)) {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
        } else if (metric.isNeutral) {
          badgeColor = 'var(--text-secondary)';
          badgeBg = 'var(--bg-item)';
        }

        return (
          <div key={metric.id} style={styles.card} className="card">
            <div style={styles.header}>
              <div style={{...styles.iconContainer, color: metric.color}}>
                <Icon size={14} />
              </div>
              <div style={styles.title}>{metric.title}</div>
            </div>
            
            <div style={styles.content}>
              <div style={styles.leftPane}>
                <div style={styles.value}>{metric.value}</div>
                <div style={styles.badgeRow}>
                  <span style={{
                    ...styles.badge, 
                    color: badgeColor, 
                    backgroundColor: badgeBg
                  }}>
                    {metric.change}
                  </span>
                  <span style={styles.subText}>{metric.sub}</span>
                </div>
              </div>
              
              {/* Sparkline trend representation */}
              <div style={styles.rightPane}>
                <svg width="60" height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d={metric.sparkPath} 
                    stroke={metric.sparkColor} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-card)',
    height: '92px',
    transition: 'all 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconContainer: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-item)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  title: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  content: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: '6px',
  },
  leftPane: {
    display: 'flex',
    flexDirection: 'column',
  },
  value: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px',
    flexWrap: 'nowrap',
  },
  badge: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '1px 4px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  },
  subText: {
    fontSize: '8.5px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  rightPane: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '2px',
  }
};

export default BottomMetrics;
