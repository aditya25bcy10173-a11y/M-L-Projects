import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Car, 
  FileText, 
  BarChart2, 
  Settings, 
  PhoneCall, 
  HelpCircle, 
  Info, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ activeModule, setActiveModule, t }) => {
  const modules = [
    { id: 'live-crowd', name: t.liveCrowd, icon: Users },
    { id: 'forecast', name: t.forecast, icon: TrendingUp },
    { id: 'traffic', name: t.traffic, icon: Car },
  ];

  const moreItems = [
    { id: 'reports', name: t.reports, icon: FileText },
    { id: 'analytics', name: t.analytics, icon: BarChart2 },
    { id: 'settings', name: t.settings, icon: Settings },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Spacer for Top Header Alignment */}
      <div style={styles.headerSpacer}></div>

      {/* Main Dashboard Button */}
      <button 
        style={{
          ...styles.navItem,
          ...(activeModule === 'dashboard' ? styles.activeNavItem : {})
        }}
        onClick={() => setActiveModule('dashboard')}
      >
        <LayoutDashboard size={18} style={activeModule === 'dashboard' ? styles.activeIcon : styles.icon} />
        <span style={styles.navText}>{t.dashboard}</span>
      </button>

      {/* Modules Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>{t.modules}</div>
        {modules.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.activeNavItem : {})
              }}
              onClick={() => setActiveModule(item.id)}
            >
              <Icon size={18} style={isActive ? styles.activeIcon : styles.icon} />
              <span style={styles.navText}>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* More Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>{t.more}</div>
        {moreItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.activeNavItem : {})
              }}
              onClick={() => setActiveModule(item.id)}
            >
              <Icon size={18} style={isActive ? styles.activeIcon : styles.icon} />
              <span style={styles.navText}>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Emergency Card */}
      <div style={styles.emergencyCard}>
        <div style={styles.emergencyIconContainer}>
          <PhoneCall size={20} color="#ef4444" />
        </div>
        <div style={styles.emergencyInfo}>
          <div style={styles.emergencyLabel}>{t.emergencyHelpline}</div>
          <div style={styles.emergencyNumber}>112</div>
          <div style={styles.emergencySub}>{t.emergencySupport}</div>
        </div>
      </div>

      {/* Bottom Footer Items */}
      <div style={styles.bottomSection}>
        <button 
          style={{...styles.navItem, ...styles.bottomNavItem}}
          onClick={() => alert(t.supportAlert)}
        >
          <HelpCircle size={18} style={styles.icon} />
          <span style={styles.navText}>{t.supportCenter}</span>
        </button>
        <button 
          style={{...styles.navItem, ...styles.bottomNavItem}}
          onClick={() => alert(t.aboutAlert)}
        >
          <Info size={18} style={styles.icon} />
          <span style={styles.navText}>{t.aboutDialog}</span>
        </button>
        <button 
          style={{...styles.navItem, ...styles.logoutItem}}
          onClick={() => alert('Logging out...')}
        >
          <LogOut size={18} style={styles.logoutIcon} />
          <span style={styles.logoutText}>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    height: '100vh',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 16px 24px 16px',
    overflowY: 'auto',
    flexShrink: 0,
  },
  headerSpacer: {
    height: '80px', // Match the header height
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-main)',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
    marginBottom: '4px',
  },
  activeNavItem: {
    backgroundColor: 'var(--color-blue-light)',
    color: 'var(--color-blue)',
    fontWeight: '600',
  },
  icon: {
    marginRight: '12px',
    color: 'var(--text-muted)',
    transition: 'color 0.2s ease',
  },
  activeIcon: {
    marginRight: '12px',
    color: 'var(--color-blue)',
  },
  navText: {
    flex: 1,
  },
  section: {
    marginTop: '20px',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    paddingLeft: '14px',
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  emergencyCard: {
    marginTop: '24px',
    backgroundColor: '#fef2f2',
    border: '1px dashed #fca5a5',
    borderRadius: '14px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'flash-glow 3s infinite',
  },
  emergencyIconContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emergencyInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  emergencyLabel: {
    fontSize: '11px',
    color: '#991b1b',
    fontWeight: '500',
  },
  emergencyNumber: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ef4444',
    lineHeight: '1.2',
  },
  emergencySub: {
    fontSize: '10px',
    color: '#b91c1c',
    opacity: 0.8,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  bottomNavItem: {
    padding: '8px 12px',
    fontSize: '13px',
  },
  logoutItem: {
    padding: '8px 12px',
    fontSize: '13px',
    color: '#ef4444',
  },
  logoutIcon: {
    marginRight: '12px',
    color: '#fca5a5',
  },
  logoutText: {
    fontWeight: '600',
  }
};

export default Sidebar;
