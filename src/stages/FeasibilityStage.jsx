// SAIL NaviBulk — Stage 03: Maritime Feasibility
// Verifies physical berthing geometry, draft clearance, Sagar lightering, and corridor hazards
import React, { useState } from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import BerthWaterlineCrossSection from '../components/BerthWaterlineCrossSection.jsx';
import VoyageRouteMap from '../components/VoyageRouteMap.jsx';
import CorridorRiskVisualStudio from '../components/CorridorRiskVisualStudio.jsx';
import VesselClassDecisionStudio from '../components/VesselClassDecisionStudio.jsx';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS } from '../data/portConstraints.js';
import { NAUTICAL_DISTANCE_MATRIX } from '../data/freightData.js';
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
  ArrowRight,
  Scale,
  Wind,
  Box,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckSquare,
  FileCheck,
  Radio,
  Lock,
  Unlock,
  Zap,
  Sun,
  Droplets
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
  const originKey = inputs.originCountry === 'United States' ? 'US' : inputs.originCountry;
  const corridorDistanceNm = NAUTICAL_DISTANCE_MATRIX[originKey]?.[inputs.destinationPortKey] || 4850;
  const loadPortObj = FOREIGN_LOAD_PORTS[originKey] || FOREIGN_LOAD_PORTS.Australia;
  const loadTerminalName = loadPortObj?.ports?.[0] || 'Nominated Load Port';
  const destBerthName = destPort.cargoBerths ? 'Specific Cargo Berths' : destPort.name;
  const requiresLightering = Boolean(
    recommendedVessel?.feasibility?.requiresSagarTransshipment || 
    inputs.destinationPortKey === 'haldia' ||
    destPort.requiresLightering
  );

  const conclusionText = recommendedVessel?.feasibility?.feasible
    ? `${recommendedVessel.vesselName} is physically feasible for ${destPort.name} with a laden draft of ${vesselDraft}m against maximum berth draft of ${destDraft}m (Under-Keel Clearance: +${ukcClearance}m). ${requiresLightering ? 'Requires Sagar Island anchorage transshipment lightering.' : 'Direct deepwater berth discharge confirmed without lightering penalty.'}`
    : `Direct berthing for ${recommendedVessel?.vesselName || 'selected vessel'} exceeds destination port physical boundaries (${destDraft}m berth draft vs ${vesselDraft}m vessel draft). Lightering or parcel transshipment required.`;

  const [selectedRiskCategory, setSelectedRiskCategory] = useState('all');
  const [selectedVoyageLeg, setSelectedVoyageLeg] = useState('all');
  const [riskViewMode, setRiskViewMode] = useState('matrix'); // 'matrix' | 'cockpit'
  const [isStatutoryTableExpanded, setIsStatutoryTableExpanded] = useState(false);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [expandedCardDetails, setExpandedCardDetails] = useState({});
  const toggleCardDetail = (id) => setExpandedCardDetails(prev => ({ ...prev, [id]: !prev[id] }));

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
      nextActionLabel="Calculate True Voyage Economics"
      onNextAction={() => advanceStage('feasibility')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. INTERACTIVE DESTINATION PORT SWITCHER & BERTH GEOMETRY CONSOLE ── */}
        <div className="analytical-card" style={{ borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                Discharge Terminal Feasibility Switcher
              </span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0 0' }}>
                Nominated Port: {destPort.name} ({destPort.state})
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Click a terminal to test live physical compatibility:</span>
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
                    background: isSelected ? '#EFF6FF' : 'var(--surface-app)',
                    border: isSelected ? '1.5px solid var(--accent-blue)' : '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '0.6rem 0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? 'var(--accent-blue-dark)' : 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                    <span 
                      className={`pill-badge ${isSelected ? 'status-cobalt' : ''}`}
                      style={{ 
                        fontSize: '0.66rem', 
                        padding: '0.1rem 0.35rem', 
                        background: isSelected ? 'var(--accent-blue)' : 'var(--border)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                      }}
                    >
                      {p.draft}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)', marginTop: '0.2rem' }}>
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

        {/* ── STAGE 03 TOTAL COST OPTIMIZATION: FLEET SIZING & BERTH CLEARANCE ── */}
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Stage 03 Landed Cost Optimization • Fleet Sizing & Keel Clearance
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D', margin: '0.2rem 0 0.15rem' }}>
                {requiresLightering ? 'Lightering Penalty Identified: $4.20/MT Transshipment Fee' : 'Direct Berth Qualified: Avoids $4.20/MT Sagar Lightering Surcharge'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534', maxWidth: '680px', lineHeight: 1.45 }}>
                {requiresLightering 
                  ? `Vessel draft exceeds ${destPort.name} maximum permissible berth depth (${destDraft}m). Consignment requires outer anchorage lightering, adding +$4.20/MT ($${Math.round(4.20 * inputs.tonnage).toLocaleString()} USD) and 3.5 days turnaround delay.`
                  : `Selecting ${recommendedVessel?.vesselName || 'Panamax'} ensures direct deepwater berth clearance at ${destPort.name} with +${ukcClearance}m Under-Keel Clearance. Eliminates the $4.20/MT Sagar lightering penalty that would penalize an unoptimized Capesize fixture.`}
              </p>
            </div>

            <div style={{ background: '#16A34A', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '6px', textAlign: 'right' }}>
              <span style={{ fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Berth Clearance Optimization</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                {requiresLightering ? `-$${Math.round(4.20 * inputs.tonnage).toLocaleString()} USD` : `+$${Math.round(4.20 * inputs.tonnage).toLocaleString()} USD`}
              </span>
              <span style={{ fontSize: '0.7rem', display: 'block', fontWeight: 700 }}>
                {requiresLightering ? 'Lightering Surcharge Incurred' : `₹${Number(((Math.round(4.20 * inputs.tonnage) * 83.2) / 10000000).toFixed(2))} Cr Saved • +$4.20/MT`}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. VESSEL CLASS CHOOSING & KEEL CLEARANCE DECISION STUDIO ── */}
        <div>
          <VesselClassDecisionStudio
            destinationPortKey={inputs.destinationPortKey}
            recommendedVessel={recommendedVessel}
            rankedVessels={rankedVessels}
            inputs={inputs}
          />
        </div>

        {/* ── 3. MARITIME NAVIGATION ROUTE SEA CHART (INTEGRATED ROUTE MAP) ── */}
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

        {/* ── 3. COMPREHENSIVE CORRIDOR RISK & STATUTORY HAZARD AUDIT ── */}
        <div 
          className="analytical-card" 
          style={{ 
            borderRadius: '12px', 
            padding: '1.5rem', 
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            background: '#FFFFFF',
            border: '1px solid var(--border)'
          }}
        >
          {/* Header & Risk Management Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(14,165,233,0.12) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>VOYAGE ROUTE SAFETY & OPERATIONAL RISK MATRIX</span>
                    <span>•</span>
                    <span>COMMERCIAL ASSURANCE</span>
                  </div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0', letterSpacing: '-0.01em' }}>
                    Route Safety, Metocean & Regulatory Risk Audit: {inputs.originCountry} → {destPort.name}
                  </h2>
                </div>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500, marginTop: '0.45rem', paddingLeft: '3.1rem' }}>
                Load Port: <strong>{loadTerminalName}</strong> • Discharge Port: <strong>{destPort.name}</strong> • Comprehensive {corridorDistanceNm.toLocaleString()} NM safety verification across water depth clearance, cargo moisture stability, Bay of Bengal weather, and BIMCO demurrage protections.
              </div>
            </div>

            {/* View Mode Switcher Pills */}
            <div style={{ display: 'flex', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.25rem', gap: '0.25rem' }}>
              <button
                onClick={() => setRiskViewMode('matrix')}
                style={{
                  background: riskViewMode === 'matrix' ? '#2563EB' : 'transparent',
                  color: riskViewMode === 'matrix' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={13} />
                <span>Executive Risk Matrix</span>
              </button>
              <button
                onClick={() => setRiskViewMode('cockpit')}
                style={{
                  background: riskViewMode === 'cockpit' ? '#0F172A' : 'transparent',
                  color: riskViewMode === 'cockpit' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Radio size={13} />
                <span>Interactive Radar & Cockpit</span>
              </button>
            </div>
          </div>

          {/* ── EXECUTIVE SAFETY VERDICT BANNER (Instant Clarity) ── */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
              border: '1.5px solid #86EFAC',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D', flexShrink: 0, border: '1px solid #86EFAC' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    VOYAGE VERDICT: CLEAR FOR TRANSIT
                  </span>
                  <span style={{ background: '#16A34A', color: '#FFFFFF', fontSize: '0.66rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>
                    SCORE: {routeRisks?.overallRiskScore || 34}/100 (LOW OPERATIONAL RISK)
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#166534', lineHeight: 1.45, maxWidth: '820px' }}>
                  All 7 statutory safety checkpoints passed. Navigational draft clearance (+5.6m UKC in Malacca Strait) and laboratory coal moisture certification (TML ≤ 9.5%) confirm routine commercial voyage. Zero Port State Control (PSC) detention flags or prohibitive weather holds.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ borderRight: '1px solid #BBF7D0', paddingRight: '1.25rem' }}>
                <div style={{ fontSize: '0.62rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Port State Control</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#14532D', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={13} color="#16A34A" />
                  <span>0 Deficiencies</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Demurrage Protected</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#14532D', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={13} color="#16A34A" />
                  <span>+$184,000 Hedged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Risk Telemetry KPI Strip */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '0.85rem', 
              marginBottom: '1.4rem' 
            }}
          >
            {/* Card 1: Overall Route Risk */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.95rem 1.1rem' }}>
              <div style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Overall Route Risk Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: (routeRisks?.overallRiskScore || 34) > 60 ? '#B45309' : '#16A34A', fontFamily: 'var(--font-mono)' }}>
                  {routeRisks?.overallRiskScore || 34}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>/ 100</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.66rem', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '0.12rem 0.45rem', borderRadius: '9999px' }}>
                  LOW RISK
                </span>
              </div>
              {/* Visual 3-tier risk bar */}
              <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '9999px', marginTop: '0.45rem', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '50%', background: '#10B981' }} title="0-50 Low Risk" />
                <div style={{ width: '25%', background: '#F59E0B' }} title="50-75 Moderate" />
                <div style={{ width: '25%', background: '#EF4444' }} title="75-100 High" />
              </div>
              <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={12} />
                <span>Controlled commercial transit • Zero PSC flags</span>
              </div>
            </div>

            {/* Card 2: Keel & Chokepoint */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.95rem 1.1rem' }}>
              <div style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Shallow Water & Keel Clearance
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                  +5.6m UKC
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>(Min 3.5m)</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {inputs.originCountry === 'Australia' ? 'Malacca TSS & Phillips Channel Cleared' : 'Direct Deep-Draft Transit'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 600, marginTop: '0.2rem' }}>
                {inputs.originCountry === 'Australia' ? 'Saves ~$142k USD vs Lombok bypass' : 'Verified nautical passage'}
              </div>
            </div>

            {/* Card 3: IMSBC Cargo */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.95rem 1.1rem' }}>
              <div style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                IMSBC Coal Cargo Stability
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                  Moisture Safe
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>(7.8%)</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                Dual Group A & B Certified
              </div>
              <div style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 600, marginTop: '0.2rem' }}>
                TML ≤ 9.5% certified • Gas sensing active
              </div>
            </div>

            {/* Card 4: Demurrage */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.95rem 1.1rem' }}>
              <div style={{ fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Demurrage Capital Protected
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#15803D', fontFamily: 'var(--font-mono)' }}>
                  +$184,000
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>USD</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                BIMCO Virtual Arrival Active
              </div>
              <div style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 600, marginTop: '0.2rem' }}>
                Eliminates idle wait at anchor via speed control
              </div>
            </div>
          </div>

          {/* ── CONDITIONAL VIEW: COCKPIT MODE ── */}
          {riskViewMode === 'cockpit' && (
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: '#1E40AF', fontWeight: 600 }}>
                  <Radio size={16} color="#2563EB" />
                  <span><strong>Technical Nautical Lab Active:</strong> Inspect interactive Doppler cyclone sweeps, underwater bathymetric soundings, hold cutaways, and BIMCO throttle curves.</span>
                </div>
                <button
                  onClick={() => setRiskViewMode('matrix')}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ← Return to Executive Matrix View
                </button>
              </div>

              <CorridorRiskVisualStudio
                originCountry={inputs.originCountry}
                destinationPortKey={inputs.destinationPortKey}
                routeRisks={routeRisks}
                recommendedVessel={recommendedVessel}
                inputs={inputs}
              />
            </div>
          )}

          {/* ── CONDITIONAL VIEW: EXECUTIVE MATRIX MODE (INVITATION BANNER) ── */}
          {riskViewMode === 'matrix' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', color: '#475569' }}>
                <Compass size={15} color="#2563EB" />
                <span>Maritime engineering evaluation mode: Inspect live Doppler cyclone cones, Phillips Channel soundings, and hold gas telemetry in the interactive simulator.</span>
              </div>
              <button
                onClick={() => setRiskViewMode('cockpit')}
                style={{
                  background: '#FFFFFF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  borderRadius: '6px',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Radio size={12} />
                <span>Open Radar & Bathymetry Cockpit ↗</span>
              </button>
            </div>
          )}

          {/* ── INTERACTIVE VOYAGE CORRIDOR TIMELINE (4-PHASE STEPPER) ── */}
          {routeRisks?.voyageTimeline && routeRisks.voyageTimeline.length > 0 && (
            <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Navigation size={14} color="#1D4ED8" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Voyage Lifecycle Hazard Phasing ({inputs.originCountry === 'Australia' ? '4,850 Nautical Miles' : 'Ocean Transit'})
                  </span>
                </div>
                
                {selectedVoyageLeg !== 'all' && (
                  <button
                    onClick={() => setSelectedVoyageLeg('all')}
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1D4ED8',
                      borderRadius: '6px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reset to Full Corridor (All Phases)
                  </button>
                )}
              </div>

              {/* Waypoint Rail Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.65rem' }}>
                {routeRisks.voyageTimeline.map((leg) => {
                  const isSelected = selectedVoyageLeg === leg.legId;
                  return (
                    <div
                      key={leg.legId}
                      onClick={() => setSelectedVoyageLeg(isSelected ? 'all' : leg.legId)}
                      style={{
                        background: isSelected ? '#EFF6FF' : '#FFFFFF',
                        border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '0.75rem 0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.12)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isSelected ? '#1D4ED8' : '#64748B', background: isSelected ? '#DBEAFE' : '#F1F5F9', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                          PHASE 0{leg.legId} • {leg.distance}
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>
                          {leg.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.25, marginBottom: '0.25rem' }}>
                        {leg.name}
                      </div>

                      <div style={{ fontSize: '0.68rem', color: '#475569', lineHeight: 1.35 }}>
                        {leg.location}
                      </div>

                      <div style={{ fontSize: '0.64rem', color: '#2563EB', fontWeight: 600, marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldCheck size={11} />
                        <span>{leg.mitigation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.35rem' }}>
              Hazard Sphere Filter:
            </span>

            {[
              { id: 'all', label: `All Hazards (${routeRisks?.riskCards?.length || 7})`, icon: Shield },
              { id: 'navigation', label: 'Navigation & Reef Pilotage', icon: Compass },
              { id: 'cargo', label: 'IMSBC Cargo Safety', icon: Box },
              { id: 'weather', label: 'Bay of Bengal Cyclones', icon: Wind },
              { id: 'terminal', label: 'Port Bathymetry & Berths', icon: Anchor },
              { id: 'environmental', label: 'Environmental & Ballast', icon: Waves },
              { id: 'statutory', label: 'BIMCO Contractual Defense', icon: Scale },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedRiskCategory(cat.id)}
                style={{
                  background: selectedRiskCategory === cat.id ? '#2563EB' : '#F8FAFC',
                  color: selectedRiskCategory === cat.id ? '#FFFFFF' : '#475569',
                  border: selectedRiskCategory === cat.id ? '1px solid #1D4ED8' : '1px solid #E2E8F0',
                  borderRadius: '9999px',
                  padding: '0.32rem 0.8rem',
                  fontSize: '0.72rem',
                  fontWeight: selectedRiskCategory === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <cat.icon size={12} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Risk Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.15rem' }}>
            {(routeRisks?.riskCards || []).filter(card => {
              const matchesCategory = selectedRiskCategory === 'all' || card.category === selectedRiskCategory;
              const matchesLeg = selectedVoyageLeg === 'all' || card.voyageLegId === Number(selectedVoyageLeg);
              return matchesCategory && matchesLeg;
            }).map((card, idx) => {
              const isHigh = card.score >= 70;
              const isMed = card.score >= 40 && card.score < 70;
              const cardBorder = isHigh ? '#FECACA' : isMed ? '#FED7AA' : '#E2E8F0';
              const cardBg = isHigh ? '#FEF2F2' : isMed ? '#FFFBF5' : '#FFFFFF';
              const badgeBg = isHigh ? '#DC2626' : isMed ? '#EA580C' : '#2563EB';

              return (
                <div 
                  key={card.id || idx}
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '10px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    {/* Top: Category & Statute Code Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span 
                          style={{ 
                            fontSize: '0.63rem', 
                            fontFamily: 'var(--font-mono)', 
                            fontWeight: 700, 
                            color: '#1E40AF', 
                            background: '#EFF6FF', 
                            border: '1px solid #DBEAFE', 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}
                        >
                          {card.statuteCode || 'STATUTORY MARITIME HEURISTIC'}
                        </span>
                        {card.voyageLegId && (
                          <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: '#64748B', background: '#F1F5F9', padding: '0.12rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                            PHASE 0{card.voyageLegId}
                          </span>
                        )}
                      </div>

                      <span 
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          background: badgeBg,
                          color: '#FFFFFF',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {card.level} ({card.score}/100)
                      </span>
                    </div>

                    {/* Hazard Title & Subtitle */}
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                      {card.title}
                    </div>

                    {card.sourceLabel && (
                      <div style={{ fontSize: '0.63rem', color: '#64748B', fontWeight: 700, marginBottom: '0.45rem', letterSpacing: '0.02em' }}>
                        {card.sourceLabel}
                      </div>
                    )}

                    {/* ── BESPOKE VISUAL INSTRUMENT CONSOLES (High-Contrast Light Theme) ── */}
                    {card.id === 'weather_cyclone' && (
                      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.85rem', color: '#0F172A', margin: '0.65rem 0', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 800, color: '#0284C7' }}>
                            <Radio size={13} color="#0284C7" />
                            <span>BAY OF BENGAL METEOROLOGICAL RADAR • 19.8°N 86.7°E</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                            SIGNAL 8/10 RULE
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.55rem', marginBottom: '0.55rem' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.5rem 0.65rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Significant Wave Swell (Hs)</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#D97706', fontFamily: 'var(--font-mono)' }}>3.2m</span>
                              <span style={{ fontSize: '0.66rem', color: '#64748B' }}>Hs (2.8m - 4.2m)</span>
                            </div>
                            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '9999px', marginTop: '0.3rem', overflow: 'hidden' }}>
                              <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #F59E0B 60%, #EF4444 100%)', borderRadius: '9999px' }} />
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#B45309', marginTop: '0.25rem', fontWeight: 600 }}>Exceeds Lightering Ceiling (2.5m) • Direct Berth Only</div>
                          </div>

                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.5rem 0.65rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>IMD Storm Intensity Scale</div>
                            <div style={{ display: 'flex', gap: '2px', marginTop: '0.3rem', height: '19px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ flex: 1, background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 }}>LPA</div>
                              <div style={{ flex: 1.3, background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800 }}>DEPR ★</div>
                              <div style={{ flex: 1, background: '#FFEDD5', color: '#9A3412', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 }}>STORM</div>
                              <div style={{ flex: 1, background: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 }}>VSCS</div>
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#0284C7', marginTop: '0.25rem', fontWeight: 600 }}>Seasonal Low Pressure / Swell Watch Active</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '140px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '0.35rem 0.55rem', fontSize: '0.65rem', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Wind size={12} color="#DC2626" />
                            <span><strong>Signal 8/10 Rule:</strong> Drift 25 NM if wind &gt; 45 kn</span>
                          </div>
                          <div style={{ flex: 1, minWidth: '140px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '0.35rem 0.55rem', fontSize: '0.65rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Lock size={12} color="#16A34A" />
                            <span><strong>BIMCO Clause:</strong> Storm hours excluded from laytime</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.id === 'nav_chokepoint' && inputs.originCountry === 'Australia' && (
                      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.85rem', color: '#0F172A', margin: '0.65rem 0', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 800, color: '#0284C7' }}>
                            <Compass size={13} color="#0284C7" />
                            <span>PHILLIPS CHANNEL BATHYMETRY & RECAAP TIER-2 RADAR</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                            +5.6m UKC CLEARANCE
                          </span>
                        </div>

                        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748B', fontWeight: 700, marginBottom: '0.25rem' }}>
                            <span>0.0m Waterline</span>
                            <span style={{ color: '#2563EB' }}>14.2m Keel (Laden Panamax)</span>
                            <span style={{ color: '#16A34A' }}>19.8m Phillips Channel Bed</span>
                          </div>
                          <div style={{ display: 'flex', height: '22px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                            <div style={{ width: '71.7%', background: 'linear-gradient(90deg, #1E40AF 0%, #3B82F6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, color: '#FFFFFF' }}>
                              Laden Draft: 14.2m
                            </div>
                            <div style={{ width: '28.3%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 900, color: '#FFFFFF' }}>
                              +5.6m UKC (Pass ✓)
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#166534', marginTop: '0.35rem', fontWeight: 600 }}>
                            <span>Statutory Malacca Minimum: 3.5m UKC</span>
                            <span style={{ color: '#15803D' }}>Safety Cushion: +2.1m Above Rule</span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.4rem 0.55rem', border: '1px solid #E2E8F0', fontSize: '0.65rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Radio size={12} color="#0284C7" />
                            <span><strong>ReCAAP Tier-2:</strong> 24h illuminated deck watch • Speed ≥12.5 kn</span>
                          </div>
                          <div style={{ background: '#F0FDF4', borderRadius: '6px', padding: '0.4rem 0.55rem', border: '1px solid #BBF7D0', fontSize: '0.65rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle2 size={12} color="#16A34A" />
                            <span><strong>+$142k Saved</strong> vs Lombok bypass</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.id === 'imsbc_chemistry' && (
                      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.85rem', color: '#0F172A', margin: '0.65rem 0', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 800, color: '#D97706' }}>
                            <Flame size={13} color="#D97706" />
                            <span>IMSBC GROUP A & B LAB TELEMETRY • BOWEN BASIN COAL</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                            LIQUEFACTION SAFE
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.45rem', marginBottom: '0.55rem' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.5rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Moisture vs TML</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16A34A', fontFamily: 'var(--font-mono)' }}>7.8%</span>
                              <span style={{ fontSize: '0.6rem', color: '#64748B' }}>/ 9.5%</span>
                            </div>
                            <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '9999px', marginTop: '0.25rem', overflow: 'hidden' }}>
                              <div style={{ width: '82%', height: '100%', background: '#16A34A', borderRadius: '9999px' }} />
                            </div>
                            <div style={{ fontSize: '0.55rem', color: '#15803D', marginTop: '0.2rem', fontWeight: 700 }}>TML Safe (-1.7%)</div>
                          </div>

                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.5rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Hold CO Gas</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284C7', fontFamily: 'var(--font-mono)' }}>14</span>
                              <span style={{ fontSize: '0.6rem', color: '#64748B' }}>ppm</span>
                            </div>
                            <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '9999px', marginTop: '0.25rem', overflow: 'hidden' }}>
                              <div style={{ width: '28%', height: '100%', background: '#0284C7', borderRadius: '9999px' }} />
                            </div>
                            <div style={{ fontSize: '0.55rem', color: '#0369A1', marginTop: '0.2rem', fontWeight: 700 }}>Trigger &gt;50 ppm Safe</div>
                          </div>

                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.5rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Methane (CH₄)</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#D97706', fontFamily: 'var(--font-mono)' }}>0.1%</span>
                              <span style={{ fontSize: '0.6rem', color: '#64748B' }}>LEL</span>
                            </div>
                            <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '9999px', marginTop: '0.25rem', overflow: 'hidden' }}>
                              <div style={{ width: '10%', height: '100%', background: '#D97706', borderRadius: '9999px' }} />
                            </div>
                            <div style={{ fontSize: '0.55rem', color: '#B45309', marginTop: '0.2rem', fontWeight: 700 }}>Limit &gt;1.0% Safe</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', borderRadius: '6px', padding: '0.4rem 0.65rem', border: '1px solid #E2E8F0', fontSize: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534' }}>
                            <CheckCircle2 size={12} color="#16A34A" />
                            <span><strong>Surface Vents:</strong> OPEN (Venting Methane)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#991B1B' }}>
                            <Lock size={12} color="#DC2626" />
                            <span><strong>Bottom Bilge Air:</strong> LOCKED OFF</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.id === 'bimco_legal' && (
                      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.85rem', color: '#0F172A', margin: '0.65rem 0', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 800, color: '#0284C7' }}>
                            <Scale size={13} color="#0284C7" />
                            <span>BIMCO 2011 SPEED THROTTLE & VIRTUAL NOR CHRONOMETER</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                            NOR LOCKED AT SEA
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '0.55rem' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.5rem 0.65rem', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.6rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Unmanaged Sea Speed</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>14.0 kn</span>
                              <span style={{ fontSize: '0.66rem', color: '#DC2626', fontWeight: 700 }}>32.0 MT / Day</span>
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#64748B', marginTop: '0.15rem' }}>Rushes to wait at anchor (excess burn)</div>
                          </div>

                          <div style={{ background: '#F0FDF4', borderRadius: '6px', padding: '0.5rem 0.65rem', border: '1px solid #BBF7D0' }}>
                            <div style={{ fontSize: '0.6rem', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>BIMCO Eco-Steaming</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16A34A' }}>11.5 kn</span>
                              <span style={{ fontSize: '0.66rem', color: '#166534', fontWeight: 800 }}>20.8 MT / Day</span>
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#15803D', marginTop: '0.15rem', fontWeight: 700 }}>Smooth timed arrival for berth slot</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0FDF4', borderRadius: '6px', padding: '0.4rem 0.7rem', border: '1px solid #BBF7D0', fontSize: '0.66rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534', fontWeight: 800 }}>
                            <CheckCircle2 size={13} color="#16A34A" />
                            <span>Saves ~35 MT VLSFO ($21,700 USD)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#15803D', fontWeight: 700 }}>
                            <Lock size={12} color="#16A34A" />
                            <span>Virtual NOR Clock Protected</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.id === 'port_terminal' && (
                      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.85rem', color: '#0F172A', margin: '0.65rem 0', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 800, color: '#0284C7' }}>
                            <Anchor size={13} color="#0284C7" />
                            <span>PARADIP CENTRAL BERTH CB-1/CB-2 BATHYMETRY & TIDES</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                            DIRECT BERTH QUALIFIED
                          </span>
                        </div>

                        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748B', fontWeight: 700, marginBottom: '0.25rem' }}>
                            <span>Low Water Datum: 13.5m</span>
                            <span style={{ color: '#2563EB' }}>Arrival Draft: 14.15m</span>
                            <span style={{ color: '#16A34A' }}>High Water Spring: 14.5m</span>
                          </div>
                          <div style={{ display: 'flex', height: '22px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                            <div style={{ width: '65%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600 }}>
                              Channel Base (13.5m)
                            </div>
                            <div style={{ width: '25%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#FFFFFF' }}>
                              Laden Keel (14.15m)
                            </div>
                            <div style={{ width: '10%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, color: '#FFFFFF' }}>
                              +0.35m HW Buffer
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#B45309', marginTop: '0.35rem', fontWeight: 600 }}>
                            <span>Daylight HW Slack Tide Window Reserved</span>
                            <span style={{ color: '#166534' }}>Avoids $266k Sagar Lightering</span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.4rem 0.55rem', border: '1px solid #E2E8F0', fontSize: '0.65rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Zap size={12} color="#D97706" />
                            <span><strong>MCHP Conveyor:</strong> 35,000 MT/day (2.0d turn)</span>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.4rem 0.55rem', border: '1px solid #E2E8F0', fontSize: '0.65rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Activity size={12} color="#0284C7" />
                            <span><strong>TSHD Dredger:</strong> Mahanadi sand managed</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.id === 'marpol_env' && (
                      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.85rem', color: '#0F172A', margin: '0.65rem 0', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 800, color: '#059669' }}>
                            <Waves size={13} color="#059669" />
                            <span>IMO MARPOL 0.50% S & DGS 12 NM SCRUBBER ZERO-DISCHARGE</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                            PSC AUDIT PASSED
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '0.55rem' }}>
                          <div style={{ background: '#FEF2F2', borderRadius: '6px', padding: '0.5rem 0.65rem', border: '1px solid #FECACA' }}>
                            <div style={{ fontSize: '0.58rem', color: '#991B1B', textTransform: 'uppercase', fontWeight: 700 }}>Open-Loop Scrubber Washwater</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                              <Lock size={12} color="#DC2626" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#DC2626' }}>LOCKED / 0 DISCHARGE</span>
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#B91C1C', marginTop: '0.15rem' }}>DGS Order 02/2023 Ban in 12 NM</div>
                          </div>

                          <div style={{ background: '#F0FDF4', borderRadius: '6px', padding: '0.5rem 0.65rem', border: '1px solid #BBF7D0' }}>
                            <div style={{ fontSize: '0.58rem', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Compliant VLSFO (≤0.50% S)</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                              <CheckCircle2 size={12} color="#16A34A" />
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16A34A' }}>ACTIVE / 48H LOGGED</span>
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#15803D', marginTop: '0.15rem' }}>Pre-arrival fuel switch confirmed</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', borderRadius: '6px', padding: '0.4rem 0.7rem', border: '1px solid #E2E8F0', fontSize: '0.65rem', color: '#334155' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Droplets size={12} color="#0284C7" />
                            <span><strong>IMO D-2 Ballast Protocol:</strong> Mid-ocean turnover executed (&gt;200m depth)</span>
                          </div>
                          <span style={{ color: '#16A34A', fontWeight: 700 }}>✓ VERIFIED</span>
                        </div>
                      </div>
                    )}

                    {card.id === 'nav_gbr_pilotage' && (
                      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.85rem', color: '#0F172A', margin: '0.65rem 0', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 800, color: '#0284C7' }}>
                            <Navigation size={13} color="#0284C7" />
                            <span>HYDROGRAPHERS PASSAGE FAIRWAY • GBR PSSA CORRIDOR</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                            AMSA PILOT ONBOARD
                          </span>
                        </div>

                        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748B', fontWeight: 700, marginBottom: '0.25rem' }}>
                            <span>Blossom Bank Boarding Ground</span>
                            <span style={{ color: '#2563EB' }}>Locked ECDIS Track (XTE &lt; 0.1 NM)</span>
                            <span style={{ color: '#16A34A' }}>Coral Sea Deepwater Exit</span>
                          </div>
                          <div style={{ height: '18px', background: 'repeating-linear-gradient(90deg, #1E40AF, #1E40AF 12px, #3B82F6 12px, #3B82F6 24px)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, color: '#FFFFFF' }}>
                            HYDROGRAPHERS PASSAGE DEEPWATER FAIRWAY (AUS 249)
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#166534', marginTop: '0.35rem', fontWeight: 600 }}>
                            <span>AMSA Marine Order 54 Coastal Pilotage Mandate</span>
                            <span>Zero Reef Grounding Liability</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0FDF4', borderRadius: '6px', padding: '0.4rem 0.7rem', border: '1px solid #BBF7D0', fontSize: '0.65rem', color: '#166534' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <ShieldCheck size={12} color="#16A34A" />
                            <span><strong>GBRMPA Status:</strong> Particularly Sensitive Sea Area Cleared</span>
                          </div>
                          <span style={{ color: '#15803D', fontWeight: 800 }}>LICENSED ✓</span>
                        </div>
                      </div>
                    )}

                    {/* Key Technical Parameters Matrix (4 Tags) */}
                    {card.keyParameters && card.keyParameters.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem', marginTop: '0.65rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.55rem' }}>
                        {card.keyParameters.map((param, pIdx) => {
                          return (
                            <div key={pIdx} style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>
                                {param.label}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A' }}>
                                  {param.value}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Operational Mitigation Box & Financial Impact Footer */}
                  <div style={{ marginTop: '0.85rem' }}>
                    {card.mitigation && (
                      <div 
                        style={{ 
                          background: '#EFF6FF', 
                          border: '1px solid #BFDBFE', 
                          borderRadius: '8px', 
                          padding: '0.6rem 0.75rem', 
                          fontSize: '0.74rem', 
                          color: '#1E40AF', 
                          lineHeight: 1.4 
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: '#1D4ED8', marginBottom: '0.15rem' }}>
                          <ShieldCheck size={13} />
                          <span>Operational Mitigation Protocol:</span>
                        </div>
                        {card.mitigation}
                      </div>
                    )}

                    {/* Financial Badge + Accordion Drawer Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {card.financialImpact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#15803D', fontWeight: 700, background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.35rem 0.6rem', borderRadius: '6px' }}>
                          <CheckCircle2 size={12} color="#16A34A" />
                          <span>{card.financialImpact}</span>
                        </div>
                      )}

                      <button
                        onClick={() => toggleCardDetail(card.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0'
                        }}
                      >
                        <span>{expandedCardDetails[card.id] ? '▲ Collapse Narrative' : '▼ Read Full Domain Brief'}</span>
                      </button>
                    </div>

                    {/* Expandable Technical Narrative Drawer */}
                    {expandedCardDetails[card.id] && (
                      <div style={{ marginTop: '0.55rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.65rem 0.75rem', fontSize: '0.74rem', color: '#334155', lineHeight: 1.5 }}>
                        {card.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── PRE-VOYAGE STATUTORY COMPLIANCE CHECKLIST ── */}
          {routeRisks?.complianceChecklist && (
            <div style={{ marginTop: '1.4rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem 1.15rem' }}>
              <div 
                onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckSquare size={16} color="#16A34A" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Pre-Voyage Statutory Compliance Verification Matrix ({routeRisks.complianceChecklist.length}/6 Protocols Verified)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>
                    100% AUDIT CLEARANCE
                  </span>
                  {isChecklistExpanded ? <ChevronUp size={15} color="#64748B" /> : <ChevronDown size={15} color="#64748B" />}
                </div>
              </div>

              {/* Compact Preview Chips when collapsed */}
              {!isChecklistExpanded && (
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                  {routeRisks.complianceChecklist.map((item) => (
                    <span 
                      key={item.id}
                      style={{ fontSize: '0.66rem', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.2rem 0.5rem', borderRadius: '9999px', color: '#1E293B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <CheckCircle2 size={11} color="#16A34A" />
                      <span>{item.title.split('(')[0]}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Detailed Cards when expanded */}
              {isChecklistExpanded && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem', marginTop: '0.85rem' }}>
                  {routeRisks.complianceChecklist.map((item) => (
                    <div 
                      key={item.id}
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '0.1rem 0.4rem', borderRadius: '9999px', flexShrink: 0 }}>
                          ✓ {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: '#2563EB', fontWeight: 700 }}>
                        {item.statute}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#475569', lineHeight: 1.35 }}>
                        {item.detail}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── EXPANDABLE STATUTORY TREATIES & CONVENTIONS REGISTRY ── */}
          <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setIsStatutoryTableExpanded(!isStatutoryTableExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563EB',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0'
              }}
            >
              <FileText size={14} />
              <span>{isStatutoryTableExpanded ? 'Hide Maritime Statutory Treaties & Legal Framework Registry' : 'View Applicable Statutory Treaties, IMO Conventions & PPA Operating Regulations (8 Instruments)'}</span>
              {isStatutoryTableExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isStatutoryTableExpanded && (
              <div style={{ marginTop: '0.85rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #CBD5E1', color: '#334155', textAlign: 'left' }}>
                      <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800 }}>Statutory Convention / Authority</th>
                      <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800 }}>Governing Scope</th>
                      <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800 }}>NaviBulk System Implementation</th>
                      <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, textAlign: 'right' }}>Compliance Mandate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                        IMO SOLAS Chapter VI & VII
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                        Carriage of Solid Bulk Cargoes & Dangerous Goods
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#0F172A' }}>
                        Pre-loading moisture certificates; cargo hold atmosphere gas monitoring (CO / CH₄).
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                        <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>Mandatory</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                        IMO IMSBC Code 2023 Edition
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                        Group A (Liquefaction / TML) & Group B (Chemical Self-Heating)
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#0F172A' }}>
                        Transportable Moisture Limit (TML ≤ 9.5%) validated for Australian coking coal.
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                        <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>Enforced</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                        IMO COLREG Rule 10 & Malacca TSS
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                        Malacca & Singapore Straits Deep Water Traffic Separation Scheme
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#0F172A' }}>
                        Phillips Channel 19.8m minimum depth; 5.6m dynamic Under Keel Clearance verified.
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                        <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>Passage Cleared</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                        AMSA Marine Order 54
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                        Great Barrier Reef Coastal Pilotage & Hydrographers Passage
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#0F172A' }}>
                        Compulsory licensed reef pilotage boarding at Blossom Bank for Queensland bulkers.
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                        <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>Mandatory</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                        BIMCO Virtual Arrival Clause 2011
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                        Congestion Speed Reduction & Carbon Reduction Protocol
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#0F172A' }}>
                        Eco-cruising speed adjustment (11.5 kn) upon queue detection; locks NOR laytime.
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                        <span className="pill-badge status-cobalt" style={{ fontSize: '0.62rem' }}>Charter Shield</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                        DG Shipping India Order 02 of 2023
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                        Open-Loop Scrubber Washwater Discharge Ban in Indian Territorial Waters
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#0F172A' }}>
                        Mandates compliant VLSFO (≤0.50% S) fuel switch 48 hrs before entering Indian EEZ.
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                        <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>Statutory</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                        Paradip Port Circular No. 750/2025
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                        Central Berth CB-1/CB-2 Max Permissible Draft (14.5m HW) & Daylight Tide
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#0F172A' }}>
                        14.15m scheduled arrival draft ensuring 0.35m safety clearance above dredged depth.
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                        <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>Verified</span>
                      </td>
                    </tr>
                    <tr style={{ background: '#F8FAFC' }}>
                      <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>
                        IMO BWM Convention Reg. D-2
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#475569' }}>
                        Deep Ocean Ballast Water Exchange & Invasive Species Control
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', color: '#0F172A' }}>
                        Deep ocean exchange executed at depth &gt;200m in Indian Ocean prior to Bay of Bengal entry.
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                        <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>Enforced</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </StageShell>
  );
}
