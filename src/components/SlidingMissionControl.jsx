// SAIL NaviBulk — Sliding Mission Tactical Control Deck
import React, { useState } from 'react';
import { 
  Factory, 
  Zap, 
  Mountain, 
  Layers, 
  Anchor, 
  Ship, 
  Calendar, 
  TrendingDown, 
  ShieldCheck, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS, VESSEL_CLASSES } from '../data/portConstraints';
import BerthWaterlineCrossSection from './BerthWaterlineCrossSection';
import ExecutiveSavingsLedger from './ExecutiveSavingsLedger';
import ForecastChart from './ForecastChart';

export default function SlidingMissionControl({
  inputs,
  setInputs,
  currentChapter,
  setCurrentChapter,
  isOpen,
  setIsOpen,
  timingEval,
  rankedVessels,
  activeVesselObj,
  onOpenPortDatabase,
  onNavigate,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const chapters = [
    { num: 1, title: 'Cargo & Origin', subtitle: 'Parcel Specs' },
    { num: 2, title: 'Draft & Berth', subtitle: 'Waterline Depth' },
    { num: 3, title: 'Market Timing', subtitle: 'Baltic Forecast' },
    { num: 4, title: 'Chokepoint Defense', subtitle: 'Risk & Weather' },
    { num: 5, title: 'Value Ledger', subtitle: 'Executive Sign-Off' },
  ];

  const COMMODITIES = [
    { id: 'Coking Coal', title: 'Prime Hard Coking Coal', icon: Factory, desc: 'Metallurgical coal for blast furnaces (Queensland / US East Coast)' },
    { id: 'Thermal Coal', title: 'Thermal Steam Coal', icon: Zap, desc: 'High-energy boiler fuel for captive power plants' },
    { id: 'Iron Ore Fines', title: 'Iron Ore Fines / Pellets', icon: Mountain, desc: 'Sinter feed and blast furnace burden' },
    { id: 'Limestone', title: 'Limestone / Dolomite', icon: Layers, desc: 'Smelting flux for BOF steelmaking' },
  ];

  const ORIGINS = [
    { id: 'Australia', label: 'Australia (Gladstone / Hay Pt)', dist: '5,420 NM', days: '16 Days' },
    { id: 'US', label: 'United States (Norfolk)', dist: '8,400 NM', days: '25 Days' },
    { id: 'Mozambique', label: 'Mozambique (Maputo)', dist: '3,800 NM', days: '11 Days' },
    { id: 'Indonesia', label: 'Indonesia (Taboneo)', dist: '2,200 NM', days: '7 Days' },
    { id: 'Russia', label: 'Russia Far East (Vostochny)', dist: '4,600 NM', days: '14 Days' },
  ];

  const destPort = EAST_COAST_PORTS[inputs.destinationPortKey] || EAST_COAST_PORTS.paradip;

  return (
    <div
      className={`sliding-mission-drawer ${isOpen ? 'open' : 'closed'} ${isExpanded ? 'expanded' : ''}`}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: isExpanded ? '85%' : '580px',
        maxWidth: '100%',
        background: '#FFFFFF',
        borderLeft: '2px solid #CBD5E1',
        boxShadow: '-10px 0 35px rgba(15, 23, 42, 0.15)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      {/* ── Drawer Header: Tactical Chapter Switcher ── */}
      <div
        style={{
          padding: '1.1rem 1.5rem',
          background: '#0B2545',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1E4068',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#0284C7',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            0{currentChapter}
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              CHAPTER {currentChapter} OF 5
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
              {chapters[currentChapter - 1].title}
            </div>
          </div>
        </div>

        {/* Drawer Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Compact Panel' : 'Expand Panel'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            title="Collapse Panel"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Sub-Nav: 5 Chapter Progress Tabs ── */}
      <div
        style={{
          display: 'flex',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          overflowX: 'auto',
        }}
      >
        {chapters.map((ch) => {
          const isActive = currentChapter === ch.num;
          const isDone = currentChapter > ch.num;
          return (
            <button
              key={ch.num}
              onClick={() => setCurrentChapter(ch.num)}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                border: 'none',
                background: isActive ? '#FFFFFF' : 'transparent',
                borderBottom: isActive ? '3px solid #0284C7' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: isActive ? '#0284C7' : isDone ? '#059669' : '#94A3B8',
                  textTransform: 'uppercase',
                }}
              >
                {isDone ? '✓ DONE' : `STEP 0${ch.num}`}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#0F172A' : '#64748B',
                  whiteSpace: 'nowrap',
                }}
              >
                {ch.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Scrollable Body Area ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          background: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* ═══════════════════════════════════════════════════════════
            CHAPTER 1: CARGO SPECIFICATION & ORIGIN CORRIDOR
        ═══════════════════════════════════════════════════════════ */}
        {currentChapter === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Step 1.1: Select Steelmaking Commodity
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem' }}>
                Choose raw material to automatically determine parcel density and compatible hold requirements.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {COMMODITIES.map((c) => {
                  const isSelected = inputs.cargoType === c.id;
                  const IconComp = c.icon;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setInputs((prev) => ({ ...prev, cargoType: c.id }))}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                        background: isSelected ? '#F0F9FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <IconComp size={16} color={isSelected ? '#0284C7' : '#64748B'} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#0369A1' : '#0F172A' }}>
                          {c.title}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.4 }}>
                        {c.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Origin & Destination Configuration */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Step 1.2: Sea Lane Trade Corridor
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                    Load Origin Country
                  </label>
                  <select
                    value={inputs.originCountry}
                    onChange={(e) => setInputs((prev) => ({ ...prev, originCountry: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#0F172A',
                    }}
                  >
                    {ORIGINS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label} — {o.dist} ({o.days})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                    Discharge Port (East Coast India)
                  </label>
                  <select
                    value={inputs.destinationPortKey}
                    onChange={(e) => setInputs((prev) => ({ ...prev, destinationPortKey: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#0F172A',
                    }}
                  >
                    {Object.entries(EAST_COAST_PORTS).map(([k, p]) => (
                      <option key={k} value={k}>
                        {p.name} ({p.state}) — Max Berth Draft: {p.maxDraftM}m
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tonnage Parcel Selection */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                    Tonnage Parcel Size (DWT)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { tons: 35000, label: '35,000 MT (Handy)' },
                      { tons: 58000, label: '58,000 MT (Supra)' },
                      { tons: 75000, label: '75,000 MT (Panamax)' },
                      { tons: 150000, label: '150,000 MT (Cape)' },
                    ].map((t) => (
                      <button
                        key={t.tons}
                        onClick={() => setInputs((prev) => ({ ...prev, tonnage: t.tons }))}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: inputs.tonnage === t.tons ? '2px solid #0284C7' : '1px solid #CBD5E1',
                          background: inputs.tonnage === t.tons ? '#F0F9FF' : '#FFFFFF',
                          color: inputs.tonnage === t.tons ? '#0369A1' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CHAPTER 2: WATERLINE DRAFT & BERTH BATHYMETRY
        ═══════════════════════════════════════════════════════════ */}
        {currentChapter === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Step 2.1: Vessel Class Under-Keel Feasibility
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem' }}>
                Cross-checking loaded keel draft against {destPort.name} maximum draft ({destPort.maxDraftM}m).
              </p>

              {/* Vessel Class Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
                {['supramax', 'panamax', 'capesize'].map((vKey) => {
                  const v = VESSEL_CLASSES[vKey];
                  const isSelected = inputs.vesselClass === vKey;
                  const isCompatible = v.typicalDraftM <= destPort.maxDraftM;
                  return (
                    <div
                      key={vKey}
                      onClick={() => setInputs((prev) => ({ ...prev, vesselClass: vKey }))}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                        background: isSelected ? '#F0F9FF' : '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{v.name}</span>
                        {isCompatible ? (
                          <span style={{ fontSize: '0.68rem', background: '#DCFCE7', color: '#166534', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                            CLEARS
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', background: '#FEE2E2', color: '#991B1B', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                            TRAP RISK
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Draft: {v.typicalDraftM}m</div>
                    </div>
                  );
                })}
              </div>

              {/* Live Bathymetry Cutaway Component */}
              <BerthWaterlineCrossSection
                vesselClass={inputs.vesselClass}
                destinationPortKey={inputs.destinationPortKey}
              />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CHAPTER 3: BALTIC MARKET TIMING COCKPIT
        ═══════════════════════════════════════════════════════════ */}
        {currentChapter === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Step 3.1: Baltic Spot vs Period Charter Timing
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem' }}>
                Econometric forward curve indicates a soft rate window in 10–14 days. Fixing proactively locks in lower freight.
              </p>

              {/* Key Freight Timing Proof Banner */}
              <div
                style={{
                  background: '#F0F9FF',
                  border: '1.5px solid #BAE6FD',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>
                      Recommended Laycan Entry
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0C4A6E' }}>
                      Day +12 to Day +15 Window
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                      Freight Rate Arbitrage
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                      -$4,600 / day
                    </div>
                  </div>
                </div>
              </div>

              {/* Baltic Forward Curve Chart */}
              <ForecastChart inputs={inputs} />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CHAPTER 4: MARITIME RISK & CHOKEPOINT DEFENSE
        ═══════════════════════════════════════════════════════════ */}
        {currentChapter === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Step 4.1: Corridor Chokepoint & Weather Defense
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem' }}>
                Real-world operational risks screened with contractual mitigation riders.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  {
                    title: 'Bay of Bengal Tropical Swell Belt',
                    tag: 'HIGH SWELL RISK',
                    color: '#EF4444',
                    desc: 'Monsoon sea state can delay pilotage at Paradip & Dhamra anchorages.',
                    action: 'BIMCO Severe Weather Laytime Rider attached to exclude storm delays.',
                  },
                  {
                    title: 'Paradip Berth Congestion Index',
                    tag: 'MODERATE QUEUE',
                    color: '#F59E0B',
                    desc: 'Average 2.8 days waiting queue for mechanized coal discharge berths.',
                    action: 'Virtual Arrival Protocol enacted: ship slow-steams, saving 18 MT bunker fuel.',
                  },
                  {
                    title: 'Malacca Strait Navigation Window',
                    tag: 'ROUTINE TRANSIT',
                    color: '#059669',
                    desc: 'Clear draft margin maintained through Singapore Strait transit lanes.',
                    action: 'AIS live telemetry tracked via Indian Navy DG Shipping feed.',
                  },
                ].map((risk, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      borderLeft: `4px solid ${risk.color}`,
                      background: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{risk.title}</span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: risk.color,
                          background: `${risk.color}15`,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                        }}
                      >
                        {risk.tag}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.4rem' }}>{risk.desc}</p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7' }}>
                      Shield: {risk.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CHAPTER 5: EXECUTIVE AUDIT & VALUE SAVINGS LEDGER
        ═══════════════════════════════════════════════════════════ */}
        {currentChapter === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ExecutiveSavingsLedger
              inputs={inputs}
              activeVesselObj={activeVesselObj}
              timingEval={timingEval}
              onRestart={() => setCurrentChapter(1)}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>

      {/* ── Drawer Footer: Next / Back Controls ── */}
      <div
        style={{
          padding: '1rem 1.5rem',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          disabled={currentChapter === 1}
          onClick={() => setCurrentChapter((prev) => Math.max(1, prev - 1))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            background: currentChapter === 1 ? '#F1F5F9' : '#FFFFFF',
            color: currentChapter === 1 ? '#94A3B8' : '#334155',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: currentChapter === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
          {currentChapter} / 5 Chapters
        </div>

        {currentChapter < 5 ? (
          <button
            onClick={() => setCurrentChapter((prev) => Math.min(5, prev + 1))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
            }}
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => onNavigate && onNavigate('counterfactual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: '#059669',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
            }}
          >
            Lock Requisition <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
