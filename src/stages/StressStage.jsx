// SAIL NaviBulk — Stage 08: Stress Sensitivity Testing
// Tests robustness of base plan under severe market and operational shocks with formula-driven hedge absorption
import React from 'react';
import { useDecisionEngine, STRESS_PRESETS } from '../context/DecisionContext.jsx';
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
  TrendingDown,
  Activity,
  BookOpen,
  HelpCircle
} from 'lucide-react';

export default function StressStage() {
  const {
    inputs,
    baseDeliveredCost,
    stressState,
    updateStressState,
    resetStressState,
    applyStressPreset,
    stressedEconomics,
    advanceStage
  } = useDecisionEngine();

  const isStressed = stressState.freightPct !== 0 || stressState.congestionDays !== 0 ||
    stressState.bunkerPct !== 0 || stressState.parcelSwingMt !== 0;

  // Exact formula-driven financial figures from engine
  const grossShockDeltaUsd = Math.round(stressedEconomics.stressedTotalOutlayUsd - baseDeliveredCost.totalOutlayUsd);
  const costDeltaPerMt = stressedEconomics.costDelta || 0;
  
  const hedgedMitigationSavingsUsd = stressedEconomics.protectedCapitalUsd || 0;
  const hedgedMitigationPerMt = stressedEconomics.protectedCapitalPerMt || 0;
  const hedgedMitigationInrCr = stressedEconomics.protectedCapitalInrCr || 0;
  const hedgedTotalOutlayUsd = stressedEconomics.hedgedTotalOutlayUsd;
  const hedgedLandedCost = stressedEconomics.hedgedLanded;

  const [showPrimer, setShowPrimer] = React.useState(true);

  const conclusionText = isStressed
    ? `Under active sensitivity stress, delivered cost shifts from $${baseDeliveredCost.totalLanded}/MT to $${stressedEconomics.newLanded}/MT (${costDeltaPerMt >= 0 ? `+$${costDeltaPerMt}` : `-$${Math.abs(costDeltaPerMt)}`}/MT). Without NaviBulk, unhedged spot exposure increases budget by $${Math.abs(grossShockDeltaUsd).toLocaleString()} USD. NaviBulk's adaptive recommendation (${stressedEconomics.stressedRecommendation}) caps exposure, protecting +$${hedgedMitigationSavingsUsd.toLocaleString()} USD (₹${hedgedMitigationInrCr} Cr / -$${hedgedMitigationPerMt}/MT) in total cost optimization.`
    : `Base Plan evaluated at baseline parameters ($${baseDeliveredCost.totalLanded}/MT). Adjust the shock sliders or select a historical crisis preset to evaluate sensitivity against severe freight spikes, demurrage accumulation, and bunker escalation.`;

  return (
    <StageShell
      stageId="stress"
      conclusion={conclusionText}
      nextActionLabel="Review Counterfactual Proof"
      onNextAction={() => advanceStage('stress')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ── 0. PLAIN-ENGLISH EDUCATIONAL PRIMER (STRESS TESTING 101) ── */}
        <div 
          style={{
            background: '#F0F9FF',
            border: '1.5px solid #BAE6FD',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', maxWidth: '850px' }}>
              <div style={{ background: '#0284C7', color: '#FFF', borderRadius: '8px', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.1rem' }}>
                <BookOpen size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    PLAIN-ENGLISH PRIMER • THE MARITIME "CRASH TEST SIMULATOR"
                  </span>
                  <span style={{ background: '#E0F2FE', color: '#0284C7', fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    WHAT THIS PAGE DOES
                  </span>
                </div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0C4A6E', margin: 0 }}>
                  What happens to your ₹10–15 Cr consignment if a cyclone strikes or freight spikes?
                </h3>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#0369A1', lineHeight: 1.55 }}>
                  In bulk shipping, a 5-day port shutdown or sudden fuel surge can add <strong>₹2 to ₹4 Crore</strong> in avoidable demurrage penalties ($20,000/day idle waiting fee). <strong>Stage 08 simulates these real-world disruptions</strong> to test whether your voyage plan can survive market shocks, and shows how NaviBulk's hedges (COA coverage & Virtual Arrival speed adjustment) protect your capital.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPrimer(!showPrimer)}
              style={{
                background: 'transparent',
                border: '1px solid #7DD3FC',
                color: '#0284C7',
                borderRadius: '6px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {showPrimer ? 'Hide Guide' : 'Show Guide'}
            </button>
          </div>

          {showPrimer && (
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px dashed #BAE6FD', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: '#FFFFFF', padding: '0.75rem 0.85rem', borderRadius: '6px', border: '1px solid #E0F2FE' }}>
                <strong style={{ display: 'block', fontSize: '0.74rem', color: '#0369A1' }}>1. Pick a Crisis Preset</strong>
                <span style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45 }}>
                  Click one of the 4 historical crisis buttons below (e.g. <em>2021 Squeeze</em> or <em>Cyclone Yasi</em>) or drag the sliders.
                </span>
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.75rem 0.85rem', borderRadius: '6px', border: '1px solid #E0F2FE' }}>
                <strong style={{ display: 'block', fontSize: '0.74rem', color: '#0369A1' }}>2. Compare the 3 Outcomes</strong>
                <span style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45 }}>
                  Watch how your <strong>Planned Cost</strong> differs from the <strong>Disaster Spot Shock</strong> vs <strong>NaviBulk Protected Cap</strong>.
                </span>
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.75rem 0.85rem', borderRadius: '6px', border: '1px solid #E0F2FE' }}>
                <strong style={{ display: 'block', fontSize: '0.74rem', color: '#0369A1' }}>3. Deploy the Countermeasure</strong>
                <span style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45 }}>
                  Read NaviBulk's operational recommendation (e.g. slow steaming to arrive when the berth opens, saving $14k/day).
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── 1. TOTAL COST OPTIMIZATION & HEDGING DIFFERENCE BANNER ── */}
        {isStressed && grossShockDeltaUsd > 0 && (
          <div 
            className="analytical-card"
            style={{ 
              background: '#F0FDF4', 
              border: '1px solid #BBF7D0', 
              borderRadius: '12px', 
              padding: '1.25rem 1.5rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--success-soft)', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="section-eyebrow" style={{ fontSize: '0.68rem', color: '#166534' }}>
                  Total Cost Optimization Under Market Stress
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532D', margin: '0.15rem 0 0.1rem' }}>
                  NaviBulk Hedges Protect +${hedgedMitigationSavingsUsd.toLocaleString()} USD in Capital
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#166534' }}>
                  Adaptive contract structuring and Virtual Arrival mitigate unhedged spot shocks (+${hedgedMitigationPerMt}/MT protected • ₹{hedgedMitigationInrCr} Cr)
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--success)', color: '#FFFFFF', padding: '0.55rem 1.1rem', borderRadius: '10px', textAlign: 'right' }}>
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

        {/* ── HISTORICAL CRISIS PRESETS ── */}
        <div className="analytical-card" style={{ borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} color="var(--accent-blue)" />
              <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Historical Market Shock Presets
              </span>
            </div>
            <span className="provenance-label">EMPIRICAL CRISIS STRESSORS</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
            {STRESS_PRESETS.map((preset) => {
              const isActive = stressState.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyStressPreset(preset.id)}
                  style={{
                    background: isActive ? '#EFF6FF' : '#F8FAFC',
                    border: isActive ? '2px solid var(--accent-blue)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isActive ? 'var(--accent-blue-dark)' : 'var(--text-primary)' }}>
                      {preset.label}
                    </span>
                    <span className="pill-badge" style={{ fontSize: '0.62rem', background: isActive ? 'var(--accent-blue)' : '#E2E8F0', color: isActive ? '#FFF' : '#475569' }}>
                      {preset.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.35 }}>
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. MAIN 2-COLUMN LAYOUT: SLIDERS + IMPACT ANALYSIS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* ── LEFT COLUMN: STRESS ASSUMPTION SLIDERS ── */}
          <div className="analytical-card" style={{ borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={16} color="var(--accent-blue)" />
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Manual Sensitivity Controls
                </h2>
              </div>
              {isStressed && (
                <button
                  onClick={resetStressState}
                  className="btn-secondary"
                  style={{
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.72rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
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
                  max="85"
                  step="5"
                  value={stressState.freightPct}
                  onChange={(e) => updateStressState({ freightPct: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#2563EB' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                  <span>-30% (Market Slump)</span>
                  <span>0% (Baseline)</span>
                  <span>+85% (Supercycle)</span>
                </div>
              </div>

              {/* 2. Port Congestion Demurrage */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>Destination Port Congestion</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: stressState.congestionDays > 0 ? '#B45309' : '#64748B' }}>
                    +{stressState.congestionDays} Days Delay
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
                  <span>+6 Days (Cyclone Gale)</span>
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
                  max="50"
                  step="5"
                  value={stressState.bunkerPct}
                  onChange={(e) => updateStressState({ bunkerPct: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#2563EB' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                  <span>-20% ($663/MT)</span>
                  <span>0% ($829.50/MT)</span>
                  <span>+50% ($1,244/MT)</span>
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
              <strong>Audited Stress Engine:</strong> Calculations update synchronously. Port congestion accumulates real vessel day-hire demurrage (${Math.round(baseDeliveredCost.demurragePortion * inputs.tonnage / (baseDeliveredCost.portWaitDays || 2.2)).toLocaleString()}/day). Period COA contracts absorb spot swings proportionally.
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
                  {isStressed ? `Protects +$${hedgedMitigationSavingsUsd.toLocaleString()} USD` : 'Hedges active'}
                </div>
                <div style={{ fontSize: '0.68rem', color: isStressed ? '#15803D' : '#64748B', marginTop: '0.2rem' }}>
                  Hedged Total: ${hedgedTotalOutlayUsd?.toLocaleString()} USD
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
                  WHY IT CHANGED (MATHEMATICAL DRIVERS)
                </span>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                  {stressState.congestionDays > 0 && `Port delay (+${stressState.congestionDays}d) adds +$${stressedEconomics.demurrageDelta}/MT in laytime demurrage ($${Math.round(stressedEconomics.demurrageDelta * (stressedEconomics.stressedTonnage || inputs.tonnage)).toLocaleString()} USD). `}
                  {stressState.freightPct !== 0 && `Freight index shift (${stressState.freightPct > 0 ? '+' : ''}${stressState.freightPct}%) imparts $${stressedEconomics.freightDelta}/MT variance ($${Math.round(stressedEconomics.freightDelta * (stressedEconomics.stressedTonnage || inputs.tonnage)).toLocaleString()} USD). `}
                  {stressState.bunkerPct !== 0 && `Bunker price shift (${stressState.bunkerPct > 0 ? '+' : ''}${stressState.bunkerPct}%) imparts $${stressedEconomics.bunkerDelta}/MT fuel variance. `}
                  {stressState.parcelSwingMt !== 0 && `Parcel swing of ${stressState.parcelSwingMt > 0 ? '+' : ''}${stressState.parcelSwingMt.toLocaleString()} MT shifts total budget exposure by $${Math.round(stressedEconomics.stressedTotalOutlayUsd - baseDeliveredCost.totalOutlayUsd).toLocaleString()} USD. `}
                  {!isStressed && 'All parameters are at baseline. Adjust sliders on the left or click a historical preset above to evaluate sensitivity.'}
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
