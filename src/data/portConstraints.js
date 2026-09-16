// Port Constraint Matrix for SAIL Dry Bulk Logistics
// Physical Regime Scoping Enforced:
// 1. Separate Specific Cargo Berth Limits from General Approach Channel Capabilities.
// 2. Never pair approach channel draft limits with specific cargo berth DWT/beam limits.

export const ASSUMED_LIGHTERING_TIME_PENALTY_DAYS = 3.5; // [ILLUSTRATIVE ASSUMPTION - NOT SOURCED DATA]
export const ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD = 3.8; // [ILLUSTRATIVE ASSUMPTION - NOT SOURCED DATA]

export const EAST_COAST_PORTS = {
  paradip: {
    id: 'paradip',
    name: 'Paradip Port Authority',
    state: 'Odisha',
    operator: 'Paradip Port Authority',
    // Physical Regime 1: Specific Cargo Berth Limits (Used for direct berthing feasibility checks)
    cargoBerths: {
      maxDraft: 14.5, // meters [VERIFIED: Specific Coal Berth-01/02 & New Iron Ore Berth draft — from Notice MD/SHS/TECH-26/2020/750]
      maxLOA: 300, // meters [VERIFIED: Coal Berth-01 & New Iron Ore Berth — from Notice MD/SHS/TECH-26/2020/750]
      maxBeam: 48.0, // meters [VERIFIED: Coal Berth-01 & New Iron Ore Berth — from Notice MD/SHS/TECH-26/2020/750]
      maxDWT: 100000, // [ESTIMATED - derived from 14.5m draft using typical draft-to-DWT correlation for dry bulk vessels. Not explicitly stated in Notice MD/SHS/TECH-26/2020/750, which lists LOA/Beam/Draft per berth only]
      citation: 'Paradip Port Trust Marine Dept Notice No. MD/SHS/TECH-26/2020/750 (paradipport.gov.in) — LOA/Beam/Draft only; DWT derived',
      status: 'VERIFIED PHYSICAL CARGO BERTH LIMITS (Draft/LOA/Beam only; DWT is a derived estimate)',
    },
    // Physical Regime 2: General Approach Channel Capability (Descriptive approach channel limits)
    approachChannel: {
      maxDraft: 16.5, // meters [VERIFIED: Outer channel approach depth up to 16.5m–17.1m]
      maxDWT: 155000, // [VERIFIED: Capesize approach channel statement]
      maxBeam: 48.0, // meters [VERIFIED]
      citation: 'Paradip Port Authority Official Site — Capesize Handling Capability Statement',
      status: 'VERIFIED CHANNEL CAPABILITY (Does not guarantee specific berth access at this DWT)',
      note: 'Descriptive approach channel capability — do not pair 16.5m channel draft with 14.5m cargo berth draft in the same feasibility check.',
    },
    maxDraft: 14.5, // Primary cargo berth draft for fallback access
    maxLOA: 300,
    maxBeam: 48.0,
    maxDWT: 100000,
    handlingCapacityTpd: 35000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    handlingRateStatus: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
    berths: 'Coal Berth-01 (LOA 300m, Draft 14.5m), Coal Berth-02 (LOA 230m, Draft 14.5m) & New Iron Ore Berth (LOA 300m, Draft 14.5m)',
    tidalDependent: false,
    lighteringRequiredAboveDwt: 95000,
    citation: 'Paradip Port Trust Marine Dept Notice No. MD/SHS/TECH-26/2020/750',
    status: 'VERIFIED REGIME SCOPED',
    notes: 'Per-berth cargo draft is 14.5m at Coal Berths 1/2 and New Iron Ore Berth (displacing ~100k DWT), while general approach channel is up to 16.5m (accommodating up to 155k DWT Capesize in channel).',
    congestionProxyWaitDays: 2.5, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    cycloneRiskFactor: 'High',
  },
  vizag: {
    id: 'vizag',
    name: 'Visakhapatnam Port Authority (VPT)',
    state: 'Andhra Pradesh',
    operator: 'Visakhapatnam Port Authority',
    regimes: {
      outerHarborVgcb: { quayLength: 356, maxDraft: 18.1, maxDwt: 200000, citation: 'VPT Official Site', status: 'VERIFIED DEDICATED COAL BERTH REGIME' },
      outerHarborGeneral: { maxLOA: 390, maxBeam: 50.0, maxDraft: 17.0, citation: 'VPT Official Site', status: 'VERIFIED GENERAL OUTER HARBOR REGIME' },
      innerHarbor: { maxLOA: 240, maxBeam: 40.0, draftMin: 11.0, draftMax: 14.5, citation: 'VPT Official Site', status: 'VERIFIED INNER HARBOR REGIME' },
    },
    maxDraft: 18.1, // Outer Harbor VGCB quay draft up to 18.10m [VERIFIED]
    maxLOA: 356, // VGCB Quay length 356m [VERIFIED]
    maxBeam: 50.0, // Outer Harbor General [VERIFIED]
    maxDWT: 200000, // VGCB dedicated to coking/steam coal up to 200,000 DWT [VERIFIED]
    handlingCapacityTpd: 40000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    handlingRateStatus: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
    berths: 'Outer Harbour VGCB (356m quay, 18.1m draft, 200k DWT) & Inner Harbour Multipurpose Berths (11–14.5m draft)',
    tidalDependent: false,
    lighteringRequiredAboveDwt: 190000,
    citation: 'Visakhapatnam Port Authority Official Site (vizagport.com / vpt.shipping.gov.in)',
    status: 'VERIFIED REGIME MATCHED',
    notes: 'Dedicated Outer Harbour VGCB berth has 18.1m draft accommodating fully laden Capesize coal carriers up to 200,000 DWT. Inner Harbour Panamax berths restricted to 11–14.5m draft.',
    congestionProxyWaitDays: 1.8, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    cycloneRiskFactor: 'Moderate-High',
  },
  gangavaram: {
    id: 'gangavaram',
    name: 'Gangavaram Port (Adani Gangavaram)',
    state: 'Andhra Pradesh',
    operator: 'Adani Ports & SEZ',
    regimes: {
      deepwaterCoalBerths: { draftMin: 18.0, draftMax: 21.0, maxDwt: 200000, citation: 'Adani Ports & Global Energy Monitor', status: 'VERIFIED DEEPWATER COAL REGIME' },
    },
    maxDraft: 19.5, // 18.0m–21.0m deepwater range [VERIFIED]
    maxLOA: 300, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxBeam: 50.0, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 200000, // Fully laden Capesize up to 200,000 DWT [VERIFIED]
    handlingCapacityTpd: 55000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    handlingRateStatus: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
    berths: 'Two Fully Mechanized Coal Berths (~20 MTPA combined capacity)',
    tidalDependent: false,
    lighteringRequiredAboveDwt: 200000,
    citation: 'Adani Ports Official Site & Global Energy Monitor',
    status: 'VERIFIED REGIME MATCHED',
    notes: 'Deepest all-weather port in India. First Indian port to receive a fully loaded Capesize coal vessel (2009). Two fully mechanized coal berths with zero lightering required.',
    congestionProxyWaitDays: 1.2, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    cycloneRiskFactor: 'Moderate',
  },
  gopalpur: {
    id: 'gopalpur',
    name: 'Gopalpur Port (Adani Gopalpur)',
    state: 'Odisha',
    operator: 'Adani Ports & SEZ',
    regimes: {
      mechanizedCoalBerths: { berths: ['GCB1', 'GCB2', 'GCB3'], loa: 290, beam: 45, draftMin: 14.2, draftMax: 14.5, maxDwt: 120000, citation: 'Adani Ports', status: 'VERIFIED REGIME' },
    },
    maxDraft: 14.5, // Berths GCB1, GCB2, GCB3 draft 14.2m–14.5m [VERIFIED]
    maxLOA: 290, // LOA 290m per berth [VERIFIED]
    maxBeam: 45.0, // Beam 45m per berth [VERIFIED]
    maxDWT: 120000, // Mini-Capesize up to 100,000–120,000 DWT [VERIFIED]
    handlingCapacityTpd: 25000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    handlingRateStatus: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
    berths: 'Berths GCB1, GCB2 & GCB3 (Mechanized Coal Import)',
    tidalDependent: true,
    lighteringRequiredAboveDwt: 110000,
    citation: 'Adani Ports Official Site (gopalpurports.in / adaniports.com)',
    status: 'VERIFIED REGIME MATCHED',
    notes: 'Three berths (GCB1, GCB2, GCB3) each with LOA 290m, Beam 45m, and Draft 14.2–14.5m. Accommodates Mini-Capesize coal imports.',
    congestionProxyWaitDays: 1.5, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    cycloneRiskFactor: 'High',
  },
  dhamra: {
    id: 'dhamra',
    name: 'Dhamra Port (Adani Dhamra)',
    state: 'Odisha',
    operator: 'Adani Ports & SEZ',
    regimes: {
      mechanizedBulkBerths: { berths: 2, loaPerBerth: 350, draftMin: 17.5, draftMax: 18.0, maxDwt: 180000, citation: 'Adani Ports & Global Energy Monitor', status: 'VERIFIED REGIME' },
    },
    maxDraft: 18.0, // 17.5m–18.0m deep draft [VERIFIED]
    maxLOA: 350, // Two mechanized berths of 350m each [VERIFIED]
    maxBeam: 47.0, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 180000, // Super-Capesize up to 180,000 DWT [VERIFIED]
    handlingCapacityTpd: 60000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    handlingRateStatus: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
    berths: 'Two Mechanized Bulk Berths (350m each)',
    tidalDependent: false,
    lighteringRequiredAboveDwt: 175000,
    citation: 'Adani Ports Official Site & Global Energy Monitor',
    status: 'VERIFIED REGIME MATCHED',
    notes: 'All-weather, deep-draft port with 17.5–18.0m draft. Two 350m mechanized berths for coking coal, steam coal, limestone imports and iron ore exports.',
    congestionProxyWaitDays: 1.0, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    cycloneRiskFactor: 'High',
  },
  sagar: {
    id: 'sagar',
    name: 'Sagar / Sandheads (Deep-Water Transshipment Anchorage)',
    state: 'West Bengal',
    operator: 'Syama Prasad Mookerjee Port (SMP Kolkata)',
    nodeType: 'TRANSSHIPMENT_ANCHORAGE',
    maxDraft: 18.5, // Deep water anchorage accommodating Capesize vessels [VERIFIED]
    maxLOA: 315, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxBeam: 50.0, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 180000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    dimensionStatus: '[UNVERIFIED - PLACEHOLDER - OPEN WATER ANCHORAGE]',
    handlingCapacityTpd: 18000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    handlingRateStatus: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
    berths: 'Deep-Water Lightering Anchorage (Floating Cranes)',
    floatingCranes: ['MV Yugalraj', 'MV Viganraj'], // [VERIFIED]
    assumedLighteringCostPerTonneUsd: ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD,
    assumedLighteringTimeDays: ASSUMED_LIGHTERING_TIME_PENALTY_DAYS,
    assumptionLabel: '[ILLUSTRATIVE ASSUMPTION - NOT SOURCED DATA]',
    tidalDependent: true,
    citation: 'SMP Kolkata Official Statements (PIB Press Release) & Ministry of Ports Sagar Vidya Kosh',
    status: 'VERIFIED NODE TYPE & FLOATING CRANES / UNVERIFIED ANCHORAGE DIMENSIONS',
    notes: 'Deep-water transshipment anchorage node at Hooghly River mouth. Capesize/Panamax vessels anchor here and partially discharge cargo via floating cranes onto barges/feeder vessels to complete delivery to Haldia/Kolkata.',
    congestionProxyWaitDays: 3.5, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    cycloneRiskFactor: 'Very High',
  },
  haldia: {
    id: 'haldia',
    name: 'Haldia Dock Complex (HDC - Syama Prasad Mookerjee Port)',
    state: 'West Bengal',
    operator: 'Syama Prasad Mookerjee Port (SMP Kolkata)', // [VERIFIED]
    regimes: {
      oilJetties: { draft: 7.0, loa: 170, citation: 'SMP Kolkata Pilotage Documents', status: 'VERIFIED HOJ REGIME' },
      generalDocks: { draftMin: 8.5, draftMax: 9.2, loa: 230, maxDwt: 45000, citation: 'SMP Kolkata Pilotage Documents', status: 'VERIFIED GENERAL DOCKS REGIME' },
    },
    maxDraft: 8.8, // General Docks range 8.5m - 9.2m depending on berth & tide [VERIFIED]
    maxLOA: 230, // General Docks cap; HOJ-1 restricted to ~170m [VERIFIED]
    maxBeam: 27.5, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 45000, // Handysize (28,000–40,000 DWT) direct berthing cap [VERIFIED]
    handlingCapacityTpd: 20000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    handlingRateStatus: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
    berths: 'Berths 4A/4B (General Bulk) & HOJ 1/3 (Oil Jetties)',
    tidalDependent: true,
    lighteringRequiredAboveDwt: 25000,
    citation: 'SMP Kolkata Pilotage Documents & V Ocean Shipping Port Information',
    status: 'VERIFIED REGIME MATCHED',
    notes: 'Draft varies by berth: ~7.0m at Oil Jetties 1/3 (LOA ~170m cap) vs ~8.5m-9.2m at General Docks. Mainly handles Handysize directly; larger vessels route through Sagar/Sandheads floating crane lightering.',
    congestionProxyWaitDays: 4.2, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    cycloneRiskFactor: 'High',
  },
};

export const FOREIGN_LOAD_PORTS = {
  Australia: {
    country: 'Australia',
    ports: ['Hay Point / Dalrymple Bay', 'Gladstone'],
    cargoTypes: ['Coking Coal', 'Thermal Coal'],
    maxDraft: 19.5, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxLOA: 315, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxBeam: 50.0, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 210000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    loadRateTpd: 80000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    avgPortDuesUsd: 42000,
    typicalVesselClass: 'Capesize',
    sourceType: 'Typically published in Port Authority Marine Manuals',
    status: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
  },
  US: {
    country: 'United States',
    ports: ['Hampton Roads (Norfolk)', 'Baltimore'],
    cargoTypes: ['Coking Coal'],
    maxDraft: 15.2, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxLOA: 290, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxBeam: 45.0, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 150000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    loadRateTpd: 45000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    avgPortDuesUsd: 38000,
    typicalVesselClass: 'Panamax',
    sourceType: 'Typically published in Coal Terminal Operations Manuals',
    status: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
  },
  Mozambique: {
    country: 'Mozambique',
    ports: ['Beira', 'Nacala Bulk Terminal'],
    cargoTypes: ['Coking Coal', 'Thermal Coal'],
    maxDraft: 13.5, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxLOA: 225, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxBeam: 32.2, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 75000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    loadRateTpd: 25000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    avgPortDuesUsd: 28000,
    typicalVesselClass: 'Supramax',
    sourceType: 'Typically published in Port Operations Manuals',
    status: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
  },
  Russia: {
    country: 'Russia',
    ports: ['Vostochny (Far East)', 'Murmansk'],
    cargoTypes: ['Coking Coal', 'Thermal Coal'],
    maxDraft: 16.5, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxLOA: 280, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxBeam: 45.0, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 150000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    loadRateTpd: 40000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    avgPortDuesUsd: 35000,
    typicalVesselClass: 'Panamax',
    sanctionsFlag: true,
    sourceType: 'Typically published in Terminal Fact Sheets',
    status: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
  },
  Indonesia: {
    country: 'Indonesia',
    ports: ['Taboneo Offshore Anchorage', 'Tanjung Bara'],
    cargoTypes: ['Thermal Coal'],
    maxDraft: 14.0, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxLOA: 230, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxBeam: 32.2, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    maxDWT: 80000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    loadRateTpd: 30000, // [UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]
    avgPortDuesUsd: 22000,
    typicalVesselClass: 'Supramax',
    sourceType: 'Typically published in Sea Transportation Logistics Guides',
    status: '[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]',
  },
};

export const VESSEL_CLASSES = {
  capesize: {
    id: 'capesize',
    name: 'Capesize',
    dwtMin: 150000,
    dwtMax: 200000,
    avgDwt: 180000,
    draftReq: 17.5,
    loaReq: 292,
    beamReq: 45.0,
    subIndex: 'BCI',
    avgSpeedKnots: 13.5,
    bunkerBurnTpdLaden: 42.0,
    bunkerBurnTpdBallast: 35.0,
    subIndexTceMultiplier: 1.0,
    source: 'Standard Maritime Baseline (Clarksons Dry Bulk Register)',
    description: 'Largest dry bulk carrier class. Highest scale economy for long haul coal from Australia to Gangavaram/Dhamra/Vizag.',
  },
  panamax: {
    id: 'panamax',
    name: 'Panamax / Kamsarmax',
    dwtMin: 70000,
    dwtMax: 85000,
    avgDwt: 75000,
    draftReq: 13.8,
    loaReq: 229,
    beamReq: 32.3,
    subIndex: 'BPI',
    avgSpeedKnots: 14.0,
    bunkerBurnTpdLaden: 28.0,
    bunkerBurnTpdBallast: 24.0,
    subIndexTceMultiplier: 1.0,
    source: 'Standard Maritime Baseline (Clarksons Dry Bulk Register)',
    description: 'Workhorse of SAIL coal trade. Versatile access to Paradip, Vizag, Gopalpur, and Dhamra.',
  },
  supramax: {
    id: 'supramax',
    name: 'Supramax / Ultramax',
    dwtMin: 50000,
    dwtMax: 65000,
    avgDwt: 58000,
    draftReq: 12.2,
    loaReq: 199,
    beamReq: 32.2,
    subIndex: 'BSI',
    avgSpeedKnots: 14.2,
    bunkerBurnTpdLaden: 23.0,
    bunkerBurnTpdBallast: 19.0,
    subIndexTceMultiplier: 1.0,
    source: 'Standard Maritime Baseline (Clarksons Dry Bulk Register)',
    description: 'Self-discharging gear options. Flexible for medium draft ports and Mozambique/Indonesia routes.',
  },
  handysize: {
    id: 'handysize',
    name: 'Handysize',
    dwtMin: 28000,
    dwtMax: 40000,
    avgDwt: 35000,
    draftReq: 10.0,
    loaReq: 180,
    beamReq: 28.0,
    subIndex: 'BHSI',
    avgSpeedKnots: 13.0,
    bunkerBurnTpdLaden: 17.0,
    bunkerBurnTpdBallast: 14.0,
    subIndexTceMultiplier: 1.0,
    source: 'Standard Maritime Baseline (Clarksons Dry Bulk Register)',
    description: 'Smallest bulk class. Required for shallow draft Haldia direct entry and small parcel shipments.',
  },
};
