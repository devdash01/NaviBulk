// SAIL NaviBulk — Stage 08: Stress Sensitivity Testing
// Tests robustness of base plan under severe market and operational shocks
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { Sliders, RotateCcw, AlertTriangle, TrendingUp, DollarSign, Clock, Shield } from 'lucide-react';

export default function StressStage() {
  const {
    inputs,
    baseDeliveredCost,
    stressState,
    updateStressState,
    resetStressState,
    stressedEconomics,
    advanceStage
  } = useDecisionEngine();

  const isStressed = stressState.freightPct !== 0 || stressState.congestionDays !== 0 ||
    stressState.bunkerPct !== 0 || stressState.parcelSwingMt !== 0;

  const conclusionText = isStressed
    ? `Under active sensitivity stress, delivered cost shifts from $${baseDeliveredCost.totalLanded}/MT to $${stressedEconomics.newLanded}/MT (${stressedEconomics.costDelta >= 0 ? `+$${stressedEconomics.costDelta}` : `-$${Math.abs(stressedEconomics.costDelta)}`}/MT). ${stressedEconomics.stressReason} Procurement recommendation adapts to: ${stressedEconomics.stressedRecommendation}.`
    : `Base Plan evaluated at baseline parameters ($${baseDeliveredCost.totalLanded}/MT). Adjust the shock sliders on the left to evaluate sensitivity against severe freight spikes, demurrage accumulation, and bunker escalation.`;

  return (
    <StageShell
      stageId="stress"
      conclusion={conclusionText}
      nextActionLabel="Review Counterfactual Proof →"
      onNextAction={() => advanceStage('stress')}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* ── LEFT COLUMN: STRESS ASSUMPTION SLIDERS ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={16} color="#2563EB" />
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Stress Assumptions
              </h2>
            </div>
            {isStressed && (
              <button
                onClick={resetStressState}
                style={{
                  background: 'transparent',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontWeight: 600
                }}
              >
                <RotateCcw size={12} />
                <span>Reset Baseline</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 1. Baltic Freight Shock */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>Baltic Index Freight Shock</span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: stressState.freightPct > 0 ? '#DC2626' : stressState.freightPct < 0 ? '#16A34A' : '#64748B' }}>
                  {stressState.freightPct > 0 ? `+${stressState.freightPct}%` : `${stressState.freightPct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={stressState.freightPct}
                onChange={(e) => updateStressState({ freightPct: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                <span>-30% (Market Collapse)</span>
                <span>0% (Baseline)</span>
                <span>+50% (Sharp Spike)</span>
              </div>
            </div>

            {/* 2. Port Congestion Demurrage */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>Destination Port Congestion</span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: stressState.congestionDays > 0 ? '#B45309' : '#64748B' }}>
                  +{stressState.congestionDays} Days Laytime Delay
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={stressState.congestionDays}
                onChange={(e) => updateStressState({ congestionDays: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#B45309' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                <span>0 Days (Normal)</span>
                <span>+7 Days (Swell / Cyclone)</span>
                <span>+14 Days (Berth Breakdown)</span>
              </div>
            </div>

            {/* 3. Bunker Fuel Price Shock */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>Bunker Fuel Price Shift (VLSFO)</span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: stressState.bunkerPct > 0 ? '#DC2626' : stressState.bunkerPct < 0 ? '#16A34A' : '#64748B' }}>
                  {stressState.bunkerPct > 0 ? `+${stressState.bunkerPct}%` : `${stressState.bunkerPct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                step="5"
                value={stressState.bunkerPct}
                onChange={(e) => updateStressState({ bunkerPct: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                <span>-20% (Crude Softening)</span>
                <span>0% (Baseline)</span>
                <span>+40% (Geopolitical Shock)</span>
              </div>
            </div>

            {/* 4. Parcel Size Swing */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>Parcel Size Swing (MT)</span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: stressState.parcelSwingMt !== 0 ? '#0F172A' : '#64748B' }}>
                  {stressState.parcelSwingMt > 0 ? `+${stressState.parcelSwingMt.toLocaleString()}` : `${stressState.parcelSwingMt.toLocaleString()}`} MT
                </span>
              </div>
              <input
                type="range"
                min="-20000"
                max="30000"
                step="5000"
                value={stressState.parcelSwingMt}
                onChange={(e) => updateStressState({ parcelSwingMt: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                <span>-20,000 MT</span>
                <span>0 MT ({inputs.tonnage.toLocaleString()})</span>
                <span>+30,000 MT</span>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.72rem', color: '#64748B' }}>
            <strong>Deterministic Sensitivity Engine:</strong> Calculations update synchronously. Port congestion accumulates Worldscale laytime demurrage ($0.35/MT/day). Freight and bunker apply proportional deltas.
          </div>
        </div>

        {/* ── RIGHT COLUMN: DECISION IMPACT & ADAPTATION ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Side-by-Side Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Baseline Card */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                Base Case
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${baseDeliveredCost.totalLanded} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/ MT</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.25rem' }}>
                Total Outlay: ${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                Tonnage: {inputs.tonnage.toLocaleString()} MT
              </div>
            </div>

            {/* Stressed Card */}
            <div style={{ background: isStressed ? '#FEF2F2' : '#F8FAFC', border: isStressed ? '1px solid #FECACA' : '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isStressed ? '#DC2626' : '#64748B', textTransform: 'uppercase' }}>
                Stressed Case
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isStressed ? '#B91C1C' : '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${stressedEconomics.newLanded} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/ MT</span>
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: stressedEconomics.costDelta >= 0 ? '#DC2626' : '#16A34A', marginTop: '0.25rem' }}>
                {stressedEconomics.costDelta >= 0 ? `+$${stressedEconomics.costDelta}` : `-$${Math.abs(stressedEconomics.costDelta)}`}/MT vs Baseline
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.35rem' }}>
                Total: ${stressedEconomics.stressedTotalOutlayUsd?.toLocaleString()} USD ({stressedEconomics.stressedTonnage?.toLocaleString()} MT)
              </div>
            </div>

          </div>

          {/* Causal Explanation Box */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
                WHAT CHANGED
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                Delivered rate shifts {stressedEconomics.costDelta >= 0 ? `+$${stressedEconomics.costDelta}` : `-$${Math.abs(stressedEconomics.costDelta)}`}/MT
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                WHY IT CHANGED
              </span>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                {stressState.congestionDays > 0 && `Port delay (+${stressState.congestionDays}d) adds +$${stressedEconomics.demurrageDelta}/MT in laytime demurrage. `}
                {stressState.freightPct !== 0 && `Freight index shift (${stressState.freightPct > 0 ? '+' : ''}${stressState.freightPct}%) imparts $${stressedEconomics.freightDelta}/MT variance. `}
                {stressState.bunkerPct !== 0 && `Bunker price shift (${stressState.bunkerPct > 0 ? '+' : ''}${stressState.bunkerPct}%) imparts $${stressedEconomics.bunkerDelta}/MT fuel variance. `}
                {stressState.parcelSwingMt !== 0 && `Parcel swing of ${stressState.parcelSwingMt > 0 ? '+' : ''}${stressState.parcelSwingMt.toLocaleString()} MT shifts total budget exposure by $${Math.round(stressedEconomics.stressedTotalOutlayUsd - baseDeliveredCost.totalOutlayUsd).toLocaleString()} USD. `}
                {!isStressed && 'All parameters are at baseline. Adjust sliders on the left to evaluate sensitivity.'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                WHAT NAVIBULK NOW RECOMMENDS
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E40AF', marginTop: '0.15rem' }}>
                {stressedEconomics.stressedRecommendation}
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                {stressedEconomics.stressReason}
              </p>
            </div>

          </div>

        </div>

      </div>
    </StageShell>
  );
}
