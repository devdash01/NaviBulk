// Idle Leg Repositioning Card Component
import React from 'react';
import { RefreshCw, Navigation } from 'lucide-react';

export default function IdleLegCard({ repositioningLegs, destinationPortName }) {
  if (!repositioningLegs || repositioningLegs.length === 0) return null;

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-hero)' }}>
            Idle Scenario Management &amp; Deadhead Repositioning
          </h2>
        </div>
        <span className="proxy-badge">Representative Pairings</span>
      </div>

      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Representative outbound export opportunities near <strong>{destinationPortName}</strong> after discharge. Net bunker offset uses verified $829.50/t VLSFO pricing.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {repositioningLegs.map((leg) => (
          <div
            key={leg.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  {leg.rating}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  <Navigation size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />-{leg.deadheadReductionPct}% Deadhead
                </span>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-hero)', marginBottom: '0.2rem' }}>{leg.route}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600, marginBottom: '0.5rem' }}>Cargo: {leg.cargo}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{leg.description}</p>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Est. Freight Rate:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-hero)' }}>${leg.estRatePerTonneUsd}/t</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Net Bunker Subsidy:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gain)' }}>+${leg.netRepositioningBenefitUsd.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
