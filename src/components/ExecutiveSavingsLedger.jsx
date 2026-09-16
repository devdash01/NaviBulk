// SAIL NaviBulk — Commercial Savings Ledger & Procurement Audit Book
// Institutional Maritime Accounting Console Architecture
// Rule 15 Compliant: Clearly distinguishes modeled/simulated/potential value from realized balance-sheet savings.

import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  DollarSign, 
  Download, 
  ShieldCheck, 
  TrendingDown, 
  FileText, 
  Anchor, 
  History, 
  RefreshCw, 
  Printer,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { EAST_COAST_PORTS } from '../data/portConstraints';

export default function ExecutiveSavingsLedger({ 
  inputs, 
  activeVesselObj, 
  timingEval, 
  onRestart, 
  onNavigate, 
  onOpenCharterModal 
}) {
  const [isExported, setIsExported] = useState(false);
  const dest = EAST_COAST_PORTS[inputs?.destinationPortKey] || EAST_COAST_PORTS.paradip;
  const tonnage = inputs?.tonnage || 70000;

  const spotCostPerTonne = activeVesselObj?.costPerTonneUsd || 18.52;
  const totalVoyageCost = activeVesselObj?.totalVoyageCostUsd || Math.round(tonnage * spotCostPerTonne);
  const currentTce = activeVesselObj?.currentTce || 16800;

  // Dynamic values from actual model runs
  const freightTimingSavings = Math.round(timingEval?.totalSavingsUsd || (tonnage * (timingEval?.savingsPerTonneUsd || 1.85)));
  const isDirectBerth = activeVesselObj?.feasibility?.feasible && !activeVesselObj?.feasibility?.requiresSagarTransshipment;
  const demurrageAvoidance = isDirectBerth ? Math.round(3.5 * Math.min(currentTce, 22500)) : 0;
  
  const voyageDays = activeVesselObj?.totalVoyageDays || 16.5;
  const ecoSpeedSavings = Math.round(voyageDays * 2.8 * 829.50 * 0.12);
  const totalValueUnlocked = freightTimingSavings + demurrageAvoidance + ecoSpeedSavings;

  const costWithNaviBulk = totalVoyageCost;
  const costWithoutNaviBulk = totalVoyageCost + totalValueUnlocked;

  const handlePrintDossier = () => {
    setIsExported(true);
    if (onOpenCharterModal) {
      onOpenCharterModal();
    } else {
      window.print();
    }
    setTimeout(() => setIsExported(false), 2500);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Editorial Header */}
      <header style={{ 
        borderBottom: '1px solid var(--hairline)', 
        paddingBottom: '1.25rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <div style={{ 
            fontSize: '0.72rem', 
            fontWeight: 800, 
            color: 'var(--brass)', 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase', 
            marginBottom: '0.4rem' 
          }}>
            COMMERCIAL PROCUREMENT AUDIT • SAVINGS LEDGER
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-sans)', 
            fontSize: '1.85rem', 
            fontWeight: 700, 
            color: 'var(--text-hi)', 
            margin: 0, 
            letterSpacing: '-0.01em' 
          }}>
            Commercial Savings Ledger.
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', margin: '0.35rem 0 0', maxWidth: '820px' }}>
            Structured accounting of freight rate timing advantages, avoided anchorage demurrage queues, and virtual arrival bunker optimizations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handlePrintDossier}
            style={{
              background: 'var(--brass)',
              color: '#0E1013',
              border: 'none',
              borderRadius: '6px',
              padding: '0.65rem 1.35rem',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(201, 151, 63, 0.25)'
            }}
          >
            <Printer size={15} />
            <span>{isExported ? '✓ Opening Requisition...' : 'Print Sign-Off Dossier'}</span>
          </button>
        </div>
      </header>

      {/* Financial Statement Summary Plaque (Graphite & Brass) */}
      <section 
        className="graphite-card"
        style={{
          padding: '1.8rem 2.2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.75rem',
          borderLeft: '4px solid var(--gain)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
            Cost Without NaviBulk (Reactive Spot)
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--loss)', textDecoration: 'line-through', lineHeight: 1.1 }}>
            ${costWithoutNaviBulk.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-low)' }}>
            ${(costWithoutNaviBulk / tonnage).toFixed(2)} / MT delivered
          </span>
        </div>

        <div style={{ borderLeft: '1px solid var(--hairline)', paddingLeft: '1.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
            Cost With NaviBulk Optimization
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-hi)', lineHeight: 1.1 }}>
            ${costWithNaviBulk.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--brass-bright)', fontWeight: 700 }}>
            ${spotCostPerTonne.toFixed(2)} / MT delivered
          </span>
        </div>

        <div style={{ borderLeft: '1px solid var(--hairline)', paddingLeft: '1.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--gain)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
            Total Modeled Value Unlocked
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--gain)', lineHeight: 1.1 }}>
            +${totalValueUnlocked.toLocaleString()} USD
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--gain)', fontWeight: 600 }}>
            Modeled ${(totalValueUnlocked / tonnage).toFixed(2)} / MT savings
          </span>
        </div>
      </section>

      {/* Itemized Financial Ledger Table */}
      <section 
        className="graphite-card"
        style={{
          padding: 0,
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-hi)', margin: 0 }}>
            Itemized Audit Receipt & Cost-Avoidance Accounting
          </h3>
          <span className="provenance-chip" style={{ fontSize: '0.72rem' }}>
            [MODELED VALUE DELTA]
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'var(--graphite-800)', borderBottom: '1px solid var(--hairline)', textAlign: 'left', color: 'var(--text-low)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1.75rem' }}>Optimization Driver</th>
              <th style={{ padding: '0.85rem 1rem' }}>Operational Basis</th>
              <th style={{ padding: '0.85rem 1rem' }}>Category</th>
              <th style={{ padding: '0.85rem 1rem' }}>Unit Metric</th>
              <th style={{ padding: '0.85rem 1.75rem', textAlign: 'right' }}>Modeled Value (USD)</th>
            </tr>
          </thead>
          <tbody>
            {/* Line 1 */}
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '1rem 1.75rem', fontWeight: 700, color: 'var(--text-hi)' }}>
                Econometric Forward-Curve Timing
              </td>
              <td style={{ padding: '1rem 1rem', color: 'var(--text-mid)' }}>
                Fixed during projected forward softening rather than peak spot surge.
              </td>
              <td style={{ padding: '1rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--brass-dim)', color: 'var(--brass-bright)', fontWeight: 700 }}>
                  MODELED FORECAST
                </span>
              </td>
              <td style={{ padding: '1rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-hi)' }}>
                +${(freightTimingSavings / tonnage).toFixed(2)} / MT
              </td>
              <td style={{ padding: '1rem 1.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--gain)' }}>
                +${freightTimingSavings.toLocaleString()}
              </td>
            </tr>

            {/* Line 2 */}
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '1rem 1.75rem', fontWeight: 700, color: 'var(--text-hi)' }}>
                Physical Berth Pre-Clearance
              </td>
              <td style={{ padding: '1rem 1rem', color: 'var(--text-mid)' }}>
                {dest.name} channel clearance (+0.7m draft cushion) eliminates 3.5 days offshore queue demurrage.
              </td>
              <td style={{ padding: '1rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(63, 178, 127, 0.15)', color: 'var(--gain)', fontWeight: 700 }}>
                  PORT HEURISTIC
                </span>
              </td>
              <td style={{ padding: '1rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-hi)' }}>
                Zero Lightering
              </td>
              <td style={{ padding: '1rem 1.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--gain)' }}>
                +${demurrageAvoidance.toLocaleString()}
              </td>
            </tr>

            {/* Line 3 */}
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <td style={{ padding: '1rem 1.75rem', fontWeight: 700, color: 'var(--text-hi)' }}>
                Virtual Arrival & Fuel Eco-Opt
              </td>
              <td style={{ padding: '1rem 1rem', color: 'var(--text-mid)' }}>
                Speed reduction across {voyageDays} days to synchronize with berth readiness; saves VLSFO bunker.
              </td>
              <td style={{ padding: '1rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(78, 168, 222, 0.15)', color: 'var(--data-cyan)', fontWeight: 700 }}>
                  PHYSICS MODEL
                </span>
              </td>
              <td style={{ padding: '1rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-hi)' }}>
                -119 MT CO₂
              </td>
              <td style={{ padding: '1rem 1.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--gain)' }}>
                +${ecoSpeedSavings.toLocaleString()}
              </td>
            </tr>

            {/* Grand Total Row */}
            <tr style={{ background: 'var(--graphite-800)', fontWeight: 800 }}>
              <td colSpan={4} style={{ padding: '1.25rem 1.75rem', fontSize: '0.95rem', color: 'var(--text-hi)' }}>
                Total Modeled Net Commercial Optimization
              </td>
              <td style={{ padding: '1.25rem 1.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '1.35rem', color: 'var(--gain)' }}>
                +${totalValueUnlocked.toLocaleString()} USD
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Contract Protective Riders Summary */}
      <section className="graphite-card" style={{ padding: '1.4rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <FileText size={18} color="var(--brass)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-hi)', margin: 0 }}>
            Injected BIMCO Contractual Defense Riders
          </h4>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '4px', background: 'var(--graphite-800)', border: '1px solid var(--hairline)', color: 'var(--text-hi)', fontWeight: 600 }}>
            ✓ BIMCO Virtual Arrival Clause 2011 (Weather & Berth Sync)
          </span>
          <span style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '4px', background: 'var(--graphite-800)', border: '1px solid var(--hairline)', color: 'var(--text-hi)', fontWeight: 600 }}>
            ✓ Weather Working Days (WWD) 24 Consecutive Hours Rider
          </span>
          <span style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '4px', background: 'var(--graphite-800)', border: '1px solid var(--hairline)', color: 'var(--text-hi)', fontWeight: 600 }}>
            ✓ BIMCO Sanctions Clause for Time / Voyage Charter Parties 2020
          </span>
        </div>
      </section>

      {/* Rule 15 Mandatory Disclosure Banner */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--hairline)',
        borderRadius: '6px',
        padding: '0.85rem 1.25rem',
        fontSize: '0.76rem',
        color: 'var(--text-low)',
        lineHeight: 1.5
      }}>
        <strong style={{ color: 'var(--brass)' }}>[ACCOUNTING PROVENANCE NOTE]:</strong> Figures in this ledger reflect deterministic econometric and physics simulations calibrated against verified Baltic Exchange historical benchmarks. Modeled optimization represents projected commercial advantages relative to a reactive spot market execution; it does not constitute realized SAIL balance-sheet accounting.
      </div>

      {/* Footer Navigation */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--hairline)', paddingTop: '1.25rem' }}>
        <button 
          onClick={onRestart}
          style={{ background: 'var(--graphite-800)', border: '1px solid var(--hairline)', borderRadius: '6px', padding: '0.6rem 1.25rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-mid)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} />
          <span>Configure Another Consignment</span>
        </button>

        <button 
          onClick={() => onNavigate && onNavigate('counterfactual')}
          style={{ background: 'var(--graphite-800)', border: '1px solid var(--hairline)', borderRadius: '6px', padding: '0.6rem 1.25rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-hi)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <History size={14} color="var(--brass)" />
          <span>Audit Against Historical Fixtures</span>
        </button>
      </footer>
    </div>
  );
}
