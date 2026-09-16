// Stage 7: Risk Mitigation Panel Component
import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function RiskAlertsPanel({ riskEval }) {
  if (!riskEval || !riskEval.riskCards) return null;

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} color={riskEval.highRiskCount > 0 ? 'var(--risk-high)' : 'var(--accent-cyan)'} />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-hero)' }}>Risk Mitigation &amp; Public Data Proxies</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="proxy-badge">3 FREE RISK PROXIES ACTIVE</span>
          <span className={`badge ${riskEval.overallRiskScore > 50 ? 'badge-warning' : 'badge-success'}`}>
            Route Risk Index: {riskEval.overallRiskScore} / 100
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
        {riskEval.riskCards.map((r) => {
          const isHigh = r.level.includes('High');
          const isMod = r.level.includes('Moderate');

          return (
            <div
              key={r.id}
              style={{
                background: isHigh ? 'var(--risk-high-bg)' : isMod ? 'var(--risk-moderate-bg)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${isHigh ? 'var(--risk-high-border)' : isMod ? 'var(--risk-moderate-border)' : 'var(--border-subtle)'}`,
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className={`badge ${isHigh ? 'badge-danger' : isMod ? 'badge-warning' : 'badge-success'}`}>
                    {r.level} Risk
                  </span>
                  <span className="proxy-badge" style={{ fontSize: '0.65rem' }}>
                    {r.sourceLabel}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-hero)', marginBottom: '0.4rem' }}>{r.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', minHeight: '44px' }}>{r.message}</p>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.55rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '0.2rem' }}>Recommended Mitigation:</strong>
                {r.mitigation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
