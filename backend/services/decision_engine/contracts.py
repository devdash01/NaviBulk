"""
SAIL NaviBulk - V2 Contract Evaluation Engine
Evaluates:
1. Spot Voyage Charter (100% exposed to spot volatility)
2. Contract of Affreightment (COA / Multi-Voyage hedge)
3. Period Time Charter (Daily hire baseline + bunker responsibility)

Calculates expected delivered cost, risk-adjusted cost, commitment, and savings vs Spot.
"""

from typing import List
from .models import ContractStrategy, ContractEvaluation, CandidateVoyageEconomics, RiskAssessment


def evaluate_contracts(
    base_economics: CandidateVoyageEconomics,
    risk: RiskAssessment,
    cargo_quantity_mt: float,
    coa_discount_pct: float = 6.5,
    time_charter_discount_pct: float = 8.0
) -> List[ContractEvaluation]:
    """
    Compares Spot vs COA vs Time Charter.
    Explicitly labels volume discounts as assumptions.
    """
    spot_cost_per_mt = base_economics.delivered_cost_per_mt
    spot_total = base_economics.total_voyage_cost_usd

    # 1. Spot Voyage
    # Full exposure to market swings and risk penalty
    spot_risk_adj = spot_cost_per_mt + risk.penalty_usd_per_mt
    spot_eval = ContractEvaluation(
        strategy=ContractStrategy.SPOT,
        description="Single voyage spot charter fixture; fixed at prevailing index rate.",
        delivered_cost_per_mt=round(spot_cost_per_mt, 2),
        total_cost_usd=round(spot_total, 2),
        risk_adjusted_cost_per_mt=round(spot_risk_adj, 2),
        savings_vs_spot_usd=0.0,
        assumptions="Direct spot market settlement; 100% exposure to rate volatility.",
        commitment_mt=cargo_quantity_mt,
    )

    # 2. Contract of Affreightment (COA)
    # Provides volume discount (assumed 6.5%) and dampens risk exposure by 40%
    coa_delivered = spot_cost_per_mt * (1.0 - (coa_discount_pct / 100.0))
    coa_total = coa_delivered * cargo_quantity_mt
    coa_risk_penalty = risk.penalty_usd_per_mt * 0.60  # Hedged against spot spike
    coa_risk_adj = coa_delivered + coa_risk_penalty
    coa_savings = max(0.0, spot_total - coa_total)

    coa_eval = ContractEvaluation(
        strategy=ContractStrategy.COA,
        description=f"6-Month Multi-Voyage Contract of Affreightment (COA) with locked volume discount.",
        delivered_cost_per_mt=round(coa_delivered, 2),
        total_cost_usd=round(coa_total, 2),
        risk_adjusted_cost_per_mt=round(coa_risk_adj, 2),
        savings_vs_spot_usd=round(coa_savings, 2),
        assumptions=f"[ILLUSTRATIVE ASSUMPTION] Negotiated ~{coa_discount_pct}% charterer volume rebate across recurring quarterly program.",
        commitment_mt=cargo_quantity_mt * 3.0,  # e.g., 3-voyage commitment
    )

    # 3. Period Time Charter (TC)
    # Lower hire rate (assumed 8% discount on hire component), but charterer absorbs voyage delays
    hire_discount = base_economics.charter_hire_cost_usd * (time_charter_discount_pct / 100.0)
    tc_total = spot_total - hire_discount
    tc_delivered = tc_total / cargo_quantity_mt
    tc_risk_adj = tc_delivered + (risk.penalty_usd_per_mt * 0.85)
    tc_savings = max(0.0, spot_total - tc_total)

    tc_eval = ContractEvaluation(
        strategy=ContractStrategy.TIME_CHARTER,
        description="Short-term period time charter (3–6 months); charterer commands vessel speed & scheduling.",
        delivered_cost_per_mt=round(tc_delivered, 2),
        total_cost_usd=round(tc_total, 2),
        risk_adjusted_cost_per_mt=round(tc_risk_adj, 2),
        savings_vs_spot_usd=round(tc_savings, 2),
        assumptions=f"[ILLUSTRATIVE ASSUMPTION] ~{time_charter_discount_pct}% operational discount on vessel hire; charterer pays direct bunkers and port disbursements.",
        commitment_mt=cargo_quantity_mt * 2.0,
    )

    return [spot_eval, coa_eval, tc_eval]
