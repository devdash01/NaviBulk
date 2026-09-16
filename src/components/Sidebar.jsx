// SAIL NaviBulk — Enterprise Workstation Minimal Sidebar
// Width: 228px. Answers: Where am I? What decision am I working on? What stage am I at?
import React from 'react';
import { 
  PlusCircle, 
  RotateCcw,
  Compass, 
  Anchor, 
  ShieldCheck, 
  ExternalLink,
  Home
} from 'lucide-react';
import { useDecisionEngine, STAGE_ORDER, STAGE_METADATA } from '../context/DecisionContext.jsx';

export default function Sidebar({ 
  activeTab,
  onSelectTab,
  onOpenPortsModal, 
  onOpenMethodologyModal 
}) {
  const {
    inputs,
    activeStage,
    setActiveStage,
    stageStatuses,
    startNewDecision,
    resetToDemoDecision
  } = useDecisionEngine();

  return (
    <aside 
      className="navibulk-sidebar"
      style={{
        width: '232px',
        minWidth: '232px',
        background: 'var(--navy-sidebar, #0F172A)',
        color: '#94A3B8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid #1E293B',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        userSelect: 'none',
        overflowY: 'auto'
      }}
    >
      {/* ── TOP SECTION ── */}
      <div>
        
        {/* 1. BRAND HEADER WITH OFFICIAL LOGO */}
        <div style={{ padding: '1.25rem 1.15rem 1rem', borderBottom: '1px solid #1E293B' }}>
          <div 
            onClick={() => onSelectTab && onSelectTab('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            title="Go to Homepage"
          >
            <img 
              src="/navibulk-logo.png" 
              alt="SAIL NaviBulk Logo" 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#FFFFFF',
                padding: '2px',
                objectFit: 'contain',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }} 
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
                SAIL NaviBulk
              </div>
              <div style={{ fontSize: '0.64rem', color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '0.15rem' }}>
                Commercial Maritime DSS
              </div>
            </div>
          </div>

          {/* Home Portal Button */}
          <button
            onClick={() => onSelectTab && onSelectTab('home')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'home' ? '#2563EB' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'home' ? '#FFFFFF' : '#94A3B8',
              border: activeTab === 'home' ? '1px solid #3B82F6' : '1px solid #334155',
              borderRadius: '5px',
              padding: '0.45rem 0.65rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '0.85rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Home size={13} />
            <span>Home Overview</span>
          </button>

          {/* + New Decision Button */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                startNewDecision();
                if (onSelectTab) onSelectTab('decision');
              }}
              style={{
                flex: 1,
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '5px',
                padding: '0.45rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'background 0.15s ease'
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
                background: '#1E293B',
                color: '#94A3B8',
                border: '1px solid #334155',
                borderRadius: '5px',
                padding: '0.45rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* 2. CURRENT ACTIVE DECISION CARD */}
        <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid #1E293B', background: '#0B1120' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            CURRENT DECISION
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#F1F5F9', lineHeight: 1.25 }}>
            {inputs.tonnage.toLocaleString()} MT
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '0.1rem' }}>
            {inputs.cargoType}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 600, marginTop: '0.35rem' }}>
            {inputs.originCountry} → {inputs.destinationPortKey.toUpperCase()}
          </div>
        </div>

        {/* 3. DECISION STAGE FLOW (10 FOCUSED STAGES) */}
        <div style={{ padding: '0.85rem 0.6rem' }}>
          <div style={{ padding: '0 0.55rem 0.5rem', fontSize: '0.62rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            DECISION FLOW
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {STAGE_ORDER.map((stageId) => {
              const meta = STAGE_METADATA[stageId];
              const isCurrent = activeTab === 'decision' && activeStage === stageId;
              const status = stageStatuses[stageId] || 'not_started';

              let iconSymbol = '○';
              let iconColor = '#475569';

              if (isCurrent) {
                iconSymbol = '●';
                iconColor = '#38BDF8';
              } else if (status === 'requires_reanalysis') {
                iconSymbol = '⟳';
                iconColor = '#F59E0B';
              } else if (status === 'analyzed') {
                iconSymbol = '✓';
                iconColor = '#10B981';
              }

              return (
                <button
                  key={stageId}
                  onClick={() => {
                    if (onSelectTab) onSelectTab('decision');
                    setActiveStage(stageId);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.42rem 0.65rem',
                    borderRadius: '5px',
                    border: 'none',
                    background: isCurrent ? '#1E293B' : 'transparent',
                    color: isCurrent ? '#FFFFFF' : status === 'analyzed' ? '#E2E8F0' : status === 'requires_reanalysis' ? '#FCD34D' : '#64748B',
                    fontSize: '0.76rem',
                    fontWeight: isCurrent ? 800 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = '#152033';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span 
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      color: iconColor,
                      width: '14px',
                      textAlign: 'center',
                      fontWeight: 900
                    }}
                  >
                    {iconSymbol}
                  </span>

                  <span style={{ flex: 1 }}>
                    {meta.shortTitle || meta.title}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* ── BOTTOM SECTION: SYSTEM & ENGINE STATUS ── */}
      <div style={{ borderTop: '1px solid #1E293B', padding: '0.85rem 0.75rem' }}>
        <div style={{ padding: '0 0.4rem 0.4rem', fontSize: '0.62rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          SYSTEM
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <button
            onClick={onOpenPortsModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.45rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#94A3B8',
              fontSize: '0.74rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Anchor size={13} color="#64748B" />
            <span>Port Infrastructure</span>
          </button>

          <button
            onClick={onOpenMethodologyModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.45rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#94A3B8',
              fontSize: '0.74rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <ShieldCheck size={13} color="#2563EB" />
            <span>Methodology & Audit</span>
          </button>
        </div>

        {/* Engine Status Indicator */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.7rem', color: '#64748B' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span>Decision Engine V2</span>
        </div>
      </div>

    </aside>
  );
}
