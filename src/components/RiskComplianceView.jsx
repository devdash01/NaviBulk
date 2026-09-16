// SAIL NaviBulk — Maritime Risk & Compliance Workstation
// Institutional Industrial Operations Aesthetic
import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Wind, 
  Compass, 
  DollarSign, 
  FileText, 
  Scale, 
  Navigation, 
  CheckCircle2, 
  Anchor 
} from 'lucide-react';
import { EAST_COAST_PORTS, FOREIGN_LOAD_PORTS, VESSEL_CLASSES } from '../data/portConstraints';
import { evaluateRouteRisks } from '../engine/riskEngine';
import { BUNKER_PRICE_VLSFO, NAUTICAL_DISTANCE_MATRIX } from '../data/freightData';
import RiskRadarMap from './RiskRadarMap';

export default function RiskComplianceView({ initialOrigin = 'Australia', initialDest = 'paradip' }) {
  const [originCountry, setOriginCountry] = useState(initialOrigin);
  const [destinationPortKey, setDestinationPortKey] = useState(initialDest);
  const [vesselClass, setVesselClass] = useState('panamax');
  const [selectedHazardId, setSelectedHazardId] = useState('bay_of_bengal');

  const riskProfile = useMemo(() => {
    return evaluateRouteRisks(originCountry, destinationPortKey);
  }, [originCountry, destinationPortKey]);

  const destPort = EAST_COAST_PORTS[destinationPortKey] || EAST_COAST_PORTS.paradip;
  const vessel = VESSEL_CLASSES[vesselClass] || VESSEL_CLASSES.panamax;
  const distanceNm = NAUTICAL_DISTANCE_MATRIX[originCountry]?.[destinationPortKey] || 4850;
  const voyageDays = (distanceNm / ((vessel.avgSpeedKnots || 14.0) * 24)).toFixed(1);

  // Dominant Single Risk Score
  const compositeScore = riskProfile.overallRiskScore || 34;
  const riskTier = compositeScore > 60 ? 'HIGH EXPOSURE' : compositeScore > 30 ? 'MEDIUM RISK' : 'LOW RISK';
  const tierColor = compositeScore > 60 ? 'var(--loss)' : compositeScore > 30 ? 'var(--warn)' : 'var(--gain)';
  const tierBg = compositeScore > 60 ? 'rgba(217, 84, 77, 0.15)' : compositeScore > 30 ? 'rgba(217, 154, 43, 0.15)' : 'rgba(63, 178, 127, 0.15)';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Editorial Header */}
      <header style={{ borderBottom: '1px solid var(--hairline)', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brass)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            MARITIME RISK & CORRIDOR EXPOSURE WORKSTATION
          </div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-hi)', margin: '0 0 0.35rem', letterSpacing: '-0.01em' }}>
            Corridor Risk & BIMCO Contractual Defense.
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', margin: 0 }}>
            Empirical evaluation of freight rate volatility, chokepoints, monsoonal weather swell, and required charterparty protective riders.
          </p>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-low)' }}>
          Corridor: <strong style={{ color: 'var(--text-hi)' }}>{originCountry} → {destPort.name}</strong> ({distanceNm.toLocaleString()} NM • ~{voyageDays} Days)
        </div>
      </header>

      {/* Dominant Single Score Plaque */}
      <section 
        className="graphite-card"
        style={{
          padding: '2rem 2.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          borderLeft: `4px solid ${tierColor}`
        }}
      >
        {/* Left: Dominant Composite Score Display */}
        <div style={{ borderRight: '1px solid var(--hairline)', paddingRight: '1.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>
            Route Composite Risk Index
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '3.8rem', fontWeight: 900, color: 'var(--text-hi)', lineHeight: 1 }}>
              {compositeScore}
            </span>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-low)', fontWeight: 600 }}>/ 100</span>
          </div>

          <div style={{ 
            display: 'inline-block',
            padding: '0.25rem 0.75rem', 
            borderRadius: '4px', 
            background: tierBg,
            color: tierColor,
            border: `1px solid ${tierColor}`,
            fontWeight: 800,
            fontSize: '0.78rem',
            letterSpacing: '0.04em'
          }}>
            {riskTier}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-mid)', marginTop: '0.75rem', lineHeight: 1.45 }}>
            Quantified delivery variance applied as <strong style={{ color: 'var(--text-hi)' }}>+${riskProfile.penaltyPerTonneUsd || 0.45}/MT</strong> buffer to baseline voyage economics.
          </p>
        </div>

        {/* Right: Clean 5-Part Contributor Decomposition */}
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '1rem' }}>
            Risk Contributor Decomposition
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
            {/* Contributor 1: Volatility */}
            <div style={{ background: 'var(--graphite-800)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Freight Volatility</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {riskProfile.subScores?.freightVolatility || 38} <span style={{ fontSize: '0.75rem', color: 'var(--text-low)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--brass-bright)', marginTop: '0.2rem' }}>BPI 30D Swing ±6.8%</div>
            </div>

            {/* Contributor 2: Port Congestion */}
            <div style={{ background: 'var(--graphite-800)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Port Congestion</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {riskProfile.subScores?.portCongestion || 45} <span style={{ fontSize: '0.75rem', color: 'var(--text-low)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-mid)', marginTop: '0.2rem' }}>{destPort.name} 2.0d queue</div>
            </div>

            {/* Contributor 3: Weather Swell */}
            <div style={{ background: 'var(--graphite-800)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Seasonal Weather</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {riskProfile.subScores?.weatherSwell || 30} <span style={{ fontSize: '0.75rem', color: 'var(--text-low)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gain)', marginTop: '0.2rem' }}>Bay of Bengal Force 4</div>
            </div>

            {/* Contributor 4: Chokepoint */}
            <div style={{ background: 'var(--graphite-800)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Geopolitical Chokepoint</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-hi)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                {riskProfile.subScores?.geopolitical || 22} <span style={{ fontSize: '0.75rem', color: 'var(--text-low)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gain)', marginTop: '0.2rem' }}>Malacca Transit Normal</div>
            </div>

            {/* Contributor 5: Lightering */}
            <div style={{ background: 'var(--graphite-800)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-low)', textTransform: 'uppercase', fontWeight: 700 }}>Lightering Exposure</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gain)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                0 <span style={{ fontSize: '0.75rem', color: 'var(--text-low)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gain)', marginTop: '0.2rem' }}>Zero transshipment ($0)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Maritime Hazard Command Radar Component */}
      <section>
        <RiskRadarMap 
          activeHazard={selectedHazardId}
          onSelectHazard={(id) => setSelectedHazardId(typeof id === 'string' ? id : id?.id || 'bay_of_bengal')}
        />
      </section>

      {/* Mandatory Contractual BIMCO Protective Riders */}
      <section className="graphite-card" style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <FileText size={18} color="var(--brass)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-hi)', margin: 0 }}>
            Mandated BIMCO Charterparty Defense Clauses
          </h4>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-mid)', margin: '0 0 1rem' }}>
          Incorporate these standard riders directly into the recap fixture to insulate SAIL against shipowner demurrage and laytime disputes:
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem 0.85rem', background: 'var(--graphite-800)', border: '1px solid var(--hairline)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-hi)' }}>
            ✓ BIMCO Virtual Arrival Clause 2011 (Weather & Congestion Synchronization)
          </div>
          <div style={{ padding: '0.5rem 0.85rem', background: 'var(--graphite-800)', border: '1px solid var(--hairline)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-hi)' }}>
            ✓ Weather Working Days (WWD) 24 Consecutive Hours Rider
          </div>
          <div style={{ padding: '0.5rem 0.85rem', background: 'var(--graphite-800)', border: '1px solid var(--hairline)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-hi)' }}>
            ✓ BIMCO Sanctions Clause for Time / Voyage Charter Parties 2020
          </div>
        </div>
      </section>

      {/* Provenance Disclosure */}
      <footer style={{ fontSize: '0.75rem', color: 'var(--text-low)', borderTop: '1px solid var(--hairline)', paddingTop: '1rem' }}>
        [Illustrative Port Heuristic] Risk weights calibrated against historical Baltic demurrage occurrences. Non-live weather proxy based on seasonal IMD Indian Ocean records.
      </footer>
    </div>
  );
}
