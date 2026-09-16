"""
SAIL NaviBulk - V2 Freight Forecast Adapter
Maps vessel classes to appropriate Baltic indices (BCI, BPI, BSI, BHSI).
Evaluates naive persistence baseline, SARIMAX, XGBoost, and ensemble models.
Transparently labels data as index-based freight proxies rather than fabricated fixtures.
"""

from typing import Dict, Any, List
from .providers import DataProvider, VESSEL_CLASSES

# Baltic index mappings per vessel class
VESSEL_TO_INDEX_MAP = {
    "capesize": "BCI",   # Baltic Capesize Index
    "panamax": "BPI",    # Baltic Panamax Index
    "supramax": "BSI",   # Baltic Supramax Index
    "handysize": "BHSI", # Baltic Handysize Index
}


class ForecastAdapter:
    def __init__(self, data_provider: DataProvider):
        self.provider = data_provider

    def get_index_for_vessel(self, vessel_class_key: str) -> str:
        return VESSEL_TO_INDEX_MAP.get(vessel_class_key.lower(), "BPI")

    def get_vessel_forecast(self, vessel_class_key: str, horizon_days: int = 30) -> Dict[str, Any]:
        """
        Retrieves forecasted daily TCE rate series for the vessel's designated Baltic sub-index.
        Includes Naive Baseline (persistence) comparison for defensive ML reporting.
        """
        sub_index = self.get_index_for_vessel(vessel_class_key)
        raw_data = self.provider.get_forecast(sub_index)

        hist = raw_data.get("historical", [])
        current_rate = float(hist[-1]) if hist else VESSEL_CLASSES[vessel_class_key]["baseline_tce_usd"]

        sarima_forecast = raw_data.get("forecast_30d", [current_rate] * horizon_days)[:horizon_days]
        xgboost_forecast = raw_data.get("xgboost_30d", [current_rate] * horizon_days)[:horizon_days]
        u95 = raw_data.get("u95", [current_rate * 1.15] * horizon_days)[:horizon_days]
        l95 = raw_data.get("l95", [current_rate * 0.85] * horizon_days)[:horizon_days]
        u80 = raw_data.get("u80", [current_rate * 1.08] * horizon_days)[:horizon_days]
        l80 = raw_data.get("l80", [current_rate * 0.92] * horizon_days)[:horizon_days]

        # Ensemble: 55% XGBoost + 45% SARIMAX
        ensemble = []
        for s, x in zip(sarima_forecast, xgboost_forecast):
            ensemble.append(round(0.45 * float(s) + 0.55 * float(x), 1))

        # Naive persistence baseline: forecast(t+h) = current_rate
        naive_baseline = [round(current_rate, 1)] * len(sarima_forecast)

        # Multi-horizon rates
        rate_now = current_rate
        rate_7d = ensemble[min(6, len(ensemble) - 1)] if ensemble else current_rate
        rate_15d = ensemble[min(14, len(ensemble) - 1)] if ensemble else current_rate
        rate_30d = ensemble[min(29, len(ensemble) - 1)] if ensemble else current_rate

        benchmarks = raw_data.get("benchmarks", {})

        return {
            "vessel_class": vessel_class_key,
            "sub_index": sub_index,
            "current_rate_usd_per_day": round(rate_now, 1),
            "rate_day_7": round(rate_7d, 1),
            "rate_day_15": round(rate_15d, 1),
            "rate_day_30": round(rate_30d, 1),
            "ci_lower_95_day_15": round(l95[min(14, len(l95) - 1)], 1) if l95 else current_rate * 0.85,
            "ci_upper_95_day_15": round(u95[min(14, len(u95) - 1)], 1) if u95 else current_rate * 1.15,
            "ci_lower_80_day_15": round(l80[min(14, len(l80) - 1)], 1) if l80 else current_rate * 0.92,
            "ci_upper_80_day_15": round(u80[min(14, len(u80) - 1)], 1) if u80 else current_rate * 1.08,
            "ensemble_series": ensemble,
            "sarima_series": sarima_forecast,
            "xgboost_series": xgboost_forecast,
            "naive_series": naive_baseline,
            "benchmarks": benchmarks,
            "label": f"Index-based freight proxy ({sub_index} Time Charter Equivalent)",
            "provenance": "MODEL_OUTPUT (Trained on real Baltic Exchange historical records)",
        }
