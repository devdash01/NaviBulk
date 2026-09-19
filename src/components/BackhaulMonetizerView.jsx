// SAIL NaviBulk — Backhaul Monetizer & Triangular Repositioning Workstation
import React, { useState, useMemo } from 'react';
import { RefreshCw, TrendingUp, DollarSign, Ship, ArrowRight, CheckCircle2, Leaf, Compass, Navigation, Anchor } from 'lucide-react';
import { EAST_COAST_PORTS, VESSEL_CLASSES } from '../data/portConstraints';
import { matchIdleRepositioningLeg } from '../engine/recommendationEngine';
import { BUNKER_PRICE_VLSFO } from '../data/freightData';

export default function BackhaulMonetizerView({ initialPort = 'paradip', initialVessel = 'panamax' }) {
  const [selectedPortKey, setSelectedPortKey] = useState(initialPort);
  const [selectedVesselClass, setSelectedVesselClass] = useState(initialVessel);
  const [activeLegId, setActiveLegId] = useState('iron_ore_china');

  const destPort = EAST_COAST_PORTS[selectedPortKey] || EAST_COAST_PORTS.paradip;
  const vessel = VESSEL_CLASSES[selectedVesselClass] || VESSEL_CLASSES.panamax;

  const repositioningLegs = useMemo(() => {
    return matchIdleRepositioningLeg(selectedPortKey, selectedVesselClass);
  }, [selectedPortKey, selectedVesselClass]);

  const activeLeg = repositioningLegs.find((l) => l.id === activeLegId) || repositioningLegs[0];

  const cargoTonnage = activeLeg?.cargoTonnage || vessel.avgDwt || 75000;
  const estRate = activeLeg?.estRatePerTonneUsd || 14.80;
  const grossFreightRevenue = activeLeg?.grossFreightRevenue || Math.round(cargoTonnage * estRate);
  const voyageFuelCostUsd = activeLeg?.voyageFuelCostUsd || Math.round((activeLeg?.distanceNm / (13.5 * 24)) * 28 * 829.50);
  const portDuesUsd = activeLeg?.portDuesUsd || (18500 + Math.round(cargoTonnage * 0.35));
  const netBenefit = activeLeg?.netRepositioningBenefitUsd || Math.max(0, grossFreightRevenue - voyageFuelCostUsd - portDuesUsd);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Editorial Header */}
      <header style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C29139', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Triangular Fleet Repositioning Network
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
            What can this vessel do after discharge?
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', margin: 0, maxWidth: '840px' }}>
            Commercial monetization of ballast return legs from East Coast India. Pairing outgoing regional iron ore pellets or slag with Pacific return routes to reduce deadhead fuel burn.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
            Net Repositioning Benefit
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#1E7E56' }}>
            +${netBenefit.toLocaleString()} USD
          </div>
          <span style={{ fontSize: '0.75rem', color: '#1E7E56', fontWeight: 600 }}>
            {activeLeg?.deadheadReductionPct || 74}% Deadhead Ballast Offset
          </span>
        </div>
      </header>

      {/* Origin Port & Vessel Controls */}
      <section 
        style={{
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '6px',
          padding: '1.25rem 1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
            Discharge Terminal (Ballast Origin)
          </label>
          <select 
            value={selectedPortKey} 
            onChange={(e) => setSelectedPortKey(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 600, fontSize: '0.85rem' }}
          >
            {Object.keys(EAST_COAST_PORTS).map((k) => (
              <option key={k} value={k}>{EAST_COAST_PORTS[k].name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
            Vessel Class Discharged
          </label>
          <select 
            value={selectedVesselClass} 
            onChange={(e) => setSelectedVesselClass(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <option value="panamax">Panamax (75k DWT Standard)</option>
            <option value="supramax">Supramax (58k DWT)</option>
            <option value="capesize">Capesize (180k DWT)</option>
            <option value="handysize">Handysize (35k DWT)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
            Standard Return Distance
          </label>
          <div style={{ padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '4px', fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
            4,850 NM (Ballast to Australia)
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
            Bunker VLSFO Price
          </label>
          <div style={{ padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '4px', fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
            ${BUNKER_PRICE_VLSFO} / MT
          </div>
        </div>
      </section>

      {/* Spatial Network Options (Clean Horizontal Candidate List) */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Candidate Backhaul Opportunities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Identified Outbound Repositioning Legs
          </div>

          {repositioningLegs.map((leg) => {
            const isSelected = activeLeg?.id === leg.id;
            return (
              <div 
                key={leg.id}
                onClick={() => setActiveLegId(leg.id)}
                style={{
                  background: '#FFFFFF',
                  border: `1.5px solid ${isSelected ? '#1E7E56' : '#CBD5E1'}`,
                  borderRadius: '6px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(30, 126, 86, 0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                    {leg.route}
                  </span>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    background: isSelected ? '#DCFCE7' : '#F1F5F9',
                    color: isSelected ? '#15803D' : '#475569' 
                  }}>
                    +{leg.deadheadReductionPct}% Deadhead Saved
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
                  Cargo: <strong style={{ color: '#0F172A' }}>{leg.cargo}</strong> • Distance: <strong style={{ fontFamily: 'var(--font-mono)' }}>{leg.distanceNm.toLocaleString()} NM</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748B' }}>Net Revenue Contribution:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#1E7E56', fontSize: '0.95rem' }}>
                    +${leg.netRepositioningBenefitUsd.toLocaleString()} USD
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Financial & Emissions Ledger for Selected Leg */}
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C29139', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.35rem' }}>
              Financial Decomposition & IMO CII Impact
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {activeLeg?.route}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748B' }}>Target Parcel Capacity:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{cargoTonnage.toLocaleString()} MT</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748B' }}>Indicative Backhaul Freight:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>${estRate.toFixed(2)} / MT</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748B' }}>Gross Commercial Freight Revenue:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#0F172A' }}>+${grossFreightRevenue.toLocaleString()} USD</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748B' }}>Voyage Bunker Fuel Burn ({activeLeg?.voyageFuelTonne || 380} MT VLSFO):</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#B91C1C' }}>-${voyageFuelCostUsd.toLocaleString()} USD</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#64748B' }}>Estimated Port Dues & Stevedoring:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#B91C1C' }}>-${portDuesUsd.toLocaleString()} USD</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #E2E8F0', paddingTop: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>Net Fleet Repositioning Subsidy:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#1E7E56', fontSize: '1.25rem' }}>
                +${netBenefit.toLocaleString()} USD
              </strong>
            </div>
          </div>

          {/* Environmental Decarbonization Note */}
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '4px', padding: '0.85rem', fontSize: '0.82rem', color: '#166534', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>IMO MARPOL / CII Compliance:</div>
            Repositioning under revenue-earning cargo avoids unproductive empty deadhead emissions, cutting voyage carbon intensity by ~{activeLeg?.deadheadReductionPct || 74}% (-{activeLeg?.co2SavedMt || 420} MT CO₂).
          </div>
        </div>

      </section>

      {/* Simulated Backhaul Provenance */}
      <footer style={{ padding: '1rem 1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.78rem', color: '#64748B' }}>
        [Simulated Backhaul] Candidate export legs are modeled from historical Indian port customs clearances. Not live charter fixtures.
      </footer>
    </div>
  );
}
