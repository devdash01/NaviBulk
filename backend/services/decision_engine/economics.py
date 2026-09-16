"""
SAIL NaviBulk - V2 Voyage Economics Engine
Computes itemized maritime economics with strict unit consistency:
- Sea days = distance / (speed * 24)
- Port days = (cargo / load_rate) + (cargo / discharge_rate) + wait_buffer
- Bunker cost = fuel_burn_mt * bunker_price_usd
- Charter cost = total_days * daily_hire_rate
- Lightering cost = cargo_mt * lightering_fee_usd
- Delivered Cost / MT = total_voyage_cost / cargo_mt
"""

import math
from typing import Dict, Any, Optional
from .models import CandidateVoyageEconomics
from .providers import (
    DataProvider,
    VESSEL_CLASSES,
    BUNKER_PRICE_VLSFO,
    ASSUMED_LIGHTERING_FEE_USD_PER_MT,
    ASSUMED_LIGHTERING_DELAY_DAYS,
    ASSUMED_DESTINATION_PORT_DUES
)


def calculate_voyage_economics(
    vessel_class_key: str,
    origin_country: str,
    destination_port_key: str,
    cargo_quantity_mt: float,
    tce_rate_usd_per_day: float,
    requires_lightering: bool = False,
    speed_knots_override: Optional[float] = None,
    data_provider: Optional[DataProvider] = None
) -> CandidateVoyageEconomics:
    """
    Evaluates complete voyage disbursement and operational expenditure.
    """
    provider = data_provider or DataProvider()
    vessel = provider.get_vessel_spec(vessel_class_key)
    origin = provider.get_origin_spec(origin_country)
    dest_port = provider.get_port_spec(destination_port_key)

    # 1. Parcel sizing & Voyage count
    max_dwt = vessel["dwt_max"]
    num_voyages = max(1, math.ceil(cargo_quantity_mt / max_dwt))
    parcel_per_voyage = cargo_quantity_mt / num_voyages

    # 2. Nautical Distance & Sea Transit
    distance_nm = provider.get_distance_nm(origin_country, destination_port_key)
    speed = speed_knots_override or vessel["speed_knots"]
    
    # Laden sea days + Ballast sea days (approx 0.95 factor for return)
    sea_days_laden = (distance_nm / (speed * 24.0)) * num_voyages
    sea_days_ballast = sea_days_laden * 0.95

    # 3. Port Operations & Berth Turnaround
    load_rate = origin.get("load_rate_tpd", 40000.0)
    discharge_rate = dest_port.get("handling_rate_tpd", 30000.0)
    wait_days = dest_port.get("congestion_wait_days", 2.0)

    load_days = (parcel_per_voyage / load_rate) * num_voyages
    discharge_days = (parcel_per_voyage / discharge_rate) * num_voyages
    port_wait_total = wait_days * num_voyages
    total_port_days = load_days + discharge_days + port_wait_total

    # 4. Lightering Time Penalty
    lightering_days = (ASSUMED_LIGHTERING_DELAY_DAYS * num_voyages) if requires_lightering else 0.0

    # 5. Total Voyage Duration (Days)
    total_voyage_days = sea_days_laden + sea_days_ballast + total_port_days + lightering_days

    # 6. Fuel / Bunker Consumption (Metric Tonnes)
    fuel_laden_burn_tpd = vessel["bunker_burn_tpd_laden"]
    fuel_ballast_burn_tpd = vessel["bunker_burn_tpd_ballast"]
    fuel_port_burn_tpd = 4.0  # Generator/auxiliary engines in port

    total_fuel_mt = round(
        (sea_days_laden * fuel_laden_burn_tpd) +
        (sea_days_ballast * fuel_ballast_burn_tpd) +
        ((total_port_days + lightering_days) * fuel_port_burn_tpd),
        2
    )
    bunker_cost_usd = total_fuel_mt * BUNKER_PRICE_VLSFO

    # 7. Time Charter Hire Cost (USD)
    charter_hire_cost_usd = total_voyage_days * tce_rate_usd_per_day

    # 8. Port Dues & Canal Tolls
    origin_dues = origin.get("port_dues_usd", 35000.0) * num_voyages
    dest_dues = ASSUMED_DESTINATION_PORT_DUES * num_voyages
    port_charges_usd = origin_dues + dest_dues

    canal_tolls_usd = 0.0
    if origin_country in ["US", "Russia"]:
        # Transit toll proxy
        canal_tolls_usd = 15000.0 * num_voyages

    # 9. Lightering Cost (USD)
    lightering_cost_usd = 0.0
    if requires_lightering:
        lightering_cost_usd = cargo_quantity_mt * ASSUMED_LIGHTERING_FEE_USD_PER_MT

    # 10. Total Voyage Cost & Cost Per Metric Tonne
    total_voyage_cost_usd = (
        charter_hire_cost_usd +
        bunker_cost_usd +
        port_charges_usd +
        canal_tolls_usd +
        lightering_cost_usd
    )
    delivered_cost_per_mt = total_voyage_cost_usd / cargo_quantity_mt

    return CandidateVoyageEconomics(
        vessel_class=vessel_class_key,
        vessel_name=vessel["name"],
        sub_index=vessel["sub_index"],
        distance_nm=round(distance_nm, 1),
        num_voyages=num_voyages,
        parcel_per_voyage_mt=round(parcel_per_voyage, 1),
        sea_days_laden=round(sea_days_laden, 1),
        sea_days_ballast=round(sea_days_ballast, 1),
        port_days=round(total_port_days, 1),
        lightering_days=round(lightering_days, 1),
        total_voyage_days=round(total_voyage_days, 1),
        tce_rate_usd_per_day=round(tce_rate_usd_per_day, 1),
        charter_hire_cost_usd=round(charter_hire_cost_usd, 2),
        fuel_burn_total_mt=total_fuel_mt,
        bunker_cost_usd=round(bunker_cost_usd, 2),
        port_charges_usd=round(port_charges_usd, 2),
        canal_tolls_usd=round(canal_tolls_usd, 2),
        lightering_cost_usd=round(lightering_cost_usd, 2),
        total_voyage_cost_usd=round(total_voyage_cost_usd, 2),
        delivered_cost_per_mt=round(delivered_cost_per_mt, 2),
    )
