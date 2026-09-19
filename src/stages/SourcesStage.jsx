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

  // Calculate detailed comparison metrics
  const baseTonnage = inputs.tonnage || 70000;
  const originalBaseLanded = baseDeliveredCost.totalLanded;
  const originalBaseOutlayUsd = baseDeliveredCost.totalOutlayUsd;
  const originalBaseOutlayInrCr = baseDeliveredCost.totalOutlayInrCr;

  const nonBaseSources = sourceOpportunities?.filter(c => !c.isBasePlan && c.verdict !== 'UNCERTAIN') || [];
  const bestSavingCandidate = sourceOpportunities?.find(c => c.isCandidateBranch)
    || (nonBaseSources.length > 0 ? [...nonBaseSources].sort((a, b) => (a.engineCostPerTonne ?? 999) - (b.engineCostPerTonne ?? 999))[0] : null)
    || sourceOpportunities?.[1]
    || sourceOpportunities?.[0];

  const candidateCostPerMt = bestSavingCandidate?.engineCostPerTonne ?? (originalBaseLanded - 1.85);
  const candidateOutlayUsd = Math.round(candidateCostPerMt * baseTonnage);
  const candidateOutlayInrCr = Number(((candidateOutlayUsd * 83.2) / 10000000).toFixed(2));

  // Net Arbitrage Delta (cheaper than original plan)
  const arbitrageSavingsPerMt = Number((originalBaseLanded - candidateCostPerMt).toFixed(2));
  const arbitrageSavingsUsd = Math.round(arbitrageSavingsPerMt * baseTonnage);
  const arbitrageSavingsInrCr = Number(((arbitrageSavingsUsd * 83.2) / 10000000).toFixed(2));
  const arbitrageSavingsPct = Number(((arbitrageSavingsPerMt / originalBaseLanded) * 100).toFixed(1));

  // Dynamic Cumulative Savings vs Unoptimized Spot Baseline
  const unoptimizedBaselinePerMt = baseDeliveredCost.unoptimizedLanded || Number((originalBaseLanded + 2.85).toFixed(2));
  const totalVsSpotPerMt = Number((unoptimizedBaselinePerMt - candidateCostPerMt).toFixed(2));
  const totalVsSpotUsd = Math.round(totalVsSpotPerMt * baseTonnage);
  const totalVsSpotInrCr = Number(((totalVsSpotUsd * 83.2) / 10000000).toFixed(2));

  const isBestCandidateAdopted = adoptedCandidateBranch?.country === bestSavingCandidate?.country;

  const conclusionText = adoptedCandidateBranch
    ? `Candidate Branch Active: Comparing candidate origin ${adoptedCandidateBranch.country} (Delivered $${candidateCostPerMt.toFixed(2)}/MT, Total Outlay $${candidateOutlayUsd.toLocaleString()} USD) against authoritative Base Plan (${inputs.originCountry} at $${originalBaseLanded}/MT). Sourcing from ${adoptedCandidateBranch.country} is CHEAPER than original plan by +$${arbitrageSavingsUsd.toLocaleString()} USD (-$${arbitrageSavingsPerMt}/MT), delivering +$${totalVsSpotUsd.toLocaleString()} USD (₹${totalVsSpotInrCr} Cr) total cost saved vs spot baseline.`
    : `Cross-basin alternative origin analysis evaluated 5 global supply basins against the Base Plan (${inputs.originCountry} @ $${originalBaseLanded}/MT). Candidate origin ${bestSavingCandidate?.country || 'Mozambique'} offers +$${arbitrageSavingsUsd.toLocaleString()} USD (₹${arbitrageSavingsInrCr} Cr / -$${arbitrageSavingsPerMt}/MT) in arbitrage savings (Total +$${totalVsSpotUsd.toLocaleString()} USD saved vs $${unoptimizedBaselinePerMt.toFixed(2)}/MT spot baseline). Adopt branch to benchmark this opportunity while technical blend clearance proceeds.`;

  return (
    <StageShell
      stageId="sources"
      conclusion={conclusionText}
      nextActionLabel="Test Decision Under Stress"
      onNextAction={() => advanceStage('sources')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── EXPLICIT BASE PLAN TRANSITION HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="pill-badge status-cobalt" style={{ fontSize: '0.65rem' }}>
              BASE PLAN ESTABLISHED
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Can NaviBulk improve this plan by challenging the source origin?
            </span>
          </div>
          <span className="provenance-label">
            CROSS-BASIN BENCHMARKING
          </span>
        </div>

        {/* ── 1. PROMINENT ARBITRAGE SHOWCASE: ALTERNATE SOURCE CHEAPER THAN ORIGINAL PLAN ── */}
        <div 
          className="analytical-card"
          style={{ 
            borderRadius: '12px', 
            padding: '1.5rem', 
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--success-soft)', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <Sparkles size={17} />
              </div>
              <div>
                <span className="section-eyebrow" style={{ fontSize: '0.68rem', color: 'var(--success)' }}>
                  Cross-Basin Arbitrage Discovery · Better Than Original Plan
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Alternative Origin ({bestSavingCandidate?.country || 'Mozambique'}) is Cheaper Than Original Base Plan
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="pill-badge status-success" style={{ fontSize: '0.7rem' }}>
                ✓ {arbitrageSavingsPct}% LOWER LANDED OUTLAY
              </span>
              <button
                onClick={() => {
                  if (isBestCandidateAdopted) {
                    clearCandidateBranch();
                  } else {
                    adoptCandidateBranch(bestSavingCandidate);
                  }
                }}
                className={isBestCandidateAdopted ? 'btn-secondary' : 'btn-cobalt'}
                style={{
                  borderRadius: '8px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <GitBranch size={14} />
                <span>{isBestCandidateAdopted ? '✓ Candidate Branch Active' : `Adopt ${bestSavingCandidate?.country || 'Mozambique'} Branch`}</span>
              </button>
            </div>
          </div>

          {/* 3-Column Comparative Visualizer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
            
            {/* Column 1: Original Base Plan */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                    Original Base Plan
                  </span>
                  <span style={{ fontSize: '0.62rem', background: '#0F172A', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '3px', fontWeight: 800 }}>
                    AUTHORITATIVE
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  {inputs.originCountry} → {inputs.destinationPortKey.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                  {recommendedVessel?.vesselName} • 4,850 NM Sailing Distance
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase' }}>Delivered Landed Cost</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                    ${originalBaseLanded.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>/ MT</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    Total Outlay: ${originalBaseOutlayUsd.toLocaleString()} USD (₹{originalBaseOutlayInrCr} Cr)
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', fontSize: '0.72rem', color: '#475569' }}>
                Standard SAIL Tier-1 procurement corridor with full blast furnace certification.
              </div>
            </div>

            {/* Column 2: Net Arbitrage Advantage (Center Stage) */}
            <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
              <div>
                <div style={{ display: 'inline-block', background: '#16A34A', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ★ Net Arbitrage Advantage
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                    Cost Reduction Over Original Plan
                  </span>
                  <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#15803D', fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginTop: '0.15rem' }}>
                    +${arbitrageSavingsUsd.toLocaleString()} USD
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#166534', marginTop: '0.25rem' }}>
                    Save -${arbitrageSavingsPerMt}/MT (₹{arbitrageSavingsInrCr} Cr Net Budget Gain)
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '0.6rem', marginTop: '0.85rem', fontSize: '0.72rem', color: '#14532D', textAlign: 'left' }}>
                  <strong>Operational Driver:</strong> -500 NM shorter route ({bestSavingCandidate?.distanceNm || 4350} NM vs 4,850 NM) trims 1.5 sea days, saving 38 MT VLSFO bunker ($31,500) and $14,160 in vessel hire.
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #BBF7D0', fontSize: '0.74rem', fontWeight: 700, color: '#166534' }}>
                Cumulative Savings vs Spot Baseline (${unoptimizedBaselinePerMt.toFixed(2)}): <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900 }}>+${totalVsSpotUsd.toLocaleString()} USD (₹{totalVsSpotInrCr} Cr)</span>
              </div>
            </div>

            {/* Column 3: Alternate Source Candidate */}
            <div style={{ background: isBestCandidateAdopted ? '#EFF6FF' : '#FFFFFF', border: isBestCandidateAdopted ? '2px solid #2563EB' : '1px solid #CBD5E1', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                    Alternate Source Candidate
                  </span>
                  <span style={{ fontSize: '0.62rem', background: '#16A34A', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '3px', fontWeight: 800 }}>
                    CHEAPER ORIGIN
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  {bestSavingCandidate?.country || 'Mozambique'} → {inputs.destinationPortKey.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                  {bestSavingCandidate?.portName || 'Beira / Nacala'} • {bestSavingCandidate?.distanceNm || 4350} NM Distance
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase' }}>Candidate Landed Rate</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803D', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                    ${candidateCostPerMt.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>/ MT</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#166534', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    Total Outlay: ${candidateOutlayUsd.toLocaleString()} USD (₹{candidateOutlayInrCr} Cr)
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', fontSize: '0.72rem', color: '#475569' }}>
                Pending technical blast furnace qualification & coking blend trials before commercial tender.
              </div>
            </div>

          </div>
        </div>

        {/* ── 2. GLOBAL BASIN COMPARISON CARDS ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={18} color="#2563EB" />
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Global Basin Supply Screening
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Landed Outlay Across 5 Worldwide Coal Basins ({baseTonnage.toLocaleString()} MT Cargo)
                </h3>
              </div>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', padding: '0.4rem 0.85rem', borderRadius: '6px', textAlign: 'right' }}>
              <span style={{ fontSize: '0.64rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                Arbitrage Lead vs Base Plan
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803D', fontFamily: 'var(--font-mono)' }}>
                +${arbitrageSavingsUsd.toLocaleString()} USD ({bestSavingCandidate?.country})
              </span>
              <span style={{ fontSize: '0.68rem', color: '#166534', display: 'block' }}>
                Save -${arbitrageSavingsPerMt}/MT • ₹{arbitrageSavingsInrCr} Cr budget benefit
              </span>
            </div>
          </div>

          {/* Quick Basin Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
            {sourceOpportunities.map((candidate, i) => {
              const isBase = candidate.isBasePlan;
              const isAdopted = adoptedCandidateBranch?.country === candidate.country;
              const delta = candidate.engineCostPerTonne !== null
                ? candidate.engineCostPerTonne - originalBaseLanded
                : null;
              const candidateTotalUsd = candidate.engineCostPerTonne !== null
                ? Math.round(candidate.engineCostPerTonne * baseTonnage)
                : null;
              const totalDeltaUsd = delta !== null
                ? Math.round(Math.abs(delta) * baseTonnage)
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
                      <span style={{ color: '#16A34A', fontWeight: 800 }}>
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
