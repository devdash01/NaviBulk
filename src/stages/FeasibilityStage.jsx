// SAIL NaviBulk — Stage 03: Maritime Feasibility
// Verifies physical berthing geometry, draft clearance, Sagar lightering, and corridor hazards
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import BerthWaterlineCrossSection from '../components/BerthWaterlineCrossSection.jsx';
import { EAST_COAST_PORTS } from '../data/portConstraints.js';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Ship, Waves, Info } from 'lucide-react';

export default function FeasibilityStage() {
  const {
    inputs,
    rankedVessels,
    recommendedVessel,
    routeRisks,
    advanceStage
  } = useDecisionEngine();

  const destPort = EAST_COAST_PORTS[inputs.destinationPortKey] || EAST_COAST_PORTS.paradip;
  const destDraft = destPort.maxDraft || destPort.maxDraftM || destPort.cargoBerths?.maxDraft || 14.5;

  const conclusionText = recommendedVessel?.feasibility?.feasible
    ? `${recommendedVessel.vesselName} is physically feasible for ${destPort.name} with a laden draft of ${recommendedVessel.feasibility.vesselDraftM}m against maximum berth draft of ${destDraft}m (Under-Keel Clearance: +${recommendedVessel.feasibility.clearanceM}m). ${recommendedVessel.feasibility.requiresSagarTransshipment ? 'Requires Sagar Island anchorage transshipment lightering.' : 'Direct deepwater berth discharge confirmed without lightering penalty.'}`
    : `Direct berthing for ${recommendedVessel?.vesselName || 'selected vessel'} exceeds destination port physical boundaries. Lightering or parcel transshipment required.`;

  return (
    <StageShell
      stageId="feasibility"
      conclusion={conclusionText}
      nextActionLabel="Calculate True Voyage Economics →"
      onNextAction={() => advanceStage('feasibility')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. ROUTE OPERATIONAL HAZARDS STRIP ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Shield size={16} color="#2563EB" />
              <h2 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Corridor Risk Assessment: {inputs.originCountry} → {destPort.name}
              </h2>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
              [Heuristic Model — Historical Risk Indices]
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {routeRisks?.riskCards?.map((card, idx) => (
              <div 
                key={idx}
                style={{
                  background: card.level === 'High' ? '#FEF2F2' : card.level === 'Medium' ? '#FFFBEB' : '#F8FAFC',
                  border: card.level === 'High' ? '1px solid #FECACA' : card.level === 'Medium' ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    {card.title}
                  </span>
                  <span 
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '3px',
                      background: card.level === 'High' ? '#DC2626' : card.level === 'Medium' ? '#B45309' : '#16A34A',
                      color: '#FFFFFF'
                    }}
                  >
                    {card.level} ({card.score}/100)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.4, marginTop: '0.35rem' }}>
                  {card.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. VESSEL PHYSICAL CLEARANCE WATERLINE & COMPARISON ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
          
          {/* Waterline Cross-Section Visualizer */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Precision Keel Clearance Gauge
              </div>
              <span style={{ fontSize: '0.7rem', background: '#EFF6FF', color: '#1D4ED8', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: 700 }}>
                {recommendedVessel?.vesselName || 'Panamax'}
              </span>
            </div>
            <BerthWaterlineCrossSection
              vesselClass={recommendedVessel?.vesselKey || 'panamax'}
              destinationPortKey={inputs.destinationPortKey}
              compact={false}
            />
          </div>

          {/* Vessel Suitability Matrix */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              Fleet Suitability & Berth Geometry Evaluation
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Vessel Class</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>DWT</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Draft</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Port Clearance</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Lightering</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rankedVessels.map((v, i) => {
                  const isWinner = v.vesselKey === recommendedVessel?.vesselKey;
                  const isFeasible = v.feasibility.feasible;
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
                        {v.vesselName} {isWinner && <span style={{ fontSize: '0.65rem', background: '#2563EB', color: '#FFF', padding: '0.1rem 0.35rem', borderRadius: '3px', marginLeft: '0.35rem' }}>NOMINATED</span>}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                        {v.dwt?.toLocaleString()} MT
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                        {v.feasibility.vesselDraftM}m
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                        {v.feasibility.clearanceM >= 0 ? `+${v.feasibility.clearanceM}m` : `${v.feasibility.clearanceM}m`}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', color: v.feasibility.requiresSagarTransshipment ? '#B45309' : '#64748B' }}>
                        {v.feasibility.requiresSagarTransshipment ? 'Transshipment' : 'None'}
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        {isFeasible ? (
                          <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={13} /> Feasible
                          </span>
                        ) : (
                          <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <XCircle size={13} /> Draft Exceeded
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#64748B', lineHeight: 1.45 }}>
              * Under-Keel Clearance (UKC) is calculated dynamically: Max Destination Berth Draft ({destDraft}m) minus Vessel Full-Load Draft. Vessels exceeding draft require Sagar transshipment or lightering.
            </div>
          </div>

        </div>

      </div>
    </StageShell>
  );
}
