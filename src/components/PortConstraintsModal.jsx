// Stage 3: Port Constraints Database Matrix Modal Component
import React, { useState } from 'react';
import { X, Anchor, Globe, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS, ASSUMED_LIGHTERING_TIME_PENALTY_DAYS, ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD } from '../data/portConstraints';

export default function PortConstraintsModal({ isOpen, onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('eastCoast');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '980px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Anchor size={22} color="var(--accent-cyan)" />
            <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-hero)' }}>Port Constraints Rule Matrix</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Non-ML physical berth capability lookup. Verified fields are cited. Unverified placeholders are explicitly labeled.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Data Hygiene Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#34D399' }}>
            <ShieldCheck size={12} /> Verified (User-supplied or cited)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#F59E0B' }}>
            <AlertTriangle size={12} /> Unverified Placeholder (Source needed)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#94A3B8' }}>
            <Info size={12} /> Illustrative Assumption (Not sourced data)
          </span>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            className={`btn ${activeSubTab === 'eastCoast' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('eastCoast')}
            style={{ fontSize: '0.8rem' }}
          >
            Indian East Coast Discharge Ports ({Object.keys(EAST_COAST_PORTS).length})
          </button>
          <button
            className={`btn ${activeSubTab === 'foreign' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('foreign')}
            style={{ fontSize: '0.8rem' }}
          >
            Foreign Overseas Load Ports ({Object.keys(FOREIGN_LOAD_PORTS).length})
          </button>
        </div>

        {/* East Coast Port Matrix */}
        {activeSubTab === 'eastCoast' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', color: 'var(--accent-blue)', borderBottom: '2px solid var(--border-medium)' }}>
                  <th style={{ padding: '0.65rem' }}>Port Name</th>
                  <th style={{ padding: '0.65rem' }}>Capability Regime</th>
                  <th style={{ padding: '0.65rem' }}>Max Draft</th>
                  <th style={{ padding: '0.65rem' }}>Max LOA / Beam</th>
                  <th style={{ padding: '0.65rem' }}>Max DWT Cap</th>
                  <th style={{ padding: '0.65rem' }}>Handling Rate (t/day)</th>
                  <th style={{ padding: '0.65rem' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(EAST_COAST_PORTS).map((pKey) => {
                  const p = EAST_COAST_PORTS[pKey];
                  const isHaldia = p.id === 'haldia';
                  const isSagar = p.id === 'sagar';
                  const isDeep = p.maxDraft >= 17.5;

                  // For Paradip, render two separate rows for the two regimes
                  if (pKey === 'paradip') {
                    return (
                      <React.Fragment key="paradip">
                        {/* Paradip Row 1: Cargo Berths */}
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--text-hero)' }} rowSpan={2}>
                            {p.name}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{p.state}</div>
                          </td>
                          <td style={{ padding: '0.65rem' }}>
                            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Cargo Berths (CB-01, CB-02, IO Berth)</span>
                          </td>
                          <td style={{ padding: '0.65rem', fontWeight: 700, color: '#34D399' }}>
                            {p.cargoBerths.maxDraft} m <ShieldCheck size={10} style={{ display: 'inline', marginLeft: '2px' }} />
                          </td>
                          <td style={{ padding: '0.65rem' }}>
                            {p.cargoBerths.maxLOA}m / {p.cargoBerths.maxBeam}m <ShieldCheck size={10} style={{ display: 'inline', marginLeft: '2px', color: '#34D399' }} />
                          </td>
                          <td style={{ padding: '0.65rem', fontWeight: 600 }}>
                            {p.cargoBerths.maxDWT.toLocaleString()} DWT <ShieldCheck size={10} style={{ display: 'inline', marginLeft: '2px', color: '#34D399' }} />
                          </td>
                          <td style={{ padding: '0.65rem', color: '#F59E0B', fontSize: '0.72rem' }}>
                            <AlertTriangle size={11} style={{ display: 'inline' }} /> Placeholder
                          </td>
                          <td style={{ padding: '0.65rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <cite style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.2rem' }}>Notice MD/SHS/TECH-26/2020/750</cite>
                            Per cargo berth. 14.5m draft limit applies to actual berth assignment.
                          </td>
                        </tr>
                        {/* Paradip Row 2: Approach Channel */}
                        <tr style={{ borderBottom: '2px solid var(--border-subtle)', background: 'rgba(14, 165, 233, 0.04)' }}>
                          <td style={{ padding: '0.65rem' }}>
                            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Approach Channel (Capability Statement)</span>
                          </td>
                          <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                            {p.approachChannel.maxDraft} m <ShieldCheck size={10} style={{ display: 'inline', marginLeft: '2px', color: '#34D399' }} />
                          </td>
                          <td style={{ padding: '0.65rem' }}>
                            {p.approachChannel.maxBeam}m beam <ShieldCheck size={10} style={{ display: 'inline', marginLeft: '2px', color: '#34D399' }} />
                          </td>
                          <td style={{ padding: '0.65rem', fontWeight: 600 }}>
                            {p.approachChannel.maxDWT.toLocaleString()} DWT <ShieldCheck size={10} style={{ display: 'inline', marginLeft: '2px', color: '#34D399' }} />
                          </td>
                          <td style={{ padding: '0.65rem', color: '#F59E0B', fontSize: '0.72rem' }}>
                            <AlertTriangle size={11} style={{ display: 'inline' }} /> Placeholder
                          </td>
                          <td style={{ padding: '0.65rem', fontSize: '0.72rem', color: '#F59E0B' }}>
                            <cite style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.2rem' }}>PPA Official Site — Capesize Handling Statement</cite>
                            Channel depth only — does not guarantee specific cargo berth access at 16.5m draft.
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  }

                  return (
                    <tr
                      key={pKey}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isHaldia
                          ? 'rgba(239, 68, 68, 0.06)'
                          : isSagar
                          ? 'rgba(245, 158, 11, 0.06)'
                          : isDeep
                          ? 'rgba(16, 185, 129, 0.04)'
                          : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--text-hero)' }}>
                        {p.name}
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{p.state}</div>
                        {isSagar && (
                          <span className="badge badge-warning" style={{ display: 'block', width: 'fit-content', marginTop: '0.2rem', fontSize: '0.65rem' }}>
                            Transshipment Anchorage
                          </span>
                        )}
                        {isHaldia && (
                          <span className="badge badge-danger" style={{ display: 'block', width: 'fit-content', marginTop: '0.2rem', fontSize: '0.65rem' }}>
                            8.5–9.2m Draft (General Docks)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          {isSagar ? 'Open Water Anchorage' : 'Single Berth Regime'}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: isHaldia ? '#F87171' : isDeep ? '#34D399' : 'var(--text-main)' }}>
                        {p.maxDraft} m{' '}
                        <ShieldCheck size={10} style={{ display: 'inline', marginLeft: '2px', color: '#34D399' }} />
                      </td>
                      <td style={{ padding: '0.65rem' }}>
                        {p.maxLOA}m /{' '}
                        {isSagar || isHaldia ? (
                          <span style={{ color: '#F59E0B' }}>
                            {p.maxBeam}m <AlertTriangle size={10} style={{ display: 'inline' }} />
                          </span>
                        ) : (
                          <span>{p.maxBeam}m</span>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem', fontWeight: 600 }}>
                        {isSagar ? (
                          <span style={{ color: '#F59E0B', fontSize: '0.72rem' }}>
                            <AlertTriangle size={10} style={{ display: 'inline' }} /> Placeholder
                          </span>
                        ) : (
                          `${p.maxDWT.toLocaleString()} DWT`
                        )}
                      </td>
                      <td style={{ padding: '0.65rem', color: '#F59E0B', fontSize: '0.72rem' }}>
                        <AlertTriangle size={11} style={{ display: 'inline' }} /> Placeholder
                      </td>
                      <td style={{ padding: '0.65rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <cite style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.2rem' }}>{p.citation}</cite>
                        {isSagar && (
                          <span style={{ color: '#F59E0B', display: 'block', marginTop: '0.2rem', fontSize: '0.7rem' }}>
                            ⚠ Lightering penalty: est. +{ASSUMED_LIGHTERING_TIME_PENALTY_DAYS} days / ${ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD}/t
                            <em style={{ display: 'block', color: 'var(--text-dim)' }}>[Illustrative assumption — not sourced data]</em>
                          </span>
                        )}
                        {!isSagar && p.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '6px', fontSize: '0.75rem', color: '#FBBF24' }}>
              <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
              All foreign load port figures (draft, LOA, beam, DWT, loading rates) are <strong>[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED]</strong>. Typically published in Port Authority Marine Manuals / Terminal Fact Sheets.
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', color: 'var(--accent-blue)', borderBottom: '2px solid var(--border-medium)' }}>
                  <th style={{ padding: '0.75rem' }}>Country &amp; Ports</th>
                  <th style={{ padding: '0.75rem' }}>Cargoes Loadable</th>
                  <th style={{ padding: '0.75rem' }}>Max Draft / LOA</th>
                  <th style={{ padding: '0.75rem' }}>Max DWT Cap</th>
                  <th style={{ padding: '0.75rem' }}>Loading Speed</th>
                  <th style={{ padding: '0.75rem' }}>Risk / Sanctions Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(FOREIGN_LOAD_PORTS).map((cKey) => {
                  const f = FOREIGN_LOAD_PORTS[cKey];
                  return (
                    <tr key={cKey} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-hero)' }}>
                        {f.country}
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400 }}>{f.ports.join(', ')}</div>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--accent-blue)' }}>{f.cargoTypes.join(', ')}</td>
                      <td style={{ padding: '0.75rem', color: '#F59E0B', fontSize: '0.75rem' }}>
                        <AlertTriangle size={10} style={{ display: 'inline' }} /> {f.maxDraft}m / {f.maxLOA}m (Placeholder)
                      </td>
                      <td style={{ padding: '0.75rem', color: '#F59E0B', fontSize: '0.75rem' }}>
                        <AlertTriangle size={10} style={{ display: 'inline' }} /> {f.maxDWT.toLocaleString()} DWT (Placeholder)
                      </td>
                      <td style={{ padding: '0.75rem', color: '#F59E0B', fontSize: '0.75rem' }}>
                        <AlertTriangle size={10} style={{ display: 'inline' }} /> {f.loadRateTpd.toLocaleString()} t/day (Placeholder)
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {f.sanctionsFlag ? (
                          <span className="badge badge-danger">⚠️ Sanctions Risk Flag</span>
                        ) : (
                          <span className="badge badge-success">Clear Operations</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Port Database
          </button>
        </div>
      </div>
    </div>
  );
}
