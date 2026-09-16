// SAIL-NaviBulk — Interactive Maritime Trade Corridors & Fleet Positions Map
import React, { useState } from 'react';
import { Ship, Navigation, Wind, Anchor, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

const TRADE_CORRIDORS = [
  {
    id: 'australia',
    name: 'Australia East Coast Corridor',
    origin: 'Gladstone / Hay Point (AU)',
    dest: 'Paradip / Vizag Port',
    cargo: 'Prime Hard Coking Coal',
    distance: '5,420 NM',
    transitDays: '16.1 Days',
    activeVessels: 18,
    bdiIndex: 'BPI Panamax / BCI Capesize',
    color: '#0A58CA',
    status: 'Optimal Entry Window Active',
    path: 'M 660 300 Q 560 270 475 200',
    originCoord: { x: 660, y: 300 },
    destCoord: { x: 475, y: 200 },
  },
  {
    id: 'mozambique',
    name: 'Mozambique Channel Corridor',
    origin: 'Maputo / Beira (MZ)',
    dest: 'Dhamra / Paradip Port',
    cargo: 'Thermal & Semi-Soft Coal',
    distance: '4,480 NM',
    transitDays: '13.3 Days',
    activeVessels: 9,
    bdiIndex: 'BSI Supramax',
    color: '#D97706',
    status: 'Bunker Optimization Zone',
    path: 'M 330 290 Q 400 240 465 210',
    originCoord: { x: 330, y: 290 },
    destCoord: { x: 465, y: 210 },
  },
  {
    id: 'russia',
    name: 'Russian Far East Corridor',
    origin: 'Vostochny (RU)',
    dest: 'Paradip Port Authority',
    cargo: 'PCI & Metallurgical Coal',
    distance: '4,850 NM',
    transitDays: '14.4 Days',
    activeVessels: 6,
    bdiIndex: 'BPI Panamax',
    color: '#DC2626',
    status: 'OFAC & Sanctions Screened',
    path: 'M 680 120 Q 580 160 480 185',
    originCoord: { x: 680, y: 120 },
    destCoord: { x: 480, y: 185 },
  },
  {
    id: 'indonesia',
    name: 'Indonesia Archipelago Corridor',
    origin: 'Taboneo / Kalimantan (ID)',
    dest: 'Haldia / Dhamra Port',
    cargo: 'Thermal Coal (Steam Coal)',
    distance: '2,150 NM',
    transitDays: '6.4 Days',
    activeVessels: 24,
    bdiIndex: 'BSI Supramax',
    color: '#059669',
    status: 'High Volume Rapid Turnaround',
    path: 'M 570 245 Q 520 220 482 175',
    originCoord: { x: 570, y: 245 },
    destCoord: { x: 482, y: 175 },
  },
];

const DISCHARGE_PORTS = [
  { id: 'paradip', name: 'Paradip', x: 472, y: 188, draft: '14.5m', berths: 'Coal Berth 1 & 2' },
  { id: 'vizag', name: 'Visakhapatnam', x: 456, y: 212, draft: '18.1m', berths: 'Outer Harbor VGCB' },
  { id: 'dhamra', name: 'Dhamra', x: 478, y: 176, draft: '18.0m', berths: 'Deep Draft Capesize' },
  { id: 'haldia', name: 'Haldia', x: 486, y: 168, draft: '8.5m', berths: 'Transshipment Required' },
];

export default function InteractiveFleetMap({ onSelectCorridor }) {
  const [selectedId, setSelectedId] = useState('australia');
  const activeCorridor = TRADE_CORRIDORS.find(c => c.id === selectedId) || TRADE_CORRIDORS[0];

  const handleSelect = (id) => {
    setSelectedId(id);
    if (onSelectCorridor) onSelectCorridor(id);
  };

  return (
    <div 
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #BAE6FD',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(2, 132, 199, 0.07)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Interactive Map Header */}
      <div 
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #BAE6FD',
          background: '#F0F8FF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div 
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#059669',
              boxShadow: '0 0 8px rgba(5, 150, 105, 0.6)',
            }}
          />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>
            Live Maritime Supply Corridors & Fleet Positions
          </h3>
          <span 
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              background: '#E0F2FE',
              color: '#0284C7',
              border: '1px solid #BAE6FD',
              fontFamily: 'var(--font-mono)',
            }}
          >
            AIS SIMULATED
          </span>
        </div>

        {/* Corridor Quick Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {TRADE_CORRIDORS.map(corridor => {
            const isSel = corridor.id === selectedId;
            return (
              <button
                key={corridor.id}
                onClick={() => handleSelect(corridor.id)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: isSel ? `1.5px solid ${corridor.color}` : '1px solid #CBD5E1',
                  background: isSel ? '#E0F2FE' : '#FFFFFF',
                  color: isSel ? corridor.color : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {corridor.id === 'australia' ? '[AU] Australia' : corridor.id === 'mozambique' ? '[MZ] Mozambique' : corridor.id === 'russia' ? '[RU] Russia' : '[ID] Indonesia'}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Sea Chart Canvas */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '310px',
          background: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #94A3B8',
        }}
      >
        {/* Nautical Chart Grid Lines */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(2, 132, 199, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(2, 132, 199, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
            pointerEvents: 'none',
          }}
        />

        <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
          <defs>
            <filter id="corridor-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Depth contours */}
          <ellipse cx="475" cy="210" rx="160" ry="100" fill="none" stroke="rgba(2, 132, 199, 0.2)" strokeWidth="1" strokeDasharray="3 4" />
          <ellipse cx="475" cy="210" rx="240" ry="150" fill="none" stroke="rgba(2, 132, 199, 0.1)" strokeWidth="1" />

          {/* Landmasses - Crisp Daylight Coastal Style */}
          {/* India Subcontinent */}
          <path
            d="M 425,120 L 490,145 L 485,208 L 460,258 L 438,245 L 410,185 Z"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
          <text x="432" y="160" fill="#0F172A" fontSize="11" fontWeight="800" fontFamily="Inter" letterSpacing="0.05em">INDIA</text>
          <text x="432" y="172" fill="#0284C7" fontSize="7.5" fontWeight="700" fontFamily="JetBrains Mono">EAST COAST</text>

          {/* Southeast Asia */}
          <path
            d="M 535,175 L 590,205 L 615,240 L 565,285 L 525,240 Z"
            fill="#F1F5F9"
            stroke="#64748B"
            strokeWidth="1.2"
          />
          <text x="548" y="222" fill="#334155" fontSize="9" fontWeight="700" fontFamily="Inter">SE ASIA</text>

          {/* Australia */}
          <path
            d="M 630,265 L 725,275 L 745,360 L 670,370 L 620,325 Z"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          <text x="655" y="325" fill="#0F172A" fontSize="11" fontWeight="800" fontFamily="Inter">AUSTRALIA</text>
          <text x="655" y="338" fill="#64748B" fontSize="7.5" fontWeight="600" fontFamily="Inter">Gladstone / Hay Pt</text>

          {/* Africa */}
          <path
            d="M 280,215 L 330,255 L 340,340 L 290,370 Z"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          <text x="295" y="295" fill="#0F172A" fontSize="10" fontWeight="700" fontFamily="Inter">AFRICA</text>
          <text x="292" y="307" fill="#64748B" fontSize="7.5" fontWeight="600" fontFamily="Inter">Maputo / Beira</text>

          {/* Russia Far East */}
          <path
            d="M 660,65 L 735,70 L 725,130 L 670,120 Z"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          <text x="672" y="96" fill="#0F172A" fontSize="9.5" fontWeight="700" fontFamily="Inter">RUSSIA FE</text>

          {/* Corridors Paths */}
          {TRADE_CORRIDORS.map(corridor => {
            const isSel = corridor.id === selectedId;
            return (
              <g key={corridor.id} onClick={() => handleSelect(corridor.id)} style={{ cursor: 'pointer' }}>
                <path
                  d={corridor.path}
                  fill="none"
                  stroke={corridor.color}
                  strokeWidth={isSel ? 3.5 : 1.8}
                  strokeDasharray={isSel ? '8 4' : '4 4'}
                  opacity={isSel ? 1 : 0.45}
                  filter={isSel ? 'url(#corridor-glow)' : 'none'}
                >
                  {isSel && (
                    <animate attributeName="stroke-dashoffset" from="40" to="0" dur="2s" repeatCount="indefinite" />
                  )}
                </path>

                {/* Origin Pin */}
                <circle
                  cx={corridor.originCoord.x}
                  cy={corridor.originCoord.y}
                  r={isSel ? 7 : 5}
                  fill={corridor.color}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />

                {/* Animated Moving Vessel along active corridor */}
                {isSel && (
                  <circle r="4.5" fill="#FFFFFF" stroke={corridor.color} strokeWidth="2.5">
                    <animateMotion
                      path={corridor.path}
                      dur="6s"
                      repeatCount="indefinite"
                      rotate="auto"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* East Coast Discharge Ports Pins */}
          {DISCHARGE_PORTS.map(port => (
            <g key={port.id} transform={`translate(${port.x}, ${port.y})`}>
              <circle r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
              <text x="8" y="3" fill="#F8FAFC" fontSize="8.5" fontWeight="800" fontFamily="Inter">
                {port.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Active Corridor Telemetry Pill */}
        <div 
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Ship size={16} color={activeCorridor.color} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-hero)' }}>
                {activeCorridor.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {activeCorridor.origin} → {activeCorridor.dest}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Distance</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-hero)' }}>
                {activeCorridor.distance} (~{activeCorridor.transitDays})
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Active Fleet</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 800, color: activeCorridor.color }}>
                {activeCorridor.activeVessels} Vessels en route
              </div>
            </div>

            <span 
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              {activeCorridor.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
