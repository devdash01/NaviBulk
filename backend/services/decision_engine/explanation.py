"""
SAIL NaviBulk - V2 Explainability & Confidence Engine
Generates plain-language auditing rationale explaining:
- Why candidate vessels were feasible or rejected
- Why the chosen vessel class delivers lowest risk-adjusted delivered cost
- What Baltic forecast trends justify the timing action
- What contract framework mitigates procurement exposure
- Quantified confidence tier (HIGH, MEDIUM, LOW) with mathematical justification
"""

from typing import List, Dict, Any, Tuple
from .models import (
    RecommendationConfidence,
    FeasibilityCheckResult,
    CandidateVoyageEconomics,
    RiskAssessment,
    BackhaulContribution,
    TimingOption,
    ContractEvaluation
)


def generate_recommendation_explanation(
    recommended_vessel_name: str,
    destination_port_name: str,
    cargo_quantity_mt: float,
    commodity: str,
    feasibility_results: List[FeasibilityCheckResult],
    best_economics: CandidateVoyageEconomics,
    risk: RiskAssessment,
    best_timing: TimingOption,
    best_contract: ContractEvaluation,
    backhaul: BackhaulContribution,
    is_direct_berth: bool,
    requires_lightering: bool
) -> List[str]:
    """
    Constructs transparent, auditable points explaining the optimal decision.
    """
    explanations = []

    # 1. Physical Feasibility & Berth Access
    if is_direct_berth:
        explanations.append(
            f"Physical Feasibility: {recommended_vessel_name} satisfies maximum arrival draft ({best_economics.delivered_cost_per_mt}$/t), LOA, and beam limits for direct berthing at {destination_port_name} with zero transshipment required."
        )
    elif requires_lightering:
        explanations.append(
            f"Transshipment Access: Fully laden arrival draft exceeds {destination_port_name} inner basin; accommodated via deep-water lightering with an included +${best_economics.lightering_cost_usd:,.0f} lightering handling allowance."
        )

    # 2. Rejected Vessel Class Justifications
    rejected_reasons = []
    for f in feasibility_results:
        if not f.feasible:
            rejected_reasons.append(f"{f.vessel_name}: {f.rejection_reason}")
    if rejected_reasons:
        explanations.append(f"Rejected Alternatives: {'; '.join(rejected_reasons[:2])}")

    # 3. Scale Economy & Delivered Cost
    explanations.append(
        f"Delivered Economics: Lowest expected delivered cost of ${best_economics.delivered_cost_per_mt:.2f}/MT (${best_economics.total_voyage_cost_usd:,.0f} total voyage expenditure), outperforming alternative candidate classes."
    )

    # 4. Market Timing & Freight Forecast
    explanations.append(
        f"Timing Execution: Selected action [{best_timing.action.value}]. {best_timing.rationale}"
    )

    # 5. Contract Structure
    explanations.append(
        f"Contract Framework: [{best_contract.strategy.value}] recommended. {best_contract.description} Expected savings vs spot fixture: ${best_contract.savings_vs_spot_usd:,.0f}."
    )

    # 6. Risk Profile & Mitigation
    explanations.append(
        f"Risk Defense: Composite risk score of {risk.composite_score:.1f}/100 ({risk.tier} Tier). Applied risk-adjustment penalty of +${risk.penalty_usd_per_mt:.2f}/MT to prioritize supply chain continuity."
    )

    # 7. Backhaul Monetization
    if backhaul.opportunity_identified:
        explanations.append(
            f"Backhaul Repositioning: Identified ballast monetization via {backhaul.cargo} to {backhaul.route}. Yields net contribution of -${backhaul.cost_reduction_per_mt:.2f}/MT."
        )

    return explanations


def evaluate_recommendation_confidence(
    best_cost_per_mt: float,
    second_best_cost_per_mt: float,
    risk_score: float,
    forecast_uncertainty_pct: float
) -> Tuple[RecommendationConfidence, str]:
    """
    Mathematically determines confidence based on margin of advantage and forecast stability.
    """
    cost_advantage_pct = 0.0
    if second_best_cost_per_mt > 0:
        cost_advantage_pct = ((second_best_cost_per_mt - best_cost_per_mt) / second_best_cost_per_mt) * 100.0

    if cost_advantage_pct >= 5.0 and risk_score < 45.0 and forecast_uncertainty_pct < 12.0:
        return (
            RecommendationConfidence.HIGH,
            f"High confidence: Preferred strategy delivers strong {cost_advantage_pct:.1f}% cost advantage over second-best candidate with controlled risk ({risk_score:.0f}/100)."
        )
    elif cost_advantage_pct >= 2.0 and risk_score < 65.0:
        return (
            RecommendationConfidence.MEDIUM,
            f"Medium confidence: Strategy holds a {cost_advantage_pct:.1f}% cost advantage, but forecast spread or port congestion warrants active monitoring."
        )
    else:
        return (
            RecommendationConfidence.LOW,
            f"Low confidence: Narrow margin of advantage ({cost_advantage_pct:.1f}%) or elevated route risk ({risk_score:.0f}/100); consider flexible index float."
        )
