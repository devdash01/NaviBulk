// SAIL NaviBulk — Persistent Voyage Manifest & Real-Time Savings HUD
import React from 'react';
import { Ship, Navigation, Anchor, DollarSign, ShieldCheck, ArrowRight, Compass, Waves, CheckCircle2 } from 'lucide-react';
import { FOREIGN_LOAD_PORTS, EAST_COAST_PORTS } from '../data/portConstraints';
import { NAUTICAL_DISTANCE_MATRIX } from '../data/freightData';

export default function VoyageManifestHUD({ inputs, activeStep, totalSavings, onJumpToStep }) {
  const origin = FOREIGN_LOAD_PORTS[inputs.originCountry] || FOREIGN_LOAD_PORTS.Australia;
  const dest = EAST_COAST_PORTS[inputs.destinationPortKey] || EAST_COAST_PORTS.paradip;
  const dist = NAUTICAL_DISTANCE_MATRIX[inputs.originCountry]?.[inputs.destinationPortKey] || 5420;
  const transitDays = (dist / (14 * 24)).toFixed(1);

  const steps = [
    { num: 1, label: 'Cargo & Origin', tag: inputs.originCountry },
    { num: 2, label: 'Vessel & Draft', tag: `${(inputs.vesselClass || 'panamax').toUpperCase()}` },
    { num: 3, label: 'Market Timing', tag: 'Day +12 Window' },
    { num: 4, label: 'Risk Defense', tag: 'BIMCO Shielded' },
    { num: 5, label: 'Executive Dossier', tag: 'Sign-Off' },
  ];

  return (
    <div 
      className="voyage-manifest-hud" 
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #CBD5E1',
        borderRadius: '14px',
        padding: '1rem 1.4rem',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Top Row: Active Voyage Telemetry + Hard Dollar Savings Ticker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Vessel & Cargo Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            }}
          >
            <Ship size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-blue)' }}>
                Active Charter Consignment
              </span>
              <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.5rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--gain)', border: '1px solid rgba(16, 185, 129, 0.35)', fontWeight: 700 }}>
                ● LIVE MISSION
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '2px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hero)', margin: 0, letterSpacing: '-0.02em' }}>
                {inputs.tonnage.toLocaleString()} MT {inputs.cargoType}
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                via <strong>{inputs.originCountry}</strong> → <strong>{dest.name}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Transit & Physical Telemetry */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '0.4rem 0.85rem', borderRadius: '10px', background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Nautical Track</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: '#0284C7' }}>
              {dist.toLocaleString()} NM
            </span>
          </div>

          <div style={{ textAlign: 'center', padding: '0.4rem 0.85rem', borderRadius: '10px', background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Sea Transit</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
              ~{transitDays} Days
            </span>
          </div>

          {/* Right: Net Value Unlocked Ticker */}
          <div 
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '12px',
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.12)',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#15803D' }}>
              Value Unlocked by NaviBulk
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 900, color: '#15803D', lineHeight: 1.1 }}>
              +${totalSavings.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Connected Chapter Stepper with Instant Context Tags */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.65rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(56, 189, 248, 0.12)',
        }}
      >
        {steps.map((s) => {
          const isCurrent = activeStep === s.num;
          const isDone = activeStep > s.num;

          return (
            <div
              key={s.num}
              onClick={() => onJumpToStep && onJumpToStep(s.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.55rem 0.8rem',
                borderRadius: '10px',
                background: isCurrent 
                  ? '#E0F2FE' 
                  : isDone 
                  ? '#DCFCE7' 
                  : '#F1F5F9',
                border: `1.5px solid ${isCurrent ? '#0284C7' : isDone ? '#10B981' : '#CBD5E1'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div 
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isCurrent ? 'var(--accent-blue)' : isDone ? 'var(--gain)' : 'rgba(100, 116, 139, 0.3)',
                  color: isCurrent || isDone ? '#080E1B' : '#94A3B8',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isDone ? <CheckCircle2 size={15} color="#080E1B" /> : s.num}
              </div>

              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--text-hero)' : 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: isCurrent ? 'var(--accent-blue)' : isDone ? 'var(--gain)' : 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {s.tag}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
