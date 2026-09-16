// SAIL NaviBulk — Stage 07: Alternative Source Analysis
// Evaluates cross-basin arbitrage opportunities against the authoritative Base Plan benchmark
import React, { useState } from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { Globe, GitBranch, CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

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

  const conclusionText = adoptedCandidateBranch
    ? `Candidate Branch Active: Comparing candidate origin ${adoptedCandidateBranch.country} (Delivered $${adoptedCandidateBranch.engineCostPerTonne?.toFixed(2)}/MT) against authoritative Base Plan (${inputs.originCountry} at $${baseDeliveredCost.totalLanded}/MT). Base Plan remains authoritative while technical blend qualification is evaluated.`
    : `Alternative origin analysis evaluated 5 global supply basins against the optimized Base Plan (${inputs.originCountry} @ $${baseDeliveredCost.totalLanded}/MT). While candidate origins like Mozambique or Russia show freight variance, metallurgical blend clearance and trade compliance screening are mandatory before switching suppliers.`;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase' }}>Benchmark Landed Cost</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.totalLanded} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/ MT</span>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', background: '#0F172A', color: '#FFF', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
              AUTHORITATIVE
            </span>
          </div>
        </div>

        {/* ── 2. SEPARATOR: CAN WE IMPROVE THIS PLAN? ── */}
        <div style={{ textAlign: 'center', margin: '0.25rem 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.35rem 1rem', borderRadius: '20px' }}>
            <Globe size={15} color="#2563EB" />
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CAN WE IMPROVE THIS PLAN?
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.4rem 0 0' }}>
            NaviBulk evaluates eligible alternative global supply origins against the optimized Base Plan benchmark.
          </p>
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
                <th style={{ padding: '0.65rem 0.5rem' }}>Delivered Est.</th>
                <th style={{ padding: '0.65rem 0.5rem' }}>Δ vs Base</th>
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

                    {/* Delivered Est */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                      {candidate.engineCostPerTonne !== null ? `$${candidate.engineCostPerTonne?.toFixed(2)}/MT` : 'N/A'}
                    </td>

                    {/* Delta */}
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: delta === null || delta === 0 ? '#64748B' : delta < 0 ? '#16A34A' : '#DC2626' }}>
                      {isBase ? '—' : delta !== null ? `${delta > 0 ? '+' : ''}$${delta.toFixed(2)}` : 'N/A'}
                    </td>

                    {/* Quality / Spec */}
                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#0F172A', fontWeight: 600 }}>{candidate.specGrade}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{candidate.compatibility}</div>
                    </td>

                    {/* Qualification */}
                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '180px', fontSize: '0.7rem', color: '#475569' }}>
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
                            {isAdopted ? 'Branch Active' : 'Adopt as Candidate'}
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
                            Initiate EOI
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
            <strong>Branching Integrity Rule:</strong> "Adopt as Candidate" activates an analytical comparison branch only. It does NOT overwrite the original Base Plan ({inputs.originCountry}), nor does it silently alter global inputs. The original source remains the authoritative benchmark.
          </div>
        </div>

      </div>
    </StageShell>
  );
}
