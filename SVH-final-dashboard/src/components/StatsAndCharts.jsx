import React from 'react';
import { 
  Users, Calendar, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Compass, Activity
} from 'lucide-react';

const StatsAndCharts = ({ stats, t }) => {
  // Stats items config
  const statsItems = [
    {
      id: 'current-visitors',
      label: t.currentVisitors,
      value: stats.currentCrowd.toLocaleString(),
      change: '+12.4%',
      isPositive: true,
      icon: Users,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe'
    },
    {
      id: 'today-visitors',
      label: t.todayVisitors,
      value: stats.todayVisitors.toLocaleString(),
      change: '+8.3%',
      isPositive: true,
      icon: Calendar,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe'
    },
    {
      id: 'capacity-used',
      label: t.capacityUsed,
      value: `${stats.capacityUsed}%`,
      isProgress: true,
      icon: Compass,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fde68a'
    },
    {
      id: 'entry-count',
      label: t.entryCount,
      value: `+ ${stats.entryCount.toLocaleString()}`,
      change: '+15.2%',
      isPositive: true,
      icon: ArrowUpRight,
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0'
    },
    {
      id: 'exit-count',
      label: t.exitCount,
      value: `+ ${stats.exitCount.toLocaleString()}`,
      change: '-5.1%',
      isPositive: false,
      icon: ArrowDownRight,
      color: '#ef4444',
      bgColor: '#fef2f2',
      borderColor: '#fca5a5'
    },
    {
      id: 'active-zones',
      label: t.activeZones,
      value: `${stats.activeZones.current} / ${stats.activeZones.total}`,
      icon: Activity,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe'
    },
    {
      id: 'active-alerts',
      label: t.activeAlerts,
      value: stats.activeAlertsCount,
      isAlert: true,
      icon: ShieldAlert,
      color: '#ef4444',
      bgColor: '#fef2f2',
      borderColor: '#fca5a5'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.statsCol} className="card">
        <div style={styles.header}>
          <div style={styles.title}>{t.liveStatistics}</div>
        </div>
        
        <div style={styles.statsList}>
          {statsItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} style={styles.statCard}>
                <div style={styles.statCardHeader}>
                  <span style={styles.statLabel}>{item.label}</span>
                  <div style={{
                    ...styles.statIconContainer,
                    backgroundColor: item.bgColor,
                    border: `1px solid ${item.borderColor}`,
                    color: item.color
                  }}>
                    <Icon size={16} />
                  </div>
                </div>
                
                <div style={styles.statCardBody}>
                  {item.isProgress ? (
                    <div style={styles.progressContainer}>
                      <span style={styles.statValue}>{item.value}</span>
                      <div style={styles.progressBarBg}>
                        <div style={{
                          ...styles.progressBarFill, 
                          width: `${stats.capacityUsed}%`,
                          backgroundColor: item.color
                        }}></div>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.valueContainer}>
                      <span style={{
                        ...styles.statValue,
                        color: item.isAlert ? '#ef4444' : '#0f172a'
                      }}>{item.value}</span>
                      {item.change && (
                        <span style={{
                          ...styles.changeLabel,
                          color: item.isPositive ? '#10b981' : '#ef4444',
                          backgroundColor: item.isPositive ? '#ecfdf5' : '#fef2f2',
                          border: `1px solid ${item.isPositive ? '#a7f3d0' : '#fca5a5'}`
                        }}>
                          {item.change}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
  },
  statsCol: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-card)',
  },
  header: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '0.8px',
  },
  statsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  statCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  statCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  statCardBody: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '8px',
  },
  valueContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.2',
  },
  changeLabel: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  }
};

export default StatsAndCharts;
