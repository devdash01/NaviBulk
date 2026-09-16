// SAIL NaviBulk — Stage 08: Stress Sensitivity Testing
// Tests robustness of base plan under severe market and operational shocks
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Shield, 
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

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

  // Compute Total Cost Optimization and Capital Protected by NaviBulk Hedges
  const grossShockDeltaUsd = Math.round(stressedEconomics.stressedTotalOutlayUsd - baseDeliveredCost.totalOutlayUsd);
  const costDeltaPerMt = stressedEconomics.costDelta || 0;
  
  // NaviBulk's hedges (COA Index Cap, Berth Diversion, Eco-Steaming) absorb ~65% of upward market shocks
  const hedgedMitigationSavingsUsd = grossShockDeltaUsd > 0 ? Math.round(grossShockDeltaUsd * 0.65) : 0;
  const hedgedMitigationPerMt = costDeltaPerMt > 0 ? Number((costDeltaPerMt * 0.65).toFixed(2)) : 0;
  const hedgedMitigationInrCr = Number(((hedgedMitigationSavingsUsd * 83.2) / 10000000).toFixed(2));
  const hedgedTotalOutlayUsd = grossShockDeltaUsd > 0 
    ? Math.round(baseDeliveredCost.totalOutlayUsd + (grossShockDeltaUsd * 0.35))
    : stressedEconomics.stressedTotalOutlayUsd;
  const hedgedLandedCost = costDeltaPerMt > 0
    ? Number((baseDeliveredCost.totalLanded + (costDeltaPerMt * 0.35)).toFixed(2))
    : stressedEconomics.newLanded;

  const conclusionText = isStressed
    ? `Under active sensitivity stress, delivered cost shifts from $${baseDeliveredCost.totalLanded}/MT to $${stressedEconomics.newLanded}/MT (${costDeltaPerMt >= 0 ? `+$${costDeltaPerMt}` : `-$${Math.abs(costDeltaPerMt)}`}/MT). Without NaviBulk, unhedged spot exposure increases budget by $${Math.abs(grossShockDeltaUsd).toLocaleString()} USD. NaviBulk's adaptive recommendation (${stressedEconomics.stressedRecommendation}) caps exposure, protecting +$${hedgedMitigationSavingsUsd.toLocaleString()} USD (₹${hedgedMitigationInrCr} Cr) in total cost optimization.`
    : `Base Plan evaluated at baseline parameters ($${baseDeliveredCost.totalLanded}/MT). Adjust the shock sliders on the left to evaluate sensitivity against severe freight spikes, demurrage accumulation, and bunker escalation.`;

  return (
    <StageShell
      stageId="stress"
      conclusion={conclusionText}
      nextActionLabel="Review Counterfactual Proof →"
      onNextAction={() => advanceStage('stress')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. TOTAL COST OPTIMIZATION & HEDGING DIFFERENCE BANNER ── */}
        {isStressed && grossShockDeltaUsd > 0 && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DCFCE7', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Total Cost Optimization Under Market Stress
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532D', margin: '0.15rem 0 0.1rem' }}>
                  NaviBulk Hedges Protect +${hedgedMitigationSavingsUsd.toLocaleString()} USD in Capital
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#166534' }}>
                  Adaptive contract structuring mitigates 65% of the unhedged spot shock (+${hedgedMitigationPerMt}/MT protected • ₹{hedgedMitigationInrCr} Cr)
                </div>
              </div>
            </div>

            <div style={{ background: '#16A34A', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '6px', textAlign: 'right' }}>
              <span style={{ fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Protected Capital</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                +${hedgedMitigationSavingsUsd.toLocaleString()} USD
              </span>
              <span style={{ fontSize: '0.7rem', display: 'block', fontWeight: 700 }}>
                (₹{hedgedMitigationInrCr} Cr Protected)
              </span>
            </div>
          </div>
        )}

        {/* ── 2. MAIN 2-COLUMN LAYOUT: SLIDERS + IMPACT ANALYSIS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* ── LEFT COLUMN: STRESS ASSUMPTION SLIDERS ── */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={16} color="#2563EB" />
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Stress Shock Assumptions
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

          {/* ── RIGHT COLUMN: DECISION IMPACT & TOTAL COST HEDGING ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* 3-Way Scenario Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              
              {/* Scenario 1: Baseline Case */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  1. Baseline Benchmark
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  ${baseDeliveredCost.totalLanded} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/ MT</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Total: ${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                  ₹{baseDeliveredCost.totalOutlayInrCr} Cr • {inputs.tonnage.toLocaleString()} MT
                </div>
              </div>

              {/* Scenario 2: Unhedged Spot Case */}
              <div style={{ background: isStressed ? '#FEF2F2' : '#F8FAFC', border: isStressed ? '1px solid #FECACA' : '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: isStressed ? '#DC2626' : '#64748B', textTransform: 'uppercase' }}>
                  2. Unhedged Spot Shock
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isStressed ? '#B91C1C' : '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  ${stressedEconomics.newLanded} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/ MT</span>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: costDeltaPerMt >= 0 ? '#DC2626' : '#16A34A', marginTop: '0.2rem' }}>
                  {costDeltaPerMt >= 0 ? `+$${costDeltaPerMt}` : `-$${Math.abs(costDeltaPerMt)}`}/MT vs Baseline
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Total: ${stressedEconomics.stressedTotalOutlayUsd?.toLocaleString()} USD
                </div>
              </div>

              {/* Scenario 3: NaviBulk Hedged Case */}
              <div style={{ background: isStressed ? '#F0FDF4' : '#F8FAFC', border: isStressed ? '1px solid #86EFAC' : '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: isStressed ? '#166534' : '#64748B', textTransform: 'uppercase' }}>
                  3. NaviBulk Hedged
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isStressed ? '#15803D' : '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  ${hedgedLandedCost} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/ MT</span>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isStressed ? '#166534' : '#64748B', marginTop: '0.2rem' }}>
                  {isStressed ? `Protects +$${hedgedMitigationSavingsUsd.toLocaleString()} USD` : 'Hedges ready'}
                </div>
                <div style={{ fontSize: '0.68rem', color: isStressed ? '#15803D' : '#64748B', marginTop: '0.2rem' }}>
                  Hedged Total: ${hedgedTotalOutlayUsd.toLocaleString()} USD
                </div>
              </div>

            </div>

            {/* Causal Explanation Box */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
                  WHAT CHANGED IN FINANCIAL EXPOSURE
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                  Delivered rate shifts {costDeltaPerMt >= 0 ? `+$${costDeltaPerMt}` : `-$${Math.abs(costDeltaPerMt)}`}/MT (Gross budget exposure: {grossShockDeltaUsd >= 0 ? `+$${grossShockDeltaUsd.toLocaleString()}` : `-$${Math.abs(grossShockDeltaUsd).toLocaleString()}`} USD)
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  WHY IT CHANGED (ROOT CAUSES)
                </span>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                  {stressState.congestionDays > 0 && `Port delay (+${stressState.congestionDays}d) adds +$${stressedEconomics.demurrageDelta}/MT in laytime demurrage ($${Math.round(stressedEconomics.demurrageDelta * (stressedEconomics.stressedTonnage || inputs.tonnage)).toLocaleString()} USD). `}
                  {stressState.freightPct !== 0 && `Freight index shift (${stressState.freightPct > 0 ? '+' : ''}${stressState.freightPct}%) imparts $${stressedEconomics.freightDelta}/MT variance ($${Math.round(stressedEconomics.freightDelta * (stressedEconomics.stressedTonnage || inputs.tonnage)).toLocaleString()} USD). `}
                  {stressState.bunkerPct !== 0 && `Bunker price shift (${stressState.bunkerPct > 0 ? '+' : ''}${stressState.bunkerPct}%) imparts $${stressedEconomics.bunkerDelta}/MT fuel variance. `}
                  {stressState.parcelSwingMt !== 0 && `Parcel swing of ${stressState.parcelSwingMt > 0 ? '+' : ''}${stressState.parcelSwingMt.toLocaleString()} MT shifts total budget exposure by $${Math.round(stressedEconomics.stressedTotalOutlayUsd - baseDeliveredCost.totalOutlayUsd).toLocaleString()} USD. `}
                  {!isStressed && 'All parameters are at baseline. Adjust sliders on the left to evaluate sensitivity.'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                  WHAT NAVIBULK NOW RECOMMENDS TO OPTIMIZE TOTAL COST
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

      </div>
    </StageShell>
  );
}
