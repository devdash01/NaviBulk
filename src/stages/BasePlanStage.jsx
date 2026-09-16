// SAIL NaviBulk — Stage 05: Optimized Base Plan
// Best executable plan for the nominated original source. Establishes the authoritative benchmark.
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS } from '../data/portConstraints.js';
import { NAUTICAL_DISTANCE_MATRIX } from '../data/freightData.js';
import { CheckSquare, Ship, Compass, Anchor, MapPin, Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';

export default function BasePlanStage() {
  const {
    inputs,
    recommendedVessel,
    baseDeliveredCost,
    timingEval,
    routeRisks,
    advanceStage
  } = useDecisionEngine();

  const destPort = EAST_COAST_PORTS[inputs.destinationPortKey] || EAST_COAST_PORTS.paradip;
  const loadPort = FOREIGN_LOAD_PORTS[inputs.originCountry] || { portName: 'Nominated Load Berth', country: inputs.originCountry };
  const distanceOriginKey = inputs.originCountry === 'United States' ? 'US' : inputs.originCountry;
  const distanceNm = NAUTICAL_DISTANCE_MATRIX[distanceOriginKey]?.[inputs.destinationPortKey] || 4850;
  const speedKnots = inputs.speedKnots || 13.0;
  const transitDays = baseDeliveredCost?.transitDays || Number((distanceNm / (speedKnots * 24)).toFixed(1));

  const conclusionText = `BASE PLAN ESTABLISHED: Original source (${inputs.originCountry}) is fully optimized utilizing ${recommendedVessel?.vesselName || 'Panamax'} at ${speedKnots.toFixed(1)} kn operating speed ($${baseDeliveredCost.totalLanded}/MT, $${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD). This plan represents the authoritative baseline against which alternative basins will be challenged in subsequent stages.`;

  return (
    <StageShell
      stageId="baseplan"
      conclusion={conclusionText}
      nextActionLabel="Determine Procurement Exposure →"
      onNextAction={() => advanceStage('baseplan')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── 1. AUTHORITATIVE BENCHMARK BANNER ── */}
        <div style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '8px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Authoritative Baseline Specification
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.2rem 0 0.15rem' }}>
              {inputs.tonnage.toLocaleString()} MT {inputs.cargoType} • {inputs.originCountry} → {destPort.name}
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Nominated Vessel: <strong style={{ color: '#F8FAFC' }}>{recommendedVessel?.vesselName}</strong> • Contract: <strong style={{ color: '#F8FAFC' }}>{inputs.contractType?.toUpperCase()}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Delivered Cost Benchmark</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
              ${baseDeliveredCost.totalLanded} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>/ MT</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
              Total: ${baseDeliveredCost.totalOutlayUsd.toLocaleString()} USD (₹{baseDeliveredCost.totalOutlayInrCr} Cr)
            </div>
          </div>
        </div>

        {/* ── 2. VISUALLY RICH EXECUTION ROUTE MAPPER ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
            Physical Voyage Execution Chain
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', position: 'relative' }}>
            
            {/* Step 1: Source */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>1. Supply Basin</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                {inputs.originCountry}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                {inputs.cargoType}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.4rem' }}>
                [Approved Supplier Mandate]
              </div>
            </div>

            {/* Step 2: Load Port */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>2. Load Terminal</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                {loadPort.portName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                Draft: {loadPort.maxDraftM || 18.5}m
              </div>
              <div style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: 700, marginTop: '0.4rem' }}>
                Deepwater Load Berth
              </div>
            </div>

            {/* Step 3: Sea Route */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '1rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>3. Ocean Transit</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E40AF', marginTop: '0.25rem' }}>
                {distanceNm.toLocaleString()} NM
              </div>
              <div style={{ fontSize: '0.72rem', color: '#1E40AF', marginTop: '0.2rem' }}>
                {transitDays} Days @ {speedKnots} kn
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.4rem' }}>
                [{speedKnots} kn Voyage Assumption]
              </div>
            </div>

            {/* Step 4: Destination Port */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>4. Discharge Port</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                {destPort.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                Max Berth Draft: {destPort.maxDraft || destPort.cargoBerths?.maxDraft || 14.5}m
              </div>
              <div style={{ fontSize: '0.68rem', color: destPort.requiresLightering ? '#B45309' : '#16A34A', fontWeight: 700, marginTop: '0.4rem' }}>
                {destPort.requiresLightering ? 'Lightering Required' : 'Direct Berth Clearance'}
              </div>
            </div>

            {/* Step 5: Steel Plant */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>5. Delivery Ingot</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                SAIL Plants
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                {destPort.servesPlants?.join(', ') || 'RSP, BSL, DSP'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.4rem' }}>
                Evacuation Rail Link
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. EXECUTION METRIC CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Vessel Dimensions</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
              {recommendedVessel?.vesselName} ({recommendedVessel?.dwt?.toLocaleString()} DWT)
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
              Draft: {recommendedVessel?.feasibility?.vesselDraftM}m • Beam: {recommendedVessel?.feasibility?.beamM || 32.2}m
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Laycan Window Timing</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
              +{inputs.laycanDays} Days Execution Window
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
              Optimal Charter Date: {timingEval?.recommendedDateStr || 'Prompt Window'}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Backhaul Monetization</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#16A34A', marginTop: '0.2rem' }}>
              Optional Ballast Leg
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
              India → Southeast Asia Iron Ore return cargo match eligible
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #86EFAC', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Bunker & Speed Optimization</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#16A34A', marginTop: '0.2rem' }}>
              {baseDeliveredCost?.curBurnTpd || 22.4} TPD @ {speedKnots.toFixed(1)} kn
            </div>
            <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '0.2rem' }}>
              Savings: +${baseDeliveredCost?.speedBunkerSavingsUsd?.toLocaleString() || '0'} USD (-{baseDeliveredCost?.co2SavedTons || 0} MT CO₂)
            </div>
          </div>

        </div>

      </div>
    </StageShell>
  );
}
