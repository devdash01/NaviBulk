"""
SAIL NaviBulk - V2 Risk Engine & Risk-Adjusted Decision Model
Fuses:
1. Freight Volatility Exposure
2. Port Congestion Risk
3. Seasonal Weather / Swell Risk
4. Geopolitical & Statutory Sanctions Risk
5. Lightering Dependency Exposure

Calculates:
- Risk Score: 0 to 100
- Risk Tier: LOW, MEDIUM, HIGH, CRITICAL
- Risk Penalty ($/MT) = Delivered Cost * (Risk Score / 100) * Risk Weight Factor
"""

from typing import Dict, Any, List
from .models import RiskAssessment, RiskComponentDetail, RiskTolerance
from .providers import PORT_SPECIFICATIONS, ORIGIN_SPECIFICATIONS


def evaluate_risk(
    origin_country: str,
    destination_port_key: str,
    requires_lightering: bool,
    forecast_volatility_pct: float = 8.5,
    risk_tolerance: RiskTolerance = RiskTolerance.MEDIUM
) -> RiskAssessment:
    """
    Evaluates multi-dimensional risk scores with explicit provenance labeling.
    """
    dest_port = PORT_SPECIFICATIONS.get(destination_port_key.lower(), PORT_SPECIFICATIONS["paradip"])
    origin = ORIGIN_SPECIFICATIONS.get(origin_country, ORIGIN_SPECIFICATIONS["Australia"])

    components: Dict[str, RiskComponentDetail] = {}
    flags: List[str] = []

    # 1. Weather / Monsoon Swell Risk (Heuristic rule based on Bay of Bengal patterns)
    weather_score = 25.0
    weather_level = "Low"
    weather_desc = "Standard navigational weather windows across shipping corridor."
    weather_mitigation = "Standard voyage charter weather laycan clauses."

    if destination_port_key.lower() in ["paradip", "dhamra", "sagar", "haldia"]:
        weather_score = 70.0
        weather_level = "Moderate-High"
        weather_desc = "Bay of Bengal seasonal low-pressure swell corridor; potential pilotage delays."
        weather_mitigation = "Incorporate 24-48h weather laycan extension clause to prevent demurrage."
        flags.append("Seasonal Swell / Pilotage Delay Window")

    components["weather"] = RiskComponentDetail(
        dimension="Weather & Swell Exposure",
        score=weather_score,
        level=weather_level,
        category="STATIC_ASSUMPTION",
        description=weather_desc,
        mitigation=weather_mitigation,
    )

    # 2. Port Congestion Risk
    wait_days = dest_port.get("congestion_wait_days", 2.0)
    congestion_score = min(100.0, wait_days * 22.0)
    congestion_level = "High" if wait_days >= 3.0 else ("Moderate" if wait_days >= 2.0 else "Low")
    congestion_desc = f"Indicative turnaround wait queue at {dest_port['name']} is ~{wait_days} days."
    congestion_mitigation = (
        "Nominate mechanized bulk unloaders or request priority discharge for strategic blast furnace feedstock."
        if wait_days >= 3.0 else "Normal queue berthing expected."
    )
    if wait_days >= 3.0:
        flags.append("Elevated Port Congestion Delay")

    components["congestion"] = RiskComponentDetail(
        dimension="Port Congestion & Demurrage Risk",
        score=congestion_score,
        level=congestion_level,
        category="STATIC_ASSUMPTION",
        description=congestion_desc,
        mitigation=congestion_mitigation,
    )

    # 3. Geopolitical & Sanctions Risk
    geo_score = 15.0
    geo_level = "Low"
    geo_desc = "Shipping lane operates without statutory sanctions restrictions."
    geo_mitigation = "Standard cargo insurance and bill of lading clearance."

    if origin.get("sanctions_flag", False) or origin_country == "Russia":
        geo_score = 85.0
        geo_level = "Critical"
        geo_desc = "Statutory compliance trigger: OFAC price caps, EU maritime insurance rules, banking wire delays."
        geo_mitigation = "Mandate P&I Club insurance verification and dual-currency letter of credit clauses."
        flags.append("Statutory Marine Sanctions Flag")
    elif origin_country == "Mozambique":
        geo_score = 45.0
        geo_level = "Moderate"
        geo_desc = "Periodic rail-to-port logistics bottleneck at Beira corridor."
        geo_mitigation = "Verify port stockpile volume prior to vessel nomination."
        flags.append("Corridor Rail Bottleneck Advisory")

    components["geopolitical"] = RiskComponentDetail(
        dimension="Geopolitical & Sanctions Exposure",
        score=geo_score,
        level=geo_level,
        category="MODEL_DERIVED",
        description=geo_desc,
        mitigation=geo_mitigation,
    )

    # 4. Freight Market Volatility Risk
    vol_score = min(100.0, forecast_volatility_pct * 4.5)
    vol_level = "High" if vol_score >= 60 else ("Moderate" if vol_score >= 35 else "Low")
    components["freight_volatility"] = RiskComponentDetail(
        dimension="Freight Rate Volatility",
        score=vol_score,
        level=vol_level,
        category="MODEL_OUTPUT",
        description=f"Predicted 15-30 day freight price uncertainty spread is {forecast_volatility_pct:.1f}%.",
        mitigation="Consider hedging high exposure volume via Contract of Affreightment (COA).",
    )

    # 5. Lightering Dependency Risk
    lightering_score = 65.0 if requires_lightering else 0.0
    lightering_level = "Moderate-High" if requires_lightering else "Low"
    components["lightering"] = RiskComponentDetail(
        dimension="Offshore Lightering Dependency",
        score=lightering_score,
        level=lightering_level,
        category="STATIC_ASSUMPTION",
        description="Requires deepwater floating crane transfer at anchorage node (e.g. Sagar/Sandheads)." if requires_lightering else "Direct deepwater berthing; zero transshipment required.",
        mitigation="Ensure floating crane availability and double-handling barge contracts." if requires_lightering else "None required.",
    )
    if requires_lightering:
        flags.append("Double-Handling Lightering Required")

    # Weighted Composite Score (Weather 20%, Congestion 25%, Geopolitical 25%, Volatility 20%, Lightering 10%)
    weights = [0.20, 0.25, 0.25, 0.20, 0.10]
    scores = [weather_score, congestion_score, geo_score, vol_score, lightering_score]
    composite = sum(w * s for w, s in zip(weights, scores))

    if composite >= 65.0:
        tier = "CRITICAL"
    elif composite >= 45.0:
        tier = "HIGH"
    elif composite >= 25.0:
        tier = "MEDIUM"
    else:
        tier = "LOW"

    # Risk Penalty factor based on risk tolerance
    tolerance_multipliers = {
        RiskTolerance.LOW: 0.12,     # Highly risk-averse -> penalize risk heavily
        RiskTolerance.MEDIUM: 0.08,  # Balanced SAIL baseline
        RiskTolerance.HIGH: 0.04,    # Risk tolerant -> focus purely on lowest nominal cost
    }
    risk_weight = tolerance_multipliers.get(risk_tolerance, 0.08)
    # Penalty in $/MT terms
    penalty_per_mt = round((composite / 100.0) * risk_weight * 35.0, 2)

    return RiskAssessment(
        composite_score=round(composite, 1),
        tier=tier,
        penalty_usd_per_mt=penalty_per_mt,
        components=components,
        flags=flags,
    )
