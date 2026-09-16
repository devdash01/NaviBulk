// SAIL NaviBulk — Precision Berth Waterline & Keel Clearance Cross-Section
import React from 'react';
import { Anchor, AlertTriangle, CheckCircle2, Waves, ArrowRight, Info, ShieldCheck, Ship, ArrowDown, ArrowUp } from 'lucide-react';
import { EAST_COAST_PORTS, VESSEL_CLASSES } from '../data/portConstraints';

export default function BerthWaterlineCrossSection({ 
  vesselClass = 'panamax', 
  destinationPortKey = 'paradip',
  compact = false 
}) {
  const port = EAST_COAST_PORTS[destinationPortKey] || EAST_COAST_PORTS.paradip;
  const vessel = VESSEL_CLASSES[vesselClass] || VESSEL_CLASSES.panamax;

  // Maximum berth draft limit at destination
  const maxBerthDraft = Number(port.maxDraft || port.maxDraftM || port.cargoBerths?.maxDraft || 14.5);
  // Ship full-load draft
  const shipDraft = Number(vessel.draftReq || vessel.typicalDraftM || 13.8);
  const diffVal = maxBerthDraft - shipDraft;
  const clearanceDiff = Math.abs(diffVal).toFixed(1);
  const isDirectClear = shipDraft <= maxBerthDraft;
  const unloadingRate = Number(port.handlingCapacityTpd || port.unloadingRateTpd || 35000);

  // SVG Gauge calculations
  // Scale: 0m (top waterline) to 20m (seabed floor)
  const maxGaugeDepth = 20; 
  const svgHeight = compact ? 190 : 220;
  const getY = (depth) => Math.min(svgHeight - 20, Math.max(10, (depth / maxGaugeDepth) * (svgHeight - 40) + 20));

  const waterlineY = 22;
  const berthDraftY = getY(maxBerthDraft);
  const shipKeelY = getY(shipDraft);
  const seabedY = svgHeight - 15;

  return (
    <div 
      style={{
        background: 'var(--bg-surface, #FFFFFF)',
        border: '1px solid var(--hairline, #E2E8F0)',
        borderRadius: '8px',
        padding: compact ? '1.25rem' : '1.5rem',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        color: '#0F172A',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        {/* ── TOP HEADER WITH CAUSE-AND-EFFECT STATUS ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#B45309'
              }}>
                <Anchor size={16} />
              </div>
              <h4 style={{ fontFamily: "var(--font-sans)", fontSize: compact ? '1.05rem' : '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Berth Waterline & Keel Clearance
              </h4>
              <span 
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  background: isDirectClear ? '#DCFCE7' : '#FEE2E2',
                  color: isDirectClear ? '#166534' : '#991B1B',
                  border: `1px solid ${isDirectClear ? '#BBF7D0' : '#FECACA'}`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {isDirectClear ? 'DIRECT BERTH FEASIBLE' : 'LIGHTERING MANDATORY'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
              Comparing <strong>{vessel.name}</strong> draft ({shipDraft}m) to <strong>{port.name}</strong> channel ({maxBerthDraft}m).
            </p>
          </div>

          {/* Live Clearance Metrics Badge */}
          <div 
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: isDirectClear ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${isDirectClear ? '#BBF7D0' : '#FECACA'}`,
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: isDirectClear ? '#166534' : '#991B1B' }}>
              Under-Keel Clearance (UKC)
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: '1.35rem', fontWeight: 900, color: isDirectClear ? '#166534' : '#991B1B', lineHeight: 1.15 }}>
              {isDirectClear ? `+${clearanceDiff}m Clearance` : `-${clearanceDiff}m Deficit`}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '1px' }}>
              {isDirectClear ? 'Direct discharge clearance' : 'Sandheads lightering required'}
            </div>
          </div>
        </div>

        {/* ── TOP TELEMETRY STRIP (PORT LIMIT vs VESSEL DRAFT vs UKC) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1rem'
        }}>
          {/* Port Max Draft Spec */}
          <div style={{
            background: '#F8FAFC',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            border: '1px solid #E2E8F0'
          }}>
            <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
              Port Berth Limit
            </span>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: '1.5rem', fontWeight: 900, color: '#B45309', margin: '2px 0' }}>
              {maxBerthDraft.toFixed(1)}m
            </div>
            <span style={{ fontSize: '0.72rem', color: '#0F172A', fontWeight: 700 }}>{port.name}</span>
          </div>

          {/* Vessel Summer Draft */}
          <div style={{
            background: '#F8FAFC',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            border: '1px solid #E2E8F0'
          }}>
            <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
              Vessel Full-Load Draft
            </span>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: '1.5rem', fontWeight: 900, color: isDirectClear ? '#166534' : '#DC2626', margin: '2px 0' }}>
              {shipDraft.toFixed(1)}m
            </div>
            <span style={{ fontSize: '0.72rem', color: '#0F172A', fontWeight: 700 }}>{vessel.name}</span>
          </div>

          {/* Under-Keel Margin */}
          <div style={{
            background: '#F8FAFC',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            border: `1px solid ${isDirectClear ? '#BBF7D0' : '#FECACA'}`
          }}>
            <span style={{ fontSize: '0.62rem', color: isDirectClear ? '#166534' : '#991B1B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
              Net Safety Margin
            </span>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: '1.5rem', fontWeight: 900, color: isDirectClear ? '#166534' : '#DC2626', margin: '2px 0' }}>
              {isDirectClear ? `+${clearanceDiff}m` : `-${clearanceDiff}m`}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{isDirectClear ? 'Safe keel clearance' : 'Channel draft exceeded'}</span>
          </div>

          {/* Discharge Facility */}
          <div style={{
            background: '#F8FAFC',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            border: '1px solid #E2E8F0'
          }}>
            <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
              Discharge Handling
            </span>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: '1.45rem', fontWeight: 900, color: '#2563EB', margin: '2px 0' }}>
              {unloadingRate.toLocaleString()}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}> TPD</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Mechanized Conveyor</span>
          </div>
        </div>

        {/* ── HIGH-END MARITIME CROSS-SECTION WATERLINE DIAGRAM (FULL WIDTH) ── */}
        <div 
          style={{
            width: '100%',
            background: '#12161D',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1rem 1.25rem',
            position: 'relative',
            marginBottom: '1rem',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Waves size={13} /> Sea Waterline (0.0m datum)
            </span>
            <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Ship size={13} /> Sized Hull Keel: <strong>{shipDraft}m</strong>
            </span>
            <span style={{ color: isDirectClear ? '#34D399' : '#F87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Anchor size={13} /> Port Bed: <strong>{maxBerthDraft}m</strong>
            </span>
          </div>

          {/* SVG Visual Cross-Section */}
          <div style={{ position: 'relative', width: '100%', height: `${svgHeight}px`, margin: '0.5rem 0' }}>
                <svg 
                  viewBox="0 0 540 220" 
                  preserveAspectRatio="xMidYMid meet" 
                  style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}
                >
                  <defs>
                    <linearGradient id="waterDepthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284C7" stopOpacity="0.30" />
                      <stop offset="50%" stopColor="#0369A1" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.85" />
                    </linearGradient>

                    <pattern id="seabedPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                      <path d="M0 16 L16 0 M0 8 L8 0 M8 16 L16 8" stroke="#334155" strokeWidth="1" opacity="0.4" />
                    </pattern>
                  </defs>

                  {/* Ocean Depth Body */}
                  <rect x="0" y={waterlineY} width="540" height={seabedY - waterlineY} fill="url(#waterDepthGrad)" rx="4" />

                  {/* Waterline Wave Animation Line */}
                  <line x1="0" y1={waterlineY} x2="540" y2={waterlineY} stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="12" y={waterlineY - 6} fill="#38BDF8" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
                    WATERLINE (0.0m datum)
                  </text>

                  {/* Port Channel Permissible Depth Line */}
                  <line x1="0" y1={berthDraftY} x2="540" y2={berthDraftY} stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="5 3" opacity="0.85" />
                  <text x="12" y={berthDraftY - 5} fill="#F59E0B" fontSize="9.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
                    PORT CHANNEL LIMIT: {maxBerthDraft}m
                  </text>

                  {/* Vessel Hull Silhouette Cross-Section — CENTERED at x=270 */}
                  {/* Symmetrical hull with breadth=240px: from x=150 to x=390, keel bottom width 160px from x=190 to x=350 */}
                  <g>
                    {/* Vessel Superstructure & Cargo Holds Profile */}
                    <rect x="252" y={waterlineY - 26} width="36" height="26" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" rx="2" />
                    <rect x="264" y={waterlineY - 34} width="12" height="8" fill="#F59E0B" opacity="0.8" rx="1" />
                    {/* Hatch Coamings */}
                    <rect x="180" y={waterlineY - 8} width="32" height="8" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" rx="1" />
                    <rect x="220" y={waterlineY - 8} width="24" height="8" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" rx="1" />
                    <rect x="296" y={waterlineY - 8} width="24" height="8" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" rx="1" />
                    <rect x="328" y={waterlineY - 8} width="32" height="8" fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" rx="1" />

                    {/* Symmetrically Centered Hull */}
                    <path
                      d={`M 150 ${waterlineY} L 175 ${shipKeelY - 12} Q 190 ${shipKeelY} 220 ${shipKeelY} L 320 ${shipKeelY} Q 350 ${shipKeelY} 365 ${shipKeelY - 12} L 390 ${waterlineY} Z`}
                      fill={isDirectClear ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.25)'}
                      stroke={isDirectClear ? '#10B981' : '#EF4444'}
                      strokeWidth="2.5"
                    />
                    
                    {/* Centerline Draft Mark */}
                    <line x1="270" y1={waterlineY} x2="270" y2={shipKeelY} stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="3 3" strokeWidth="1" />

                    {/* Keel Baseline */}
                    <line 
                      x1="200" 
                      y1={shipKeelY} 
                      x2="340" 
                      y2={shipKeelY} 
                      stroke={isDirectClear ? '#34D399' : '#F87171'} 
                      strokeWidth="3" 
                    />

                    {/* Keel Center Callout */}
                    <rect x="195" y={shipKeelY - 18} width="150" height="16" rx="3" fill="#0F172A" stroke={isDirectClear ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'} strokeWidth="1" />
                    <text 
                      x="270" 
                      y={shipKeelY - 6} 
                      textAnchor="middle" 
                      fill="#FFFFFF" 
                      fontSize="9.5" 
                      fontFamily="'JetBrains Mono', monospace" 
                      fontWeight="800"
                    >
                      KEEL DRAFT: {shipDraft}m ({vessel.name.split(' ')[0]})
                    </text>
                  </g>

                  {/* Left Side: Vessel Draft Dimension Bracket (Waterline to Keel) */}
                  <g transform="translate(105, 0)">
                    <line x1="0" y1={waterlineY} x2="0" y2={shipKeelY} stroke="#38BDF8" strokeWidth="1.5" />
                    <line x1="-5" y1={waterlineY} x2="5" y2={waterlineY} stroke="#38BDF8" strokeWidth="1.5" />
                    <line x1="-5" y1={shipKeelY} x2="5" y2={shipKeelY} stroke="#38BDF8" strokeWidth="1.5" />
                    <rect x="-42" y={(waterlineY + shipKeelY) / 2 - 9} width="38" height="18" rx="3" fill="#0B2A4A" stroke="#38BDF8" strokeWidth="1" />
                    <text x="-23" y={(waterlineY + shipKeelY) / 2 + 4} textAnchor="middle" fill="#38BDF8" fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="800">
                      {shipDraft}m
                    </text>
                  </g>

                  {/* Right Side: Under-Keel Clearance (UKC) / Deficit Dimension */}
                  {isDirectClear ? (
                    <g transform="translate(425, 0)">
                      <line x1="0" y1={shipKeelY} x2="0" y2={berthDraftY} stroke="#10B981" strokeWidth="2.5" />
                      <circle cx="0" cy={shipKeelY} r="3" fill="#10B981" />
                      <circle cx="0" cy={berthDraftY} r="3" fill="#10B981" />
                      <rect x="8" y={(shipKeelY + berthDraftY) / 2 - 11} width="96" height="22" rx="4" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
                      <text x="56" y={(shipKeelY + berthDraftY) / 2 + 4} textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="900">
                        +{clearanceDiff}m UKC SAFE
                      </text>
                    </g>
                  ) : (
                    <g transform="translate(425, 0)">
                      <line x1="0" y1={berthDraftY} x2="0" y2={shipKeelY} stroke="#EF4444" strokeWidth="2.5" />
                      <circle cx="0" cy={berthDraftY} r="3" fill="#EF4444" />
                      <circle cx="0" cy={shipKeelY} r="3" fill="#EF4444" />
                      <rect x="8" y={(berthDraftY + shipKeelY) / 2 - 11} width="102" height="22" rx="4" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
                      <text x="59" y={(berthDraftY + shipKeelY) / 2 + 4} textAnchor="middle" fill="#F87171" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="900">
                        -{clearanceDiff}m DEFICIT
                      </text>
                    </g>
                  )}

                  {/* Seabed Floor Base */}
                  <rect x="0" y={seabedY} width="540" height="20" fill="#1E242B" />
                  <rect x="0" y={seabedY} width="540" height="20" fill="url(#seabedPattern)" />
                  <line x1="0" y1={seabedY} x2="540" y2={seabedY} stroke="#475569" strokeWidth="1.2" />
                  <text x="12" y={seabedY + 12} fill="#94A3B8" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
                    HARBOR SEABED BASIN (DATUM ~20m)
                  </text>
                </svg>
              </div>

              {/* Depth Markers Bottom Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace", borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.4rem' }}>
                <span>0.0m Sea Waterline</span>
                <span>Vessel Keel: {shipDraft}m</span>
                <span>Port Berth Limit: {maxBerthDraft}m</span>
                <span>Harbor Basin Seabed (~20m)</span>
              </div>
          </div>
        </div>

      {/* ── THE STRATEGIC "WHY" & ACTIONABLE OPERATIONAL SOLUTION ── */}
      <div 
        style={{
          background: isDirectClear ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${isDirectClear ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          borderLeft: `4px solid ${isDirectClear ? '#10B981' : '#EF4444'}`,
          borderRadius: '8px',
          padding: '0.85rem 1.15rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          {isDirectClear ? <CheckCircle2 size={16} color="#34D399" /> : <AlertTriangle size={16} color="#F87171" />}
          <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: isDirectClear ? '#34D399' : '#F87171', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
            {isDirectClear ? 'Direct Berth Feasible — Zero Lightering Required' : 'Berth Draft Exceeded — Offshore Lightering Mandatory'}
          </h5>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
          {isDirectClear ? (
            <>
              With a <strong>{shipDraft}m laden draft</strong>, this <strong>{vessel.name}</strong> maintains safe under-keel clearance of <strong>+{clearanceDiff}m</strong> at {port.name}. 
              The vessel can sail directly into berth, discharge via mechanized conveyor at {unloadingRate.toLocaleString()} TPD, and incur <strong>zero offshore lightering transshipment fees ($0)</strong>.
            </>
          ) : (
            <>
              Fixing a <strong>{vessel.name} ({shipDraft}m draft)</strong> for <strong>{port.name} (max {maxBerthDraft}m limit)</strong> exceeds harbor approach channel by <strong>{clearanceDiff}m</strong>. 
              The vessel must anchor offshore at Sandheads for lightering barges (costs <strong>$3.20/MT / ~$240,000 extra</strong>).
              <br />
              <strong style={{ color: '#F59E0B' }}>Action: </strong> Click <strong>Panamax</strong> in the candidate table to achieve direct berthing with zero lightering surcharge.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
