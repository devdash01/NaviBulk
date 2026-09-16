// SAIL NaviBulk — Stage Gate Guard
// Prevents displaying stale or uncalculated decision data when inputs change or stage is pending
import React from 'react';
import { AlertTriangle, PlayCircle, RefreshCw, Lock } from 'lucide-react';
import { useDecisionEngine, STAGE_METADATA } from '../context/DecisionContext.jsx';

export default function StageGate({ stageId, status }) {
  const { runStageAnalysis, inputs, advanceStage } = useDecisionEngine();
  const meta = STAGE_METADATA[stageId] || {
    num: '00',
    title: 'Stage',
    question: 'Analytical Evaluation'
  };

  const isReanalysis = status === 'requires_reanalysis';

  return (
    <div 
      style={{
        maxWidth: '720px',
        margin: '3rem auto',
        background: '#FFFFFF',
        border: isReanalysis ? '1px solid #FCD34D' : '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '2.5rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        textAlign: 'center'
      }}
    >
      <div 
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: isReanalysis ? '#FEF3C7' : '#F1F5F9',
          color: isReanalysis ? '#B45309' : '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}
      >
        {isReanalysis ? <RefreshCw size={24} /> : <Lock size={24} />}
      </div>

      <span 
        style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: isReanalysis ? '#B45309' : '#64748B',
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}
      >
        {isReanalysis ? 'REQUIRES REANALYSIS' : 'STAGE NOT YET ANALYZED'}
      </span>

      <h2 
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#0F172A',
          margin: '0.35rem 0 0.75rem'
        }}
      >
        {meta.title} (Stage {meta.num})
      </h2>

      <p 
        style={{
          fontSize: '0.85rem',
          color: '#475569',
          lineHeight: 1.5,
          maxWidth: '520px',
          margin: '0 auto 1.5rem'
        }}
      >
        {isReanalysis ? (
          <>
            The commercial cargo requirement was recently modified (<strong>{inputs.tonnage.toLocaleString()} MT {inputs.cargoType} • {inputs.originCountry} → {inputs.destinationPortKey.toUpperCase()}</strong>).
            To prevent decision contamination, downstream results must be refreshed against active constraints.
          </>
        ) : (
          <>
            This analytical stage has not been executed yet for the active cargo requirement.
            Click below to run genuine deterministic engine calculations for this stage.
          </>
        )}
      </p>

      <button
        onClick={() => runStageAnalysis(stageId)}
        style={{
          background: isReanalysis ? '#B45309' : '#2563EB',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '6px',
          padding: '0.6rem 1.4rem',
          fontSize: '0.84rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'background 0.15s ease'
        }}
      >
        {isReanalysis ? <RefreshCw size={15} /> : <PlayCircle size={15} />}
        <span>{isReanalysis ? 'Refresh Stage Analysis' : 'Run Stage Analysis'}</span>
      </button>

      <div style={{ marginTop: '1.25rem', fontSize: '0.72rem', color: '#94A3B8', fontStyle: 'italic' }}>
        [Zero Fabricated Data: NaviBulk derives outputs synchronously from authoritative mathematical engines.]
      </div>
    </div>
  );
}
