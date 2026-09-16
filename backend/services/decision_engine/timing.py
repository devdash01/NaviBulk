"""
SAIL NaviBulk - V2 Market Timing Engine
Evaluates finite market timing alternatives:
1. FIX NOW (Spot Entry)
2. WAIT 7 DAYS
3. WAIT 15 DAYS
4. COA HEDGE (Multi-voyage risk cover)

Calculates expected delivered cost, risk-adjusted cost, and expected savings.
"""

from typing import List, Dict, Any
from .models import TimingAction, TimingOption, RiskAssessment
from .economics import calculate_voyage_economics


def evaluate_timing_options(
    vessel_class_key: str,
    origin_country: str,
    destination_port_key: str,
    cargo_quantity_mt: float,
    forecast_data: Dict[str, Any],
    risk: RiskAssessment,
    requires_lightering: bool
) -> List[TimingOption]:
    """
    Compares fixing today vs delaying fixture by 7 or 15 days, or locking COA.
    """
    rate_now = forecast_data.get("current_rate_usd_per_day", 14500.0)
    rate_7d = forecast_data.get("rate_day_7", rate_now)
    rate_15d = forecast_data.get("rate_day_15", rate_now)

    # 1. Option: FIX NOW
    econ_now = calculate_voyage_economics(
        vessel_class_key=vessel_class_key,
        origin_country=origin_country,
        destination_port_key=destination_port_key,
        cargo_quantity_mt=cargo_quantity_mt,
        tce_rate_usd_per_day=rate_now,
        requires_lightering=requires_lightering
    )
    risk_adj_now = econ_now.delivered_cost_per_mt + risk.penalty_usd_per_mt
    opt_now = TimingOption(
        action=TimingAction.FIX_NOW,
        days_to_wait=0,
        projected_tce_rate=round(rate_now, 1),
        delivered_cost_per_mt=round(econ_now.delivered_cost_per_mt, 2),
        risk_adjusted_cost_per_mt=round(risk_adj_now, 2),
        expected_savings_usd=0.0,
        feasibility_status="IMMEDIATE_EXECUTION",
        rationale="Fix immediately at current spot levels to avoid prospective freight upside exposure.",
    )

    # 2. Option: WAIT 7 DAYS
    econ_7d = calculate_voyage_economics(
        vessel_class_key=vessel_class_key,
        origin_country=origin_country,
        destination_port_key=destination_port_key,
        cargo_quantity_mt=cargo_quantity_mt,
        tce_rate_usd_per_day=rate_7d,
        requires_lightering=requires_lightering
    )
    # Additional delay uncertainty penalty (+ $0.35/MT)
    risk_adj_7d = econ_7d.delivered_cost_per_mt + risk.penalty_usd_per_mt + 0.35
    savings_7d = (econ_now.total_voyage_cost_usd - econ_7d.total_voyage_cost_usd)
    rat_7d = (
        f"Deferring 7 days captures projected rate reduction of ${rate_now - rate_7d:.1f}/day."
        if rate_7d < rate_now else
        f"Waiting 7 days projected to increase hire expense by +${rate_7d - rate_now:.1f}/day."
    )
    opt_7d = TimingOption(
        action=TimingAction.WAIT_7D,
        days_to_wait=7,
        projected_tce_rate=round(rate_7d, 1),
        delivered_cost_per_mt=round(econ_7d.delivered_cost_per_mt, 2),
        risk_adjusted_cost_per_mt=round(risk_adj_7d, 2),
        expected_savings_usd=round(savings_7d, 2),
        feasibility_status="DEFERRED_EXECUTION",
        rationale=rat_7d,
    )

    # 3. Option: WAIT 15 DAYS
    econ_15d = calculate_voyage_economics(
        vessel_class_key=vessel_class_key,
        origin_country=origin_country,
        destination_port_key=destination_port_key,
        cargo_quantity_mt=cargo_quantity_mt,
        tce_rate_usd_per_day=rate_15d,
        requires_lightering=requires_lightering
    )
    # Delay uncertainty penalty (+ $0.75/MT)
    risk_adj_15d = econ_15d.delivered_cost_per_mt + risk.penalty_usd_per_mt + 0.75
    savings_15d = (econ_now.total_voyage_cost_usd - econ_15d.total_voyage_cost_usd)
    rat_15d = (
        f"Forecast models indicate freight softening by 15-day mark, saving ~${savings_15d:,.0f}."
        if rate_15d < rate_now else
        f"Rates trending higher over 15-day horizon (+${rate_15d - rate_now:.1f}/day); waiting not recommended."
    )
    opt_15d = TimingOption(
        action=TimingAction.WAIT_15D,
        days_to_wait=15,
        projected_tce_rate=round(rate_15d, 1),
        delivered_cost_per_mt=round(econ_15d.delivered_cost_per_mt, 2),
        risk_adjusted_cost_per_mt=round(risk_adj_15d, 2),
        expected_savings_usd=round(savings_15d, 2),
        feasibility_status="DEFERRED_EXECUTION",
        rationale=rat_15d,
    )

    # 4. Option: COA HEDGE
    coa_delivered = econ_now.delivered_cost_per_mt * 0.935 # 6.5% discount
    coa_total = coa_delivered * cargo_quantity_mt
    coa_risk_adj = coa_delivered + (risk.penalty_usd_per_mt * 0.6)
    coa_savings = econ_now.total_voyage_cost_usd - coa_total
    opt_coa = TimingOption(
        action=TimingAction.COA_HEDGE,
        days_to_wait=0,
        projected_tce_rate=round(rate_now * 0.935, 1),
        delivered_cost_per_mt=round(coa_delivered, 2),
        risk_adjusted_cost_per_mt=round(coa_risk_adj, 2),
        expected_savings_usd=round(coa_savings, 2),
        feasibility_status="PROGRAM_CONTRACT",
        rationale="Hedge 60% of shipment under long-term COA to insulate SAIL from spot market rate swings.",
    )

    return [opt_now, opt_7d, opt_15d, opt_coa]
