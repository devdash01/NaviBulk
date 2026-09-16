// SAIL NaviBulk — Unified Stage Layout Wrapper
// Strict enterprise maritime workstation structure for every analytical stage
import React from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, RefreshCw, GitBranch } from 'lucide-react';
import { useDecisionEngine, STAGE_METADATA } from '../context/DecisionContext.jsx';

export default function StageShell({
  stageId,
  conclusion,
  nextActionLabel,
  onNextAction,
  children
}) {
  const { inputs, advanceStage, adoptedCandidateBranch, clearCandidateBranch } = useDecisionEngine();
  const meta = STAGE_METADATA[stageId] || {
    num: '00',
    title: 'Analytical Stage',
    question: 'How does this factor influence the commercial decision?',
    purpose: 'Evaluate operational parameters.'
  };

  const handleNext = () => {
    if (onNextAction) {
      onNextAction();
    } else {
      advanceStage(stageId);
    }
  };

  return (
    <div className="stage-shell-root" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Candidate Branch Active Alert Banner (if branch is adopted) */}
      {adoptedCandidateBranch && (
        <div 
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '6px',
            padding: '0.65rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#1E40AF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitBranch size={16} color="#2563EB" />
            <span>
              <strong>Candidate Branch Active:</strong> Comparing candidate origin <strong>{adoptedCandidateBranch.country}</strong> against authoritative Base Plan (<strong>{inputs.originCountry}</strong>).
            </span>
          </div>
          <button
            onClick={clearCandidateBranch}
            style={{
              background: 'transparent',
              border: '1px solid #93C5FD',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.72rem',
              color: '#1E40AF',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Clear Branch
          </button>
        </div>
      )}

      {/* ── STAGE HEADER HIERARCHY ── */}
      <header 
        style={{
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span 
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#EFF6FF',
                padding: '0.15rem 0.5rem',
                borderRadius: '3px'
              }}
            >
              Stage {meta.num}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {meta.title}
            </span>
          </div>

          {/* Active Context Pill */}
          <div 
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#334155',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              padding: '0.2rem 0.65rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>{inputs.tonnage.toLocaleString()} MT {inputs.cargoType}</span>
            <span style={{ color: '#94A3B8' }}>•</span>
            <span>{inputs.originCountry} → {inputs.destinationPortKey.toUpperCase()}</span>
          </div>
        </div>

        <h1 
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#0F172A',
            margin: '0.15rem 0 0.25rem',
            letterSpacing: '-0.015em',
            lineHeight: 1.25
          }}
        >
          {meta.question}
        </h1>

        <p 
          style={{
            fontSize: '0.84rem',
            color: '#475569',
            margin: 0,
            lineHeight: 1.45
          }}
        >
          {meta.purpose}
        </p>
      </header>

      {/* ── STAGE ANALYTICAL CONTENT ── */}
      <main className="stage-analytical-body" style={{ marginBottom: '1.75rem' }}>
        {children}
      </main>

      {/* ── STAGE CONCLUSION & CONTEXTUAL NEXT ACTION ── */}
      {conclusion && (
        <footer
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.25rem 1.5rem',
            marginTop: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span 
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                WHAT THIS MEANS
              </span>
            </div>
            <div style={{ fontSize: '0.86rem', color: '#1E293B', lineHeight: 1.55, fontWeight: 500 }}>
              {conclusion}
            </div>
          </div>

          {nextActionLabel && (
            <div 
              style={{
                borderTop: '1px solid #F1F5F9',
                paddingTop: '0.85rem',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}
            >
              <button
                onClick={handleNext}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.1rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
              >
                <span>{nextActionLabel}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
