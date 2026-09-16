// SAIL-NaviBulk — Interactive Maritime Hazard Geospatial Command Chart (Dark Admiralty GIS)
import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Wind, Anchor, Globe, Navigation, Layers, Info, CheckCircle2, Radar, Compass, Activity } from 'lucide-react';

const HAZARD_ZONES = [
  {
    id: 'bay_of_bengal',
    title: 'Bay of Bengal Tropical Cyclone & Depression Belt',
    region: 'North Bay of Bengal (Paradip / Dhamra / Sandheads)',
    x: 480,
    y: 180,
    r: 48,
    severity: 'high',
    color: '#EF4444',
    icon: Wind,
    stat: 'Force 8 Gales • 3.8m Swell Waves • IMD Red Alert',
    affectedPorts: 'Paradip, Dhamra, Sagar Sandheads',
    impact: 'Pilotage abort threshold exceeded; offshore transshipment suspended. Laytime runs into force majeure dispute without clear clauses.',
    clause: 'BIMCO Severe Weather Laytime Exclusion Clause (excludes port closure hours from laytime computation)',
    coordinates: '19.5° N, 88.2° E',
    activeVesselsInZone: 7
  },
  {
    id: 'paradip_queue',
    title: 'Paradip & Dhamra Berth Waiting Congestion',
    region: 'Mechanized Bulk Coal Berths 1 & 2',
    x: 468,
    y: 195,
    r: 32,
    severity: 'moderate',
    color: '#F59E0B',
    icon: Anchor,
    stat: '2.5–3.5 Days Average Waiting Queue • 14 Ships at Anchor',
    affectedPorts: 'Paradip Coal Berth-01/02',
    impact: 'Demurrage accumulation risk ($18,500/day on standard Panamax fixture). Steel plant stockyard replenishment delayed.',
    clause: 'SAIL Priority Discharge & Preference Berthing Protocol (Ministry of Steel MoA)',
    coordinates: '20.2° N, 86.6° E',
    activeVesselsInZone: 14
  },
  {
    id: 'malacca_strait',
    title: 'Malacca Strait Maritime Chokepoint Bottleneck',
    region: 'Singapore & Malacca Straits (Indo-Pacific Gateway)',
    x: 550,
    y: 235,
    r: 36,
    severity: 'moderate',
    color: '#38BDF8',
    icon: Navigation,
    stat: '16.5 Knots Traffic Density • 95,000+ Transits/Year',
    affectedPorts: 'Transit corridor for Australia & Indonesia coal shipments',
    impact: 'Tidal under-keel clearance (UKC) threshold in Phillip Channel; mandatory escort pilotage zones.',
    clause: 'Safe Navigation & Designated Transit Waypoint Warranty',
    coordinates: '1.4° N, 102.8° E',
    activeVesselsInZone: 29
  },
  {
    id: 'far_east_sanctions',
    title: 'Far East Sanctions & OFAC Banking Scrutiny',
    region: 'Vostochny / Nakhodka Corridor (Russia Far East)',
    x: 690,
    y: 110,
    r: 42,
    severity: 'high',
    color: '#F43F5E',
    icon: Globe,
    stat: 'Statutory Screening Level 4 (OFAC / EU / UKMTO AIS)',
    affectedPorts: 'Russian Load Ports to Indian Blast Furnaces',
    impact: 'P&I Club marine insurance verification, dark-fleet AIS tampering audit, escrow clearance delays.',
    clause: 'CONWARTIME 2013 & Non-Sanctioned Vessel Ownership Warranty',
    coordinates: '42.8° N, 133.0° E',
    activeVesselsInZone: 4
  }
];

export default function RiskRadarMap({ activeHazard, selectedHazardId, onSelectHazard }) {
  const currentHazardId = activeHazard || selectedHazardId;
  const [selectedHazard, setSelectedHazard] = useState(HAZARD_ZONES[0]);
  const [activeOverlay, setActiveOverlay] = useState('all'); // 'all' | 'weather' | 'congestion' | 'sanctions'

  const active = currentHazardId 
    ? (HAZARD_ZONES.find(h => h.id === currentHazardId) || selectedHazard)
    : selectedHazard;

  const handleSelect = (hazard) => {
    setSelectedHazard(hazard);
    if (onSelectHazard) onSelectHazard(hazard);
  };

  return (
    <div className="enterprise-card" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1.5px solid #BAE6FD', overflow: 'hidden', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.07)' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#EF4444',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
              animation: 'pulse 1.8s infinite'
            }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Maritime Hazard & Chokepoint Risk Radar</span>
              <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--workspace-bg)', color: 'var(--slate-primary)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)' }}>
                [Illustrative Risk Heuristic Model]
              </span>
            </h3>
            <span className="badge" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', fontSize: '0.68rem', fontWeight: 700 }}>4 MONITORED PASSAGES</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Maritime risk heuristics, bathymetric transit corridors, and automated charterparty laytime protection clauses.
          </p>
        </div>

        {/* Layer Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#F8FAFD', padding: '0.25rem', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
          {[
            { id: 'all', label: 'All Hazards' },
            { id: 'weather', label: 'Cyclones' },
            { id: 'congestion', label: 'Congestion' },
            { id: 'sanctions', label: 'OFAC / Sanctions' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveOverlay(layer.id)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: activeOverlay === layer.id ? '1px solid #0284C7' : '1px solid transparent',
                background: activeOverlay === layer.id ? '#E0F2FE' : 'transparent',
                color: activeOverlay === layer.id ? '#0284C7' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Dossier Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.55fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* Interactive SVG Nautical Sea Map */}
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '430px',
          background: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 100%)',
          borderRadius: '14px',
          border: '1.5px solid #94A3B8',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)'
        }}>
          {/* Nautical Bathymetry Grid Lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(2, 132, 199, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(2, 132, 199, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
            pointerEvents: 'none'
          }} />

          {/* Compass Rose Watermark */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            opacity: 0.15,
            pointerEvents: 'none',
            color: '#38BDF8'
          }}>
            <Compass size={110} />
          </div>

          {/* Live Radar Sweep Animation */}
          <div style={{
            position: 'absolute',
            top: '180px',
            left: '480px',
            width: '260px',
            height: '260px',
            marginTop: '-130px',
            marginLeft: '-130px',
            borderRadius: '50%',
            border: '1px dashed rgba(56, 189, 248, 0.18)',
            pointerEvents: 'none'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(56, 189, 248, 0.15) 60deg, transparent 65deg)',
              animation: 'radar-sweep 5s linear infinite'
            }} />
          </div>

          <svg viewBox="0 0 800 420" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <defs>
              <filter id="hazard-glow-neon" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="lane-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="corridor-australia" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0284C7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="corridor-africa" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="corridor-russia" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
              </linearGradient>

              {/* Cyclone spiral swirl pattern */}
              <pattern id="diagonal-hazard-red" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="2.5" />
              </pattern>

              <pattern id="diagonal-hazard-amber" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="2.5" />
              </pattern>
            </defs>

            {/* Bathymetric Contour Depth Rings */}
            <ellipse cx="480" cy="220" rx="140" ry="85" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" strokeDasharray="3 6" />
            <ellipse cx="480" cy="220" rx="220" ry="130" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />
            <ellipse cx="480" cy="220" rx="300" ry="180" fill="none" stroke="rgba(56, 189, 248, 0.03)" strokeWidth="1" />

            {/* Crisp Daylight Landmass Outlines */}
            {/* India Subcontinent */}
            <path
              d="M 430,125 L 490,150 L 485,210 L 460,260 L 440,245 L 415,190 Z"
              fill="#FFFFFF"
              stroke="#0284C7"
              strokeWidth="1.8"
            />
            <text x="442" y="165" fill="#0F172A" fontSize="11" fontWeight="800" fontFamily="Inter" letterSpacing="0.05em">INDIA</text>
            <text x="438" y="177" fill="#0284C7" fontSize="7.5" fontWeight="700" fontFamily="JetBrains Mono">EAST COAST</text>

            {/* Southeast Asia */}
            <path
              d="M 535,175 L 590,205 L 615,240 L 565,285 L 525,240 Z"
              fill="#F1F5F9"
              stroke="#64748B"
              strokeWidth="1.2"
            />
            <text x="550" y="225" fill="#334155" fontSize="9" fontWeight="700" fontFamily="Inter">SE ASIA</text>

            {/* Australia */}
            <path
              d="M 635,265 L 725,275 L 745,360 L 670,370 L 625,325 Z"
              fill="#FFFFFF"
              stroke="#64748B"
              strokeWidth="1.2"
            />
            <text x="660" y="325" fill="#0F172A" fontSize="11" fontWeight="800" fontFamily="Inter">AUSTRALIA</text>
            <text x="660" y="338" fill="#64748B" fontSize="7.5" fontWeight="600" fontFamily="Inter">Gladstone / Hay Point</text>

            {/* Africa Coastline */}
            <path
              d="M 280,215 L 330,255 L 340,340 L 290,370 Z"
              fill="#FFFFFF"
              stroke="#64748B"
              strokeWidth="1.2"
            />
            <text x="295" y="295" fill="#0F172A" fontSize="10" fontWeight="700" fontFamily="Inter">AFRICA</text>
            <text x="292" y="307" fill="#64748B" fontSize="7.5" fontWeight="600" fontFamily="Inter">(Maputo / Beira)</text>

            {/* Russia Far East */}
            <path
              d="M 660,70 L 730,75 L 720,135 L 670,125 Z"
              fill="#FFFFFF"
              stroke="#64748B"
              strokeWidth="1.2"
            />
            <text x="670" y="105" fill="#0F172A" fontSize="9.5" fontWeight="700" fontFamily="Inter">RUSSIA FE</text>

            {/* Glowing Active Maritime Corridors */}
            {/* Australia to Paradip */}
            <path
              d="M 660 300 Q 560 270 475 200"
              fill="none"
              stroke="url(#corridor-australia)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              filter="url(#lane-glow)"
            >
              <animate attributeName="stroke-dashoffset" from="30" to="0" dur="2s" repeatCount="indefinite" />
            </path>

            {/* Mozambique to East Coast */}
            <path
              d="M 330 290 Q 400 240 465 210"
              fill="none"
              stroke="url(#corridor-africa)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              filter="url(#lane-glow)"
            >
              <animate attributeName="stroke-dashoffset" from="30" to="0" dur="2.5s" repeatCount="indefinite" />
            </path>

            {/* Russia FE to East Coast */}
            <path
              d="M 680 120 Q 580 160 480 185"
              fill="none"
              stroke="url(#corridor-russia)"
              strokeWidth="2"
              strokeDasharray="5 5"
              filter="url(#lane-glow)"
            >
              <animate attributeName="stroke-dashoffset" from="30" to="0" dur="3s" repeatCount="indefinite" />
            </path>

            {/* Interactive Threat Hazard Zones with Cyber/Maritime Hologram */}
            {HAZARD_ZONES.map((zone) => {
              const isSelected = active.id === zone.id;
              const isVisible = activeOverlay === 'all' || 
                (activeOverlay === 'weather' && zone.id === 'bay_of_bengal') ||
                (activeOverlay === 'congestion' && zone.id === 'paradip_queue') ||
                (activeOverlay === 'sanctions' && zone.id === 'far_east_sanctions');

              if (!isVisible) return null;

              return (
                <g 
                  key={zone.id}
                  onClick={() => handleSelect(zone)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer Warning Ripple */}
                  <circle
                    cx={zone.x}
                    cy={zone.y}
                    r={zone.r}
                    fill={zone.id === 'bay_of_bengal' || zone.id === 'far_east_sanctions' ? 'url(#diagonal-hazard-red)' : 'url(#diagonal-hazard-amber)'}
                    stroke={zone.color}
                    strokeWidth={isSelected ? 3 : 1.8}
                    strokeDasharray={isSelected ? 'none' : '5 4'}
                    opacity={isSelected ? 0.95 : 0.65}
                  >
                    {isSelected && (
                      <animate attributeName="r" values={`${zone.r};${zone.r + 8};${zone.r}`} dur="2.5s" repeatCount="indefinite" />
                    )}
                  </circle>

                  {/* Pulsing Core Radar Beacon */}
                  <circle
                    cx={zone.x}
                    cy={zone.y}
                    r={isSelected ? 10 : 7}
                    fill={zone.color}
                    filter="url(#hazard-glow-neon)"
                  >
                    <animate attributeName="r" values={isSelected ? "9;13;9" : "6;9;6"} dur="1.8s" repeatCount="indefinite" />
                  </circle>

                  {/* Cyclone Spiral Animated Glyph (Bay of Bengal) */}
                  {zone.id === 'bay_of_bengal' && (
                    <g transform={`translate(${zone.x}, ${zone.y})`}>
                      <circle r="22" fill="none" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" strokeDasharray="4 4">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  )}

                  {/* Cyber Tactical Tag Label */}
                  <rect
                    x={zone.x - 62}
                    y={zone.y - zone.r - 24}
                    width="124"
                    height="20"
                    rx="5"
                    fill="#050B14"
                    stroke={zone.color}
                    strokeWidth={isSelected ? 2 : 1}
                    filter="drop-shadow(0 2px 8px rgba(0,0,0,0.8))"
                  />
                  <text
                    x={zone.x}
                    y={zone.y - zone.r - 10}
                    fill={isSelected ? '#FFFFFF' : '#E2E8F0'}
                    fontSize="9"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="Inter"
                    letterSpacing="0.04em"
                  >
                    {zone.id === 'bay_of_bengal' ? '[ALERT] CYCLONE BELT' : zone.id === 'paradip_queue' ? '[QUEUE] BERTH CONGESTION' : zone.id === 'malacca_strait' ? '[TRANSIT] MALACCA CHOKE' : '[SCREEN] OFAC SANCTIONS'}
                  </text>
                </g>
              );
            })}

            {/* Indian East Coast Port Tactical Pins */}
            <g transform="translate(470, 185)">
              <circle r="4.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
              <text x="8" y="3" fill="#0F172A" fontSize="8.5" fontWeight="800" fontFamily="Inter">Paradip</text>
            </g>

            <g transform="translate(458, 205)">
              <circle r="4.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
              <text x="8" y="3" fill="#0F172A" fontSize="8.5" fontWeight="800" fontFamily="Inter">Vizag</text>
            </g>

            <g transform="translate(476, 175)">
              <circle r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x="7" y="3" fill="#334155" fontSize="8" fontWeight="700" fontFamily="Inter">Dhamra</text>
            </g>
          </svg>

          {/* Interactive GIS HUD Status Footer */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '14px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '0.45rem 0.9rem',
            fontSize: '0.75rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            <Radar size={15} color="#38BDF8" />
            <span>Click any pulsating radar threat on the chart to review BIMCO contractual mitigations.</span>
          </div>
        </div>

        {/* Hazard Detail & Contract Mitigation Dossier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#FFFFFF',
            border: `1.5px solid ${active.severity === 'high' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(217, 119, 6, 0.4)'}`,
            borderRadius: '14px',
            padding: '1.35rem',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className={`badge ${active.severity === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                {active.severity.toUpperCase()} ALERT LEVEL
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284C7' }}>
                {active.coordinates}
              </span>
            </div>

            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
              {active.title}
            </h4>

            <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.85rem' }}>
              Geographic Sector: <strong style={{ color: '#0F172A' }}>{active.region}</strong>
            </div>

            <div style={{
              background: active.severity === 'high' ? '#FEF2F2' : '#FFFBEB',
              border: `1px solid ${active.severity === 'high' ? '#FECACA' : '#FDE68A'}`,
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: active.severity === 'high' ? '#DC2626' : '#D97706',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Activity size={16} color={active.severity === 'high' ? '#DC2626' : '#D97706'} />
              <span>Telemetry: {active.stat}</span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.55', marginBottom: '1.15rem' }}>
              {active.impact}
            </p>

            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Mandatory BIMCO Charter Party Clause:
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', lineHeight: '1.45' }}>
                {active.clause}
              </div>
            </div>
          </div>

          {/* Quick Threat Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            {HAZARD_ZONES.map((zone) => {
              const isSelected = active.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelect(zone)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${isSelected ? '#0284C7' : '#CBD5E1'}`,
                    background: isSelected ? '#E0F2FE' : '#FFFFFF',
                    color: isSelected ? '#0369A1' : '#334155',
                    fontWeight: isSelected ? 700 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.2)' : 'none'
                  }}
                >
                  <span style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: zone.severity === 'high' ? '#EF4444' : '#F59E0B',
                    boxShadow: `0 0 8px ${zone.severity === 'high' ? '#EF4444' : '#F59E0B'}`,
                    flexShrink: 0
                  }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {zone.id === 'bay_of_bengal' ? 'Bay of Bengal' : zone.id === 'paradip_queue' ? 'Paradip Queue' : zone.id === 'malacca_strait' ? 'Malacca Strait' : 'Russian OFAC'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
