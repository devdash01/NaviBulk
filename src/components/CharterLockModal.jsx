// 1-Click "Lock Recommendation" Pre-Filled Charter Request Modal Component
import React from 'react';
import { X, FileText, Printer, Lock, ShieldAlert } from 'lucide-react';
import { EAST_COAST_PORTS } from '../data/portConstraints';

export default function CharterLockModal({ isOpen, onClose, selectedVessel, inputs, timingEval, rationaleText, riskEval }) {
  if (!isOpen || !selectedVessel) return null;

  const reqId = `SAIL-CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const destPortName = EAST_COAST_PORTS[inputs.destinationPortKey]?.name || inputs.destinationPortKey;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          border: '1px solid var(--brass)', 
          maxWidth: '850px', 
          borderRadius: '10px', 
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)', 
          background: 'var(--graphite-800)',
          color: 'var(--text-hi)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--hairline)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--brass-dim)', border: '1px solid var(--brass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} color="var(--brass)" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', margin: 0 }}>
                Commercial Chartering Requisition Dossier
              </h2>
              <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--brass-bright)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Pre-Filled Executive Sign-Off Recommendation • [Simulation / Decision Support — No fixture is executed]
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-mid)', 
              cursor: 'pointer', 
              padding: '0.35rem',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Document Box */}
        <div
          style={{
            background: 'var(--graphite-900)',
            border: '1px solid var(--hairline)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {/* Document Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--hairline)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-hi)', margin: 0 }}>STEEL AUTHORITY OF INDIA LIMITED (SAIL)</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-mid)', margin: '2px 0 0 0' }}>Central Transport &amp; Freight Logistics Directorate • New Delhi</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brass-bright)', fontFamily: 'var(--font-mono)' }}>{reqId}</span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-low)', margin: '2px 0 0 0' }}>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Key Requisition Table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem', background: 'var(--graphite-800)', border: '1px solid var(--hairline)', padding: '1rem', borderRadius: '6px' }}>
            <div>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-low)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Target Vessel Class</span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brass-bright)' }}>
                {selectedVessel?.name || selectedVessel?.vesselName || 'Panamax / Kamsarmax'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-low)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Contract Framework</span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-hi)' }}>
                {inputs.contractType === 'spot' ? 'Single Voyage Spot Fixture' : 'Period COA Volume Hedge'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-low)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Optimal Fixture Window</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gain)' }}>
                {timingEval?.recommendation || 'Days 10–14 Forward'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-low)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Cargo &amp; Route</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-hi)' }}>
                {Number(inputs.tonnage || 70000).toLocaleString()} MT {inputs.cargoType} ({inputs.originCountry} → {destPortName})
              </div>
            </div>
          </div>

          {/* Plain Language Rationale */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brass)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Decision Rationale &amp; Port Constraint Analysis
            </h4>
            <div style={{ background: 'var(--graphite-800)', border: '1px solid var(--hairline)', borderRadius: '6px', padding: '0.85rem', fontSize: '0.78rem', lineHeight: 1.5, color: 'var(--text-mid)' }}>
              {rationaleText}
            </div>
          </div>

          {/* Active Risk Advisories */}
          {riskEval && riskEval.activeFlags && riskEval.activeFlags.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--warn)', marginBottom: '0.35rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldAlert size={13} /> Mandated Charter Party Risk Clauses
              </h4>
              <div style={{ background: 'rgba(217, 154, 43, 0.08)', border: '1px solid rgba(217, 154, 43, 0.25)', borderRadius: '6px', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--warn)' }}>
                Active Flags: {riskEval.activeFlags.join(' • ')}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px dashed var(--hairline)', fontSize: '0.72rem', color: 'var(--text-low)' }}>
            <div>
              <span>Generated By: SAIL NaviBulk Decision Support System [V2 Engine]</span>
            </div>
            <div>
              <span>Official Executive Approval Signature: _______________________</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            className="btn-brass-secondary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.8rem' }}
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="btn-brass"
            style={{ 
              padding: '0.55rem 1.25rem', 
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Printer size={15} />
            <span>Print Requisition Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
