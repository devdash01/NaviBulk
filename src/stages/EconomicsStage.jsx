// SAIL NaviBulk — Stage 04: True Voyage Economics
// Fully deconstructs delivered cost per tonne into operational cost components,
// with integrated hydrodynamic speed & bunker consumption optimization (Admiralty Cubic Law P ∝ V³).
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { 
  Layers, 
  AlertCircle, 
  TrendingDown, 
  DollarSign, 
  Info, 
  Gauge, 
  Zap, 
  Ship, 
  Leaf, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export default function EconomicsStage() {
  const {
    inputs,
    rankedVessels,
    recommendedVessel,
    capesizeCandidate,
    panamaxCandidate,
    baseDeliveredCost,
    setSpeedKnots,
    advanceStage
  } = useDecisionEngine();

  const currentSpeed = inputs.speedKnots || 13.0;

  // Dynamic insight: check if Capesize has lower nominal freight but higher landed cost due to lightering
  const hasCheaperHeadlineTrap = capesizeCandidate && panamaxCandidate &&
    capesizeCandidate.costPerTonneUsd < panamaxCandidate.costPerTonneUsd &&
    capesizeCandidate.feasibility.requiresSagarTransshipment;

  const conclusionText = `True delivered cost for ${recommendedVessel?.vesselName || 'Panamax'} at ${currentSpeed.toFixed(1)} kn operating speed is calculated at $${baseDeliveredCost.totalLanded}/MT (Freight $${baseDeliveredCost.freightPortion} + Bunker $${baseDeliveredCost.bunkerPortion} + Port Dues $${baseDeliveredCost.portDuesPortion} + Demurrage $${baseDeliveredCost.demurragePortion}${baseDeliveredCost.lighteringFee > 0 ? ` + Lightering $${baseDeliveredCost.lighteringFee}` : ''}), yielding a total consignment outlay of $${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD (₹${baseDeliveredCost.totalOutlayInrCr} Cr). Bunker optimization saves +$${baseDeliveredCost.speedBunkerSavingsUsd.toLocaleString()} USD vs design speed.`;

  return (
    <StageShell
      stageId="economics"
      conclusion={conclusionText}
      nextActionLabel="Build Optimized Base Plan →"
      onNextAction={() => advanceStage('economics')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. DELIVERED COST WATERFALL CARDS ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={17} color="#2563EB" />
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Delivered Cost Composition ({recommendedVessel?.vesselName || 'Nominated Vessel'})
              </h2>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
              Consignment: <strong>{inputs.tonnage.toLocaleString()} MT</strong> • Speed: <strong style={{ color: '#2563EB' }}>{currentSpeed.toFixed(1)} kn</strong>
            </div>
          </div>

          {/* Waterfall Visual Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
            
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Ocean Freight</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${baseDeliveredCost.freightPortion}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94A3B8', marginTop: '0.2rem' }}>70% Baltic Index</div>
            </div>

            <div style={{ textAlign: 'center', color: '#94A3B8', fontWeight: 800 }}>+</div>

            <div style={{ background: '#EFF6FF', border: '1.5px solid #93C5FD', borderRadius: '6px', padding: '0.85rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>Bunker (VLSFO)</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, background: '#DBEAFE', color: '#1E40AF', padding: '0.05rem 0.35rem', borderRadius: '3px' }}>DYNAMIC</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E40AF', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${baseDeliveredCost.bunkerPortion}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#2563EB', marginTop: '0.2rem', fontWeight: 600 }}>
                {baseDeliveredCost.curBurnTpd} TPD @ {currentSpeed.toFixed(1)} kn
              </div>
            </div>

            <div style={{ textAlign: 'center', color: '#94A3B8', fontWeight: 800 }}>+</div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Port Dues / Pilot</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${baseDeliveredCost.portDuesPortion}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94A3B8', marginTop: '0.2rem' }}>7% Tariff</div>
            </div>

            <div style={{ textAlign: 'center', color: '#94A3B8', fontWeight: 800 }}>+</div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Lightering Fee</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: baseDeliveredCost.lighteringFee > 0 ? '#B45309' : '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${baseDeliveredCost.lighteringFee.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94A3B8', marginTop: '0.2rem' }}>Sagar Transshipment</div>
            </div>

            <div style={{ textAlign: 'center', color: '#94A3B8', fontWeight: 800 }}>+</div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Demurrage Buffer</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${baseDeliveredCost.demurragePortion}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94A3B8', marginTop: '0.2rem' }}>Laytime Buffer</div>
            </div>

            <div style={{ textAlign: 'center', color: '#2563EB', fontWeight: 900, fontSize: '1.2rem' }}>=</div>

            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>Delivered Outcome</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E40AF', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${baseDeliveredCost.totalLanded}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#1E40AF', fontWeight: 700, marginTop: '0.2rem' }}>/ MT Landed</div>
            </div>

          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.78rem', color: '#475569' }}>
              Total Financial Commitment (Landed):
            </span>
            <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                ${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#2563EB' }}>
                ₹{baseDeliveredCost.totalOutlayInrCr} Cr INR
              </span>
            </div>
          </div>
        </div>


        {/* ── 2. HYDRODYNAMIC SPEED & ECO-STEAMING OPTIMIZATION CONSOLE ── */}
        <div 
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Gauge size={18} color="#2563EB" />
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Hydrodynamic Speed & Bunker Optimization Console
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Admiralty Cubic Law ($P \propto V^3$) • Real-time impact on Bunker $/MT and Landed Cost
                </span>
              </div>
            </div>

            {/* Speed Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginRight: '0.2rem' }}>Presets:</span>
              {[
                { label: 'Super Eco (11.5 kn)', kn: 11.5 },
                { label: '★ Optimal Eco (12.4 kn)', kn: 12.4, primary: true },
                { label: 'Design (14.0 kn)', kn: 14.0 },
                { label: 'Express (15.0 kn)', kn: 15.0 }
              ].map(preset => (
                <button
                  key={preset.kn}
                  type="button"
                  onClick={() => setSpeedKnots(preset.kn)}
                  style={{
                    background: currentSpeed === preset.kn ? (preset.primary ? '#16A34A' : '#0F172A') : '#F1F5F9',
                    color: currentSpeed === preset.kn ? '#FFFFFF' : '#334155',
                    border: '1px solid',
                    borderColor: currentSpeed === preset.kn ? 'transparent' : '#CBD5E1',
                    borderRadius: '4px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Speed Slider */}
          <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                Operating Steaming Speed:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                  {currentSpeed.toFixed(1)} Knots
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: currentSpeed === 12.4 ? '#DCFCE7' : currentSpeed <= 12.0 ? '#DBEAFE' : currentSpeed === 14.0 ? '#FEF3C7' : '#FEE2E2',
                  color: currentSpeed === 12.4 ? '#166534' : currentSpeed <= 12.0 ? '#1E40AF' : currentSpeed === 14.0 ? '#92400E' : '#991B1B'
                }}>
                  {currentSpeed === 12.4 ? '★ OPTIMAL ECO' : currentSpeed <= 12.0 ? 'SUPER ECO' : currentSpeed === 14.0 ? 'DESIGN BASELINE' : 'HIGH SPEED'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>10.5 kn</span>
              <input
                type="range"
                min="10.5"
                max="16.0"
                step="0.1"
                value={currentSpeed}
                onChange={(e) => setSpeedKnots(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#2563EB',
                  height: '6px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>16.0 kn</span>
            </div>
          </div>

          {/* 4 Dynamic Optimization Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                <Ship size={13} color="#2563EB" />
                <span>Daily Bunker Burn</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {baseDeliveredCost.curBurnTpd} <span style={{ fontSize: '0.78rem', color: '#64748B' }}>TPD</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: baseDeliveredCost.curBurnTpd <= baseDeliveredCost.designBurnTpd ? '#16A34A' : '#DC2626', fontWeight: 700, marginTop: '0.15rem' }}>
                vs {baseDeliveredCost.designBurnTpd} TPD Design ({((baseDeliveredCost.curBurnTpd - baseDeliveredCost.designBurnTpd) / baseDeliveredCost.designBurnTpd * 100).toFixed(1)}%)
              </div>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                <DollarSign size={13} color="#16A34A" />
                <span>Net Bunker Savings</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                +${baseDeliveredCost.speedBunkerSavingsUsd.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#166534', marginTop: '0.15rem' }}>
                -${baseDeliveredCost.speedBunkerSavingsPerMt}/MT Delivered Benefit
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                <Clock size={13} color="#D97706" />
                <span>Ocean Steaming Time</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {baseDeliveredCost.transitDays} <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Days</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.15rem' }}>
                Baseline: {baseDeliveredCost.baseTransitDays}d @ 14.0 kn
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                <Leaf size={13} color="#059669" />
                <span>CO₂ Emission Abatement</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                -{baseDeliveredCost.co2SavedTons} <span style={{ fontSize: '0.78rem', color: '#64748B' }}>MT</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.15rem' }}>
                IMO CII Abatement Compliant
              </div>
            </div>

          </div>
        </div>


        {/* ── 3. "CHEAPEST FREIGHT ≠ CHEAPEST DELIVERED OUTCOME" INSIGHT ── */}
        <div 
          style={{
            background: hasCheaperHeadlineTrap ? '#FFFBEB' : '#F0FDF4',
            border: hasCheaperHeadlineTrap ? '1px solid #FDE68A' : '1px solid #BBF7D0',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem'
          }}
        >
          <Info size={20} color={hasCheaperHeadlineTrap ? '#B45309' : '#16A34A'} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: hasCheaperHeadlineTrap ? '#92400E' : '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Commercial Insight: Cheapest Headline Freight ≠ Cheapest Delivered Outcome
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: hasCheaperHeadlineTrap ? '#78350F' : '#14532D', lineHeight: 1.5 }}>
              {hasCheaperHeadlineTrap ? (
                <>
                  While Capesize offers a lower nominal ocean freight rate (${capesizeCandidate.costPerTonneUsd}/MT), the draft constraint at {inputs.destinationPortKey.toUpperCase()} forces lightering at Sagar anchorage (+$4.20/MT transshipment fee + delay penalty), making {panamaxCandidate.vesselName} ($18.20/MT direct discharge) the commercially optimal choice.
                </>
              ) : (
                <>
                  Fleet economics confirm that {recommendedVessel?.vesselName || 'the selected vessel'} provides the lowest true landed cost when factoring ocean freight, demurrage exposure, port turnaround time, and draft penalties.
                </>
              )}
            </p>
          </div>
        </div>

        {/* ── 4. FLEET ECONOMIC COMPARISON TABLE ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Fleet Comparative Voyage Economics
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.5rem' }}>Vessel Class</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Nominal Freight</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Bunker & Port</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Lightering/Draft Penalty</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>True Landed / MT</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Total Voyage Outlay</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Commercial Verdict</th>
              </tr>
            </thead>
            <tbody>
              {rankedVessels.map((v, i) => {
                const isWinner = v.vesselKey === recommendedVessel?.vesselKey;
                const lightering = v.feasibility.requiresSagarTransshipment ? 4.20 : 0.0;
                const landed = Number((v.costPerTonneUsd + lightering).toFixed(2));
                const outlay = Math.round(landed * inputs.tonnage);

                return (
                  <tr 
                    key={i}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: isWinner ? '#EFF6FF' : 'transparent',
                      fontWeight: isWinner ? 700 : 400
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.5rem', color: isWinner ? '#1D4ED8' : '#0F172A' }}>
                      {v.vesselName} {isWinner && <span style={{ fontSize: '0.65rem', background: '#2563EB', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '3px', marginLeft: '0.35rem' }}>OPTIMAL</span>}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                      ${(v.costPerTonneUsd * 0.70).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                      ${(v.costPerTonneUsd * 0.25).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)', color: lightering > 0 ? '#B45309' : '#64748B' }}>
                      {lightering > 0 ? `+$${lightering.toFixed(2)}/MT` : '$0.00'}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isWinner ? '#1D4ED8' : '#0F172A' }}>
                      ${landed.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                      ${outlay.toLocaleString()} USD
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>
                      {isWinner ? (
                        <span style={{ color: '#16A34A', fontWeight: 700 }}>Lowest Landed Cost</span>
                      ) : v.feasibility.requiresSagarTransshipment ? (
                        <span style={{ color: '#B45309' }}>Transshipment Disadvantage</span>
                      ) : (
                        <span style={{ color: '#64748B' }}>Higher Unit Cost</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </StageShell>
  );
}
