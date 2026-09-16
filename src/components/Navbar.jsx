// SAIL NaviBulk — Executive Oceanic Header
import React, { useState } from 'react';
import { 
  Home,
  Compass, 
  TrendingUp, 
  Database, 
  ShieldAlert, 
  RefreshCw, 
  History, 
  FileText,
  ChevronUp,
  ChevronDown,
  Ship,
  Sparkles
} from 'lucide-react';
import { BUNKER_PRICE_VLSFO, COMMODITY_PINK_SHEET, HISTORICAL_SERIES } from '../data/freightData';

export default function Navbar({ activeTab, setActiveTab, activeRiskCount, onOpenMethodologyModal }) {
  const [tickerExpanded, setTickerExpanded] = useState(true);

  const lastIdx = HISTORICAL_SERIES.dates.length - 1;
  const latestDate = HISTORICAL_SERIES.dates[lastIdx] || 'Feb 2026';

  const tickerData = {
    bci: HISTORICAL_SERIES.bci[lastIdx] || 24500,
    bpi: HISTORICAL_SERIES.bpi[lastIdx] || 16800,
    bsi: HISTORICAL_SERIES.bsi[lastIdx] || 14200,
    bhsi: HISTORICAL_SERIES.bhsi[lastIdx] || 11500,
    bunker: BUNKER_PRICE_VLSFO,
    coal: COMMODITY_PINK_SHEET.cokingCoal.priceUsdPerTonne,
    ore: COMMODITY_PINK_SHEET.ironOre.priceUsdPerTonne,
  };

  const navTabs = [
    { id: 'home', label: 'Command Home', icon: Home, sub: 'Strategic Overview' },
    { id: 'planner', label: 'Voyage Planner', icon: Compass, sub: 'Plan Shipment' },
    { id: 'ports', label: 'Port Clearance', icon: Database, sub: 'Check Water Depth' },
    { id: 'market', label: 'Market Timing', icon: TrendingUp, sub: 'Freight Rates' },
    { id: 'backhaul', label: 'Backhaul Savings', icon: RefreshCw, sub: 'Avoid Empty Legs' },
    { id: 'risks', label: 'Risk Radar', icon: ShieldAlert, sub: 'Weather & Delays', badge: activeRiskCount > 0 ? activeRiskCount : null },
    { id: 'counterfactual', label: 'Savings Proof', icon: History, sub: 'Historical Audit' },
  ];

  return (
    <header className="site-header" style={{ 
      boxShadow: '0 4px 20px rgba(2, 132, 199, 0.07)', 
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1.5px solid #BAE6FD'
    }}>
      {/* ── Slim Live Market Reference Strip in Daylight Light Blue ── */}
      <div className={`ticker-strip ${!tickerExpanded ? 'ticker-strip--collapsed' : ''}`} style={{ 
        background: '#F0F8FF', 
        borderBottom: '1px solid #E0EDF8',
        padding: '0.35rem 1.75rem'
      }}>
        <div className="ticker-strip-inner" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="ticker-strip-label" style={{ 
            color: '#0284C7', 
            fontWeight: 800, 
            fontSize: '0.7rem',
            background: '#E0F2FE',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            border: '1px solid #BAE6FD',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <Sparkles size={11} color="#0284C7" />
            BALTIC FREIGHT INDEX ({latestDate})
          </span>

          <div className="ticker-strip-items" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'nowrap' }}>
            <span className="ticker-strip-item" style={{ color: '#475569', fontSize: '0.76rem' }}>
              Capesize (BCI): <strong style={{ color: '#0F172A', fontWeight: 800 }}>${tickerData.bci.toLocaleString()}</strong>/d
            </span>
            <span className="ticker-strip-dot" style={{ color: '#CBD5E1' }}>•</span>
            <span className="ticker-strip-item" style={{ color: '#475569', fontSize: '0.76rem' }}>
              Panamax (BPI): <strong style={{ color: '#0F172A', fontWeight: 800 }}>${tickerData.bpi.toLocaleString()}</strong>/d
            </span>
            <span className="ticker-strip-dot" style={{ color: '#CBD5E1' }}>•</span>
            <span className="ticker-strip-item" style={{ color: '#475569', fontSize: '0.76rem' }}>
              Supramax (BSI): <strong style={{ color: '#0F172A', fontWeight: 800 }}>${tickerData.bsi.toLocaleString()}</strong>/d
            </span>
            <span className="ticker-strip-dot" style={{ color: '#CBD5E1' }}>•</span>
            <span className="ticker-strip-item" style={{ color: '#475569', fontSize: '0.76rem' }}>
              VLSFO Fuel: <strong style={{ color: '#0284C7', fontWeight: 800 }}>${tickerData.bunker}/t</strong>
            </span>
            <span className="ticker-strip-dot" style={{ color: '#CBD5E1' }}>•</span>
            <span className="ticker-strip-item" style={{ color: '#475569', fontSize: '0.76rem' }}>
              Coking Coal: <strong style={{ color: '#059669', fontWeight: 800 }}>${tickerData.coal}/t</strong>
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>
              SAIL RAW MATERIALS DIVISION
            </span>
            <button
              className="ticker-toggle-btn"
              onClick={() => setTickerExpanded(!tickerExpanded)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #BAE6FD',
                color: '#0284C7',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer'
              }}
              title="Toggle market ticker strip"
            >
              <span>{tickerExpanded ? 'Hide' : 'Show'}</span>
              {tickerExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Bar ── */}
      <div className="nav-bar" style={{ 
        padding: '0.7rem 1.75rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '1.25rem', 
        background: '#FFFFFF' 
      }}>
        {/* Brand & Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', flexShrink: 0 }}
          title="Return to Command Home"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 3px 12px rgba(2, 132, 199, 0.35)'
          }}>
            <Ship size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                SAIL NaviBulk
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 800, 
                padding: '0.15rem 0.5rem', 
                borderRadius: '6px', 
                background: '#E0F2FE', 
                color: '#0284C7',
                border: '1px solid #BAE6FD',
                fontFamily: 'var(--font-mono)'
              }}>
                COMMERCIAL DESK
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
              Steel Authority of India Limited • Maritime Chartering Intelligence
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs" style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', padding: '0.2rem 0' }}>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab-btn ${isActive ? 'nav-tab-btn--active' : ''}`}
                id={`nav-tab-${tab.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid #0284C7' : '1px solid #E2EEF8',
                  background: isActive ? '#E0F2FE' : '#F8FAFD',
                  color: isActive ? '#0284C7' : '#334155',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.18)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#0284C7' : '#64748B'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '10px',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    marginLeft: '0.2rem'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools: Audit Dossier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <button
            onClick={onOpenMethodologyModal}
            title="View technical models, formulas, and data audit"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem',
              background: '#F0F8FF', 
              border: '1.5px solid #BAE6FD',
              color: '#0284C7',
              borderRadius: '9px',
              padding: '0.5rem 0.95rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={15} color="#0284C7" />
            <span>Audit Dossier</span>
          </button>
        </div>
      </div>
    </header>
  );
}
