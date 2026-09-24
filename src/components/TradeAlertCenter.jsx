// SAIL NaviBulk — Live Maritime Trade Intelligence & Push Alert Radar
// Enterprise Maritime Aesthetic matching NaviBulk Decision Engine (Clean, High-Contrast, Institutional)
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Wind, 
  Anchor, 
  Fuel, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  Radio, 
  Compass,
  RefreshCw,
  Zap,
  Sliders,
  Layers,
  Activity,
  Check
} from 'lucide-react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';

// Baseline fallback alerts in case network is disconnected
const FALLBACK_TRADE_ALERTS = [
  {
    id: 'alert_red_sea_houthi',
    category: 'geopolitical',
    categoryLabel: 'Geopolitical & Conflict',
    severity: 'CRITICAL',
    title: 'UKMTO / JWC Red Sea Drone Interdiction Advisory #042',
    timestamp: '12 mins ago',
    source: 'Joint War Committee (JWC) & UKMTO',
    sourceUrl: 'https://www.bimco.org/contracts-and-clauses',
    corridorTag: 'USA East Coast → India (Trans-Suez Corridor)',
    summary: 'Commercial bulk carrier targeted near Bab-el-Mandeb. UKMTO instructs dry bulk charterers to suspend southern Red Sea transits. War risk insurance surcharges escalated to 1.25% of hull value ($380,000+ per transit).',
    quantifiedImpact: {
      costPerMt: '+$4.20 / MT (War risk premium if transiting Suez)',
      transitDays: '+11.5 Steaming Days (Cape Diversion)',
      bunkerImpact: '+$146,000 USD (3,450 NM added distance)',
      contractRecommendation: 'Forces Spot → COA Switch to dampen war shocks'
    },
    actionTaken: 'NaviBulk automated routing engine locks Cape of Good Hope diversion, reducing war risk surcharge to $0.',
    appliedPreset: 'cape_reroute',
    isLive: false
  },
  {
    id: 'alert_bob_cyclone_depression',
    category: 'weather',
    categoryLabel: 'Meteorological & Swell',
    severity: 'ELEVATED',
    title: 'IMD Deep Depression Warning: North Bay of Bengal Cyclone Wave Swell',
    timestamp: '28 mins ago',
    source: 'India Meteorological Department (IMD) Cyclone Warning Division',
    sourceUrl: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1767354',
    corridorTag: 'Bay of Bengal Approaches (Paradip / Dhamra / Haldia)',
    summary: 'Deep depression tracking northwestward across central Bay of Bengal. Sustained wave swell forecast at 3.8m–4.5m over next 72 hours. Paradip Port Authority hoisted Local Cautionary Signal LC-3.',
    quantifiedImpact: {
      costPerMt: '+$1.85 / MT Demurrage Risk Buffer',
      transitDays: '+2.5 Days Pilotage Suspension Queue',
      bunkerImpact: 'Conserves 35 MT VLSFO via Eco-Steaming Pacing',
      contractRecommendation: 'Injects BIMCO Virtual Arrival 2011 Laycan Rider'
    },
    actionTaken: 'BIMCO Virtual Arrival activated: vessel eco-steams at 11.5 kn, pacing arrival behind the storm peak while legally preserving Notice of Readiness (NOR).',
    appliedPreset: 'monsoon_gale',
    isLive: false
  },
  {
    id: 'alert_paradip_dredging_update',
    category: 'port',
    categoryLabel: 'Port Bathymetry & Draft',
    severity: 'POSITIVE',
    title: 'Paradip Port Circular 750: Channel Silt Clearance Complete',
    timestamp: '1 hour ago',
    source: 'Paradip Port Authority (PPA) Marine Department',
    sourceUrl: 'https://www.paradipport.gov.in/BerthingPolicy.aspx',
    corridorTag: 'Paradip Central Berths CB-1 & CB-2',
    summary: 'Trailing suction hopper dredging (TSHD) at Mahanadi river approach successfully restored declared high-water draft to 14.50m. Fully laden Panamaxes (up to 75,000 MT) approved for direct daylight berthing.',
    quantifiedImpact: {
      costPerMt: '-$3.80 / MT (100% Lightering Avoided)',
      transitDays: '-3.5 Days (Zero Transshipment Wait)',
      bunkerImpact: '$0 Additional Offloading Expense',
      contractRecommendation: 'Qualifies Direct Panamax Berthing over Sandheads Barging'
    },
    actionTaken: 'NaviBulk removes lightering penalty for vessels with arrival draft <= 14.15m (+0.35m safety cushion), saving $266,000 USD on 70k MT fixture.',
    appliedPreset: null,
    isLive: false
  },
  {
    id: 'alert_bunker_vlsfo_spike',
    category: 'market',
    categoryLabel: 'Bunker & Energy Shift',
    severity: 'ELEVATED',
    title: 'Ship & Bunker G20 VLSFO Price Surges +$24.50/MT to $854.00/MT',
    timestamp: '2 hours ago',
    source: 'Ship & Bunker Global 20 Ports Average (G20 Benchmark)',
    sourceUrl: 'https://shipandbunker.com/prices/av/global/av-g20-global-20-ports-average',
    corridorTag: 'Global Steaming & Bunkering (Singapore / Colombo / Durban)',
    summary: 'Crude market volatility driven by Middle East tanker freight escalations pushed low-sulphur marine fuel (VLSFO) up +$24.50/MT across Asian bunkering hubs. High-speed steaming penalized.',
    quantifiedImpact: {
      costPerMt: '+$0.62 / MT on Standard 14.0 kn Cruise',
      transitDays: '0 Days (Speed Optimization Applied)',
      bunkerImpact: '+$19,600 USD Fuel Burn at Full Speed',
      contractRecommendation: 'Derates Steaming Speed to 12.2 kn (Eco-Hydrodynamic Curve)'
    },
    actionTaken: 'Dynamic speed scheduler adjusted optimal steaming speed from 14.0 kn down to 12.2 kn, saving 14% on total voyage bunker burn.',
    appliedPreset: 'bunker_escalation',
    isLive: false
  }
];

export default function TradeAlertCenter({ isOpen, onClose }) {
  const { applyStressPreset, setActiveStage } = useDecisionEngine();
  const [alerts, setAlerts] = useState(FALLBACK_TRADE_ALERTS);
  const [oceanTelemetry, setOceanTelemetry] = useState({
    paradip: { name: 'Paradip Port', wave_height: 1.2, swell_height: 1.0, wave_direction: 168, status: 'OPTIMAL' },
    vizag: { name: 'Visakhapatnam', wave_height: 0.9, swell_height: 0.9, wave_direction: 172, status: 'OPTIMAL' },
    haldia: { name: 'Haldia Dock', wave_height: 0.2, swell_height: 0.2, wave_direction: 177, status: 'DRAFT_GATED' }
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [appliedAlertId, setAppliedAlertId] = useState(null);
  const [alertFeedback, setAlertFeedback] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(null);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(45);
  const [isLiveOnline, setIsLiveOnline] = useState(true);

  // Fetch real-time live alerts from backend
  const fetchLiveAlerts = useCallback(async (manual = false) => {
    setIsRefreshing(true);
    try {
      const resp = await fetch('http://localhost:8000/api/alerts/live', {
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts);
          if (data.ocean_telemetry) {
            setOceanTelemetry(data.ocean_telemetry);
          }
          setIsLiveOnline(true);
          const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
          setLastRefreshedTime(nowStr);
          if (manual) {
            setAlertFeedback(`Updated ${data.total_alerts || data.alerts.length} live maritime intelligence items & satellite buoy telemetry.`);
            setTimeout(() => setAlertFeedback(null), 3500);
          }
        }
      } else {
        setIsLiveOnline(false);
      }
    } catch (err) {
      console.warn('Backend live alert endpoint unavailable, using offline fallback telemetry.', err);
      setIsLiveOnline(false);
    } finally {
      setIsRefreshing(false);
      setAutoRefreshCountdown(45);
    }
  }, []);

  // Mount & countdown timer
  useEffect(() => {
    if (isOpen) {
      fetchLiveAlerts();
    }
  }, [isOpen, fetchLiveAlerts]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setAutoRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveAlerts();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, fetchLiveAlerts]);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const handleApplyImpact = (alert) => {
    if (alert.appliedPreset) {
      applyStressPreset(alert.appliedPreset);
      setAppliedAlertId(alert.id);
      setAlertFeedback(`Applied "${alert.title.slice(0, 48)}..." to active decision model. Re-evaluating 10-Stage Funnel...`);
      setTimeout(() => {
        setAlertFeedback(null);
      }, 5000);
    } else {
      setAlertFeedback(`Operational rule verified: ${alert.actionTaken}`);
      setTimeout(() => {
        setAlertFeedback(null);
      }, 4500);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '1040px',
          maxHeight: '90vh',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#0F172A',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* 1. TOP HEADER: DEEP NAVY INSTITUTIONAL BAR */}
        {/* ============================================================ */}
        <div 
          style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(90deg, #0B1528 0%, #111C30 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8'
              }}
            >
              <Radio size={20} className="pulse-slow" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  SAIL NAVIBULK 26006
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em', margin: 0, color: '#FFFFFF' }}>
                  Live Maritime Trade Intelligence Radar
                </h2>
                <span 
                  style={{
                    background: isLiveOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    border: `1px solid ${isLiveOnline ? '#10B981' : '#F59E0B'}`,
                    color: isLiveOnline ? '#34D399' : '#FBBF24',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLiveOnline ? '#10B981' : '#F59E0B' }} />
                  {isLiveOnline ? 'LIVE STREAM ACTIVE' : 'CACHED BASELINE'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.2rem 0 0' }}>
                Open-Meteo live satellite wave telemetry • Real-time gCaptain &amp; Hellenic feeds • Dynamic chartering impact quantification
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Auto Refresh Counter & Manual Refresh */}
            <button 
              onClick={() => fetchLiveAlerts(true)}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: isRefreshing ? 'wait' : 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Click to query live ocean satellites and news feeds immediately"
            >
              <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isRefreshing ? 'Polling Satellites...' : `Auto-refresh in ${autoRefreshCountdown}s`}</span>
            </button>

            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0.45rem',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              aria-label="Close radar modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. SATELLITE OCEAN TELEMETRY STRIP (HIGH CONTRAST) */}
        {/* ============================================================ */}
        <div 
          style={{
            padding: '0.75rem 1.75rem',
            background: '#F1F5F9',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem' }}>
            <Activity size={15} color="#0284C7" />
            <strong style={{ color: '#0F172A', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              Live East Coast Port Swell Telemetry:
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.35rem', flexWrap: 'wrap' }}>
            {/* Paradip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem' }}>
              <span style={{ color: '#334155', fontWeight: 700 }}>Paradip:</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#15803D' }}>
                {oceanTelemetry?.paradip?.wave_height ? `${oceanTelemetry.paradip.wave_height}m` : '1.20m'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                ({oceanTelemetry?.paradip?.wave_direction || 168}° Swell)
              </span>
              <span style={{ padding: '0.12rem 0.45rem', borderRadius: '4px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', fontSize: '0.66rem', fontWeight: 800 }}>
                OPTIMAL
              </span>
            </div>

            {/* Vizag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem' }}>
              <span style={{ color: '#334155', fontWeight: 700 }}>Vizag (VGCB):</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#0369A1' }}>
                {oceanTelemetry?.vizag?.wave_height ? `${oceanTelemetry.vizag.wave_height}m` : '0.94m'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                ({oceanTelemetry?.vizag?.wave_direction || 172}°)
              </span>
              <span style={{ padding: '0.12rem 0.45rem', borderRadius: '4px', background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', fontSize: '0.66rem', fontWeight: 800 }}>
                18.1m CAPESIZE OK
              </span>
            </div>

            {/* Haldia */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem' }}>
              <span style={{ color: '#334155', fontWeight: 700 }}>Haldia / Sagar:</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#B45309' }}>
                {oceanTelemetry?.haldia?.wave_height ? `${oceanTelemetry.haldia.wave_height}m` : '0.22m'}
              </span>
              <span style={{ padding: '0.12rem 0.45rem', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', fontSize: '0.66rem', fontWeight: 800 }}>
                8.8m DRAFT GATED
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE ACTION FEEDBACK BANNER */}
        {/* ============================================================ */}
        {alertFeedback && (
          <div 
            style={{
              background: '#ECFDF5',
              borderBottom: '1px solid #A7F3D0',
              padding: '0.75rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              fontSize: '0.82rem',
              color: '#065F46',
              fontWeight: 700
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{alertFeedback}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                if (setActiveStage) setActiveStage(6);
              }}
              style={{
                background: '#059669',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
              }}
            >
              <span>Inspect Stage 06</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. CATEGORY FILTER BAR */}
        {/* ============================================================ */}
        <div 
          style={{
            padding: '0.75rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            background: '#FFFFFF'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginRight: '0.4rem', letterSpacing: '0.04em' }}>
            Filter Feed:
          </span>
          {[
            { id: 'all', label: `All Alerts (${alerts.length})` },
            { id: 'geopolitical', label: 'Geopolitical & Chokepoints' },
            { id: 'weather', label: 'Meteorological & Swell' },
            { id: 'port', label: 'Port Bathymetry & Berths' },
            { id: 'market', label: 'Bunker & Freight Volatility' }
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  background: isActive ? '#2563EB' : '#F8FAFC',
                  color: isActive ? '#FFFFFF' : '#475569',
                  border: `1px solid ${isActive ? '#2563EB' : '#CBD5E1'}`,
                  borderRadius: '6px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 4. ALERTS STREAM BODY (CLEAN HIGH CONTRAST CARDS) */}
        {/* ============================================================ */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: '#F8FAFC'
          }}
        >
          {filteredAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B' }}>
              <Compass size={40} style={{ margin: '0 auto 0.85rem', opacity: 0.5 }} color="#94A3B8" />
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>No active advisories in this category.</p>
            </div>
          ) : (
            filteredAlerts.map((item) => {
              const isApplied = appliedAlertId === item.id;
              
              // High-contrast severity badge styling
              let badgeBg = '#F1F5F9';
              let badgeBorder = '#CBD5E1';
              let badgeColor = '#475569';
              if (item.severity === 'CRITICAL') {
                badgeBg = '#FEE2E2';
                badgeBorder = '#FECACA';
                badgeColor = '#B91C1C';
              } else if (item.severity === 'ELEVATED') {
                badgeBg = '#FEF3C7';
                badgeBorder = '#FDE68A';
                badgeColor = '#B45309';
              } else if (item.severity === 'POSITIVE') {
                badgeBg = '#DCFCE7';
                badgeBorder = '#BBF7D0';
                badgeColor = '#15803D';
              } else if (item.severity === 'NOTICE') {
                badgeBg = '#EFF6FF';
                badgeBorder = '#BFDBFE';
                badgeColor = '#1D4ED8';
              }

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${isApplied ? '#10B981' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.95rem',
                    boxShadow: isApplied ? '0 0 0 2px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(16, 185, 129, 0.1)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Item Metadata Top Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span 
                        style={{
                          background: badgeBg,
                          border: `1px solid ${badgeBorder}`,
                          color: badgeColor,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}
                      >
                        {item.severity}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#CBD5E1' }}>•</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', letterSpacing: '0.01em' }}>
                        {item.source}
                      </span>
                      {item.isLive && (
                        <span style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', fontSize: '0.64rem', fontWeight: 800, padding: '0.12rem 0.45rem', borderRadius: '4px' }}>
                          LIVE TELEMETRY
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
                      <Clock size={13} color="#94A3B8" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>

                  {/* Headline & Corridor Tag */}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem', lineHeight: 1.45 }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#B45309', fontWeight: 700 }}>
                      <Compass size={14} color="#B45309" />
                      <span>Corridor: {item.corridorTag}</span>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <p style={{ fontSize: '0.86rem', color: '#334155', margin: 0, lineHeight: 1.6 }}>
                    {item.summary}
                  </p>

                  {/* ============================================================ */}
                  {/* QUANTIFIED IMPACT MATRIX (4 HIGH-CONTRAST TILES) */}
                  {/* ============================================================ */}
                  <div 
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '1rem 1.15rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Cost Impact */}
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.04em' }}>
                        <TrendingUp size={12} color="#DC2626" />
                        <span>Delivered Cost ($/MT)</span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: item.quantifiedImpact.costPerMt.startsWith('+') ? '#DC2626' : '#16A34A', fontFamily: "'JetBrains Mono', monospace", marginTop: '0.25rem' }}>
                        {item.quantifiedImpact.costPerMt}
                      </div>
                    </div>

                    {/* Transit / Laytime */}
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.04em' }}>
                        <Clock size={12} color="#D97706" />
                        <span>Transit &amp; Port Laytime</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", marginTop: '0.25rem' }}>
                        {item.quantifiedImpact.transitDays}
                      </div>
                    </div>

                    {/* Bunker / Carbon */}
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.04em' }}>
                        <Fuel size={12} color="#B45309" />
                        <span>Bunker &amp; Energy Exposure</span>
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
                        {item.quantifiedImpact.bunkerImpact}
                      </div>
                    </div>

                    {/* Strategy Recommendation */}
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.04em' }}>
                        <Zap size={12} color="#2563EB" />
                        <span>Fixture Strategy Shift</span>
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1D4ED8', marginTop: '0.25rem' }}>
                        {item.quantifiedImpact.contractRecommendation}
                      </div>
                    </div>
                  </div>

                  {/* NaviBulk Action Note */}
                  <div 
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #DBEAFE',
                      borderRadius: '8px',
                      padding: '0.65rem 0.95rem',
                      fontSize: '0.78rem',
                      color: '#1E40AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <CheckCircle2 size={15} color="#2563EB" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#1E3A8A' }}>NaviBulk Action:</strong> {item.actionTaken}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.35rem' }}>
                    {item.sourceUrl && (
                      <a 
                        href={item.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#334155',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Official Dispatch</span>
                        <ExternalLink size={13} />
                      </a>
                    )}

                    <button
                      onClick={() => handleApplyImpact(item)}
                      style={{
                        background: isApplied ? '#10B981' : '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.45rem 1rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        boxShadow: isApplied ? '0 2px 8px rgba(16, 185, 129, 0.4)' : '0 2px 8px rgba(37, 99, 235, 0.35)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isApplied ? (
                        <>
                          <Check size={14} />
                          <span>Injected in Model</span>
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          <span>Simulate &amp; Re-Evaluate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ============================================================ */}
        {/* 5. MODAL FOOTER */}
        {/* ============================================================ */}
        <div 
          style={{
            padding: '0.85rem 1.75rem',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.76rem',
            color: '#64748B'
          }}
        >
          <div>
            Surveillance Feeds: Open-Meteo In-Situ Buoy Matrix • UKMTO / JWC Marine Warnings • gCaptain RSS • CVC &amp; CAG Fixture Trail
          </div>
          <div>
            Last Polled: <strong style={{ color: '#0F172A' }}>{lastRefreshedTime || 'Real-time telemetry stream active'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
