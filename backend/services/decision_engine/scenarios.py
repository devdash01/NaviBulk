"""
SAIL NaviBulk - V2 Scenario Engine
Generates Base, Bull, and Bear market conditions using statistical confidence intervals:
- Base: Mean ensemble forecast
- Bull (Charterer perspective / Bear freight market): Lower confidence bound (l80 / l95)
- Bear (Charterer perspective / Spiking freight market): Upper confidence bound (u80 / u95)
"""

from typing import Dict, Any
from .models import ScenarioDetail, RiskAssessment
from .economics import calculate_voyage_economics


def generate_scenarios(
    vessel_class_key: str,
    origin_country: str,
    destination_port_key: str,
    cargo_quantity_mt: float,
    forecast_data: Dict[str, Any],
    risk: RiskAssessment,
    requires_lightering: bool
) -> Dict[str, ScenarioDetail]:
    """
    Computes expected delivered cost and total spend under Base, Bull, and Bear market conditions.
    """
    rate_base = forecast_data.get("rate_day_15", forecast_data.get("current_rate_usd_per_day", 14500.0))
    rate_bull = forecast_data.get("ci_lower_80_day_15", rate_base * 0.92) # Softening freight = Bullish for SAIL charterers
    rate_bear = forecast_data.get("ci_upper_80_day_15", rate_base * 1.08) # Spiking freight = Bearish for SAIL charterers

    # Base Scenario
    base_econ = calculate_voyage_economics(
        vessel_class_key=vessel_class_key,
        origin_country=origin_country,
        destination_port_key=destination_port_key,
        cargo_quantity_mt=cargo_quantity_mt,
        tce_rate_usd_per_day=rate_base,
        requires_lightering=requires_lightering
    )
    base_risk_adj = base_econ.delivered_cost_per_mt + risk.penalty_usd_per_mt
    base_scen = ScenarioDetail(
        scenario="base",
        sub_index_rate=round(rate_base, 1),
        delivered_cost_per_mt=round(base_econ.delivered_cost_per_mt, 2),
        total_cost_usd=round(base_econ.total_voyage_cost_usd, 2),
        risk_adjusted_cost_per_mt=round(base_risk_adj, 2),
        ci_level="50th Percentile (Mean Expectation)",
        probability_note="Central expectation of SARIMAX & XGBoost ensemble.",
    )

    # Bull Scenario (Freight softens -> Lower charter expenditure)
    bull_econ = calculate_voyage_economics(
        vessel_class_key=vessel_class_key,
        origin_country=origin_country,
        destination_port_key=destination_port_key,
        cargo_quantity_mt=cargo_quantity_mt,
        tce_rate_usd_per_day=rate_bull,
        requires_lightering=requires_lightering
    )
    bull_risk_adj = bull_econ.delivered_cost_per_mt + (risk.penalty_usd_per_mt * 0.8)
    bull_scen = ScenarioDetail(
        scenario="bull",
        sub_index_rate=round(rate_bull, 1),
        delivered_cost_per_mt=round(bull_econ.delivered_cost_per_mt, 2),
        total_cost_usd=round(bull_econ.total_voyage_cost_usd, 2),
        risk_adjusted_cost_per_mt=round(bull_risk_adj, 2),
        ci_level="80% Lower CI Bound",
        probability_note="Favorable market softening; captures surplus fleet tonnage availability.",
    )

    # Bear Scenario (Freight spikes -> Higher charter expenditure)
    bear_econ = calculate_voyage_economics(
        vessel_class_key=vessel_class_key,
        origin_country=origin_country,
        destination_port_key=destination_port_key,
        cargo_quantity_mt=cargo_quantity_mt,
        tce_rate_usd_per_day=rate_bear,
        requires_lightering=requires_lightering
    )
    bear_risk_adj = bear_econ.delivered_cost_per_mt + (risk.penalty_usd_per_mt * 1.25)
    bear_scen = ScenarioDetail(
        scenario="bear",
        sub_index_rate=round(rate_bear, 1),
        delivered_cost_per_mt=round(bear_econ.delivered_cost_per_mt, 2),
        total_cost_usd=round(bear_econ.total_voyage_cost_usd, 2),
        risk_adjusted_cost_per_mt=round(bear_risk_adj, 2),
        ci_level="80% Upper CI Bound",
        probability_note="Stress scenario; port delays and bunker price inflation tighten vessel supply.",
    )

    return {
        "base": base_scen,
        "bull": bull_scen,
        "bear": bear_scen,
    }
