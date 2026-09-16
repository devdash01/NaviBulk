// SAIL NaviBulk - V2 Decision Intelligence Cockpit Panel
// Displays optimal vessel, contract, timing, risk-adjusted economics,
// Base/Bull/Bear scenarios, contract alternatives, and explainability points.

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  HelpCircle, 
  Anchor, 
  Layers, 
  Sparkles,
  ChevronRight,
  Info,
  Server
} from 'lucide-react';
import { fetchV2Recommendation } from '../services/decisionIntelligenceService.js';

export default function DecisionIntelligencePanel({ inputs, onSelectVessel }) {
  const [v2Data, setV2Data] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'scenarios' | 'contracts' | 'timing'
  const [sourceTag, setSourceTag] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchV2Recommendation(inputs).then((res) => {
      if (isMounted) {
        setV2Data(res.data);
        setSourceTag(res.source === 'BACKEND_V2_FASTAPI' ? 'FastAPI V2 Master Engine (Server)' : 'Local Decision Fallback');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [inputs]);

  if (loading || !v2Data) {
    return (
      <div className="enterprise-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', color: '#0284C7' }}>
          <Sparkles size={20} className="animate-spin" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Solving Multi-Horizon Decision Optimization Pipeline...</span>
        </div>
      </div>
    );
  }

  const rec = v2Data.recommendation || {};
  const econ = v2Data.economics || {};
  const risk = v2Data.risk || {};
  const scenarios = v2Data.scenarios || {};
  const contracts = v2Data.contracts || [];
  const timing = v2Data.timing_options || [];
  const explanations = v2Data.explanation || [];

  return (
    <div 
      className="enterprise-card" 
      style={{ 
        background: '#FFFFFF', 
        border: '2px solid #0284C7', 
        padding: '1.5rem', 
        boxShadow: '0 8px 30px rgba(2, 132, 199, 0.12)',
        borderRadius: '16px',
        marginBottom: '1.5rem'
      }}
    >
      {/* ── Top Header & Confidence Badge ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={20} color="#0284C7" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284C7' }}>
              V2 Decision Intelligence Pipeline
            </span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Server size={11} /> {sourceTag}
            </span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Optimal Charter Recommendation: {rec.vessel_name}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0' }}>
            Multi-constraint objective minimizing risk-adjusted delivered cost to East Coast India.
          </p>
        </div>

        {/* Confidence Tier Badge */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '999px', background: rec.confidence === 'HIGH' ? '#DCFCE7' : '#FEF9C3', border: `1px solid ${rec.confidence === 'HIGH' ? '#86EFAC' : '#FDE047'}` }}>
            <Award size={16} color={rec.confidence === 'HIGH' ? '#15803D' : '#A16207'} />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: rec.confidence === 'HIGH' ? '#15803D' : '#A16207' }}>
              {rec.confidence} CONFIDENCE
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', maxWidth: '240px' }}>
            {rec.confidence_reason}
          </div>
        </div>
      </div>

      {/* ── Key Metrics Ribbon (4 Cards) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        
        {/* Metric 1: Risk-Adjusted Delivered Cost */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '0.9rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={14} /> Risk-Adjusted Cost
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284C7', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            ${econ.risk_adjusted_cost_per_mt}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B' }}> / MT</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.2rem' }}>
            Nominal landed: ${econ.cost_per_mt_usd}/MT
          </div>
        </div>

        {/* Metric 2: Net Effective with Backhaul */}
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '0.9rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803D', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Anchor size={14} /> Net Effective Cost
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16A34A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            ${rec.net_effective_cost_per_mt}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B' }}> / MT</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: '0.2rem' }}>
            Includes backhaul credit
          </div>
        </div>

        {/* Metric 3: Contract Strategy */}
        <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '0.9rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7E22CE', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={14} /> Contract Strategy
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6B21A8', marginTop: '0.2rem' }}>
            {rec.contract} STRUCTURE
          </div>
          <div style={{ fontSize: '0.7rem', color: '#7E22CE', marginTop: '0.2rem' }}>
            Saves ~${rec.expected_savings_usd?.toLocaleString()} vs Spot
          </div>
        </div>

        {/* Metric 4: Risk Profile */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.9rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#B45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={14} /> Corridor Risk Profile
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>
            {risk.composite_score || 35} / 100 — {risk.tier || 'MEDIUM'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#92400E', marginTop: '0.2rem' }}>
            Penalty: +${risk.penalty_usd_per_mt}/MT
          </div>
        </div>
      </div>

      {/* ── Tab Switcher for In-Depth Drilldown ── */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        {[
          { id: 'summary', label: 'Why This Recommendation?' },
          { id: 'scenarios', label: 'Base / Bull / Bear Scenarios' },
          { id: 'contracts', label: 'Spot vs COA vs Time Charter' },
          { id: 'timing', label: 'Market Timing Alternatives' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === t.id ? '#0284C7' : '#F1F5F9',
              color: activeTab === t.id ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Plain-Language Auditable Explanations ── */}
      {activeTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {explanations.map((exp, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.65rem', 
                background: '#F8FAFC', 
                padding: '0.65rem 0.85rem', 
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.84rem',
                color: '#334155'
              }}
            >
              <CheckCircle2 size={16} color="#0284C7" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{exp}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 2: Base / Bull / Bear Scenarios ── */}
      {activeTab === 'scenarios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {['bull', 'base', 'bear'].map((k) => {
            const sc = scenarios[k];
            if (!sc) return null;
            const isBase = k === 'base';
            const isBull = k === 'bull';
            return (
              <div
                key={k}
                style={{
                  border: `1.5px solid ${isBase ? '#BAE6FD' : isBull ? '#BBF7D0' : '#FECACA'}`,
                  background: isBase ? '#F0F9FF' : isBull ? '#F0FDF4' : '#FEF2F2',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', color: isBase ? '#0369A1' : isBull ? '#15803D' : '#B91C1C' }}>
                    {sc.scenario} Scenario
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{sc.ci_level}</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                  ${sc.delivered_cost_per_mt} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/ MT</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                  Total Spend: <strong>${sc.total_cost_usd?.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.4 }}>
                  {sc.probability_note}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab 3: Spot vs COA vs Time Charter ── */}
      {activeTab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {contracts.map((c) => (
            <div 
              key={c.strategy} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: c.strategy === rec.contract ? '#EFF6FF' : '#F8FAFC', 
                border: `1.5px solid ${c.strategy === rec.contract ? '#0284C7' : '#E2E8F0'}`,
                borderRadius: '8px', 
                padding: '0.75rem 1rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{c.strategy} Contract</span>
                  {c.strategy === rec.contract && (
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Recommended</span>
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>{c.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284C7', fontFamily: 'var(--font-mono)' }}>
                  ${c.delivered_cost_per_mt} <span style={{ fontSize: '0.75rem' }}>/ MT</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: c.savings_vs_spot_usd > 0 ? '#15803D' : '#64748B', fontWeight: 600 }}>
                  {c.savings_vs_spot_usd > 0 ? `Saves $${c.savings_vs_spot_usd.toLocaleString()} vs Spot` : 'Baseline benchmark'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 4: Market Timing ── */}
      {activeTab === 'timing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {timing.map((t) => (
            <div 
              key={t.action} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: t.action === rec.action ? '#F0FDF4' : '#F8FAFC', 
                border: `1.5px solid ${t.action === rec.action ? '#10B981' : '#E2E8F0'}`,
                borderRadius: '8px', 
                padding: '0.75rem 1rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{t.action}</span>
                  {t.action === rec.action && (
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Optimal Window</span>
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>{t.rationale}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                  ${t.delivered_cost_per_mt} <span style={{ fontSize: '0.75rem' }}>/ MT</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: t.expected_savings_usd > 0 ? '#15803D' : '#64748B', fontWeight: 600 }}>
                  {t.expected_savings_usd > 0 ? `Saves $${t.expected_savings_usd.toLocaleString()}` : 'Immediate baseline'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
