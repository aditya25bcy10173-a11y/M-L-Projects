import React, { useState } from 'react';
import { Bell, ChevronDown, Globe, MapPin } from 'lucide-react';
import Logo from './Logo';

const Header = ({ activeModule, setActiveModule, language, setLanguage, selectedSite, setSelectedSite, t }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSiteOpen, setIsSiteOpen] = useState(false);

  const languagesList = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' }
  ];

  const shrines = [
    { id: 'dwarka', label: 'Dwarka Temple' },
    { id: 'somnath', label: 'Somnath Temple' },
    { id: 'ambaji', label: 'Ambaji Temple' },
    { id: 'pavagadh', label: 'Pavagadh Temple' }
  ];

  const topTabs = [
    { id: 'dashboard', label: t.dashboard || 'Dashboard' },
    { id: 'forecast', label: t.forecast || 'Forecasting' },
    { id: 'alerts', label: t.alerts || 'Alerts' }
  ];

  return (
    <header style={styles.header}>
      {/* Left Brand Area */}
      <div style={styles.brandContainer}>
        <Logo width={42} height={42} />
        <div style={styles.brandTextContainer}>
          <div style={styles.brandTitle}>DarshanSetu</div>
          <div style={styles.brandSubtitle}>Intelligent Crowd Management</div>
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
        {/* Temple Site Selector Dropdown */}
        <div style={styles.dropdownContainer}>
          <button 
            style={styles.dropdownBtn} 
            onClick={() => {
              setIsSiteOpen(!isSiteOpen);
              setIsLangOpen(false);
            }}
          >
            <MapPin size={16} color="#2563eb" />
            <span style={styles.dropdownLabel}>
              {shrines.find(s => s.id === selectedSite)?.label || 'Dwarka Temple'}
            </span>
            <ChevronDown size={12} color="#64748b" style={{
              transform: isSiteOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          
          {isSiteOpen && (
            <div style={styles.dropdownMenu}>
              {shrines.map((site) => (
                <button
                  key={site.id}
                  style={{
                    ...styles.dropdownItem,
                    fontWeight: selectedSite === site.id ? '700' : '400',
                    backgroundColor: selectedSite === site.id ? 'var(--bg-item)' : 'transparent'
                  }}
                  onClick={() => {
                    setSelectedSite(site.id);
                    setIsSiteOpen(false);
                  }}
                >
                  {site.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Status Pill */}
        <div style={styles.statusPill}>
          <span style={styles.pulseDot}></span>
          <span style={styles.statusText}>LIVE</span>
        </div>

        {/* Language Selector Dropdown */}
        <div style={styles.dropdownContainer}>
          <button 
            style={styles.dropdownBtn} 
            onClick={() => {
              setIsLangOpen(!isLangOpen);
              setIsSiteOpen(false);
            }}
          >
            <Globe size={16} color="#475569" />
            <span style={styles.dropdownLabel}>
              {languagesList.find(l => l.code === language)?.native || 'English'}
            </span>
            <ChevronDown size={12} color="#64748b" style={{
              transform: isLangOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          
          {isLangOpen && (
            <div style={styles.dropdownMenu}>
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  style={{
                    ...styles.dropdownItem,
                    fontWeight: language === lang.code ? '700' : '400',
                    backgroundColor: language === lang.code ? 'var(--bg-item)' : 'transparent'
                  }}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '76px',
    backgroundColor: 'var(--bg-sidebar)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
    fontFamily: 'var(--font-main)',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  brandTextContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
    lineHeight: '1.2'
  },
  brandSubtitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  tabContainer: {
    display: 'flex',
    gap: '8px'
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-main)'
  },
  activeTab: {
    backgroundColor: 'var(--color-blue-light)',
    color: 'var(--color-blue)',
    fontWeight: '700'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  dropdownContainer: {
    position: 'relative'
  },
  dropdownBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: 'var(--bg-item)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-main)'
  },
  dropdownLabel: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '46px',
    right: 0,
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-lg)',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '160px',
    zIndex: 1000
  },
  dropdownItem: {
    padding: '8px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: 'var(--font-main)'
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'var(--color-red-light)',
    border: '1px solid var(--color-red-border)',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--color-red)'
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'var(--color-red)',
    borderRadius: '50%',
    display: 'inline-block'
  }
};

export default Header;