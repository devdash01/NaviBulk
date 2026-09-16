// SAIL NaviBulk — Stage 02: Market Intelligence
// Evaluates Baltic sub-index forward trajectory across the designated laycan
import React, { useState } from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import ForecastChart from '../components/ForecastChart.jsx';
import { TrendingUp, Info, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from 'lucide-react';

export default function MarketStage() {
  const {
    inputs,
    recommendedVessel,
    subIndexKey,
    subIndexInfo,
    forecastSeries,
    timingEval,
    lastHistoricalRate,
    day0ForecastRate,
    forward14dRate,
    forward30dRate,
    forecastSlopePct,
    advanceStage
  } = useDecisionEngine();

  const [showModelDetails, setShowModelDetails] = useState(false);

  // Dynamic Market Signal sentence based on slope
  const isUpward = forecastSlopePct > 0;
  const isSharp = Math.abs(forecastSlopePct) > 6;
  const signalDescription = isUpward
    ? `${isSharp ? 'Steep upward rate acceleration' : 'Moderate upward firming'} projected (+${forecastSlopePct}% over forward 14 days). Rising bunker costs and fleet demand tightening along Pacific/Indian corridors exert upward pressure on ${subIndexKey} TCE rates.`
    : `${isSharp ? 'Accelerated softening trend' : 'Gradual downward easing'} projected (${forecastSlopePct}% over forward 14 days). Tonnage oversupply and easing congestion indicate softer spot fixtures ahead.`;

  const conclusionText = `The forward ${subIndexKey} curve for ${recommendedVessel?.vesselName || 'Panamax'} indicates a ${isUpward ? 'tightening' : 'softening'} rate environment with a 14-day projection of $${forward14dRate.toLocaleString()}/day (vs $${day0ForecastRate.toLocaleString()}/day Day-0 baseline). For a ${inputs.tonnage.toLocaleString()} MT consignment under a ${inputs.laycanDays}-day laycan, this trajectory directly impacts whether to secure period coverage immediately or maintain spot flexibility.`;

  return (
    <StageShell
      stageId="market"
      conclusion={conclusionText}
      nextActionLabel="Evaluate Maritime Feasibility →"
      onNextAction={() => advanceStage('market')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ── METRIC STRIP ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Latest Available Index ({subIndexKey})
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              ${lastHistoricalRate.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>/day</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              [Latest Available Index — Baltic Exchange]
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Day-0 Baseline Projection
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              ${day0ForecastRate.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>/day</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              [Model Forecast — SARIMAX Origin]
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              14-Day Forward Forecast
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isUpward ? '#B45309' : '#16A34A', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              ${forward14dRate.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>/day</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: isUpward ? '#B45309' : '#16A34A', fontWeight: 700, marginTop: '0.25rem' }}>
              {isUpward ? `+${forecastSlopePct}%` : `${forecastSlopePct}%`} over forward 14 days
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Corridor Rate Signal
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isUpward ? '#B45309' : '#16A34A', marginTop: '0.2rem' }}>
              {isUpward ? 'RATE ESCALATION' : 'SOFTENING CURVE'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.25rem' }}>
              Exposure: {inputs.tonnage.toLocaleString()} MT Cargo
            </div>
          </div>

        </div>

        {/* ── PRIMARY FORECAST VISUALIZATION (ForecastChart) ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Baltic {subIndexKey} 30-Day Forward Rate Projection Curve
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.15rem' }}>
                Historical observations (past 30 days) and SARIMAX model forecast trajectory with 95% confidence bands
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
                Vessel: {recommendedVessel?.vesselName || 'Panamax'}
              </span>
              <span style={{ fontSize: '0.7rem', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, color: '#1D4ED8' }}>
                Sub-Index: {subIndexKey}
              </span>
            </div>
          </div>

          <ForecastChart 
            forecastData={forecastSeries} 
            timingEval={timingEval} 
            subIndexKey={subIndexKey} 
          />
        </div>

        {/* ── DYNAMIC MARKET SIGNAL SUMMARY ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <TrendingUp size={15} color="#2563EB" />
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dynamic Market Signal & Laycan Exposure
            </h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
            {signalDescription}
          </p>
          <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>
            <strong>Freight Exposure Analysis:</strong> Under a {inputs.laycanDays}-day laycan, a +{forecastSlopePct}% upward movement on a {inputs.tonnage.toLocaleString()} MT shipment represents a potential chartering cost fluctuation of approximately ${(inputs.tonnage * Math.abs(forecastSlopePct) * 0.18).toFixed(0)} USD in freight variance if deferred without index hedging.
          </div>
        </div>

        {/* ── COLLAPSIBLE MODEL PROVENANCE (Secondary) ── */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
          <button
            onClick={() => setShowModelDetails(!showModelDetails)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#475569'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={14} color="#64748B" />
              <span>Statistical Model Architecture & Data Provenance Details</span>
            </div>
            {showModelDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showModelDetails && (
            <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #E2E8F0', fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <strong style={{ color: '#0F172A' }}>Model Pipeline:</strong> SARIMAX(1,1,1) with GARCH(1,1) volatility correction
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Historical Window:</strong> 30-day Baltic Exchange fixtures time series
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Forecast Horizon:</strong> 30-day forward projection step
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Data Source:</strong> Cached historical Baltic index fixtures [Non-Live Feed]
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontStyle: 'italic', color: '#94A3B8' }}>
                [Provenanced Disclosure: NaviBulk utilizes econometric time-series models trained on verified historical freight indices. No live exchange socket connected; all metrics are model projections.]
              </div>
            </div>
          )}
        </div>

      </div>
    </StageShell>
  );
}
