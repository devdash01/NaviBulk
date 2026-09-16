// SAIL NaviBulk — Full-Screen Dynamic Maritime Ocean Chart & Vessel Simulator
import React, { useState, useEffect } from 'react';
import { Ship, Navigation, Wind, Compass, MapPin, CheckCircle2, AlertTriangle, Radio, Play, Pause, RotateCcw } from 'lucide-react';
import { NAUTICAL_DISTANCE_MATRIX } from '../data/freightData';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS, VESSEL_CLASSES } from '../data/portConstraints';

// Coords on 1000x520 oceanic map
const NODES = {
  Australia: { x: 840, y: 390, name: 'Gladstone / Hay Pt', country: 'Australia', flagCode: 'AU', region: 'Oceania' },
  US: { x: 120, y: 190, name: 'Norfolk (Hampton Roads)', country: 'USA', flagCode: 'US', region: 'Atlantic' },
  Mozambique: { x: 420, y: 380, name: 'Maputo / Beira', country: 'Mozambique', flagCode: 'MZ', region: 'Africa' },
  Indonesia: { x: 720, y: 310, name: 'Taboneo Anchorage', country: 'Indonesia', flagCode: 'ID', region: 'SE Asia' },
  Russia: { x: 860, y: 130, name: 'Vostochny Terminal', country: 'Russia', flagCode: 'RU', region: 'Far East' },
  paradip: { x: 595, y: 232, name: 'Paradip Port', state: 'Odisha', draft: 14.5 },
  vizag: { x: 578, y: 260, name: 'Visakhapatnam (VPT)', state: 'Andhra Pradesh', draft: 18.1 },
  gangavaram: { x: 574, y: 266, name: 'Gangavaram Port', state: 'Andhra Pradesh', draft: 19.5 },
  dhamra: { x: 602, y: 224, name: 'Dhamra Port', state: 'Odisha', draft: 18.0 },
  gopalpur: { x: 585, y: 248, name: 'Gopalpur Port', state: 'Odisha', draft: 12.5 },
  haldia: { x: 610, y: 212, name: 'Haldia Dock', state: 'West Bengal', draft: 8.5 },
};

// Chokepoints and hazard waypoints
const HAZARD_ZONES = [
  { id: 'bay_of_bengal', name: 'Bay of Bengal Tropical Belt', x: 600, y: 240, r: 42, color: '#EF4444', desc: 'Swell 3.5m - Cyclone Early Warning' },
  { id: 'malacca_strait', name: 'Malacca Strait Chokepoint', x: 700, y: 295, r: 28, color: '#F59E0B', desc: 'UKC Draft Watch - High Vessel Traffic' },
  { id: 'mozambique_channel', name: 'Mozambique Channel Current', x: 430, y: 370, r: 35, color: '#0284C7', desc: 'Agulhas Current 3.2 kts speed assist' },
];

export default function FullScreenMissionMap({
  inputs,
  onSelectOrigin,
  onSelectDestination,
  currentChapter = 1,
  activeHazardId = null,
  onSelectHazard = () => {},
}) {
  const originKey = inputs.originCountry || 'Australia';
  const destKey = inputs.destinationPortKey || 'paradip';
  const origin = NODES[originKey] || NODES.Australia;
  const dest = NODES[destKey] || NODES.paradip;

  const distNm = NAUTICAL_DISTANCE_MATRIX[originKey]?.[destKey] || 5420;
  const vesselClass = inputs.vesselClass || 'panamax';
  const vesselInfo = VESSEL_CLASSES[vesselClass] || VESSEL_CLASSES.panamax;

  // Sailing animation state
  const [sailingProgress, setSailingProgress] = useState(0.42); // 0.0 to 1.0 along the route
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSailingProgress((prev) => {
        if (prev >= 0.98) return 0.05;
        return prev + 0.0035;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Quadratic Bezier Route Curvature
  const midX = (origin.x + dest.x) / 2;
  const midY = (origin.y + dest.y) / 2 + (origin.x > dest.x ? 45 : -35);
  const routePathD = `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`;

  // Interpolate vessel coordinates on quadratic bezier curve
  const t = sailingProgress;
  const shipX = (1 - t) * (1 - t) * origin.x + 2 * (1 - t) * t * midX + t * t * dest.x;
  const shipY = (1 - t) * (1 - t) * origin.y + 2 * (1 - t) * t * midY + t * t * dest.y;

  // Heading tangent angle
  const dx = 2 * (1 - t) * (midX - origin.x) + 2 * t * (dest.x - midX);
  const dy = 2 * (1 - t) * (midY - origin.y) + 2 * t * (dest.y - midY);
  const headingDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  const currentNm = Math.round(distNm * t);
  const remainingNm = distNm - currentNm;
  const speedKnots = 13.5;
  const daysRemaining = (remainingNm / (speedKnots * 24)).toFixed(1);

  return (
    <div 
      className="fullscreen-mission-map"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '720px',
        background: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 50%, #B0C4DE 100%)',
        overflow: 'hidden',
        borderRadius: '16px',
        border: '1px solid #94A3B8',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* ── Daylight Maritime Chart Top Bar Telemetry ── */}
      <div 
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          padding: '0.65rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: '#0284C7', 
              color: '#FFFFFF', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
            }}
          >
            <Ship size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
              LIVE SEA TRACK: {origin.country.toUpperCase()} → {dest.name.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              {inputs.cargoType} • {inputs.tonnage.toLocaleString()} MT • Class: {vesselInfo.name} ({vesselInfo.typicalDraftM}m Draft)
            </div>
          </div>
        </div>

        {/* Live Voyage Tracker Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Voyage Distance</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284C7', fontFamily: 'var(--font-mono)' }}>
              {currentNm.toLocaleString()} / {distNm.toLocaleString()} NM
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: '#CBD5E1' }} />

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>ETA East Coast</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
              {daysRemaining} Days
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: '#CBD5E1' }} />

          {/* Play/Pause Animation Controller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={() => setSailingProgress(0.05)}
              title="Restart Route"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Full SVG Ocean Chart Canvas ── */}
      <svg
        viewBox="0 0 1000 520"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}
      >
        <defs>
          {/* Subtle water grid pattern */}
          <pattern id="chart-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" />
          </pattern>

          {/* Sea Lane Route Gradient */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Ship Radar Ping Glow */}
          <radialGradient id="radarPing">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#0284C7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ocean Background & Coordinate Lines */}
        <rect width="1000" height="520" fill="url(#chart-grid)" />

        {/* Latitude and Longitude Graticules */}
        <line x1="0" y1="130" x2="1000" y2="130" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="0" y1="260" x2="1000" y2="260" stroke="rgba(2, 132, 199, 0.3)" strokeWidth="1.2" strokeDasharray="6 4" />
        <line x1="0" y1="390" x2="1000" y2="390" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" strokeDasharray="3 4" />

        <line x1="250" y1="0" x2="250" y2="520" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="500" y1="0" x2="500" y2="520" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="750" y1="0" x2="750" y2="520" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" strokeDasharray="3 4" />

        <text x="12" y="254" fill="#64748B" fontSize="9" fontFamily="var(--font-mono)">EQUATOR 00°00'N</text>
        <text x="12" y="124" fill="#64748B" fontSize="9" fontFamily="var(--font-mono)">TROPIC OF CANCER 23°26'N</text>
        <text x="12" y="384" fill="#64748B" fontSize="9" fontFamily="var(--font-mono)">TROPIC OF CAPRICORN 23°26'S</text>

        {/* ── LANDMASSES: Crisp Daylight Marine Sand/Coast Style ── */}
        {/* Continental Coastlines Fill: #E2E8F0 with crisp #94A3B8 borders */}

        {/* 1. Indian Subcontinent & Bay of Bengal */}
        <g id="land-india">
          <path
            d="M 530,130 L 610,165 L 605,225 L 575,285 L 545,270 L 515,195 Z"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.08))' }}
          />
          <text x="545" y="195" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="var(--font-sans)">INDIA</text>
          <text x="545" y="210" fill="#0284C7" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)">EAST COAST PORTS</text>
        </g>

        {/* 2. Southeast Asia & Indonesian Archipelago */}
        <g id="land-seasia">
          <path
            d="M 660,195 L 725,235 L 755,275 L 700,325 L 650,270 Z"
            fill="#F1F5F9"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          <text x="675" y="250" fill="#334155" fontSize="10" fontWeight="700" fontFamily="var(--font-sans)">SE ASIA</text>
        </g>

        {/* 3. Australia */}
        <g id="land-australia">
          <path
            d="M 780,310 L 895,325 L 920,430 L 830,440 L 770,380 Z"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.08))' }}
          />
          <text x="815" y="380" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="var(--font-sans)">AUSTRALIA</text>
          <text x="815" y="396" fill="#64748B" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">Gladstone / Hay Point</text>
        </g>

        {/* 4. Africa East Coast & Mozambique Channel */}
        <g id="land-africa">
          <path
            d="M 360,250 L 420,295 L 430,400 L 370,435 Z"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.08))' }}
          />
          <text x="375" y="345" fill="#0F172A" fontSize="12" fontWeight="800" fontFamily="var(--font-sans)">AFRICA</text>
          <text x="372" y="360" fill="#64748B" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">Mozambique Channel</text>
        </g>

        {/* 5. Russia Far East */}
        <g id="land-russia">
          <path
            d="M 815,70 L 910,75 L 895,150 L 830,135 Z"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.08))' }}
          />
          <text x="835" y="110" fill="#0F172A" fontSize="11" fontWeight="800" fontFamily="var(--font-sans)">RUSSIA FAR EAST</text>
          <text x="835" y="124" fill="#64748B" fontSize="8.5" fontWeight="600" fontFamily="var(--font-mono)">Vostochny Coal Port</text>
        </g>

        {/* 6. US East Coast */}
        <g id="land-usa">
          <path
            d="M 60,110 L 160,115 L 145,240 L 70,230 Z"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.08))' }}
          />
          <text x="80" y="170" fill="#0F172A" fontSize="11" fontWeight="800" fontFamily="var(--font-sans)">US ATLANTIC</text>
          <text x="80" y="184" fill="#64748B" fontSize="8.5" fontWeight="600" fontFamily="var(--font-mono)">Norfolk / Hampton</text>
        </g>

        {/* ── HAZARD ZONES (Subtle transparent discs with warnings) ── */}
        {HAZARD_ZONES.map((zone) => {
          const isSelected = activeHazardId === zone.id;
          return (
            <g 
              key={zone.id} 
              onClick={() => onSelectHazard(zone.id)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={zone.x}
                cy={zone.y}
                r={zone.r}
                fill={zone.color}
                fillOpacity={isSelected ? '0.22' : '0.10'}
                stroke={zone.color}
                strokeWidth={isSelected ? '2' : '1.2'}
                strokeDasharray="4 4"
              />
              <circle
                cx={zone.x}
                cy={zone.y}
                r="4"
                fill={zone.color}
              />
              <text
                x={zone.x + 8}
                y={zone.y + 3}
                fill="#0F172A"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="var(--font-sans)"
              >
                {zone.name}
              </text>
            </g>
          );
        })}

        {/* ── ACTIVE TRADE LANE ROUTE ARC ── */}
        {/* Underlay glow path */}
        <path
          d={routePathD}
          fill="none"
          stroke="#0284C7"
          strokeWidth="6"
          strokeOpacity="0.2"
        />

        {/* Main dashed voyage route path */}
        <path
          d={routePathD}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="3"
          strokeDasharray="8 6"
        />

        {/* ── INTERACTIVE ORIGIN NODES ── */}
        {Object.entries(NODES)
          .filter(([key]) => ['Australia', 'US', 'Mozambique', 'Indonesia', 'Russia'].includes(key))
          .map(([key, node]) => {
            const isSelected = originKey === key;
            return (
              <g
                key={key}
                onClick={() => onSelectOrigin(key)}
                style={{ cursor: 'pointer' }}
              >
                {/* Node beacon */}
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r="18" fill="#0284C7" fillOpacity="0.2">
                    <animate attributeName="r" values="12;24;12" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="fillOpacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? '7' : '5'}
                  fill={isSelected ? '#0284C7' : '#FFFFFF'}
                  stroke={isSelected ? '#0369A1' : '#64748B'}
                  strokeWidth={isSelected ? '3' : '2'}
                />

                {/* Country and Flag Pill */}
                <rect
                  x={node.x - 45}
                  y={node.y + 10}
                  width="90"
                  height="22"
                  rx="6"
                  fill={isSelected ? '#0B2545' : '#FFFFFF'}
                  stroke={isSelected ? '#0284C7' : '#CBD5E1'}
                  strokeWidth="1.2"
                />
                <text
                  x={node.x}
                  y={node.y + 24}
                  textAnchor="middle"
                  fill={isSelected ? '#FFFFFF' : '#0F172A'}
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                >
                  [{node.flagCode}] {node.country}
                </text>
              </g>
            );
          })}

        {/* ── DESTINATION DISCHARGE PORTS (INDIA EAST COAST) ── */}
        {Object.entries(NODES)
          .filter(([key]) => ['paradip', 'vizag', 'gangavaram', 'dhamra', 'haldia'].includes(key))
          .map(([key, node]) => {
            const isSelected = destKey === key;
            return (
              <g
                key={key}
                onClick={() => onSelectDestination(key)}
                style={{ cursor: 'pointer' }}
              >
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r="16" fill="#059669" fillOpacity="0.25">
                    <animate attributeName="r" values="10;20;10" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? '6' : '4'}
                  fill={isSelected ? '#059669' : '#FFFFFF'}
                  stroke={isSelected ? '#047857' : '#475569'}
                  strokeWidth="2"
                />

                {/* Port label */}
                <text
                  x={node.x + 8}
                  y={node.y + 3}
                  fill={isSelected ? '#0F172A' : '#475569'}
                  fontSize={isSelected ? '10' : '8'}
                  fontWeight={isSelected ? '800' : '600'}
                  fontFamily="var(--font-sans)"
                >
                  {node.name} ({node.draft}m)
                </text>
              </g>
            );
          })}

        {/* ── LIVE SAILING SHIP ICON & POSITION VECTOR ── */}
        <g transform={`translate(${shipX}, ${shipY}) rotate(${headingDeg})`}>
          {/* Radar scan ring */}
          <circle cx="0" cy="0" r="22" fill="url(#radarPing)" />

          {/* Ship hull body */}
          <path
            d="M -14,-7 L 10,-7 L 18,0 L 10,7 L -14,7 Z"
            fill="#0F172A"
            stroke="#0284C7"
            strokeWidth="2"
          />
          {/* Deckhouse */}
          <rect x="-10" y="-4" width="8" height="8" rx="2" fill="#FFFFFF" />
          {/* Forward direction line */}
          <line x1="18" y1="0" x2="32" y2="0" stroke="#059669" strokeWidth="2" strokeDasharray="2 2" />
        </g>

        {/* Live vessel label hovering next to ship */}
        <g transform={`translate(${shipX + 18}, ${shipY - 18})`}>
          <rect
            x="0"
            y="-16"
            width="135"
            height="32"
            rx="6"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(15, 23, 42, 0.12))' }}
          />
          <text x="8" y="-3" fill="#0F172A" fontSize="9" fontWeight="800" fontFamily="var(--font-sans)">
            M/V STEEL HARMONY
          </text>
          <text x="8" y="9" fill="#0284C7" fontSize="7.5" fontWeight="700" fontFamily="var(--font-mono)">
            {speedKnots} KTS • COG {Math.round((headingDeg + 360) % 360)}° • {(sailingProgress * 100).toFixed(0)}% SAILED
          </text>
        </g>
      </svg>

      {/* ── Bottom Ocean Chart Quick Corridor Switcher ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'Australia', label: 'AU Corridor', dist: '5,420 NM', days: '16d' },
            { key: 'Mozambique', label: 'MZ Channel', dist: '3,800 NM', days: '11d' },
            { key: 'Russia', label: 'RU Far East', dist: '4,600 NM', days: '14d' },
            { key: 'Indonesia', label: 'ID Archipelago', dist: '2,200 NM', days: '7d' },
            { key: 'US', label: 'US East Coast', dist: '8,400 NM', days: '25d' },
          ].map((corridor) => {
            const isSelected = originKey === corridor.key;
            return (
              <button
                key={corridor.key}
                onClick={() => onSelectOrigin(corridor.key)}
                style={{
                  background: isSelected ? '#0B2545' : 'rgba(255, 255, 255, 0.92)',
                  color: isSelected ? '#FFFFFF' : '#0F172A',
                  border: isSelected ? '1.5px solid #0284C7' : '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{corridor.label}</span>
                <span style={{ color: isSelected ? '#38BDF8' : '#64748B', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {corridor.dist}
                </span>
              </button>
            );
          })}
        </div>

        {/* Direct Destination Switcher */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            padding: '0.35rem 0.75rem',
            border: '1px solid #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>DISCHARGE PORT:</span>
          <select
            value={destKey}
            onChange={(e) => onSelectDestination(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.78rem',
              color: '#0F172A',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="paradip">Paradip Port Authority (14.5m)</option>
            <option value="vizag">Visakhapatnam VPT (18.1m)</option>
            <option value="gangavaram">Gangavaram Port (19.5m)</option>
            <option value="dhamra">Dhamra Bulk Terminal (18.0m)</option>
            <option value="haldia">Haldia Dock Complex (8.5m)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
