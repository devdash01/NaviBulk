// Stage 2 & Stage 5: Freight Rate Forecasting Chart Component
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { COMMODITY_PINK_SHEET, GLOBAL_MACRO_INDICATORS } from '../data/freightData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ForecastChart({ forecastData, timingEval, subIndexKey }) {
  if (!forecastData) return null;

  const labels = [...forecastData.historicalDates, ...forecastData.forecastDates];
  const histLen = forecastData.historicalDates.length;

  // Data series alignment
  const histSeries = [...forecastData.historicalRates, ...Array(forecastData.forecastDates.length).fill(null)];
  const forecastSeries = [...Array(histLen - 1).fill(null), forecastData.historicalRates[histLen - 1], ...forecastData.forecastRates];
  const upper95Series = [...Array(histLen - 1).fill(null), forecastData.historicalRates[histLen - 1], ...forecastData.confidenceUpper95];
  const lower95Series = [...Array(histLen - 1).fill(null), forecastData.historicalRates[histLen - 1], ...forecastData.confidenceLower95];

  const data = {
    labels,
    datasets: [
      {
        label: `${subIndexKey} Historical BDI-Derived Rate ($/day)`,
        data: histSeries,
        borderColor: '#94A3B8',
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 2,
        pointRadius: 1,
      },
      {
        label: `${subIndexKey} 30-Day Forecast (SARIMA/XGBoost)`,
        data: forecastSeries,
        borderColor: '#38BDF8',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 3,
        pointRadius: (ctx) => (ctx.dataIndex === histLen + timingEval.optimalDaysToWait ? 7 : 2),
        pointBackgroundColor: (ctx) => (ctx.dataIndex === histLen + timingEval.optimalDaysToWait ? '#10B981' : '#38BDF8'),
      },
      {
        label: '95% Confidence Upper Band',
        data: upper95Series,
        borderColor: 'rgba(56, 189, 248, 0.25)',
        borderDash: [5, 5],
        fill: '+1',
        backgroundColor: 'rgba(14, 165, 233, 0.08)',
        pointRadius: 0,
      },
      {
        label: '95% Confidence Lower Band',
        data: lower95Series,
        borderColor: 'rgba(56, 189, 248, 0.25)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-muted)',
          font: { family: 'Inter', size: 11 },
          filter: (item) => !item.text.includes('Confidence'),
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        titleColor: 'var(--text-hero)',
        bodyColor: 'var(--accent-blue)',
        borderColor: 'var(--border-medium)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
        ticks: { color: '#64748B', font: { size: 10 }, maxRotation: 45 },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-hero)' }}>
            Stage 2 & 5 — Freight Rate Forecast & Optimal Fixture Timing
          </h2>
        </div>
        <span className="proxy-badge">Model: SARIMA(2,1,1) + XGBoost Lag Ensemble</span>
      </div>

      {/* Chart Canvas */}
      <div style={{ height: '320px', width: '100%', marginBottom: '1rem' }}>
        <Line data={data} options={options} />
      </div>

      {/* Exogenous Signal Indicators & Timing Summary Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Timing Recommendation Banner */}
        <div style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '10px', padding: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Clock size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>OPTIMAL CHARTER WINDOW</span>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-hero)', marginBottom: '0.2rem' }}>
            {timingEval.recommendation}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{timingEval.timingRationale}</p>
        </div>

        {/* Exogenous Signal Highlights */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Exogenous Market Drivers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Thermal Coal Pink Sheet:</span>
              <span style={{ fontWeight: 600, color: '#34D399' }}>${COMMODITY_PINK_SHEET.thermalCoal.priceUsdPerTonne}/t ({COMMODITY_PINK_SHEET.thermalCoal.monthlyChangePct > 0 ? '+' : ''}{COMMODITY_PINK_SHEET.thermalCoal.monthlyChangePct}% MoM)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Iron Ore (62% Fe) Pink Sheet:</span>
              <span style={{ fontWeight: 600, color: '#38BDF8' }}>${COMMODITY_PINK_SHEET.ironOre.priceUsdPerTonne}/dmtu ({COMMODITY_PINK_SHEET.ironOre.monthlyChangePct}% MoM)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>IMF India Growth (2026):</span>
              <span style={{ fontWeight: 600, color: '#10B981' }}>+{GLOBAL_MACRO_INDICATORS.indiaGdpGrowthPct}% (Bullish)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
