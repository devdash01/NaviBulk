// SAIL-NaviBulk — Interactive Baltic Freight Index Cockpit & 30-Day Projection
import React, { useState, useMemo } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, Activity, Info } from 'lucide-react';
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
import cachedForecasts from '../data/cachedForecasts.json' with { type: 'json' };

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const INDICES = [
  { key: 'BPI', name: 'Baltic Panamax (BPI)', dwt: '75,000–82,000 DWT', role: 'SAIL Core Workhorse (Australia/US Coal)', color: '#0A58CA' },
  { key: 'BCI', name: 'Baltic Capesize (BCI)', dwt: '160,000–180,000 DWT', role: 'Deep-draft Iron Ore & Megatonnage', color: '#D97706' },
  { key: 'BSI', name: 'Baltic Supramax (BSI)', dwt: '55,000–64,000 DWT', role: 'Geared Haldia & Mozambique Routes', color: '#059669' },
];

export default function BalticForecastCockpit() {
  const [selectedKey, setSelectedKey] = useState('BPI');
  const [horizonDays, setHorizonDays] = useState(30);

  const activeIndex = INDICES.find(i => i.key === selectedKey) || INDICES[0];

  const seriesData = useMemo(() => {
    const raw = cachedForecasts?.sub_indices?.[selectedKey] || {
      historical: [16800, 16900, 17100, 16850],
      sarima_forecast: Array(30).fill(16800),
      u95: Array(30).fill(18500),
      l95: Array(30).fill(15000),
    };

    const histDates = (cachedForecasts?.historical_dates || []).slice(-20);
    const histRates = raw.historical.slice(-20);
    const forecastDates = (cachedForecasts?.forecast_dates || []).slice(0, horizonDays);
    const forecastRates = raw.sarima_forecast.slice(0, horizonDays);
    const upper95 = raw.u95.slice(0, horizonDays);
    const lower95 = raw.l95.slice(0, horizonDays);

    const currentRate = histRates[histRates.length - 1] || 16800;
    const endForecastRate = forecastRates[forecastRates.length - 1] || currentRate;
    const deltaRate = endForecastRate - currentRate;
    const deltaPct = ((deltaRate / currentRate) * 100).toFixed(1);

    // Find optimal soft market trough in the forecast
    let minRate = Infinity;
    let minDayIdx = 0;
    forecastRates.forEach((r, idx) => {
      if (r < minRate) {
        minRate = r;
        minDayIdx = idx;
      }
    });

    const labels = [...histDates, ...forecastDates];
    const histLen = histDates.length;

    const histSeries = [...histRates, ...Array(forecastDates.length).fill(null)];
    const foreSeries = [...Array(histLen - 1).fill(null), histRates[histLen - 1], ...forecastRates];
    const u95Series = [...Array(histLen - 1).fill(null), histRates[histLen - 1], ...upper95];
    const l95Series = [...Array(histLen - 1).fill(null), histRates[histLen - 1], ...lower95];

    return {
      currentRate,
      endForecastRate,
      deltaRate,
      deltaPct,
      minRate: Math.round(minRate),
      optimalDay: minDayIdx + 1,
      optimalDate: forecastDates[minDayIdx] || '12 Days out',
      labels,
      histSeries,
      foreSeries,
      u95Series,
      l95Series,
    };
  }, [selectedKey, horizonDays]);

  const chartConfig = {
    labels: seriesData.labels,
    datasets: [
      {
        label: `${selectedKey} Observed Spot ($/day)`,
        data: seriesData.histSeries,
        borderColor: '#475569',
        backgroundColor: 'rgba(71, 85, 105, 0.1)',
        borderWidth: 2,
        pointRadius: 1,
      },
      {
        label: `${selectedKey} Forward Projection (SARIMA/XGBoost)`,
        data: seriesData.foreSeries,
        borderColor: activeIndex.color,
        backgroundColor: 'rgba(10, 88, 202, 0.08)',
        borderWidth: 2.8,
        pointRadius: (ctx) => (ctx.dataIndex === 19 + seriesData.optimalDay ? 6 : 2),
        pointBackgroundColor: (ctx) => (ctx.dataIndex === 19 + seriesData.optimalDay ? '#059669' : activeIndex.color),
      },
      {
        label: '95% Econometric Confidence Band',
        data: seriesData.u95Series,
        borderColor: 'rgba(148, 163, 184, 0.35)',
        borderDash: [4, 4],
        fill: '+1',
        backgroundColor: 'rgba(186, 197, 212, 0.15)',
        pointRadius: 0,
      },
      {
        label: 'Lower Bound',
        data: seriesData.l95Series,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#CBD5E1',
          font: { family: 'Inter', size: 11, weight: 600 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0D1627',
        titleColor: '#F8FAFC',
        bodyColor: '#94A3B8',
        borderColor: '#223552',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (item) => ` ${item.dataset.label}: $${Number(item.raw).toLocaleString()}/day`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(56, 189, 248, 0.08)' },
        ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 9.5 }, maxTicksLimit: 8 },
      },
      y: {
        grid: { color: 'rgba(56, 189, 248, 0.08)' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  return (
    <div 
      style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Top Header & Sub-Index Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Activity size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-hero)', margin: 0 }}>
              Baltic Sub-Index Forecast Cockpit
            </h3>
            <span 
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.1)',
                color: 'var(--accent-blue)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              PYTHON FASTAPI / STATSMODELS
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Real-time econometrically forecasted TCE freight rates with walk-forward statistical confidence bands.
          </p>
        </div>

        {/* Horizon Pill Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-app)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          {[7, 14, 30].map(h => (
            <button
              key={h}
              onClick={() => setHorizonDays(h)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: horizonDays === h ? '1px solid var(--accent-blue)' : '1px solid transparent',
                background: horizonDays === h ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: horizonDays === h ? 'var(--accent-blue)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              +{h} Days
            </button>
          ))}
        </div>
      </div>

      {/* 3 Interactive Sub-Index Selector Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {INDICES.map(idx => {
          const isSel = idx.key === selectedKey;
          const current = (cachedForecasts?.sub_indices?.[idx.key]?.historical || []).slice(-1)[0] || 16500;
          return (
            <div
              key={idx.key}
              onClick={() => setSelectedKey(idx.key)}
              style={{
                background: isSel ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)',
                border: `1.5px solid ${isSel ? idx.color : 'var(--border-subtle)'}`,
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSel ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: idx.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {idx.key} Benchmark
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {idx.dwt}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-hero)', lineHeight: 1.1 }}>
                ${current.toLocaleString()}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>USD/day</span>
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                {idx.role}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Canvas */}
      <div style={{ height: '280px', width: '100%', marginBottom: '1rem' }}>
        <Line data={chartConfig} options={chartOptions} />
      </div>

      {/* Telemetry Footer Callout */}
      <div 
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div 
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--gain)',
            }}
          />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Optimal Soft-Market Laycan Entry Window: <strong style={{ color: 'var(--gain)' }}>Day +{seriesData.optimalDay} ({seriesData.optimalDate})</strong>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Projected rate dip: <strong style={{ color: 'var(--text-hero)' }}>${seriesData.minRate.toLocaleString()}/day</strong> ({seriesData.deltaPct}% shift)
        </div>
      </div>
    </div>
  );
}
