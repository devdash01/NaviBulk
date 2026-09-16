// SAIL NaviBulk — Stage 07: Alternative Source Analysis
// Evaluates cross-basin arbitrage opportunities against the authoritative Base Plan benchmark
import React, { useState } from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { 
  Globe, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Sparkles,
  Scale
} from 'lucide-react';

export default function SourcesStage() {
  const {
    inputs,
    recommendedVessel,
    baseDeliveredCost,
    sourceOpportunities,
    adoptedCandidateBranch,
    adoptCandidateBranch,
    clearCandidateBranch,
    advanceStage
  } = useDecisionEngine();

  const [eoiConfirmedOrigin, setEoiConfirmedOrigin] = useState(null);

  const handleInitiateEoi = (country) => {
    setEoiConfirmedOrigin(country);
    setTimeout(() => setEoiConfirmedOrigin(null), 4000);
  };

  // Find candidate origin with maximum cost savings
  const candidatesWithSavings = sourceOpportunities
    .filter(c => !c.isBasePlan && c.engineCostPerTonne !== null && c.engineCostPerTonne < baseDeliveredCost.totalLanded)
    .sort((a, b) => a.engineCostPerTonne - b.engineCostPerTonne);
  const bestSavingCandidate = candidatesWithSavings[0];
  const maxSavingsPerMt = bestSavingCandidate 
    ? Number((baseDeliveredCost.totalLanded - bestSavingCandidate.engineCostPerTonne).toFixed(2))
    : 0;
  const maxSavingsUsd = bestSavingCandidate 
    ? Math.round(maxSavingsPerMt * inputs.tonnage)
    : 0;
  const maxSavingsInrCr = Number(((maxSavingsUsd * 83.2) / 10000000).toFixed(2));

  const conclusionText = adoptedCandidateBranch
    ? `Candidate Branch Active: Comparing candidate origin ${adoptedCandidateBranch.country} (Delivered $${adoptedCandidateBranch.engineCostPerTonne?.toFixed(2)}/MT, Total Outlay $${Math.round(adoptedCandidateBranch.engineCostPerTonne * inputs.tonnage).toLocaleString()} USD) against authoritative Base Plan (${inputs.originCountry} at $${baseDeliveredCost.totalLanded}/MT). Base Plan remains authoritative while technical blend qualification is evaluated.`
    : `Alternative origin analysis evaluated 5 global supply basins against the optimized Base Plan (${inputs.originCountry} @ $${baseDeliveredCost.totalLanded}/MT). While candidate origins like ${bestSavingCandidate?.country || 'Mozambique'} show up to +$${maxSavingsUsd.toLocaleString()} USD (₹${maxSavingsInrCr} Cr) in total landed cost optimization, metallurgical blend clearance and trade compliance screening are mandatory before switching suppliers.`;

  return (
    <StageShell
      stageId="sources"
      conclusion={conclusionText}
      nextActionLabel="Test Decision Under Stress →"
      onNextAction={() => advanceStage('sources')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. BASE PLAN BENCHMARK REFERENCE CARD ── */}
        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Authoritative Baseline Benchmark
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
              Base Plan: {inputs.originCountry} → {inputs.destinationPortKey.toUpperCase()} ({recommendedVessel?.vesselName})
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase' }}>Benchmark Landed Cost</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.totalLanded} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/ MT</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                Total Outlay: ${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD (₹{baseDeliveredCost.totalOutlayInrCr} Cr)
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', background: '#0F172A', color: '#FFF', padding: '0.35rem 0.65rem', borderRadius: '4px', fontWeight: 700 }}>
              AUTHORITATIVE
            </span>
          </div>
        </div>

        {/* ── 2. TOTAL COST OPTIMIZATION & ARBITRAGE DELTA SUMMARY ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={18} color="#2563EB" />
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Total Cost Optimization & Arbitrage Potential
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Cross-Basin Landed Outlay Comparison ({inputs.tonnage.toLocaleString()} MT Cargo)
                </h3>
              </div>
            </div>

            {bestSavingCandidate && (
              <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', padding: '0.4rem 0.85rem', borderRadius: '6px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.64rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                  Max Arbitrage Optimization
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803D', fontFamily: 'var(--font-mono)' }}>
                  +${maxSavingsUsd.toLocaleString()} USD ({bestSavingCandidate.country})
                </span>
                <span style={{ fontSize: '0.68rem', color: '#166534', display: 'block' }}>
                  Save -${maxSavingsPerMt}/MT • ₹{maxSavingsInrCr} Cr budget benefit
                </span>
              </div>
            )}
          </div>

          {/* Quick Basin Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
            {sourceOpportunities.map((candidate, i) => {
              const isBase = candidate.isBasePlan;
              const isAdopted = adoptedCandidateBranch?.country === candidate.country;
              const delta = candidate.engineCostPerTonne !== null
                ? candidate.engineCostPerTonne - baseDeliveredCost.totalLanded
                : null;
              const candidateTotalUsd = candidate.engineCostPerTonne !== null
                ? Math.round(candidate.engineCostPerTonne * inputs.tonnage)
                : null;
              const totalDeltaUsd = delta !== null
                ? Math.round(Math.abs(delta) * inputs.tonnage)
                : null;

              return (
                <div 
                  key={i}
                  style={{
                    background: isAdopted ? '#EFF6FF' : isBase ? '#F8FAFC' : '#FFFFFF',
                    border: isAdopted ? '2px solid #2563EB' : isBase ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                      {candidate.country}
                    </span>
                    {isBase && (
                      <span style={{ fontSize: '0.6rem', background: '#0F172A', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 800 }}>
                        BASE
                      </span>
                    )}
                    {isAdopted && (
                      <span style={{ fontSize: '0.6rem', background: '#2563EB', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 800 }}>
                        BRANCH
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.35rem' }}>
                    ${candidate.engineCostPerTonne?.toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/ MT</span>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    Total: ${candidateTotalUsd?.toLocaleString()} USD
                  </div>

                  <div style={{ marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: '1px solid #F1F5F9', fontSize: '0.72rem', fontWeight: 700 }}>
                    {isBase ? (
                      <span style={{ color: '#64748B' }}>Baseline Benchmark</span>
                    ) : delta < 0 ? (
                      <span style={{ color: '#16A34A' }}>
                        Save +${totalDeltaUsd?.toLocaleString()} USD (-${Math.abs(delta).toFixed(2)}/MT)
                      </span>
                    ) : (
                      <span style={{ color: '#DC2626' }}>
                        Cost +${totalDeltaUsd?.toLocaleString()} USD (+${delta?.toFixed(2)}/MT)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. EOI INLINE CONFIRMATION NOTIFICATION ── */}
        {eoiConfirmedOrigin && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '0.65rem 1rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>
              <strong>Internal EOI Drafted:</strong> Commercial expression of interest prepared for <strong>{eoiConfirmedOrigin}</strong> supplier qualification desk. (Internal workflow action — not dispatched externally).
            </span>
          </div>
        )}

        {/* ── 4. ALTERNATIVE BASIN COMPARISON MATRIX (TABLE) ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cross-Basin Arbitrage & Quality Suitability Matrix
            </h2>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
              [Engine Route Calculations • Illustrative FOB Benchmarks]
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.5rem' }}>Source Basin</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Distance</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Delivered Rate</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Total Outlay</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Total Cost Delta vs Base</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Quality / Spec</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Qualification Status</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Verdict</th>
                <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sourceOpportunities.map((candidate, idx) => {
                const isBase = candidate.isBasePlan;
                const isAdopted = adoptedCandidateBranch?.country === candidate.country;
                const delta = candidate.engineCostPerTonne !== null
                  ? candidate.engineCostPerTonne - baseDeliveredCost.totalLanded
                  : null;
                const totalOutlay = candidate.engineCostPerTonne !== null
                  ? Math.round(candidate.engineCostPerTonne * inputs.tonnage)
                  : null;
                const totalDeltaUsd = delta !== null
                  ? Math.round(delta * inputs.tonnage)
                  : null;
                const totalDeltaInrCr = totalDeltaUsd !== null
                  ? Number(((totalDeltaUsd * 83.2) / 10000000).toFixed(2))
                  : null;

                const verdictColor = candidate.verdict === 'BASE PLAN' ? '#0F172A'
                  : candidate.verdict === 'BETTER' ? '#16A34A'
                  : candidate.verdict === 'WORSE' ? '#DC2626'
                  : '#B45309';

                return (
                  <tr 
                    key={idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: isAdopted ? '#EFF6FF' : isBase ? '#F8FAFC' : 'transparent',
                      fontWeight: isBase || isAdopted ? 600 : 400
                    }}
                  >
                    {/* Source */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>
                        {candidate.country}
                        {isBase && <span style={{ fontSize: '0.62rem', background: '#0F172A', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '3px', marginLeft: '0.35rem' }}>BASE PLAN</span>}
                        {isAdopted && <span style={{ fontSize: '0.62rem', background: '#2563EB', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '3px', marginLeft: '0.35rem' }}>ACTIVE BRANCH</span>}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{candidate.portName}</div>
                    </td>

                    {/* Distance */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                      {candidate.distanceNm?.toLocaleString()} NM
                    </td>

                    {/* Delivered Est Rate */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                      {candidate.engineCostPerTonne !== null ? `$${candidate.engineCostPerTonne?.toFixed(2)}/MT` : 'N/A'}
                    </td>

                    {/* Total Outlay */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                      ${totalOutlay?.toLocaleString()} USD
                    </td>

                    {/* Total Cost Optimization Delta */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                      {isBase ? (
                        <span style={{ color: '#64748B', fontWeight: 600 }}>— Benchmark</span>
                      ) : delta !== null ? (
                        <div>
                          <span style={{ fontWeight: 800, color: delta < 0 ? '#16A34A' : '#DC2626' }}>
                            {delta > 0 ? '+' : ''}${delta.toFixed(2)}/MT
                          </span>
                          <div style={{ fontSize: '0.68rem', color: delta < 0 ? '#166534' : '#991B1B', fontWeight: 600 }}>
                            {delta < 0 ? `Save +$${Math.abs(totalDeltaUsd).toLocaleString()} (₹${Math.abs(totalDeltaInrCr)} Cr)` : `Cost -$${Math.abs(totalDeltaUsd).toLocaleString()} (₹${Math.abs(totalDeltaInrCr)} Cr)`}
                          </div>
                        </div>
                      ) : 'N/A'}
                    </td>

                    {/* Quality / Spec */}
                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '190px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#0F172A', fontWeight: 600 }}>{candidate.specGrade}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{candidate.compatibility}</div>
                    </td>

                    {/* Qualification */}
                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '170px', fontSize: '0.7rem', color: '#475569' }}>
                      {candidate.qualificationStatus}
                    </td>

                    {/* Verdict */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span 
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          background: `${verdictColor}15`,
                          color: verdictColor,
                          border: `1px solid ${verdictColor}30`
                        }}
                      >
                        {candidate.verdict}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      {!isBase && (
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              if (isAdopted) {
                                clearCandidateBranch();
                              } else {
                                adoptCandidateBranch(candidate);
                              }
                            }}
                            style={{
                              background: isAdopted ? '#1E40AF' : '#FFFFFF',
                              color: isAdopted ? '#FFFFFF' : '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {isAdopted ? 'Branch Active' : 'Adopt Branch'}
                          </button>

                          <button
                            onClick={() => handleInitiateEoi(candidate.country)}
                            style={{
                              background: '#F8FAFC',
                              color: '#334155',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            EOI
                          </button>
                        </div>
                      )}
                      {isBase && (
                        <span style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic' }}>
                          Authoritative
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.72rem', color: '#64748B' }}>
            <strong>Branching Integrity Rule:</strong> "Adopt Branch" activates an analytical comparison branch only. It does NOT overwrite the original Base Plan ({inputs.originCountry}), nor does it silently alter global inputs. The original source remains the authoritative benchmark.
          </div>
        </div>

      </div>
    </StageShell>
  );
}
