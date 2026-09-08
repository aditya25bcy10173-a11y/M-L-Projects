import React from 'react';
import { 
  Users, Calendar, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Compass, Activity, Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';

const StatsAndCharts = ({ stats, forecastData, t }) => {
  // Stats items config
  const statsItems = [
    {
      id: 'current-visitors',
      label: t.currentVisitors || 'Live Occupancy',
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
      label: t.todayVisitors || 'Today Total',
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
      label: t.capacityUsed || 'Capacity Utilized',
      value: `${stats.capacityUsed}%`,
      isProgress: true,
      icon: Compass,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fde68a'
    },
    {
      id: 'entry-count',
      label: t.entryCount || 'Gate Inflow Ticks',
      value: `+ ${stats.entryCount.toLocaleString()}`,
      change: '+15.2%',
      isPositive: true,
      icon: ArrowUpRight,
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0'
    },
    {
      id: 'active-zones',
      label: t.activeZones || 'Active Shrines',
      value: `${stats.activeZones.current} / ${stats.activeZones.total}`,
      icon: Activity,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe'
    },
    {
      id: 'active-alerts',
      label: t.activeAlerts || 'Active Warnings',
      value: stats.activeAlertsCount,
      isAlert: true,
      icon: ShieldAlert,
      color: '#ef4444',
      bgColor: '#fef2f2',
      borderColor: '#fca5a5'
    }
  ];

  return (
    <div style={styles.gridContainer}>
      {/* Left panel: Live Stats */}
      <div style={styles.statsCol} className="card">
        <div style={styles.header}>
          <div style={styles.title}>{t.liveStatistics || 'LIVE STATISTICS'}</div>
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
                        color: item.isAlert ? '#ef4444' : 'var(--text-primary)'
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

      {/* Right panel: Recharts CQR Forecast */}
      <div style={styles.chartCol} className="card">
        <div style={styles.headerRow}>
          <div style={styles.title}>14-DAY CROWD VISITOR FORECAST</div>
          <div style={styles.conformalBadge}>
            <Sparkles size={12} color="#2563eb" />
            <span>90% Confidence Conformal Bounds</span>
          </div>
        </div>

        <div style={styles.chartWrapper}>
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPoint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(tick) => tick.substring(5)} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(tick) => `${(tick / 1000).toFixed(0)}k`} 
                />
                                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)',
                    borderRadius: '12px', 
                    fontFamily: 'var(--font-main)', 
                    fontSize: '12px' 
                  }} 
                />
                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  iconType="circle" 
                  wrapperStyle={{ fontFamily: 'var(--font-main)', fontSize: '11px', color: 'var(--text-primary)' }}
                />
                
                {/* Conformal Bounds Range Shading */}
                <Area 
                  type="monotone" 
                  dataKey="upper" 
                  stroke="none" 
                  fill="rgba(37, 99, 235, 0.15)" 
                  name="Conformal Max Limit" 
                />
                <Area 
                  type="monotone" 
                  dataKey="lower" 
                  stroke="none" 
                  fill="var(--bg-card)" // Dynamically masks the lower bounds matching the card theme
                  name="Conformal Min Limit" 
                />
                
                {/* Main Prediction Line */}
                <Area 
                  type="monotone" 
                  dataKey="point" 
                  stroke="#2563eb" 
                  strokeWidth={2.5} 
                  fill="url(#colorPoint)" 
                  name="Predicted Darshans" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.chartEmpty}>
              <span>Loading time-series forecasts from AI Engine...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '20px',
    width: '100%',
    fontFamily: 'var(--font-main)'
  },
  statsCol: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-md)',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
  },
  chartCol: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-md)',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
  },
  header: {
    marginBottom: '16px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '0.8px',
  },
  conformalBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-blue-light)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--color-blue)'
  },
  statsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    width: '100%',
  },
  statCard: {
    backgroundColor: 'var(--bg-item)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100px',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
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
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
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
    backgroundColor: 'var(--border-color)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  },
  chartWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartEmpty: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontWeight: '600'
  }
};

export default StatsAndCharts;