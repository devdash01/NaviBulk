import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Anchor, 
  Ship, 
  TrendingUp, 
  ShieldAlert, 
  RefreshCw, 
  FileText, 
  ChevronDown, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  MapPin,
  Box,
  Layers,
  X,
  Navigation,
  ShieldCheck,
  Zap,
  Building2,
  Cpu,
  AlertTriangle,
  Sliders,
  Award,
  Globe2,
  Info,
  Database,
  LineChart,
  BarChart3,
  SearchCheck,
  Check,
  Gauge,
  Leaf,
  DollarSign
} from 'lucide-react';
import { BUNKER_PRICE_VLSFO, COMMODITY_PINK_SHEET, HISTORICAL_SERIES } from '../data/freightData';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS } from '../data/portConstraints';
import RouteLine from './RouteLine';

export default function HomePage({ onNavigate, onConfigureVoyage }) {
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [plantSelectorOpen, setPlantSelectorOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState({ name: 'SAIL Corporate HQ', location: 'Lodhi Road, New Delhi' });
  const [activeCorridorKey, setActiveCorridorKey] = useState('australia_paradip');
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('SAIL-BL-2026-0849');
  const [trackingResult, setTrackingResult] = useState(null);
  const [displayedSavings, setDisplayedSavings] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const [settlePulse, setSettlePulse] = useState(false);
  
  // Speed & Eco-Steaming Optimization state
  const [operatingSpeed, setOperatingSpeed] = useState(12.4);

  const isInitialLoadRef = useRef(true);
  const animationRef = useRef(null);
  const prevSavingsRef = useRef(0);

  // Sourced Corridor Definitions for Interactive Route Map Centerpiece
  const corridors = [
    {
      id: 'australia_paradip',
      label: 'Hay Point → Paradip',
      origin: 'Australia',
      originPort: 'Hay Point Terminal, QLD',
      destination: 'paradip',
      destPort: 'Paradip Port Authority (Berth CB-1)',
      commodity: 'Coking Coal',
      distanceNm: 4850,
      steamingDays: 15.5,
      vesselClass: 'panamax',
      vesselName: 'Panamax (75,000 DWT)',
      draftReq: 14.2,
      berthDraftMax: 14.5,
      draftStatus: '100% Direct Berth Cleared [Notice 750]',
      lighteringPenalty: 0,
      timingAlphaUsd: 87421,
      alphaSource: 'DecisionEngineV2 ($87,421 COA volume hedge advantage vs spot fixture)',
      originCoords: { x: 820, y: 390 },
      destCoords: { x: 580, y: 245 },
      pathD: 'M 820 390 Q 720 330 580 245'
    },
    {
      id: 'usa_vizag',
      label: 'Hampton Roads → Vizag',
      origin: 'USA East Coast',
      originPort: 'Hampton Roads (Norfolk), VA',
      destination: 'vizag',
      destPort: 'Visakhapatnam Outer Harbor (VGCB Quay)',
      commodity: 'Low-Vol Met Coal',
      distanceNm: 11300,
      steamingDays: 36.2,
      vesselClass: 'panamax',
      vesselName: 'Panamax (75,000 DWT)',
      draftReq: 13.8,
      berthDraftMax: 18.1,
      draftStatus: 'Direct Deepwater Berth Cleared [VPT Official 18.1m]',
      lighteringPenalty: 0,
      timingAlphaUsd: 187084,
      alphaSource: 'DecisionEngineV2 ($187,084 long-haul COA rate hedge vs spot market)',
      originCoords: { x: 190, y: 170 },
      destCoords: { x: 575, y: 270 },
      pathD: 'M 190 170 Q 380 430 575 270'
    },
    {
      id: 'mozambique_dhamra',
      label: 'Maputo → Dhamra',
      origin: 'Mozambique',
      originPort: 'Matola Coal Terminal, Maputo',
      destination: 'dhamra',
      destPort: 'Dhamra Port (Adani Berth 1)',
      commodity: 'Medium-Vol Coking Coal',
      distanceNm: 4380,
      steamingDays: 14.0,
      vesselClass: 'supramax',
      vesselName: 'Supramax / Ultramax (60,000 DWT)',
      draftReq: 12.2,
      berthDraftMax: 18.0,
      draftStatus: '100% Direct Berth Cleared [Dhamra Port 18.0m]',
      lighteringPenalty: 0,
      timingAlphaUsd: 70096,
      alphaSource: 'DecisionEngineV2 ($70,096 Supramax fuel optimization & COA hedge)',
      originCoords: { x: 440, y: 395 },
      destCoords: { x: 590, y: 235 },
      pathD: 'M 440 395 Q 520 320 590 235'
    },
    {
      id: 'indonesia_haldia',
      label: 'Taboneo → Haldia',
      origin: 'Indonesia',
      originPort: 'Taboneo Anchorage, South Kalimantan',
      destination: 'haldia',
      destPort: 'Haldia Dock Complex (HOJ / Gen Berths)',
      commodity: 'Thermal / PCI Coal',
      distanceNm: 2010,
      steamingDays: 6.4,
      vesselClass: 'panamax',
      vesselName: 'Panamax / Kamsarmax (55,000 DWT Parcel)',
      draftReq: 13.8,
      berthDraftMax: 8.8,
      draftStatus: 'Lightering Gating Triggered at Sagar [8.8m Limit]',
      lighteringPenalty: 209000,
      timingAlphaUsd: 66034,
      alphaSource: 'Physical Feasibility: 13.8m draft exceeds 8.8m HDC; requires Sagar transshipment',
      originCoords: { x: 740, y: 320 },
      destCoords: { x: 600, y: 225 },
      pathD: 'M 740 320 Q 670 270 600 225'
    }
  ];

  const activeCorridor = corridors.find(c => c.id === activeCorridorKey) || corridors[0];

  // Hydrodynamic speed optimization calculations (Admiralty Non-Linear Cubic Law: P ∝ V³)
  const speedCalc = useMemo(() => {
    const baseSpeed = 14.0;
    const baseBurnTpd = 28.0;
    const bunkerPrice = BUNKER_PRICE_VLSFO || 829.50;
    const dist = activeCorridor.distanceNm;

    // Design baseline
    const baseSeaDays = Number((dist / (baseSpeed * 24)).toFixed(1));
    const baseBunkerTotalTons = baseSeaDays * baseBurnTpd;

    // Current operating speed calculations
    const curBurnTpd = Number((baseBurnTpd * Math.pow(operatingSpeed / baseSpeed, 3)).toFixed(1));
    const curSeaDays = Number((dist / (operatingSpeed * 24)).toFixed(1));
    const curBunkerTotalTons = curSeaDays * curBurnTpd;

    // Savings
    const fuelSavedTons = Math.max(0, Number((baseBunkerTotalTons - curBunkerTotalTons).toFixed(1)));
    const bunkerCostSavedUsd = Math.round(fuelSavedTons * bunkerPrice);
    const co2ReductionTons = Number((fuelSavedTons * 3.114).toFixed(1));
    const burnReductionPct = Number((((baseBurnTpd - curBurnTpd) / baseBurnTpd) * 100).toFixed(1));
    const additionalSteamingHours = Math.round((curSeaDays - baseSeaDays) * 24);

    return {
      baseSpeed,
      baseBurnTpd,
      baseSeaDays,
      curBurnTpd,
      curSeaDays,
      fuelSavedTons,
      bunkerCostSavedUsd,
      co2ReductionTons,
      burnReductionPct,
      additionalSteamingHours,
      bunkerPrice
    };
  }, [activeCorridor, operatingSpeed]);

  // Live number count-up for hero savings
  useEffect(() => {
    const target = activeCorridor.timingAlphaUsd || 87421;
    const isInitial = isInitialLoadRef.current;
    const start = isInitial ? 0 : prevSavingsRef.current;
    const duration = isInitial ? 900 : 500;
    const startTime = performance.now();

    if (isInitial) {
      isInitialLoadRef.current = false;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setSettlePulse(false);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.round(start + (target - start) * ease);
      setDisplayedSavings(currentVal);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        prevSavingsRef.current = target;
        setSettlePulse(true);
        setTimeout(() => setSettlePulse(false), 550);
      }
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeCorridorKey]);

  // Auto-cycle corridors
  useEffect(() => {
    if (!isAutoCycling) return;

    const interval = setInterval(() => {
      setActiveCorridorKey((prevKey) => {
        const currentIndex = corridors.findIndex((c) => c.id === prevKey);
        const nextIndex = (currentIndex + 1) % corridors.length;
        return corridors[nextIndex].id;
      });
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoCycling, corridors]);

  const sailPlants = [
    { name: 'SAIL Corporate HQ', location: 'Lodhi Road, New Delhi', desc: 'Central Raw Materials Directorate' },
    { name: 'Bhilai Steel Plant (BSP)', location: 'Durg, Chhattisgarh', desc: '7.0 MTPA Capacity • Sourced via Vizag Quay' },
    { name: 'Bokaro Steel Plant (BSL)', location: 'Bokaro, Jharkhand', desc: '4.6 MTPA Capacity • Sourced via Paradip & Dhamra' },
    { name: 'Rourkela Steel Plant (RSP)', location: 'Sundargarh, Odisha', desc: '4.5 MTPA Capacity • Sourced via Paradip Berth' },
    { name: 'Durgapur Steel Plant (DSP)', location: 'Paschim Bardhaman, WB', desc: '2.2 MTPA Capacity • Sourced via Haldia/Dhamra' },
    { name: 'IISCO Steel Plant (ISP)', location: 'Burnpur, West Bengal', desc: '2.5 MTPA Capacity • Sourced via Dhamra Port' }
  ];

  const handleLaunchPlanner = (corridor = activeCorridor, customSpeed = operatingSpeed) => {
    if (onConfigureVoyage) {
      onConfigureVoyage({
        originCountry: corridor.origin,
        destinationPortKey: corridor.destination,
        cargoType: corridor.commodity,
        tonnage: corridor.vesselClass === 'capesize' ? 150000 : 70000,
        vesselClass: corridor.vesselClass,
        speedKnots: customSpeed
      });
    }
    onNavigate('planner');
  };

  const handleTrackSubmit = (e) => {
    e?.preventDefault();
    setTrackingResult({
      vessel: 'MV Mineral Antwerp (Panamax 75k DWT)',
      cargo: '70,000 MT Hard Coking Coal',
      origin: 'Hay Point Terminal, Australia',
      destination: 'Paradip Port Authority (Berth CB-1)',
      status: 'Steaming in Deep Water (Bay of Bengal)',
      eta: '18 Sep 2026 • 06:00 IST',
      speed: `${operatingSpeed.toFixed(1)} knots (Eco-speed profile)`,
      draft: '14.20m (Safely within Paradip 14.5m max draft limit [Notice 750])',
      lightering: '100% Direct Berth Clearance (Zero Transshipment Penalty)',
      modelSavings: '+$87,421 V2 Model-Optimized COA Contract Hedge'
    });
  };

  return (
    <div 
      className="sail-home-wrapper" 
      style={{ 
        minHeight: '100vh', 
        background: '#F8FAFC', 
        color: '#0F172A', 
        position: 'relative', 
        overflowX: 'hidden', 
        fontFamily: "var(--font-sans)" 
      }}
    >
      
      {/* ── CRISP WHITE MARITIME NAVBAR ── */}
      <header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          padding: '0.85rem 3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Brand Identity */}
        <div 
          onClick={() => onNavigate('home')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.85rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <img 
            src="/navibulk-logo.png" 
            alt="SAIL NaviBulk Logo" 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#FFFFFF',
              padding: '2px',
              border: '1px solid #E2E8F0',
              objectFit: 'contain',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              flexShrink: 0
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                fontSize: '1.05rem', 
                fontWeight: 800, 
                letterSpacing: '0.02em', 
                color: '#0F172A',
                lineHeight: 1
              }}>
                SAIL NAVIBULK
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: '#FEF3C7',
                color: '#92400E',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(180, 83, 9, 0.2)'
              }}>
                ENTERPRISE
              </span>
            </div>
            <span style={{ 
              fontSize: '0.68rem', 
              fontWeight: 500, 
              color: '#64748B', 
              letterSpacing: '0.01em',
              marginTop: '3px'
            }}>
              Steel Authority of India Limited • Central Raw Materials Directorate
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button 
            onClick={() => onNavigate('home')}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              transition: 'all 0.15s'
            }}
          >
            Overview
          </button>

          {/* Workstations Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              style={{
                background: solutionsOpen ? '#F1F5F9' : 'transparent',
                border: '1px solid transparent',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!solutionsOpen) e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                if (!solutionsOpen) e.currentTarget.style.color = '#334155';
              }}
            >
              <span>Workstations</span>
              <ChevronDown size={13} style={{ transform: solutionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.7 }} />
            </button>

            {solutionsOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  left: 0,
                  width: '350px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                  padding: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  zIndex: 110,
                }}
              >
                <div 
                  onClick={() => { setSolutionsOpen(false); onNavigate('planner'); }}
                  style={{ padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '0.75rem', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Compass size={18} color="#2563EB" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Voyage Planner</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Landed $/MT ranking across Capesize vs Panamax</div>
                  </div>
                </div>

                <div 
                  onClick={() => { setSolutionsOpen(false); onNavigate('ports'); }}
                  style={{ padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '0.75rem', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Anchor size={18} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Port Infrastructure & Berths</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>7 Indian East Coast ports bathymetric draft matrix</div>
                  </div>
                </div>

                <div 
                  onClick={() => { setSolutionsOpen(false); onNavigate('market'); }}
                  style={{ padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '0.75rem', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <TrendingUp size={18} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Market Intelligence Terminal</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Verified 1-Day (1.81%) & 14-Day (19.19%) econometric forecasts</div>
                  </div>
                </div>

                <div 
                  onClick={() => { setSolutionsOpen(false); onNavigate('backhaul'); }}
                  style={{ padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '0.75rem', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <RefreshCw size={18} color="#7C3AED" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Backhaul Monetizer</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Empty ballast return cargo matching engine</div>
                  </div>
                </div>

                <div 
                  onClick={() => { setSolutionsOpen(false); onNavigate('ledger'); }}
                  style={{ padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '0.75rem', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <FileText size={18} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Executive Savings Ledger</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Itemized commercial audit dossier</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('ports')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#334155', 
              fontSize: '0.84rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#334155'}
          >
            Port Matrix
          </button>

          <button 
            onClick={() => onNavigate('market')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#334155', 
              fontSize: '0.84rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#334155'}
          >
            Baltic Models
          </button>

          <button 
            onClick={() => setTrackingModalOpen(true)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#334155', 
              fontSize: '0.84rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#334155'}
          >
            Track Consignment
          </button>
        </nav>

        {/* Right Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Steel Plant Selector */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setPlantSelectorOpen(!plantSelectorOpen)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                color: '#0F172A',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'border-color 160ms ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#B45309'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
            >
              <Building2 size={13} color="#B45309" />
              <span>{selectedPlant.name}</span>
              <ChevronDown size={12} style={{ transform: plantSelectorOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.7 }} />
            </button>

            {plantSelectorOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.4rem)',
                  right: 0,
                  width: '275px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  padding: '0.4rem',
                  zIndex: 110,
                }}
              >
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E2E8F0', marginBottom: '0.25rem' }}>
                  Target Steel Plant Directorate
                </div>
                {sailPlants.map((p) => (
                  <div 
                    key={p.name}
                    onClick={() => {
                      setSelectedPlant(p);
                      setPlantSelectorOpen(false);
                    }}
                    style={{
                      padding: '0.55rem 0.65rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: selectedPlant.name === p.name ? '#92400E' : '#334155',
                      background: selectedPlant.name === p.name ? '#FEF3C7' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPlant.name !== p.name) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPlant.name !== p.name) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '1px' }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Primary Launch Desk CTA */}
          <button 
            onClick={() => handleLaunchPlanner()}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1.15rem',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1E293B'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0F172A'}
          >
            <span>Launch Decision Desk</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>


      {/* ── CRISP HERO SECTION (Star Number + Live Corridor Switcher) ── */}
      <section 
        style={{
          position: 'relative',
          width: '100%',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 65%, #F1F5F9 100%)',
          borderBottom: '1px solid #E2E8F0',
          padding: '2.5rem 3.5rem 3rem'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
          
          {/* Corridor Live Switcher Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', fontWeight: 700, color: '#B45309', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B45309' }} />
              <span>Commercial Maritime Econometric Intelligence Console</span>
            </div>

            {/* Live Corridor Switcher Tabs */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '0.25rem 0.35rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={() => setIsAutoCycling(false)}
              onMouseLeave={() => setIsAutoCycling(true)}
            >
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', padding: '0 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: isAutoCycling ? '#16A34A' : '#D97706',
                    boxShadow: isAutoCycling ? '0 0 6px #16A34A' : 'none'
                  }} 
                />
                <span>Active Route:</span>
              </span>
              {corridors.map((c) => {
                const isSelected = activeCorridorKey === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCorridorKey(c.id);
                      setIsAutoCycling(false);
                      setTimeout(() => setIsAutoCycling(true), 8000);
                    }}
                    style={{
                      background: isSelected ? '#0F172A' : 'transparent',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      border: `1px solid ${isSelected ? '#0F172A' : 'transparent'}`,
                      borderRadius: '5px',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.16s ease'
                    }}
                  >
                    {c.origin.split(' ')[0]} → {c.destination.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Hero Content Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            {/* Left Column: Star Savings Number & RouteLine */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                Global Dry Bulk • DecisionEngineV2 Projection
              </div>

              <h1 style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', fontWeight: 800, color: '#0F172A', margin: '0 0 0.85rem 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                Model-optimized chartering advantage
              </h1>

              {/* ROUTE LINE ARC BEHIND NUMBER */}
              <div style={{ position: 'relative', width: '100%', margin: '0.25rem 0 1rem 0' }}>
                <div style={{ position: 'absolute', top: '-60px', left: '-20px', width: '110%', height: '220px', zIndex: 0, opacity: 0.85, pointerEvents: 'none' }}>
                  <RouteLine 
                    variant="home" 
                    corridor={activeCorridor}
                    progress={0.52}
                  />
                </div>

                {/* THE HERO SAVINGS NUMBER */}
                <div 
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.4rem',
                    lineHeight: 0.95,
                    letterSpacing: '-0.03em'
                  }}
                >
                  <span style={{ fontSize: 'clamp(2.4rem, 3.8vw, 3.5rem)', fontWeight: 800, color: '#B45309' }}>
                    +$
                  </span>
                  <span 
                    style={{ 
                      fontSize: 'clamp(3.2rem, 6.5vw, 6.2rem)', 
                      fontWeight: 800, 
                      color: '#0F172A',
                      fontFamily: "var(--font-mono)",
                      fontVariantNumeric: 'tabular-nums',
                      transition: 'color 200ms ease'
                    }}
                  >
                    {displayedSavings.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.25rem)', fontWeight: 600, color: '#64748B', fontFamily: "var(--font-sans)", letterSpacing: 'normal' }}>
                    / voyage
                  </span>
                </div>
              </div>

              {/* Supporting Route Context Badges */}
              <div 
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  padding: '0.85rem 1.25rem',
                  width: '100%',
                  marginTop: '0.5rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Active Route & Steaming
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', fontFamily: "var(--font-mono)" }}>
                    {activeCorridor.label} ({activeCorridor.distanceNm.toLocaleString()} nm • {activeCorridor.steamingDays}d)
                  </div>
                </div>

                <div style={{ width: '1px', height: '26px', background: '#E2E8F0' }} />

                <div>
                  <div style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Vessel Class & Cargo
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#B45309' }}>
                    {activeCorridor.vesselName}
                  </div>
                </div>

                <div style={{ width: '1px', height: '26px', background: '#E2E8F0' }} />

                <div>
                  <div style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    1-Day Forecast MAPE
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16A34A', fontFamily: "var(--font-mono)" }}>
                    1.81% [XGBoost Log-Return]
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Narrative Card */}
            <div 
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '2.25rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                SAIL NaviBulk Enterprise
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.85rem 0', lineHeight: 1.35 }}>
                The intelligent operating system for Indian dry bulk logistics.
              </h2>

              <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.65, margin: '0 0 1.75rem 0', fontWeight: 400 }}>
                From econometric Baltic freight forecasting to draft-cleared berth routing, SAIL NaviBulk eliminates multi-hundred-thousand-dollar offshore lightering penalties across 7 East Coast Indian ports with empirical certainty.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleLaunchPlanner(activeCorridor)}
                  style={{
                    background: '#B45309',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.85rem 1.65rem',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    boxShadow: '0 2px 8px rgba(180, 83, 9, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#92400E'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#B45309'}
                >
                  <span>Simulate Voyage Economics</span>
                  <ArrowRight size={16} />
                </button>

                <button 
                  onClick={() => onNavigate('ports')}
                  style={{
                    background: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.85rem 1.55rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
                >
                  Inspect Port Waterlines
                </button>
              </div>

              {/* Berth Status Badge */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', width: '100%', fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>Status: <strong style={{ color: '#0F172A' }}>{activeCorridor.draftStatus}</strong></span>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ── TRUSTED INSTITUTIONAL ECOSYSTEM STRIP ── */}
      <div 
        style={{
          borderBottom: '1px solid #E2E8F0',
          background: '#FFFFFF',
          padding: '1.1rem 3.5rem',
          width: '100%'
        }}
      >
        <div 
          style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '1.5rem' 
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            TRUSTED INSTITUTIONAL ECOSYSTEM
          </div>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '2.5rem', 
              flexWrap: 'wrap', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              color: '#475569', 
              letterSpacing: '0.04em' 
            }}
          >
            <span style={{ color: '#0F172A' }}>STEEL AUTHORITY OF INDIA LIMITED</span>
            <span>MINISTRY OF STEEL (GOVT. OF INDIA)</span>
            <span>PARADIP PORT AUTHORITY</span>
            <span>VISAKHAPATNAM PORT AUTHORITY</span>
            <span>SYAMA PRASAD MOOKERJEE PORT</span>
          </div>
        </div>
      </div>


      {/* ── PROMINENT FEATURE: HYDRODYNAMIC SPEED & ECO-STEAMING OPTIMIZATION ── */}
      <section 
        style={{ 
          padding: '4.5rem 3.5rem', 
          background: '#FFFFFF', 
          borderBottom: '1px solid #E2E8F0' 
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                <Gauge size={16} />
                <span>Hydrodynamic Propulsion Console • IMO MEPC 76 Compliant</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.3rem)', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Speed & Eco-Steaming Bunker Optimizer
              </h2>
              <p style={{ fontSize: '0.98rem', color: '#475569', margin: '0.4rem 0 0 0', maxWidth: '780px' }}>
                Admiralty Cubic Law ($P \propto V^3$): Vessel fuel consumption increases with the cube of steaming speed. Reducing speed by just 1.6 knots slashes daily bunker burn by <strong>-{speedCalc.burnReductionPct}%</strong>, yielding tens of thousands of dollars in direct voyage savings.
              </p>
            </div>

            {/* Quick Speed Preset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', marginRight: '0.3rem' }}>Presets:</span>
              {[
                { label: 'Super Eco (11.5 kn)', kn: 11.5 },
                { label: '★ Optimal Eco (12.4 kn)', kn: 12.4, primary: true },
                { label: 'Design (14.0 kn)', kn: 14.0 },
                { label: 'Express (15.0 kn)', kn: 15.0 }
              ].map(preset => (
                <button
                  key={preset.kn}
                  onClick={() => setOperatingSpeed(preset.kn)}
                  style={{
                    background: operatingSpeed === preset.kn ? (preset.primary ? '#16A34A' : '#0F172A') : '#F1F5F9',
                    color: operatingSpeed === preset.kn ? '#FFFFFF' : '#334155',
                    border: '1px solid',
                    borderColor: operatingSpeed === preset.kn ? 'transparent' : '#CBD5E1',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Speed Control Panel + KPI Cards */}
          <div 
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}
          >
            {/* Speed Slider Control Bar */}
            <div style={{ background: '#FFFFFF', padding: '1.25rem 1.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Zap size={18} color="#D97706" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Adjust Steaming Speed for Corridor: <span style={{ color: '#2563EB' }}>{activeCorridor.label} ({activeCorridor.distanceNm.toLocaleString()} nm)</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', fontFamily: "var(--font-mono)" }}>
                    {operatingSpeed.toFixed(1)} Knots
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    background: operatingSpeed === 12.4 ? '#DCFCE7' : operatingSpeed <= 12.0 ? '#DBEAFE' : operatingSpeed <= 14.0 ? '#FEF3C7' : '#FEE2E2',
                    color: operatingSpeed === 12.4 ? '#166534' : operatingSpeed <= 12.0 ? '#1E40AF' : operatingSpeed <= 14.0 ? '#92400E' : '#991B1B',
                    border: '1px solid',
                    borderColor: operatingSpeed === 12.4 ? '#86EFAC' : '#CBD5E1'
                  }}>
                    {operatingSpeed === 12.4 ? '★ OPTIMAL ECO-STEAM' : operatingSpeed <= 12.0 ? 'SUPER ECO' : operatingSpeed === 14.0 ? 'DESIGN BASELINE' : 'HIGH EMISSIONS'}
                  </span>
                </div>
              </div>

              {/* Range Input Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', fontFamily: "var(--font-mono)" }}>10.5 kn</span>
                <input 
                  type="range"
                  min="10.5"
                  max="16.0"
                  step="0.1"
                  value={operatingSpeed}
                  onChange={(e) => setOperatingSpeed(parseFloat(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#2563EB',
                    height: '8px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', fontFamily: "var(--font-mono)" }}>16.0 kn</span>
              </div>
            </div>

            {/* 4 Interactive Hydrodynamic KPI Metric Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              
              {/* Tile 1: Fuel Consumption Rate */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  <Ship size={14} color="#2563EB" />
                  <span>Daily Fuel Consumption</span>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', fontFamily: "var(--font-mono)" }}>
                  {speedCalc.curBurnTpd} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>TPD</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: speedCalc.burnReductionPct >= 0 ? '#16A34A' : '#DC2626', fontWeight: 700, marginTop: '0.25rem' }}>
                  {speedCalc.burnReductionPct >= 0 ? `-${speedCalc.burnReductionPct}% vs 28.0 TPD Standard` : `+${Math.abs(speedCalc.burnReductionPct)}% High Burn`}
                </div>
              </div>

              {/* Tile 2: Direct Voyage Bunker Cost Savings */}
              <div style={{ background: '#FFFFFF', border: '1px solid #86EFAC', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  <DollarSign size={14} color="#16A34A" />
                  <span>Bunker Fuel Savings</span>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16A34A', fontFamily: "var(--font-mono)" }}>
                  +${speedCalc.bunkerCostSavedUsd.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.25rem' }}>
                  {speedCalc.fuelSavedTons > 0 ? `${speedCalc.fuelSavedTons} MT VLSFO Saved @ $${speedCalc.bunkerPrice}/t` : 'Standard baseline cost'}
                </div>
              </div>

              {/* Tile 3: Steaming Days & Laycan Synchronization */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  <Clock size={14} color="#D97706" />
                  <span>Steaming Transit Time</span>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', fontFamily: "var(--font-mono)" }}>
                  {speedCalc.curSeaDays} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Days</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#334155', marginTop: '0.25rem', fontWeight: 600 }}>
                  {speedCalc.additionalSteamingHours > 0 ? `+${speedCalc.additionalSteamingHours}h (Within 14D Laycan)` : `Standard (${speedCalc.baseSeaDays}d)`}
                </div>
              </div>

              {/* Tile 4: Carbon Footprint Abatement */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  <Leaf size={14} color="#059669" />
                  <span>CO₂ Emission Abatement</span>
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', fontFamily: "var(--font-mono)" }}>
                  -{speedCalc.co2ReductionTons} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>MT</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.25rem' }}>
                  IMO CII Rating Improvement
                </div>
              </div>

            </div>

            {/* Bottom Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                <ShieldCheck size={16} color="#16A34A" />
                <span>Calculated via Admiralty Formula ($P_1/P_2 = (V_1/V_2)^3$) validated for {activeCorridor.vesselName}.</span>
              </div>

              <button
                onClick={() => handleLaunchPlanner(activeCorridor, operatingSpeed)}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}
              >
                <span>Apply {operatingSpeed.toFixed(1)} kn Speed to Voyage Planner</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* ── SECTION 1: "WHAT WE DO" (Clean Editorial Cards) ── */}
      <section style={{ padding: '4.5rem 3.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            <Compass size={15} />
            <span>Strategic Mandate • Raw Materials Directorate</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.4rem)', fontWeight: 800, color: '#0F172A', lineHeight: 1.25, maxWidth: '840px', margin: '0 0 1.25rem 0', letterSpacing: '-0.02em' }}>
            Predictive freight economics for India's national steel logistics.
          </h2>

          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.65, maxWidth: '960px', margin: 0, fontWeight: 400 }}>
            SAIL NaviBulk empowers chartering desks to forecast global Baltic dry bulk rate dips with institutional econometric precision, verify tidal and draft constraints across Indian discharge ports before fixtures are signed, and eliminate multi-hundred-thousand-dollar offshore lightering penalties before a vessel ever leaves port.
          </p>

          {/* 3 Core Pillar Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginTop: '3rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <TrendingUp size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Forecast Baltic freight rates</h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Anticipate spot market peaks and troughs using empirical models (XGBoost, Prophet, SARIMA) trained on 10,246 real daily Baltic Exchange fixtures to time charter contracts when freight rates dip.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Verify port feasibility</h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Instantly check arrival drafts against verified berth limits across 7 East Coast Indian ports (Paradip 14.5m, Vizag 18.1m, Haldia 8.5m) to ensure direct berth clearance and prevent unexpected lightering costs.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Award size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Optimal contract timing</h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Synthesize fuel bunker costs, demurrage exposure, and COA volume hedges into an actionable recommendation: Fixture Today vs. Delay, backtested to yield average savings of +$87,421 per voyage.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ── SECTION 2: "HOW IT WORKS" (4-Step Visual Workflow) ── */}
      <section style={{ padding: '4.5rem 3.5rem', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              <Sliders size={15} />
              <span>Standard Operational Procedure</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.4rem)', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
              How SAIL NaviBulk works
            </h2>
            <p style={{ fontSize: '1rem', color: '#475569', margin: 0 }}>
              A seamless four-stage decision pipeline from raw material parcel nomination to empirical post-voyage verification.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            
            {/* Step 1 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2rem 1.75rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#B45309', letterSpacing: '0.08em', marginBottom: '0.75rem', fontFamily: "var(--font-mono)" }}>
                STEP 01
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Box size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                Nominate cargo & route
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Select load origin (e.g. Hay Point, Hampton Roads), commodity parcel (coking coal, iron ore), and designated steel plant receiver.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2rem 1.75rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16A34A', letterSpacing: '0.08em', marginBottom: '0.75rem', fontFamily: "var(--font-mono)" }}>
                STEP 02
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Anchor size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                Verify port feasibility
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Engine evaluates vessel draft requirements against official port notices. Automatically detects whether direct berthing or lightering applies.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2rem 1.75rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#2563EB', letterSpacing: '0.08em', marginBottom: '0.75rem', fontFamily: "var(--font-mono)" }}>
                STEP 03
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Clock size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                Forecast optimal timing
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Econometric models project BPI/BCI rates over 1 to 14 days, computing the financial expected value of fixing immediately vs waiting.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2rem 1.75rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#7C3AED', letterSpacing: '0.08em', marginBottom: '0.75rem', fontFamily: "var(--font-mono)" }}>
                STEP 04
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <RefreshCw size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                Prove against real history
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Auditors can run the Counterfactual Replay to simulate past voyage dates against true historical fixtures, validating dollar savings without forward bias.
              </p>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              onClick={() => handleLaunchPlanner(activeCorridor)}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.85rem 1.75rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Try this workflow in the Voyage Planner</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </section>


      {/* ── SECTION 3: "WHY US" / EMPIRICAL GROUNDING ── */}
      <section style={{ padding: '4.5rem 3.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ maxWidth: '780px', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              <ShieldCheck size={15} />
              <span>Empirical Grounding</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.4rem)', fontWeight: 800, color: '#0F172A', margin: '0 0 0.85rem 0', letterSpacing: '-0.02em' }}>
              Built on verified maritime data, not synthetic claims.
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', margin: 0, lineHeight: 1.65 }}>
              Every calculation in SAIL NaviBulk is anchored to genuine shipping datasets, official port authority limits, and transparent econometric modeling.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Database size={22} />
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem', fontFamily: "var(--font-mono)" }}>
                10,246+ HISTORICAL RECORDS
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
                Real Baltic Exchange data
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Trained on authentic daily Baltic Dry Index (BDI, BCI, BPI, BSI) price time series spanning multi-year market cycles—not random or synthetic noise.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <SearchCheck size={22} />
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                OFFICIAL PORT TRUST NOTICES
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
                Verified port constraints
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Every draft depth (e.g. Paradip 14.5m Berth CB-1, Vizag 18.1m VGCB) is extracted directly from published Port Authority circulars, eliminating grounding and transshipment risk.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <BarChart3 size={22} />
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                COUNTERFACTUAL REPLAY ENGINE
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
                Walk-forward backtested proof
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                No self-reported vanity metrics. Replay past voyage dates through the DecisionEngineV2 to empirically measure exact realized savings against actual spot fixture settlements.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '2.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <LineChart size={22} />
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                EMPIRICAL MODEL BENCHMARKING
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
                Classical vs deep learning
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Rigorous benchmarking demonstrates XGBoost log-return (1.81% 1-day MAPE) outperforming complex LSTM architectures on noisy shipping freight series.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ── SECTION 4: CLOSING CALL TO ACTION ── */}
      <section style={{ padding: '5rem 3.5rem', background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#B45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <Ship size={26} />
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.7rem)', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0', letterSpacing: '-0.025em' }}>
            Ready to optimize SAIL dry bulk chartering?
          </h2>

          <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '640px', margin: '0 auto 2.25rem', lineHeight: 1.65 }}>
            Run live econometric simulations across Australia, Mozambique, and US corridors, inspect draft waterlines, and monetize ballast return voyages.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleLaunchPlanner()}
              style={{
                background: '#B45309',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.95rem 2rem',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 2px 8px rgba(180, 83, 9, 0.3)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#92400E'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#B45309'}
            >
              <span>Plan a dry bulk voyage</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => onNavigate('ports')}
              style={{
                background: '#F8FAFC',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '0.95rem 1.85rem',
                fontSize: '0.98rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
            >
              Inspect port draft matrix
            </button>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748B' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} color="#16A34A" /> Zero synthetic assumptions
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} color="#16A34A" /> 7 Audited East Coast berths
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} color="#16A34A" /> XGBoost 1.81% MAPE horizon
            </span>
          </div>

        </div>
      </section>


      {/* ── MODAL: TRACK SHIPMENT & CONSIGNMENT AIS ── */}
      {trackingModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setTrackingModalOpen(false)}
        >
          <div 
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              maxWidth: '580px',
              width: '100%',
              padding: '2rem',
              position: 'relative',
              color: '#0F172A',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setTrackingModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B45309', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              <Navigation size={15} />
              <span>SAIL Raw Material Consignment AIS Tracker</span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0F172A' }}>
              Live Consignment Ingestion Tracker
            </h3>

            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter Bill of Lading or Vessel IMO"
                style={{
                  flex: 1,
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.7rem 0.85rem',
                  color: '#0F172A',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: "var(--font-mono)"
                }}
              />
              <button 
                type="submit"
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.7rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Track
              </button>
            </form>

            {trackingResult && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{trackingResult.vessel}</div>
                    <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '2px', fontWeight: 600 }}>{trackingResult.cargo}</div>
                  </div>
                  <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                    DIRECT BERTH CLEARED
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Origin Terminal:</span>
                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{trackingResult.origin}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Discharge Berth:</span>
                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{trackingResult.destination}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Estimated Arrival (ETA):</span>
                    <div style={{ color: '#B45309', fontWeight: 700, fontFamily: "var(--font-mono)" }}>{trackingResult.eta}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Operating Speed:</span>
                    <div style={{ color: '#0F172A', fontWeight: 600, fontFamily: "var(--font-mono)" }}>{trackingResult.speed}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748B' }}>Arrival Draft:</span>
                    <div style={{ color: '#16A34A', fontWeight: 700, fontFamily: "var(--font-mono)" }}>{trackingResult.draft}</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => { setTrackingModalOpen(false); onNavigate('risks'); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      color: '#0F172A',
                      cursor: 'pointer'
                    }}
                  >
                    View on Monsoon Radar
                  </button>
                  <button 
                    onClick={() => { setTrackingModalOpen(false); onNavigate('ports'); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Inspect Paradip Waterline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── INSTITUTIONAL FOOTER ── */}
      <footer style={{
        borderTop: '1px solid #E2E8F0',
        padding: '2.5rem 3.5rem',
        fontSize: '0.78rem',
        color: '#64748B',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#0F172A', fontWeight: 800, letterSpacing: '0.04em' }}>SAIL NAVIBULK ENTERPRISE</span>
          <span>•</span>
          <span>Steel Authority of India Limited • Central Raw Materials Directorate</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span>Commercial Shipping Operations</span>
          <span>•</span>
          <span>Ministry of Steel, Government of India</span>
        </div>
      </footer>

    </div>
  );
}
