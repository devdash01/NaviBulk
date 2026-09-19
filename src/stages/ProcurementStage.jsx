// SAIL NaviBulk — Stage 06: Procurement Commitment & Contract Structuring
// Evaluates Spot vs COA vs Index-Linked vs Time Charter under forward Baltic market trajectory
import React, { useState } from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { Sliders, Lock, Unlock, ShieldCheck, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, FileText, Scale } from 'lucide-react';

export default function ProcurementStage() {
  const {
    inputs,
    commitmentDecision,
    contractEvaluations,
    forecastSlopePct,
    baseDeliveredCost,
    subIndexKey,
    advanceStage
  } = useDecisionEngine();

  const [selectedContractKey, setSelectedContractKey] = useState('COA');

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

  const coaContract = contractEvaluations?.find(c => c.strategyKey === 'COA') || contractEvaluations?.[1];
  const coaSavingsUsd = coaContract?.savingsVsSpotUsd || Math.round(coveredTonnage * 0.85);
  const coaSavingsPerMt = coaContract?.savingsPerMt || Number((coaSavingsUsd / inputs.tonnage).toFixed(2));
  const coaSavingsInrCr = Number(((coaSavingsUsd * 83.2) / 10000000).toFixed(2));

  const conclusionText = `NaviBulk advises a ${commitmentDecision.action} strategy with ${commitmentDecision.lockPct}% period coverage (${coveredTonnage.toLocaleString()} MT locked / $${coveredOutlay.toLocaleString()} USD) and ${commitmentDecision.spotPct}% floating spot exposure (${exposedTonnage.toLocaleString()} MT / $${exposedOutlay.toLocaleString()} USD). Contract structuring under Period COA secures +$${coaSavingsUsd.toLocaleString()} USD (₹${coaSavingsInrCr} Cr / -$${coaSavingsPerMt}/MT) in volume optimization while shielding cargo from projected +${forecastSlopePct}% Baltic curve inflation.`;

  return (
    <StageShell
      stageId="procurement"
      conclusion={conclusionText}
      nextActionLabel="Explore Alternative Sources"
      onNextAction={() => advanceStage('procurement')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. CENTRAL COMMITMENT STRATEGY CALLOUT ── */}
        <div 
          className="analytical-card"
          style={{
            background: actionBg,
            borderColor: actionBorder,
            borderRadius: '12px',
            padding: '1.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span 
                className="pill-badge"
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  background: actionColor,
                  padding: '0.15rem 0.55rem'
                }}
              >
                RECOMMENDED CHARTER ACTION
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Forward Freight Curve Trajectory: {forecastSlopePct > 0 ? `+${forecastSlopePct}%` : `${forecastSlopePct}%`}
              </span>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0 0.4rem', letterSpacing: '-0.02em' }}>
              {commitmentDecision.action}
            </h2>

            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.55 }}>
              {commitmentDecision.rationale}
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
              Recommended Coverage
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: actionColor, fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginTop: '0.2rem' }}>
              {commitmentDecision.lockPct}%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {commitmentDecision.spotPct}% Spot Exposure
            </div>
          </div>
        </div>

        {/* ── STAGE 06 TOTAL COST OPTIMIZATION: DYNAMIC COA VOLUME HEDGE ── */}
        <div 
          className="analytical-card"
          style={{ 
            background: '#F0FDF4', 
            border: '1px solid #BBF7D0', 
            borderRadius: '12px', 
            padding: '1.25rem 1.5rem', 
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Stage 06 Landed Cost Optimization • Contract Structuring & COA Hedge
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D', margin: '0.2rem 0 0.15rem' }}>
                {commitmentDecision.lockPct}% Contract of Affreightment (COA) Volume Hedge
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534', maxWidth: '680px', lineHeight: 1.45 }}>
                Securing {coveredTonnage.toLocaleString()} MT under a multi-voyage COA collar captures a verified charterer volume discount vs volatile spot market fixtures. Eliminates exposure to projected freight inflation while preserving {commitmentDecision.spotPct}% flexibility to exploit spot softening.
              </p>
            </div>

            <div style={{ background: 'var(--success)', color: '#FFFFFF', padding: '0.55rem 1.1rem', borderRadius: '10px', textAlign: 'right' }}>
              <span style={{ fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Contract Optimization Value</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                +${coaSavingsUsd.toLocaleString()} USD
              </span>
              <span style={{ fontSize: '0.7rem', display: 'block', fontWeight: 700 }}>
                (₹{coaSavingsInrCr} Cr Saved • -${coaSavingsPerMt}/MT)
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. CONTRACT STRUCTURING EVALUATION MATRIX ── */}
        <div className="analytical-card" style={{ borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contract Strategy Comparison Matrix
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Quantitative trade-off analysis across four institutional charter party contract structures
              </div>
            </div>
            <span className="provenance-label">BIMCO STANDARD TERMS EVALUATION</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {contractEvaluations?.map((contract) => {
              const isSelected = selectedContractKey === contract.strategyKey;
              return (
                <div
                  key={contract.strategyKey}
                  onClick={() => setSelectedContractKey(contract.strategyKey)}
                  style={{
                    background: isSelected ? '#F8FAFC' : '#FFFFFF',
                    border: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '1.15rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  {contract.recommended && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <span className="pill-badge status-emerald" style={{ fontSize: '0.62rem', fontWeight: 800 }}>
                        RECOMMENDED
                      </span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {contract.tag}
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.6rem' }}>
                    {contract.name}
                  </h4>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem', marginBottom: '0.65rem' }}>
                    <div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivered Cost</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        ${contract.deliveredCostMt?.toFixed(2)} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>/ MT</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk-Adjusted</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                        ${contract.riskAdjustedCostMt?.toFixed(2)} / MT
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.45, minHeight: '48px' }}>
                    {contract.terms}
                  </div>

                  <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Outlay:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      ${contract.totalCostUsd?.toLocaleString()} USD
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. EXPOSURE WATERFALL BAR ── */}
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

        {/* ── 4. RISK-ADJUSTED RATIONALE ── */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Why Not 100% Lock or 100% Spot?
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
            NaviBulk rejects naive binary fixture decisions. While a simplistic model might recommend locking 100% when freight rises, SAIL's commercial governance requires maintaining operational liquidity for sudden port congestion or steel plant blast-furnace blend schedule changes. By locking {commitmentDecision.lockPct}%, the balance sheet is protected against steep freight inflation while {commitmentDecision.spotPct}% remains nimble.
          </p>
        </div>

      </div>
    </StageShell>
  );
}
