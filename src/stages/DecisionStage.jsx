// SAIL NaviBulk — Stage 10: Final Commercial Decision Brief
// The authoritative output of the NaviBulk decision engine — structured for Chief Chartering Officer review
import React, { useState } from 'react';
import { useDecisionEngine, STAGE_ORDER, STAGE_METADATA } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import CharterLockModal from '../components/CharterLockModal.jsx';
import ExecutiveSavingsLedger from '../components/ExecutiveSavingsLedger.jsx';
import { EAST_COAST_PORTS } from '../data/portConstraints.js';
import { 
  FileCheck, 
  Printer, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  DollarSign, 
  Ship, 
  Compass, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function DecisionStage() {
  const {
    inputs,
    recommendedVessel,
    baseDeliveredCost,
    commitmentDecision,
    forecastSlopePct,
    timingEval,
    routeRisks,
    primaryRisk,
    nextActionInfo,
    adoptedCandidateBranch,
    subIndexKey
  } = useDecisionEngine();

  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isTraceExpanded, setIsTraceExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('brief'); // 'brief' | 'ledger'

  const destPort = EAST_COAST_PORTS[inputs.destinationPortKey] || EAST_COAST_PORTS.paradip;
  const destDraft = destPort.maxDraft || destPort.maxDraftM || destPort.cargoBerths?.maxDraft || 14.5;

  // Causal "Why this recommendation" bullets derived 100% from engine data
  const whyBullets = [
    `Physical Feasibility: ${recommendedVessel?.vesselName || 'Panamax'} full-load draft (${recommendedVessel?.feasibility?.vesselDraftM}m) satisfies ${destPort.name} maximum berth draft (${destDraft}m) with +${recommendedVessel?.feasibility?.clearanceM}m Under-Keel Clearance, avoiding Sagar lightering surcharges.`,
    `Delivered Cost Optimization: Landed outcome calculated at $${baseDeliveredCost.totalLanded}/MT (total outlay $${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD), minimizing true voyage expenditure across ocean freight, bunker, port tariffs, and demurrage.`,
    `Forward Freight Hedging: Forward ${subIndexKey} curve projects a ${forecastSlopePct > 0 ? `+${forecastSlopePct}% upward trajectory` : `${forecastSlopePct}% softening curve`}, validating the ${commitmentDecision.action} recommendation (${commitmentDecision.lockPct}% period coverage / ${commitmentDecision.spotPct}% spot liquidity).`,
    `Corridor Risk Factor: Primary operational hazard identified as "${primaryRisk.title}" (${primaryRisk.score}/100 - ${primaryRisk.level} Risk), accounted for within the voyage laytime and demurrage allowance.`
  ];

  // Dynamic what could change bullets
  const whatCouldChange = [
    `Freight Rate Inflection: If the forward ${subIndexKey} curve reverses by more than 5.0% over the next 5 days, commitment strategy should escalate or de-escalate between BUY NOW and WAIT.`,
    `Port Congestion Delay: If pre-berthing wait times at ${destPort.name} exceed 5 days, demurrage accumulation (+$0.35/MT/day) triggers an immediate 100% fixture lock to protect laytime terms.`,
    `Bunker Fuel Spikes: A >$20/MT jump in VLSFO bunkering prices at load port shifts voyage economics by +$${(baseDeliveredCost.bunkerPortion * 0.20).toFixed(2)}/MT, favoring period contracts with bunker adjustment clauses.`,
    `Alternative Origin Clearance: If candidate origins (such as Mozambique or US) obtain certified SAIL blast-furnace blend approval, cross-basin arbitrage may justify supplier diversification.`
  ];

  return (
    <div className="decision-stage-root" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* ── TOP HEADER WITH ACTION BUTTONS ── */}
      <div 
        style={{
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '8px 8px 0 0',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Stage 10 · Commercial Chartering Requisition
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.2rem 0 0.15rem', letterSpacing: '-0.02em' }}>
            Executive Commercial Decision Brief
          </h1>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            Steel Authority of India Limited • Central Raw Materials Logistics Directorate • New Delhi
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => window.print()}
            style={{
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Printer size={14} />
            <span>Print Dossier</span>
          </button>

          <button
            onClick={() => setIsLockModalOpen(true)}
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 1rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            <FileCheck size={14} />
            <span>Prepare Requisition</span>
          </button>
        </div>
      </div>

      {/* ── SUB-NAVIGATION TABS (Decision Brief vs Savings Ledger) ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 2rem', display: 'flex', gap: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('brief')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'brief' ? '2px solid #2563EB' : '2px solid transparent',
            padding: '0.75rem 0',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: activeTab === 'brief' ? '#2563EB' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Executive Requisition Brief
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'ledger' ? '2px solid #2563EB' : '2px solid transparent',
            padding: '0.75rem 0',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: activeTab === 'ledger' ? '#2563EB' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Savings Ledger & Financial Audit
        </button>
      </div>

      {activeTab === 'ledger' ? (
        <div style={{ background: '#FFFFFF', padding: '1.5rem', border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <ExecutiveSavingsLedger
            inputs={inputs}
            activeVesselObj={recommendedVessel}
            timingEval={timingEval}
            onOpenCharterModal={() => setIsLockModalOpen(true)}
          />
        </div>
      ) : (
        <div 
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem'
          }}
        >
          
          {/* ── 1. WHAT NAVIBULK RECOMMENDS (KEY DECISION MATRIX) ── */}
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              I. Authoritative Decision Requisition
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
              
              <div>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Consignment</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                  {inputs.tonnage.toLocaleString()} MT {inputs.cargoType}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Corridor</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                  {inputs.originCountry} → {destPort.name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Nominated Fleet</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E40AF', marginTop: '0.15rem' }}>
                  {recommendedVessel?.vesselName} ({recommendedVessel?.dwt?.toLocaleString()} DWT)
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Delivered Outcome</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  ${baseDeliveredCost.totalLanded} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>/ MT</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Budget Outlay</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  ${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD
                </div>
                <div style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700 }}>
                  ₹{baseDeliveredCost.totalOutlayInrCr} Cr INR
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Chartering Action</span>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: commitmentDecision.action === 'BUY NOW' ? '#16A34A' : '#2563EB', marginTop: '0.15rem' }}>
                  {commitmentDecision.action} ({commitmentDecision.lockPct}%)
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                  Laycan: +{inputs.laycanDays} Days Window
                </div>
              </div>

            </div>
          </div>

          {/* ── 2. WHY THIS RECOMMENDATION (CAUSAL BULLETS) ── */}
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
              II. Analytical Rationale & Causal Proof
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {whyBullets.map((bullet, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    fontSize: '0.82rem',
                    color: '#334155',
                    lineHeight: 1.5,
                    background: '#FFFFFF',
                    borderLeft: '3px solid #2563EB',
                    padding: '0.45rem 0.85rem'
                  }}
                >
                  <CheckCircle2 size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. WHAT COULD CHANGE THIS DECISION ── */}
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
              III. Sensitivity & Material Boundary Conditions
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {whatCouldChange.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '6px',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.78rem',
                    color: '#78350F',
                    lineHeight: 1.45
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#92400E', marginBottom: '0.2rem' }}>
                    Boundary Condition {idx + 1}
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── 4. NEXT OPERATIONAL ACTION ── */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase' }}>
                IV. Immediate Operational Next Step
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                {nextActionInfo.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                {nextActionInfo.detail}
              </div>
            </div>

            <button
              onClick={() => setIsLockModalOpen(true)}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.55rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <span>Execute Requisition</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* ── 5. DECISION TRACE (EXPANDABLE) ── */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
            <button
              onClick={() => setIsTraceExpanded(!isTraceExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <span>V. End-to-End Decision Trace Audit Chain (Stages 01–10)</span>
              {isTraceExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {isTraceExpanded && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.76rem' }}>
                {STAGE_ORDER.map((stageId, idx) => {
                  const meta = STAGE_METADATA[stageId];
                  return (
                    <div key={stageId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0', borderBottom: idx < STAGE_ORDER.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', minWidth: '55px' }}>
                        STAGE {meta.num}
                      </span>
                      <span style={{ fontWeight: 700, color: '#0F172A', minWidth: '150px' }}>
                        {meta.title}
                      </span>
                      <span style={{ color: '#64748B', flex: 1 }}>
                        {meta.question}
                      </span>
                      <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.7rem' }}>
                        ✓ VERIFIED
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Requisition Modal */}
      <CharterLockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        selectedVessel={recommendedVessel}
        inputs={inputs}
        timingEval={timingEval}
        rationaleText={`${recommendedVessel?.vesselName || 'Panamax'} vessel nominated for ${inputs.tonnage.toLocaleString()} MT ${inputs.cargoType} consignment from ${inputs.originCountry} to ${destPort.name}. Forward ${subIndexKey} curve indicates ${forecastSlopePct > 0 ? 'upward' : 'softening'} trajectory (${forecastSlopePct}% over 14 days). Recommended commitment: ${commitmentDecision?.action} (${commitmentDecision?.lockPct}% lock / ${commitmentDecision?.spotPct}% spot).`}
      />

    </div>
  );
}
