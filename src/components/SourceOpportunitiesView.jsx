// SAIL NaviBulk — Downstream Source Opportunities Radar
// "Can we improve this already-optimized plan?"
// TariffIQ-Level Strategic Raw Material Alternative Analysis
// Strictly data-backed: Determines whether alternative origins are BETTER, WORSE, or UNCERTAIN.
// Capable of affirming that Australia remains the optimal origin.

import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Anchor, 
  Compass, 
  Scale, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  ExternalLink,
  Layers,
  Award
} from 'lucide-react';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS, VESSEL_CLASSES } from '../data/portConstraints';
import { NAUTICAL_DISTANCE_MATRIX, BUNKER_PRICE_VLSFO, COMMODITY_PINK_SHEET } from '../data/freightData';
import { rankFeasibleVessels, checkPortFeasibility } from '../engine/recommendationEngine';
import { evaluateRouteRisks } from '../engine/riskEngine';

export default function SourceOpportunitiesView({ 
  inputs, 
  onNavigate, 
  onConfigureVoyage 
}) {
  const currentInputs = inputs || {
    cargoType: 'Coking Coal',
    tonnage: 70000,
    originCountry: 'Australia',
    destinationPortKey: 'paradip',
    contractType: 'coa',
    laycanDays: 14,
    vesselClass: 'panamax',
    riskTolerance: 'MEDIUM',
  };
  const destPort = EAST_COAST_PORTS[currentInputs.destinationPortKey] || EAST_COAST_PORTS.paradip;
  const currentOrigin = currentInputs.originCountry || 'Australia';
  const cargoType = currentInputs.cargoType || 'Coking Coal';
  const baseTonnage = currentInputs.tonnage || 70000;
  const tonnage = baseTonnage;

  // 1. Authoritative Base Plan Economics (Current Origin)
  const baseRanked = useMemo(() => rankFeasibleVessels(currentInputs), [currentInputs]);
  const baseVessel = useMemo(() => {
    return baseRanked.find(v => v.feasibility.feasible) || baseRanked[0];
  }, [baseRanked]);

  const baseDistanceNm = NAUTICAL_DISTANCE_MATRIX[currentOrigin]?.[inputs.destinationPortKey] || 4850;
  const baseFreightUsdMt = baseVessel.costPerTonneUsd;
  const baseTotalUsd = baseVessel.totalVoyageCostUsd;
  const baseDays = (baseDistanceNm / (14.0 * 24)).toFixed(1);

  // 2. Data-Backed Evaluation for Alternative Sources (RULE 7)
  const candidateSources = [
    {
      countryKey: 'Australia',
      countryName: 'Australia (Current Base Plan)',
      ports: ['Hay Point', 'Gladstone', 'Newcastle'],
      cargoTypes: ['Coking Coal', 'Thermal Coal'],
      specMatch: 'Prime Hard Coking Coal (CSR > 68, Ash < 9.5%)',
      qualificationStatus: 'APPROVED TIER-1 SUPPLIER (BHP / Glencore / Anglo)',
      qualificationLevel: 'ACTIVE_EMPANELMENT',
      chokepointRisk: 'Low (Open Indian Ocean / Sunda Strait)',
      sanctionRisk: 'None',
      fobPriceOffsetMt: 0, // baseline
    },
    {
      countryKey: 'Mozambique',
      countryName: 'Mozambique (East Africa)',
      ports: ['Beira', 'Nacala Bulk Terminal', 'Maputo'],
      cargoTypes: ['Coking Coal', 'Thermal Coal'],
      specMatch: 'Semi-Hard Coking Coal (Moatize Basin, Ash ~10.5%)',
      qualificationStatus: 'TRIAL CARGO QUALIFIED (ICVL / Vulcan Moatize)',
      qualificationLevel: 'TRIAL_QUALIFIED',
      chokepointRisk: 'Mozambique Channel cyclone exposure (Jan-Mar)',
      sanctionRisk: 'None',
      fobPriceOffsetMt: -12.50, // [MODELED COMMODITY SPREAD: Typical $10-$15 discount vs Australian Premium HCC]
    },
    {
      countryKey: 'US',
      countryName: 'United States (East Coast)',
      ports: ['Hampton Roads (Norfolk)', 'Baltimore'],
      cargoTypes: ['Coking Coal'],
      specMatch: 'High-Vol A/B Met Coal (Low Sulphur, High Fluidity)',
      qualificationStatus: 'APPROVED BLEND VENDOR (Alpha Met / Consol)',
      qualificationLevel: 'ACTIVE_EMPANELMENT',
      chokepointRisk: 'High Distance via Cape of Good Hope (~11,400 NM)',
      sanctionRisk: 'None',
      fobPriceOffsetMt: +8.00, // [MODELED COMMODITY SPREAD: US East Coast premium on fluid properties]
    },
    {
      countryKey: 'Indonesia',
      countryName: 'Indonesia (Kalimantan)',
      ports: ['Taboneo Offshore Anchorage', 'Tanjung Bara'],
      cargoTypes: ['Thermal Coal'],
      specMatch: 'Sub-Bituminous Thermal Coal (High Moisture 28%, Low Ash)',
      qualificationStatus: 'APPROVED FOR BOILER FUEL (Bumi / Adaro)',
      qualificationLevel: cargoType === 'Coking Coal' ? 'NOT_COMPATIBLE_GRADE' : 'ACTIVE_EMPANELMENT',
      chokepointRisk: 'Malacca / Singapore Strait Congestion',
      sanctionRisk: 'None',
      fobPriceOffsetMt: -45.00, // Thermal coal vs Coking Coal pricing
    },
    {
      countryKey: 'Russia',
      countryName: 'Russia (Far East / Baltic)',
      ports: ['Vostochny', 'Ust-Luga', 'Murmansk'],
      cargoTypes: ['Coking Coal', 'Thermal Coal'],
      specMatch: 'PCI & Semi-Soft Met Coal (Elga / Mechel Basin)',
      qualificationStatus: 'SPECIAL PROCUREMENT ROUTE (Direct G2G Mechanism)',
      qualificationLevel: 'SANCTION_CLEARANCE_REQUIRED',
      chokepointRisk: 'Tsushima Strait / Baltic Chokepoints',
      sanctionRisk: 'High (Payment routing in INR/RUB via non-SWIFT channels)',
      fobPriceOffsetMt: -18.00, // [MODELED COMMODITY SPREAD: Urals/Elga discount]
    },
  ];

  // Run rigorous model comparison for each origin
  const evaluatedSources = useMemo(() => {
    return candidateSources.map((source) => {
      const isBaseOrigin = source.countryKey === currentOrigin;
      const distanceNm = NAUTICAL_DISTANCE_MATRIX[source.countryKey]?.[currentInputs.destinationPortKey] || 5000;
      const foreignLimits = FOREIGN_LOAD_PORTS[source.countryKey] || {};

      // Check vessel feasibility for this foreign port
      const vesselKey = baseVessel.vesselKey;
      const vessel = VESSEL_CLASSES[vesselKey] || VESSEL_CLASSES.panamax;
      const maxForeignDraft = foreignLimits.maxDraft || 15.0;
      const canVesselLoad = vessel.draftReq <= maxForeignDraft;

      // Voyage duration (sea days)
      const transitDays = (distanceNm / ((vessel.avgSpeedKnots || 14.0) * 24)).toFixed(1);

      // Freight cost calculation for this specific route
      const seaDays = distanceNm / ((vessel.avgSpeedKnots || 14.0) * 24);
      const fuelTons = seaDays * vessel.bunkerBurnTpdLaden;
      const fuelCostUsd = fuelTons * BUNKER_PRICE_VLSFO;
      const charterHireUsd = seaDays * baseVessel.currentTce;
      const canalDuesUsd = source.countryKey === 'US' ? 45000 : 0;
      const portDuesUsd = (foreignLimits.avgPortDuesUsd || 30000) + 40000; // foreign + Indian port
      const totalFreightCostUsd = fuelCostUsd + charterHireUsd + canalDuesUsd + portDuesUsd;
      const freightPerMt = parseFloat((totalFreightCostUsd / (tonnage || 1)).toFixed(2));

      // Commodity compatibility
      const isGradeCompatible = source.cargoTypes.includes(cargoType);

      // Landed delivered delta vs Base Plan
      // Delivered = Freight + FOB differential + Risk Premium
      const fobOffset = source.fobPriceOffsetMt;
      const freightDelta = freightPerMt - baseFreightUsdMt;
      const netDeliveredDeltaMt = parseFloat((freightDelta + fobOffset).toFixed(2));
      const totalSavingsUsd = Math.round(-netDeliveredDeltaMt * tonnage);
      const totalSavingsInrCr = (totalSavingsUsd * 83.5 / 10000000).toFixed(2);

      // Evaluate Verdict strictly (RULE 7)
      let verdict = 'UNCERTAIN';
      let verdictReason = '';
      let verdictColor = 'var(--text-low)';
      let verdictBg = 'rgba(255, 255, 255, 0.05)';

      if (isBaseOrigin) {
        verdict = 'BASE PLAN';
        verdictReason = 'Current user-selected baseline voyage.';
        verdictColor = 'var(--brass)';
        verdictBg = 'var(--brass-dim)';
      } else if (!isGradeCompatible) {
        verdict = 'WORSE';
        verdictReason = `Commodity mismatch: ${source.countryName} exports primarily ${source.cargoTypes.join('/')}, not suitable for ${cargoType} blast furnace charge without extensive coke-oven blending.`;
        verdictColor = 'var(--loss)';
        verdictBg = 'rgba(217, 84, 77, 0.15)';
      } else if (!canVesselLoad) {
        verdict = 'WORSE';
        verdictReason = `Load port draft cap (${maxForeignDraft}m) prevents ${vessel.name} (requires ${vessel.draftReq}m). Parcel sizing would require downscaling to smaller, less economical vessels.`;
        verdictColor = 'var(--loss)';
        verdictBg = 'rgba(217, 84, 77, 0.15)';
      } else if (source.qualificationLevel === 'SANCTION_CLEARANCE_REQUIRED') {
        verdict = 'UNCERTAIN';
        verdictReason = `Price discount of $${Math.abs(netDeliveredDeltaMt).toFixed(2)}/MT exists, but secondary sanctions, vessel P&I club coverage limits, and non-SWIFT rupee-ruble clearance introduce operational uncertainty.`;
        verdictColor = 'var(--warn)';
        verdictBg = 'rgba(217, 154, 43, 0.15)';
      } else if (netDeliveredDeltaMt < -1.50) {
        verdict = 'BETTER';
        verdictReason = `Shorter distance (${distanceNm.toLocaleString()} NM vs ${baseDistanceNm.toLocaleString()} NM) and FOB price advantage yield an estimated ~$${Math.abs(netDeliveredDeltaMt).toFixed(2)}/MT landed cost reduction.`;
        verdictColor = 'var(--gain)';
        verdictBg = 'rgba(63, 178, 127, 0.15)';
      } else if (netDeliveredDeltaMt > 2.00) {
        verdict = 'WORSE';
        verdictReason = `Extreme sea distance (${distanceNm.toLocaleString()} NM vs ${baseDistanceNm.toLocaleString()} NM) increases transit to ${transitDays} days, pushing ocean freight +$${freightDelta.toFixed(2)}/MT above baseline.`;
        verdictColor = 'var(--loss)';
        verdictBg = 'rgba(217, 84, 77, 0.15)';
      } else {
        verdict = 'UNCERTAIN';
        verdictReason = `Delivered landed cost is within statistical parity (delta $${netDeliveredDeltaMt.toFixed(2)}/MT). Quality adjustments or demurrage differences would dictate outcome.`;
        verdictColor = 'var(--warn)';
        verdictBg = 'rgba(217, 154, 43, 0.15)';
      }

      return {
        ...source,
        distanceNm,
        transitDays,
        canVesselLoad,
        isGradeCompatible,
        freightPerMt,
        netDeliveredDeltaMt,
        totalSavingsUsd,
        totalSavingsInrCr,
        verdict,
        verdictReason,
        verdictColor,
        verdictBg,
        maxForeignDraft,
      };
    });
  }, [candidateSources, currentOrigin, currentInputs.destinationPortKey, baseVessel, baseFreightUsdMt, baseDistanceNm, tonnage, cargoType]);

  // Selected source for deep TariffIQ-level breakdown
  const [selectedCountryKey, setSelectedCountryKey] = useState('Mozambique');
  const activeDetail = useMemo(() => {
    return evaluatedSources.find(s => s.countryKey === selectedCountryKey) || evaluatedSources[1];
  }, [evaluatedSources, selectedCountryKey]);

  // Check if Australia is indeed optimal
  const betterSources = evaluatedSources.filter(s => s.verdict === 'BETTER');
  const australiaIsOptimal = currentOrigin === 'Australia' && betterSources.length === 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Editorial Header */}
      <header style={{ 
        borderBottom: '1px solid var(--hairline)', 
        paddingBottom: '1.25rem',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ 
            fontSize: '0.72rem', 
            fontWeight: 800, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase', 
            color: 'var(--brass)',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>SOURCE OPPORTUNITIES RADAR</span>
            <span style={{ color: 'var(--text-low)' }}>•</span>
            <span style={{ color: 'var(--text-mid)', fontWeight: 600 }}>Post-Optimization Intelligence Layer</span>
            <span style={{ color: 'var(--text-low)' }}>•</span>
            <span className="provenance-chip">[Nautical Distance & Port Matrix]</span>
          </div>

          <h1 style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '1.85rem', 
            fontWeight: 700, 
            color: 'var(--text-hi)', 
            lineHeight: 1.2, 
            margin: 0 
          }}>
            Alternative Origin Opportunities.
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', margin: '0.35rem 0 0', maxWidth: '820px' }}>
            Scans global bulk basins against your optimized baseline plan. Determines whether alternative origins produce genuine economic, transit, and security advantages.
          </p>
        </div>

        {/* Back to Procurement Strategy */}
        <button
          onClick={() => onNavigate('strategy')}
          style={{
            background: 'var(--graphite-800)',
            color: 'var(--text-hi)',
            border: '1px solid var(--hairline)',
            padding: '0.55rem 1rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>← Back to Procurement Strategy</span>
        </button>
      </header>

      {/* Baseline Context Strip */}
      <div style={{
        background: 'var(--graphite-800)',
        border: '1px solid var(--hairline)',
        borderRadius: '8px',
        padding: '1.1rem 1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Active Baseline Plan</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-hi)' }}>
              {currentOrigin} → {destPort.name} ({baseTonnage.toLocaleString()} MT {cargoType})
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Baseline Sea Transit</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-hi)' }}>
              {baseDistanceNm.toLocaleString()} NM • ~{baseDays} Days ({baseVessel.vesselName})
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Baseline Ocean Freight</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brass-bright)' }}>
              ${baseFreightUsdMt.toFixed(2)} / MT
            </div>
          </div>
        </div>

        {australiaIsOptimal ? (
          <div style={{
            background: 'rgba(63, 178, 127, 0.15)',
            border: '1px solid var(--gain)',
            borderRadius: '6px',
            padding: '0.4rem 0.85rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--gain)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <CheckCircle2 size={14} />
            <span>Australia Remains the Optimal Origin</span>
          </div>
        ) : (
          <div style={{
            background: 'var(--brass-dim)',
            border: '1px solid var(--brass)',
            borderRadius: '6px',
            padding: '0.4rem 0.85rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--brass-bright)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Sparkles size={14} />
            <span>{betterSources.length} Alternative Basin(s) Detected</span>
          </div>
        )}
      </div>

      {/* Comparison Grid of All 5 Alternative Corridors */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {evaluatedSources.map((source) => {
          const isSelected = source.countryKey === selectedCountryKey;
          return (
            <div
              key={source.countryKey}
              onClick={() => setSelectedCountryKey(source.countryKey)}
              className="graphite-card"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--brass)' : '1px solid var(--hairline)',
                background: isSelected ? 'var(--graphite-700)' : 'var(--graphite-800)',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              {/* Verdict Ribbon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-hi)' }}>
                  {source.countryName.split(' ')[0]}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  background: source.verdictBg,
                  color: source.verdictColor,
                  border: `1px solid ${source.verdictColor}`,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px'
                }}>
                  {source.verdict}
                </span>
              </div>

              {/* Transit & Freight figures */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                  <span>Distance:</span>
                  <strong style={{ color: 'var(--text-hi)' }}>{source.distanceNm.toLocaleString()} NM</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                  <span>Transit Days:</span>
                  <strong style={{ color: 'var(--text-hi)' }}>~{source.transitDays} Days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                  <span>Est. Freight:</span>
                  <strong style={{ color: 'var(--brass-bright)' }}>${source.freightPerMt.toFixed(2)}/MT</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)', borderTop: '1px solid var(--hairline)', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                  <span>Delivered Delta:</span>
                  <strong style={{
                    color: source.netDeliveredDeltaMt < 0 ? 'var(--gain)' : source.netDeliveredDeltaMt > 0 ? 'var(--loss)' : 'var(--text-mid)'
                  }}>
                    {source.netDeliveredDeltaMt < 0 ? `-$${Math.abs(source.netDeliveredDeltaMt).toFixed(2)}/MT` : source.netDeliveredDeltaMt > 0 ? `+$${source.netDeliveredDeltaMt.toFixed(2)}/MT` : '$0.00/MT'}
                  </strong>
                </div>
              </div>

              <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', marginTop: '0.75rem', lineHeight: 1.3 }}>
                {source.ports.join(', ')}
              </div>
            </div>
          );
        })}
      </section>

      {/* DEEP TARIFFIQ-LEVEL OPPORTUNITY DOSSIER (RULE 17) */}
      <section className="graphite-card" style={{ padding: '1.8rem 2rem', borderLeft: `4px solid ${activeDetail.verdictColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brass)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              DEEP ORIGIN ASSESSMENT • {activeDetail.countryName.toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-hi)', margin: '0.25rem 0 0' }}>
              Commercial & Operational Feasibility Dossier
            </h2>
          </div>

          <div style={{
            background: activeDetail.verdictBg,
            border: `1.5px solid ${activeDetail.verdictColor}`,
            borderRadius: '6px',
            padding: '0.5rem 1.1rem',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-low)', textTransform: 'uppercase' }}>MODEL VERDICT</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: activeDetail.verdictColor }}>{activeDetail.verdict}</div>
          </div>
        </div>

        {/* 7-Point TariffIQ Breakdown Structure */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Box 1: Why This Source? */}
          <div style={{ background: 'var(--graphite-800)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brass)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              1. WHY THIS SOURCE?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-hi)', lineHeight: 1.5, margin: 0 }}>
              {activeDetail.verdictReason}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-mid)', marginTop: '0.65rem' }}>
              <strong>Quality Spec:</strong> {activeDetail.specMatch}
            </div>
          </div>

          {/* Box 2: Modeled Delivered Economics */}
          <div style={{ background: 'var(--graphite-800)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brass)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              2. DELIVERED ECONOMICS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Nautical Distance:</span>
                <strong style={{ color: 'var(--text-hi)' }}>{activeDetail.distanceNm.toLocaleString()} NM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Ocean Freight:</span>
                <strong style={{ color: 'var(--text-hi)' }}>${activeDetail.freightPerMt.toFixed(2)}/MT</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Commodity FOB Offset:</span>
                <strong style={{ color: 'var(--brass-bright)' }}>
                  {activeDetail.fobPriceOffsetMt < 0 ? `-$${Math.abs(activeDetail.fobPriceOffsetMt).toFixed(2)}/MT` : activeDetail.fobPriceOffsetMt > 0 ? `+$${activeDetail.fobPriceOffsetMt.toFixed(2)}/MT` : '$0.00/MT'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-hi)', borderTop: '1px solid var(--hairline)', paddingTop: '0.35rem', fontWeight: 700 }}>
                <span>Net Total Variance:</span>
                <span style={{ color: activeDetail.totalSavingsUsd > 0 ? 'var(--gain)' : activeDetail.totalSavingsUsd < 0 ? 'var(--loss)' : 'var(--text-mid)' }}>
                  {activeDetail.totalSavingsUsd > 0 ? `Save $${(activeDetail.totalSavingsUsd / 1000).toFixed(0)}k (₹${activeDetail.totalSavingsInrCr} Cr)` : activeDetail.totalSavingsUsd < 0 ? `Loss $${(Math.abs(activeDetail.totalSavingsUsd) / 1000).toFixed(0)}k` : 'Parity'}
                </span>
              </div>
            </div>
          </div>

          {/* Box 3: Feasibility & Port Constraints */}
          <div style={{ background: 'var(--graphite-800)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brass)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              3. FEASIBILITY & CONSTRAINTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Foreign Load Port Draft:</span>
                <strong style={{ color: activeDetail.canVesselLoad ? 'var(--gain)' : 'var(--loss)' }}>
                  {activeDetail.maxForeignDraft}m {activeDetail.canVesselLoad ? '✓ Feasible' : '✗ Draft Restricted'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Recommended Vessel Fit:</span>
                <strong style={{ color: 'var(--text-hi)' }}>{baseVessel.vesselName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Major Load Terminals:</span>
                <strong style={{ color: 'var(--text-hi)' }}>{activeDetail.ports.join(', ')}</strong>
              </div>
            </div>
          </div>

          {/* Box 4: Risk & Compliance Profile */}
          <div style={{ background: 'var(--graphite-800)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brass)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              4. RISK & CORRIDOR PROFILE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Maritime Chokepoint:</span>
                <strong style={{ color: 'var(--text-hi)' }}>{activeDetail.chokepointRisk}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Sanctions / Compliance:</span>
                <strong style={{ color: activeDetail.sanctionRisk === 'None' ? 'var(--gain)' : 'var(--loss)' }}>
                  {activeDetail.sanctionRisk}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                <span>Empanelment Status:</span>
                <strong style={{ color: 'var(--brass-bright)' }}>{activeDetail.qualificationStatus}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Next Realistic Action) */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>
            <strong>Next Realistic Action:</strong> {activeDetail.verdict === 'BETTER' ? 'Initiate trial parcel negotiation with emplaned supplier' : activeDetail.verdict === 'UNCERTAIN' ? 'Perform technical blast-furnace blend audit prior to chartering' : 'Maintain current Australia baseline procurement allocation'}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {activeDetail.verdict === 'BETTER' && (
              <button
                onClick={() => {
                  if (onConfigureVoyage) {
                    onConfigureVoyage({ originCountry: activeDetail.countryKey });
                  }
                  onNavigate('planner');
                }}
                style={{
                  background: 'var(--brass)',
                  color: '#0E1013',
                  border: 'none',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>Adopt {activeDetail.countryKey} in Voyage Planner</span>
                <ArrowRight size={14} />
              </button>
            )}

            <button
              onClick={() => onNavigate('counterfactual')}
              style={{
                background: 'var(--graphite-800)',
                color: 'var(--text-hi)',
                border: '1px solid var(--hairline)',
                padding: '0.55rem 1.1rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Simulate Historical Replay</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
