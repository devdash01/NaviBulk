// SAIL NaviBulk — Dedicated Shared Decision State Layer
// Preserves existing engine truth while isolating state management from App.jsx monolith
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS, VESSEL_CLASSES } from '../data/portConstraints.js';
import { SUB_INDICES_INFO, NAUTICAL_DISTANCE_MATRIX } from '../data/freightData.js';
import { checkPortFeasibility, rankFeasibleVessels, evaluateOptimalTiming } from '../engine/recommendationEngine.js';
import { forecastSubIndexSeries, calculateRouteCostPerTonne } from '../engine/forecastingEngine.js';
import { evaluateRouteRisks } from '../engine/riskEngine.js';
import { runCounterfactualReplay } from '../engine/counterfactualEngine.js';

export const STAGE_ORDER = [
  'requirement',
  'market',
  'feasibility',
  'economics',
  'baseplan',
  'procurement',
  'sources',
  'stress',
  'counterfactual',
  'decision'
];

export const STAGE_METADATA = {
  requirement: {
    num: '01',
    title: 'Commercial Requirement',
    shortTitle: 'Requirement',
    question: 'What commercial cargo requirement needs to be solved?',
    purpose: 'Define the commercial, physical, and contractual constraints of the voyage before running optimization.'
  },
  market: {
    num: '02',
    title: 'Market Intelligence',
    shortTitle: 'Market',
    question: 'What is freight doing over this laycan?',
    purpose: 'Analyze forward Baltic freight curve dynamics to determine market trajectory and rate exposure.'
  },
  feasibility: {
    num: '03',
    title: 'Maritime Feasibility',
    shortTitle: 'Feasibility',
    question: 'Can this cargo actually be handled efficiently?',
    purpose: 'Validate draft clearance, vessel class dimensions, port bottlenecks, and en-route operational hazards.'
  },
  economics: {
    num: '04',
    title: 'True Voyage Economics',
    shortTitle: 'Economics',
    question: 'What does this voyage actually cost?',
    purpose: 'Decompose delivered cost into freight, bunker, port dues, Sagar lightering, and demurrage.'
  },
  baseplan: {
    num: '05',
    title: 'Optimized Base Plan',
    shortTitle: 'Base Plan',
    question: 'What is the best executable plan for the original source?',
    purpose: 'Establish the authoritative commercial benchmark for the nominated origin before testing alternatives.'
  },
  procurement: {
    num: '06',
    title: 'Procurement Commitment',
    shortTitle: 'Procurement',
    question: 'How much freight exposure should we commit now?',
    purpose: 'Determine charter fixture structure (BUY NOW, WAIT, or PARTIAL LOCK) based on market slope.'
  },
  sources: {
    num: '07',
    title: 'Alternative Source Analysis',
    shortTitle: 'Sources',
    question: 'Can NaviBulk improve this plan by challenging the source origin?',
    purpose: 'Evaluate alternative global supply basins against the optimized Base Plan benchmark.'
  },
  stress: {
    num: '08',
    title: 'Stress Sensitivity',
    shortTitle: 'Stress Test',
    question: 'What if our market or operational assumptions are wrong?',
    purpose: 'Subject the base recommendation to adverse freight spikes, port congestion, and bunker shocks.'
  },
  counterfactual: {
    num: '09',
    title: 'Counterfactual Proof',
    shortTitle: 'Counterfactual',
    question: 'Would this strategy have performed better than spot fixtures?',
    purpose: 'Walk-forward synthetic historical replay comparing NaviBulk timing against reactive spot booking.'
  },
  decision: {
    num: '10',
    title: 'Decision Brief',
    shortTitle: 'Decision',
    question: 'What is NaviBulk\'s final commercial recommendation and next action?',
    purpose: 'Executive commercial requisition dossier synthesizing vessel, timing, hedge, and execution actions.'
  }
};

const DEFAULT_DEMO_INPUTS = {
  cargoType: 'Coking Coal',
  tonnage: 70000,
  originCountry: 'Australia',
  destinationPortKey: 'paradip',
  contractType: 'coa',
  laycanDays: 14,
  maxDraftTolerance: 14.5,
  vesselClass: 'panamax',
  riskTolerance: 'MEDIUM',
  speedKnots: 13.0,
};

const ALL_ANALYZED_STATUSES = {
  requirement: 'analyzed',
  market: 'analyzed',
  feasibility: 'analyzed',
  economics: 'analyzed',
  baseplan: 'analyzed',
  procurement: 'analyzed',
  sources: 'analyzed',
  stress: 'analyzed',
  counterfactual: 'analyzed',
  decision: 'analyzed'
};

const NEW_DECISION_STATUSES = {
  requirement: 'analyzed',
  market: 'not_started',
  feasibility: 'not_started',
  economics: 'not_started',
  baseplan: 'not_started',
  procurement: 'not_started',
  sources: 'not_started',
  stress: 'not_started',
  counterfactual: 'not_started',
  decision: 'not_started'
};

const DecisionContext = createContext(null);

export function DecisionProvider({ children }) {
  // ── 1. CORE DECISION INPUTS ──
  const [inputs, setInputs] = useState(DEFAULT_DEMO_INPUTS);

  // ── 2. ACTIVE STAGE ROUTING ──
  const [activeStage, setActiveStage] = useState('requirement');

  // ── 3. STAGE STATUSES (Analyzed / Not Started / Requires Reanalysis) ──
  const [stageStatuses, setStageStatuses] = useState(ALL_ANALYZED_STATUSES);

  // ── 4. STRESS STATE ──
  const [stressState, setStressState] = useState({
    freightPct: 0,
    congestionDays: 0,
    bunkerPct: 0,
    parcelSwingMt: 0
  });

  // ── 5. ADOPTED CANDIDATE BRANCH (Comparison only — does not overwrite base plan origin) ──
  const [adoptedCandidateBranch, setAdoptedCandidateBranch] = useState(null);

  // ── 6. REQUIREMENT CHANGE (Invalidates downstream stages) ──
  const handleRequirementChange = useCallback((newFields) => {
    setInputs((prev) => {
      const updated = { ...prev, ...newFields };
      return updated;
    });

    // Mark all stages after requirement as requires_reanalysis
    setStageStatuses((prev) => {
      const next = { ...prev, requirement: 'analyzed' };
      STAGE_ORDER.slice(1).forEach((stageId) => {
        if (prev[stageId] === 'analyzed') {
          next[stageId] = 'requires_reanalysis';
        }
      });
      return next;
    });
  }, []);

  // ── 7. START NEW DECISION ──
  const startNewDecision = useCallback(() => {
    setInputs({
      cargoType: 'Coking Coal',
      tonnage: 70000,
      originCountry: 'Australia',
      destinationPortKey: 'paradip',
      contractType: 'spot',
      laycanDays: 14,
      maxDraftTolerance: 14.5,
      vesselClass: 'panamax',
      riskTolerance: 'MEDIUM',
      speedKnots: 13.0,
    });
    setStageStatuses(NEW_DECISION_STATUSES);
    setActiveStage('requirement');
    setAdoptedCandidateBranch(null);
    setStressState({ freightPct: 0, congestionDays: 0, bunkerPct: 0, parcelSwingMt: 0 });
  }, []);

  // ── 7B. SET SPEED KNOTS (Hydrodynamic Speed Optimization) ──
  const setSpeedKnots = useCallback((speed) => {
    setInputs((prev) => ({ ...prev, speedKnots: Number(speed) }));
  }, []);

  // ── 8. RESET TO DEMO DECISION ──
  const resetToDemoDecision = useCallback(() => {
    setInputs(DEFAULT_DEMO_INPUTS);
    setStageStatuses(ALL_ANALYZED_STATUSES);
    setActiveStage('requirement');
    setAdoptedCandidateBranch(null);
    setStressState({ freightPct: 0, congestionDays: 0, bunkerPct: 0, parcelSwingMt: 0 });
  }, []);

  // ── 9. ADVANCE STAGE ──
  const advanceStage = useCallback((currentStageId) => {
    setStageStatuses((prev) => ({
      ...prev,
      [currentStageId]: 'analyzed'
    }));
    const currentIdx = STAGE_ORDER.indexOf(currentStageId);
    if (currentIdx !== -1 && currentIdx < STAGE_ORDER.length - 1) {
      const nextStageId = STAGE_ORDER[currentIdx + 1];
      setActiveStage(nextStageId);
    }
  }, []);

  // ── 10. RUN STAGE ANALYSIS (Validate/materialize real calculations) ──
  const runStageAnalysis = useCallback((stageId) => {
    setStageStatuses((prev) => ({
      ...prev,
      [stageId]: 'analyzed'
    }));
  }, []);

  // ── 11. CANDIDATE BRANCH ACTIONS ──
  const adoptCandidateBranch = useCallback((candidate) => {
    setAdoptedCandidateBranch(candidate);
  }, []);

  const clearCandidateBranch = useCallback(() => {
    setAdoptedCandidateBranch(null);
  }, []);

  // ── 12. STRESS ACTIONS ──
  const updateStressState = useCallback((fields) => {
    setStressState((prev) => ({ ...prev, ...fields }));
  }, []);

  const resetStressState = useCallback(() => {
    setStressState({ freightPct: 0, congestionDays: 0, bunkerPct: 0, parcelSwingMt: 0 });
  }, []);

  // ══════════════════════════════════════════════════════════════
  // GENUINE ENGINE COMPUTATIONS (100% Deterministic / Backend-Aligned)
  // ══════════════════════════════════════════════════════════════

  // 1. Feasibility & Fleet Ranking
  const rankedVessels = useMemo(() => {
    return rankFeasibleVessels(inputs);
  }, [inputs]);

  const recommendedVessel = useMemo(() => {
    return rankedVessels.find((v) => v.feasibility.feasible) || rankedVessels[0];
  }, [rankedVessels]);

  const capesizeCandidate = useMemo(() => {
    return rankedVessels.find((v) => v.vesselKey === 'capesize') || rankedVessels[0];
  }, [rankedVessels]);

  const panamaxCandidate = useMemo(() => {
    return rankedVessels.find((v) => v.vesselKey === 'panamax') || rankedVessels[0];
  }, [rankedVessels]);

  // 2. Market Forecast for Winner Vessel Class
  const subIndexKey = recommendedVessel?.subIndex || 'BPI';
  const subIndexInfo = SUB_INDICES_INFO[subIndexKey] || SUB_INDICES_INFO.BPI;

  const forecastSeries = useMemo(() => {
    return forecastSubIndexSeries(subIndexKey, 30);
  }, [subIndexKey]);

  const lastHistoricalRate = forecastSeries.historicalRates?.[forecastSeries.historicalRates.length - 1]
    || subIndexInfo.baselineTce;
  const day0ForecastRate = forecastSeries.forecastRates[0] || lastHistoricalRate;
  const forward14dRate = forecastSeries.forecastRates[14] || day0ForecastRate;
  const forward30dRate = forecastSeries.forecastRates[29] || day0ForecastRate;
  const latestIndexRate = lastHistoricalRate;
  const forecastSlopePct = Number((((forward14dRate - day0ForecastRate) / (day0ForecastRate || 1)) * 100).toFixed(1));

  // 3. Timing & Laycan Optimization
  const timingEval = useMemo(() => {
    return evaluateOptimalTiming({
      vesselClassKey: recommendedVessel?.vesselKey || 'panamax',
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

  const primaryRisk = useMemo(() => {
    if (!routeRisks?.riskCards || routeRisks.riskCards.length === 0) {
      return { title: 'Corridor Operational Baseline', score: routeRisks?.overallRiskScore ?? 25, level: 'Low' };
    }
    return routeRisks.riskCards.reduce((highest, curr) => (curr.score > highest.score ? curr : highest), routeRisks.riskCards[0]);
  }, [routeRisks]);

  // 5. True Delivered Base Cost Breakdown (Dynamically linked to Hydrodynamic Speed & Bunker Burn)
  const baseDeliveredCost = useMemo(() => {
    const rawCost = recommendedVessel?.costPerTonneUsd || 18.20;
    const freightPortion = Number((rawCost * 0.70).toFixed(2));
    
    // Dynamic Bunker calculation via Admiralty Non-Linear Cubic Law (P ∝ V³)
    const distanceOriginKey = inputs.originCountry === 'United States' ? 'US' : inputs.originCountry;
    const distanceNm = NAUTICAL_DISTANCE_MATRIX[distanceOriginKey]?.[inputs.destinationPortKey] || 4850;
    const vesselSpec = VESSEL_CLASSES[recommendedVessel?.vesselKey] || VESSEL_CLASSES.panamax;
    const designSpeed = vesselSpec.avgSpeedKnots || 14.0;
    const designBurnTpd = vesselSpec.bunkerBurnTpdLaden || 28.0;
    const speed = inputs.speedKnots || 13.0;
    const bunkerPrice = 829.50; // $/MT VLSFO

    // Design baseline calculation
    const baseSeaDays = Number((distanceNm / (designSpeed * 24)).toFixed(1));
    const baseTotalBunkerTons = Number((baseSeaDays * designBurnTpd).toFixed(1));
    const baseTotalBunkerCost = baseTotalBunkerTons * bunkerPrice;

    // Actual operating speed calculation
    const curSeaDays = Number((distanceNm / (speed * 24)).toFixed(1));
    const curBurnTpd = Number((designBurnTpd * Math.pow(speed / designSpeed, 3)).toFixed(1));
    const curTotalBunkerTons = Number((curSeaDays * curBurnTpd).toFixed(1));
    const curTotalBunkerCost = curTotalBunkerTons * bunkerPrice;

    // Direct bunker cost per MT of cargo
    const bunkerPortion = Number((curTotalBunkerCost / (inputs.tonnage || 70000)).toFixed(2));
    const portDuesPortion = Number((rawCost * 0.07).toFixed(2));
    const lighteringFee = recommendedVessel?.feasibility?.requiresSagarTransshipment ? 4.20 : 0.0;
    const demurragePortion = Number((0.60).toFixed(2));
    const totalLanded = Number((freightPortion + bunkerPortion + portDuesPortion + lighteringFee + demurragePortion).toFixed(2));
    
    const speedBunkerSavingsUsd = Math.round(baseTotalBunkerCost - curTotalBunkerCost);
    const speedBunkerSavingsPerMt = Number((speedBunkerSavingsUsd / (inputs.tonnage || 70000)).toFixed(2));
    const fuelSavedTons = Math.max(0, Number((baseTotalBunkerTons - curTotalBunkerTons).toFixed(1)));
    const co2SavedTons = Number((fuelSavedTons * 3.114).toFixed(1));

    return {
      freightPortion,
      bunkerPortion,
      portDuesPortion,
      lighteringFee,
      demurragePortion,
      totalLanded,
      totalOutlayUsd: Math.round(totalLanded * inputs.tonnage),
      totalOutlayInrCr: Number(((totalLanded * inputs.tonnage * 83.2) / 10000000).toFixed(2)),
      // Speed optimization dynamic outputs
      operatingSpeed: speed,
      designSpeed,
      designBurnTpd,
      curBurnTpd,
      transitDays: curSeaDays,
      baseTransitDays: baseSeaDays,
      speedBunkerSavingsUsd,
      speedBunkerSavingsPerMt,
      fuelSavedTons,
      co2SavedTons,
      bunkerPrice
    };
  }, [recommendedVessel, inputs.tonnage, inputs.originCountry, inputs.destinationPortKey, inputs.speedKnots]);

  // 6. Dynamic Commitment (BUY NOW vs WAIT vs PARTIAL LOCK)
  const commitmentDecision = useMemo(() => {
    const slope = forecastSlopePct;
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

  // 7. Alternative Source Opportunities
  const sourceOpportunities = useMemo(() => {
    const basePlanCost = baseDeliveredCost.totalLanded;
    const basePlanOrigin = inputs.originCountry;

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

    const australiaCost = computeOriginCost('Australia');
    const mozambiqueCost = computeOriginCost('Mozambique');
    const usCost = computeOriginCost('US');
    const indonesiaCost = computeOriginCost('Indonesia');
    const russiaCost = computeOriginCost('Russia');

    const getVerdict = (engineCost, isBase, qualDisqualified) => {
      if (isBase) return 'BASE PLAN';
      if (qualDisqualified) return 'UNCERTAIN';
      if (engineCost === null) return 'NEEDS DATA';
      if (engineCost < basePlanCost - 0.5) return 'BETTER';
      if (engineCost > basePlanCost + 0.5) return 'WORSE';
      return 'COMPARABLE';
    };

    return [
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
          ? 'Baseline authoritative procurement mandate.'
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
          ? `Engine-calculated delivered cost: $${mozambiqueCost?.toFixed(2)}/MT. Delta vs base plan: ${(mozambiqueCost - basePlanCost) >= 0 ? '+' : ''}${(mozambiqueCost - basePlanCost).toFixed(2)}/MT.`
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
          ? `Engine-calculated delivered cost: $${usCost?.toFixed(2)}/MT via ${(NAUTICAL_DISTANCE_MATRIX.US?.[inputs.destinationPortKey] || 11400).toLocaleString()} NM Cape route. Delta: ${(usCost - basePlanCost) >= 0 ? '+' : ''}${(usCost - basePlanCost).toFixed(2)}/MT.`
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
        verdict: getVerdict(indonesiaCost, basePlanOrigin === 'Indonesia', true),
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
  }, [baseDeliveredCost, inputs.originCountry, inputs.destinationPortKey, inputs.tonnage, recommendedVessel, day0ForecastRate]);

  // 8. Stressed Economics
  const stressedEconomics = useMemo(() => {
    const base = baseDeliveredCost;
    const freightDelta = Number((base.freightPortion * (stressState.freightPct / 100)).toFixed(2));
    const bunkerDelta = Number((base.bunkerPortion * (stressState.bunkerPct / 100)).toFixed(2));
    const demurrageDelta = Number((stressState.congestionDays * 0.35).toFixed(2));
    const newLanded = Number((base.totalLanded + freightDelta + bunkerDelta + demurrageDelta).toFixed(2));
    const costDelta = Number((newLanded - base.totalLanded).toFixed(2));

    const stressedTonnage = inputs.tonnage + stressState.parcelSwingMt;
    const stressedTotalOutlayUsd = Math.round(newLanded * stressedTonnage);
    const stressedTotalOutlayInrCr = Number(((newLanded * stressedTonnage * 83.2) / 10000000).toFixed(2));

    let stressedRecommendation = commitmentDecision.action;
    let stressReason = 'Decision remains robust under current sensitivity parameters.';

    if (stressState.congestionDays >= 5 && freightDelta > 2.0) {
      stressedRecommendation = 'BUY NOW (100% LOCK)';
      stressReason = `Combined stress: Port delay (+${stressState.congestionDays}d) + freight inflation (+$${freightDelta}/MT) creates $${costDelta}/MT cost exposure. Immediate charter lock prevents compounding demurrage and rate escalation.`;
    } else if (stressState.congestionDays >= 5) {
      stressedRecommendation = 'BUY NOW (100% LOCK)';
      stressReason = `Severe port congestion (+${stressState.congestionDays}d = +$${demurrageDelta}/MT demurrage) triggers immediate charter coverage. Open position risks laytime breach.`;
    } else if (freightDelta > 2.5) {
      stressedRecommendation = 'BUY NOW (100% LOCK)';
      stressReason = `Freight rate stress (+${stressState.freightPct}% = +$${freightDelta}/MT) materially erodes the forward rate window. Locking 100% protects against further escalation.`;
    } else if (bunkerDelta > 1.5) {
      stressedRecommendation = commitmentDecision.action === 'WAIT' ? 'PARTIAL LOCK (Bunker Hedge)' : commitmentDecision.action;
      stressReason = `Elevated bunker costs (+${stressState.bunkerPct}% = +$${bunkerDelta}/MT) compress voyage margins. Partial commitment hedge recommended.`;
    } else if (stressState.parcelSwingMt !== 0) {
      const outlayDelta = stressedTotalOutlayUsd - base.totalOutlayUsd;
      stressReason = `Parcel swing of ${stressState.parcelSwingMt > 0 ? '+' : ''}${stressState.parcelSwingMt.toLocaleString()} MT changes total outlay by $${Math.round(outlayDelta).toLocaleString()}. Per-tonne cost unchanged; budget exposure recalculated.`;
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
  }, [baseDeliveredCost, stressState, commitmentDecision.action, inputs.tonnage]);

  // 9. Counterfactual Replay
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
      const hasValidData = Boolean(replay?.counterfactualRecommendation?.costPerTonneUsd && replay?.actualDecision?.costPerTonneUsd);
      return {
        summary: {
          strategyCostPerTonne: hasValidData ? replay.counterfactualRecommendation.costPerTonneUsd : null,
          spotCostPerTonne: hasValidData ? replay.actualDecision.costPerTonneUsd : null,
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

  // Context value object
  const value = {
    // State
    inputs,
    activeStage,
    stageStatuses,
    stressState,
    adoptedCandidateBranch,

    // Methods
    setActiveStage,
    advanceStage,
    runStageAnalysis,
    handleRequirementChange,
    startNewDecision,
    resetToDemoDecision,
    setSpeedKnots,
    adoptCandidateBranch,
    clearCandidateBranch,
    updateStressState,
    resetStressState,
    setStageStatuses,

    // Derived Engine Outputs
    rankedVessels,
    recommendedVessel,
    capesizeCandidate,
    panamaxCandidate,
    subIndexKey,
    subIndexInfo,
    forecastSeries,
    lastHistoricalRate,
    day0ForecastRate,
    forward14dRate,
    forward30dRate,
    latestIndexRate,
    forecastSlopePct,
    timingEval,
    routeRisks,
    primaryRisk,
    baseDeliveredCost,
    commitmentDecision,
    nextActionInfo,
    sourceOpportunities,
    stressedEconomics,
    counterfactualData,
  };

  return (
    <DecisionContext.Provider value={value}>
      {children}
    </DecisionContext.Provider>
  );
}

export function useDecisionEngine() {
  const context = useContext(DecisionContext);
  if (!context) {
    throw new Error('useDecisionEngine must be used within a DecisionProvider');
  }
  return context;
}
