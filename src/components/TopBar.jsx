// SAIL NaviBulk — Decluttered Institutional Top Bar with Sidebar Toggle
// Clean, calm, 56px header providing operational context without visual crowding
import React from 'react';
import { useDecisionEngine, STAGE_METADATA } from '../context/DecisionContext.jsx';
import { 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Home, 
  Compass,
  ArrowRight
} from 'lucide-react';

export default function TopBar({ 
  activeTab, 
  onSelectTab, 
  isSidebarCollapsed, 
  onToggleSidebar, 
  onOpenMethodologyModal 
}) {
  const {
    inputs,
    activeStage,
    setActiveStage,
    stageStatuses
  } = useDecisionEngine();

  const isCurrentAnalyzed = stageStatuses[activeStage] === 'analyzed';
  const hasReanalysis = Object.values(stageStatuses).some((s) => s === 'requires_reanalysis');
  const currentStageMeta = STAGE_METADATA[activeStage] || { num: '01', title: 'Commercial Requirement', shortTitle: 'Requirement' };

  return (
    <header 
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        height: '56px'
      }}
    >
      <div 
        style={{
          height: '100%',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* LEFT: Sidebar Toggle + Contextual Stage Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Expand Navigation Sidebar" : "Collapse Sidebar for Focus"}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: isSidebarCollapsed ? 'rgba(37, 99, 235, 0.08)' : '#F8FAFC',
              color: isSidebarCollapsed ? '#2563EB' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = isSidebarCollapsed ? '#2563EB' : '#475569';
            }}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          {/* If sidebar is collapsed, show compact brand identifier; otherwise show clean breadcrumb */}
          {isSidebarCollapsed ? (
            <div 
              onClick={() => onSelectTab && onSelectTab('home')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              title="Return to Transocean Overview"
            >
              <img 
                src="/navibulk-logo.png" 
                alt="Logo" 
                style={{ width: '24px', height: '24px', objectFit: 'contain' }} 
              />
              <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A' }}>
                SAIL NaviBulk
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 600, color: '#64748B' }}>Decision Desk</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ fontWeight: 800, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                {currentStageMeta.num}
              </span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>
                {currentStageMeta.shortTitle || currentStageMeta.title}
              </span>
            </div>
          )}

        </div>

        {/* CENTER: Clean Active Mandate Pill */}
        <div 
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            padding: '0.28rem 0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#0F172A',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
            {inputs.tonnage.toLocaleString()} MT
          </span>
          <span style={{ color: '#64748B' }}>{inputs.cargoType}</span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ color: '#2563EB', fontWeight: 700 }}>
            {inputs.originCountry} → {inputs.destinationPortKey.toUpperCase()}
          </span>
        </div>

        {/* RIGHT: Actions & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          
          {/* Analysis Status Badge */}
          {hasReanalysis ? (
            <span 
              className="pill-badge status-warning"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}
            >
              <RefreshCw size={11} /> Reanalysis Required
            </span>
          ) : (
            <span 
              className="pill-badge status-success"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}
            >
              <CheckCircle2 size={11} /> Engine Active
            </span>
          )}

          {/* Edit Mandate Button */}
          <button
            onClick={() => setActiveStage('requirement')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.74rem',
              borderRadius: '8px'
            }}
          >
            Edit Mandate
          </button>

          {/* Quick Decision Brief Jump */}
          <button
            onClick={() => setActiveStage('decision')}
            className="btn-cobalt"
            style={{
              padding: '0.3rem 0.85rem',
              fontSize: '0.74rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>Decision Brief</span>
            <span style={{ fontSize: '0.82rem', lineHeight: 1 }}>↗</span>
          </button>

          {/* Methodology Dossier Trigger */}
          {onOpenMethodologyModal && (
            <button
              onClick={onOpenMethodologyModal}
              title="View DecisionEngine Mathematical Methodology"
              style={{
                background: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#64748B',
                cursor: 'pointer',
                padding: '0.3rem 0.45rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <ShieldCheck size={16} />
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
