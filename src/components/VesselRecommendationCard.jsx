import React from 'react';
import { Ship, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Anchor } from 'lucide-react';
import { ASSUMED_LIGHTERING_TIME_PENALTY_DAYS, ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD } from '../data/portConstraints';

export default function VesselRecommendationCard({ rankedVessels, selectedVesselKey, onSelectVessel, onLockCharter }) {
  if (!rankedVessels || rankedVessels.length === 0) return null;

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ship size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-hero)' }}>Vessel Ranking &amp; Economics</h2>
        </div>
        <span className="proxy-badge-cyan">Draft Filter Applied</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem' }}>
        {rankedVessels.map((v, index) => {
          const isSelected = selectedVesselKey === v.vesselKey;
          const isTopRanked = index === 0 && v.feasibility.feasible;
          const isFeasible = v.feasibility.feasible;

          return (
            <div
              key={v.vesselKey}
              onClick={() => isFeasible && onSelectVessel(v.vesselKey)}
              className={`glass-card`}
              style={{
                position: 'relative',
                background: isSelected ? '#EFF6FF' : isFeasible ? '#FFFFFF' : '#F8FAFC',
                borderColor: isSelected ? 'var(--accent-blue)' : isTopRanked ? 'var(--gain-border)' : isFeasible ? 'var(--border-subtle)' : 'var(--loss-border)',
                cursor: isFeasible ? 'pointer' : 'not-allowed',
                opacity: isFeasible ? 1 : 0.65,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isSelected ? '0 0 0 2px rgba(2,132,199,0.2)' : 'var(--shadow-sm)',
                transition: 'all 0.18s ease',
              }}
            >
              {/* Top Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className={`badge ${isFeasible ? (isTopRanked ? 'badge-success' : 'badge-info') : 'badge-danger'}`}>
                  {isFeasible ? (
                    <>
                      <CheckCircle2 size={12} /> {isTopRanked ? 'Top Recommendation' : 'Feasible Option'}
                    </>
                  ) : (
                    <>
                      <XCircle size={12} /> Draft / Physical Blocked
                    </>
                  )}
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Class: {v.subIndex}
                </span>
              </div>

              {/* Vessel Name & Cost per Tonne */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-hero)', marginBottom: '0.25rem' }}>{v.vesselName}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', minHeight: '32px' }}>{v.description}</p>

              {/* Pricing & Duration Block */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. Cost / Tonne:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isFeasible ? 'var(--accent-blue)' : 'var(--text-dim)' }}>
                    ${v.costPerTonneUsd}
                    <span style={{ fontSize: '0.75rem', fontWeight: 400 }}> /t</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Total Voyage Cost:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-hero)' }}>${v.totalVoyageCostUsd.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Turnaround Duration:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-hero)' }}>{v.totalVoyageDays} Days</span>
                </div>
              </div>

              {/* Feasibility Issues */}
              {!isFeasible && v.feasibility.issues.length > 0 && (
                <div style={{ background: 'var(--risk-high-bg)', border: '1px solid var(--risk-high-border)', borderRadius: '6px', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--risk-high)', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {v.feasibility.issues[0]}
                </div>
              )}

              {v.feasibility.requiresSagarTransshipment && isFeasible && (
                <div style={{ background: 'var(--risk-moderate-bg)', border: '1px solid var(--risk-moderate-border)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.72rem', color: 'var(--risk-moderate)', marginBottom: '0.75rem' }}>
                  <Anchor size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  Sagar/Sandheads two-stage transshipment required.
                  <br />
                  <em style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    [Illustrative] Est. +{ASSUMED_LIGHTERING_TIME_PENALTY_DAYS} days / ${ASSUMED_TRANSSHIPMENT_FEE_PER_TONNE_USD}/t fee included.
                  </em>
                </div>
              )}

              {/* Select & Lock Button */}
              {isTopRanked && isFeasible && (
                <button
                  className="btn btn-success"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLockCharter(v);
                  }}
                  style={{ width: '100%', fontSize: '0.8rem', marginTop: 'auto' }}
                >
                  Lock This Recommendation &amp; Export Charter Request <ArrowRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
