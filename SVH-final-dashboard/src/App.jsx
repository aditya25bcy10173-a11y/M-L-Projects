import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SituationOverview from './components/SituationOverview';
import ModuleNavigation from './components/ModuleNavigation';
import InteractiveMap from './components/InteractiveMap';
import StatsAndCharts from './components/StatsAndCharts';
import LiveAlerts from './components/LiveAlerts';
import BottomMetrics from './components/BottomMetrics';
import { translations } from './utils/translations';

const App = () => {
  // Language State
  const [language, setLanguage] = useState('en');
  const t = translations[language] || translations.en;

  // Navigation Module State
  const [activeModule, setActiveModule] = useState('dashboard');
  
  // Refresh loading state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map Filter Toggles State
  const [mapFilters, setMapFilters] = useState({
    entryPoints: true,
    exitPoints: true,
    highDensity: true,
    cctv: true
  });

  // Situation Statistics State
  const [stats, setStats] = useState({
    systemStatus: 'Operational',
    currentCrowd: 42318,
    todayVisitors: 285642,
    capacityUsed: 68,
    entryCount: 23842,
    exitCount: 21524,
    activeZones: { current: 12, total: 25 },
    activeAlertsCount: 7,
    policeDeployed: 18,
    weatherImpact: 'Moderate',
    aiConfidence: 96.8,
    lastUpdated: '10:24 AM'
  });

  // Live Alerts State
  const [alerts] = useState([
    {
      id: 'a1',
      title: 'High Crowd Density',
      location: 'Near Vaikuntha Queue Complex',
      time: '10:20 AM',
      type: 'critical'
    },
    {
      id: 'a2',
      title: 'Slow Movement Detected',
      location: 'Alipiri Main Road',
      time: '10:15 AM',
      type: 'warning'
    },
    {
      id: 'a3',
      title: 'Capacity Threshold 80%',
      location: 'Zone 3 - Main Temple Area',
      time: '10:10 AM',
      type: 'warning'
    },
    {
      id: 'a4',
      title: 'Traffic Congestion',
      location: 'Tirupati Bypass Road',
      time: '10:05 AM',
      type: 'info-traffic'
    },
    {
      id: 'a5',
      title: 'Weather Advisory',
      location: 'Moderate Rain Expected',
      time: '10:00 AM',
      type: 'info-weather'
    }
  ]);

  // Bottom sparkline metrics state
  const [bottomMetrics, setBottomMetrics] = useState({
    todayVisitors: 285642,
    visitorsChange: '12.6',
    peakTime: '12:00 PM - 2:00 PM',
    predictionAccuracy: 96.8,
    accuracyChange: '3.2',
    highRiskZones: 3,
    riskZonesChange: '2',
    emergencyAlerts: 7,
    alertsChange: '1',
    avgWaitingTime: 32,
    waitingTimeChange: '8'
  });

  // Charts data state
  const [chartsData, setChartsData] = useState({
    crowdTrend: [
      { time: '12 AM', visitors: 10000 },
      { time: '4 AM', visitors: 15000 },
      { time: '8 AM', visitors: 32000 },
      { time: '12 PM', visitors: 42318 },
      { time: '4 PM', visitors: 35000 },
      { time: '8 PM', visitors: 28000 },
      { time: '12 AM', visitors: 12000 }
    ],
    predictionVsActual: [
      { time: '12 AM', predicted: 12000, actual: 10000 },
      { time: '4 AM', predicted: 14000, actual: 15000 },
      { time: '8 AM', predicted: 30000, actual: 32000 },
      { time: '12 PM', predicted: 40000, actual: 42318 },
      { time: '4 PM', predicted: 38000, actual: 35000 },
      { time: '8 PM', predicted: 26000, actual: 28000 },
      { time: '12 AM', predicted: 10000, actual: 12000 }
    ],
    hourlyVisitors: [
      { time: '12 AM', visitors: 2000 },
      { time: '2 AM', visitors: 1200 },
      { time: '4 AM', visitors: 3500 },
      { time: '6 AM', visitors: 8000 },
      { time: '8 AM', visitors: 15000 },
      { time: '10 AM', visitors: 24000 },
      { time: '12 PM', visitors: 28000 },
      { time: '2 PM', visitors: 22000 },
      { time: '4 PM', visitors: 19000 },
      { time: '6 PM', visitors: 23000 },
      { time: '8 PM', visitors: 17000 },
      { time: '10 PM', visitors: 10000 }
    ],
    trafficFlow: [
      { time: '12 AM', vehicles: 450 },
      { time: '4 AM', vehicles: 300 },
      { time: '8 AM', vehicles: 950 },
      { time: '12 PM', vehicles: 1200 },
      { time: '4 PM', vehicles: 1100 },
      { time: '8 PM', vehicles: 850 },
      { time: '12 AM', vehicles: 500 }
    ]
  });

  // Clock format logic helper for current time refresh
  const getCurrentTimeFormatted = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Click handler for alerts to pan the map
  const handleAlertClick = (alertItem) => {
    alert(`Alert details: ${alertItem.title} - Location: ${alertItem.location}. Camera feed active.`);
    // Focus map filter to show CCTV / Alerts
    setMapFilters(prev => ({
      ...prev,
      highDensity: true,
      cctv: true
    }));
  };

  // Refresh handler to randomize stats slightly for demonstration
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Small random variations
      const crowdDiff = Math.floor(Math.random() * 800) - 400;
      const confidenceDiff = (Math.random() * 1.5 - 0.75).toFixed(1);
      const capacityDiff = Math.floor(Math.random() * 6) - 3;
      
      setStats(prev => ({
        ...prev,
        currentCrowd: prev.currentCrowd + crowdDiff,
        todayVisitors: prev.todayVisitors + Math.abs(crowdDiff * 2),
        capacityUsed: Math.max(40, Math.min(95, prev.capacityUsed + capacityDiff)),
        entryCount: prev.entryCount + Math.floor(Math.random() * 200),
        exitCount: prev.exitCount + Math.floor(Math.random() * 180),
        aiConfidence: Math.max(90, Math.min(99.9, parseFloat((prev.aiConfidence + parseFloat(confidenceDiff)).toFixed(1)))),
        lastUpdated: getCurrentTimeFormatted()
      }));

      // Also update bottom metrics
      setBottomMetrics(prev => ({
        ...prev,
        todayVisitors: prev.todayVisitors + Math.abs(crowdDiff * 2),
        predictionAccuracy: Math.max(90, Math.min(99.9, parseFloat((prev.predictionAccuracy + parseFloat(confidenceDiff)).toFixed(1)))),
        avgWaitingTime: Math.max(15, Math.min(90, prev.avgWaitingTime + Math.floor(Math.random() * 4) - 2))
      }));

      // Update charts data with new midday stats
      setChartsData(prev => {
        const updatedCrowdTrend = [...prev.crowdTrend];
        updatedCrowdTrend[3] = { ...updatedCrowdTrend[3], visitors: prev.crowdTrend[3].visitors + crowdDiff };
        
        const updatedPredictionVsActual = [...prev.predictionVsActual];
        updatedPredictionVsActual[3] = { ...updatedPredictionVsActual[3], actual: prev.predictionVsActual[3].actual + crowdDiff };

        return {
          ...prev,
          crowdTrend: updatedCrowdTrend,
          predictionVsActual: updatedPredictionVsActual
        };
      });

      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div style={styles.appContainer}>
      {/* Top Fixed Header */}
      <Header activeModule={activeModule} setActiveModule={setActiveModule} language={language} setLanguage={setLanguage} t={t} />
      
      {/* Main Bottom Section Layout */}
      <div style={styles.contentLayout}>
        {/* Left Sidebar */}
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} t={t} />

        {/* Scrollable Work Area */}
        <main style={styles.workArea}>
          {activeModule === 'dashboard' ? (
            <>

              {/* Situation Summary Grid */}
              <SituationOverview 
                stats={stats} 
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                t={t}
              />

              {/* Module Navigation Row */}
              <ModuleNavigation activeModule={activeModule} setActiveModule={setActiveModule} />

              {/* Mid-level grid containing Map, Stats, Charts & Alerts */}
              <div style={styles.middleGrid}>
                {/* Column 1: Map (65% width of grid row) */}
                <div style={styles.mapColumn}>
                  <InteractiveMap filters={mapFilters} setFilters={setMapFilters} />
                </div>

                {/* Column 2: Alerts (35% width of grid row) */}
                <div style={styles.alertsColumn}>
                  <LiveAlerts alerts={alerts} onAlertClick={handleAlertClick} />
                </div>
              </div>

              {/* Stats column combined with charts grid */}
              <StatsAndCharts stats={stats} chartsData={chartsData} t={t} />

              {/* Bottom sparkline metrics grid */}
              <BottomMetrics metrics={bottomMetrics} />

              {/* Bottom Footer */}
              <footer style={styles.footer}>
                <div style={styles.footerLeft}>{t.brandTitle} © 2026. All rights reserved.</div>
                <div style={{ ...styles.footerCenter, fontWeight: 'bold' }}>TEAM HELIOS</div>
                <div style={styles.footerRight}>Version 1.0.0</div>
              </footer>
            </>
          ) : (
            // Mock module details view
            <div style={styles.mockViewContainer}>
              <h2 style={styles.mockTitle}>
                {activeModule.toUpperCase().replace('-', ' ')}
              </h2>
              <p style={styles.mockSub}>
                The module <strong>{activeModule}</strong> is fully integrated into the backend architecture.
              </p>
              <button 
                className="back-btn"
                style={styles.backBtn}
                onClick={() => setActiveModule('dashboard')}
              >
                Back to Dashboard Overview
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  contentLayout: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 'calc(100vh - 76px)',
    marginTop: '76px', // Shift below header
  },
  workArea: {
    flex: 1,
    padding: '24px',
    backgroundColor: 'var(--bg-primary)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  middleGrid: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 1fr',
    gap: '20px',
    width: '100%',
  },
  mapColumn: {
    width: '100%',
  },
  alertsColumn: {
    width: '100%',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0 8px 0',
    borderTop: '1px solid #e2e8f0',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginTop: '12px',
  },
  footerLeft: {
    textAlign: 'left',
  },
  footerCenter: {
    textAlign: 'center',
  },
  footerRight: {
    textAlign: 'right',
  },
  mockViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '12px',
    textAlign: 'center',
  },
  mockTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--color-blue)',
  },
  mockSub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    maxWidth: '400px',
  },
  backBtn: {
    marginTop: '16px',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--color-blue)',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-main)',
    transition: 'opacity 0.2s ease',
  }
};

export default App;
