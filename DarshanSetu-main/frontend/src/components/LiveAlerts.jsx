import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Car, Cloud, ArrowRight } from 'lucide-react';

const LiveAlerts = ({ alerts, onAlertClick }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return {
          icon: ShieldAlert,
          color: '#ef4444',
          bgColor: '#fef2f2',
          borderColor: '#fca5a5'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: '#f59e0b',
          bgColor: '#fffbeb',
          borderColor: '#fde68a'
        };
      case 'info-traffic':
        return {
          icon: Car,
          color: '#2563eb',
          bgColor: '#eff6ff',
          borderColor: '#bfdbfe'
        };
      case 'info-weather':
        return {
          icon: Cloud,
          color: '#0ea5e9',
          bgColor: '#f0fdfa',
          borderColor: '#99f6e4'
        };
      default:
        return {
          icon: Info,
          color: '#64748b',
          bgColor: '#f8fafc',
          borderColor: '#cbd5e1'
        };
    }
  };

  return (
    <div style={styles.card} className="card">
      {/* Header Row */}
      <div style={styles.header}>
        <div style={styles.title}>LIVE ALERTS</div>
        <button style={styles.viewAllLink} onClick={() => alert('Viewing all active alerts...')}>View All</button>
      </div>

      {/* Alert Feed Container */}
      <div style={styles.alertFeed}>
        {alerts.map((alertItem) => {
          const config = getAlertIcon(alertItem.type);
          const IconComponent = config.icon;
          
          return (
            <div 
              key={alertItem.id} 
              className="alert-item"
              style={{
                ...styles.alertItem,
                borderLeft: `3px solid ${config.color}`
              }}
              onClick={() => onAlertClick && onAlertClick(alertItem)}
            >
              <div style={{
                ...styles.iconContainer,
                backgroundColor: config.bgColor,
                border: `1px solid ${config.borderColor}`
              }}>
                <IconComponent size={14} color={config.color} />
              </div>
              
              <div style={styles.alertContent}>
                <div style={styles.alertTitle}>{alertItem.title}</div>
                <div style={styles.alertLocation}>{alertItem.location}</div>
              </div>
              
              <div style={styles.alertTime}>{alertItem.time}</div>
            </div>
          );
        })}
      </div>

      {/* View All Alerts Button */}
      <button 
        className="view-all-btn"
        style={styles.viewAllBtn}
        onClick={() => alert('Loading historic alerts database...')}
      >
        <span style={styles.btnText}>View All Alerts</span>
        <ArrowRight size={14} color="#2563eb" />
      </button>
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
    marginBottom: '14px',
  },
  title: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '0.8px',
  },
  viewAllLink: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#2563eb',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
  },
  alertFeed: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '4px',
  },
  alertItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
    borderRadius: '10px',
    padding: '8px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  iconContainer: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  alertTitle: {
    fontSize: '11.5px',
    fontWeight: '750',
    color: '#0f172a',
  },
  alertLocation: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginTop: '2px',
  },
  alertTime: {
    fontSize: '9px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    alignSelf: 'flex-start',
    marginTop: '2px',
  },
  viewAllBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #bfdbfe',
    backgroundColor: '#eff6ff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-main)',
    marginTop: '12px',
    transition: 'all 0.2s ease',
  },
  btnText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
  }
};

export default LiveAlerts;
