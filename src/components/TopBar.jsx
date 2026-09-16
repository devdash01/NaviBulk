// SAIL NaviBulk — Compact Institutional Top Bar & Flow Breadcrumb
// Maximum ~60px header providing clean application context without dashboard clutter
import React from 'react';
import { useDecisionEngine, STAGE_ORDER, STAGE_METADATA } from '../context/DecisionContext.jsx';
import { ShieldCheck, CheckCircle2, RefreshCw, Clock, FileText, ChevronRight } from 'lucide-react';

export default function TopBar({ onOpenMethodologyModal }) {
  const {
    inputs,
    activeStage,
    setActiveStage,
    stageStatuses
  } = useDecisionEngine();

  const isCurrentAnalyzed = stageStatuses[activeStage] === 'analyzed';
  const hasReanalysis = Object.values(stageStatuses).some((s) => s === 'requires_reanalysis');

  return (
    <header 
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* ── 60px UPPER BAR ── */}
      <div 
        style={{
          height: '56px',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'nowrap'
        }}
      >
        {/* LEFT: System Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <div 
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '0.22rem 0.55rem',
              borderRadius: '4px',
              letterSpacing: '0.02em'
            }}
          >
            SAIL NaviBulk
          </div>
          <span style={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 600 }}>
            SIH 26006
          </span>
        </div>

        {/* CENTER: Active Cargo Requirement Pill */}
        <div 
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '0.25rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#0F172A',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <span>{inputs.tonnage.toLocaleString()} MT {inputs.cargoType}</span>
          <span style={{ color: '#94A3B8' }}>•</span>
          <span style={{ color: '#2563EB' }}>{inputs.originCountry} → {inputs.destinationPortKey.toUpperCase()}</span>
        </div>

        {/* RIGHT: Actions & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          
          {/* Status Badge */}
          {hasReanalysis ? (
            <span 
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#B45309',
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <RefreshCw size={11} /> Reanalysis Pending
            </span>
          ) : (
            <span 
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#16A34A',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <CheckCircle2 size={11} /> Engine Active
            </span>
          )}

          {/* Edit Mandate Button */}
          <button
            onClick={() => setActiveStage('requirement')}
            style={{
              background: activeStage === 'requirement' ? '#F1F5F9' : 'transparent',
              border: '1px solid #CBD5E1',
              borderRadius: '5px',
              padding: '0.28rem 0.65rem',
              fontSize: '0.74rem',
              color: '#334155',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Edit Requirement
          </button>

          {/* Quick Decision Brief Jump */}
          <button
            onClick={() => setActiveStage('decision')}
            style={{
              background: activeStage === 'decision' ? '#0F172A' : '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '5px',
              padding: '0.28rem 0.75rem',
              fontSize: '0.74rem',
              color: activeStage === 'decision' ? '#FFFFFF' : '#1D4ED8',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Decision Brief
          </button>

          {/* Methodology Modal Trigger */}
          {onOpenMethodologyModal && (
            <button
              onClick={onOpenMethodologyModal}
              title="Open Mathematical Model Audit Dossier"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '0.2rem'
              }}
            >
              <ShieldCheck size={17} color="#64748B" />
            </button>
          )}

        </div>
      </div>

      {/* ── COMPACT BREADCRUMB STRIP (FLOW BAR) ── */}
      <div 
        style={{
          borderTop: '1px solid #F1F5F9',
          padding: '0.35rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          overflowX: 'auto',
          background: '#FAFAFA',
          whiteSpace: 'nowrap'
        }}
      >
        {STAGE_ORDER.map((stageId, index) => {
          const meta = STAGE_METADATA[stageId];
          const isActive = activeStage === stageId;
          const status = stageStatuses[stageId];
          const isAnalyzed = status === 'analyzed';
          const isNeedsReanalysis = status === 'requires_reanalysis';

          const textColor = isActive ? '#2563EB' : isNeedsReanalysis ? '#B45309' : isAnalyzed ? '#0F172A' : '#94A3B8';

          return (
            <React.Fragment key={stageId}>
              <button
                onClick={() => setActiveStage(stageId)}
                style={{
                  background: isActive ? '#FFFFFF' : 'transparent',
                  border: isActive ? '1px solid #CBD5E1' : 'none',
                  borderRadius: '4px',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 800 : 600,
                  color: textColor,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>{meta.shortTitle || meta.title}</span>
                {isNeedsReanalysis ? (
                  <span style={{ color: '#B45309', fontSize: '0.7rem' }}>⟳</span>
                ) : isAnalyzed ? (
                  <span style={{ color: '#16A34A', fontSize: '0.7rem' }}>✓</span>
                ) : null}
              </button>

              {index < STAGE_ORDER.length - 1 && (
                <ChevronRight size={11} color="#CBD5E1" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </header>
  );
}
