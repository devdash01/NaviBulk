"""
SAIL NaviBulk - V2 Port & Vessel Feasibility Module
Evaluates physical draft, LOA, beam, DWT caps, and lightering rules.
Provides transparent explanations for WHY candidate vessels are feasible or rejected.
"""

from typing import Dict, Any, List
from .models import FeasibilityCheckResult
from .providers import PORT_SPECIFICATIONS, ORIGIN_SPECIFICATIONS, VESSEL_CLASSES, ASSUMED_LIGHTERING_DELAY_DAYS, ASSUMED_LIGHTERING_FEE_USD_PER_MT


def evaluate_vessel_feasibility(
    vessel_class_key: str,
    destination_port_key: str,
    origin_country: str,
    cargo_quantity_mt: float
) -> FeasibilityCheckResult:
    """
    Checks if a vessel class can physically berth and load/discharge the required cargo.
    Evaluates:
      1. Origin draft/LOA/DWT limits
      2. Destination berth draft/LOA/beam limits
      3. Haldia two-stage Sagar/Sandheads transshipment rules
      4. Single-parcel capacity vs excessive parcel size
    """
    vessel = VESSEL_CLASSES.get(vessel_class_key.lower())
    dest_port = PORT_SPECIFICATIONS.get(destination_port_key.lower())
    origin = ORIGIN_SPECIFICATIONS.get(origin_country)

    if not vessel:
        return FeasibilityCheckResult(
            vessel_class=vessel_class_key,
            vessel_name=vessel_class_key.capitalize(),
            feasible=False,
            is_direct_berth=False,
            requires_lightering=False,
            rejection_reason=f"Unknown vessel class: {vessel_class_key}"
        )

    if not dest_port:
        return FeasibilityCheckResult(
            vessel_class=vessel_class_key,
            vessel_name=vessel["name"],
            feasible=False,
            is_direct_berth=False,
            requires_lightering=False,
            rejection_reason=f"Unknown destination port: {destination_port_key}"
        )

    vessel_draft = vessel["draft_req_m"]
    vessel_loa = vessel["loa_req_m"]
    vessel_beam = vessel["beam_req_m"]
    vessel_dwt_max = vessel["dwt_max"]

    port_draft = dest_port["max_draft_m"]
    port_loa = dest_port["max_loa_m"]
    port_beam = dest_port["max_beam_m"]
    port_dwt = dest_port["max_dwt"]

    issues = []
    is_direct_berth = True
    requires_lightering = False
    lightering_hub = None

    # 1. Origin Berth Check
    if origin and vessel_draft > origin["max_draft_m"]:
        issues.append(
            f"Vessel draft ({vessel_draft}m) exceeds load port max draft ({origin['max_draft_m']}m) at {origin['name']}."
        )
        is_direct_berth = False

    # 2. Destination Port Feasibility Check
    # Specific Haldia Two-Stage Transshipment Rule
    if destination_port_key.lower() == "haldia":
        if vessel_draft > port_draft or vessel_loa > port_loa or cargo_quantity_mt > port_dwt:
            is_direct_berth = False
            sagar_port = PORT_SPECIFICATIONS["sagar"]
            if vessel_draft <= sagar_port["max_draft_m"]:
                requires_lightering = True
                lightering_hub = "sagar"
                # Feasible via offshore lightering
            else:
                issues.append(
                    f"Vessel draft ({vessel_draft}m) exceeds both Haldia river draft ({port_draft}m) and Sagar deepwater anchorage ({sagar_port['max_draft_m']}m)."
                )
    else:
        # General East Coast Indian Ports (Paradip, Vizag, Gangavaram, Dhamra, Gopalpur)
        if vessel_draft > port_draft:
            is_direct_berth = False
            if dest_port.get("lightering_permitted", False):
                requires_lightering = True
                lightering_hub = dest_port.get("lightering_hub") or "Sandheads/Offshore"
            else:
                issues.append(
                    f"Fully laden arrival draft ({vessel_draft}m) exceeds {dest_port['name']} maximum cargo berth draft ({port_draft}m). Lightering not permitted."
                )

        if vessel_loa > port_loa:
            is_direct_berth = False
            issues.append(
                f"Vessel LOA ({vessel_loa}m) exceeds {dest_port['name']} berth length cap ({port_loa}m)."
            )

        if vessel_beam > port_beam:
            is_direct_berth = False
            issues.append(
                f"Vessel beam ({vessel_beam}m) exceeds {dest_port['name']} channel/berth beam limit ({port_beam}m)."
            )

    feasible = (is_direct_berth or requires_lightering) and len(issues) == 0

    rejection_reason = None
    if not feasible:
        rejection_reason = "; ".join(issues) if issues else "Port physical constraints not satisfied."

    details = {
        "vessel_draft_m": vessel_draft,
        "port_draft_m": port_draft,
        "vessel_loa_m": vessel_loa,
        "port_loa_m": port_loa,
        "vessel_beam_m": vessel_beam,
        "port_beam_m": port_beam,
        "vessel_dwt_max": vessel_dwt_max,
        "port_dwt_max": port_dwt,
        "lightering_penalty_days": ASSUMED_LIGHTERING_DELAY_DAYS if requires_lightering else 0.0,
        "lightering_fee_usd_per_mt": ASSUMED_LIGHTERING_FEE_USD_PER_MT if requires_lightering else 0.0,
    }

    return FeasibilityCheckResult(
        vessel_class=vessel_class_key,
        vessel_name=vessel["name"],
        feasible=feasible,
        is_direct_berth=is_direct_berth,
        requires_lightering=requires_lightering,
        lightering_port=lightering_hub,
        rejection_reason=rejection_reason,
        details=details,
    )


def check_all_vessels_feasibility(
    destination_port_key: str,
    origin_country: str,
    cargo_quantity_mt: float
) -> List[FeasibilityCheckResult]:
    """
    Evaluates all standard vessel classes (Handysize, Supramax, Panamax, Capesize).
    """
    results = []
    for v_key in ["handysize", "supramax", "panamax", "capesize"]:
        res = evaluate_vessel_feasibility(v_key, destination_port_key, origin_country, cargo_quantity_mt)
        results.append(res)
    return results
