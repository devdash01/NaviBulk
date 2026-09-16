// Stage 8: Executive Output Dashboard Component
import React, { useState, useMemo } from 'react';
import Stage1InputForm from './Stage1InputForm';
import ForecastChart from './ForecastChart';
import VesselRecommendationCard from './VesselRecommendationCard';
import IdleLegCard from './IdleLegCard';
import RiskAlertsPanel from './RiskAlertsPanel';
import CharterLockModal from './CharterLockModal';
import { rankFeasibleVessels, evaluateOptimalTiming, matchIdleRepositioningLeg, generatePlainLanguageRationale } from '../engine/recommendationEngine';
import { evaluateRouteRisks } from '../engine/riskEngine';
import { EAST_COAST_PORTS } from '../data/portConstraints';
import { Award, Lock, FileText, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ onOpenPortModal, onRiskCountChange }) {
  // Stage 1 Inputs State
  const [inputs, setInputs] = useState({
    cargoType: 'Coking Coal',
    tonnage: 75000,
    originCountry: 'Australia',
    destinationPortKey: 'paradip',
    contractType: 'single_voyage',
  });

  const [selectedVesselKey, setSelectedVesselKey] = useState('panamax');
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockedVesselObj, setLockedVesselObj] = useState(null);

  // Calculate Pipeline Stages
  const rankedVessels = useMemo(() => {
    return rankFeasibleVessels(inputs);
  }, [inputs]);

  // Top Feasible Recommendation
  const topFeasibleVessel = useMemo(() => {
    return rankedVessels.find((v) => v.feasibility.feasible) || rankedVessels[0];
  }, [rankedVessels]);

  const activeVesselKey = selectedVesselKey || topFeasibleVessel.vesselKey;
  const activeVesselObj = rankedVessels.find((v) => v.vesselKey === activeVesselKey) || topFeasibleVessel;

  // Stage 5 Timing Evaluation
  const timingEval = useMemo(() => {
    return evaluateOptimalTiming({
      vesselClassKey: activeVesselKey,
      originCountry: inputs.originCountry,
      destinationPortKey: inputs.destinationPortKey,
      tonnage: inputs.tonnage,
      contractType: inputs.contractType,
    });
  }, [inputs, activeVesselKey]);

  // Stage 6 Idle Repositioning Leg
  const repositioningLegs = useMemo(() => {
    return matchIdleRepositioningLeg(inputs.destinationPortKey, activeVesselKey);
  }, [inputs.destinationPortKey, activeVesselKey]);

  // Stage 7 Risk Evaluation
  const riskEval = useMemo(() => {
    return evaluateRouteRisks(inputs.originCountry, inputs.destinationPortKey);
  }, [inputs.originCountry, inputs.destinationPortKey]);

  // Sync evaluated active risks count dynamically with parent layout
  React.useEffect(() => {
    if (onRiskCountChange) {
      onRiskCountChange(riskEval.activeFlags.length);
    }
  }, [riskEval, onRiskCountChange]);

  // Stage 8 Plain Language Rationale
  const rationaleText = useMemo(() => {
    return generatePlainLanguageRationale({
      cargoType: inputs.cargoType,
      tonnage: inputs.tonnage,
      originCountry: inputs.originCountry,
      destinationPortKey: inputs.destinationPortKey,
      recommendedVessel: activeVesselObj,
      timingEval,
      riskFlags: riskEval,
    });
  }, [inputs, activeVesselObj, timingEval, riskEval]);

  const handleLockCharter = (vessel) => {
    setLockedVesselObj(vessel);
    setIsLockModalOpen(true);
  };

  const destPortObj = EAST_COAST_PORTS[inputs.destinationPortKey] || EAST_COAST_PORTS.paradip;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Stage 1: Cargo & Voyage Input Layer Form */}
      <Stage1InputForm inputs={inputs} setInputs={setInputs} onCalculate={() => {}} />

      {/* Stage 8 Executive Executive Summary Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)', borderColor: 'var(--accent-blue)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span className="proxy-badge-cyan" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>STAGE 8 EXECUTIVE SUMMARY</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-hero)' }}>
              Recommended Strategy: {activeVesselObj.vesselName} • {timingEval.recommendation}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Projected Voyage Freight Expense: <strong style={{ color: 'var(--accent-cyan)' }}>${activeVesselObj.costPerTonneUsd}/tonne</strong> (${activeVesselObj.totalVoyageCostUsd.toLocaleString()} Total Outlay)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--gain-bg)', border: '1px solid var(--gain-border)', padding: '0.65rem 1rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#34D399', textTransform: 'uppercase', fontWeight: 700 }}>Projected Cost Saving</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gain)' }}>${timingEval.totalSavingsUsd.toLocaleString()}</div>
            </div>

            <button className="btn btn-success" onClick={() => handleLockCharter(activeVesselObj)}>
              <Lock size={16} /> Lock Recommendation
            </button>
          </div>
        </div>

        {/* Dynamic Plain-Language Rationale Text Box */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.85rem 1.1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
          <strong style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '0.35rem' }}>
            📌 Central Plain-Language Decision Rationale:
          </strong>
          {rationaleText}
        </div>
      </div>

      {/* Stage 2 & 5 Freight Forecasting Chart */}
      <ForecastChart forecastData={timingEval.forecastSeries} timingEval={timingEval} subIndexKey={activeVesselObj.subIndex} />

      {/* Stage 4 Feasible Vessel Cards */}
      <VesselRecommendationCard
        rankedVessels={rankedVessels}
        selectedVesselKey={activeVesselKey}
        onSelectVessel={setSelectedVesselKey}
        onLockCharter={handleLockCharter}
      />

      {/* Two Column Grid: Stage 6 Idle Repositioning + Stage 7 Risk Module */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.25rem' }}>
        <IdleLegCard repositioningLegs={repositioningLegs} destinationPortName={destPortObj.name} />
        <RiskAlertsPanel riskEval={riskEval} />
      </div>

      {/* Pre-filled Charter Requisition Lock Modal */}
      <CharterLockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        selectedVessel={lockedVesselObj || activeVesselObj}
        inputs={inputs}
        timingEval={timingEval}
        rationaleText={rationaleText}
        riskEval={riskEval}
      />
    </div>
  );
}
