// SAIL NaviBulk — Smooth In-Page Animated Ship Transit Banner (Non-blocking Transition)
import React, { useEffect, useState } from 'react';
import { Ship } from 'lucide-react';

export default function ShipTransitOverlay({ targetStep, onComplete, originName = 'Australia', destName = 'Paradip' }) {
  const [progress, setProgress] = useState(0);

  const stepMeta = {
    1: { title: 'Cargo & Origin Requisition', sub: `Plotting sea lane from ${originName} to Indian East Coast`, knot: '12.4 kts' },
    2: { title: 'Port Water Depth & Berth Clearance', sub: `Checking depth clearance against ${destName} channel draft`, knot: '13.8 kts' },
    3: { title: 'Vessel Economics & Rate Matching', sub: 'Evaluating $/MT economics across Capesize, Panamax & Supramax', knot: '14.1 kts' },
    4: { title: 'Geopolitical Risk & Weather Radar', sub: 'Reviewing Malacca Strait traffic, weather & BIMCO contract clauses', knot: '13.2 kts' },
    5: { title: 'Executive Savings Audit Dossier', sub: 'Finalizing verified hard-dollar chartering savings summary', knot: '12.8 kts' },
  };

  const currentInfo = stepMeta[targetStep] || stepMeta[2];

  useEffect(() => {
    let start = performance.now();
    const duration = 400; // Snappy 400ms visual glide transition

    const frame = (now) => {
      const elapsed = now - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);

      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        onComplete();
      }
    };

    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [targetStep, onComplete]);

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      border: '1.5px solid #BAE6FD',
      borderRadius: '14px',
      padding: '0.85rem 1.25rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Top Telemetry Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            background: '#0284C7',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
          }}>
            <Ship size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TRANSITING TO STEP 0{targetStep} • {currentInfo.knot}
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
              {currentInfo.title}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
          {currentInfo.sub}
        </div>
      </div>

      {/* Mini Sailing Wave Track */}
      <div style={{
        position: 'relative',
        height: '20px',
        background: '#BAE6FD',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #7DD3FC'
      }}>
        {/* Progress Water Fill */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #0284C7, #0EA5E9)',
          borderRadius: '10px',
          transition: 'width 0.05s linear'
        }} />

        {/* Small Vessel Icon Gliding on Top */}
        <div style={{
          position: 'absolute',
          left: `${Math.min(96, Math.max(3, progress))}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#FFFFFF',
          color: '#0284C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
          zIndex: 2,
          transition: 'left 0.05s linear'
        }}>
          <Ship size={11} />
        </div>
      </div>
    </div>
  );
}
