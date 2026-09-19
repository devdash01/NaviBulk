// SAIL NaviBulk — Transocean Editorial Enterprise Workstation Sidebar
// Deep Oceanic styling with authentic Transocean color palette, glass voyage card, luminous waypoint flow, and full Collapse/Expand support
import React, { useState } from 'react';
import { 
  PlusCircle, 
  RotateCcw,
  Compass, 
  Anchor, 
  ShieldCheck, 
  Home,
  Ship,
  Check,
  RefreshCw,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useDecisionEngine, STAGE_ORDER, STAGE_METADATA } from '../context/DecisionContext.jsx';

export default function Sidebar({ 
  activeTab,
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
  onOpenPortsModal, 
  onOpenMethodologyModal 
}) {
  const {
    inputs,
    activeStage,
    setActiveStage,
    stageStatuses,
    startNewDecision,
    resetToDemoDecision,
    recommendedVessel,
    baseDeliveredCost
  } = useDecisionEngine();

  const [hoveredStage, setHoveredStage] = useState(null);

  const destinationPortName = (inputs.destinationPortKey || 'paradip').toUpperCase();
  const landedRate = baseDeliveredCost?.totalLanded ? `$${baseDeliveredCost.totalLanded.toFixed(2)}/MT` : '$18.60/MT';

  return (
    <aside 
      className={`navibulk-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}
      style={{
        width: isCollapsed ? '64px' : '252px',
        minWidth: isCollapsed ? '64px' : '252px',
        background: 'radial-gradient(circle at 50% 0%, #13233D 0%, #0B1528 55%, #08101E 100%)',
        color: '#94A3B8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(56, 189, 248, 0.12)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        userSelect: 'none',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: '4px 0 24px rgba(2, 6, 23, 0.25)',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* ── TOP SCROLLABLE SECTION ── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* 1. BRAND HEADER WITH LOGO & COLLAPSE TRIGGER */}
        <div 
          style={{ 
            padding: isCollapsed ? '1rem 0.5rem' : '1.25rem 1.2rem 1rem', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.1) 0%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCollapsed ? 'center' : 'stretch'
          }}
        >
          {isCollapsed ? (
            /* COLLAPSED HEADER: Logo + Quick Expand Toggle */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
              <div 
                onClick={() => onSelectTab && onSelectTab('home')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(56, 189, 248, 0.3)'
                }}
                title="SAIL NaviBulk Overview"
              >
                <img 
                  src="/navibulk-logo.png" 
                  alt="Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>

              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  title="Expand Sidebar"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#38BDF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                  <PanelLeftOpen size={15} />
                </button>
              )}
            </div>
          ) : (
            /* EXPANDED HEADER: Full Logo, Brand Name & Collapse Button */
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div 
                  onClick={() => onSelectTab && onSelectTab('home')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                  title="Return to Transocean Editorial Homepage"
                >
                  {/* Logo with Indian flag micro-badge */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div 
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        padding: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(56, 189, 248, 0.3)'
                      }}
                    >
                      <img 
                        src="/navibulk-logo.png" 
                        alt="SAIL NaviBulk Logo" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }} 
                      />
                    </div>

                    {/* Tricolor Micro-Dot */}
                    <div 
                      title="Govt of India • Ministry of Steel"
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '1.5px solid #0B1528',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                      }}
                    >
                      <div style={{ height: '33.33%', background: '#FF9933' }} />
                      <div style={{ height: '33.33%', background: '#FFFFFF' }} />
                      <div style={{ height: '33.33%', background: '#138808' }} />
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '0.98rem', 
                      fontWeight: 800, 
                      color: '#F8FAFC', 
                      letterSpacing: '-0.02em', 
                      lineHeight: 1.15,
                      fontFamily: 'var(--font-sans)'
                    }}>
                      SAIL NaviBulk
                    </div>
                    <div style={{ 
                      fontSize: '0.62rem', 
                      color: '#38BDF8', 
                      letterSpacing: '0.06em', 
                      fontWeight: 700,
                      textTransform: 'uppercase', 
                      marginTop: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <span>MARITIME INTEL</span>
                      <span style={{ color: '#475569' }}>•</span>
                      <span style={{ color: '#94A3B8' }}>DECISION DSS</span>
                    </div>
                  </div>
                </div>

                {/* Collapse Button inside Expanded Header */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    title="Collapse Sidebar"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#F8FAFC';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#64748B';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <PanelLeftClose size={16} />
                  </button>
                )}
              </div>

              {/* Quick Portal Switcher (Overview vs Decision Desk) */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '0.35rem', 
                  background: 'rgba(11, 21, 40, 0.75)', 
                  padding: '0.25rem', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(56, 189, 248, 0.15)',
                  marginTop: '0.9rem' 
                }}
              >
                <button
                  onClick={() => onSelectTab && onSelectTab('home')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    background: activeTab === 'home' ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'transparent',
                    color: activeTab === 'home' ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '0.42rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: activeTab === 'home' ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Home size={12} />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => onSelectTab && onSelectTab('decision')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    background: activeTab === 'decision' ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'transparent',
                    color: activeTab === 'decision' ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '0.42rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: activeTab === 'decision' ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Compass size={12} />
                  <span>Decision Desk</span>
                </button>
              </div>

              {/* + New Decision Button & Reset Benchmark */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.55rem' }}>
                <button
                  onClick={() => {
                    startNewDecision();
                    if (onSelectTab) onSelectTab('decision');
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '0.52rem 0.65rem',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 3px 12px rgba(37, 99, 235, 0.4)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1D4ED8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <PlusCircle size={13} />
                  <span>New Decision</span>
                </button>

                <button
                  onClick={() => {
                    resetToDemoDecision();
                    if (onSelectTab) onSelectTab('decision');
                  }}
                  title="Reset to Australia → Paradip Benchmark Demo"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#94A3B8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '0.52rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#94A3B8';
                  }}
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 2. TACTICAL DISPATCH VOYAGE CARD (Visible when Expanded) */}
        {!isCollapsed && (
          <div 
            style={{ 
              padding: '0.9rem 1.15rem', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(145deg, rgba(19, 35, 61, 0.8) 0%, rgba(11, 21, 40, 0.9) 100%)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ 
                fontSize: '0.62rem', 
                fontWeight: 800, 
                color: '#38BDF8', 
                letterSpacing: '0.08em', 
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Ship size={12} color="#38BDF8" />
                VOYAGE MANDATE
              </span>
              <span 
                style={{ 
                  fontSize: '0.61rem', 
                  fontFamily: 'var(--font-mono)', 
                  color: '#10B981', 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  border: '1px solid rgba(16, 185, 129, 0.35)', 
                  padding: '0.1rem 0.4rem', 
                  borderRadius: '9999px',
                  fontWeight: 700 
                }}
              >
                ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
                {inputs.tonnage.toLocaleString()} MT
              </div>
              <div style={{ fontSize: '0.76rem', color: '#38BDF8', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {landedRate}
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#CBD5E1', fontWeight: 600, marginTop: '0.1rem' }}>
              {inputs.cargoType}
            </div>

            {/* Nautical Corridor Path */}
            <div 
              style={{ 
                marginTop: '0.6rem', 
                padding: '0.5rem 0.65rem', 
                background: 'rgba(4, 9, 20, 0.6)', 
                borderRadius: '8px', 
                border: '1px solid rgba(56, 189, 248, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981', flexShrink: 0 }} />
                <span style={{ color: '#F1F5F9', fontWeight: 600 }}>
                  {inputs.originCountry}
                </span>
              </div>

              <div style={{ 
                marginLeft: '2.5px', 
                height: '8px', 
                borderLeft: '1px dashed rgba(56, 189, 248, 0.35)' 
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 6px #38BDF8', flexShrink: 0 }} />
                <span style={{ color: '#F1F5F9', fontWeight: 600 }}>
                  {destinationPortName} PORT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. DECISION STAGE WAYPOINT RAIL */}
        <div style={{ padding: isCollapsed ? '0.75rem 0.35rem' : '0.95rem 0.75rem 1.25rem' }}>
          {!isCollapsed && (
            <div 
              style={{ 
                padding: '0 0.45rem 0.65rem', 
                fontSize: '0.62rem', 
                fontWeight: 800, 
                color: '#64748B', 
                letterSpacing: '0.08em', 
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>DECISION WORKFLOW</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#38BDF8' }}>10 STAGES</span>
            </div>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative', alignItems: isCollapsed ? 'center' : 'stretch' }}>
            
            {/* Ambient Waypoint Rail Track Line (Only when expanded) */}
            {!isCollapsed && (
              <div 
                style={{
                  position: 'absolute',
                  left: '19px',
                  top: '12px',
                  bottom: '12px',
                  width: '1px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  zIndex: 0
                }} 
              />
            )}

            {STAGE_ORDER.map((stageId) => {
              const meta = STAGE_METADATA[stageId];
              const isCurrent = activeTab === 'decision' && activeStage === stageId;
              const status = stageStatuses[stageId] || 'not_started';
              const isHovered = hoveredStage === stageId;

              // Waypoint Node Presentation
              let nodeContent = null;
              let nodeBg = '#1E293B';
              let nodeBorder = 'rgba(255, 255, 255, 0.15)';
              let nodeColor = '#64748B';

              if (isCurrent) {
                nodeBg = '#2563EB';
                nodeBorder = '#38BDF8';
                nodeColor = '#FFFFFF';
                nodeContent = (
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />
                );
              } else if (status === 'requires_reanalysis') {
                nodeBg = 'rgba(245, 158, 11, 0.2)';
                nodeBorder = '#F59E0B';
                nodeColor = '#F59E0B';
                nodeContent = <RefreshCw size={8} />;
              } else if (status === 'analyzed') {
                nodeBg = 'rgba(16, 185, 129, 0.2)';
                nodeBorder = '#10B981';
                nodeColor = '#10B981';
                nodeContent = <Check size={9} strokeWidth={3} />;
              } else {
                nodeContent = (
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#475569' }} />
                );
              }

              if (isCollapsed) {
                // COLLAPSED BUTTON: Compact circular pill node with tooltip
                return (
                  <button
                    key={stageId}
                    onClick={() => {
                      if (onSelectTab) onSelectTab('decision');
                      setActiveStage(stageId);
                    }}
                    title={`Stage ${meta.num}: ${meta.title} (${status.toUpperCase()})`}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      border: isCurrent 
                        ? '1.5px solid #38BDF8' 
                        : '1px solid transparent',
                      background: isCurrent 
                        ? 'rgba(37, 99, 235, 0.35)' 
                        : 'transparent',
                      color: isCurrent ? '#FFFFFF' : '#94A3B8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 800, color: isCurrent ? '#38BDF8' : '#CBD5E1' }}>
                      {meta.num}
                    </span>
                    <span 
                      style={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        background: status === 'analyzed' ? '#10B981' : status === 'requires_reanalysis' ? '#F59E0B' : isCurrent ? '#38BDF8' : '#475569',
                        marginTop: '2px'
                      }} 
                    />
                  </button>
                );
              }

              // EXPANDED BUTTON
              return (
                <button
                  key={stageId}
                  onClick={() => {
                    if (onSelectTab) onSelectTab('decision');
                    setActiveStage(stageId);
                  }}
                  onMouseEnter={() => setHoveredStage(stageId)}
                  onMouseLeave={() => setHoveredStage(null)}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.45rem 0.55rem',
                    borderRadius: '8px',
                    border: isCurrent 
                      ? '1px solid rgba(56, 189, 248, 0.5)' 
                      : isHovered 
                      ? '1px solid rgba(255, 255, 255, 0.1)' 
                      : '1px solid transparent',
                    background: isCurrent 
                      ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 100%)' 
                      : isHovered 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'transparent',
                    color: isCurrent ? '#FFFFFF' : status === 'analyzed' ? '#E2E8F0' : status === 'requires_reanalysis' ? '#FCD34D' : '#94A3B8',
                    fontSize: '0.78rem',
                    fontWeight: isCurrent ? 800 : 500,
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {/* Waypoint Circular Node on Rail */}
                  <div 
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: nodeBg,
                      border: `1.5px solid ${nodeBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: nodeColor,
                      flexShrink: 0,
                      boxShadow: isCurrent ? '0 0 10px rgba(56, 189, 248, 0.8)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {nodeContent}
                  </div>

                  {/* Stage Monospace Number */}
                  <span 
                    style={{ 
                      fontSize: '0.7rem', 
                      color: isCurrent ? '#38BDF8' : '#64748B', 
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      width: '17px'
                    }}
                  >
                    {meta.num}
                  </span>

                  {/* Stage Title */}
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {meta.shortTitle || meta.title}
                  </span>

                  {/* Active Indicator Micro-Dot */}
                  {isCurrent && (
                    <span 
                      style={{ 
                        width: '5px', 
                        height: '5px', 
                        borderRadius: '50%', 
                        background: '#38BDF8',
                        boxShadow: '0 0 8px #38BDF8' 
                      }} 
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* ── BOTTOM SECTION: OPERATIONAL ASSETS & ENGINE TELEMETRY ── */}
      <div 
        style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
          padding: isCollapsed ? '0.75rem 0.4rem' : '0.85rem 0.85rem',
          background: 'linear-gradient(180deg, transparent 0%, rgba(4, 9, 20, 0.7) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'stretch'
        }}
      >
        {!isCollapsed && (
          <div 
            style={{ 
              padding: '0 0.4rem 0.4rem', 
              fontSize: '0.61rem', 
              fontWeight: 800, 
              color: '#64748B', 
              letterSpacing: '0.08em', 
              textTransform: 'uppercase' 
            }}
          >
            MARITIME ASSETS
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%', alignItems: isCollapsed ? 'center' : 'stretch' }}>
          <button
            onClick={onOpenPortsModal}
            title="Port Operations Matrix"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '0.5rem' : '0.45rem 0.6rem',
              background: activeTab === 'ports' ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
              border: activeTab === 'ports' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              borderRadius: '8px',
              color: activeTab === 'ports' ? '#FFFFFF' : '#94A3B8',
              fontSize: '0.75rem',
              fontWeight: activeTab === 'ports' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'ports') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'ports') e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Anchor size={14} color={activeTab === 'ports' ? '#38BDF8' : '#64748B'} />
              {!isCollapsed && <span>Port Infrastructure</span>}
            </div>
            {!isCollapsed && (
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                12 Terminals
              </span>
            )}
          </button>

          <button
            onClick={onOpenMethodologyModal}
            title="Methodology & Audit Dossier"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '0.5rem' : '0.45rem 0.6rem',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '8px',
              color: '#94A3B8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <ShieldCheck size={14} color="#2563EB" />
              {!isCollapsed && <span>Methodology & Audit</span>}
            </div>
            {!isCollapsed && <ArrowUpRight size={12} color="#64748B" />}
          </button>
        </div>

        {/* Real-time Engine Telemetry */}
        <div 
          style={{ 
            marginTop: '0.75rem', 
            paddingTop: '0.65rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            fontSize: '0.68rem',
            width: '100%'
          }}
          title="Decision Engine V2: Synchronized"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span 
              style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#10B981', 
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.9)',
                display: 'inline-block' 
              }} 
            />
            {!isCollapsed && (
              <span style={{ color: '#F1F5F9', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                DECISION ENGINE V2
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span style={{ color: '#38BDF8', fontSize: '0.62rem', letterSpacing: '0.04em', fontWeight: 600 }}>
              SYNCHRONIZED
            </span>
          )}
        </div>
      </div>

    </aside>
  );
}
