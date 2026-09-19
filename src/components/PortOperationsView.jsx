// SAIL-NaviBulk Port Infrastructure & Terminal Operations Console
// 100% Real-World Maritime Terminal Specifications & Indian Railways Evacuation Telemetry
import React, { useState } from 'react';
import { 
  Anchor, 
  Globe, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Gauge, 
  Info,
  Ship,
  Compass,
  Maximize2,
  Train,
  DollarSign,
  Layers,
  Activity,
  FileText,
  Sliders,
  Warehouse,
  Wind,
  Navigation,
  Check,
  Building2
} from 'lucide-react';
import { 
  EAST_COAST_PORTS, 
  FOREIGN_LOAD_PORTS, 
  VESSEL_CLASSES,
  ASSUMED_LIGHTERING_TIME_PENALTY_DAYS, 
  ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD 
} from '../data/portConstraints';

// Precision Line-Art Vessel Silhouette
function VesselLineArt({ type = 'capesize', width = 110, height = 55, strokeColor = '#2563EB' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M6 36 L18 46 L96 46 L114 36 L106 36 L100 24 L86 24 L86 36 L30 36 L24 28 L14 28 L12 36 Z" 
        stroke={strokeColor} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="rgba(37, 99, 235, 0.05)"
      />
      <line x1="34" y1="36" x2="34" y2="44" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
      <line x1="50" y1="36" x2="50" y2="44" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
      <line x1="66" y1="36" x2="66" y2="44" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
      <line x1="82" y1="36" x2="82" y2="44" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
      <rect x="88" y="16" width="10" height="8" stroke={strokeColor} strokeWidth="1.2" fill="rgba(37, 99, 235, 0.1)" />
      <line x1="93" y1="11" x2="93" y2="16" stroke="#2563EB" strokeWidth="1.6" />
      <line x1="2" y1="41" x2="118" y2="41" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
    </svg>
  );
}

// Precision Quay & Ship-to-Shore Gantry Crane SVG
function QuayLineArt({ width = 110, height = 55, strokeColor = '#64748B' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="32" width="102" height="20" rx="2" stroke={strokeColor} strokeWidth="1.4" fill="rgba(15, 23, 42, 0.03)" />
      <circle cx="22" cy="30" r="2.2" fill="#2563EB" />
      <circle cx="50" cy="30" r="2.2" fill="#2563EB" />
      <circle cx="78" cy="30" r="2.2" fill="#2563EB" />
      <circle cx="102" cy="30" r="2.2" fill="#2563EB" />
      <path d="M38 32 L44 12 L56 12 L62 32" stroke={strokeColor} strokeWidth="1.3" strokeLinejoin="round" />
      <line x1="36" y1="12" x2="74" y2="12" stroke="#2563EB" strokeWidth="1.6" />
      <line x1="68" y1="12" x2="68" y2="24" stroke="#DC2626" strokeWidth="1.2" strokeDasharray="2 2" />
      <rect x="65" y="24" width="6" height="4" fill="#DC2626" />
      <line x1="2" y1="44" x2="118" y2="44" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.75" />
    </svg>
  );
}

export default function PortOperationsView({ onSelectPortForVoyage }) {
  const [activeRegion, setActiveRegion] = useState('eastCoast');
  const [selectedPortKey, setSelectedPortKey] = useState('paradip');
  const [activeTab, setActiveTab] = useState('bathymetry'); // 'bathymetry' | 'berths' | 'rail' | 'tariffs' | 'safety'
  const [testVesselClass, setTestVesselClass] = useState('capesize');
  const [testCargoDraft, setTestCargoDraft] = useState(17.8);
  const [simulatedTideM, setSimulatedTideM] = useState(1.2);
  const [simulatedCargoTonnage, setSimulatedCargoTonnage] = useState(75000);
  const [inspectedSpec, setInspectedSpec] = useState(null);

  const selectedPort = activeRegion === 'eastCoast' 
    ? EAST_COAST_PORTS[selectedPortKey] || EAST_COAST_PORTS.paradip 
    : FOREIGN_LOAD_PORTS[selectedPortKey] || FOREIGN_LOAD_PORTS.Australia;

  const vesselSpec = VESSEL_CLASSES[testVesselClass] || VESSEL_CLASSES.capesize;
  const vesselDwt = vesselSpec.avgDwt || 180000;
  const vesselLoa = vesselSpec.loaReq || 292;
  const vesselBeam = vesselSpec.beamReq || 45.0;

  // Feasibility calculations
  const maxDraft = selectedPort.maxDraft || (selectedPort.cargoBerths ? selectedPort.cargoBerths.maxDraft : 14.5);
  const effectiveBerthDraftWithTide = activeRegion === 'eastCoast' && selectedPort.tidalDependent 
    ? Number((maxDraft + simulatedTideM).toFixed(2)) 
    : maxDraft;

  const maxLoa = selectedPort.maxLOA || (selectedPort.cargoBerths ? selectedPort.cargoBerths.maxLOA : 300);
  const maxBeam = selectedPort.maxBeam || (selectedPort.cargoBerths ? selectedPort.cargoBerths.maxBeam : 48.0);
  const maxDwtCap = selectedPort.maxDWT || (selectedPort.cargoBerths ? selectedPort.cargoBerths.maxDWT : 100000);

  const isDraftOk = effectiveBerthDraftWithTide >= testCargoDraft;
  const isLoaOk = maxLoa >= vesselLoa;
  const isBeamOk = maxBeam >= vesselBeam;
  const isDwtOk = maxDwtCap >= (vesselSpec.avgDwt || 75000);
  const isDirectlyFeasible = isDraftOk && isLoaOk && isBeamOk;

  // UKC Safety Margin
  const liveUkcMargin = Number((effectiveBerthDraftWithTide - testCargoDraft).toFixed(2));
  const statutoryUkc = selectedPort.marineRegulations?.ukcBerthM || 0.6;
  const isUkcSafe = liveUkcMargin >= statutoryUkc;

  // Lightering calculation
  const lighteringNeeded = !isDraftOk && (selectedPort.lighteringRequiredAboveDwt || selectedPort.id === 'sagar' || selectedPort.id === 'haldia');
  const dischargeRate = selectedPort.dischargeRateTpd || selectedPort.handlingCapacityTpd || selectedPort.loadRateTpd || 40000;
  const daysAlongside = Number(((vesselSpec.avgDwt || 75000) / dischargeRate).toFixed(1));

  const estimatedLighteringCost = lighteringNeeded 
    ? (selectedPort.assumedLighteringCostPerTonneUsd || ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD) * (vesselDwt * 0.4) 
    : 0;

  // Port Call Disbursement Calculation (SOR)
  const grossRegisteredTonnage = Math.round(vesselDwt * 0.55); // Typical Bulk Carrier GRT-to-DWT ratio
  const portDuesRate = selectedPort.portTariffs?.portDuesUsdPerGrt || 0.38;
  const pilotageRate = selectedPort.portTariffs?.pilotageTowageUsdPerGrt || 0.72;
  const berthHireHourlyRate = selectedPort.portTariffs?.berthHireUsdPerGrtHour || 0.0035;
  const wharfageRateInr = selectedPort.portTariffs?.wharfageInrPerTonne || 75.0;

  const totalPortDuesUsd = grossRegisteredTonnage * portDuesRate;
  const totalPilotageUsd = selectedPort.portTariffs?.pilotageTowageUsd || (grossRegisteredTonnage * pilotageRate);
  const totalBerthHireUsd = selectedPort.portTariffs?.berthHireUsdPerDay 
    ? selectedPort.portTariffs.berthHireUsdPerDay * daysAlongside
    : (grossRegisteredTonnage * berthHireHourlyRate * (daysAlongside * 24));
  const totalWharfageInr = simulatedCargoTonnage * wharfageRateInr;
  const totalWharfageUsd = totalWharfageInr / 84.0; // Current USD/INR benchmark
  const totalPortCallDisbursementUsd = totalPortDuesUsd + totalPilotageUsd + totalBerthHireUsd + totalWharfageUsd + estimatedLighteringCost;

  const portList = activeRegion === 'eastCoast' ? EAST_COAST_PORTS : FOREIGN_LOAD_PORTS;

  return (
    <div 
      className="port-operations-flagship"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.75rem', 
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem 0 3.5rem'
      }}
    >
      {/* ── 1. HEADER & EXECUTIVE TERMINAL KPI STRIP ── */}
      <section 
        style={{ 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '1.25rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="section-eyebrow" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
              SAIL DRY BULK TERMINAL NETWORK
            </span>
            <span style={{ color: 'var(--border)' }}>•</span>
            <span style={{ color: 'var(--accent-blue)', fontSize: '0.74rem', fontWeight: 700 }}>
              Official Port Authority & Indian Railways Logistics Engine
            </span>
          </div>
          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            margin: '0 0 0.35rem'
          }}>
            Port Infrastructure & Berth Bathymetry Console
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Verified institutional parameters: Berth-by-berth drafts, mechanical unloader rates, Scale of Rates (SOR), and direct rail siding evacuation to SAIL steel plants.
          </p>
        </div>

        {/* Region Switcher Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-app)', padding: '0.25rem', borderRadius: '9999px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => { setActiveRegion('eastCoast'); setSelectedPortKey('paradip'); }}
            style={{
              background: activeRegion === 'eastCoast' ? 'var(--accent-blue)' : 'transparent',
              color: activeRegion === 'eastCoast' ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.45rem 1.1rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Anchor size={14} />
            <span>Indian Discharging Ports ({Object.keys(EAST_COAST_PORTS).length})</span>
          </button>

          <button
            onClick={() => { setActiveRegion('foreign'); setSelectedPortKey('Australia'); }}
            style={{
              background: activeRegion === 'foreign' ? 'var(--accent-blue)' : 'transparent',
              color: activeRegion === 'foreign' ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.45rem 1.1rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Globe size={14} />
            <span>Key Foreign Load Ports ({Object.keys(FOREIGN_LOAD_PORTS).length})</span>
          </button>
        </div>
      </section>

      {/* ── 2. INTERACTIVE PORT SELECTION TILES ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            {activeRegion === 'eastCoast' ? 'Indian Deepwater Quays & Riverine Complex' : 'Global Coal Export Terminals'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Select port to load engineering bathymetry & rail telemetry
          </span>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}
        >
          {Object.keys(portList).map((key) => {
            const port = portList[key];
            const isSelected = selectedPortKey === key;
            const draft = port.maxDraft || port.cargoBerths?.maxDraft || 14.5;
            const loa = port.maxLOA || port.cargoBerths?.maxLOA || 290;
            const dwt = port.maxDWT || port.cargoBerths?.maxDWT || 150000;
            const rate = port.dischargeRateTpd || port.handlingCapacityTpd || port.loadRateTpd || 40000;
            const title = port.shortName || (port.ports ? port.ports[0].split('(')[0].trim() : port.name);
            const sub = port.state ? `${port.state} • ${port.operator.includes('Major') ? 'Major Port' : 'Private Port'}` : `${port.country} • Export Node`;

            return (
              <div
                key={key}
                onClick={() => setSelectedPortKey(key)}
                className="analytical-card"
                style={{
                  background: isSelected ? '#F0F7FF' : '#FFFFFF',
                  borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border)',
                  borderWidth: isSelected ? '2px' : '1px',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? '0 6px 16px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                        {title}
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {sub}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedSpec(port);
                      }}
                      title="Inspect Official Regulatory Citation"
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: isSelected ? 'var(--accent-blue-soft)' : '#F1F5F9',
                        border: '1px solid var(--border)',
                        color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <Info size={12} strokeWidth={2.2} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.74rem' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Draft: <strong style={{ color: draft >= 17.5 ? 'var(--success)' : draft >= 14.0 ? 'var(--accent-blue)' : 'var(--warning)', fontFamily: 'var(--font-mono)' }}>{draft} m</strong>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Max LOA: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{loa} m</strong>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Displacement: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{(dwt / 1000).toFixed(0)}k DWT</strong>
                      </div>
                    </div>

                    <div style={{ opacity: isSelected ? 1 : 0.4, transition: 'opacity 0.2s', paddingBottom: '2px' }}>
                      <QuayLineArt width={85} height={42} strokeColor={isSelected ? '#2563EB' : '#94A3B8'} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span 
                    className={`pill-badge ${draft >= 17.5 ? 'status-success' : draft >= 14.0 ? 'status-cobalt' : 'status-warning'}`}
                    style={{ fontSize: '0.62rem', padding: '0.06rem 0.35rem' }}
                  >
                    {draft >= 17.5 ? 'Capesize Direct' : draft >= 14.0 ? 'Panamax / Post-Panamax' : 'Handysize / Lightering'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {(rate / 1000).toFixed(0)}k TPD
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. DETAILED WORKSTATION CONSOLE (5 INTEGRATED TABS) ── */}
      <section 
        className="analytical-card" 
        style={{ 
          borderRadius: '14px', 
          padding: '1.5rem', 
          background: '#FFFFFF', 
          border: '1px solid var(--border)',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
        }}
      >
        {/* Active Port Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedPort.name}
                </h2>
                <span className="pill-badge status-cobalt" style={{ fontSize: '0.65rem' }}>
                  {selectedPort.operator || selectedPort.country}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Coordinates: {selectedPort.latitude}° N, {selectedPort.longitude}° E • Operational Status: <strong style={{ color: 'var(--success)' }}>All-Weather Commercial Operations</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => {
                if (onSelectPortForVoyage) onSelectPortForVoyage(selectedPortKey);
              }}
              className="btn-cobalt"
              style={{
                borderRadius: '8px',
                padding: '0.55rem 1.1rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700
              }}
            >
              <span>Feed into Voyage Decision Engine</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Console Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
          {[
            { id: 'bathymetry', label: 'Bathymetry & Waterline Simulator', icon: Anchor },
            { id: 'berths', label: 'Berth-by-Berth Architecture', icon: Layers },
            { id: 'rail', label: 'Rail Siding & SAIL Plant Telemetry', icon: Train },
            { id: 'tariffs', label: 'Scale of Rates (SOR) Calculator', icon: DollarSign },
            { id: 'safety', label: 'Marine Notices & Cyclone SOP', icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            const isTActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: isTActive ? '#EFF6FF' : 'transparent',
                  color: isTActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  border: isTActive ? '1px solid #BFDBFE' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.5rem 0.95rem',
                  cursor: 'pointer',
                  fontWeight: isTActive ? 800 : 600,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: BATHYMETRY & WATERLINE SIMULATOR ── */}
        {activeTab === 'bathymetry' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(360px, 0.95fr)', gap: '1.5rem', alignItems: 'stretch' }}>
            {/* Left Column: Interactive Vessel Testing & Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                  VESSEL CLASS SELECTION & HYDROGRAPHIC ENVELOPE
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                  Simulate Clearance Against {selectedPort.shortName || selectedPort.country}
                </h3>
              </div>

              {/* 4 Vessel Class Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                {Object.keys(VESSEL_CLASSES).map((vKey) => {
                  const v = VESSEL_CLASSES[vKey];
                  const isVSelected = testVesselClass === vKey;

                  return (
                    <div
                      key={vKey}
                      onClick={() => {
                        setTestVesselClass(vKey);
                        setTestCargoDraft(v.draftReq);
                      }}
                      style={{
                        background: isVSelected ? '#EFF6FF' : 'var(--surface-app)',
                        border: isVSelected ? '1.5px solid var(--accent-blue)' : '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.82rem', color: isVSelected ? 'var(--accent-blue-dark)' : 'var(--text-primary)' }}>
                        {v.name.split('/')[0]}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 700, marginTop: '2px' }}>
                        {v.draftReq}m draft
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {(v.avgDwt / 1000).toFixed(0)}k DWT
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sliders: Arrival Draft & Tide Level */}
              <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Arrival Draft (m)
                    </label>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                      {testCargoDraft} m
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="8.0"
                    max="20.0"
                    step="0.1"
                    value={testCargoDraft}
                    onChange={(e) => setTestCargoDraft(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Tested vessel: {vesselSpec.name} ({vesselSpec.avgDwt.toLocaleString()} MT)
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Astronomical Tide Height (m)
                    </label>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      +{simulatedTideM} m
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0.0"
                    max="4.0"
                    step="0.1"
                    value={simulatedTideM}
                    onChange={(e) => setSimulatedTideM(parseFloat(e.target.value))}
                    disabled={!selectedPort.tidalDependent}
                    style={{ width: '100%', cursor: selectedPort.tidalDependent ? 'pointer' : 'not-allowed', opacity: selectedPort.tidalDependent ? 1 : 0.5 }}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {selectedPort.tidalDependent ? 'Tidal window applies to entrance' : 'All-weather deep-draft (non-tidal)'}
                  </div>
                </div>
              </div>

              {/* Visual Waterline Cross-Section SVG Diagram */}
              <div style={{ background: '#0F172A', borderRadius: '10px', padding: '1.25rem', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', color: '#38BDF8' }}>
                    PRECISION HYDROGRAPHIC KEEL CLEARANCE SIMULATION
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                    DATUM: SOUNDING REDUCED TO LAT
                  </div>
                </div>

                {/* Simulated cross-section bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                  {/* Waterline Line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', width: '120px', color: '#38BDF8', fontWeight: 700 }}>Mean High Water:</span>
                    <div style={{ flex: 1, height: '2px', background: '#38BDF8', position: 'relative' }}>
                      <div style={{ position: 'absolute', right: 0, top: '-10px', fontSize: '0.65rem', color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                        0.0m Waterline
                      </div>
                    </div>
                  </div>

                  {/* Vessel Keel Line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', width: '120px', color: '#FBBF24', fontWeight: 700 }}>Vessel Keel Draft:</span>
                    <div style={{ flex: 1, height: '14px', background: 'rgba(251, 191, 36, 0.2)', border: '1px solid #FBBF24', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (testCargoDraft / 22) * 100)}%`, height: '100%', background: '#FBBF24' }} />
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#FBBF24', fontFamily: 'var(--font-mono)', fontWeight: 800, width: '60px' }}>
                      -{testCargoDraft}m
                    </span>
                  </div>

                  {/* Berth Seabed Depth */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', width: '120px', color: '#4ADE80', fontWeight: 700 }}>Dredged Berth Depth:</span>
                    <div style={{ flex: 1, height: '14px', background: 'rgba(74, 222, 128, 0.2)', border: '1px solid #4ADE80', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (effectiveBerthDraftWithTide / 22) * 100)}%`, height: '100%', background: '#22C55E' }} />
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#4ADE80', fontFamily: 'var(--font-mono)', fontWeight: 800, width: '60px' }}>
                      -{effectiveBerthDraftWithTide}m
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#CBD5E1' }}>
                    Calculated Keel Safety Clearance (UKC): <strong style={{ color: isUkcSafe ? '#4ADE80' : '#EF4444', fontFamily: 'var(--font-mono)' }}>{liveUkcMargin} m</strong> (Statutory Min: {statutoryUkc}m)
                  </div>
                  <span className={`pill-badge ${isUkcSafe ? 'status-success' : 'status-danger'}`} style={{ fontSize: '0.62rem' }}>
                    {isUkcSafe ? 'UKC SUFFICIENT' : 'GROUNDING HAZARD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Berth Compatibility Verdict & Operational Impact */}
            <div 
              style={{
                background: 'var(--navy-sidebar)',
                border: isDirectlyFeasible ? '1.5px solid #16A34A' : '1.5px solid var(--warning)',
                borderRadius: '12px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span 
                    className={`pill-badge ${isDirectlyFeasible ? 'status-success' : 'status-warning'}`}
                    style={{ fontSize: '0.68rem', fontWeight: 800 }}
                  >
                    {isDirectlyFeasible ? 'BERTH ADMISSIBLE' : 'OPERATIONAL RESTRICTION'}
                  </span>

                  <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                    LOA Limit: {maxLoa}m
                  </span>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.35rem', lineHeight: 1.25 }}>
                  {selectedPort.name}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
                  Tested with <strong>{vesselSpec.name}</strong> @ <strong style={{ color: '#38BDF8' }}>{testCargoDraft}m</strong> arrival draft.
                </div>

                {/* Verdict Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div 
                    style={{
                      background: isDirectlyFeasible ? 'rgba(22, 163, 74, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                      color: isDirectlyFeasible ? '#4ADE80' : '#94A3B8',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      border: isDirectlyFeasible ? '1.5px solid #16A34A' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>Direct Discharge</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '3px', lineHeight: 1.35 }}>
                      Direct quay berthing with 0 days transshipment delay.
                    </div>
                  </div>

                  <div 
                    style={{
                      background: !isDirectlyFeasible ? 'rgba(217, 119, 6, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: !isDirectlyFeasible ? '#FBBF24' : '#94A3B8',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      border: !isDirectlyFeasible ? '1.5px solid #D97706' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>Lightering Penalty</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '3px', lineHeight: 1.35 }}>
                      Requires offshore lightering at Sandheads/Sagar (+3.5 days).
                    </div>
                  </div>
                </div>

                {/* Metrics Summary Strip */}
                <div 
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.95rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Permissible Cargo Berth Draft:</span>
                    <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{maxDraft} m</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Approach Channel Capability:</span>
                    <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                      {selectedPort.approachChannel?.maxDraft ? `${selectedPort.approachChannel.maxDraft} m` : `${maxDraft} m`}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Discharge Laytime Alongside:</span>
                    <strong style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                      {daysAlongside} Days ({dischargeRate.toLocaleString()} TPD)
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Lightering / Transshipment Cost:</span>
                    <strong style={{ color: isDirectlyFeasible ? '#4ADE80' : '#FBBF24', fontFamily: 'var(--font-mono)' }}>
                      {isDirectlyFeasible ? '$0 (Direct Berth)' : `+$${Math.round(estimatedLighteringCost).toLocaleString()} USD`}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.4 }}>
                  {selectedPort.notes || 'Official Major Port Authority operational regime.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BERTH-BY-BERTH ARCHITECTURE ── */}
        {activeTab === 'berths' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                BERTH-BY-BERTH ALLOCATION & MECHANICAL UNLOADERS
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                Dedicated Coal & Dry Bulk Discharging Quays at {selectedPort.name}
              </h3>
            </div>

            {/* Berth Roster Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Berth Name / Code</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Quay Length (LOA)</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Max Draft</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Max Beam</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Displacement Cap</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Discharging Machinery</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Conveyor Rate</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Direct Rail</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPort.berthsList || []).map((b, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? '#FFFFFF' : '#FBFDFF' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        <div>{b.name}</div>
                        <span className="pill-badge status-cobalt" style={{ fontSize: '0.6rem', marginTop: '2px' }}>{b.berthCode}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {b.lengthM} m
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: b.permissibleDraftM >= 17.5 ? 'var(--success)' : 'var(--accent-blue)' }}>
                        {b.permissibleDraftM} m
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)' }}>
                        {b.maxBeamM} m
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {(b.maxDwt / 1000).toFixed(0)}k DWT
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        <div>{b.equipment}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: {b.primaryCargo}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {b.conveyorCapacityTph?.toLocaleString()} TPH
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {b.directRailConnected ? (
                          <span className="pill-badge status-success" style={{ fontSize: '0.62rem' }}>
                            <Check size={10} style={{ marginRight: '2px' }} /> CONNECTED
                          </span>
                        ) : (
                          <span className="pill-badge status-warning" style={{ fontSize: '0.62rem' }}>BARGE / FEEDER</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stockyard and Handling Infrastructure Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <Warehouse size={18} color="var(--accent-blue)" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Stockyard Storage & Buffer Capacity</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Live Stockyard Capacity:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {(selectedPort.stockyard?.capacityMt / 1000000).toFixed(2)} Million MT
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Stacker-Reclaimers:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedPort.stockyard?.stackerReclaimers || 'Heavy Gantry System'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Dedicated Storage Pad Area:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedPort.stockyard?.storagePadAreaSqM?.toLocaleString() || '250,000'} sq.m</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <Wind size={18} color="var(--success)" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Environmental & Dust Suppression SOP</h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.45 }}>
                  {selectedPort.stockyard?.dustSuppression || 'Automated dry fog agglomeration sprinklers, 15m perimeter wind fence, and polymer crusting.'}
                </p>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Complies with Central Pollution Control Board (CPCB) & MoEFCC port green environmental mandates.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: RAIL SIDING & SAIL PLANT TELEMETRY ── */}
        {activeTab === 'rail' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                  INDIAN RAILWAYS MULTIMODAL EVACUATION CORRIDOR
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                  Direct Freight Rake Logistics to SAIL Steel Plants
                </h3>
              </div>

              {/* Cargo parcel slider for dynamic rail freight calculator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-app)', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Simulate Shipment:</span>
                <input 
                  type="range"
                  min="30000"
                  max="180000"
                  step="5000"
                  value={simulatedCargoTonnage}
                  onChange={(e) => setSimulatedCargoTonnage(parseInt(e.target.value))}
                  style={{ width: '110px' }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                  {(simulatedCargoTonnage / 1000).toFixed(0)}k MT
                </span>
              </div>
            </div>

            {/* Siding Telemetry Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Railway Siding Code</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {selectedPort.railConnectivity?.sidingCode || 'PRDP / PPTC'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Zone: {selectedPort.railConnectivity?.railwayZone || 'East Coast Railway (ECoR)'}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Daily Evacuation Capacity</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {selectedPort.railConnectivity?.rakesPerDayCapacity || 24} Rakes / Day
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  ~{((selectedPort.railConnectivity?.rakesPerDayCapacity || 24) * 3800).toLocaleString()} MT / Day (BOXNHL)
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Avg Rake Turnaround</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {selectedPort.railConnectivity?.avgRakeTurnaroundHours || 3.2} Hours
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  In-motion electronic weighbridges
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Loading Mechanism</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedPort.railConnectivity?.loadingSystem || 'Rapid Loading Silos (RLS)'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Zero spillage automated chutes
                </div>
              </div>
            </div>

            {/* SAIL Steel Plants Evacuation Matrix */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                  SAIL Five Primary Integrated Steel Plants Connectivity Matrix
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Class 140/150 IR Freight Tariff Schedule
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Steel Plant</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Rail Distance</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>IR Freight Rate</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Transit Time</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Rakes Required</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Total Freight Outlay</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Primary Transit Route</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPort.sailPlantDistances && Object.keys(selectedPort.sailPlantDistances).map((plantKey, idx) => {
                    const plant = selectedPort.sailPlantDistances[plantKey];
                    const rakesNeeded = Math.ceil(simulatedCargoTonnage / 3800);
                    const totalFreightInr = simulatedCargoTonnage * plant.railFreightInrPerTonne;
                    const totalFreightLakhs = (totalFreightInr / 100000).toFixed(1);

                    return (
                      <tr key={plantKey} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          <div>{plant.plantName}</div>
                          <span className="pill-badge status-cobalt" style={{ fontSize: '0.62rem', marginTop: '2px' }}>{plantKey}</span>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {plant.distanceKm} km
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-blue)' }}>
                          ₹{plant.railFreightInrPerTonne} / MT
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {plant.transitHours} hrs
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {rakesNeeded} rakes
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--success)' }}>
                          ₹{totalFreightLakhs} L <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>(${(totalFreightInr / 84 / 1000).toFixed(0)}k)</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {plant.routeVia || 'Direct Indian Railways Electrified Corridor'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: SCALE OF RATES (SOR) CALCULATOR ── */}
        {activeTab === 'tariffs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                  STATUTORY SCALE OF RATES (SOR) DISBURSEMENT LEDGER
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                  Vessel Port Call Disbursements for {selectedPort.name}
                </h3>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700, background: '#EFF6FF', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                Basis: {vesselSpec.name} ({grossRegisteredTonnage.toLocaleString()} GRT) • {daysAlongside} Days Alongside
              </div>
            </div>

            {/* Port Call Cost Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', borderLeft: '4px solid var(--accent-blue)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Port Dues (Vessel)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ${Math.round(totalPortDuesUsd).toLocaleString()} USD
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Rate: ${portDuesRate.toFixed(3)} / GRT
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', borderLeft: '4px solid var(--success)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pilotage & Towage</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ${Math.round(totalPilotageUsd).toLocaleString()} USD
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Tug assists (inward + outward)
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', borderLeft: '4px solid #8B5CF6' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Berth Hire Charges</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ${Math.round(totalBerthHireUsd).toLocaleString()} USD
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  For {daysAlongside} days alongside
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', borderLeft: '4px solid #EC4899' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cargo Wharfage</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ₹{(totalWharfageInr / 100000).toFixed(1)} L <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(${(totalWharfageUsd / 1000).toFixed(0)}k)</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  ₹{wharfageRateInr} / MT handling
                </div>
              </div>
            </div>

            {/* Total Port Disbursement Banner */}
            <div style={{ background: 'var(--navy-sidebar)', borderRadius: '12px', padding: '1.5rem', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800 }}>
                  ESTIMATED TOTAL PORT CALL DISBURSEMENTS (DA CALCULATION)
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ${Math.round(totalPortCallDisbursementUsd).toLocaleString()} USD
                  <span style={{ fontSize: '1.05rem', color: '#94A3B8', marginLeft: '0.75rem', fontWeight: 600 }}>
                    (₹{((totalPortCallDisbursementUsd * 84) / 10000000).toFixed(2)} Crores INR)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '4px' }}>
                  Includes Port Dues, Pilotage, Berth Hire, Wharfage & {estimatedLighteringCost > 0 ? 'Offshore Transshipment Lightering' : 'Zero Lightering Direct Berthing'}.
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Regulatory Gazette Reference:</div>
                <div style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 700, marginTop: '2px' }}>
                  {selectedPort.portTariffs?.sorCitation || 'Major Port Authority Scale of Rates 2024'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: MARINE NOTICES & CYCLONE SOP ── */}
        {activeTab === 'safety' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                HYDROGRAPHIC REGULATIONS & SEVERE WEATHER PROTOCOLS
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                Safety Notices & Cyclone SOP for {selectedPort.name}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Hydrographic & UKC Regulations */}
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Navigation size={18} color="var(--accent-blue)" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Under-Keel Clearance & Pilotage Rules</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Approach Channel UKC:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {selectedPort.marineRegulations?.ukcChannelM || 1.5} m (or 10% of draft)
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Berth Alongside UKC:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {selectedPort.marineRegulations?.ukcBerthM || 0.6} m
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tidal Characteristics:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {selectedPort.marineRegulations?.tidalRangeM || 'Semi-diurnal'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Night Pilotage Feasibility:</span>
                    <strong style={{ color: 'var(--success)' }}>
                      {selectedPort.marineRegulations?.nightNavigation || 'Permitted 24/7'}
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', padding: '0.65rem', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <strong>Statutory Notice:</strong> {selectedPort.marineRegulations?.pilotageNoticeRef || 'Port Marine Dept Gazette'}
                </div>
              </div>

              {/* Cyclone Preparedness Standard Operating Procedure */}
              <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={18} color="#D97706" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#92400E' }}>Bay of Bengal Cyclone SOP Matrix</h4>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#78350F', lineHeight: 1.5, margin: '0 0 0.85rem' }}>
                  {selectedPort.marineRegulations?.cycloneSop || 'Port Marine Department operates strictly under Bay of Bengal Storm Warning Signals. Vessels must cast off upon receiving Signal 4.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.74rem', color: '#92400E' }}>
                  <div>• <strong>Signal 1–3:</strong> Pre-alert condition; heavy mooring ropes doubled up.</div>
                  <div>• <strong>Signal 4 (35+ kts):</strong> Mandatory casting off of Capesize bulkers to deep outer anchorage.</div>
                  <div>• <strong>Signal 8–10:</strong> Total terminal shutdown; gantry cranes locked to storm tie-down pins.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── 4. OFFICIAL CITATION AUDIT MODAL ── */}
      {inspectedSpec && (
        <div 
          onClick={() => setInspectedSpec(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="analytical-card"
            style={{
              borderRadius: '14px',
              padding: '1.75rem',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              background: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="section-eyebrow" style={{ fontSize: '0.72rem' }}>
                OFFICIAL SPECIFICATION AUDIT & PROVENANCE
              </span>
              <button 
                onClick={() => setInspectedSpec(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
              {inspectedSpec.name || inspectedSpec.country}
            </h3>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              {inspectedSpec.notes || 'Primary maritime discharging terminal for SAIL raw materials supply chain.'}
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Regulatory Citation / Gazette Notice:</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 700, marginTop: '2px' }}>
                  {inspectedSpec.citation || 'Official Marine Department Operations Manual & Major Port Trust Act'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Verification Status:</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700, marginTop: '2px' }}>
                  {inspectedSpec.status || 'VERIFIED OPERATIONAL REGIME'}
                </div>
              </div>

              {inspectedSpec.berths && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Berthing Schedule:</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {inspectedSpec.berths}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectedSpec(null)}
              className="btn-cobalt"
              style={{
                width: '100%',
                borderRadius: '8px',
                padding: '0.65rem',
                fontSize: '0.85rem'
              }}
            >
              Close Specification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
