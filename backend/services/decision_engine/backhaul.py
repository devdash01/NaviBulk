"""
SAIL NaviBulk - V2 Backhaul & Ballast Optimization Module
Matches empty repositioning vessels with candidate export cargoes from India's East Coast:
- Odisha Iron Ore Pellets / Fines -> China (Qingdao / Caofeidian)
- Granulated Blast Furnace Slag (GBFS) -> UAE / GCC (Mina Saqr)
- Industrial Minerals / Bauxite -> Singapore Strait

Calculates:
- Gross backhaul freight revenue
- Additional fuel burn & port disbursements
- Net ballast offset contribution ($/MT reduction on primary import)
"""

from typing import Optional
from .models import BackhaulContribution
from .providers import DataProvider, BUNKER_PRICE_VLSFO


def evaluate_backhaul_contribution(
    destination_port_key: str,
    vessel_class_key: str,
    primary_cargo_mt: float,
    data_provider: Optional[DataProvider] = None
) -> BackhaulContribution:
    """
    Evaluates realistic repositioning cargo pairings departing from the discharge port.
    Returns zero contribution if vessel is Handysize or port has no matched leg.
    """
    provider = data_provider or DataProvider()
    vessel = provider.get_vessel_spec(vessel_class_key)
    dest_port = provider.get_port_spec(destination_port_key)

    dest_key = destination_port_key.lower()
    v_key = vessel_class_key.lower()

    # Handysize usually remains in coastal trade or short runs, not major export bulk
    if v_key == "handysize":
        return BackhaulContribution(
            opportunity_identified=False,
            rationale="Handysize vessels typically re-enter domestic coastal cabotage rather than international deep-sea backhaul."
        )

    # Candidate pairings
    candidate = None
    if dest_key in ["paradip", "dhamra", "haldia"]:
        candidate = {
            "route": f"{dest_port['name']} -> Qingdao / Caofeidian (China)",
            "cargo": "High-Grade Iron Ore Pellets / Sinter Feed (Ex-Odisha/Jharkhand)",
            "distance_nm": 3600.0,
            "backhaul_rate_per_mt": 14.80, # $/MT freight assessment
            "backhaul_parcel_mt": min(vessel["avg_dwt"] * 0.95, 120000.0),
            "diversion_port_dues": 48000.0,
        }
    elif dest_key in ["vizag", "gangavaram", "gopalpur"]:
        candidate = {
            "route": f"{dest_port['name']} -> Mina Saqr (UAE / Arabian Gulf)",
            "cargo": "Granulated Blast Furnace Slag (GBFS) / Clinker (Ex-SAIL Vizag)",
            "distance_nm": 2400.0,
            "backhaul_rate_per_mt": 12.20,
            "backhaul_parcel_mt": min(vessel["avg_dwt"] * 0.90, 75000.0),
            "diversion_port_dues": 38000.0,
        }

    if not candidate:
        return BackhaulContribution(
            opportunity_identified=False,
            rationale="No commercially viable backhaul cargo identified from selected discharge port."
        )

    # Physics-based economics
    speed = vessel["speed_knots"]
    sea_days = candidate["distance_nm"] / (speed * 24.0)
    fuel_burn_mt = sea_days * vessel["bunker_burn_tpd_laden"]
    additional_bunker_cost = fuel_burn_mt * BUNKER_PRICE_VLSFO

    gross_revenue = candidate["backhaul_parcel_mt"] * candidate["backhaul_rate_per_mt"]
    net_monetization = max(0.0, gross_revenue - additional_bunker_cost - candidate["diversion_port_dues"])

    # Net cost reduction allocated to the primary inbound cargo
    cost_reduction_per_mt = round((net_monetization * 0.35) / primary_cargo_mt, 2)

    return BackhaulContribution(
        opportunity_identified=True,
        route=candidate["route"],
        cargo=candidate["cargo"],
        distance_nm=candidate["distance_nm"],
        gross_revenue_usd=round(gross_revenue, 2),
        additional_bunker_usd=round(additional_bunker_cost, 2),
        net_monetization_usd=round(net_monetization, 2),
        cost_reduction_per_mt=cost_reduction_per_mt,
        rationale=f"Monetizes empty return leg carrying {candidate['cargo']}. Offsets ~${net_monetization:,.0f} in repositioning overheads (-${cost_reduction_per_mt:.2f}/MT net saving)."
    )
