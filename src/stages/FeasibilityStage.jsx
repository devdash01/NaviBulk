// SAIL NaviBulk — Stage 03: Maritime Feasibility
// Verifies physical berthing geometry, draft clearance, Sagar lightering, and corridor hazards
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import BerthWaterlineCrossSection from '../components/BerthWaterlineCrossSection.jsx';
import VoyageRouteMap from '../components/VoyageRouteMap.jsx';
import { EAST_COAST_PORTS } from '../data/portConstraints.js';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Ship, 
  Waves, 
  Anchor, 
  Clock, 
  Compass, 
  Navigation,
  Info,
  MapPin,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function FeasibilityStage() {
  const {
    inputs,
    rankedVessels,
    recommendedVessel,
    routeRisks,
    advanceStage,
    handleRequirementChange,
    setSpeedKnots
  } = useDecisionEngine();

  const destPort = EAST_COAST_PORTS[inputs.destinationPortKey] || EAST_COAST_PORTS.paradip;
  const destDraft = destPort.maxDraft || destPort.maxDraftM || destPort.cargoBerths?.maxDraft || 14.5;
  const vesselDraft = recommendedVessel?.feasibility?.vesselDraftM || 13.0;
  const ukcClearance = Number((destDraft - vesselDraft).toFixed(2));
  const requiresLightering = recommendedVessel?.feasibility?.requiresSagarTransshipment || destDraft < vesselDraft;

  const conclusionText = recommendedVessel?.feasibility?.feasible
    ? `${recommendedVessel.vesselName} is physically feasible for ${destPort.name} with a laden draft of ${vesselDraft}m against maximum berth draft of ${destDraft}m (Under-Keel Clearance: +${ukcClearance}m). ${requiresLightering ? 'Requires Sagar Island anchorage transshipment lightering.' : 'Direct deepwater berth discharge confirmed without lightering penalty.'}`
    : `Direct berthing for ${recommendedVessel?.vesselName || 'selected vessel'} exceeds destination port physical boundaries (${destDraft}m berth draft vs ${vesselDraft}m vessel draft). Lightering or parcel transshipment required.`;

  const availablePorts = [
    { key: 'paradip', name: 'Paradip', draft: '14.5m', type: 'Mechanized Bulk' },
    { key: 'vizag', name: 'Visakhapatnam', draft: '18.1m', type: 'Deepwater VGCB' },
    { key: 'gangavaram', name: 'Gangavaram', draft: '19.5m', type: 'Deepest East Coast' },
    { key: 'dhamra', name: 'Dhamra', draft: '18.0m', type: 'Deepwater Berth' },
    { key: 'gopalpur', name: 'Gopalpur', draft: '12.5m', type: 'Commercial Berth' },
    { key: 'haldia', name: 'Haldia', draft: '8.5m', type: 'Riverine / Lightering' },
  ];

  return (
    <StageShell
      stageId="feasibility"
      conclusion={conclusionText}
      nextActionLabel="Calculate True Voyage Economics →"
      onNextAction={() => advanceStage('feasibility')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. INTERACTIVE DESTINATION PORT SWITCHER & BERTH GEOMETRY CONSOLE ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Discharge Terminal Feasibility Switcher
              </span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Nominated Port: {destPort.name} ({destPort.state})
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748B' }}>
              <span>Click a port to test live physical feasibility:</span>
            </div>
          </div>

          {/* Port Selection Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem' }}>
            {availablePorts.map((p) => {
              const isSelected = inputs.destinationPortKey === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => handleRequirementChange({ destinationPortKey: p.key })}
                  style={{
                    background: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '0.6rem 0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? '#1D4ED8' : '#0F172A' }}>
                      {p.name}
                    </span>
                    <span style={{ 
                      fontSize: '0.66rem', 
                      fontWeight: 800, 
                      padding: '0.1rem 0.35rem', 
                      borderRadius: '3px',
                      background: isSelected ? '#2563EB' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#475569'
                    }}>
                      {p.draft}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isSelected ? '#1E40AF' : '#64748B', marginTop: '0.2rem' }}>
                    {p.type}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Port Operational Parameters Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9' }}>
            
            <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Max Berth Draft
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                {destDraft} m
              </div>
              <span style={{ fontSize: '0.66rem', color: '#64748B' }}>
                {destPort.cargoBerths?.status?.slice(0, 24) || 'Direct Cargo Berth Limit'}
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Under-Keel Clearance (UKC)
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: ukcClearance >= 0 ? '#16A34A' : '#DC2626', fontFamily: 'var(--font-mono)' }}>
                {ukcClearance >= 0 ? `+${ukcClearance}m` : `${ukcClearance}m`}
              </div>
              <span style={{ fontSize: '0.66rem', color: ukcClearance >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                {ukcClearance >= 0 ? 'Safe Keel Clearance' : 'Draft Deficit — Lightering Required'}
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Max LOA & Beam
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                {destPort.maxLOA || 300}m / {destPort.maxBeam || 48}m
              </div>
              <span style={{ fontSize: '0.66rem', color: '#64748B' }}>
                Berth physical envelope
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Lightering Status
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: requiresLightering ? '#B45309' : '#16A34A' }}>
                {requiresLightering ? 'Required ($4.20/MT)' : 'Zero Lightering ($0.00)'}
              </div>
              <span style={{ fontSize: '0.66rem', color: '#64748B' }}>
                {requiresLightering ? 'Transshipment at Sagar Anchorage' : 'Direct Deepwater Berthing'}
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Discharge Handling
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                {(destPort.handlingCapacityTpd || 35000).toLocaleString()} TPD
              </div>
              <span style={{ fontSize: '0.66rem', color: '#64748B' }}>
                Mechanical grab unloader
              </span>
            </div>

          </div>
        </div>

        {/* ── 2. MARITIME NAVIGATION ROUTE SEA CHART (INTEGRATED ROUTE MAP) ── */}
        <div>
          <VoyageRouteMap
            originCountry={inputs.originCountry}
            destinationPortKey={inputs.destinationPortKey}
            vesselClass={recommendedVessel?.vesselKey || 'panamax'}
            speedKnots={inputs.speedKnots}
            onSpeedChange={setSpeedKnots}
            onSelectPort={(portKey) => handleRequirementChange({ destinationPortKey: portKey })}
            theme="light"
          />
        </div>

        {/* ── 3. ROUTE OPERATIONAL HAZARDS & RISK AUDIT (FIXED AND RICH) ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Shield size={16} color="#2563EB" />
              <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Corridor Risk & Statutory Hazard Audit: {inputs.originCountry} → {destPort.name}
              </h2>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
              [Heuristic Assessment • Historical Sea-Lane & Port Benchmarks]
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            {routeRisks?.riskCards?.map((card, idx) => {
              const isHigh = card.level?.includes('High');
              const isMed = card.level?.includes('Moderate') || card.level?.includes('Medium');
              const cardBorder = isHigh ? '#FECACA' : isMed ? '#FDE68A' : '#E2E8F0';
              const cardBg = isHigh ? '#FEF2F2' : isMed ? '#FFFBEB' : '#F8FAFC';
              const badgeBg = isHigh ? '#DC2626' : isMed ? '#B45309' : '#16A34A';

              return (
                <div 
                  key={idx}
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '6px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A' }}>
                          {card.title}
                        </span>
                        <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '0.1rem' }}>
                          {card.sourceLabel}
                        </div>
                      </div>
                      <span 
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          background: badgeBg,
                          color: '#FFFFFF',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {card.level} ({card.score}/100)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.45, marginTop: '0.5rem' }}>
                      {card.message || 'Operational parameters operating within standard marine tolerances.'}
                    </div>
                  </div>

                  {card.mitigation && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed rgba(0,0,0,0.1)', fontSize: '0.72rem', color: '#1E40AF', background: 'rgba(239, 246, 255, 0.6)', padding: '0.5rem', borderRadius: '4px' }}>
                      <strong style={{ color: '#1D4ED8' }}>Mitigation Protocol:</strong> {card.mitigation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. VESSEL PHYSICAL CLEARANCE WATERLINE & FLEET COMPARISON ── */}
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
