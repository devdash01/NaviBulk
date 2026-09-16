// SAIL NaviBulk — Stage Router
// Renders exactly ONE focused analytical stage workspace at a time based on activeStage state
import React from 'react';
import { useDecisionEngine } from '../context/DecisionContext.jsx';
import StageGate from './StageGate.jsx';

// Stage Component Workspaces
import RequirementStage from '../stages/RequirementStage.jsx';
import MarketStage from '../stages/MarketStage.jsx';
import FeasibilityStage from '../stages/FeasibilityStage.jsx';
import EconomicsStage from '../stages/EconomicsStage.jsx';
import BasePlanStage from '../stages/BasePlanStage.jsx';
import ProcurementStage from '../stages/ProcurementStage.jsx';
import SourcesStage from '../stages/SourcesStage.jsx';
import StressStage from '../stages/StressStage.jsx';
import CounterfactualStage from '../stages/CounterfactualStage.jsx';
import DecisionStage from '../stages/DecisionStage.jsx';

export default function StageRouter() {
  const { activeStage, stageStatuses } = useDecisionEngine();

  const currentStatus = stageStatuses[activeStage] || 'not_started';

  // If the stage has not been analyzed or requires reanalysis (and is not requirement itself)
  if (activeStage !== 'requirement' && (currentStatus === 'not_started' || currentStatus === 'requires_reanalysis')) {
    return <StageGate stageId={activeStage} status={currentStatus} />;
  }

  // Render the single focused analytical stage
  switch (activeStage) {
    case 'requirement':
      return <RequirementStage />;
    case 'market':
      return <MarketStage />;
    case 'feasibility':
      return <FeasibilityStage />;
    case 'economics':
      return <EconomicsStage />;
    case 'baseplan':
      return <BasePlanStage />;
    case 'procurement':
      return <ProcurementStage />;
    case 'sources':
      return <SourcesStage />;
    case 'stress':
      return <StressStage />;
    case 'counterfactual':
      return <CounterfactualStage />;
    case 'decision':
      return <DecisionStage />;
    default:
      return <RequirementStage />;
  }
}
