import React, { useState } from 'react';
import { Bell, ChevronDown, Globe } from 'lucide-react';
import Logo from './Logo';

const Header = ({ activeModule, setActiveModule, language, setLanguage, t }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const languagesList = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'fr', label: 'French', native: 'Français' },
    { code: 'es', label: 'Spanish', native: 'Español' },
    { code: 'more', label: 'More...', native: 'More...' }
  ];

  const topTabs = [
    { id: 'dashboard', label: t.dashboard },
    { id: 'forecast', label: t.forecast },
    { id: 'alerts', label: t.alerts },
    { id: 'reports', label: t.reports },
    { id: 'analytics', label: t.analytics },
    { id: 'settings', label: t.settings }
  ];

  return (
    <header style={styles.header}>
      {/* Left Brand Area */}
      <div style={styles.brandContainer}>
        {/* Custom Darshan Setu Logo */}
        <Logo width={42} height={42} />
        
        <div style={styles.brandTextContainer}>
          <div style={styles.brandTitle}>{t.brandTitle}</div>
          <div style={styles.brandSubtitle}>{t.brandSubtitle}</div>
        </div>
      </div>

      {/* Top Menu Tabs */}
      <div style={styles.tabContainer}>
        {topTabs.map((tab) => {
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              style={{
                ...styles.tab,
                ...(isActive ? styles.activeTab : {})
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Controls & Info */}
      <div style={styles.rightSection}>
        {/* Notification Bell */}
        <div style={styles.iconBadgeContainer}>
          <button style={styles.bellButton}>
            <Bell size={20} color="#475569" />
            <span style={styles.badge}>5</span>
          </button>
        </div>

        {/* Live Status Pill */}
        <div style={styles.statusPill}>
          <span style={styles.pulseDot}></span>
          <span style={styles.pulseRing}></span>
          <span style={styles.statusText}>LIVE</span>
          <span style={styles.statusDesc}>System Operational</span>
        </div>

        {/* Language Selector Dropdown */}
        <div style={styles.langSelectorContainer}>
          <button 
            style={styles.langBtn} 
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <Globe size={16} color="#475569" />
            <span style={styles.langLabel}>
              {languagesList.find(l => l.code === language)?.native || 'English'}
            </span>
            <ChevronDown size={12} color="#64748b" style={{
              transform: isLangOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
              marginLeft: '2px'
            }} />
          </button>
          
          {isLangOpen && (
            <div style={styles.langDropdown}>
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  style={{
                    ...styles.langItem,
                    fontWeight: language === lang.code ? 'bold' : 'normal',
                    backgroundColor: language === lang.code ? '#f1f5f9' : 'transparent',
                    color: language === lang.code ? 'var(--color-blue)' : 'var(--text-secondary)'
                  }}
                  onClick={() => {
                    if (lang.code === 'more') {
                      alert('Additional languages will be added in future updates!');
                    } else {
                      setLanguage(lang.code);
                    }
                    setIsLangOpen(false);
                  }}
                >
                  <span style={styles.langItemNative}>{lang.native}</span>
                  <span style={styles.langItemEnglish}>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="profile-container" style={styles.profileContainer}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>AO</div>
            <div style={styles.avatarStatus}></div>
          </div>
          <div style={styles.profileText}>
            <div style={styles.profileName}>Admin Officer</div>
            <div style={styles.profileRole}>Control Center</div>
          </div>
          <ChevronDown size={14} color="#64748b" style={styles.dropdownIcon} />
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '76px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '280px',
  },
  emblemContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemSub: {
    fontSize: '6px',
    fontWeight: '800',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.2px',
  },
  brandTextContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.1',
    letterSpacing: '-0.3px',
  },
  brandSubtitle: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  tabContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#f1f5f9',
    padding: '4px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-main)',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    color: 'var(--color-blue)',
    boxShadow: '0 2px 6px rgba(148, 163, 184, 0.15)',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconBadgeContainer: {
    position: 'relative',
  },
  bellButton: {
    background: 'none',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '20px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    position: 'relative',
    gap: '6px',
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    animation: 'pulse-dot 1.5s infinite',
  },
  pulseRing: {
    position: 'absolute',
    left: '12px',
    top: '15px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    border: '2px solid #22c55e',
    animation: 'pulse-ring 1.5s infinite',
  },
  statusText: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: '0.5px',
  },
  statusDesc: {
    fontSize: '10px',
    fontWeight: '500',
    color: '#166534',
    opacity: 0.8,
    borderLeft: '1px solid #bbf7d0',
    paddingLeft: '6px',
  },
  langSelectorContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid #e2e8f0',
    paddingRight: '20px',
  },
  langBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  langLabel: {
    fontSize: '13px',
  },
  langDropdown: {
    position: 'absolute',
    top: '100%',
    right: '20px',
    marginTop: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-hover)',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: '150px',
    zIndex: 1000,
  },
  langItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    fontFamily: 'var(--font-main)',
    fontSize: '12px',
    transition: 'background-color 0.15s ease',
  },
  langItemNative: {
    fontWeight: '600',
  },
  langItemEnglish: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginLeft: '8px',
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
  },
  avatarStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    border: '2px solid #ffffff',
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  profileRole: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  dropdownIcon: {
    marginLeft: '4px',
  }
};

export default Header;
