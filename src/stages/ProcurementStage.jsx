// SAIL NaviBulk — Stage 06: Procurement Commitment
// Balances price certainty against market optionality (BUY NOW, WAIT, or PARTIAL LOCK)
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { Sliders, Lock, Unlock, ShieldCheck, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ProcurementStage() {
  const {
    inputs,
    commitmentDecision,
    forecastSlopePct,
    baseDeliveredCost,
    subIndexKey,
    advanceStage
  } = useDecisionEngine();

  const isBuyNow = commitmentDecision.action === 'BUY NOW';
  const isWait = commitmentDecision.action === 'WAIT';
  const isPartial = commitmentDecision.action === 'PARTIAL LOCK';

  const actionColor = isBuyNow ? '#16A34A' : isWait ? '#D97706' : '#2563EB';
  const actionBg = isBuyNow ? '#F0FDF4' : isWait ? '#FFFBEB' : '#EFF6FF';
  const actionBorder = isBuyNow ? '#BBF7D0' : isWait ? '#FDE68A' : '#BFDBFE';

  const coveredTonnage = Math.round((inputs.tonnage * commitmentDecision.lockPct) / 100);
  const exposedTonnage = inputs.tonnage - coveredTonnage;
  const coveredOutlay = Math.round((baseDeliveredCost.totalOutlayUsd * commitmentDecision.lockPct) / 100);
  const exposedOutlay = baseDeliveredCost.totalOutlayUsd - coveredOutlay;

  const conclusionText = `NaviBulk advises a ${commitmentDecision.action} strategy with ${commitmentDecision.lockPct}% period coverage (${coveredTonnage.toLocaleString()} MT locked / $${coveredOutlay.toLocaleString()} USD) and ${commitmentDecision.spotPct}% floating spot exposure (${exposedTonnage.toLocaleString()} MT / $${exposedOutlay.toLocaleString()} USD). This shields ${commitmentDecision.lockPct}% of the consignment from projected +${forecastSlopePct}% freight inflation while retaining market liquidity.`;

  return (
    <StageShell
      stageId="procurement"
      conclusion={conclusionText}
      nextActionLabel="Explore Alternative Sources →"
      onNextAction={() => advanceStage('procurement')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. CENTRAL COMMITMENT STRATEGY CALLOUT ── */}
        <div 
          style={{
            background: actionBg,
            border: `2px solid ${actionBorder}`,
            borderRadius: '8px',
            padding: '1.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span 
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  background: actionColor,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                RECOMMENDED CHARTER ACTION
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                Forward Freight Curve Trajectory: {forecastSlopePct > 0 ? `+${forecastSlopePct}%` : `${forecastSlopePct}%`}
              </span>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0 0.4rem', letterSpacing: '-0.02em' }}>
              {commitmentDecision.action}
            </h2>

            <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', maxWidth: '640px', lineHeight: 1.5 }}>
              {commitmentDecision.rationale}
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Recommended Coverage
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: actionColor, fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginTop: '0.2rem' }}>
              {commitmentDecision.lockPct}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
              {commitmentDecision.spotPct}% Spot Exposure
            </div>
          </div>
        </div>

        {/* ── 2. EXPOSURE WATERFALL BAR ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cargo Volume Commitment Distribution
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Total Mandate: <strong style={{ color: '#0F172A' }}>{inputs.tonnage.toLocaleString()} MT</strong>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div style={{ width: '100%', height: '26px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden', display: 'flex', border: '1px solid #E2E8F0' }}>
            <div 
              style={{
                width: `${commitmentDecision.lockPct}%`,
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'width 0.3s ease'
              }}
            >
              {commitmentDecision.lockPct > 15 && `LOCKED: ${commitmentDecision.lockPct}%`}
            </div>
            <div 
              style={{
                width: `${commitmentDecision.spotPct}%`,
                background: '#E2E8F0',
                color: '#475569',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'width 0.3s ease'
              }}
            >
              {commitmentDecision.spotPct > 15 && `OPEN: ${commitmentDecision.spotPct}%`}
            </div>
          </div>

          {/* Legend and Breakdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.25rem' }}>
            
            <div style={{ borderLeft: '3px solid #2563EB', paddingLeft: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={14} color="#2563EB" />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
                  Forward Locked Volume ({commitmentDecision.lockPct}%)
                </span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {coveredTonnage.toLocaleString()} MT
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.15rem' }}>
                Secured Budget: ${coveredOutlay.toLocaleString()} USD
              </div>
              <div style={{ fontSize: '0.7rem', color: '#2563EB', marginTop: '0.35rem' }}>
                Fixed under period COA / forward hedge — immune to rate spikes.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #94A3B8', paddingLeft: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Unlock size={14} color="#64748B" />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
                  Floating Spot Volume ({commitmentDecision.spotPct}%)
                </span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {exposedTonnage.toLocaleString()} MT
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.15rem' }}>
                Floating Exposure: ${exposedOutlay.toLocaleString()} USD
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.35rem' }}>
                Subject to spot fixtures during prompt laycan window.
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. RISK-ADJUSTED RATIONALE ── */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Why Not 100% Lock or 100% Spot?
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
            NaviBulk rejects extreme binary decisions. While a naive model might recommend locking 100% when freight rises, SAIL's commercial guidelines require maintaining flexibility for sudden port congestion or steel plant blast-furnace blend schedule changes. By locking {commitmentDecision.lockPct}%, the balance sheet is protected against steep freight inflation while {commitmentDecision.spotPct}% remains nimble.
          </p>
        </div>

      </div>
    </StageShell>
  );
}
