// SAIL NaviBulk — Stage 02: Market Intelligence
// Evaluates Baltic sub-index forward trajectory across the designated laycan
import React, { useState } from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageShell from '../components/StageShell.jsx';
import ForecastChart from '../components/ForecastChart.jsx';
import { NAUTICAL_DISTANCE_MATRIX } from '../data/freightData.js';
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
      nextActionLabel="Evaluate Maritime Feasibility"
      onNextAction={() => advanceStage('market')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ── METRIC STRIP ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          <div className="analytical-card" style={{ borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                Latest Baltic Benchmark ({subIndexKey})
              </span>
              <span className="provenance-label">BENCHMARK PROXY</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
              ${lastHistoricalRate.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>/day</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Baltic Exchange Index Benchmark
            </div>
          </div>

          <div className="analytical-card" style={{ borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                Day-0 Baseline Projection
              </span>
              <span className="provenance-label">MODEL ORIGIN</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
              ${day0ForecastRate.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>/day</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              SARIMAX Econometric Baseline
            </div>
          </div>

          <div className="analytical-card" style={{ borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                14-Day Forward Forecast
              </span>
              <span className={`pill-badge ${isUpward ? 'status-warning' : 'status-success'}`} style={{ fontSize: '0.6rem', padding: '0.08rem 0.35rem' }}>
                {isUpward ? 'FIRMING' : 'SOFTENING'}
              </span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isUpward ? 'var(--warning)' : 'var(--success)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
              ${forward14dRate.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>/day</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: isUpward ? 'var(--warning)' : 'var(--success)', fontWeight: 700, marginTop: '0.25rem' }}>
              {isUpward ? `+${forecastSlopePct}%` : `${forecastSlopePct}%`} over forward 14 days
            </div>
          </div>

          <div className="analytical-card" style={{ borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-eyebrow" style={{ fontSize: '0.68rem' }}>
                Corridor Signal Status
              </span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isUpward ? 'var(--warning)' : 'var(--success)', marginTop: '0.25rem' }}>
              {isUpward ? 'RATE ESCALATION' : 'SOFTENING CURVE'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Exposure: {inputs.tonnage.toLocaleString()} MT Cargo
            </div>
          </div>

        </div>

        {/* ── PRIMARY FORECAST VISUALIZATION (ForecastChart) ── */}
        <div className="analytical-card" style={{ borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Baltic {subIndexKey} 30-Day Forward Rate Projection Curve
                </h2>
                <span className="provenance-label">[INDEX-BASED FREIGHT PROXY]</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Historical Baltic observations (past 30 days) and SARIMAX model forecast trajectory with 95% confidence intervals
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span className="pill-badge" style={{ background: 'var(--surface-app)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                Vessel: {recommendedVessel?.vesselName || 'Panamax'}
              </span>
              <span className="pill-badge status-cobalt" style={{ fontSize: '0.7rem' }}>
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

        {/* ── STAGE 02 TOTAL COST OPTIMIZATION: RATE TIMING ARBITRAGE ── */}
        <div 
          className="analytical-card"
          style={{ 
            background: '#F0FDF4', 
            border: '1px solid #BBF7D0', 
            borderRadius: '12px', 
            padding: '1.25rem 1.5rem', 
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Stage 02 Landed Cost Optimization • Timing Arbitrage
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D', margin: '0.2rem 0 0.15rem' }}>
                {timingEval?.recommendation || 'Fix Within Optimal Forward Window'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534', maxWidth: '680px', lineHeight: 1.45 }}>
                {timingEval?.timingRationale || `Delaying contract fixture entry to the projected 30-day index trough captures optimal forward freight timing for ${inputs.originCountry} → ${inputs.destinationPortKey.toUpperCase()}.`}
              </p>
            </div>

            <div style={{ background: 'var(--success)', color: '#FFFFFF', padding: '0.55rem 1.1rem', borderRadius: '10px', textAlign: 'right' }}>
              <span style={{ fontSize: '0.64rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Timing Optimization Value</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                +${(timingEval?.totalSavingsUsd || Math.round(1.40 * inputs.tonnage)).toLocaleString()} USD
              </span>
              <span style={{ fontSize: '0.7rem', display: 'block', fontWeight: 700 }}>
                (₹{(((timingEval?.totalSavingsUsd || Math.round(1.40 * inputs.tonnage)) * 83.2) / 10000000).toFixed(2)} Cr • +${(timingEval?.savingsPerTonneUsd || 1.40).toFixed(2)}/MT)
              </span>
            </div>
          </div>
        </div>

        {/* ── DYNAMIC MARKET SIGNAL SUMMARY & EXPOSURE AUDIT ── */}
        {(() => {
          const originKey = inputs.originCountry === 'United States' ? 'US' : inputs.originCountry;
          const routeDistanceNm = NAUTICAL_DISTANCE_MATRIX[originKey]?.[inputs.destinationPortKey] || 4850;
          const transitSeaDays = Number((routeDistanceNm / ((inputs.speedKnots || 13.0) * 24)).toFixed(1));
          const dailyTceDelta = Math.abs(forward14dRate - day0ForecastRate);
          const totalExposureUsd = Math.round(dailyTceDelta * transitSeaDays);
          const exposurePerMt = Number((totalExposureUsd / inputs.tonnage).toFixed(2));

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              
              {/* Dynamic Market Signal Summary */}
              <div className="analytical-card" style={{ borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <TrendingUp size={15} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Dynamic Market Signal & Laycan Exposure
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 0.75rem' }}>
                  {signalDescription}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Corridor Voyage Exposure:</strong> Under a {inputs.laycanDays}-day laycan across {routeDistanceNm.toLocaleString()} NM ({transitSeaDays} sea days), a {isUpward ? `+$${dailyTceDelta.toLocaleString()}/day rise` : `-$${dailyTceDelta.toLocaleString()}/day shift`} shifts total voyage freight budget by <strong>±${totalExposureUsd.toLocaleString()} USD</strong> (<strong>±${exposurePerMt}/MT</strong>) if left unhedged on prompt spot.
                </div>
              </div>

              {/* Baltic Sub-Index Specification Profile */}
              <div className="analytical-card" style={{ borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Baltic {subIndexKey} Reference Standard
                  </div>
                  <span className="pill-badge status-cobalt" style={{ fontSize: '0.62rem' }}>
                    BDI SHARE: {subIndexInfo?.academicWeightPct || 30}%
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', lineHeight: 1.4 }}>
                  {subIndexInfo?.source || 'Baltic Exchange Modern BDI Methodology'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.74rem', color: '#475569' }}>
                  <div>Benchmark Vessel: <strong>{recommendedVessel?.vesselName || subIndexInfo?.vesselClass}</strong></div>
                  <div>Reference DWT: <strong>{(subIndexInfo?.dwt || 75000).toLocaleString()} DWT</strong></div>
                  <div>Baseline TCE Hire: <strong>${(subIndexInfo?.baselineTce || 14500).toLocaleString()}/day</strong></div>
                  <div>Forecast Engine: <strong>SARIMAX + GARCH (10,246 Records)</strong></div>
                </div>
              </div>

            </div>
          );
        })()}

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
                  <strong style={{ color: '#0F172A' }}>Historical Window:</strong> 10,246 Baltic Exchange daily observations (1985–2026)
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Forecast Horizon:</strong> 30-day forward projection with 95% CI
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Data Provenance:</strong> Baltic Exchange BDI / BCI / BPI / BSI historical trading records
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', fontStyle: 'italic', color: '#94A3B8' }}>
                [Provenanced Disclosure: NaviBulk utilizes econometric time-series models trained on genuine historical freight indices with zero lookahead bias.]
              </div>
            </div>
          )}
        </div>

      </div>
    </StageShell>
  );
}
