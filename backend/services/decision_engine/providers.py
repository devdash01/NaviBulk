"""
SAIL NaviBulk - V2 Data Provider Layer
Clean abstraction separating real historical data, static engineering assumptions, and cached ML artifacts.
Zero external network calls required for demo reliability.
"""

import json
import os
from typing import Dict, Any, List, Optional

# Verified benchmark constants
BUNKER_PRICE_VLSFO = 829.50  # [VERIFIED - Ship & Bunker Global 20 Ports Average Sep 3, 2026]
ASSUMED_LIGHTERING_FEE_USD_PER_MT = 3.80 # [ILLUSTRATIVE ASSUMPTION - Port Trust handbook indicative]
ASSUMED_LIGHTERING_DELAY_DAYS = 3.5     # [ILLUSTRATIVE ASSUMPTION - Anchorage transshipment delay]
ASSUMED_DESTINATION_PORT_DUES = 32000.0 # [ILLUSTRATIVE ASSUMPTION - Port call tariff]

# Nautical Distances (Standard NGA Pub 151 / SeaRates nautical lookups)
NAUTICAL_DISTANCES: Dict[str, Dict[str, float]] = {
    "Australia": {
        "paradip": 4850.0,
        "vizag": 4720.0,
        "gangavaram": 4700.0,
        "gopalpur": 4800.0,
        "dhamra": 4880.0,
        "sagar": 4950.0,
        "haldia": 5020.0,
    },
    "US": {
        "paradip": 11400.0,
        "vizag": 11300.0,
        "gangavaram": 11280.0,
        "gopalpur": 11350.0,
        "dhamra": 11420.0,
        "sagar": 11500.0,
        "haldia": 11580.0,
    },
    "Mozambique": {
        "paradip": 4350.0,
        "vizag": 4200.0,
        "gangavaram": 4180.0,
        "gopalpur": 4300.0,
        "dhamra": 4380.0,
        "sagar": 4450.0,
        "haldia": 4520.0,
    },
    "Russia": {
        "paradip": 4920.0,
        "vizag": 4850.0,
        "gangavaram": 4830.0,
        "gopalpur": 4900.0,
        "dhamra": 4950.0,
        "sagar": 5010.0,
        "haldia": 5080.0,
    },
    "Indonesia": {
        "paradip": 1850.0,
        "vizag": 1780.0,
        "gangavaram": 1760.0,
        "gopalpur": 1820.0,
        "dhamra": 1880.0,
        "sagar": 1940.0,
        "haldia": 2010.0,
    },
}

# Indian East Coast Port Specifications (Aligned with portConstraints.js)
PORT_SPECIFICATIONS: Dict[str, Dict[str, Any]] = {
    "paradip": {
        "name": "Paradip Port Authority",
        "max_draft_m": 14.5,
        "max_loa_m": 300.0,
        "max_beam_m": 48.0,
        "max_dwt": 100000.0,
        "handling_rate_tpd": 35000.0,
        "lightering_permitted": True,
        "lightering_hub": "sagar",
        "congestion_wait_days": 2.5,
        "cyclone_risk": "High",
    },
    "vizag": {
        "name": "Visakhapatnam Port Authority (VPT Outer VGCB)",
        "max_draft_m": 18.1,
        "max_loa_m": 356.0,
        "max_beam_m": 50.0,
        "max_dwt": 200000.0,
        "handling_rate_tpd": 40000.0,
        "lightering_permitted": True,
        "lightering_hub": None,
        "congestion_wait_days": 1.8,
        "cyclone_risk": "Moderate-High",
    },
    "gangavaram": {
        "name": "Adani Gangavaram Port",
        "max_draft_m": 19.5,
        "max_loa_m": 320.0,
        "max_beam_m": 50.0,
        "max_dwt": 200000.0,
        "handling_rate_tpd": 55000.0,
        "lightering_permitted": True,
        "lightering_hub": None,
        "congestion_wait_days": 1.2,
        "cyclone_risk": "Moderate",
    },
    "gopalpur": {
        "name": "Adani Gopalpur Port",
        "max_draft_m": 14.5,
        "max_loa_m": 290.0,
        "max_beam_m": 45.0,
        "max_dwt": 120000.0,
        "handling_rate_tpd": 25000.0,
        "lightering_permitted": False,
        "lightering_hub": None,
        "congestion_wait_days": 1.5,
        "cyclone_risk": "High",
    },
    "dhamra": {
        "name": "Adani Dhamra Port",
        "max_draft_m": 18.0,
        "max_loa_m": 350.0,
        "max_beam_m": 47.0,
        "max_dwt": 180000.0,
        "handling_rate_tpd": 60000.0,
        "lightering_permitted": True,
        "lightering_hub": None,
        "congestion_wait_days": 1.0,
        "cyclone_risk": "High",
    },
    "sagar": {
        "name": "Sagar / Sandheads Anchorage (SMP Kolkata)",
        "max_draft_m": 18.5,
        "max_loa_m": 315.0,
        "max_beam_m": 50.0,
        "max_dwt": 180000.0,
        "handling_rate_tpd": 18000.0,
        "lightering_permitted": True,
        "lightering_hub": None,
        "congestion_wait_days": 3.5,
        "cyclone_risk": "Very High",
    },
    "haldia": {
        "name": "Haldia Dock Complex (SMP Kolkata)",
        "max_draft_m": 8.8,
        "max_loa_m": 230.0,
        "max_beam_m": 27.5,
        "max_dwt": 45000.0,
        "handling_rate_tpd": 20000.0,
        "lightering_permitted": True,
        "lightering_hub": "sagar",
        "congestion_wait_days": 4.2,
        "cyclone_risk": "High",
    },
}

# Foreign Load Port Specifications
ORIGIN_SPECIFICATIONS: Dict[str, Dict[str, Any]] = {
    "Australia": {
        "name": "Hay Point / Dalrymple Bay / Gladstone",
        "max_draft_m": 19.5,
        "max_loa_m": 315.0,
        "max_dwt": 210000.0,
        "load_rate_tpd": 80000.0,
        "port_dues_usd": 42000.0,
        "sanctions_flag": False,
    },
    "US": {
        "name": "Hampton Roads (Norfolk) / Baltimore",
        "max_draft_m": 15.2,
        "max_loa_m": 290.0,
        "max_dwt": 150000.0,
        "load_rate_tpd": 45000.0,
        "port_dues_usd": 38000.0,
        "sanctions_flag": False,
    },
    "Mozambique": {
        "name": "Beira / Nacala",
        "max_draft_m": 13.5,
        "max_loa_m": 225.0,
        "max_dwt": 75000.0,
        "load_rate_tpd": 25000.0,
        "port_dues_usd": 28000.0,
        "sanctions_flag": False,
    },
    "Russia": {
        "name": "Vostochny / Murmansk",
        "max_draft_m": 16.5,
        "max_loa_m": 280.0,
        "max_dwt": 150000.0,
        "load_rate_tpd": 40000.0,
        "port_dues_usd": 35000.0,
        "sanctions_flag": True,
    },
    "Indonesia": {
        "name": "Taboneo Anchorage / Tanjung Bara",
        "max_draft_m": 14.0,
        "max_loa_m": 230.0,
        "max_dwt": 80000.0,
        "load_rate_tpd": 30000.0,
        "port_dues_usd": 22000.0,
        "sanctions_flag": False,
    },
}

# Standard Vessel Classes (Exact match to naval architecture specs in portConstraints.js)
VESSEL_CLASSES: Dict[str, Dict[str, Any]] = {
    "capesize": {
        "id": "capesize",
        "name": "Capesize Bulk Carrier",
        "dwt_min": 150000.0,
        "dwt_max": 200000.0,
        "avg_dwt": 180000.0,
        "draft_req_m": 17.5,
        "loa_req_m": 292.0,
        "beam_req_m": 45.0,
        "sub_index": "BCI",
        "speed_knots": 13.5,
        "bunker_burn_tpd_laden": 42.0,
        "bunker_burn_tpd_ballast": 35.0,
        "baseline_tce_usd": 22500.0,
    },
    "panamax": {
        "id": "panamax",
        "name": "Panamax / Kamsarmax",
        "dwt_min": 70000.0,
        "dwt_max": 85000.0,
        "avg_dwt": 75000.0,
        "draft_req_m": 13.8,
        "loa_req_m": 229.0,
        "beam_req_m": 32.3,
        "sub_index": "BPI",
        "speed_knots": 14.0,
        "bunker_burn_tpd_laden": 28.0,
        "bunker_burn_tpd_ballast": 24.0,
        "baseline_tce_usd": 14500.0,
    },
    "supramax": {
        "id": "supramax",
        "name": "Supramax / Ultramax",
        "dwt_min": 50000.0,
        "dwt_max": 65000.0,
        "avg_dwt": 58000.0,
        "draft_req_m": 12.2,
        "loa_req_m": 199.0,
        "beam_req_m": 32.2,
        "sub_index": "BSI",
        "speed_knots": 14.2,
        "bunker_burn_tpd_laden": 23.0,
        "bunker_burn_tpd_ballast": 19.0,
        "baseline_tce_usd": 13000.0,
    },
    "handysize": {
        "id": "handysize",
        "name": "Handysize Bulk Carrier",
        "dwt_min": 28000.0,
        "dwt_max": 40000.0,
        "avg_dwt": 35000.0,
        "draft_req_m": 10.0,
        "loa_req_m": 180.0,
        "beam_req_m": 28.0,
        "sub_index": "BHSI",
        "speed_knots": 13.0,
        "bunker_burn_tpd_laden": 17.0,
        "bunker_burn_tpd_ballast": 14.0,
        "baseline_tce_usd": 9800.0,
    },
}


class DataProvider:
    """
    Abstract interface for retrieving freight, port, vessel, and market data.
    """
    def __init__(self, cache_file_path: Optional[str] = None):
        if not cache_file_path:
            cache_file_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "cached_forecasts.json"
            )
        self.cache_file_path = cache_file_path
        self._cached_forecasts = self._load_cache()

    def _load_cache(self) -> Dict[str, Any]:
        if os.path.exists(self.cache_file_path):
            try:
                with open(self.cache_file_path, "r") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[WARN] Failed to load forecast cache: {e}")
        return {}

    def get_forecast(self, sub_index_key: str) -> Dict[str, Any]:
        """
        Retrieves precomputed forecast for the given sub-index (BCI, BPI, BSI, BHSI).
        Returns baseline estimates if offline cache is missing.
        """
        sub_key = sub_index_key.upper()
        if self._cached_forecasts and "sub_indices" in self._cached_forecasts:
            if sub_key in self._cached_forecasts["sub_indices"]:
                data = self._cached_forecasts["sub_indices"][sub_key]
                return {
                    "sub_index": sub_key,
                    "historical": data.get("historical", []),
                    "forecast_30d": data.get("sarima_forecast", []),
                    "xgboost_30d": data.get("xgboost_forecast", []),
                    "u95": data.get("u95", []),
                    "l95": data.get("l95", []),
                    "u80": data.get("u80", []),
                    "l80": data.get("l80", []),
                    "benchmarks": self._cached_forecasts.get("benchmarks", {}),
                    "provenance": "REAL_HISTORICAL_PLUS_OFFLINE_ML",
                }

        # Fallback baseline
        base = 14500.0
        return {
            "sub_index": sub_key,
            "historical": [base] * 30,
            "forecast_30d": [base] * 30,
            "xgboost_30d": [base] * 30,
            "u95": [base * 1.15] * 30,
            "l95": [base * 0.85] * 30,
            "u80": [base * 1.08] * 30,
            "l80": [base * 0.92] * 30,
            "benchmarks": {},
            "provenance": "STATIC_BASELINE_FALLBACK",
        }

    def get_distance_nm(self, origin: str, destination: str) -> float:
        return NAUTICAL_DISTANCES.get(origin, {}).get(destination.lower(), 4800.0)

    def get_port_spec(self, port_key: str) -> Dict[str, Any]:
        return PORT_SPECIFICATIONS.get(port_key.lower(), PORT_SPECIFICATIONS["paradip"])

    def get_origin_spec(self, origin_key: str) -> Dict[str, Any]:
        return ORIGIN_SPECIFICATIONS.get(origin_key, ORIGIN_SPECIFICATIONS["Australia"])

    def get_vessel_spec(self, vessel_key: str) -> Dict[str, Any]:
        return VESSEL_CLASSES.get(vessel_key.lower(), VESSEL_CLASSES["panamax"])
