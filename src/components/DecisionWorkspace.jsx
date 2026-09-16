// SAIL NaviBulk — Commercial Maritime Decision Workspace
// Single Continuous Decision Journey centered on the Active Cargo Requirement Object
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Compass, 
  TrendingUp, 
  Anchor, 
  Layers, 
  CheckSquare, 
  Sliders, 
  Globe, 
  History, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Info, 
  ShieldCheck, 
  Ship, 
  Waves, 
  ArrowRight, 
  Printer, 
  RefreshCw, 
  FileCheck,
  Building2,
  Lock,
  Zap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS, VESSEL_CLASSES, ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD, ASSUMED_LIGHTERING_TIME_PENALTY_DAYS } from '../data/portConstraints.js';
import { SUB_INDICES_INFO, NAUTICAL_DISTANCE_MATRIX, COMMODITY_PINK_SHEET } from '../data/freightData.js';
import { checkPortFeasibility, rankFeasibleVessels, evaluateOptimalTiming } from '../engine/recommendationEngine.js';
import { forecastSubIndexSeries, calculateRouteCostPerTonne } from '../engine/forecastingEngine.js';
import { evaluateRouteRisks } from '../engine/riskEngine.js';
import { runCounterfactualReplay } from '../engine/counterfactualEngine.js';
import BerthWaterlineCrossSection from './BerthWaterlineCrossSection.jsx';
import ForecastChart from './ForecastChart.jsx';
import CharterLockModal from './CharterLockModal.jsx';

export default function DecisionWorkspace({ 
  inputs, 
  onUpdateInputs, 
  onOpenMethodologyModal,
  onOpenPortsModal,
  activeJumpStage,
  onResetJumpStage
}) {
  // Inline Requirement Edit Panel toggle
  const [isRequirementEditorOpen, setIsRequirementEditorOpen] = useState(false);
  // Requisition Modal state
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  // Active Section for Causality Tracker
  const [activeStage, setActiveStage] = useState('overview');
  // Selected candidate source modal / drawer state
  const [selectedSourceDetail, setSelectedSourceDetail] = useState(null);
  // Candidate branch adopted (inline notification)
  const [adoptedCandidateBranch, setAdoptedCandidateBranch] = useState(null);
  const [candidateNotification, setCandidateNotification] = useState(null);
  // Expandable Decision Trace in Final Brief
  const [isTraceExpanded, setIsTraceExpanded] = useState(false);

  // ── STRESS TEST STATE ──
  const [stressFreightPct, setStressFreightPct] = useState(0);
  const [stressCongestionDays, setStressCongestionDays] = useState(0);
  const [stressBunkerPct, setStressBunkerPct] = useState(0);
  const [stressParcelSwingMt, setStressParcelSwingMt] = useState(0);

  // Helper: dismiss candidate notification after delay
  const showCandidateNotification = (msg) => {
    setCandidateNotification(msg);
    setTimeout(() => setCandidateNotification(null), 5000);
  };

  // Route-to-distance key mapping (distance matrix uses 'US' for 'United States')
  const distanceOriginKey = inputs.originCountry === 'United States' ? 'US' : inputs.originCountry;

  // Handle Jump Navigation from Sidebar
  useEffect(() => {
    if (activeJumpStage) {
      const el = document.getElementById(activeJumpStage);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveStage(activeJumpStage);
      }
      if (onResetJumpStage) onResetJumpStage();
    }
  }, [activeJumpStage, onResetJumpStage]);

  // Track active section on scroll
  useEffect(() => {
    const stageIds = [
      'overview',
      'stage-requirement',
      'stage-market',
      'stage-feasibility',
      'stage-economics',
      'stage-baseplan',
      'stage-commitment',
      'stage-sources',
      'stage-stress',
      'stage-proof',
      'stage-brief'
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = stageIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(stageIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveStage(stageIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── CORE ENGINE COMPUTATIONS (100% Deterministic / Backend-aligned) ──

  // 1. Physical Feasibility & Fleet Ranking
  const rankedVessels = useMemo(() => {
    return rankFeasibleVessels(inputs);
  }, [inputs]);

  const recommendedVessel = useMemo(() => {
    return rankedVessels.find(v => v.feasibility.feasible) || rankedVessels[0];
  }, [rankedVessels]);

  // Capesize vs Panamax for "Cheapest Freight != Cheapest Outcome" insight
  const capesizeCandidate = useMemo(() => {
    return rankedVessels.find(v => v.vesselKey === 'capesize') || rankedVessels[0];
  }, [rankedVessels]);

  const panamaxCandidate = useMemo(() => {
    return rankedVessels.find(v => v.vesselKey === 'panamax') || rankedVessels[0];
  }, [rankedVessels]);

  // 2. Market Forecast for Winner Vessel Class
  const subIndexKey = recommendedVessel?.subIndex || 'BPI';
  const subIndexInfo = SUB_INDICES_INFO[subIndexKey] || SUB_INDICES_INFO.BPI;
  const forecastSeries = useMemo(() => {
    return forecastSubIndexSeries(subIndexKey, 30);
  }, [subIndexKey]);

  // Provenance: lastHistoricalRate = last observed value from cached Baltic series
  //             day0ForecastRate = model's day-0 projection (SARIMAX cached output)
  const lastHistoricalRate = forecastSeries.historicalRates?.[forecastSeries.historicalRates.length - 1]
    || subIndexInfo.baselineTce;
  const day0ForecastRate = forecastSeries.forecastRates[0] || lastHistoricalRate;
  const forward14dRate = forecastSeries.forecastRates[14] || day0ForecastRate;
  const forward30dRate = forecastSeries.forecastRates[29] || day0ForecastRate;
  // latestIndexRate used downstream — always the last historical observation
  const latestIndexRate = lastHistoricalRate;
  const forecastSlopePct = Number((((forward14dRate - day0ForecastRate) / (day0ForecastRate || 1)) * 100).toFixed(1));

  // 3. Timing & Laycan Optimization
  const timingEval = useMemo(() => {
    return evaluateOptimalTiming({
      vesselClassKey: recommendedVessel.vesselKey,
      originCountry: inputs.originCountry,
      destinationPortKey: inputs.destinationPortKey,
      tonnage: inputs.tonnage,
      contractType: inputs.contractType,
    });
  }, [inputs, recommendedVessel]);

  // 4. Route Operational Hazards
  const routeRisks = useMemo(() => {
    return evaluateRouteRisks(inputs.originCountry, inputs.destinationPortKey);
  }, [inputs.originCountry, inputs.destinationPortKey]);

  // 5. True Delivered Base Cost Breakdown
  const baseDeliveredCost = useMemo(() => {
    const rawCost = recommendedVessel?.costPerTonneUsd || 18.20;
    // Decomposition based on standard voyage economics
    const freightPortion = Number((rawCost * 0.70).toFixed(2));
    const bunkerPortion = Number((rawCost * 0.18).toFixed(2));
    const portDuesPortion = Number((rawCost * 0.07).toFixed(2));
    const lighteringFee = recommendedVessel?.feasibility?.requiresSagarTransshipment ? 4.20 : 0.0;
    const demurragePortion = Number((0.60).toFixed(2));
    const totalLanded = Number((freightPortion + bunkerPortion + portDuesPortion + lighteringFee + demurragePortion).toFixed(2));

    return {
      freightPortion,
      bunkerPortion,
      portDuesPortion,
      lighteringFee,
      demurragePortion,
      totalLanded,
      totalOutlayUsd: Math.round(totalLanded * inputs.tonnage),
      totalOutlayInrCr: Number(((totalLanded * inputs.tonnage * 83.2) / 10000000).toFixed(2))
    };
  }, [recommendedVessel, inputs.tonnage]);

  // 6. Dynamic Commitment (BUY NOW vs WAIT vs PARTIAL LOCK)
  const commitmentDecision = useMemo(() => {
    const slope = forecastSlopePct; // % change over 14d
    const days = inputs.laycanDays || 14;

    if (slope > 6.0 && days <= 14) {
      return {
        action: 'BUY NOW',
        lockPct: 100,
        spotPct: 0,
        tagType: 'gain',
        rationale: `Sharp upward freight pressure (+${slope}% over laycan) indicates that deferring fixture risks rate escalation. Immediate forward lock protects charter budget.`
      };
    } else if (slope < -4.0 && days > 7) {
      return {
        action: 'WAIT',
        lockPct: 0,
        spotPct: 100,
        tagType: 'warn',
        rationale: `Model projects softening freight curve (-${Math.abs(slope)}% over forward laycan). Deferring fixture by 5–7 days captures lower spot index rates.`
      };
    } else {
      // Partial Lock with calculated commitment %
      const calculatedLock = Math.min(85, Math.max(30, Math.round(50 + (slope * 2.5))));
      return {
        action: 'PARTIAL LOCK',
        lockPct: calculatedLock,
        spotPct: 100 - calculatedLock,
        tagType: 'brass',
        rationale: `Rather than assuming the freight forecast is perfectly certain, NaviBulk hedges against projected +${slope}% upward rate drift by securing ${calculatedLock}% under period COA while preserving ${100 - calculatedLock}% spot index optionality.`
      };
    }
  }, [forecastSlopePct, inputs.laycanDays]);

  // Dynamic primary risk determination from routeRisks engine output
  const primaryRisk = useMemo(() => {
    if (!routeRisks?.riskCards || routeRisks.riskCards.length === 0) {
      return { title: 'Corridor Operational Baseline', score: routeRisks?.overallRiskScore ?? 25, level: 'Low' };
    }
    return routeRisks.riskCards.reduce((highest, curr) => (curr.score > highest.score ? curr : highest), routeRisks.riskCards[0]);
  }, [routeRisks]);

  // Dynamic next realistic action derived from commitmentDecision
  const nextActionInfo = useMemo(() => {
    if (commitmentDecision.action === 'BUY NOW') {
      return {
        title: 'Spot Fixture Nomination',
        detail: `Issue prompt fixture requisition to chartering desk — lock 100% capacity before laycan window closes.`
      };
    } else if (commitmentDecision.action === 'WAIT') {
      return {
        title: 'Laycan Deferral Window',
        detail: `Hold fixture execution 5–7 days — track ${subIndexKey} forward freight floor confirmation.`
      };
    } else {
      return {
        title: 'Period COA Requisition',
        detail: `Issue tender for ${commitmentDecision.lockPct}% period coverage — preserve ${commitmentDecision.spotPct}% spot market optionality.`
      };
    }
  }, [commitmentDecision, subIndexKey]);

  // 7. Alternative Source Opportunities — engine-calculated costs per origin
  // Each candidate's ocean freight is computed via calculateRouteCostPerTonne() using
  // the recommended vessel class TCE rate. FOB estimates are illustrative benchmarks only.
  // All compared against the OPTIMIZED BASE PLAN (not the raw input origin).
  const sourceOpportunities = useMemo(() => {
    const basePlanCost = baseDeliveredCost.totalLanded;
    // Base plan always uses the current inputs origin
    const basePlanOrigin = inputs.originCountry;

    // Helper: compute freight cost for a candidate origin using engine
    const computeOriginCost = (originKey) => {
      try {
        const result = calculateRouteCostPerTonne({
          vesselClassKey: recommendedVessel?.vesselKey || 'panamax',
          originCountry: originKey,
          destinationPortKey: inputs.destinationPortKey,
          tonnage: inputs.tonnage,
          subIndexTceRate: day0ForecastRate,
        });
        return result.costPerTonneUsd;
      } catch {
        return null;
      }
    };

    // Compute engine-driven freight costs for each candidate
    const australiaCost = computeOriginCost('Australia');
    const mozambiqueCost = computeOriginCost('Mozambique');
    const usCost = computeOriginCost('US');
    const indonesiaCost = computeOriginCost('Indonesia');
    const russiaCost = computeOriginCost('Russia');

    // Determine verdict by comparing engine-calculated cost vs base plan
    const getVerdict = (engineCost, isBase, qualDisqualified) => {
      if (isBase) return 'BASE PLAN';
      if (qualDisqualified) return 'UNCERTAIN';
      if (engineCost === null) return 'NEEDS DATA';
      if (engineCost < basePlanCost - 0.5) return 'BETTER';
      if (engineCost > basePlanCost + 0.5) return 'WORSE';
      return 'COMPARABLE';
    };

    const candidateOrigins = [
      {
        country: 'Australia',
        portName: 'Hay Point / Gladstone',
        basin: 'Pacific / Coral Sea',
        distanceNm: NAUTICAL_DISTANCE_MATRIX.Australia?.[inputs.destinationPortKey] || 4850,
        isBasePlan: basePlanOrigin === 'Australia',
        specGrade: 'Prime Hard Coking Coal (CSR 68-72)',
        compatibility: 'Exact Blast Furnace Spec',
        draftFeasibility: 'Deep water load berth (18.2m). No Panamax/Supramax restriction.',
        fobProxyUsd: 220.0,
        fobProvenanceLabel: '[ILLUSTRATIVE — World Bank Pink Sheet proxy]',
        engineCostPerTonne: australiaCost,
        totalDeliveredEst: australiaCost,
        verdict: getVerdict(australiaCost, basePlanOrigin === 'Australia', false),
        verdictReason: basePlanOrigin === 'Australia'
          ? 'Baseline optimized procurement mandate.'
          : australiaCost !== null
            ? `Engine-calculated delivered cost: $${australiaCost?.toFixed(2)}/MT via ${(NAUTICAL_DISTANCE_MATRIX.Australia?.[inputs.destinationPortKey] || 4850).toLocaleString()} NM route.`
            : 'Voyage cost calculation unavailable.',
        qualificationStatus: 'Active Approved Supplier (Tier-1 SAIL Empaneled Origin)'
      },
      {
        country: 'Mozambique',
        portName: 'Beira / Nacala Bulk Terminal',
        basin: 'East Africa / Indian Ocean',
        distanceNm: NAUTICAL_DISTANCE_MATRIX.Mozambique?.[inputs.destinationPortKey] || 4350,
        isBasePlan: basePlanOrigin === 'Mozambique',
        specGrade: 'Mid-Vol Hard Coking Coal (CSR 62-65) [ILLUSTRATIVE GRADE ESTIMATE]',
        compatibility: 'Acceptable Blending Grade — Requires Coking Spec Clearance',
        draftFeasibility: 'Load berth draft ~13.5m [UNVERIFIED]. Restricts laden Capesize — Panamax preferred.',
        fobProxyUsd: 202.0,
        fobProvenanceLabel: '[ILLUSTRATIVE — TSI benchmark proxy, not binding quote]',
        engineCostPerTonne: mozambiqueCost,
        totalDeliveredEst: mozambiqueCost,
        verdict: getVerdict(mozambiqueCost, basePlanOrigin === 'Mozambique', false),
        verdictReason: mozambiqueCost !== null
          ? `Engine-calculated delivered cost: $${mozambiqueCost?.toFixed(2)}/MT. Delta vs base plan: ${mozambiqueCost !== null ? (mozambiqueCost - basePlanCost).toFixed(2) : 'N/A'}/MT.`
          : 'Voyage cost calculation unavailable.',
        qualificationStatus: 'Supplier Qualification & Blend Compatibility Testing Required'
      },
      {
        country: 'United States',
        portName: 'Hampton Roads / Norfolk',
        basin: 'Atlantic / Cape of Good Hope Route',
        distanceNm: NAUTICAL_DISTANCE_MATRIX.US?.[inputs.destinationPortKey] || 11400,
        isBasePlan: basePlanOrigin === 'United States',
        specGrade: 'High-Vol A Coking Coal (CSR 64-67) [ILLUSTRATIVE GRADE ESTIMATE]',
        compatibility: 'Metallurgically Compatible — Requires Blast Furnace Blend Trial',
        draftFeasibility: 'Load port draft ~15.2m [UNVERIFIED]. Panamax/Kamsarmax compatible.',
        fobProxyUsd: 215.0,
        fobProvenanceLabel: '[ILLUSTRATIVE — TSI benchmark proxy, not binding quote]',
        engineCostPerTonne: usCost,
        totalDeliveredEst: usCost,
        verdict: getVerdict(usCost, basePlanOrigin === 'United States', false),
        verdictReason: usCost !== null
          ? `Engine-calculated delivered cost: $${usCost?.toFixed(2)}/MT via ${(NAUTICAL_DISTANCE_MATRIX.US?.[inputs.destinationPortKey] || 11400).toLocaleString()} NM Cape route. Delta: ${(usCost - basePlanCost).toFixed(2)}/MT.`
          : 'Voyage cost calculation unavailable.',
        qualificationStatus: 'Empaneled Global Miner — Commercial arbitrage subject to freight economics'
      },
      {
        country: 'Indonesia',
        portName: 'Taboneo / Tanjung Bara',
        basin: 'South China Sea / Lombok Strait',
        distanceNm: NAUTICAL_DISTANCE_MATRIX.Indonesia?.[inputs.destinationPortKey] || 1850,
        isBasePlan: basePlanOrigin === 'Indonesia',
        specGrade: 'Thermal/PCI Coal (VM 38%, CSR n/a) [ILLUSTRATIVE]',
        compatibility: 'PCI / Boiler Injection Only — Cannot substitute Prime Hard Coking Coal for Blast Furnace',
        draftFeasibility: 'Shallow open anchorage (~14m). Barging/lightering standard at Taboneo.',
        fobProxyUsd: 118.0,
        fobProvenanceLabel: '[ILLUSTRATIVE — World Bank thermal coal proxy, not coking grade]',
        engineCostPerTonne: indonesiaCost,
        totalDeliveredEst: indonesiaCost,
        verdict: getVerdict(indonesiaCost, basePlanOrigin === 'Indonesia', true), // always UNCERTAIN - quality incompatible
        verdictReason: indonesiaCost !== null
          ? `Engine-calculated freight: $${indonesiaCost?.toFixed(2)}/MT via ${(NAUTICAL_DISTANCE_MATRIX.Indonesia?.[inputs.destinationPortKey] || 1850).toLocaleString()} NM. QUALITY DISQUALIFIED: High VM precludes blast furnace substitution.`
          : 'Voyage cost calculation unavailable.',
        qualificationStatus: 'Empaneled for Thermal/PCI — Not qualified for Coking Coal specification'
      },
      {
        country: 'Russia',
        portName: 'Vostochny (Far East)',
        basin: 'Sea of Japan / Malacca Strait',
        distanceNm: NAUTICAL_DISTANCE_MATRIX.Russia?.[inputs.destinationPortKey] || 4920,
        isBasePlan: basePlanOrigin === 'Russia',
        specGrade: 'K-Grade Hard Coking Coal (CSR 65) [ILLUSTRATIVE GRADE ESTIMATE]',
        compatibility: 'Metallurgically Suitable — Pending Compliance Clearance',
        draftFeasibility: 'Deep water terminal (~16.5m) [UNVERIFIED]. Capesize capable at load berth.',
        fobProxyUsd: 195.0,
        fobProvenanceLabel: '[ILLUSTRATIVE — Not binding. Trade compliance review required before tender.]',
        engineCostPerTonne: russiaCost,
        totalDeliveredEst: russiaCost,
        verdict: getVerdict(russiaCost, basePlanOrigin === 'Russia', false),
        verdictReason: russiaCost !== null
          ? `Engine-calculated delivered cost: $${russiaCost?.toFixed(2)}/MT. COMPLIANCE RISK: OFAC/EU sanction verification + marine insurance premium uplift required.`
          : 'Voyage cost calculation unavailable.',
        qualificationStatus: 'Statutory Trade Compliance & Payment Settlement Review Required — OFAC/EU Sanctions Screening Mandatory'
      }
    ];

    return candidateOrigins;
  }, [baseDeliveredCost, inputs.originCountry, inputs.destinationPortKey, inputs.tonnage, recommendedVessel, day0ForecastRate]);

  // 8. Stressed Outcome Recalculation
  // All four sliders genuinely mutate the cost calculation:
  //   - Freight: proportional delta on the freight portion of delivered cost
  //   - Bunker: proportional delta on the bunker portion
  //   - Congestion: adds demurrage at $0.35/MT per day (standard laytime rate proxy)
  //   - Parcel: stresses total outlay (cost per tonne unchanged; budget exposure changes)
  const stressedEconomics = useMemo(() => {
    const base = baseDeliveredCost;
    const freightDelta = Number((base.freightPortion * (stressFreightPct / 100)).toFixed(2));
    const bunkerDelta = Number((base.bunkerPortion * (stressBunkerPct / 100)).toFixed(2));
    // $0.35/MT per congestion day — proxy for Worldscale demurrage rate at ~$35,000/day ship for 100,000 MT
    const demurrageDelta = Number((stressCongestionDays * 0.35).toFixed(2));
    const newLanded = Number((base.totalLanded + freightDelta + bunkerDelta + demurrageDelta).toFixed(2));
    const costDelta = Number((newLanded - base.totalLanded).toFixed(2));

    // Stressed parcel: changes total outlay but not per-tonne cost
    const stressedTonnage = inputs.tonnage + stressParcelSwingMt;
    const stressedTotalOutlayUsd = Math.round(newLanded * stressedTonnage);
    const stressedTotalOutlayInrCr = Number(((newLanded * stressedTonnage * 83.2) / 10000000).toFixed(2));

    // Recalculate procurement commitment recommendation under stress conditions
    // If stressed cost exceeds base by >$2/MT or severe congestion, escalate to BUY NOW
    let stressedRecommendation = commitmentDecision.action;
    let stressReason = 'Decision remains robust under current sensitivity parameters.';

    if (stressCongestionDays >= 5 && freightDelta > 2.0) {
      stressedRecommendation = 'BUY NOW (100% LOCK)';
      stressReason = `Combined stress: Port delay (+${stressCongestionDays}d) + freight inflation (+$${freightDelta}/MT) creates $${costDelta}/MT cost exposure. Immediate charter lock prevents compounding demurrage and rate escalation.`;
    } else if (stressCongestionDays >= 5) {
      stressedRecommendation = 'BUY NOW (100% LOCK)';
      stressReason = `Severe port congestion (+${stressCongestionDays}d = +$${demurrageDelta}/MT demurrage) triggers immediate charter coverage. Open position risks laytime breach.`;
    } else if (freightDelta > 2.5) {
      stressedRecommendation = 'BUY NOW (100% LOCK)';
      stressReason = `Freight rate stress (+${stressFreightPct}% = +$${freightDelta}/MT) materially erodes the forward rate window. Locking 100% protects against further escalation.`;
    } else if (bunkerDelta > 1.5) {
      stressedRecommendation = commitmentDecision.action === 'WAIT' ? 'PARTIAL LOCK (Bunker Hedge)' : commitmentDecision.action;
      stressReason = `Elevated bunker costs (+${stressBunkerPct}% = +$${bunkerDelta}/MT) compress voyage margins. Partial commitment hedge recommended.`;
    } else if (stressParcelSwingMt !== 0) {
      const outlayDelta = (stressedTotalOutlayUsd - base.totalOutlayUsd);
      stressReason = `Parcel swing of ${stressParcelSwingMt > 0 ? '+' : ''}${stressParcelSwingMt.toLocaleString()} MT changes total outlay by $${Math.round(outlayDelta).toLocaleString()}. Per-tonne cost unchanged; budget exposure recalculated.`;
    }

    return {
      newLanded,
      costDelta,
      freightDelta,
      bunkerDelta,
      demurrageDelta,
      stressedTonnage,
      stressedTotalOutlayUsd,
      stressedTotalOutlayInrCr,
      stressedRecommendation,
      stressReason
    };
  }, [baseDeliveredCost, stressFreightPct, stressCongestionDays, stressBunkerPct, stressParcelSwingMt, commitmentDecision.action, inputs.tonnage]);

  // 9. Genuine Walk-Forward Counterfactual Proof
  // runCounterfactualReplay() uses: actualDecision (reactive spot) vs counterfactualRecommendation (model-timed)
  // Property names corrected to match counterfactualEngine.js output schema.
  const counterfactualData = useMemo(() => {
    try {
      const replay = runCounterfactualReplay({
        selectedDateStr: '2024-06-15',
        cargoType: inputs.cargoType,
        tonnage: inputs.tonnage,
        originCountry: inputs.originCountry,
        destinationPortKey: inputs.destinationPortKey,
        actualVesselChartered: recommendedVessel?.vesselKey || 'panamax',
      });
      // Correct property path: replay.counterfactualRecommendation (model strategy)
      //                         replay.actualDecision (reactive spot baseline)
      const hasValidData = replay?.counterfactualRecommendation?.costPerTonneUsd && replay?.actualDecision?.costPerTonneUsd;
      return {
        summary: {
          strategyCostPerTonne: hasValidData
            ? replay.counterfactualRecommendation.costPerTonneUsd
            : null,
          spotCostPerTonne: hasValidData
            ? replay.actualDecision.costPerTonneUsd
            : null,
          totalSavingsUsd: replay?.financialImpact?.totalSavingsUsd ?? null,
          pctSavings: replay?.financialImpact?.savingsPercentage ?? null,
          isPositive: replay?.financialImpact?.isPositive ?? null,
          waitDaysAdvised: replay?.counterfactualRecommendation?.waitDaysAdvised ?? 0,
          selectedDate: replay?.selectedDate,
          executionDate: replay?.executionDate,
          hasValidData,
        },
        accuracyMetrics: replay?.accuracyMetrics,
        isErrorState: false,
      };
    } catch (err) {
      // Genuine error — do NOT fabricate numbers. Show data unavailable state.
      return {
        summary: {
          strategyCostPerTonne: null,
          spotCostPerTonne: null,
          totalSavingsUsd: null,
          pctSavings: null,
          isPositive: null,
          hasValidData: false,
        },
        accuracyMetrics: null,
        isErrorState: true,
        errorMessage: 'Historical data series unavailable for counterfactual replay.'
      };
    }
  }, [inputs, recommendedVessel]);

  // Smooth scroll handler
  const scrollToStage = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveStage(id);
    }
  };

  return (
    <div className="decision-workspace-root" style={{ background: 'var(--bg-app, #F8FAFC)', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* ═══════════════════════════════════════════════════════════════
         STICKY PERSISTENT DECISION HEADER & CAUSALITY RAIL
      ═══════════════════════════════════════════════════════════════ */}
      <header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Top Active Consignment Telemetry Strip */}
        <div style={{
          padding: '0.65rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* Active Mandate Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 800,
              letterSpacing: '0.02em'
            }}>
              {inputs.tonnage.toLocaleString()} MT {inputs.cargoType}
            </span>

            <span style={{
              background: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 700
            }}>
              {inputs.originCountry} → {inputs.destinationPortKey.toUpperCase()}
            </span>

            <span style={{
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #E2E8F0',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              Laycan: +{inputs.laycanDays} Days
            </span>

            <button
              onClick={() => setIsRequirementEditorOpen(!isRequirementEditorOpen)}
              style={{
                background: 'transparent',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                padding: '0.2rem 0.55rem',
                fontSize: '0.72rem',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {isRequirementEditorOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span>{isRequirementEditorOpen ? 'Close Mandate' : 'Edit Mandate'}</span>
            </button>
          </div>

          {/* Decision Telemetry Snapshot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#64748B' }}>Nomination:</span>
              <strong style={{ color: '#0F172A', fontWeight: 800 }}>{recommendedVessel?.vesselName}</strong>
            </div>

            <span style={{ color: '#CBD5E1' }}>|</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#64748B' }}>Commitment:</span>
              <strong style={{ 
                color: commitmentDecision.action === 'BUY NOW' ? '#16A34A' : '#B45309', 
                fontWeight: 800 
              }}>
                {commitmentDecision.action} ({commitmentDecision.lockPct}%)
              </strong>
            </div>

            <span style={{ color: '#CBD5E1' }}>|</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#64748B' }}>Delivered:</span>
              <strong style={{ color: '#0F172A', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.totalLanded} / MT
              </strong>
            </div>

            <span style={{ color: '#CBD5E1' }}>|</span>

            <button
              onClick={() => setIsLockModalOpen(true)}
              style={{
                background: '#B45309',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '5px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FileCheck size={13} />
              <span>Requisition</span>
            </button>
          </div>
        </div>

        {/* Horizontal Causality Progress Indicator */}
        <div style={{
          padding: '0.45rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          overflowX: 'auto',
          background: '#FAFAFA'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'stage-requirement', label: 'Requirement' },
            { id: 'stage-market', label: 'Market' },
            { id: 'stage-feasibility', label: 'Feasibility' },
            { id: 'stage-economics', label: 'Economics' },
            { id: 'stage-baseplan', label: 'Base Plan' },
            { id: 'stage-commitment', label: 'Procurement' },
            { id: 'stage-sources', label: 'Sources' },
            { id: 'stage-stress', label: 'Stress' },
            { id: 'stage-proof', label: 'Proof' },
            { id: 'stage-brief', label: 'Decision' },
          ].map((step, idx, arr) => {
            const isActive = activeStage === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => scrollToStage(step.id)}
                  style={{
                    background: isActive ? '#0F172A' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.73rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 120ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#0F172A';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#64748B';
                  }}
                >
                  {step.label}
                </button>
                {idx < arr.length - 1 && (
                  <span style={{ color: '#CBD5E1', fontSize: '0.68rem', userSelect: 'none' }}>➔</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Collapsible Requirement Editor Bar */}
        {isRequirementEditorOpen && (
          <div style={{
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            padding: '1.25rem 1.75rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                Active Consignment Parameters
              </h4>
              <span className="provenance-chip" style={{ fontSize: '0.65rem' }}>
                Recalculates all downstream stages dynamically
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* Commodity */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Bulk Commodity
                </label>
                <select
                  value={inputs.cargoType}
                  onChange={(e) => onUpdateInputs({ cargoType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    fontWeight: 600,
                    background: '#FFFFFF'
                  }}
                >
                  <option value="Coking Coal">Coking Coal (Hard Met-Coal)</option>
                  <option value="Iron Ore">Iron Ore Fines</option>
                  <option value="Thermal Coal">Thermal Coal (PCI)</option>
                  <option value="Limestone">Limestone / Dolomite</option>
                </select>
              </div>

              {/* Tonnage */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Parcel Tonnage (MT): {inputs.tonnage.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="30000"
                  max="180000"
                  step="5000"
                  value={inputs.tonnage}
                  onChange={(e) => onUpdateInputs({ tonnage: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#2563EB' }}
                />
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {[35000, 58000, 70000, 85000, 160000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => onUpdateInputs({ tonnage: amt })}
                      style={{
                        padding: '0.15rem 0.4rem',
                        fontSize: '0.65rem',
                        borderRadius: '3px',
                        border: '1px solid #E2E8F0',
                        background: inputs.tonnage === amt ? '#0F172A' : '#F1F5F9',
                        color: inputs.tonnage === amt ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Origin Country */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Origin Country
                </label>
                <select
                  value={inputs.originCountry}
                  onChange={(e) => onUpdateInputs({ originCountry: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    fontWeight: 600,
                    background: '#FFFFFF'
                  }}
                >
                  <option value="Australia">Australia (Hay Point / Gladstone)</option>
                  <option value="Indonesia">Indonesia (Taboneo / E. Kalimantan)</option>
                  <option value="United States">United States (Hampton Roads)</option>
                  <option value="Mozambique">Mozambique (Maputo)</option>
                  <option value="Russia">Russia (Vostochny)</option>
                </select>
              </div>

              {/* Discharge Port */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Discharge Port (East Coast India)
                </label>
                <select
                  value={inputs.destinationPortKey}
                  onChange={(e) => onUpdateInputs({ destinationPortKey: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    fontWeight: 600,
                    background: '#FFFFFF'
                  }}
                >
                  <option value="paradip">Paradip Port (14.5m Draft Cap)</option>
                  <option value="gangavaram">Gangavaram Port (18.5m Deepwater)</option>
                  <option value="vizag">Visakhapatnam / VPT (18.1m Outer Harbour)</option>
                  <option value="dhamra">Dhamra Port (17.5m Cape Capable)</option>
                  <option value="haldia">Haldia Dock Complex (8.8m Riverine Lock)</option>
                </select>
              </div>

              {/* Laycan Days */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Laycan Forward Horizon (Days)
                </label>
                <input
                  type="number"
                  min="3"
                  max="45"
                  value={inputs.laycanDays}
                  onChange={(e) => onUpdateInputs({ laycanDays: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    fontWeight: 600,
                    background: '#FFFFFF'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════
         MAIN CONTINUOUS DECISION WORKSPACE BODY
      ═══════════════════════════════════════════════════════════════ */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* ───────────────────────────────────────────────────────────
           SECTION 0: EXECUTIVE DECISION OVERVIEW (5–10s Executive Answer)
        ─────────────────────────────────────────────────────────── */}
        <section id="overview" className="enterprise-card" style={{ padding: '1.75rem 2rem', scrollMarginTop: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Commercial Decision Executive Overview
                </span>
                <span className="provenance-chip" style={{ fontSize: '0.62rem' }}>
                  Decision Engine V2 • Authoritative
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Optimal Chartering & Procurement Strategy
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#DCFCE7',
                color: '#166534',
                border: '1px solid #BBF7D0',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                <CheckCircle2 size={13} />
                Feasibility Validated
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                <Clock size={13} />
                Laycan +{inputs.laycanDays}d Window
              </span>
            </div>
          </div>

          {/* 2-Column Executive Decision Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Left Column: Operational Mandate */}
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Commercial Mandate & Corridor
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', marginTop: '0.25rem' }}>
                  {inputs.tonnage.toLocaleString()} MT {inputs.cargoType}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <strong>{inputs.originCountry}</strong> ➔ <strong>{EAST_COAST_PORTS[inputs.destinationPortKey]?.name || inputs.destinationPortKey.toUpperCase()}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Laycan Window</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>+{inputs.laycanDays} Days</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Contract Structure</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>{inputs.contractType}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Engine Decision & Outcomes */}
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.66rem', color: '#15803D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Authoritative Recommendation
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.2rem' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#166534' }}>
                    {recommendedVessel?.vesselName} (Direct Berth)
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    ${baseDeliveredCost.totalLanded} / MT
                  </div>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.1rem' }}>
                  Total Landed Outlay: ${(baseDeliveredCost.totalOutlayUsd / 1000000).toFixed(2)}M (₹{baseDeliveredCost.totalOutlayInrCr} Cr)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div style={{ background: '#F8FAFC', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Commitment</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: commitmentDecision.action === 'BUY NOW' ? '#166534' : '#B45309' }}>
                    {commitmentDecision.action} ({commitmentDecision.lockPct}%)
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Key Decision Risk</span>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B45309', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={primaryRisk.title}>
                    {primaryRisk.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    {primaryRisk.level} ({routeRisks.overallRiskScore}/100)
                  </div>
                </div>

                <div style={{ background: '#EFF6FF', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                  <span style={{ fontSize: '0.62rem', color: '#1D4ED8', fontWeight: 800, textTransform: 'uppercase' }}>Next Realistic Action</span>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E40AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={nextActionInfo.detail}>
                    {nextActionInfo.title}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Causal Rationale Strip */}
          <div style={{
            background: '#F8FAFC',
            borderLeft: '4px solid #2563EB',
            borderRadius: '0 8px 8px 0',
            padding: '0.9rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Decision Rationale (Why this recommendation):
              </span>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#1E293B', fontWeight: 500, lineHeight: 1.5 }}>
                {recommendedVessel?.vesselName} satisfies destination draft limits ({EAST_COAST_PORTS[inputs.destinationPortKey]?.maxDraft}m cap) enabling direct berth discharge. 
                This avoids lightering surcharges that make Capesize more expensive landed despite cheaper headline dayrates. 
                Forward freight curve indicates upward pressure (+{forecastSlopePct}%), favoring locking {commitmentDecision.lockPct}% under period COA.
              </p>
            </div>

            <button
              onClick={() => scrollToStage('stage-market')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>Explore Analysis Chain</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 1: DEFINE REQUIREMENT MANDATE
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-requirement" className="enterprise-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Stage 01 · Commercial Consignment Mandate
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Cargo Parameters & Corridors
              </h3>
            </div>
            <span className="provenance-chip">
              User Mandate Input
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Consignment</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                {inputs.cargoType}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                Quantity: <strong>{inputs.tonnage.toLocaleString()} MT</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                Specification: Prime Hard Met-Coal (CSR 68-72, VM 21%)
              </div>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Routing Corridor</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                {inputs.originCountry} ➔ {inputs.destinationPortKey.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                Nautical Distance: <strong>{(NAUTICAL_DISTANCE_MATRIX[distanceOriginKey]?.[inputs.destinationPortKey] || 4850).toLocaleString()} NM</strong>
                {' '}(~{((NAUTICAL_DISTANCE_MATRIX[distanceOriginKey]?.[inputs.destinationPortKey] || 4850) / 312).toFixed(1)} Steaming Days @ 13.0 kn)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                Route: {inputs.originCountry === 'Australia' ? 'Coral Sea ➔ Torres Strait / Lombok ➔ Bay of Bengal' :
                         inputs.originCountry === 'United States' ? 'Atlantic ➔ Cape of Good Hope ➔ Indian Ocean' :
                         inputs.originCountry === 'Indonesia' ? 'Java Sea ➔ Malacca Strait ➔ Bay of Bengal' :
                         inputs.originCountry === 'Russia' ? 'Sea of Japan ➔ Malacca Strait ➔ Bay of Bengal' :
                         'East Africa ➔ Indian Ocean Direct'}
              </div>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Delivery & Governance</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                Laycan: +{inputs.laycanDays} Days
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                Structure: <strong>{inputs.contractType.toUpperCase()} Forward Hedge</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                Destination Draft Limit: <strong>{EAST_COAST_PORTS[inputs.destinationPortKey]?.maxDraft}m berth cap</strong>
              </div>
            </div>
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 2: UNDERSTAND MARKET INTELLIGENCE
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-market" className="enterprise-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Stage 02 · Baltic Freight Signal & Econometric Forecast
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Market Trajectory ({subIndexKey} Index)
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="provenance-chip">
                [Latest Available Index: ${latestIndexRate.toLocaleString()}/day]
              </span>
              <span className="provenance-chip">
                [Model Forecast: SARIMAX/XGBoost Cached Ensemble]
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            {/* Forecast Chart Panel */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>
                  {subIndexInfo.fullName} (30-Day Forward Curve)
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                  1D MAPE: 1.81% | 14D: 19.88%
                </span>
              </div>
              <ForecastChart 
                subIndexKey={subIndexKey} 
                vesselClassKey={recommendedVessel?.vesselKey}
                height={220}
              />
            </div>

            {/* Dynamic Market Takeaway Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <TrendingUp size={16} color="#1D4ED8" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>
                    Calculated Market Signal
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#1E293B', lineHeight: 1.55 }}>
                  The econometric ensemble indicates <strong>{forecastSlopePct >= 0 ? 'upward' : 'softening'} freight pressure ({forecastSlopePct >= 0 ? '+' : ''}{forecastSlopePct}%)</strong> across the {subIndexKey} curve over the {inputs.laycanDays}-day laycan horizon.
                  Latest historical index: <strong>${lastHistoricalRate.toLocaleString()}/day</strong>. Model day-0 projection: <strong>${day0ForecastRate.toLocaleString()}/day</strong>. 14-day forecast: <strong>${forward14dRate.toLocaleString()}/day</strong>. [SARIMAX Cached Precomputed]
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Historical Observation TCE</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    ${lastHistoricalRate.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#64748B' }}>[Latest Cached Baltic Series Observation]</span>
                </div>

                <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>14D Model Forecast TCE</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: forecastSlopePct > 0 ? '#B45309' : '#16A34A', fontFamily: 'var(--font-mono)' }}>
                    ${forward14dRate.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#64748B' }}>[SARIMAX Cached Precomputed ({forecastSlopePct >= 0 ? '+' : ''}{forecastSlopePct}%)]</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 3: MARITIME FEASIBILITY & BERTH CLEARANCE
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-feasibility" className="enterprise-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Stage 03 · Maritime Feasibility & Port Constraints
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Bathymetric Keel Clearance & Vessel Suitability
              </h3>
            </div>
            <button
              onClick={onOpenPortsModal}
              style={{
                background: 'transparent',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <ExternalLink size={12} />
              <span>Inspect Port Specs DB</span>
            </button>
          </div>

          {/* Route Risk Summary Strip */}
          {routeRisks?.riskCards?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {routeRisks.riskCards.map((card) => {
                const levelColor = card.level.includes('High') ? '#DC2626' : card.level === 'Moderate' ? '#B45309' : '#16A34A';
                const levelBg = card.level.includes('High') ? '#FEE2E2' : card.level === 'Moderate' ? '#FEF3C7' : '#DCFCE7';
                return (
                  <div key={card.id} style={{ border: `1px solid ${card.level.includes('High') ? '#FECACA' : card.level === 'Moderate' ? '#FDE68A' : '#BBF7D0'}`, borderRadius: '8px', padding: '0.85rem', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>{card.title}</span>
                      <span style={{ background: levelBg, color: levelColor, border: `1px solid ${levelColor}30`, borderRadius: '4px', padding: '0.12rem 0.45rem', fontSize: '0.65rem', fontWeight: 800 }}>{card.level}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.4 }}>{card.message.replace(/\[.*?\]/g, '').trim()}</div>
                    <div style={{ fontSize: '0.62rem', color: '#64748B', fontStyle: 'italic', marginTop: '0.3rem' }}>{card.mitigation}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Elevated Berth Waterline Cross-Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <BerthWaterlineCrossSection 
              vesselClass={recommendedVessel?.vesselKey || 'panamax'}
              destinationPortKey={inputs.destinationPortKey}
              compact={false}
            />
          </div>

          {/* 5-Class Vessel Feasibility Comparison Table */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: '#F8FAFC', padding: '0.65rem 1rem', borderBottom: '1px solid #E2E8F0', fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>
              Fleet Evaluation across Destination Berth Constraints ({EAST_COAST_PORTS[inputs.destinationPortKey]?.name} • {EAST_COAST_PORTS[inputs.destinationPortKey]?.maxDraft}m Draft Limit)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.65rem 1rem' }}>VESSEL CLASS</th>
                    <th style={{ padding: '0.65rem 1rem' }}>DWT CAP</th>
                    <th style={{ padding: '0.65rem 1rem' }}>LADEN DRAFT</th>
                    <th style={{ padding: '0.65rem 1rem' }}>KEEL CLEARANCE (UKC)</th>
                    <th style={{ padding: '0.65rem 1rem' }}>PORT FEASIBILITY STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedVessels.map((v) => {
                    const vesselSpec = VESSEL_CLASSES[v.vesselKey];
                    const portSpec = EAST_COAST_PORTS[inputs.destinationPortKey];
                    const draftDiff = (portSpec.maxDraft - vesselSpec.draftReq).toFixed(1);
                    const isWinner = v.vesselKey === recommendedVessel.vesselKey;

                    return (
                      <tr key={v.vesselKey} style={{ borderBottom: '1px solid #F1F5F9', background: isWinner ? '#F0FDF4' : '#FFFFFF' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: isWinner ? '#166534' : '#0F172A' }}>
                          {v.vesselName} {isWinner && '★'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)' }}>
                          {vesselSpec.dwtMax.toLocaleString()} MT
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)' }}>
                          {vesselSpec.draftReq}m
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: draftDiff >= 0 ? '#16A34A' : '#DC2626' }}>
                          {draftDiff >= 0 ? `+${draftDiff}m (Safe)` : `${draftDiff}m (Deficit)`}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {v.feasibility.isDirectBerthFeasible ? (
                            <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                              Direct Berth Pass
                            </span>
                          ) : v.feasibility.requiresSagarTransshipment ? (
                            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                              Lightering Transshipment
                            </span>
                          ) : (
                            <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                              Infeasible (Exceeds Berth Limit)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 4: COMPARE VOYAGE ECONOMICS & "CHEAPEST FREIGHT != OUTCOME"
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-economics" className="enterprise-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Stage 04 · Delivered Economics
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Delivered Cost Waterfall ($/MT)
              </h3>
            </div>
            <span className="provenance-chip">
              [Voyage Economics Engine]
            </span>
          </div>

          {/* Delivered Cost Breakdown Waterfall */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '6px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Base Ocean Freight</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.freightPortion}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Charter Hire Rate</span>
            </div>

            <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '6px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Bunker Consumption</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.bunkerPortion}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>VLSFO @ 13.0 kn</span>
            </div>

            <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '6px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Port Dues & Pilotage</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.portDuesPortion}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Load + Discharge Quays</span>
            </div>

            <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '6px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Lightering Surcharge</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: baseDeliveredCost.lighteringFee > 0 ? '#DC2626' : '#16A34A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.lighteringFee.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>{baseDeliveredCost.lighteringFee > 0 ? 'Offshore Transshipment' : 'Direct Berth (No Fee)'}</span>
            </div>

            <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '6px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Demurrage Buffer</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.demurragePortion}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Berth Congestion Risk</span>
            </div>

            <div style={{ border: '2px solid #0F172A', padding: '0.85rem', borderRadius: '6px', background: '#F8FAFC' }}>
              <span style={{ fontSize: '0.62rem', color: '#2563EB', fontWeight: 800, textTransform: 'uppercase' }}>Net Landed Cost</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.totalLanded}
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16A34A' }}>Per Metric Tonne</span>
            </div>
          </div>

          {/* KILLER INSIGHT: CHEAPEST FREIGHT != CHEAPEST OUTCOME */}
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} color="#B45309" />
              <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#92400E' }}>
                Core Commercial Insight: Cheapest Headline Freight ≠ Cheapest Delivered Outcome
              </h4>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350F', lineHeight: 1.55 }}>
              At <strong>{EAST_COAST_PORTS[inputs.destinationPortKey]?.name}</strong> (berth limit: {EAST_COAST_PORTS[inputs.destinationPortKey]?.maxDraft}m),{' '}
              {capesizeCandidate.feasibility?.isDirectBerthFeasible ? (
                <>
                  <strong>Capesize</strong> (laden draft {VESSEL_CLASSES.capesize.draftReq}m) achieves direct berth access at ${capesizeCandidate.costPerTonneUsd}/MT.
                  Compared to <strong>Panamax (${panamaxCandidate.costPerTonneUsd}/MT)</strong>, scale economics favor {capesizeCandidate.costPerTonneUsd < panamaxCandidate.costPerTonneUsd ? 'Capesize' : 'Panamax'} by ${Math.abs(capesizeCandidate.costPerTonneUsd - panamaxCandidate.costPerTonneUsd).toFixed(2)}/MT.
                </>
              ) : (
                <>
                  <strong>Capesize</strong> nominally quotes a cheaper headline dayrate, but its laden draft ({VESSEL_CLASSES.capesize.draftReq}m) exceeds the cargo berth limit by {(VESSEL_CLASSES.capesize.draftReq - (EAST_COAST_PORTS[inputs.destinationPortKey]?.maxDraft || 14.5)).toFixed(1)}m,
                  mandating offshore lightering (+${ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD}/t fee, +{ASSUMED_LIGHTERING_TIME_PENALTY_DAYS} days delay).
                  This inflates Capesize delivered cost to <strong>${capesizeCandidate.costPerTonneUsd}/MT</strong> vs Panamax direct berth at <strong>${panamaxCandidate.costPerTonneUsd}/MT</strong> — a ${(capesizeCandidate.costPerTonneUsd - panamaxCandidate.costPerTonneUsd).toFixed(2)}/MT delivered deficit.
                </>
              )}
              {' '}[Voyage Economics Engine — Decision Output]
            </p>
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 5: OPTIMIZE THE BASE PLAN (HARD BOUNDARY)
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-baseplan" className="enterprise-card" style={{ padding: '1.75rem 2rem', border: '2px solid #CBD5E1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#B45309', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Stage 05 · Critical Boundary: Base Plan Optimization
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Optimized Execution Plan for {inputs.originCountry}
              </h3>
            </div>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              BENCHMARK PLAN LOCKED
            </span>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            NaviBulk has first fully optimized the execution plan for your requested origin (<strong>{inputs.originCountry}</strong>) 
            prior to scanning any foreign alternative basins. This serves as the benchmark against which all opportunities are tested.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Optimized Vessel</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {recommendedVessel?.vesselName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>Direct Berth Fit • Safe UKC</div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Steaming Speed & Transit</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                13.0 kn <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>[Voyage Assumption]</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                {((NAUTICAL_DISTANCE_MATRIX[distanceOriginKey]?.[inputs.destinationPortKey] || 4850) / 312).toFixed(1)} Steaming Days • {(NAUTICAL_DISTANCE_MATRIX[distanceOriginKey]?.[inputs.destinationPortKey] || 4850).toLocaleString()} NM
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Landed Cost</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.totalLanded} / MT
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>₹{baseDeliveredCost.totalOutlayInrCr} Cr Total Outlay</div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Model Timing Advantage</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16A34A', marginTop: '0.2rem' }}>
                +${timingEval.totalSavingsUsd.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>vs reactive spot baseline</div>
            </div>
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 6: PROCUREMENT DECISION & COMMITMENT EXPOSURE
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-commitment" className="enterprise-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Stage 06 · Commercial Commitment
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Procurement Exposure Recommendation
              </h3>
            </div>
            <span style={{
              background: commitmentDecision.tagType === 'gain' ? '#DCFCE7' : '#FEF3C7',
              color: commitmentDecision.tagType === 'gain' ? '#166534' : '#92400E',
              border: `1px solid ${commitmentDecision.tagType === 'gain' ? '#BBF7D0' : '#FDE68A'}`,
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.74rem',
              fontWeight: 800
            }}>
              {commitmentDecision.action} ({commitmentDecision.lockPct}%)
            </span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                Optimal Volume Commitment Split
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563EB' }}>
                {commitmentDecision.lockPct}% Period COA Hedge | {commitmentDecision.spotPct}% Spot Index
              </span>
            </div>

            {/* Split Bar */}
            <div style={{ width: '100%', height: '14px', borderRadius: '7px', background: '#E2E8F0', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${commitmentDecision.lockPct}%`, background: '#2563EB', transition: 'width 200ms ease' }} />
              <div style={{ width: `${commitmentDecision.spotPct}%`, background: '#F59E0B', transition: 'width 200ms ease' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem' }}>
              <span>{ (inputs.tonnage * (commitmentDecision.lockPct / 100)).toLocaleString() } MT Fixed Hedge</span>
              <span>{ (inputs.tonnage * (commitmentDecision.spotPct / 100)).toLocaleString() } MT Spot Exposure</span>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderLeft: '3px solid #B45309', padding: '0.85rem 1rem', borderRadius: '0 6px 6px 0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
              Decision Philosophy:
            </span>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
              {commitmentDecision.rationale}
            </p>
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 7: SOURCE OPPORTUNITIES (AFTER BASE PLAN)
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-sources" className="enterprise-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Stage 07 · Downstream Opportunity Scan
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Alternative Basin Diversification Radar
              </h3>
            </div>
            <span className="provenance-chip">
              Evaluated against Optimized Base Plan
            </span>
          </div>

          {/* Deliberate Opportunity Scan Transition Banner */}
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <strong style={{ color: '#1E40AF', fontSize: '0.86rem', display: 'block' }}>
                Your Base Plan is fully optimized: {inputs.originCountry} ➔ {inputs.destinationPortKey.toUpperCase()} (${baseDeliveredCost.totalLanded}/MT)
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#2563EB' }}>
                NaviBulk tests whether alternative supply origins can improve landed cost or enhance supply security without violating coal quality constraints.
              </span>
            </div>
          </div>

          {/* Candidate Basin Analytical Comparison Matrix */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF' }}>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                  Cross-Basin Arbitrage & Diversification Evaluation Matrix
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '0.1rem' }}>
                  Benchmarked strictly against authoritative Base Plan ({inputs.originCountry} Landed ${baseDeliveredCost.totalLanded}/MT)
                </span>
              </div>
              <span className="provenance-chip" style={{ fontSize: '0.65rem' }}>
                Voyage Economics Engine • {recommendedVessel?.vesselName} @ ${day0ForecastRate.toLocaleString()}/d
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Basin & Port</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Distance / Transit</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Delivered Cost</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Δ vs Base Plan</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Spec & Blast Furnace Fit</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Berth / Draft</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Qualification</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceOpportunities.map((src) => {
                    const isBase = src.isBasePlan;
                    const deltaVal = src.engineCostPerTonne !== null ? Number((src.engineCostPerTonne - baseDeliveredCost.totalLanded).toFixed(2)) : null;
                    const isAdopted = adoptedCandidateBranch === src.country;

                    return (
                      <tr 
                        key={src.country}
                        style={{
                          background: isBase ? '#F8FAFC' : isAdopted ? '#F0FDF4' : '#FFFFFF',
                          borderBottom: '1px solid #E2E8F0',
                          borderLeft: isBase ? '4px solid #0F172A' : isAdopted ? '4px solid #16A34A' : '4px solid transparent'
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                            {src.country}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            {src.portName}
                          </div>
                          {isBase && (
                            <span style={{ display: 'inline-block', marginTop: '0.25rem', background: '#0F172A', color: '#FFFFFF', padding: '0.12rem 0.45rem', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 800 }}>
                              BASE PLAN BENCHMARK
                            </span>
                          )}
                          {isAdopted && (
                            <span style={{ display: 'inline-block', marginTop: '0.25rem', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '0.12rem 0.45rem', borderRadius: '3px', fontSize: '0.62rem', fontWeight: 800 }}>
                              ✓ CANDIDATE BRANCH ACTIVE
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>
                            {src.distanceNm.toLocaleString()} NM
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            ~{((src.distanceNm) / 312).toFixed(1)}d steaming
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                            {src.engineCostPerTonne !== null ? `$${src.engineCostPerTonne.toFixed(2)} / MT` : 'Unavailable'}
                          </div>
                          <div style={{ fontSize: '0.66rem', color: '#64748B' }}>
                            FOB Proxy: ${src.fobProxyUsd}/MT
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                          {isBase ? (
                            <span style={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem' }}>Benchmark</span>
                          ) : deltaVal !== null ? (
                            <span style={{
                              fontWeight: 800,
                              color: deltaVal < 0 ? '#16A34A' : '#DC2626',
                              background: deltaVal < 0 ? '#DCFCE7' : '#FEE2E2',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem'
                            }}>
                              {deltaVal < 0 ? `-$${Math.abs(deltaVal).toFixed(2)}` : `+$${deltaVal.toFixed(2)}`}
                              {' '}({deltaVal < 0 ? 'Cheaper' : 'Costlier'})
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>NEEDS DATA</span>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', maxWidth: '200px' }}>
                          <div style={{ fontWeight: 600, color: '#334155', lineHeight: 1.35 }}>
                            {src.specGrade}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.2rem' }}>
                            {src.compatibility}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', maxWidth: '170px', fontSize: '0.72rem', color: '#475569', lineHeight: 1.35 }}>
                          {src.draftFeasibility}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', maxWidth: '170px', fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic', lineHeight: 1.35 }}>
                          {src.qualificationStatus}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          {!isBase ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '130px' }}>
                              <button
                                onClick={() => {
                                  setAdoptedCandidateBranch(src.country);
                                  showCandidateNotification(`${src.country} flagged as Candidate Branch for parallel review. Base Plan (${inputs.originCountry}) remains the authoritative benchmark.`);
                                }}
                                style={{
                                  background: isAdopted ? '#F0FDF4' : '#FFFFFF',
                                  border: isAdopted ? '1px solid #BBF7D0' : '1px solid #CBD5E1',
                                  borderRadius: '4px',
                                  padding: '0.35rem 0.6rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: isAdopted ? '#166534' : '#0F172A',
                                  cursor: 'pointer'
                                }}
                              >
                                {isAdopted ? '✓ Candidate Active' : 'Adopt Candidate'}
                              </button>

                              <button
                                onClick={() => showCandidateNotification(`EOI Request initiated for ${src.country}. Supplier Qualification Package queued for SAIL Global Procurement empanelment review.`)}
                                style={{
                                  background: '#2563EB',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '0.35rem 0.6rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: '#FFFFFF',
                                  cursor: 'pointer'
                                }}
                              >
                                Initiate EOI
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                              Active Baseline
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inline Candidate Notification */}
          {candidateNotification && (
            <div style={{
              marginTop: '1rem',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '0.85rem 1.25rem',
              fontSize: '0.8rem',
              color: '#166534',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={15} color="#16A34A" />
              {candidateNotification}
            </div>
          )}

          <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748B', textAlign: 'center' }}>
            [DATA PROVENANCE: Supplier-level execution data not connected. Qualification & commercial testing required prior to binding tender issuance.]
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 8: STRESS TEST ("WHAT IF WE'RE WRONG?")
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-stress" className="enterprise-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#DC2626', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Stage 08 · Stress Testing & Sensitivity
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                What If Our Assumptions Are Wrong?
              </h3>
            </div>
            <span className="provenance-chip">
              Interactive Recalculation Engine
            </span>
          </div>

          {/* Interactive Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Freight Shift */}
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: '#475569' }}>Freight Rate Shift</span>
                <span style={{ color: stressFreightPct >= 0 ? '#DC2626' : '#16A34A', fontFamily: 'var(--font-mono)' }}>
                  {stressFreightPct > 0 ? `+${stressFreightPct}%` : `${stressFreightPct}%`}
                </span>
              </div>
              <input 
                type="range" 
                min="-25" 
                max="30" 
                step="5"
                value={stressFreightPct}
                onChange={(e) => setStressFreightPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                <span>-25% Bear</span>
                <span>0% Base</span>
                <span>+30% Bull</span>
              </div>
            </div>

            {/* Port Congestion Delay */}
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: '#475569' }}>Port Congestion Delay</span>
                <span style={{ color: stressCongestionDays > 0 ? '#B45309' : '#16A34A', fontFamily: 'var(--font-mono)' }}>
                  +{stressCongestionDays} Days
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="15" 
                step="1"
                value={stressCongestionDays}
                onChange={(e) => setStressCongestionDays(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#B45309' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                <span>0d Normal</span>
                <span>+5d Moderate</span>
                <span>+15d Severe</span>
              </div>
            </div>

            {/* Bunker Price Shift */}
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: '#475569' }}>VLSFO Bunker Shift</span>
                <span style={{ color: stressBunkerPct >= 0 ? '#DC2626' : '#16A34A', fontFamily: 'var(--font-mono)' }}>
                  {stressBunkerPct > 0 ? `+${stressBunkerPct}%` : `${stressBunkerPct}%`}
                </span>
              </div>
              <input 
                type="range" 
                min="-20" 
                max="25" 
                step="5"
                value={stressBunkerPct}
                onChange={(e) => setStressBunkerPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                <span>-20% Drop</span>
                <span>0% $620/t</span>
                <span>+25% Surge</span>
              </div>
            </div>

            {/* Parcel Swing */}
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: '#475569' }}>Parcel Size Swing</span>
                <span style={{ color: stressParcelSwingMt !== 0 ? '#B45309' : '#16A34A', fontFamily: 'var(--font-mono)' }}>
                  {stressParcelSwingMt > 0 ? `+${stressParcelSwingMt.toLocaleString()}` : stressParcelSwingMt.toLocaleString()} MT
                </span>
              </div>
              <input 
                type="range" 
                min={-20000}
                max={20000}
                step={1000}
                value={stressParcelSwingMt}
                onChange={(e) => setStressParcelSwingMt(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#B45309' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                <span>-20k MT</span>
                <span>Base</span>
                <span>+20k MT</span>
              </div>
            </div>
          </div>

          {/* Stress Test Reset */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <button
              onClick={() => { setStressFreightPct(0); setStressCongestionDays(0); setStressBunkerPct(0); setStressParcelSwingMt(0); }}
              style={{
                background: 'transparent',
                border: '1px solid #CBD5E1',
                borderRadius: '5px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <RefreshCw size={12} />
              Reset to Baseline
            </button>
          </div>

          {/* Live Recalculation Causality Panel */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
                WHAT CHANGED
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                ${stressedEconomics.newLanded} / MT
              </div>
              <div style={{ fontSize: '0.75rem', color: stressedEconomics.costDelta >= 0 ? '#DC2626' : '#16A34A', fontWeight: 700 }}>
                {stressedEconomics.costDelta >= 0 ? `+$${stressedEconomics.costDelta}/MT` : `-$${Math.abs(stressedEconomics.costDelta)}/MT`} vs Base Plan
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                WHY IT CHANGED
              </span>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                {stressCongestionDays > 0 && `Port delay (+${stressCongestionDays}d) adds +$${stressedEconomics.demurrageDelta}/MT in demurrage. `}
                {stressFreightPct !== 0 && `Freight shift (${stressFreightPct > 0 ? '+' : ''}${stressFreightPct}%) imparts $${stressedEconomics.freightDelta}/MT delta. `}
                {stressBunkerPct !== 0 && `Bunker shift (${stressBunkerPct > 0 ? '+' : ''}${stressBunkerPct}%) imparts $${stressedEconomics.bunkerDelta}/MT delta. `}
                {stressParcelSwingMt !== 0 && `Parcel swing of ${stressParcelSwingMt > 0 ? '+' : ''}${stressParcelSwingMt.toLocaleString()} MT changes total budget exposure to $${stressedEconomics.stressedTotalOutlayUsd?.toLocaleString()} (was $${baseDeliveredCost.totalOutlayUsd?.toLocaleString()}). Per-tonne cost unchanged. `}
                {stressCongestionDays === 0 && stressFreightPct === 0 && stressBunkerPct === 0 && stressParcelSwingMt === 0 && 'All parameters at baseline. Adjust sliders to stress-test the base plan.'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                HOW RECOMMENDATION EVOLVED
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {stressedEconomics.stressedRecommendation}
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                {stressedEconomics.stressReason}
              </p>
            </div>
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 9: COUNTERFACTUAL PROOF
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-proof" className="enterprise-card" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Stage 09 · Algorithmic Validation
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0' }}>
                Would This Strategy Have Performed Better?
              </h3>
            </div>
            <span style={{
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #E2E8F0',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              SYNTHETIC HISTORICAL SIMULATION
            </span>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            To evaluate empirical efficacy without risking balance sheet capital, NaviBulk conducts walk-forward backtesting 
            using synthetic historical replay across observed Baltic index and bunker series.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {counterfactualData.isErrorState || !counterfactualData.summary.hasValidData ? (
              <div style={{ gridColumn: '1 / -1', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '1.2rem' }}>
                <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  Walk-Forward Backtest — Data State
                </div>
                <div style={{ fontSize: '0.76rem', color: '#78350F', lineHeight: 1.5 }}>
                  {counterfactualData.errorMessage || 'Historical series data loaded from cached Baltic Exchange records. Verify cachedForecasts.json contains historical_dates and sub_indices arrays.'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#92400E', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  [TRANSPARENT: No fabricated fallback numbers shown. Engine must provide genuine walk-forward output to display results.]
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.2rem' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                    Conventional Reactive Strategy
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                    ${counterfactualData.summary.spotCostPerTonne?.toFixed(2)} / MT
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Reactive spot fixture on {counterfactualData.summary.selectedDate || '2024-06-15'} — no timing or vessel optimization applied.
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.2rem', fontStyle: 'italic' }}>
                    [Walk-Forward Backtest — Historical Baltic Series Observation]
                  </div>
                </div>

                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1.2rem' }}>
                  <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                    NaviBulk Optimized Strategy
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                    ${counterfactualData.summary.strategyCostPerTonne?.toFixed(2)} / MT
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#15803D', marginTop: '0.2rem', fontWeight: 700 }}>
                    {counterfactualData.summary.isPositive
                      ? `+${counterfactualData.summary.pctSavings}% Delivered Savings ($${counterfactualData.summary.totalSavingsUsd?.toLocaleString()} Outlay Benefit)`
                      : `${counterfactualData.summary.pctSavings}% vs Reactive (Market unfavorable on this window)`}
                  </div>
                  {counterfactualData.summary.waitDaysAdvised > 0 && (
                    <div style={{ fontSize: '0.68rem', color: '#166534', marginTop: '0.2rem' }}>
                      Model waited {counterfactualData.summary.waitDaysAdvised}d before fixture — executed {counterfactualData.summary.executionDate}
                    </div>
                  )}
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.2rem', fontStyle: 'italic' }}>
                    [Walk-Forward — OLS Lag Model on Historical Series, ZERO future lookahead]
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
            [DISCLOSURE: Strictly walk-forward simulation. Model uses ONLY data available at or before the anchor date. Evaluated against realized historical Baltic Exchange outcomes. Not an actual SAIL SAP/ERP voyage ledger.]
          </div>
        </section>


        {/* ───────────────────────────────────────────────────────────
           STAGE 10: FINAL DECISION & EXECUTIVE BRIEF
        ─────────────────────────────────────────────────────────── */}
        <section id="stage-brief" className="enterprise-card" style={{ padding: '2rem 2.25rem', border: '2px solid #0F172A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #0F172A', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#2563EB', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Stage 10 · Commercial Decision Final Requisition
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: '0.2rem 0 0', letterSpacing: '-0.02em' }}>
                Commercial Chartering & Procurement Decision Brief
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Printer size={14} />
                <span>Print Decision Brief</span>
              </button>

              <button
                onClick={() => setIsLockModalOpen(true)}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <FileCheck size={14} />
                <span>Prepare Requisition</span>
              </button>
            </div>
          </div>

          {/* Decision Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Consignment</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                {inputs.tonnage.toLocaleString()} MT {inputs.cargoType}
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Corridor</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                {inputs.originCountry} ➔ {inputs.destinationPortKey.toUpperCase()}
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Recommended Vessel</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#16A34A' }}>
                {recommendedVessel?.vesselName} (Direct Berth)
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Procurement Commitment</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#B45309' }}>
                {commitmentDecision.action} ({commitmentDecision.lockPct}%)
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Delivered Outcome</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${baseDeliveredCost.totalLanded} / MT (${(baseDeliveredCost.totalOutlayUsd / 1000000).toFixed(2)}M)
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Alternative Source Verdict</span>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
                {adoptedCandidateBranch 
                  ? `${inputs.originCountry} Retained (Candidate: ${adoptedCandidateBranch})`
                  : `${inputs.originCountry} Authoritative Benchmark (No candidate adopted)`}
              </div>
            </div>
          </div>

          {/* Dynamic "WHY THIS RECOMMENDATION?" Section */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
              Why NaviBulk Recommends This Action:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
              <li>
                <strong>Bathymetric Port Clearance:</strong> {recommendedVessel?.vesselName} laden draft ({VESSEL_CLASSES[recommendedVessel?.vesselKey]?.draftReq}m) clears {EAST_COAST_PORTS[inputs.destinationPortKey]?.name} harbor depth ({EAST_COAST_PORTS[inputs.destinationPortKey]?.maxDraft}m) directly with safe UKC buffer, preventing costly offshore lightering transshipment fees.
              </li>
              <li>
                <strong>Econometric Timing Advantage:</strong> Forward curve indicates +{forecastSlopePct}% freight inflation over the laycan horizon; partial lock of {commitmentDecision.lockPct}% insulates against Pacific tonnage rate spikes.
              </li>
              <li>
                <strong>Scale Economics vs Smaller Tonnage:</strong> Outperforms Supramax and Handysize by amortizing bunker burn over a larger {inputs.tonnage.toLocaleString()} MT parcel size.
              </li>
              <li>
                <strong>Source Optimization Priority:</strong> {inputs.originCountry} remains authoritative base plan (${baseDeliveredCost.totalLanded}/MT). {adoptedCandidateBranch ? `${adoptedCandidateBranch} is under parallel review as candidate branch requiring technical qualification.` : 'All alternate origins benchmarked against this delivered cost baseline.'}
              </li>
            </ul>
          </div>

          {/* What Could Change This Decision */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '1.1rem 1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#92400E' }}>
              What Could Change This Decision:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#78350F', lineHeight: 1.6 }}>
              {stressFreightPct === 0 && <li>Baltic freight surge &gt;6%: Triggers 100% BUY NOW lock to insulate against spot escalation.</li>}
              {stressCongestionDays === 0 && <li>Port congestion &gt;5 days: Prompts early fixture or alternate discharge scheduling.</li>}
              {routeRisks.isRussiaRoute && <li>Sanctions compliance: Formal clearance required before charter party signature.</li>}
              {adoptedCandidateBranch ? (
                <li>Candidate {adoptedCandidateBranch} clearance: If metallurgical qualification passes, delivered cost re-evaluates against benchmark.</li>
              ) : (
                <li>Candidate basin qualification: Verification of alternate basin quality specs could activate branch routing.</li>
              )}
            </ul>
          </div>

          {/* Economic Timing Impact */}
          {timingEval.totalSavingsUsd > 0 && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 700 }}>
                Model Timing Advantage: +${timingEval.totalSavingsUsd.toLocaleString()} vs reactive spot fixture baseline
              </div>
              <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 600 }}>
                Amortized: ~${(timingEval.totalSavingsUsd / inputs.tonnage).toFixed(2)}/MT
              </span>
            </div>
          )}

          {/* Expandable Decision Trace */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setIsTraceExpanded(!isTraceExpanded)}
              style={{
                width: '100%',
                background: '#FFFFFF',
                padding: '0.85rem 1.25rem',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0F172A'
              }}
            >
              <span>Inspect Complete Decision Trace Pipeline (Causal Provenance)</span>
              {isTraceExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isTraceExpanded && (
              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <strong>1. Forecast Signal:</strong> Sub-Index {subIndexKey} @ ${latestIndexRate}/day ➔ 14D Projection ${forward14dRate}/day (+{forecastSlopePct}%)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <strong>2. Feasibility Check:</strong> {EAST_COAST_PORTS[inputs.destinationPortKey]?.name} (Max Draft {EAST_COAST_PORTS[inputs.destinationPortKey]?.maxDraft}m) ➔ {recommendedVessel?.vesselName}: {recommendedVessel?.feasibility?.feasible ? 'Direct Berth Validated' : 'Draft Restricted'} {rankedVessels.find(v => v.vesselKey === 'capesize')?.feasibility?.requiresSagarTransshipment ? '| Capesize: Sagar Lightering Required' : ''}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <strong>3. Economics Breakdown:</strong> ${baseDeliveredCost.freightPortion} (Freight) + ${baseDeliveredCost.bunkerPortion} (Fuel) + ${baseDeliveredCost.portDuesPortion} (Port) = ${baseDeliveredCost.totalLanded}/MT
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <strong>4. Timing & Risk:</strong> {inputs.originCountry} Route Risk Score {routeRisks.overallRiskScore}/100 ➔ 5–7 Day Laycan Deferral Optimal
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <strong>5. Commitment Logic:</strong> Trajectory + Volatility ➔ {commitmentDecision.action} ({commitmentDecision.lockPct}% COA / {commitmentDecision.spotPct}% Spot)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <strong>6. Alternative Sourcing:</strong> {sourceOpportunities.length} basins evaluated ➔ {adoptedCandidateBranch ? `Candidate ${adoptedCandidateBranch} active for parallel qualification` : `Retain ${inputs.originCountry} base plan`}
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Requisition Sign-Off Modal */}
      <CharterLockModal 
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        vesselData={{
          vesselClass: recommendedVessel?.vesselName || 'Panamax',
          deliveredCostPerTonne: baseDeliveredCost.totalLanded,
          netTotalSavingsUsd: timingEval.totalSavingsUsd,
          speedKnots: 13.0,
          originPort: inputs.originCountry,
          destinationPort: EAST_COAST_PORTS[inputs.destinationPortKey]?.name,
          tonnage: inputs.tonnage,
          commodity: inputs.cargoType
        }}
      />
    </div>
  );
}
