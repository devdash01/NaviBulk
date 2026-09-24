// SAIL NaviBulk — Stage 06: Procurement Commitment & Contract Structuring
// Plain-English Contract Explainers, Interactive Exposure Slider & Scenario Simulator
import React, { useState, useMemo } from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { 
  Sliders, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Scale,
  Zap,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Info,
  DollarSign,
  Clock,
  Fuel
} from 'lucide-react';

export default function ProcurementStage() {
  const {
    inputs,
    commitmentDecision,
    contractEvaluations,
    forecastSlopePct,
    baseDeliveredCost,
    subIndexKey,
    advanceStage
  } = useDecisionEngine();

  // Interactive user-controlled commitment slider (defaults to AI recommended percentage)
  const [customLockPct, setCustomLockPct] = useState(commitmentDecision.lockPct || 65);
  const [selectedContractKey, setSelectedContractKey] = useState('COA');
  const [marketScenario, setMarketScenario] = useState('forecast'); // 'forecast' | 'spike' | 'drop'

  const aiLockPct = commitmentDecision.lockPct || 65;
  const isCustom = customLockPct !== aiLockPct;

  // Active commitment metrics based on slider
  const activeLockPct = customLockPct;
  const activeSpotPct = 100 - customLockPct;

  const coveredTonnage = Math.round((inputs.tonnage * activeLockPct) / 100);
  const exposedTonnage = inputs.tonnage - coveredTonnage;
  const coveredOutlay = Math.round((baseDeliveredCost.totalOutlayUsd * activeLockPct) / 100);
  const exposedOutlay = baseDeliveredCost.totalOutlayUsd - coveredOutlay;

  // COA Volume discount savings calculation
  const coaContract = contractEvaluations?.find(c => c.strategyKey === 'COA') || contractEvaluations?.[1];
  const unitCoaDiscount = 0.85; // $/MT
  const coaSavingsUsd = Math.round(coveredTonnage * unitCoaDiscount);
  const coaSavingsPerMt = Number((coaSavingsUsd / inputs.tonnage).toFixed(2));
  const coaSavingsInrCr = Number(((coaSavingsUsd * 83.2) / 10000000).toFixed(2));

  // Market Scenario Simulation calculations
  const scenarioData = useMemo(() => {
    const freightCost = baseDeliveredCost.freightPortion || 18.50;
    if (marketScenario === 'spike') {
      // Market spikes +20%
      const spikeCostPerMt = freightCost * 0.20;
      const protectedAmountUsd = Math.round(coveredTonnage * spikeCostPerMt);
      const extraSpotCostUsd = Math.round(exposedTonnage * spikeCostPerMt);
      return {
        label: 'Freight Spikes +20% (Red Sea / Weather Shock)',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        savingsVsFullSpot: protectedAmountUsd,
        spotExtraCost: extraSpotCostUsd,
        verdict: `By locking ${activeLockPct}%, SAIL shields $${protectedAmountUsd.toLocaleString()} USD from market spike. Only $${extraSpotCostUsd.toLocaleString()} exposed on prompt balance.`
      };
    } else if (marketScenario === 'drop') {
      // Market drops -15%
      const dropSavingsPerMt = freightCost * 0.15;
      const spotWindfallUsd = Math.round(exposedTonnage * dropSavingsPerMt);
      return {
        label: 'Freight Softens -15% (Fleet Oversupply)',
        color: '#16A34A',
        bg: '#F0FDF4',
        border: '#BBF7D0',
        spotWindfall: spotWindfallUsd,
        verdict: `Maintaining ${activeSpotPct}% floating spot flexibility allows SAIL to capture $${spotWindfallUsd.toLocaleString()} USD in prompt market bargains.`
      };
    } else {
      return {
        label: `Projected Forward Trajectory (${forecastSlopePct > 0 ? `+${forecastSlopePct}%` : `${forecastSlopePct}%`} over laycan)`,
        color: '#2563EB',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        savingsVsFullSpot: coaSavingsUsd,
        verdict: `Balanced risk-hedging strategy: captures $${coaSavingsUsd.toLocaleString()} USD in locked COA volume rebates while shielding balance sheet from upward freight drift.`
      };
    }
  }, [marketScenario, baseDeliveredCost, coveredTonnage, exposedTonnage, activeLockPct, activeSpotPct, coaSavingsUsd, forecastSlopePct]);

  // Plain-English Contract Cheat Sheet Data
  const CONTRACT_EXPLAINERS = [
    {
      key: 'SPOT',
      title: 'Spot Voyage Charter',
      analogy: 'Uber / On-Demand Taxi',
      simpleConcept: 'Pay today’s going market price for one single ship and one trip.',
      howItWorks: 'You fix a vessel on prompt notice under BIMCO GENCON terms. Shipowner transports the cargo, you pay a single lump freight per delivered tonne.',
      whoPaysFuel: 'Shipowner pays for marine bunker fuel and canal tolls.',
      delayRisk: 'High. If ports are congested, SAIL pays heavy daily demurrage ($20,000–$35,000/day).',
      bestWhen: 'Best when freight rates are falling fast, or for urgent one-off spot parcels.',
      pros: 'Zero long-term commitment. Complete flexibility.',
      cons: '100% exposed to sudden rate spikes and vessel shortages.',
      badge: 'PROMPT MARKET'
    },
    {
      key: 'COA',
      title: 'Contract of Affreightment (COA)',
      analogy: 'Corporate Season Pass (Recommended)',
      simpleConcept: 'An agreed volume program: shipowner guarantees to move multiple cargoes over 6–12 months at a discounted rate.',
      howItWorks: 'SAIL commits to shipping e.g. 500,000 MT over 6 months. In return, shipowner grants a guaranteed ~6.5% volume discount and guarantees replacement ships if one breaks down.',
      whoPaysFuel: 'Shipowner pays fuel & voyage costs.',
      delayRisk: 'Low. Dampens rate spikes by 60% and includes agreed laycan windows.',
      bestWhen: 'Best for SAIL’s recurring blast-furnace coking coal imports from Australia and Mozambique.',
      pros: 'Secures volume discount (-$0.85/MT), guarantees ship supply, locks quarterly budget.',
      cons: 'Requires commitment to recurring shipping schedule.',
      badge: 'RECOMMENDED STRATEGY'
    },
    {
      key: 'INDEX_LINKED',
      title: 'Baltic Index-Linked Fixture',
      analogy: 'Wholesale Floating Tariff with Floor & Ceiling',
      simpleConcept: 'Don’t guess the price. Pay the official public market average when the vessel loads.',
      howItWorks: 'The freight rate floats with the 5-day average of the official Baltic Dry Index (BPI/BCI) just before loading, protected by an agreed floor (-10%) and ceiling (+15%) collar.',
      whoPaysFuel: 'Shipowner pays fuel & vessel expenses.',
      delayRisk: 'Moderate. Collar protects against extreme price spikes above +15%.',
      bestWhen: 'Best when market trajectory is uncertain and neither party wants to gamble on a fixed price.',
      pros: 'Transparent market settlement. Collar prevents runaway inflation.',
      cons: 'No guaranteed volume discount.',
      badge: 'FLOATING COLLAR'
    },
    {
      key: 'TIME_CHARTER',
      title: 'Period Time Charter (TC)',
      analogy: 'Long-Term Car Rental',
      simpleConcept: 'Rent the whole ship for 3 to 6 months. You hire the crew and captain by the day.',
      howItWorks: 'SAIL pays a fixed daily hire rate ($/day) under BIMCO NYPE. SAIL commands where the vessel sails, what speed it steams, and buys the marine fuel directly.',
      whoPaysFuel: 'SAIL pays directly for all bunker fuel, canal tolls, and port dues.',
      delayRisk: 'High. SAIL continues paying daily vessel hire even if the ship waits at anchorage in port.',
      bestWhen: 'Best for dedicated high-frequency coastal shuttle runs between Indian East Coast ports.',
      pros: 'Full operational control over sailing speed and scheduling.',
      cons: 'SAIL bears full risk of bad weather delays, port waiting, and fuel price surges.',
      badge: 'TIME CHARTER'
    }
  ];

  const conclusionText = `NaviBulk recommends a ${commitmentDecision.action} framework: locking ${activeLockPct}% (${coveredTonnage.toLocaleString()} MT) under a Period COA collar while leaving ${activeSpotPct}% (${exposedTonnage.toLocaleString()} MT) open to floating spot flexibility. This captures +$${coaSavingsUsd.toLocaleString()} USD (₹${coaSavingsInrCr} Cr) in volume savings while insulating SAIL from forward Baltic inflation.`;

  return (
    <StageShell
      stageId="procurement"
      conclusion={conclusionText}
      nextActionLabel="Explore Alternative Sources"
      onNextAction={() => advanceStage('procurement')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* ============================================================ */}
        {/* 1. TOP HERO: COMMITMENT STRATEGY SUMMARY */}
        {/* ============================================================ */}
        <div 
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '14px',
            padding: '1.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)'
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
              <span 
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  background: '#2563EB',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em'
                }}
              >
                RECOMMENDED CHARTER ACTION
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                Forward Freight Curve: <strong style={{ color: '#0F172A' }}>{forecastSlopePct > 0 ? `+${forecastSlopePct}% Inflation` : `${forecastSlopePct}% Softening`}</strong>
              </span>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0.5rem', letterSpacing: '-0.02em' }}>
              {activeLockPct}% Period COA Lock / {activeSpotPct}% Floating Spot
            </h2>

            <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
              {commitmentDecision.rationale}
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: '200px', background: '#F8FAFC', padding: '1.25rem 1.5rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', display: 'block' }}>
              Locked Volume Coverage
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#2563EB', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1, marginTop: '0.25rem' }}>
              {activeLockPct}%
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: '0.25rem' }}>
              {activeSpotPct}% Open Spot Exposure
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. INTERACTIVE VOLUME COMMITMENT SLIDER (NO LONGER HARDCODED) */}
        {/* ============================================================ */}
        <div 
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '14px',
            padding: '1.75rem',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} color="#2563EB" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Interactive Volume Commitment Simulator
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.25rem 0 0' }}>
                Drag the slider to test different procurement splits. See how locking volume affects budget certainty and spot market risk in real time.
              </p>
            </div>

            {isCustom && (
              <button
                onClick={() => setCustomLockPct(aiLockPct)}
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <RotateCcw size={12} />
                <span>Reset to AI Recommended ({aiLockPct}%)</span>
              </button>
            )}
          </div>

          {/* Slider Control Container */}
          <div style={{ background: '#F8FAFC', padding: '1.25rem 1.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                Commitment Split: <strong style={{ color: '#2563EB' }}>{activeLockPct}% Period COA</strong> vs <strong style={{ color: '#64748B' }}>{activeSpotPct}% Floating Spot</strong>
              </span>
              <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                AI Recommendation: <strong style={{ color: '#16A34A' }}>{aiLockPct}% Lock</strong>
              </span>
            </div>

            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={activeLockPct}
              onChange={(e) => setCustomLockPct(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                accentColor: '#2563EB'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.5rem', fontWeight: 600 }}>
              <span>0% (100% Floating Spot)</span>
              <span style={{ color: '#2563EB', fontWeight: 800 }}>▲ 50% Balanced</span>
              <span>100% (Full Period Lock)</span>
            </div>
          </div>

          {/* Dynamic Dual Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Locked Volume Card */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={16} color="#2563EB" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>
                    Secured COA Volume ({activeLockPct}%)
                  </span>
                </div>
                <span style={{ background: '#DBEAFE', color: '#1D4ED8', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  IMMUNE TO SPIKES
                </span>
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E3A8A', fontFamily: "'JetBrains Mono', monospace" }}>
                {coveredTonnage.toLocaleString()} MT
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1E40AF', marginTop: '0.2rem', fontWeight: 600 }}>
                Budget Committed: ${coveredOutlay.toLocaleString()} USD
              </div>
              <div style={{ fontSize: '0.76rem', color: '#2563EB', marginTop: '0.5rem', lineHeight: 1.4 }}>
                ✓ Volume discount secured (-${coaSavingsPerMt}/MT)<br />
                ✓ Guaranteed vessel replacement by shipowner
              </div>
            </div>

            {/* Floating Spot Card */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Unlock size={16} color="#64748B" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                    Floating Spot Exposure ({activeSpotPct}%)
                  </span>
                </div>
                <span style={{ background: '#E2E8F0', color: '#475569', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  PROMPT MARKET
                </span>
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace" }}>
                {exposedTonnage.toLocaleString()} MT
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem', fontWeight: 600 }}>
                Subject to Market Swings: ${exposedOutlay.toLocaleString()} USD
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.5rem', lineHeight: 1.4 }}>
                ✓ Flexibility for plant schedule adjustments<br />
                ✓ Ability to capture sudden spot rate drops
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. SCENARIO TESTING: "WHAT IF THE MARKET MOVES?" */}
        {/* ============================================================ */}
        <div 
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '14px',
            padding: '1.5rem 1.75rem',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Market Sensitivity &amp; Stress Simulation
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                Test your chosen {activeLockPct}% commitment against unexpected freight market swings:
              </p>
            </div>

            {/* Scenario Toggles */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setMarketScenario('forecast')}
                style={{
                  background: marketScenario === 'forecast' ? '#2563EB' : '#F8FAFC',
                  color: marketScenario === 'forecast' ? '#FFFFFF' : '#475569',
                  border: `1px solid ${marketScenario === 'forecast' ? '#2563EB' : '#CBD5E1'}`,
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Base Forecast
              </button>
              <button
                onClick={() => setMarketScenario('spike')}
                style={{
                  background: marketScenario === 'spike' ? '#DC2626' : '#F8FAFC',
                  color: marketScenario === 'spike' ? '#FFFFFF' : '#475569',
                  border: `1px solid ${marketScenario === 'spike' ? '#DC2626' : '#CBD5E1'}`,
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                +20% Market Spike
              </button>
              <button
                onClick={() => setMarketScenario('drop')}
                style={{
                  background: marketScenario === 'drop' ? '#16A34A' : '#F8FAFC',
                  color: marketScenario === 'drop' ? '#FFFFFF' : '#475569',
                  border: `1px solid ${marketScenario === 'drop' ? '#16A34A' : '#CBD5E1'}`,
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                -15% Market Drop
              </button>
            </div>
          </div>

          <div 
            style={{
              background: scenarioData.bg,
              border: `1px solid ${scenarioData.border}`,
              borderRadius: '10px',
              padding: '1.15rem 1.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: scenarioData.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Scenario Outcome
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                {scenarioData.label}
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#334155', maxWidth: '650px', lineHeight: 1.5 }}>
                {scenarioData.verdict}
              </p>
            </div>

            <div style={{ textAlign: 'right', minWidth: '170px' }}>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748B', display: 'block' }}>
                Financial Impact
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: scenarioData.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {marketScenario === 'spike' ? `+$${scenarioData.savingsVsFullSpot?.toLocaleString()} Saved` : marketScenario === 'drop' ? `+$${scenarioData.spotWindfall?.toLocaleString()} Benefit` : `+$${coaSavingsUsd?.toLocaleString()} Volume Rebate`}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. PLAIN-ENGLISH CONTRACT EXPLAINER (THE 4 CONTRACTS) */}
        {/* ============================================================ */}
        <div 
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '14px',
            padding: '1.75rem',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="#2563EB" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Contract Structure Cheat Sheet: What is the Difference?
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0.25rem 0 0' }}>
              Maritime shipping uses 4 standard legal frameworks. Here is what they mean in plain English:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {CONTRACT_EXPLAINERS.map((contract) => {
              const isSelected = selectedContractKey === contract.key;
              const isRecommended = contract.key === 'COA';

              return (
                <div
                  key={contract.key}
                  onClick={() => setSelectedContractKey(contract.key)}
                  style={{
                    background: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: `1.5px solid ${isSelected ? '#2563EB' : isRecommended ? '#10B981' : '#E2E8F0'}`,
                    borderRadius: '10px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isRecommended && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '12px',
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      RECOMMENDED
                    </span>
                  )}

                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: isRecommended ? '#059669' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {contract.badge}
                    </div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: '0.3rem 0 0.2rem' }}>
                      {contract.title}
                    </h4>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563EB', marginBottom: '0.75rem' }}>
                      Analogy: {contract.analogy}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                      {contract.simpleConcept}
                    </p>

                    <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>How it works: </strong>
                        <span style={{ color: '#475569' }}>{contract.howItWorks}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#0F172A' }}>Fuel &amp; Voyage Costs: </strong>
                        <span style={{ color: '#475569' }}>{contract.whoPaysFuel}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#0F172A' }}>Demurrage / Delay Risk: </strong>
                        <span style={{ color: '#475569' }}>{contract.delayRisk}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #CBD5E1' }}>
                    <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                      ✓ {contract.pros}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 600, marginTop: '0.2rem' }}>
                      ✕ {contract.cons}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. WHY NOT 100% LOCK OR 100% SPOT? */}
        {/* ============================================================ */}
        <div 
          style={{
            background: '#F1F5F9',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '1.35rem 1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <Info size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem' }}>
              Why Not 100% Lock or 100% Spot? The Steelmaker's Dilemma Explained
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              • <strong>Why not 100% Lock?</strong> If Paradip Port suffers severe cyclone swell or SAIL’s blast furnaces change coal blending ratios, being locked 100% forces SAIL to pay heavy vessel cancellation fees or dead freight.<br />
              • <strong>Why not 100% Spot?</strong> Relying 100% on spot leaves SAIL completely defenseless against Middle East geopolitical shocks or Australian rail strikes, which can spike rates by +$15,000/day ($1.2M+ USD per voyage).<br />
              • <strong>The {activeLockPct}/{activeSpotPct} Hybrid Strategy:</strong> Locks {activeLockPct}% of regular cargo to guarantee volume discounts and guaranteed ship supply, while keeping {activeSpotPct}% floating to exploit sudden spot price drops or absorb operational schedule delays.
            </p>
          </div>
        </div>

      </div>
    </StageShell>
  );
}
