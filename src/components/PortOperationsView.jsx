// SAIL-NaviBulk Port Infrastructure & Berth Operations Workstation
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
  Maximize2
} from 'lucide-react';
import { 
  EAST_COAST_PORTS, 
  FOREIGN_LOAD_PORTS, 
  VESSEL_CLASSES,
  ASSUMED_LIGHTERING_TIME_PENALTY_DAYS, 
  ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD 
} from '../data/portConstraints';

// Simple Line-art Vessel Silhouette SVG (Matching Reference line-art icon style)
function VesselLineArt({ type = 'capesize', width = 110, height = 55 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hull profile */}
      <path 
        d="M6 36 L18 46 L96 46 L114 36 L106 36 L100 24 L86 24 L86 36 L30 36 L24 28 L14 28 L12 36 Z" 
        stroke="#94A3B8" 
        strokeWidth="1.4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="rgba(255, 255, 255, 0.02)"
      />
      {/* Cargo holds */}
      <line x1="34" y1="36" x2="34" y2="44" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="50" y1="36" x2="50" y2="44" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="66" y1="36" x2="66" y2="44" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="82" y1="36" x2="82" y2="44" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
      {/* Superstructure / bridge */}
      <rect x="88" y="16" width="10" height="8" stroke="#94A3B8" strokeWidth="1.2" />
      <line x1="93" y1="11" x2="93" y2="16" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Waterline */}
      <line x1="2" y1="41" x2="118" y2="41" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
    </svg>
  );
}

// Simple Line-art Berth Quay Envelope SVG (Matching Reference line-art icon style)
function QuayLineArt({ width = 110, height = 55 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Quay wall */}
      <rect x="10" y="32" width="102" height="18" rx="2" stroke="#94A3B8" strokeWidth="1.3" fill="rgba(255, 255, 255, 0.03)" />
      {/* Bollards */}
      <circle cx="22" cy="30" r="2" fill="#F59E0B" />
      <circle cx="50" cy="30" r="2" fill="#F59E0B" />
      <circle cx="78" cy="30" r="2" fill="#F59E0B" />
      <circle cx="102" cy="30" r="2" fill="#F59E0B" />
      {/* Gantry crane outline */}
      <path d="M38 32 L44 14 L56 14 L62 32" stroke="#94A3B8" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="40" y1="14" x2="72" y2="14" stroke="#F59E0B" strokeWidth="1.4" />
      <line x1="68" y1="14" x2="68" y2="24" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
      {/* Waterline */}
      <line x1="2" y1="44" x2="118" y2="44" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
    </svg>
  );
}

export default function PortOperationsView({ onSelectPortForVoyage }) {
  const [activeRegion, setActiveRegion] = useState('eastCoast');
  const [selectedPortKey, setSelectedPortKey] = useState('paradip');
  const [testVesselClass, setTestVesselClass] = useState('capesize');
  const [testCargoDraft, setTestCargoDraft] = useState(17.8);
  const [inspectedSpec, setInspectedSpec] = useState(null); // modal/tooltip detail

  const selectedPort = activeRegion === 'eastCoast' 
    ? EAST_COAST_PORTS[selectedPortKey] || EAST_COAST_PORTS.paradip 
    : FOREIGN_LOAD_PORTS[selectedPortKey] || FOREIGN_LOAD_PORTS.Australia;

  const vesselSpec = VESSEL_CLASSES[testVesselClass] || VESSEL_CLASSES.capesize;
  const vesselDwt = vesselSpec.avgDwt || 180000;
  const vesselLoa = vesselSpec.loaReq || 292;
  const vesselBeam = vesselSpec.beamReq || 45.0;

  // Feasibility calculation for selected port & test vessel
  const maxDraft = selectedPort.maxDraft || (selectedPort.cargoBerths ? selectedPort.cargoBerths.maxDraft : 14.5);
  const maxLoa = selectedPort.maxLOA || (selectedPort.cargoBerths ? selectedPort.cargoBerths.maxLOA : 225);
  const maxBeam = selectedPort.maxBeam || (selectedPort.cargoBerths ? selectedPort.cargoBerths.maxBeam : 32.5);

  const isDraftOk = maxDraft >= testCargoDraft;
  const isLoaOk = maxLoa >= vesselLoa;
  const isBeamOk = maxBeam >= vesselBeam;
  const isDirectlyFeasible = isDraftOk && isLoaOk && isBeamOk;

  // Lightering calculation
  const lighteringNeeded = !isDraftOk && (selectedPort.lighteringRequiredAboveDwt || selectedPort.lighteringAvailable);
  const estimatedLighteringCost = lighteringNeeded 
    ? ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD * (vesselDwt * 0.4) 
    : 0;

  const portList = activeRegion === 'eastCoast' ? EAST_COAST_PORTS : FOREIGN_LOAD_PORTS;

  return (
    <div 
      className="port-operations-flagship"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.75rem', 
        background: '#181A1D', 
        color: '#E2E8F0', 
        padding: '1.75rem', 
        borderRadius: '12px',
        minHeight: '100%'
      }}
    >
      {/* ── 1. HEADER SECTION ── */}
      <section style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#F59E0B',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>PORT INFRASTRUCTURE & TERMINAL CONSTRAINTS</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span style={{ color: '#94A3B8', fontWeight: 600 }}>SAIL Raw Materials Discharging Network</span>
          </div>
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 0.35rem'
          }}>
            Berth Physical Dimensions & Waterline Envelopes
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            Rigorous regime-scoped clearance specifications: Permissible draft, LOA, beam, and mechanized daily discharge throughput.
          </p>
        </div>

        {/* TWO-TONE SELECTION CARDS: Region Switcher (Reference "Conditions" Pattern) */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <div
            onClick={() => { setActiveRegion('eastCoast'); setSelectedPortKey('paradip'); }}
            style={{
              background: activeRegion === 'eastCoast' ? '#F59E0B' : '#22252A',
              color: activeRegion === 'eastCoast' ? '#000000' : '#E2E8F0',
              border: activeRegion === 'eastCoast' ? '1.5px solid #D97706' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.6rem 1.1rem',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeRegion === 'eastCoast' ? '0 4px 14px rgba(245, 158, 11, 0.3)' : 'none'
            }}
          >
            <Anchor size={15} />
            <span>Indian East Coast ({Object.keys(EAST_COAST_PORTS).length} Ports)</span>
          </div>

          <div
            onClick={() => { setActiveRegion('foreign'); setSelectedPortKey('Australia'); }}
            style={{
              background: activeRegion === 'foreign' ? '#F59E0B' : '#22252A',
              color: activeRegion === 'foreign' ? '#000000' : '#E2E8F0',
              border: activeRegion === 'foreign' ? '1.5px solid #D97706' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.6rem 1.1rem',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeRegion === 'foreign' ? '0 4px 14px rgba(245, 158, 11, 0.3)' : 'none'
            }}
          >
            <Globe size={15} />
            <span>Foreign Load Terminals ({Object.keys(FOREIGN_LOAD_PORTS).length})</span>
          </div>
        </div>
      </section>

      {/* ── 2. "DIMENSIONS" SPEC CARDS GRID (EXACT REFERENCE PATTERN) ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              DIMENSIONS & BERTHING SPECIFICATIONS
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0 0' }}>
              {activeRegion === 'eastCoast' ? 'Indian Discharging Quays & Terminals' : 'Key Global Coal Load Ports'}
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Click card to inspect berth physics & test compatibility
          </span>
        </div>

        {/* The Reference "Dimensions" Cards Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {Object.keys(portList).map((key) => {
            const port = portList[key];
            const isSelected = selectedPortKey === key;
            const draft = port.maxDraft || port.cargoBerths?.maxDraft || 14.5;
            const loa = port.maxLOA || port.cargoBerths?.maxLOA || 290;
            const beam = port.maxBeam || port.cargoBerths?.maxBeam || 45.0;
            const dwt = port.maxDWT || port.cargoBerths?.maxDWT || 150000;
            const rate = port.dischargeRateTpd || port.handlingCapacityTpd || port.loadRateTpd || 35000;
            const portTitle = port.name ? port.name.replace(' Port Authority', '').replace(' (VPT)', '') : (port.ports ? port.ports[0].split('/')[0] : port.country);
            const portSub = port.state ? `${port.state} • SAIL Link` : `${port.country} Load Port`;

            return (
              <div
                key={key}
                onClick={() => setSelectedPortKey(key)}
                style={{
                  background: isSelected ? '#2A2E35' : '#22252A',
                  border: isSelected ? '1.5px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 8px 24px rgba(245, 158, 11, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Top Row: Title + Subtitle + Info Icon Button in Corner (Exact Reference Pattern) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                        {portTitle}
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                        {portSub}
                      </div>
                    </div>

                    {/* Corner Info Button (Yellow Amber circle from reference) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedSpec(port);
                      }}
                      title="Inspect Official Marine Regulations Citation"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? '#F59E0B' : 'rgba(245, 158, 11, 0.2)',
                        border: 'none',
                        color: isSelected ? '#000000' : '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                        transition: 'all 0.15s'
                      }}
                    >
                      <Info size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Clean Labeled Measurement Rows (Adapted from Length / Width / Height to Draft / LOA / Beam / DWT) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.74rem' }}>
                      <div style={{ color: '#94A3B8' }}>
                        Max Draft: <strong style={{ color: draft >= 17.0 ? '#34D399' : '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}>{draft} m</strong>
                      </div>
                      <div style={{ color: '#94A3B8' }}>
                        Max LOA: <strong style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>{loa} m</strong>
                      </div>
                      <div style={{ color: '#94A3B8' }}>
                        Max Beam: <strong style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>{beam} m</strong>
                      </div>
                      <div style={{ color: '#94A3B8' }}>
                        Cap DWT: <strong style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>{(dwt / 1000).toFixed(0)}k DWT</strong>
                      </div>
                    </div>

                    {/* Simple Line-art Icon Representation in Lower-Right (Matching Reference container wireframe) */}
                    <div style={{ opacity: isSelected ? 1 : 0.6, transition: 'opacity 0.2s', paddingBottom: '4px' }}>
                      <QuayLineArt width={95} height={48} />
                    </div>

                  </div>
                </div>

                {/* Bottom status badge / callout */}
                <div style={{ marginTop: '0.9rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: draft >= 17.0 ? '#34D399' : '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {draft >= 17.0 ? 'Capesize Deep Berth' : 'Panamax / Lightering'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
                    {(rate / 1000).toFixed(0)}k t/d rate
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. LIVE VESSEL BERTH CLEARANCE & EVALUATOR (CALCULATION FORM & TWO-TONE CONDITIONS) ── */}
      <section 
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(360px, 0.95fr)',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}
      >
        
        {/* Left Card: Vessel Class Spec Cards & Live Clearance Form */}
        <div 
          style={{
            background: '#22252A',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              VESSEL CLASS SPECIFICATIONS ("DIMENSIONS" PATTERN)
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0 0' }}>
              Select Vessel Class to Simulate Against {selectedPort.name || selectedPort.country}
            </h3>
          </div>

          {/* 4 Vessel Class Cards styled with the Reference "Dimensions" Card Pattern */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
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
                    background: isVSelected ? '#2E333C' : '#1D2024',
                    border: isVSelected ? '1.5px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FFFFFF' }}>
                      {v.name.split('/')[0]}
                    </div>
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: isVSelected ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                        color: isVSelected ? '#000000' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 900
                      }}
                    >
                      i
                    </div>
                  </div>

                  {/* Labeled Specs */}
                  <div style={{ marginTop: '0.65rem', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', color: '#94A3B8' }}>
                    <div>Draft Req: <strong style={{ color: '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}>{v.draftReq} m</strong></div>
                    <div>LOA Req: <strong style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>{v.loaReq} m</strong></div>
                    <div>Beam Req: <strong style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>{v.beamReq} m</strong></div>
                    <div>Avg DWT: <strong style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>{(v.avgDwt / 1000).toFixed(0)}k MT</strong></div>
                  </div>

                  {/* Vessel Silhouette */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem', opacity: isVSelected ? 1 : 0.4 }}>
                    <VesselLineArt width={70} height={35} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Input Row for Custom Arrival Draft */}
          <div style={{ background: '#1D2024', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                Simulate Vessel Arrival Draft (m)
              </label>
              <input 
                type="number"
                step="0.1"
                value={testCargoDraft}
                onChange={(e) => setTestCargoDraft(parseFloat(e.target.value) || 12)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: '#2D3139',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                Estimated Discharge Duration
              </label>
              <div style={{ padding: '0.65rem 0.85rem', background: '#2D3139', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.12)', fontWeight: 800, color: '#FFFFFF', fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace" }}>
                {((vesselSpec.avgDwt || 75000) / (selectedPort.dischargeRateTpd || selectedPort.handlingCapacityTpd || selectedPort.loadRateTpd || 35000)).toFixed(1)} Days Alongside
              </div>
            </div>
          </div>

        </div>

        {/* Right Card: Terminal Compatibility Clearance & Two-Tone Strategy Decision */}
        <div 
          style={{
            background: '#22252A',
            border: isDirectlyFeasible ? '1.5px solid #10B981' : '1.5px solid #F59E0B',
            borderRadius: '10px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: isDirectlyFeasible ? '#10B981' : '#F59E0B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: isDirectlyFeasible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                border: isDirectlyFeasible ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                BERTH COMPATIBILITY VERDICT
              </span>

              <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
                UKC: {(maxDraft - testCargoDraft).toFixed(1)}m
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
              {selectedPort.name || selectedPort.country}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              Testing against <strong>{vesselSpec.name}</strong> at <strong>{testCargoDraft}m</strong> arrival draft.
            </div>

            {/* TWO-TONE SELECTION CARDS: Direct Berth vs Offshore Lightering (Reference "Conditions" Pattern) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
              
              {/* Option A: Direct Berth Alongside */}
              <div 
                style={{
                  background: isDirectlyFeasible ? '#F59E0B' : '#F1F5F9',
                  color: isDirectlyFeasible ? '#000000' : '#0F172A',
                  borderRadius: '8px',
                  padding: '0.95rem',
                  border: isDirectlyFeasible ? '2px solid #D97706' : '1px solid #E2E8F0',
                  boxShadow: isDirectlyFeasible ? '0 4px 14px rgba(245, 158, 11, 0.35)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Direct Berth Feasible</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '3px', lineHeight: 1.35 }}>
                  {maxDraft}m limit allows direct quay berthing. Zero offshore double-handling penalties.
                </div>
              </div>

              {/* Option B: Offshore Transshipment / Lightering */}
              <div 
                style={{
                  background: !isDirectlyFeasible ? '#F59E0B' : '#F1F5F9',
                  color: !isDirectlyFeasible ? '#000000' : '#0F172A',
                  borderRadius: '8px',
                  padding: '0.95rem',
                  border: !isDirectlyFeasible ? '2px solid #D97706' : '1px solid #E2E8F0',
                  boxShadow: !isDirectlyFeasible ? '0 4px 14px rgba(245, 158, 11, 0.35)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Lightering Required</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '3px', lineHeight: 1.35 }}>
                  Draft exceeded by {(testCargoDraft - maxDraft).toFixed(1)}m. Requires offshore anchorage discharge.
                </div>
              </div>

            </div>

            {/* Metric clearance summary banner */}
            <div 
              style={{
                background: '#1D2024',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.95rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                fontSize: '0.78rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Permissible Berth Draft:</span>
                <strong style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>{maxDraft} m</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Maximum Vessel LOA Allowed:</span>
                <strong style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>{maxLoa} m</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Offshore Transshipment Surcharge:</span>
                <strong style={{ color: isDirectlyFeasible ? '#10B981' : '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}>
                  {isDirectlyFeasible ? '$0 (No Lightering)' : `+$${Math.round(estimatedLighteringCost).toLocaleString()} USD`}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Button: Route into Voyage Planner */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => {
                if (onSelectPortForVoyage) onSelectPortForVoyage(selectedPortKey);
              }}
              style={{
                width: '100%',
                background: '#F1F5F9',
                color: '#0F172A',
                border: 'none',
                borderRadius: '6px',
                padding: '0.8rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>Set as Destination in Voyage Planner</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>

      </section>

      {/* ── 4. PARADIP DUAL-BERTHING REGIME (IF PARADIP SELECTED) ── */}
      {selectedPortKey === 'paradip' && activeRegion === 'eastCoast' && (
        <section 
          style={{
            background: '#22252A',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '1.25rem'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
            PARADIP PORT DUAL-BERTHING REGIMES (VERIFIED TERMINAL MATRIX)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#1D2024', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10B981', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontWeight: 800, color: '#34D399', fontSize: '0.9rem' }}>Cargo Berths (CB-01, CB-02, IO Berth)</div>
              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '0.4rem', fontFamily: "'JetBrains Mono', monospace" }}>
                Max Draft: <strong>14.5 m</strong> • Max LOA: <strong>300 m</strong> • Max Beam: <strong>48.0 m</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                Dedicated for Supramax, Panamax & Kamsarmax dry bulkers up to ~100k DWT.
              </div>
            </div>

            <div style={{ background: '#1D2024', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontWeight: 800, color: '#F59E0B', fontSize: '0.9rem' }}>Outer Approach Channel Capability</div>
              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '0.4rem', fontFamily: "'JetBrains Mono', monospace" }}>
                Channel Depth: <strong>16.5 m</strong> • Max DWT: <strong>155,000 MT</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                General channel accommodates Capesize vessels; specific berth draft remains capped at 14.5m.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. HALDIA RIVERINE ALERT (IF HALDIA SELECTED) ── */}
      {selectedPortKey === 'haldia' && activeRegion === 'eastCoast' && (
        <section 
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}
        >
          <AlertTriangle size={24} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, color: '#F59E0B', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Riverine Hugli Estuary Draft Bottleneck Notice
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.5 }}>
              Haldia Dock Complex is governed by river bars (Auckland and Balari bars) with maximum navigable draft restricted between <strong>7.5m and 8.5m</strong> depending on tidal cycle. Fully laden Panamax vessels cannot berth directly without offshore transshipment / lightering at Sagar Island or Sandheads.
            </div>
          </div>
        </section>
      )}

      {/* ── INFO MODAL / CITATION DETAIL (WHEN INFO ICON CLICKED) ── */}
      {inspectedSpec && (
        <div 
          onClick={() => setInspectedSpec(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#22252A',
              border: '1.5px solid #F59E0B',
              borderRadius: '10px',
              padding: '1.75rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                OFFICIAL SPECIFICATION AUDIT
              </div>
              <button 
                onClick={() => setInspectedSpec(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '1.1rem', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem' }}>
              {inspectedSpec.name || inspectedSpec.country}
            </h3>

            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '1rem', lineHeight: 1.5 }}>
              {inspectedSpec.notes || inspectedSpec.description || 'Primary maritime terminal.'}
            </div>

            <div style={{ background: '#181A1D', borderRadius: '6px', padding: '0.85rem', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Regulatory Citation:</div>
              <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600, marginTop: '2px' }}>
                {inspectedSpec.citation || 'Official Port Marine Department Operations Manual'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Status: {inspectedSpec.status || 'VERIFIED OPERATIONAL REGIME'}
              </div>
            </div>

            <button
              onClick={() => setInspectedSpec(null)}
              style={{
                width: '100%',
                background: '#F59E0B',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
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
