// SAIL NaviBulk — Stage 01: Commercial Cargo Requirement
// Defines the operational problem NaviBulk solves. Material changes invalidate downstream stages.
import React, { useState } from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS } from '../data/portConstraints.js';
import { NAUTICAL_DISTANCE_MATRIX } from '../data/freightData.js';
import { Anchor, MapPin, Calendar, Layers, Shield, FileText, ArrowRight } from 'lucide-react';

export default function RequirementStage() {
  const { inputs, handleRequirementChange, advanceStage } = useDecisionEngine();

  const destPortInfo = EAST_COAST_PORTS[inputs.destinationPortKey] || EAST_COAST_PORTS.paradip;
  const destDraft = destPortInfo.maxDraft || destPortInfo.cargoBerths?.maxDraft || 14.5;
  const distanceOriginKey = inputs.originCountry === 'United States' ? 'US' : inputs.originCountry;
  const routeDistanceNm = NAUTICAL_DISTANCE_MATRIX[distanceOriginKey]?.[inputs.destinationPortKey] || 4850;

  return (
    <StageShell
      stageId="requirement"
      conclusion={`Commercial requirement defined for ${inputs.tonnage.toLocaleString()} MT of ${inputs.cargoType} from ${inputs.originCountry} to ${destPortInfo.name}. Physical route measures ${routeDistanceNm.toLocaleString()} NM with a maximum destination berth draft of ${destDraft}m. Downstream feasibility and market analysis will solve for this specific parameter set.`}
      nextActionLabel="Analyze Market Signal →"
      onNextAction={() => advanceStage('requirement')}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* ── LEFT: COMMERCIAL REQUIREMENT SPECIFICATION FORM ── */}
        <div 
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <FileText size={17} color="#2563EB" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Voyage Mandate Parameters
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Commodity & Tonnage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Commodity
                </label>
                <select
                  value={inputs.cargoType}
                  onChange={(e) => handleRequirementChange({ cargoType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '5px',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  <option value="Coking Coal">Coking Coal (Prime Hard)</option>
                  <option value="Thermal Coal">Thermal Coal</option>
                  <option value="PCI Coal">PCI Coal</option>
                  <option value="Iron Ore">Iron Ore Fines / Pellets</option>
                  <option value="Limestone">Limestone / Flux</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Consignment Size (MT)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={inputs.tonnage}
                  onChange={(e) => handleRequirementChange({ tonnage: Number(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '5px',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            </div>

            {/* Origin & Destination */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Nominated Origin
                </label>
                <select
                  value={inputs.originCountry}
                  onChange={(e) => handleRequirementChange({ originCountry: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '5px',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  <option value="Australia">Australia (Hay Point / Gladstone)</option>
                  <option value="Mozambique">Mozambique (Beira / Nacala)</option>
                  <option value="United States">United States (Hampton Roads)</option>
                  <option value="Indonesia">Indonesia (Taboneo)</option>
                  <option value="Russia">Russia (Vostochny)</option>
                  <option value="South Africa">South Africa (Richards Bay)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  SAIL Destination Port
                </label>
                <select
                  value={inputs.destinationPortKey}
                  onChange={(e) => handleRequirementChange({ destinationPortKey: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '5px',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  <option value="paradip">Paradip Port (Draft 14.5m)</option>
                  <option value="visakhapatnam">Visakhapatnam (Outer Draft 17.5m)</option>
                  <option value="gangavaram">Gangavaram Deepwater (Draft 18.5m)</option>
                  <option value="haldia">Haldia (Restricted Draft 8.2m - Sagar)</option>
                  <option value="dhamra">Dhamra Port (Draft 17.5m)</option>
                </select>
              </div>
            </div>

            {/* Laycan Window & Contract Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Laycan Window (Days Out)
                </label>
                <select
                  value={inputs.laycanDays}
                  onChange={(e) => handleRequirementChange({ laycanDays: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '5px',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  <option value={7}>Prompt (+7 Days)</option>
                  <option value={14}>Standard (+14 Days)</option>
                  <option value={21}>Extended (+21 Days)</option>
                  <option value={30}>Forward Month (+30 Days)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Contract Structure
                </label>
                <select
                  value={inputs.contractType}
                  onChange={(e) => handleRequirementChange({ contractType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '5px',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  <option value="coa">Contract of Affreightment (COA Index-Linked)</option>
                  <option value="spot">Single Voyage Spot Charter</option>
                  <option value="time_charter">Short-Term Time Charter</option>
                </select>
              </div>
            </div>

            {/* Draft Tolerance Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.72rem' }}>
                <span style={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Max Draft Tolerance</span>
                <span style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{inputs.maxDraftTolerance} meters</span>
              </div>
              <input
                type="range"
                min="8.0"
                max="19.0"
                step="0.5"
                value={inputs.maxDraftTolerance}
                onChange={(e) => handleRequirementChange({ maxDraftTolerance: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94A3B8' }}>
                <span>8.0m (Haldia/Restricted)</span>
                <span>14.5m (Paradip)</span>
                <span>18.5m+ (Deepwater Cape)</span>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: '#64748B' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>Parameters synchronize live with downstream feasibility and economics engines.</span>
          </div>
        </div>

        {/* ── RIGHT: ROUTE PREVIEW & PHYSICAL PORT CONSTRAINTS ── */}
        <div 
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
              <Anchor size={17} color="#0F172A" />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Corridor Physical Constraints
              </h2>
            </div>

            {/* Route Summary Metric Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Nautical Distance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {routeDistanceNm.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>NM</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 600, marginTop: '0.2rem' }}>Direct Corridor</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Sea Transit</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {(routeDistanceNm / (13 * 24)).toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Days</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.2rem' }}>@ 13.0 kn Speed</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Berth Draft</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {destDraft} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>m</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: destPortInfo.requiresLightering ? '#B45309' : '#16A34A', fontWeight: 600, marginTop: '0.2rem' }}>
                  {destPortInfo.requiresLightering ? 'Lightering Needed' : 'Deep Berth'}
                </div>
              </div>
            </div>

            {/* Destination Port Infrastructure Specs */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1rem', background: '#FAFAFA', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                Destination: {destPortInfo.name} ({destPortInfo.state})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: '#64748B' }}>Discharge Rate:</span>{' '}
                  <strong style={{ color: '#0F172A' }}>{destPortInfo.dischargeRateTpd?.toLocaleString() || 25000} TPD</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Tidal Range:</span>{' '}
                  <strong style={{ color: '#0F172A' }}>{destPortInfo.tideVariationM || 2.2} m</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>SAIL Plants:</span>{' '}
                  <strong style={{ color: '#0F172A' }}>{destPortInfo.servesPlants?.join(', ') || 'RSP, BSL, DSP'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Berthing Regime:</span>{' '}
                  <strong style={{ color: destPortInfo.requiresLightering ? '#B45309' : '#16A34A' }}>
                    {destPortInfo.requiresLightering ? 'Anchorage Lightering' : 'Direct Berth'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Requirement Status: <strong style={{ color: '#16A34A' }}>Active & Ready for Market Assessment</strong>
            </span>
          </div>
        </div>

      </div>
    </StageShell>
  );
}
