// SAIL NaviBulk — Vessel Class Choosing & Keel Clearance Decision Studio
// Prominently visualizes why Panamax is nominated over Capesize, Supramax, and Handysize
// with interactive SVG waterline simulation, physical clearance math, and Sagar lightering proofs.

import React, { useState } from 'react';
import { 
  Ship, 
  Anchor, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Scale, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Info,
  ChevronRight,
  TrendingDown,
  Zap
} from 'lucide-react';
import BerthWaterlineCrossSection from './BerthWaterlineCrossSection.jsx';
import { EAST_COAST_PORTS, VESSEL_CLASSES } from '../data/portConstraints.js';

export default function VesselClassDecisionStudio({
  destinationPortKey = 'paradip',
  recommendedVessel,
  rankedVessels = [],
  inputs = {},
  onSelectVesselClass
}) {
  // Active selected vessel class to preview in the waterline gauge
  const [selectedPreviewClass, setSelectedPreviewClass] = useState(
    recommendedVessel?.vesselKey || 'panamax'
  );

  const destPort = EAST_COAST_PORTS[destinationPortKey] || EAST_COAST_PORTS.paradip;
  const maxBerthDraft = Number(destPort.maxDraft || destPort.cargoBerths?.maxDraft || 14.5);
  const activeVesselData = VESSEL_CLASSES[selectedPreviewClass] || VESSEL_CLASSES.panamax;

  // Exact laden draft and clearance for the active preview
  const previewDraft = Number(activeVesselData.draftReq || 13.8);
  const draftDiff = Number((maxBerthDraft - previewDraft).toFixed(2));
  const isFeasibleDirect = draftDiff >= 0;
  const isWinner = selectedPreviewClass === (recommendedVessel?.vesselKey || 'panamax');

  // Vessel details list for interactive selection
  const vesselOptions = [
    {
      key: 'panamax',
      name: 'Panamax / Kamsarmax',
      dwt: 75000,
      draft: 13.8,
      ladenDraft: 14.15,
      loa: 229,
      beam: 32.3,
      status: 'NOMINATED WORKHORSE',
      statusType: 'success',
      badge: '100% DIRECT BERTH QUALIFIED',
      lighteringCost: 0,
      lighteringDays: 0,
      handlingRate: '35,000 MT/day',
      turnaroundDays: 2.0,
      freightBasis: '$19.48 / MT',
      verdict: 'Optimal vessel class. 100% direct berthing at Paradip CB-1/2 without lightering penalty. Maximum parcel capacity under berth draft limit.'
    },
    {
      key: 'capesize',
      name: 'Capesize Bulk Carrier',
      dwt: 180000,
      draft: 17.5,
      ladenDraft: 18.20,
      loa: 292,
      beam: 45.0,
      status: 'DRAFT RESTRICTED',
      statusType: 'danger',
      badge: 'SAGAR LIGHTERING MANDATORY',
      lighteringCost: 266000,
      lighteringDays: 3.5,
      handlingRate: '18,000 MT/day (Anchorage)',
      turnaroundDays: 5.5,
      freightBasis: '$23.28 / MT (inc. lightering)',
      verdict: 'Physical draft (18.2m) exceeds Paradip berth draft (14.5m) by -3.7m. Mandates Sagar Island floating crane lightering, adding +$266k in transshipment fees and +3.5 days demurrage risk.'
    },
    {
      key: 'supramax',
      name: 'Supramax / Ultramax',
      dwt: 58000,
      draft: 12.2,
      ladenDraft: 12.80,
      loa: 199,
      beam: 32.2,
      status: 'SUB-OPTIMAL PARCEL',
      statusType: 'warning',
      badge: 'FEASIBLE BUT PARCEL DEFICIT',
      lighteringCost: 0,
      lighteringDays: 0,
      handlingRate: '25,000 MT/day',
      turnaroundDays: 2.8,
      freightBasis: '$21.58 / MT',
      verdict: 'Fully physically clear with +1.7m UKC, but restricted to 58,000 MT parcel capacity. Shipping 70,000 MT requires short-loading or multi-port split, increasing unit freight by +$2.10/MT.'
    },
    {
      key: 'handysize',
      name: 'Handysize Geared Carrier',
      dwt: 35000,
      draft: 10.0,
      ladenDraft: 10.50,
      loa: 180,
      beam: 28.0,
      status: 'TRANSSHALL REGIONAL ONLY',
      statusType: 'neutral',
      badge: 'UNECONOMIC FOR 70K MT TRADE',
      lighteringCost: 0,
      lighteringDays: 0,
      handlingRate: '15,000 MT/day',
      turnaroundDays: 4.7,
      freightBasis: '$26.80 / MT',
      verdict: 'Exempt from draft restrictions (+4.0m UKC), but economically unfeasible for transocean Australia-India trade. Requires chartering 2 separate ships to deliver the mandated 70,000 MT cargo.'
    }
  ];

  const currentOption = vesselOptions.find(v => v.key === selectedPreviewClass) || vesselOptions[0];

  return (
    <div 
      className="analytical-card" 
      style={{ 
        borderRadius: '12px', 
        padding: '1.5rem', 
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
        background: '#FFFFFF',
        border: '1.5px solid #CBD5E1'
      }}
    >
      {/* Eyebrow & Main Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(14,165,233,0.12) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', border: '1px solid rgba(37,99,235,0.25)' }}>
              <Ship size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>PRIMARY COMMERCIAL DECISION COCKPIT</span>
                <span>•</span>
                <span>BERTH-TO-KEEL FEASIBILITY</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0.15rem 0 0', letterSpacing: '-0.02em' }}>
                Vessel Class Suggestion & Berth Waterline Architecture
              </h2>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.45rem 0 0', paddingLeft: '3.1rem', lineHeight: 1.45, maxWidth: '820px' }}>
            Automated verification of bulk carrier geometries against nominated terminal: <strong>{destPort.name}</strong> (Max Berth Draft: <strong>{maxBerthDraft}m</strong>). Click any vessel below to simulate keel clearance, Sagar lightering costs, and physical nomination proofs in real time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="pill-badge status-cobalt" style={{ fontSize: '0.72rem', padding: '0.3rem 0.75rem', fontWeight: 800 }}>
            ★ NOMINATED: {recommendedVessel?.vesselName || 'Panamax'}
          </span>
          <span className="provenance-label" style={{ fontSize: '0.68rem' }}>
            PHYSICAL HYDRODYNAMIC GATING
          </span>
        </div>
      </div>

      {/* 4 Interactive Vessel Class Switcher Cards */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.55rem' }}>
          Select Vessel Class to Simulate Keel Clearance & Economic Proofs:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem' }}>
          {vesselOptions.map((v) => {
            const isSelected = selectedPreviewClass === v.key;
            const isOptimal = v.key === 'panamax';
            const isRestricted = v.key === 'capesize';

            return (
              <div
                key={v.key}
                onClick={() => {
                  setSelectedPreviewClass(v.key);
                  if (onSelectVesselClass) onSelectVesselClass(v.key);
                }}
                style={{
                  background: isSelected ? (isOptimal ? '#EFF6FF' : isRestricted ? '#FEF2F2' : '#F8FAFC') : '#FFFFFF',
                  border: isSelected 
                    ? (isOptimal ? '2px solid #2563EB' : isRestricted ? '2px solid #DC2626' : '2px solid #64748B')
                    : '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isOptimal ? '#1D4ED8' : isRestricted ? '#B91C1C' : '#475569' }}>
                      {v.dwt.toLocaleString()} DWT
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.58rem', 
                        fontWeight: 800, 
                        padding: '0.12rem 0.45rem', 
                        borderRadius: '9999px',
                        background: isOptimal ? '#DCFCE7' : isRestricted ? '#FEE2E2' : '#F1F5F9',
                        color: isOptimal ? '#15803D' : isRestricted ? '#991B1B' : '#475569',
                        border: `1px solid ${isOptimal ? '#BBF7D0' : isRestricted ? '#FECACA' : '#E2E8F0'}`
                      }}
                    >
                      {v.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                    {v.name}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                    <span>Laden Draft: <strong style={{ color: '#0F172A' }}>{v.ladenDraft}m</strong></span>
                    <span>•</span>
                    <span>LOA: <strong style={{ color: '#0F172A' }}>{v.loa}m</strong></span>
                  </div>
                </div>

                <div style={{ marginTop: '0.65rem', paddingTop: '0.55rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 600 }}>UKC vs Paradip:</span>
                  <span 
                    style={{ 
                      fontSize: '0.72rem', 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 900, 
                      color: (maxBerthDraft - v.ladenDraft) >= 0 ? '#16A34A' : '#DC2626' 
                    }}
                  >
                    {(maxBerthDraft - v.ladenDraft) >= 0 ? `+${(maxBerthDraft - v.ladenDraft).toFixed(2)}m` : `${(maxBerthDraft - v.ladenDraft).toFixed(2)}m`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Hero Stage: Waterline Cross Section (Left) & Mathematical Rationale / Proofs (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.15fr)', gap: '1.25rem', alignItems: 'stretch' }}>
        
        {/* Left Column: Real-time SVG Keel Clearance Gauge */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Anchor size={14} color="#1D4ED8" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Live Berth Waterline & Keel Clearance Gauge
                </span>
              </div>
              <span 
                style={{ 
                  fontSize: '0.64rem', 
                  fontWeight: 800, 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '4px',
                  background: isFeasibleDirect ? '#DCFCE7' : '#FEE2E2',
                  color: isFeasibleDirect ? '#15803D' : '#991B1B',
                  border: `1px solid ${isFeasibleDirect ? '#BBF7D0' : '#FECACA'}`
                }}
              >
                {isFeasibleDirect ? 'DIRECT BERTH PERMITTED' : 'DRAFT DEFICIT (RESTRICTED)'}
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '0.75rem' }}>
              Active Simulation: <strong>{currentOption.name}</strong> at <strong>{destPort.name}</strong>
            </div>

            {/* Embedded Berth Waterline Cross Section */}
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <BerthWaterlineCrossSection
                vesselClass={selectedPreviewClass}
                destinationPortKey={destinationPortKey}
                compact={true}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.68rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>Seabed Datum:</strong> 13.5m Low Water</span>
            <span><strong>Daylight High Water Peak:</strong> 14.5m HW Buffer</span>
            <span><strong>Clearance:</strong> <strong style={{ color: isFeasibleDirect ? '#16A34A' : '#DC2626' }}>{draftDiff >= 0 ? `+${draftDiff}m` : `${draftDiff}m`}</strong></span>
          </div>
        </div>

        {/* Right Column: Mathematical Decision Proofs & Commercial Tradeoffs */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#C29139', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Commercial & Engineering Proofs
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: '0.15rem 0 0' }}>
                  Why {isWinner ? 'Panamax was Nominated' : `${currentOption.name} was Not Selected`}
                </h3>
              </div>

              <span 
                style={{ 
                  fontSize: '0.68rem', 
                  fontWeight: 800, 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '9999px',
                  background: isWinner ? '#2563EB' : '#F1F5F9',
                  color: isWinner ? '#FFFFFF' : '#64748B'
                }}
              >
                {isWinner ? '★ FINAL NOMINATION' : 'ALTERNATIVE CLASS'}
              </span>
            </div>

            {/* Structured Verdict Banner */}
            <div 
              style={{ 
                background: isWinner ? '#EFF6FF' : isFeasibleDirect ? '#FFFBEB' : '#FEF2F2',
                border: `1px solid ${isWinner ? '#BFDBFE' : isFeasibleDirect ? '#FDE68A' : '#FECACA'}`,
                borderRadius: '8px',
                padding: '0.75rem 0.85rem',
                fontSize: '0.75rem',
                color: isWinner ? '#1E40AF' : isFeasibleDirect ? '#92400E' : '#991B1B',
                lineHeight: 1.45,
                marginBottom: '0.9rem'
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {isWinner ? <CheckCircle2 size={14} color="#1D4ED8" /> : isFeasibleDirect ? <AlertTriangle size={14} color="#D97706" /> : <XCircle size={14} color="#DC2626" />}
                <span>DECISION RATIONALE:</span>
              </div>
              {currentOption.verdict}
            </div>

            {/* 4-Parameter Telemetry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.9rem' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Physical Draft Clearance</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: draftDiff >= 0 ? '#16A34A' : '#DC2626', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                  {draftDiff >= 0 ? `+${draftDiff}m UKC` : `${draftDiff}m Deficit`}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Berth {maxBerthDraft}m vs Ship {currentOption.ladenDraft}m
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Sagar Island Lightering Penalty</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: currentOption.lighteringCost === 0 ? '#16A34A' : '#DC2626', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                  {currentOption.lighteringCost === 0 ? '$0 USD (None)' : `+$${currentOption.lighteringCost.toLocaleString()} USD`}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '0.15rem' }}>
                  {currentOption.lighteringDays === 0 ? 'Direct Quay Discharge' : `+${currentOption.lighteringDays} Days Floating Crane Penalty`}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Terminal Discharge Rate</div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginTop: '0.1rem' }}>
                  {currentOption.handlingRate}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Turnaround: <strong>~{currentOption.turnaroundDays} Days</strong>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Delivered Freight Basis</div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: isWinner ? '#16A34A' : '#B45309', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                  {currentOption.freightBasis}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '0.15rem' }}>
                  {isWinner ? '★ Lowest Cost per Tonne' : 'Higher net delivered outlay'}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Proof Checklist */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
            <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Physical Berthing Dimension Verification (Notice MD/SHS/TECH-26/2020/750):
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: currentOption.loa <= destPort.maxLOA ? '#16A34A' : '#DC2626' }}>
                <CheckCircle2 size={12} />
                <span>LOA: {currentOption.loa}m ≤ {destPort.maxLOA}m Max</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: currentOption.beam <= destPort.maxBeam ? '#16A34A' : '#DC2626' }}>
                <CheckCircle2 size={12} />
                <span>Beam: {currentOption.beam}m ≤ {destPort.maxBeam}m Max</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: currentOption.ladenDraft <= maxBerthDraft ? '#16A34A' : '#DC2626' }}>
                {currentOption.ladenDraft <= maxBerthDraft ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                <span>Draft: {currentOption.ladenDraft}m ≤ {maxBerthDraft}m HW</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
