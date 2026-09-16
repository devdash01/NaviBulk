// SAIL NaviBulk — Stage 04: True Voyage Economics
// Fully deconstructs delivered cost per tonne into operational cost components
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { Layers, AlertCircle, TrendingDown, DollarSign, Info } from 'lucide-react';

export default function EconomicsStage() {
  const {
    inputs,
    rankedVessels,
    recommendedVessel,
    capesizeCandidate,
    panamaxCandidate,
    baseDeliveredCost,
    advanceStage
  } = useDecisionEngine();

  // Dynamic insight: check if Capesize has lower nominal freight but higher landed cost due to lightering
  const hasCheaperHeadlineTrap = capesizeCandidate && panamaxCandidate &&
    capesizeCandidate.costPerTonneUsd < panamaxCandidate.costPerTonneUsd &&
    capesizeCandidate.feasibility.requiresSagarTransshipment;

  const conclusionText = `True delivered cost for ${recommendedVessel?.vesselName || 'Panamax'} is calculated at $${baseDeliveredCost.totalLanded}/MT (Freight $${baseDeliveredCost.freightPortion} + Bunker $${baseDeliveredCost.bunkerPortion} + Port Dues $${baseDeliveredCost.portDuesPortion} + Demurrage $${baseDeliveredCost.demurragePortion}${baseDeliveredCost.lighteringFee > 0 ? ` + Lightering $${baseDeliveredCost.lighteringFee}` : ''}), yielding a total consignment outlay of $${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD (₹${baseDeliveredCost.totalOutlayInrCr} Cr).`;

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
              Consignment: <strong>{inputs.tonnage.toLocaleString()} MT</strong>
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

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Bunker (VLSFO)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                ${baseDeliveredCost.bunkerPortion}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94A3B8', marginTop: '0.2rem' }}>18% Fuel Burn</div>
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
              Total Financial Commitment:
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

        {/* ── 2. "CHEAPEST FREIGHT ≠ CHEAPEST DELIVERED OUTCOME" INSIGHT ── */}
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

        {/* ── 3. FLEET ECONOMIC COMPARISON TABLE ── */}
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
