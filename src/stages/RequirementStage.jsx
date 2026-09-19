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
      nextActionLabel="Analyze Market Signal"
      onNextAction={() => advanceStage('requirement')}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* ── LEFT: COMMERCIAL REQUIREMENT SPECIFICATION FORM ── */}
        <div 
          className="analytical-card"
          style={{
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={17} color="var(--accent-blue)" />
              <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Commercial Mandate Specification
              </h2>
            </div>
            <span className="provenance-label">
              MANDATE INPUT
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Commodity & Tonnage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Commodity
                </label>
                <select
                  value={inputs.cargoType}
                  onChange={(e) => handleRequirementChange({ cargoType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    background: '#FFFFFF',
                    fontWeight: 600,
                    outline: 'none'
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
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Consignment Size (MT)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={inputs.tonnage}
                  onChange={(e) => handleRequirementChange({ tonnage: Number(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Origin & Destination */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Nominated Origin
                </label>
                <select
                  value={inputs.originCountry}
                  onChange={(e) => handleRequirementChange({ originCountry: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    background: '#FFFFFF',
                    fontWeight: 600,
                    outline: 'none'
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
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  SAIL Destination Port
                </label>
                <select
                  value={inputs.destinationPortKey}
                  onChange={(e) => handleRequirementChange({ destinationPortKey: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    background: '#FFFFFF',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="paradip">Paradip Port (Draft 14.5m)</option>
                  <option value="vizag">Visakhapatnam Outer Harbor (Draft 18.1m)</option>
                  <option value="gangavaram">Gangavaram Deepwater (Draft 19.5m)</option>
                  <option value="haldia">Haldia Dock Complex (Draft 8.5m - Sagar Lightering)</option>
                  <option value="dhamra">Dhamra Port (Draft 18.0m)</option>
                </select>
              </div>
            </div>

            {/* Laycan Window & Contract Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Laycan Window (Days Out)
                </label>
                <select
                  value={inputs.laycanDays}
                  onChange={(e) => handleRequirementChange({ laycanDays: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    background: '#FFFFFF',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value={7}>Prompt (+7 Days)</option>
                  <option value={14}>Standard (+14 Days)</option>
                  <option value={21}>Extended (+21 Days)</option>
                  <option value={30}>Forward Month (+30 Days)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Contract Structure
                </label>
                <select
                  value={inputs.contractType}
                  onChange={(e) => handleRequirementChange({ contractType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    background: '#FFFFFF',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="coa">Contract of Affreightment (COA Index-Linked)</option>
                  <option value="spot">Single Voyage Spot Charter</option>
                  <option value="time_charter">Short-Term Time Charter</option>
                </select>
              </div>
            </div>

            {/* Steaming Assumption & Draft Tolerance */}
            <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Steaming Speed Baseline</span>
                <span className="provenance-label">[VOYAGE ASSUMPTION]</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Operating Steaming Mode</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  {(inputs.speedKnots || 13.0).toFixed(1)} knots
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Sea Transit: {((routeDistanceNm) / ((inputs.speedKnots || 13.0) * 24)).toFixed(1)} sea days • Laycan: {inputs.laycanDays} days
              </div>
            </div>

            {/* Draft Tolerance Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.72rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Max Draft Tolerance</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{inputs.maxDraftTolerance} meters</span>
              </div>
              <input
                type="range"
                min="8.0"
                max="19.5"
                step="0.5"
                value={inputs.maxDraftTolerance}
                onChange={(e) => handleRequirementChange({ maxDraftTolerance: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span>8.0m (Haldia/Restricted)</span>
                <span>14.5m (Paradip)</span>
                <span>19.5m (Gangavaram Deep)</span>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            <span>Parameters synchronize reactively with downstream feasibility and economics engines.</span>
          </div>
        </div>

        {/* ── RIGHT: ROUTE PREVIEW & PHYSICAL PORT CONSTRAINTS ── */}
        <div 
          className="analytical-card"
          style={{
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Anchor size={17} color="var(--accent-blue)" />
                <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Corridor Physical & Load Constraints
                </h2>
              </div>
              <span className="provenance-label">
                PORT CONSTRAINTS MATRIX
              </span>
            </div>

            {/* Route Summary Metric Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nautical Distance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {routeDistanceNm.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>NM</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-blue)', fontWeight: 600, marginTop: '0.2rem' }}>Direct Corridor</div>
              </div>

              <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sea Transit</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {(routeDistanceNm / ((inputs.speedKnots || 13.0) * 24)).toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Days</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>@ {(inputs.speedKnots || 13.0).toFixed(1)} kn Speed</div>
              </div>

              <div style={{ background: 'var(--surface-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Berth Draft</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {destDraft} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>m</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: destPortInfo.requiresLightering ? 'var(--warning)' : 'var(--success)', fontWeight: 600, marginTop: '0.2rem' }}>
                  {destPortInfo.requiresLightering ? 'Lightering Needed' : 'Deep Berth'}
                </div>
              </div>
            </div>

            {/* Load Port Terminal Specifications */}
            {(() => {
              const originKey = inputs.originCountry === 'United States' ? 'US' : inputs.originCountry;
              const loadPortInfo = FOREIGN_LOAD_PORTS[originKey] || FOREIGN_LOAD_PORTS.Australia;
              return (
                <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', background: '#F8FAFC', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                      Load Terminal: {loadPortInfo.ports?.[0] || 'Nominated Export Terminal'} ({inputs.originCountry})
                    </div>
                    <span className="pill-badge status-cobalt" style={{ fontSize: '0.6rem' }}>
                      MAX LOAD: {loadPortInfo.maxDWT ? `${(loadPortInfo.maxDWT / 1000).toFixed(0)}k DWT` : 'Capesize Ready'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.74rem', color: '#475569' }}>
                    <div>Terminal Draft: <strong>{loadPortInfo.maxDraft || 18.5}m</strong></div>
                    <div>Loading Rate: <strong>{(loadPortInfo.loadRateTpd || 65000).toLocaleString()} TPD</strong></div>
                    <div>Standard Class: <strong>{loadPortInfo.typicalVesselClass || 'Panamax / Cape'}</strong></div>
                    <div>Est. Load Dues: <strong>${(loadPortInfo.avgPortDuesUsd || 35000).toLocaleString()} USD</strong></div>
                  </div>
                </div>
              );
            })()}

            {/* Destination Port Infrastructure Specs */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', background: 'var(--surface-app)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                Destination: {destPortInfo.name} ({destPortInfo.state})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Discharge Rate:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{destPortInfo.dischargeRateTpd?.toLocaleString() || (destPortInfo.handlingCapacityTpd || 35000).toLocaleString()} TPD</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Max LOA / Beam:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{destPortInfo.maxLOA || 300}m / {destPortInfo.maxBeam || 48}m</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>SAIL Plants:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{destPortInfo.servesPlants?.join(', ') || 'RSP, BSL, DSP'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Berthing Regime:</span>{' '}
                  <strong style={{ color: destPortInfo.requiresLightering ? 'var(--warning)' : 'var(--success)' }}>
                    {destPortInfo.requiresLightering ? 'Anchorage Lightering' : 'Direct Berth'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.85rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Requirement Status: <strong style={{ color: '#16A34A' }}>Active & Ready for Market Assessment</strong>
            </span>
          </div>
        </div>

      </div>
    </StageShell>
  );
}
