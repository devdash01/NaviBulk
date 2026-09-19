// SAIL NaviBulk — Interactive Corridor Risk & Maritime Hazard Visual Studio
// High-impact graphical visualizations replacing text with real nautical charts,
// Bay of Bengal cyclone radar maps, cargo hold cutaways, and BIMCO contractual simulators.

import React, { useState } from 'react';
import { 
  Wind, 
  Compass, 
  Box, 
  Scale, 
  Anchor, 
  Radio, 
  ShieldCheck, 
  CheckCircle2, 
  Waves, 
  Flame, 
  Lock, 
  Zap, 
  Eye, 
  Layers, 
  Activity,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  Navigation
} from 'lucide-react';

export default function CorridorRiskVisualStudio({
  originCountry = 'Australia',
  destinationPortKey = 'paradip',
  routeRisks,
  recommendedVessel,
  inputs = {}
}) {
  // Active Visual Studio Mode
  const [activeStudioTab, setActiveStudioTab] = useState('weather_radar'); // 'weather_radar' | 'malacca_tss' | 'cargo_hold' | 'contract_sim' | 'paradip_harbor'

  // Interactive Layer Toggles for Weather Radar
  const [showSwellHeatmap, setShowSwellHeatmap] = useState(true);
  const [showStormCone, setShowStormCone] = useState(true);
  const [showEvacZone, setShowEvacZone] = useState(true);
  const [showWindVectors, setShowWindVectors] = useState(true);

  // Speed Simulation for BIMCO Virtual Arrival
  const [simulatedSpeed, setSimulatedSpeed] = useState(11.5); // 11.5 kn eco to 14.0 kn full

  // Derived calculation for BIMCO Speed Simulator
  const baseSpeed = 14.0;
  const baseBurnTpd = 32.0;
  const currentBurnTpd = Number((baseBurnTpd * Math.pow(simulatedSpeed / baseSpeed, 3)).toFixed(1));
  const seaDays = Number((4850 / (simulatedSpeed * 24)).toFixed(1));
  const totalBurnMT = Math.round(seaDays * currentBurnTpd);
  const baseTotalBurnMT = 460;
  const fuelSavingsMT = Math.max(0, baseTotalBurnMT - totalBurnMT);
  const fuelSavingsUSD = fuelSavingsMT * 620; // $620/MT VLSFO

  return (
    <div 
      className="corridor-visual-studio"
      style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
        marginBottom: '1.75rem'
      }}
    >
      {/* ── STUDIO CONTROL CONSOLE HEADER ── */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0B1528 0%, #111C30 100%)',
          padding: '1.1rem 1.4rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
            <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              TRANSOCEAN INTERACTIVE RISK VISUALIZATION COCKPIT
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0 0.1rem', letterSpacing: '-0.01em' }}>
            Multi-Domain Spatial & Contractual Risk Simulation
          </h3>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Live graphical models for weather radar, chokepoint bathymetry, cargo hold chemistry, and BIMCO laytime speed curves.
          </div>
        </div>

        {/* Visualizer Mode Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.25rem', gap: '0.25rem', flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.12)' }}>
          {[
            { id: 'weather_radar', label: 'Cyclone & Swell Radar Map', icon: Wind, tag: 'Bay of Bengal' },
            { id: 'malacca_tss', label: 'Malacca Strait Bathymetry', icon: Compass, tag: '19.8m UKC' },
            { id: 'cargo_hold', label: 'Cargo Hold #3 Chemistry', icon: Box, tag: 'TML & Gas' },
            { id: 'contract_sim', label: 'BIMCO Speed Simulator', icon: Scale, tag: 'Save $21.7k' },
            { id: 'paradip_harbor', label: 'Paradip Harbor & Berth Profile', icon: Anchor, tag: '14.5m HW' },
          ].map(tab => {
            const isActive = activeStudioTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStudioTab(tab.id)}
                style={{
                  background: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <tab.icon size={13} />
                <span>{tab.label}</span>
                <span style={{ fontSize: '0.58rem', background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── VISUALIZER STAGE CANVAS ── */}
      <div style={{ position: 'relative', background: '#091322', minHeight: '440px' }}>

        {/* ═══════════════════════════════════════════════════════════════
            VISUALIZER 1: BAY OF BENGAL CYCLONE & SWELL RADAR MAP
        ═══════════════════════════════════════════════════════════════ */}
        {activeStudioTab === 'weather_radar' && (
          <div style={{ padding: '1.25rem' }}>
            {/* Top Interactive Controls & Live Telemetry Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Radio size={14} color="#38BDF8" />
                  <span>IMD Doppler Satellite Radar • Bay of Bengal Cyclone Track (19.8°N, 86.7°E)</span>
                </span>
              </div>

              {/* Layer Toggles */}
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowSwellHeatmap(!showSwellHeatmap)}
                  style={{
                    background: showSwellHeatmap ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: showSwellHeatmap ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.1)',
                    color: showSwellHeatmap ? '#38BDF8' : '#94A3B8',
                    borderRadius: '6px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {showSwellHeatmap ? '✓ Swell Heatmap' : '+ Swell Heatmap'}
                </button>
                <button
                  onClick={() => setShowStormCone(!showStormCone)}
                  style={{
                    background: showStormCone ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: showStormCone ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
                    color: showStormCone ? '#F59E0B' : '#94A3B8',
                    borderRadius: '6px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {showStormCone ? '✓ Storm Track Cone' : '+ Storm Track Cone'}
                </button>
                <button
                  onClick={() => setShowEvacZone(!showEvacZone)}
                  style={{
                    background: showEvacZone ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: showEvacZone ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                    color: showEvacZone ? '#FCA5A5' : '#94A3B8',
                    borderRadius: '6px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {showEvacZone ? '✓ Signal 8/10 Zone (25 NM)' : '+ Evacuation Radius'}
                </button>
              </div>
            </div>

            {/* SVG Nautical Radar Canvas */}
            <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'radial-gradient(ellipse at 60% 45%, #0F2A4A 0%, #081526 100%)' }}>
              <svg viewBox="0 0 900 360" style={{ width: '100%', height: '100%' }}>
                <defs>
                  {/* Grid Pattern */}
                  <pattern id="radarGrid" width="45" height="45" patternUnits="userSpaceOnUse">
                    <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.8" />
                  </pattern>

                  {/* Swell Heatmap Gradients */}
                  <radialGradient id="cycloneHeat" cx="55%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.75" />
                    <stop offset="35%" stopColor="#F97316" stopOpacity="0.55" />
                    <stop offset="65%" stopColor="#EAB308" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </radialGradient>

                  <linearGradient id="safeRouteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>

                {/* Radar Grid Layer */}
                <rect width="900" height="360" fill="url(#radarGrid)" />

                {/* Range Rings from Paradip Port (x: 240, y: 95) */}
                <circle cx="240" cy="95" r="70" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="3 3" />
                <circle cx="240" cy="95" r="140" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="4 4" />
                <circle cx="240" cy="95" r="220" fill="none" stroke="rgba(56, 189, 248, 0.1)" />

                {/* Coastline Silhouette (Odisha, Andhra Pradesh, West Bengal) */}
                <path 
                  d="M 60 20 Q 140 40, 200 70 T 240 95 T 310 80 T 380 60 L 380 0 L 0 0 L 0 360 L 90 360 Q 120 280, 150 200 T 240 95" 
                  fill="#132338" 
                  stroke="#334E68" 
                  strokeWidth="1.5" 
                />

                {/* Andaman & Nicobar Ridge (Right lower) */}
                <path 
                  d="M 680 180 Q 690 230, 710 290 Q 725 340, 735 360" 
                  fill="none" 
                  stroke="#243B53" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                />
                <text x="725" y="240" fill="#627D98" fontSize="9" fontWeight="700">ANDAMAN ISLANDS</text>
                <text x="740" y="345" fill="#627D98" fontSize="9" fontWeight="700">SIX DEGREE CHANNEL</text>

                {/* Swell Heatmap Contours (Centered on Cyclone at x: 500, y: 190) */}
                {showSwellHeatmap && (
                  <g>
                    <circle cx="500" cy="190" r="170" fill="url(#cycloneHeat)" />
                    {/* Swell Contour labels */}
                    <circle cx="500" cy="190" r="60" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="460" y="150" fill="#FCA5A5" fontSize="9" fontWeight="800">Hs &gt; 4.2m (Extreme)</text>

                    <circle cx="500" cy="190" r="110" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="430" y="105" fill="#FCD34D" fontSize="9" fontWeight="700">Hs 2.8m - 3.8m (Lightering Halted)</text>

                    <circle cx="500" cy="190" r="170" fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="400" y="55" fill="#6EE7B7" fontSize="9" fontWeight="700">Hs 1.8m - 2.2m (Moderate Sea State)</text>
                  </g>
                )}

                {/* Projected Cyclone Track Cone of Uncertainty */}
                {showStormCone && (
                  <g>
                    {/* Cone wedge */}
                    <path 
                      d="M 500 190 L 220 50 L 270 140 Z" 
                      fill="rgba(245, 158, 11, 0.12)" 
                      stroke="rgba(245, 158, 11, 0.4)" 
                      strokeDasharray="4 4" 
                    />
                    {/* Storm Central Track vector */}
                    <line x1="500" y1="190" x2="245" y2="95" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="5 3" />
                    {/* Landfall Forecast Node */}
                    <circle cx="245" cy="95" r="5" fill="#EF4444" />
                    <text x="255" y="85" fill="#FCA5A5" fontSize="9" fontWeight="800">LANDFALL FORECAST (+42h)</text>
                  </g>
                )}

                {/* Swirling Cyclonic Storm Center (x: 500, y: 190) */}
                <g transform="translate(500, 190)">
                  <circle cx="0" cy="0" r="14" fill="#EF4444" opacity="0.8" />
                  <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
                  {/* Rotating Spiral Arms */}
                  <path d="M 0 -22 C 15 -18, 25 0, 20 18 C 15 32, -10 30, -22 15 C -30 0, -18 -22, 0 -22" fill="none" stroke="#FCA5A5" strokeWidth="2" opacity="0.9" />
                  <path d="M 0 -38 C 28 -30, 42 0, 32 30 C 22 55, -20 48, -38 24 C -50 0, -28 -38, 0 -38" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.75" />
                  <text x="24" y="-18" fill="#F8FAFC" fontSize="10" fontWeight="900">CYCLONIC DEPRESSION</text>
                  <text x="24" y="-6" fill="#FBBF24" fontSize="8" fontWeight="700">992 hPa • 42 kn Winds</text>
                </g>

                {/* Paradip Port Authority Danger Radius (Signal 8/10 Rule: 25 NM) */}
                {showEvacZone && (
                  <g>
                    <circle cx="240" cy="95" r="42" fill="rgba(239, 68, 68, 0.15)" stroke="#EF4444" strokeWidth="1.8" />
                    <text x="200" y="145" fill="#EF4444" fontSize="8" fontWeight="800">25 NM MANDATORY DRIFT ZONE (SIGNAL 8/10)</text>
                  </g>
                )}

                {/* Paradip Port Location Marker */}
                <g transform="translate(240, 95)">
                  <circle cx="0" cy="0" r="7" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="0" cy="0" r="12" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.8" />
                  <text x="14" y="4" fill="#FFFFFF" fontSize="11" fontWeight="900">PARADIP PORT (CB-1/2)</text>
                  <text x="14" y="15" fill="#38BDF8" fontSize="8" fontWeight="700">Discharge Berth • 14.5m HW Draft</text>
                </g>

                {/* Other Indian Ports */}
                <circle cx="160" cy="180" r="4" fill="#64748B" />
                <text x="170" y="184" fill="#94A3B8" fontSize="8" fontWeight="700">Visakhapatnam (18.1m)</text>
                <circle cx="270" cy="65" r="4" fill="#64748B" />
                <text x="280" y="69" fill="#94A3B8" fontSize="8" fontWeight="700">Dhamra (18.0m)</text>

                {/* NaviBulk Weather-Routing Transit Track (South of storm) */}
                <path 
                  d="M 740 340 C 650 310, 520 290, 410 240 S 310 160, 240 95" 
                  fill="none" 
                  stroke="url(#safeRouteGrad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />

                {/* Vessel Icon Position on Safe Track (Skirting Swell) */}
                <g transform="translate(460, 265)">
                  <circle cx="0" cy="0" r="12" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                  <polygon points="-5,-4 6,0 -5,4" fill="#FFFFFF" />
                  <text x="16" y="-2" fill="#10B981" fontSize="9" fontWeight="900">M/V NAVIBULK PANAMAX</text>
                  <text x="16" y="9" fill="#E2E8F0" fontSize="8" fontWeight="700">Speed: 11.5 kn Eco • Safe Weather Track</text>
                </g>
              </svg>

              {/* Map Float Legend / HUD */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  background: 'rgba(11, 21, 40, 0.88)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.68rem',
                  color: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.58rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Active Sea State</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#F59E0B' }}>Hs 3.2m Rough Swell</div>
                </div>
                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontSize: '0.58rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Contractual Shield</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#10B981' }}>BIMCO Storm Rider (0 Demurrage)</div>
                </div>
                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontSize: '0.58rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Evacuation Protocol</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#EF4444' }}>Signal 8/10 (&gt;45 kn Drift)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            VISUALIZER 2: MALACCA STRAIT BATHYMETRY & TSS CHOKEPOINT MAP
        ═══════════════════════════════════════════════════════════════ */}
        {activeStudioTab === 'malacca_tss' && (
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Compass size={14} color="#38BDF8" />
                <span>Malacca & Singapore Straits Hydrographic Chart • Phillips Channel Depth Soundings</span>
              </span>
              <span style={{ fontSize: '0.66rem', background: '#065F46', color: '#A7F3D0', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 800 }}>
                +5.6m UKC CLEARANCE (Statutory Min: 3.5m)
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'radial-gradient(ellipse at 50% 50%, #0D223B 0%, #071324 100%)' }}>
              <svg viewBox="0 0 900 360" style={{ width: '100%', height: '100%' }}>
                {/* Strait Coastlines */}
                {/* Malaysia / Johor (North) */}
                <path d="M 0 0 L 900 0 L 900 80 Q 750 90, 620 95 T 450 110 T 280 125 T 100 135 L 0 140 Z" fill="#132338" stroke="#334E68" strokeWidth="1.5" />
                <text x="450" y="60" fill="#627D98" fontSize="12" fontWeight="800" textAnchor="middle">MALAYSIA (JOHOR COAST)</text>

                {/* Singapore Island (Center North) */}
                <path d="M 460 110 Q 520 105, 590 115 Q 600 135, 550 145 Q 480 145, 460 110 Z" fill="#1B314B" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="525" y="130" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">SINGAPORE</text>

                {/* Indonesia / Batam & Riau Islands (South) */}
                <path d="M 0 360 L 900 360 L 900 250 Q 720 240, 580 235 T 390 220 T 180 215 L 0 220 Z" fill="#132338" stroke="#334E68" strokeWidth="1.5" />
                <text x="450" y="310" fill="#627D98" fontSize="12" fontWeight="800" textAnchor="middle">INDONESIA (BATAM & KARIMUN ISLANDS)</text>

                {/* Deep Water Route (TSS) Channel */}
                <path d="M 50 175 Q 300 165, 510 168 T 850 180" fill="none" stroke="#2563EB" strokeWidth="48" opacity="0.25" />
                <path d="M 50 175 Q 300 165, 510 168 T 850 180" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="8 6" />

                {/* Phillips Channel Deepwater Box (Critical Depth Zone) */}
                <g transform="translate(430, 145)">
                  <rect width="160" height="46" rx="6" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="1.8" />
                  <text x="80" y="16" fill="#A7F3D0" fontSize="9" fontWeight="900" textAnchor="middle">PHILLIPS CHANNEL DATUM</text>
                  <text x="80" y="28" fill="#FFFFFF" fontSize="8" fontWeight="700" textAnchor="middle">Min Depth: 19.8m Chart Datum</text>
                  <text x="80" y="39" fill="#34D399" fontSize="8" fontWeight="800" textAnchor="middle">Laden Panamax UKC: +5.6m (Pass ✓)</text>
                </g>

                {/* Depth Soundings Pins */}
                <circle cx="280" cy="170" r="3" fill="#38BDF8" />
                <text x="280" y="162" fill="#93C5FD" fontSize="8" fontWeight="800" textAnchor="middle">23.5m</text>

                <circle cx="360" cy="166" r="3" fill="#38BDF8" />
                <text x="360" y="158" fill="#93C5FD" fontSize="8" fontWeight="800" textAnchor="middle">21.0m</text>

                <circle cx="640" cy="174" r="3" fill="#38BDF8" />
                <text x="640" y="166" fill="#93C5FD" fontSize="8" fontWeight="800" textAnchor="middle">22.8m</text>

                {/* ReCAAP Piracy Advisory Sector */}
                <g transform="translate(680, 160)">
                  <path d="M 0 0 L 80 -40 A 90 90 0 0 1 80 40 Z" fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="45" y="-12" fill="#FCD34D" fontSize="8" fontWeight="800">ReCAAP TIER-2 WATCH</text>
                  <text x="45" y="0" fill="#E2E8F0" fontSize="7" fontWeight="600">Illuminated Anti-Piracy Watch</text>
                  <text x="45" y="10" fill="#38BDF8" fontSize="7" fontWeight="700">Speed ≥ 12.5 kn Maintained</text>
                </g>

                {/* Vessel Transit Icon in TSS */}
                <g transform="translate(340, 168)">
                  <circle cx="0" cy="0" r="10" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                  <polygon points="-4,-3 5,0 -4,3" fill="#FFFFFF" />
                  <text x="0" y="22" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">M/V NAVIBULK PANAMAX</text>
                  <text x="0" y="32" fill="#38BDF8" fontSize="8" fontWeight="700" textAnchor="middle">Draft: 14.2m • Speed: 13.0 kn</text>
                </g>

                {/* Route Savings Callout vs Lombok */}
                <g transform="translate(60, 240)">
                  <rect width="210" height="52" rx="8" fill="rgba(11, 21, 40, 0.9)" stroke="#10B981" strokeWidth="1.5" />
                  <text x="12" y="18" fill="#10B981" fontSize="9" fontWeight="900">CHOKEPOINT QUALIFIED</text>
                  <text x="12" y="30" fill="#FFFFFF" fontSize="8" fontWeight="700">Direct Malacca Strait Transit Cleared</text>
                  <text x="12" y="42" fill="#6EE7B7" fontSize="8" fontWeight="800">Saves +$142,000 USD vs Lombok Deviation</text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            VISUALIZER 3: CARGO HOLD #3 CUTAWAY & IMSBC LAB SCHEMATIC
        ═══════════════════════════════════════════════════════════════ */}
        {activeStudioTab === 'cargo_hold' && (
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Box size={14} color="#FBBF24" />
                <span>Panamax Cargo Hold #3 Transverse Cutaway • IMSBC Code Group A & B Surveillance</span>
              </span>
              <span style={{ fontSize: '0.66rem', background: '#065F46', color: '#A7F3D0', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 800 }}>
                CAN TEST VERIFIED • MOISTURE &lt; TML (7.8% vs 9.5%)
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(251, 191, 36, 0.25)', background: '#0A1526' }}>
              <svg viewBox="0 0 900 360" style={{ width: '100%', height: '100%' }}>
                {/* Ship Hull Transverse Section */}
                {/* Double bottom & hopper tanks */}
                <polygon points="120,40 120,280 200,340 700,340 780,280 780,40" fill="#132338" stroke="#486581" strokeWidth="2.5" />
                <polygon points="170,40 170,265 235,315 665,315 730,265 730,40" fill="#0D1B2A" stroke="#334E68" strokeWidth="1.5" />

                {/* Weather Deck & Hatch Coaming */}
                <rect x="260" y="25" width="380" height="20" fill="#1E3A5F" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="450" y="38" fill="#FFFFFF" fontSize="9" fontWeight="800" textAnchor="middle">CARGO HATCH COAMING #3 (WEATHERTIGHT SEALED)</text>

                {/* Coal Cargo Pile (Natural angle of repose ~35 degrees) */}
                <polygon points="210,315 450,110 690,315" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
                {/* Coal texture lines */}
                <path d="M 270 270 Q 450 170, 630 270" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <path d="M 330 220 Q 450 140, 570 220" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x="450" y="225" fill="#94A3B8" fontSize="12" fontWeight="900" textAnchor="middle">BOWEN BASIN METALLURGICAL COAL</text>
                <text x="450" y="240" fill="#64748B" fontSize="9" fontWeight="700" textAnchor="middle">Parcel: 17,500 MT in Hold #3 • Trimmed Level</text>

                {/* TML Liquefaction Shear Plane vs Actual Moisture Waterline */}
                {/* TML Limit line (9.5%) */}
                <line x1="280" y1="210" x2="620" y2="210" stroke="#EF4444" strokeWidth="1.8" strokeDasharray="4 3" />
                <text x="630" y="213" fill="#FCA5A5" fontSize="8" fontWeight="800">TML CEILING: 9.5% MOISTURE</text>

                {/* Actual Certified Moisture line (7.8%) */}
                <line x1="250" y1="245" x2="650" y2="245" stroke="#10B981" strokeWidth="2.5" />
                <text x="660" y="248" fill="#34D399" fontSize="9" fontWeight="900">ACTUAL: 7.8% (CAN TEST PASS ✓)</text>

                {/* Surface Ventilation Airflow Arrows (Rule 4.2) */}
                <g>
                  <path d="M 180 75 Q 450 65, 720 75" fill="none" stroke="#38BDF8" strokeWidth="3" strokeDasharray="6 4" />
                  <polygon points="725,75 715,70 715,80" fill="#38BDF8" />
                  <text x="450" y="88" fill="#38BDF8" fontSize="9" fontWeight="800" textAnchor="middle">
                    SURFACE VENTILATION AIRFLOW ONLY • VENTING CH₄ METHANE (0.1% LEL)
                  </text>
                </g>

                {/* Bottom Bilge Air Locked (Prevents Spontaneous Heating) */}
                <g transform="translate(450, 328)">
                  <rect x="-140" y="-10" width="280" height="20" rx="4" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="1" />
                  <text x="0" y="4" fill="#FCA5A5" fontSize="8" fontWeight="800" textAnchor="middle">
                    BOTTOM AIR INJECTION VALVES: LOCKED CLOSED (IMSBC RULE 4.2)
                  </text>
                </g>

                {/* Hold Sensors HUD Panel (Left) */}
                <g transform="translate(20, 60)">
                  <rect width="125" height="180" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.12)" />
                  <text x="12" y="22" fill="#FBBF24" fontSize="9" fontWeight="900">HOLD #3 SENSORS</text>
                  
                  <text x="12" y="45" fill="#94A3B8" fontSize="7" fontWeight="700">CO GAS CONCENTRATION</text>
                  <text x="12" y="60" fill="#38BDF8" fontSize="13" fontWeight="900">14 ppm</text>
                  <text x="12" y="70" fill="#34D399" fontSize="7" fontWeight="700">Safe (Limit &gt; 50 ppm)</text>

                  <text x="12" y="95" fill="#94A3B8" fontSize="7" fontWeight="700">METHANE (CH₄) LEL</text>
                  <text x="12" y="110" fill="#10B981" fontSize="13" fontWeight="900">0.1% LEL</text>
                  <text x="12" y="120" fill="#34D399" fontSize="7" fontWeight="700">Safe (Limit &gt; 1.0%)</text>

                  <text x="12" y="145" fill="#94A3B8" fontSize="7" fontWeight="700">CARGO CORE TEMP</text>
                  <text x="12" y="160" fill="#E2E8F0" fontSize="13" fontWeight="900">28.4°C</text>
                  <text x="12" y="170" fill="#34D399" fontSize="7" fontWeight="700">Normal (&lt; 55°C)</text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            VISUALIZER 4: BIMCO VIRTUAL ARRIVAL SPEED-TIME SIMULATOR
        ═══════════════════════════════════════════════════════════════ */}
        {activeStudioTab === 'contract_sim' && (
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.6rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Scale size={14} color="#38BDF8" />
                  <span>BIMCO Virtual Arrival 2011 Interactive Speed vs Laytime Simulator</span>
                </span>
              </div>

              {/* Interactive Speed Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.06)', padding: '0.3rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 }}>Simulate Transit Speed:</span>
                <input 
                  type="range" 
                  min="11.0" 
                  max="14.5" 
                  step="0.1" 
                  value={simulatedSpeed} 
                  onChange={(e) => setSimulatedSpeed(parseFloat(e.target.value))}
                  style={{ width: '110px', accentColor: '#2563EB', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                  {simulatedSpeed.toFixed(1)} kn
                </span>
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#091526' }}>
              <svg viewBox="0 0 900 360" style={{ width: '100%', height: '100%' }}>
                {/* Timeline Grid */}
                <line x1="100" y1="280" x2="840" y2="280" stroke="#334E68" strokeWidth="2" />
                {/* Day Markers */}
                {[0, 3, 6, 9, 12, 14.4, 17.5, 20].map((day, idx) => {
                  const posX = 100 + (day / 20) * 740;
                  return (
                    <g key={idx} transform={`translate(${posX}, 280)`}>
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#64748B" strokeWidth="1.5" />
                      <text x="0" y="20" fill="#94A3B8" fontSize="8" fontWeight="700" textAnchor="middle">Day {day}</text>
                    </g>
                  );
                })}

                {/* TRAJECTORY 1: Unmanaged Full Sea Speed 14.0 kn (Rush to wait) */}
                <path d="M 100 240 L 632 60 L 747 60" fill="none" stroke="#EF4444" strokeWidth="2.5" />
                <circle cx="632" cy="60" r="5" fill="#EF4444" />
                <text x="632" y="45" fill="#FCA5A5" fontSize="9" fontWeight="800" textAnchor="middle">
                  ARRIVE DAY 14.4 (Full Speed 14.0 kn)
                </text>
                {/* Anchor Waiting Red Box */}
                <rect x="632" y="52" width="115" height="16" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeDasharray="3 2" />
                <text x="690" y="64" fill="#FCA5A5" fontSize="8" fontWeight="700" textAnchor="middle">
                  3.1 Days Congestion Anchor Queue (Waste)
                </text>

                {/* TRAJECTORY 2: BIMCO Virtual Arrival Eco-Steaming (Smooth Arrival) */}
                {(() => {
                  const arrivalDay = Math.min(19.5, 4850 / (simulatedSpeed * 24));
                  const arrivalX = 100 + (arrivalDay / 20) * 740;
                  return (
                    <g>
                      <path d={`M 100 240 L ${arrivalX} 60`} fill="none" stroke="#10B981" strokeWidth="3" />
                      <circle cx={arrivalX} cy="60" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                      <text x={arrivalX} y={arrivalDay > 16 ? 40 : 85} fill="#34D399" fontSize="10" fontWeight="900" textAnchor="middle">
                        BIMCO ECO-ARRIVAL: DAY {arrivalDay.toFixed(1)} (@ {simulatedSpeed.toFixed(1)} kn)
                      </text>
                    </g>
                  );
                })()}

                {/* Virtual Notice of Readiness (NOR) Lock Stamp */}
                <g transform="translate(632, 110)">
                  <rect x="-110" y="-12" width="220" height="24" rx="4" fill="rgba(37, 99, 235, 0.25)" stroke="#38BDF8" strokeWidth="1.2" />
                  <text x="0" y="4" fill="#93C5FD" fontSize="8" fontWeight="900" textAnchor="middle">
                    VIRTUAL NOR LOCKED AT DAY 14.4 (LAYTIME RUNNING)
                  </text>
                </g>

                {/* Realized Savings Big Metric HUD */}
                <g transform="translate(100, 40)">
                  <rect width="250" height="85" rx="8" fill="rgba(11, 21, 40, 0.9)" stroke="#10B981" strokeWidth="1.5" />
                  <text x="14" y="20" fill="#10B981" fontSize="9" fontWeight="900">BIMCO SPEED OPTIMIZATION</text>
                  <text x="14" y="45" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="var(--font-mono)">
                    +${fuelSavingsUSD.toLocaleString()} USD
                  </text>
                  <text x="14" y="65" fill="#6EE7B7" fontSize="8" fontWeight="800">
                    Saves {fuelSavingsMT} MT VLSFO • Daily Burn: {currentBurnTpd} MT/day
                  </text>
                  <text x="14" y="77" fill="#94A3B8" fontSize="7" fontWeight="600">
                    Zero Laytime Lost • NOR Preserved under BIMCO 2011
                  </text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            VISUALIZER 5: PARADIP HARBOR APPROACH & TIDAL BERTH MAP
        ═══════════════════════════════════════════════════════════════ */}
        {activeStudioTab === 'paradip_harbor' && (
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Anchor size={14} color="#38BDF8" />
                <span>Paradip Port Authority Harbor Layout • Central Berth CB-1/CB-2 Bathymetry</span>
              </span>
              <span style={{ fontSize: '0.66rem', background: '#065F46', color: '#A7F3D0', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 800 }}>
                14.15m DRAFT QUALIFIED (14.5m HW LIMIT)
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#071526' }}>
              <svg viewBox="0 0 900 360" style={{ width: '100%', height: '100%' }}>
                {/* Ocean and Bay of Bengal Coast */}
                <path d="M 0 0 L 300 0 L 280 120 L 260 220 L 240 360 L 0 360 Z" fill="#132338" stroke="#334E68" strokeWidth="2" />
                <text x="110" y="180" fill="#627D98" fontSize="13" fontWeight="900">ODISHA MAINLAND</text>

                {/* Mahanadi River Estuary & Silt Spit */}
                <path d="M 0 60 Q 150 70, 260 95 L 290 130" fill="none" stroke="#243B53" strokeWidth="22" opacity="0.6" />
                <text x="70" y="85" fill="#829AB1" fontSize="8" fontWeight="700">MAHANADI RIVER DELTA</text>

                {/* Harbor Breakwaters */}
                {/* South Breakwater */}
                <path d="M 260 220 L 410 200 L 450 180" fill="none" stroke="#627D98" strokeWidth="8" strokeLinecap="round" />
                <text x="350" y="215" fill="#94A3B8" fontSize="8" fontWeight="700">SOUTH BREAKWATER</text>

                {/* North Breakwater */}
                <path d="M 280 120 L 420 140 L 460 160" fill="none" stroke="#627D98" strokeWidth="8" strokeLinecap="round" />
                <text x="350" y="130" fill="#94A3B8" fontSize="8" fontWeight="700">NORTH BREAKWATER</text>

                {/* Entrance Channel (Dredged to 14.5m HW) */}
                <path d="M 455 170 L 230 170" fill="none" stroke="#2563EB" strokeWidth="32" opacity="0.3" />
                <text x="340" y="174" fill="#38BDF8" fontSize="8" fontWeight="800" textAnchor="middle">
                  ENTRANCE CHANNEL (14.5m HW PERMISSIBLE DRAFT)
                </text>

                {/* Turning Basin (500m Diameter) */}
                <circle cx="210" cy="170" r="55" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="210" y="165" fill="#E2E8F0" fontSize="8" fontWeight="800" textAnchor="middle">TURNING BASIN</text>
                <text x="210" y="176" fill="#94A3B8" fontSize="7" fontWeight="600" textAnchor="middle">500m Diameter</text>

                {/* Central Berth CB-1 & CB-2 Quay */}
                <rect x="180" y="100" width="80" height="14" fill="#1E3A8A" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="220" y="94" fill="#10B981" fontSize="9" fontWeight="900" textAnchor="middle">
                  CENTRAL BERTH CB-1/CB-2
                </text>

                {/* Vessel Moored at CB-1 */}
                <rect x="185" y="102" width="70" height="10" rx="2" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
                <text x="220" y="110" fill="#FFFFFF" fontSize="6" fontWeight="900" textAnchor="middle">
                  M/V NAVIBULK PANAMAX
                </text>

                {/* MCHP Conveyor System */}
                <line x1="220" y1="85" x2="160" y2="45" stroke="#F59E0B" strokeWidth="3" strokeDasharray="3 2" />
                <text x="140" y="40" fill="#FCD34D" fontSize="8" fontWeight="800">MCHP CONVEYOR (35,000 MT/DAY)</text>

                {/* Trailing Suction Hopper Dredger (TSHD) */}
                <g transform="translate(380, 100)">
                  <circle cx="0" cy="0" r="5" fill="#F97316" />
                  <text x="10" y="4" fill="#FDBA74" fontSize="8" fontWeight="700">TSHD DREDGER ACTIVE (Mahanadi Silt Control)</text>
                </g>

                {/* Fairway Buoy (Pilot Boarding Station) */}
                <g transform="translate(680, 170)">
                  <circle cx="0" cy="0" r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="0" y="-14" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">FAIRWAY BUOY</text>
                  <text x="0" y="-5" fill="#38BDF8" fontSize="7" fontWeight="700" textAnchor="middle">Pilot Station (4.5 NM)</text>
                </g>

                {/* Inset Tidal Sine Wave Curve */}
                <g transform="translate(560, 40)">
                  <rect width="280" height="85" rx="8" fill="rgba(11, 21, 40, 0.9)" stroke="rgba(255,255,255,0.12)" />
                  <text x="14" y="20" fill="#38BDF8" fontSize="8" fontWeight="800">DAYLIGHT HIGH WATER TIDAL CURVE</text>
                  {/* Sine curve */}
                  <path d="M 20 60 Q 75 35, 140 60 T 260 60" fill="none" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="20" y1="42" x2="260" y2="42" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="18" y="38" fill="#34D399" fontSize="7" fontWeight="700">14.5m HW Peak</text>
                  <line x1="20" y1="70" x2="260" y2="70" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="18" y="79" fill="#94A3B8" fontSize="7" fontWeight="700">13.5m LW Datum</text>
                  {/* Daylight Window Marker */}
                  <rect x="80" y="36" width="60" height="28" fill="rgba(16, 185, 129, 0.25)" stroke="#10B981" strokeWidth="1" />
                  <text x="110" y="52" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle">DAYLIGHT HW</text>
                </g>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM EXPLANATORY STATUS STRIP ── */}
      <div 
        style={{ 
          background: '#F8FAFC', 
          borderTop: '1px solid var(--border)', 
          padding: '0.75rem 1.4rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '0.75rem' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#166534', fontWeight: 700 }}>
          <CheckCircle2 size={14} color="#16A34A" />
          <span>All 5 trade hazard dimensions modeled with empirical maritime bathymetry, radar vectors, and BIMCO legal rules.</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: '#64748B' }}>
          <span>Switch tabs above to inspect individual graphical simulators</span>
        </div>
      </div>
    </div>
  );
}
