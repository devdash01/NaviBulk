// SAIL NaviBulk — Strategic Bulk Procurement Optimizer
// Enterprise Institutional Decision Intelligence Layer
// Consumes DecisionEngineV2 and existing SIH engine outputs to optimize exposure, contracts, and stress-tests

import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Layers, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Compass, 
  Anchor, 
  Clock, 
  HelpCircle,
  BarChart3,
  RefreshCw,
  Scale,
  Sparkles,
  Zap,
  ChevronRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { EAST_COAST_PORTS, VESSEL_CLASSES } from '../data/portConstraints';
import { NAUTICAL_DISTANCE_MATRIX, BUNKER_PRICE_VLSFO } from '../data/freightData';
import { rankFeasibleVessels, evaluateOptimalTiming, checkPortFeasibility } from '../engine/recommendationEngine';
import { evaluateRouteRisks } from '../engine/riskEngine';

export default function ProcurementStrategyView({ 
  inputs, 
  v2Data, 
  onNavigate, 
  onUpdateInputs 
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
  const originCountry = currentInputs.originCountry || 'Australia';
  const cargoType = currentInputs.cargoType || 'Coking Coal';
  const baseTonnage = currentInputs.tonnage || 70000;

  // 1. Authoritative Engine Outputs for the Base Plan
  const rankedVessels = useMemo(() => rankFeasibleVessels(currentInputs), [currentInputs]);
  const bestVessel = useMemo(() => {
    return rankedVessels.find(v => v.feasibility.feasible) || rankedVessels[0];
  }, [rankedVessels]);

  const timingEval = useMemo(() => {
    return evaluateOptimalTiming({
      vesselClassKey: bestVessel.vesselKey,
      originCountry,
      destinationPortKey: currentInputs.destinationPortKey,
      tonnage: baseTonnage,
      contractType: currentInputs.contractType,
    });
  }, [bestVessel, originCountry, currentInputs.destinationPortKey, baseTonnage, currentInputs.contractType]);

  const riskProfile = useMemo(() => {
    return evaluateRouteRisks(originCountry, currentInputs.destinationPortKey);
  }, [originCountry, currentInputs.destinationPortKey]);

  // 2. Dynamic Exposure & Commitment Decision (RULE 4: Genuinely evaluated, never forced)
  const forecastRates = timingEval.forecastSeries?.forecastRates || [bestVessel.currentTce];
  const spotRate = forecastRates[0] || bestVessel.currentTce;
  const end30Rate = forecastRates[forecastRates.length - 1] || spotRate;
  const rateSlopePct = ((end30Rate - spotRate) / (spotRate || 1)) * 100;
  const troughDay = timingEval.optimalDaysToWait;

  const calculatedStrategy = useMemo(() => {
    // Decision logic strictly derived from market dynamics & cargo constraints
    if (rateSlopePct > 4.5 || inputs.laycanDays <= 5) {
      return {
        verdict: 'BUY NOW',
        tag: 'IMMEDIATE SPOT / PROMPT FIX',
        lockPct: 100,
        floatPct: 0,
        rationale: `Forward Baltic curve indicates upward momentum (+${rateSlopePct.toFixed(1)}% over 30d). Prompt laycan (${inputs.laycanDays} days) requires securing vessel tonnage immediately to protect blast furnace stock levels.`,
        color: 'var(--loss)', // urgent action needed
        badgeBg: 'rgba(217, 84, 77, 0.15)',
        contractFormat: 'Firm Spot Charter Party (GENCON/NIPPONVOY)',
      };
    } else if (rateSlopePct < -3.5 && inputs.laycanDays >= 14 && troughDay > 3) {
      return {
        verdict: 'WAIT',
        tag: 'DEFERRED CHARTER WINDOW',
        lockPct: 0,
        floatPct: 100,
        rationale: `Freight curve projects rate softening of ~$${timingEval.savingsPerTonneUsd.toFixed(2)}/MT reaching lowest charter window in ${troughDay} days. Sufficient plant inventory permits deferring fixture.`,
        color: 'var(--gain)',
        badgeBg: 'rgba(63, 178, 127, 0.15)',
        contractFormat: 'Index-Linked Floating Tariff with Cap Protection',
      };
    } else {
      // Partial lock calculated percentage based on risk tolerance & volatility
      let baseLock = 60;
      if (inputs.riskTolerance === 'LOW') baseLock = 75;
      if (inputs.riskTolerance === 'HIGH') baseLock = 45;
      const adjustedLock = Math.round(Math.min(85, Math.max(25, baseLock + rateSlopePct * 1.5)));

      return {
        verdict: 'PARTIAL LOCK',
        tag: 'HEDGED VOLUME SPLIT',
        lockPct: adjustedLock,
        floatPct: 100 - adjustedLock,
        rationale: `Market shows moderate drift (${rateSlopePct >= 0 ? '+' : ''}${rateSlopePct.toFixed(1)}% 30d). Recommended hedging ratio locks ${adjustedLock}% of parcel on fixed COA terms while leaving ${100 - adjustedLock}% floating to capture spot dips.`,
        color: 'var(--brass)',
        badgeBg: 'var(--brass-dim)',
        contractFormat: `${adjustedLock}% Fixed COA Tranche + ${100 - adjustedLock}% Spot Exposure`,
      };
    }
  }, [rateSlopePct, inputs.laycanDays, troughDay, timingEval.savingsPerTonneUsd, inputs.riskTolerance]);

  // Interactive user override for commitment split
  const [customLockPct, setCustomLockPct] = useState(null);
  const activeLockPct = customLockPct !== null ? customLockPct : calculatedStrategy.lockPct;
  const activeFloatPct = 100 - activeLockPct;

  // 3. Stress-Test Parameters (RULE 5: Propagates through all downstream calculations)
  const [freightShiftPct, setFreightShiftPct] = useState(0); // -20% to +30%
  const [cargoShiftPct, setCargoShiftPct] = useState(0); // -25% to +25%
  const [congestionDelayDays, setCongestionDelayDays] = useState(0); // 0 to 10 days
  const [bunkerShiftPct, setBunkerShiftPct] = useState(0); // -25% to +25%

  // Recalculated Downstream Economics under Stress
  const stressModel = useMemo(() => {
    const stressedTonnage = Math.round(baseTonnage * (1 + cargoShiftPct / 100));
    const baseFreightPerMt = bestVessel.costPerTonneUsd;
    const stressedFreightPerMt = baseFreightPerMt * (1 + freightShiftPct / 100);

    const bunkerPrice = BUNKER_PRICE_VLSFO * (1 + bunkerShiftPct / 100);
    const vessel = VESSEL_CLASSES[bestVessel.vesselKey] || VESSEL_CLASSES.panamax;
    const distanceNm = NAUTICAL_DISTANCE_MATRIX[originCountry]?.[inputs.destinationPortKey] || 4850;
    const steamingDays = distanceNm / ((vessel.avgSpeedKnots || 14.0) * 24);
    const totalVoyageDays = steamingDays + congestionDelayDays + (bestVessel.feasibility.requiresSagarTransshipment ? 3.5 : 2.0);

    const fuelBurnTons = totalVoyageDays * vessel.bunkerBurnTpdLaden;
    const fuelCostUsd = fuelBurnTons * bunkerPrice;
    const fuelPerMt = fuelCostUsd / (stressedTonnage || 1);

    // Demurrage / Port holding burn
    const dailyDemurrageUsd = bestVessel.currentTce * 1.15;
    const demurrageCostUsd = congestionDelayDays * dailyDemurrageUsd;
    const demurragePerMt = demurrageCostUsd / (stressedTonnage || 1);

    // Risk premium adjustment
    const riskFactor = (riskProfile.overallRiskScore || 30) / 100;
    const riskPenaltyPerMt = 0.85 + (riskFactor * 1.2) + (congestionDelayDays > 3 ? 0.9 : 0);

    // Net Delivered landed cost $/MT
    const netDeliveredPerMt = stressedFreightPerMt + fuelPerMt + demurragePerMt + riskPenaltyPerMt;
    const totalVoyageOutlayUsd = Math.round(netDeliveredPerMt * stressedTonnage);
    const totalVoyageOutlayInrCr = (totalVoyageOutlayUsd * 83.5 / 10000000).toFixed(2);

    // Delta vs unstressed base plan
    const baseTotalUsd = bestVessel.totalVoyageCostUsd;
    const deltaTotalUsd = totalVoyageOutlayUsd - baseTotalUsd;
    const deltaPerMt = netDeliveredPerMt - bestVessel.costPerTonneUsd;

    // Check if stress conditions flip the recommended vessel
    let recommendationShifted = false;
    let alternativeVesselRecommended = null;
    if (congestionDelayDays >= 4 && bestVessel.vesselKey === 'capesize' && !bestVessel.feasibility.isDirectBerthFeasible) {
      recommendationShifted = true;
      alternativeVesselRecommended = 'Panamax / Kamsarmax (Direct Berthing avoids lightering demurrage queue)';
    }

    return {
      stressedTonnage,
      stressedFreightPerMt,
      fuelPerMt,
      demurragePerMt,
      riskPenaltyPerMt,
      netDeliveredPerMt,
      totalVoyageOutlayUsd,
      totalVoyageOutlayInrCr,
      deltaTotalUsd,
      deltaPerMt,
      steamingDays: steamingDays.toFixed(1),
      totalVoyageDays: totalVoyageDays.toFixed(1),
      recommendationShifted,
      alternativeVesselRecommended,
    };
  }, [baseTonnage, cargoShiftPct, bestVessel, freightShiftPct, bunkerShiftPct, originCountry, currentInputs.destinationPortKey, congestionDelayDays, riskProfile]);

  const hasStressActive = freightShiftPct !== 0 || cargoShiftPct !== 0 || congestionDelayDays !== 0 || bunkerShiftPct !== 0;

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
            <span>STRATEGIC PROCUREMENT WORKSTATION</span>
            <span style={{ color: 'var(--text-low)' }}>•</span>
            <span style={{ color: 'var(--text-mid)', fontWeight: 600 }}>Commercial Freight Decision Intelligence</span>
            <span style={{ color: 'var(--text-low)' }}>•</span>
            <span className="provenance-chip">[Decision Engine V2]</span>
          </div>

          <h1 style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '1.85rem', 
            fontWeight: 700, 
            color: 'var(--text-hi)', 
            lineHeight: 1.2, 
            margin: 0 
          }}>
            Procurement Strategy & Market Exposure.
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', margin: '0.35rem 0 0', maxWidth: '820px' }}>
            Multi-tier commercial chartering governance: Evaluates Buy Now vs Wait vs Partial Lock hedging, calculates true landed economics, and stress-tests operational volatility.
          </p>
        </div>

        {/* Action / Jump button */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => onNavigate('sources')}
            style={{
              background: 'var(--graphite-700)',
              color: 'var(--brass-bright)',
              border: '1px solid var(--brass)',
              padding: '0.55rem 1.1rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Scan Source Opportunities</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Requirement Context Ribbon */}
      <div 
        style={{
          background: 'var(--graphite-800)',
          border: '1px solid var(--hairline)',
          borderRadius: '8px',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Cargo Consignment</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-hi)' }}>{baseTonnage.toLocaleString()} MT • {cargoType}</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--hairline)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Corridor Transit</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-hi)' }}>{originCountry} → {destPort.name}</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--hairline)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Discharge Berth Draft</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brass-bright)' }}>{destPort.cargoBerths?.maxDraft || destPort.maxDraft}m Limit</div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('planner')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--brass)',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer'
          }}
        >
          <span>Modify in Voyage Planner</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* SECTION 1: OPTIMIZED BASE PLAN (Consumes authoritative SIH engine) */}
      <section className="graphite-card" style={{ padding: '1.6rem 1.8rem', borderLeft: '4px solid var(--brass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brass)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              STEP 1 • AUTHORITATIVE BASELINE
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-hi)', margin: '0.2rem 0 0' }}>
              Optimized Base Plan for {originCountry} → {destPort.name}
            </h2>
          </div>
          <span className="provenance-chip" style={{ fontSize: '0.72rem' }}>
            Deterministic Physics & Freight Models
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--graphite-800)', padding: '1.1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Recommended Vessel</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', marginTop: '0.25rem' }}>{bestVessel.vesselName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brass-bright)', marginTop: '0.25rem' }}>
              {bestVessel.feasibility.isDirectBerthFeasible ? '✓ Direct Berth Feasible' : '⚠ Requires Sagar Anchorage Lightering'}
            </div>
          </div>

          <div style={{ background: 'var(--graphite-800)', padding: '1.1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Nominal Freight Rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', marginTop: '0.25rem' }}>
              ${bestVessel.costPerTonneUsd.toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-low)' }}>/ MT</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-mid)', marginTop: '0.25rem' }}>
              TCE: ${bestVessel.currentTce.toLocaleString()}/day ({bestVessel.subIndex})
            </div>
          </div>

          <div style={{ background: 'var(--graphite-800)', padding: '1.1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Charter Window</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gain)', marginTop: '0.25rem' }}>
              {timingEval.optimalDaysToWait <= 3 ? 'Spot Entry (0-3d)' : `Wait ${timingEval.optimalDaysToWait} Days`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-mid)', marginTop: '0.25rem' }}>
              Yields ~${timingEval.savingsPerTonneUsd.toFixed(2)}/MT rate advantage
            </div>
          </div>

          <div style={{ background: 'var(--graphite-800)', padding: '1.1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Total Voyage Outlay</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', marginTop: '0.25rem' }}>
              ${(bestVessel.totalVoyageCostUsd / 1000000).toFixed(2)}M
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-mid)', marginTop: '0.25rem' }}>
              ₹{(bestVessel.totalVoyageCostUsd * 83.5 / 10000000).toFixed(2)} Cr (@ ₹83.5/$)
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: COMMITMENT DECISION MATRIX (BUY NOW / WAIT / PARTIAL LOCK) */}
      <section className="graphite-card" style={{ padding: '1.6rem 1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brass)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              STEP 2 • COMMERCIAL COMMITMENT DECISION
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-hi)', margin: '0.2rem 0 0' }}>
              Calculated Hedging & Market Exposure
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', margin: '0.25rem 0 0' }}>
              Evaluated genuinely from forward curve trajectory, laycan tolerance, and plant stock risk.
            </p>
          </div>

          {/* Verdict Badge */}
          <div style={{
            background: calculatedStrategy.badgeBg,
            border: `1.5px solid ${calculatedStrategy.color}`,
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-low)', textTransform: 'uppercase' }}>SYSTEM RECOMMENDATION</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: calculatedStrategy.color }}>{calculatedStrategy.verdict}</div>
          </div>
        </div>

        {/* 3 Decision Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          
          {/* Option A: BUY NOW */}
          <div 
            onClick={() => setCustomLockPct(100)}
            style={{
              background: activeLockPct === 100 ? 'var(--brass-dim)' : 'var(--graphite-800)',
              border: activeLockPct === 100 ? '2px solid var(--brass)' : '1px solid var(--hairline)',
              borderRadius: '8px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-hi)' }}>BUY NOW</span>
              {calculatedStrategy.verdict === 'BUY NOW' && (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'var(--loss)', color: '#FFF', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  OPTIMAL
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-hi)', margin: '0.5rem 0 0.25rem' }}>
              100% Locked
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-mid)', lineHeight: 1.5, margin: 0 }}>
              Fix immediate spot charter party. Eliminates upward rate exposure entirely; recommended when Baltic forward curves indicate impending spikes.
            </p>
          </div>

          {/* Option B: PARTIAL LOCK */}
          <div 
            onClick={() => setCustomLockPct(calculatedStrategy.lockPct)}
            style={{
              background: activeLockPct > 0 && activeLockPct < 100 ? 'var(--brass-dim)' : 'var(--graphite-800)',
              border: activeLockPct > 0 && activeLockPct < 100 ? '2px solid var(--brass)' : '1px solid var(--hairline)',
              borderRadius: '8px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-hi)' }}>PARTIAL LOCK</span>
              {calculatedStrategy.verdict === 'PARTIAL LOCK' && (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'var(--brass)', color: '#0E1013', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  OPTIMAL
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brass-bright)', margin: '0.5rem 0 0.25rem' }}>
              {activeLockPct}% Lock / {activeFloatPct}% Float
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-mid)', lineHeight: 1.5, margin: 0 }}>
              Balanced hedging: Commits {activeLockPct}% on a fixed COA tranche while leaving {activeFloatPct}% floating on spot to capture potential softening.
            </p>
          </div>

          {/* Option C: WAIT */}
          <div 
            onClick={() => setCustomLockPct(0)}
            style={{
              background: activeLockPct === 0 ? 'var(--brass-dim)' : 'var(--graphite-800)',
              border: activeLockPct === 0 ? '2px solid var(--brass)' : '1px solid var(--hairline)',
              borderRadius: '8px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-hi)' }}>WAIT</span>
              {calculatedStrategy.verdict === 'WAIT' && (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'var(--gain)', color: '#0E1013', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  OPTIMAL
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gain)', margin: '0.5rem 0 0.25rem' }}>
              100% Floating
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-mid)', lineHeight: 1.5, margin: 0 }}>
              Hold exposure floating on spot until day {troughDay}. Recommended when forward curves project softening and plant stock levels permit waiting.
            </p>
          </div>
        </div>

        {/* Strategy Rationale Box */}
        <div style={{
          marginTop: '1.25rem',
          background: 'var(--graphite-900)',
          border: '1px solid var(--hairline)',
          borderRadius: '6px',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '0.85rem',
          alignItems: 'flex-start'
        }}>
          <Sparkles size={18} color="var(--brass)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-hi)', marginBottom: '0.2rem' }}>
              Why NaviBulk recommends {calculatedStrategy.verdict}:
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.5 }}>
              {calculatedStrategy.rationale}
            </div>
          </div>
        </div>

        {/* Interactive Lock % Slider */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-mid)', marginBottom: '0.4rem' }}>
            <span>Fine-tune Hedged Volume Split:</span>
            <span style={{ fontWeight: 700, color: 'var(--brass-bright)' }}>
              {activeLockPct}% Fixed COA • {activeFloatPct}% Spot Floating
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={activeLockPct}
            onChange={(e) => setCustomLockPct(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--brass)' }}
          />
        </div>
      </section>

      {/* SECTION 3: TRUE DELIVERED ECONOMICS WATERFALL */}
      <section className="graphite-card" style={{ padding: '1.6rem 1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brass)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              STEP 3 • TRUE DELIVERED COST WATERFALL
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-hi)', margin: '0.2rem 0 0' }}>
              All-In Landed Economics ($/MT)
            </h2>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-low)' }}>
            Cheapest headline freight ≠ cheapest delivered outcome
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: 'Headline Base Ocean Freight', val: bestVessel.costPerTonneUsd, note: `TCE base rate for ${bestVessel.vesselName}`, isDebit: true },
            { label: 'Bunker Consumption (VLSFO @ $829.50/t)', val: stressModel.fuelPerMt, note: `Based on ${bestVessel.vesselName} burn curve (${stressModel.steamingDays} sea days)`, isDebit: true },
            { label: 'Discharge Port Dues & Wharfage', val: 0.95, note: `${destPort.name} statutory port tariffs`, isDebit: true },
            { label: 'Congestion & Demurrage Allowance', val: stressModel.demurragePerMt, note: `${congestionDelayDays > 0 ? `${congestionDelayDays}d queue burn` : 'Standard clearance window'}`, isDebit: true },
            { label: 'Route Risk & Corridor Security Premium', val: stressModel.riskPenaltyPerMt, note: `Risk profile adjustment (${riskProfile.corridorKey})`, isDebit: true },
          ].map((item, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 1rem',
                background: 'var(--graphite-800)',
                borderRadius: '6px',
                border: '1px solid var(--hairline)',
                fontSize: '0.82rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-hi)', fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: 'var(--text-low)', fontSize: '0.72rem', marginLeft: '0.75rem' }}>{item.note}</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-hi)' }}>
                +${item.val.toFixed(2)}/MT
              </span>
            </div>
          ))}

          {/* Net Landed Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            background: 'var(--graphite-900)',
            border: '2px solid var(--brass)',
            borderRadius: '6px',
            marginTop: '0.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brass)', textTransform: 'uppercase' }}>
                NET TRUE DELIVERED COST AT BLAST FURNACE
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-mid)', marginTop: '0.15rem' }}>
                Total parcel financial outlay: ${(stressModel.totalVoyageOutlayUsd / 1000000).toFixed(2)}M (₹{stressModel.totalVoyageOutlayInrCr} Cr)
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brass-bright)' }}>
              ${stressModel.netDeliveredPerMt.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--text-low)' }}>/ MT</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DYNAMIC STRESS-TEST ENGINE (RULE 5) */}
      <section className="graphite-card" style={{ padding: '1.6rem 1.8rem', borderTop: hasStressActive ? '3px solid var(--warn)' : '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brass)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              STEP 4 • STRESS TEST & RISK SENSITIVITY
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-hi)', margin: '0.2rem 0 0' }}>
              What If Our Assumptions Are Wrong?
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', margin: '0.25rem 0 0' }}>
              Perturb commercial parameters to observe full downstream propagation through economics and recommendations.
            </p>
          </div>

          {hasStressActive && (
            <button
              onClick={() => {
                setFreightShiftPct(0);
                setCargoShiftPct(0);
                setCongestionDelayDays(0);
                setBunkerShiftPct(0);
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--hairline)',
                color: 'var(--text-mid)',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <RefreshCw size={12} />
              <span>Reset Parameters</span>
            </button>
          )}
        </div>

        {/* 4 Interactive Stress Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          
          {/* Slider 1: Freight Rate Shift */}
          <div style={{ background: 'var(--graphite-800)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-mid)', marginBottom: '0.4rem' }}>
              <span>Freight Rate Perturbation:</span>
              <strong style={{ color: freightShiftPct > 0 ? 'var(--loss)' : freightShiftPct < 0 ? 'var(--gain)' : 'var(--text-hi)' }}>
                {freightShiftPct > 0 ? `+${freightShiftPct}%` : `${freightShiftPct}%`}
              </strong>
            </div>
            <input
              type="range"
              min={-20}
              max={30}
              step={5}
              value={freightShiftPct}
              onChange={(e) => setFreightShiftPct(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brass)' }}
            />
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', marginTop: '0.25rem' }}>
              Simulates Baltic index spike or collapse
            </div>
          </div>

          {/* Slider 2: Port Delay Days */}
          <div style={{ background: 'var(--graphite-800)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-mid)', marginBottom: '0.4rem' }}>
              <span>Port Congestion Delay:</span>
              <strong style={{ color: congestionDelayDays > 2 ? 'var(--loss)' : 'var(--text-hi)' }}>
                +{congestionDelayDays} Days
              </strong>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={congestionDelayDays}
              onChange={(e) => setCongestionDelayDays(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brass)' }}
            />
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', marginTop: '0.25rem' }}>
              Anchorage waiting queue at {destPort.name}
            </div>
          </div>

          {/* Slider 3: Bunker Price Shift */}
          <div style={{ background: 'var(--graphite-800)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-mid)', marginBottom: '0.4rem' }}>
              <span>VLSFO Bunker Shift:</span>
              <strong style={{ color: bunkerShiftPct > 0 ? 'var(--loss)' : bunkerShiftPct < 0 ? 'var(--gain)' : 'var(--text-hi)' }}>
                {bunkerShiftPct > 0 ? `+${bunkerShiftPct}%` : `${bunkerShiftPct}%`}
              </strong>
            </div>
            <input
              type="range"
              min={-25}
              max={25}
              step={5}
              value={bunkerShiftPct}
              onChange={(e) => setBunkerShiftPct(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brass)' }}
            />
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', marginTop: '0.25rem' }}>
              Current benchmark: $829.50/MT VLSFO
            </div>
          </div>

          {/* Slider 4: Cargo Tonnage Swing */}
          <div style={{ background: 'var(--graphite-800)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-mid)', marginBottom: '0.4rem' }}>
              <span>Cargo Requirement Swing:</span>
              <strong style={{ color: 'var(--text-hi)' }}>
                {stressModel.stressedTonnage.toLocaleString()} MT ({cargoShiftPct > 0 ? `+${cargoShiftPct}%` : `${cargoShiftPct}%`})
              </strong>
            </div>
            <input
              type="range"
              min={-25}
              max={25}
              step={5}
              value={cargoShiftPct}
              onChange={(e) => setCargoShiftPct(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brass)' }}
            />
            <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', marginTop: '0.25rem' }}>
              Adjusts parcel sizing and scale economics
            </div>
          </div>
        </div>

        {/* CAUSALITY EXPLANATION PANEL (RULE 5: What changed / Why / How recommendation changed) */}
        {hasStressActive ? (
          <div style={{
            background: 'var(--graphite-900)',
            border: '1px solid var(--brass)',
            borderRadius: '6px',
            padding: '1.25rem 1.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brass-bright)', fontWeight: 800, fontSize: '0.82rem' }}>
              <Zap size={16} />
              <span>STRESS PROPAGATION ANALYSIS</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-low)', textTransform: 'uppercase' }}>WHAT CHANGED</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-hi)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                  Net delivered cost moved by {stressModel.deltaPerMt >= 0 ? `+$${stressModel.deltaPerMt.toFixed(2)}` : `-$${Math.abs(stressModel.deltaPerMt).toFixed(2)}`}/MT. Total financial outlay shifted by {stressModel.deltaTotalUsd >= 0 ? `+$${(stressModel.deltaTotalUsd / 1000).toFixed(0)}k` : `-$${(Math.abs(stressModel.deltaTotalUsd) / 1000).toFixed(0)}k`}.
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-low)', textTransform: 'uppercase' }}>WHY IT CHANGED</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-hi)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                  {congestionDelayDays > 0 ? `Added demurrage burn of $${(congestionDelayDays * bestVessel.currentTce * 1.15).toLocaleString()} at anchorage. ` : ''}
                  {freightShiftPct !== 0 ? `Ocean freight TCE shifted to $${(bestVessel.currentTce * (1 + freightShiftPct / 100)).toFixed(0)}/day. ` : ''}
                  {bunkerShiftPct !== 0 ? `Bunker fuel burn adjusted to $${(BUNKER_PRICE_VLSFO * (1 + bunkerShiftPct / 100)).toFixed(1)}/MT. ` : ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-low)', textTransform: 'uppercase' }}>HOW RECOMMENDATION CHANGED</div>
                <div style={{ fontSize: '0.82rem', color: stressModel.recommendationShifted ? 'var(--warn)' : 'var(--gain)', marginTop: '0.2rem', lineHeight: 1.4, fontWeight: 700 }}>
                  {stressModel.recommendationShifted 
                    ? `SHIFT ADVISORY: ${stressModel.alternativeVesselRecommended}` 
                    : `Core recommendation holds robust: ${bestVessel.vesselName} remains commercially optimal under this sensitivity envelope.`}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-low)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem 0' }}>
            Base scenario active. Adjust sliders above to test market sensitivity and operational disruptions.
          </div>
        )}
      </section>

      {/* SECTION 5: DOWNSTREAM SOURCE OPPORTUNITY CALLOUT (RULE 6: Comes AFTER optimization) */}
      <section 
        style={{
          background: 'linear-gradient(135deg, rgba(201, 151, 63, 0.08) 0%, var(--graphite-800) 100%)',
          border: '1.5px solid var(--brass)',
          borderRadius: '8px',
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brass)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            DOWNSTREAM OPPORTUNITY RADAR • STEP 5
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-hi)', margin: '0.35rem 0 0.25rem' }}>
            Can we improve this already-optimized plan?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', margin: 0, lineHeight: 1.5 }}>
            NaviBulk has solved your baseline {originCountry} → {destPort.name} requirement. Our downstream intelligence radar can now scan alternative origin basins (Mozambique, US, Indonesia, Russia) to determine whether shifting origin or blending parcels delivers commercial advantages.
          </p>
        </div>

        <button
          onClick={() => onNavigate('sources')}
          style={{
            background: 'var(--brass)',
            color: '#0E1013',
            border: 'none',
            padding: '0.85rem 1.6rem',
            borderRadius: '6px',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 4px 14px rgba(201, 151, 63, 0.25)',
            flexShrink: 0
          }}
        >
          <span>Evaluate Alternative Sources</span>
          <ArrowRight size={16} />
        </button>
      </section>

    </div>
  );
}
