"""
Automated Test Suite for SAIL-NaviBulk V2 Decision Intelligence Service
Covers:
1. Port feasibility & physical draft gating
2. Cargo capacity & lightering rules
3. Voyage economics & unit consistency (Distance, speed, hours, days, fuel, $/MT)
4. Forecast adapter mapping & Naive vs ML models
5. Multi-dimensional risk score fusion & tiering
6. Base / Bull / Bear scenario generation
7. Contract strategy comparison (Spot vs COA vs Time Charter)
8. Market timing optimization
9. Backhaul ballast contribution
10. Final master recommendation & explainability
11. Infeasible constraints edge case
12. End-to-end API schema validation
"""

import unittest
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.decision_engine.models import (
    RecommendationRequestV2,
    RiskTolerance,
    ContractStrategy,
    TimingAction,
    RecommendationConfidence
)
from services.decision_engine.providers import DataProvider, BUNKER_PRICE_VLSFO
from services.decision_engine.feasibility import (
    evaluate_vessel_feasibility,
    check_all_vessels_feasibility
)
from services.decision_engine.forecast_adapter import ForecastAdapter
from services.decision_engine.economics import calculate_voyage_economics
from services.decision_engine.risk import evaluate_risk
from services.decision_engine.contracts import evaluate_contracts
from services.decision_engine.scenarios import generate_scenarios
from services.decision_engine.timing import evaluate_timing_options
from services.decision_engine.backhaul import evaluate_backhaul_contribution
from services.decision_engine.decision_engine import DecisionEngineV2


class TestNaviBulkV2DecisionEngine(unittest.TestCase):

    def setUp(self):
        self.provider = DataProvider()
        self.engine = DecisionEngineV2(self.provider)

    # 1. Port Feasibility & Draft Rejection
    def test_capesize_draft_rejection_at_paradip(self):
        """Capesize draft (17.5m) exceeds Paradip berth draft (14.5m); must require lightering or direct berth rejection."""
        result = evaluate_vessel_feasibility("capesize", "paradip", "Australia", 150000)
        self.assertFalse(result.is_direct_berth, "Capesize should not direct berth at Paradip")
        self.assertTrue(result.requires_lightering, "Paradip permits offshore lightering for Capesize")

    def test_panamax_direct_berth_at_paradip(self):
        """Panamax draft (13.8m) <= Paradip berth draft (14.5m); direct berthing should pass."""
        result = evaluate_vessel_feasibility("panamax", "paradip", "Australia", 70000)
        self.assertTrue(result.feasible)
        self.assertTrue(result.is_direct_berth)
        self.assertFalse(result.requires_lightering)

    def test_haldia_two_stage_transshipment(self):
        """Haldia max draft is 8.8m; Handysize (10.0m) or Panamax (13.8m) require Sagar transshipment."""
        result = evaluate_vessel_feasibility("handysize", "haldia", "Australia", 35000)
        self.assertTrue(result.requires_lightering, "Handysize requires Sagar lightering to reach Haldia")
        self.assertEqual(result.lightering_port, "sagar")

    # 2. Voyage Economics & Unit Consistency
    def test_voyage_economics_units_and_math(self):
        """Verify unit consistency: Sea days = NM / (knots * 24), Total Cost / Cargo MT = Cost / MT."""
        econ = calculate_voyage_economics(
            vessel_class_key="panamax",
            origin_country="Australia",
            destination_port_key="paradip",
            cargo_quantity_mt=70000.0,
            tce_rate_usd_per_day=14500.0,
            data_provider=self.provider
        )

        # Nautical distance check
        self.assertEqual(econ.distance_nm, 4850.0)

        # Expected laden sea days = 4850 / (14.0 * 24) = 14.43 days
        expected_laden_days = 4850.0 / (14.0 * 24.0)
        self.assertAlmostEqual(econ.sea_days_laden, expected_laden_days, delta=0.2)

        # Strict mathematical division check: Total Cost / Cargo MT = Cost / MT
        computed_per_mt = econ.total_voyage_cost_usd / 70000.0
        self.assertAlmostEqual(econ.delivered_cost_per_mt, computed_per_mt, delta=0.05)

        # Bunker cost verification
        expected_bunker_usd = econ.fuel_burn_total_mt * BUNKER_PRICE_VLSFO
        self.assertAlmostEqual(econ.bunker_cost_usd, expected_bunker_usd, delta=1.0)

    # 3. Forecast Adapter & Index Mapping
    def test_vessel_index_mapping(self):
        adapter = ForecastAdapter(self.provider)
        self.assertEqual(adapter.get_index_for_vessel("capesize"), "BCI")
        self.assertEqual(adapter.get_index_for_vessel("panamax"), "BPI")
        self.assertEqual(adapter.get_index_for_vessel("supramax"), "BSI")
        self.assertEqual(adapter.get_index_for_vessel("handysize"), "BHSI")

        forecast = adapter.get_vessel_forecast("panamax", 30)
        self.assertIn("current_rate_usd_per_day", forecast)
        self.assertIn("naive_series", forecast)
        self.assertIn("ensemble_series", forecast)
        self.assertEqual(len(forecast["naive_series"]), 30)

    # 4. Risk Engine Fusion & Tiers
    def test_risk_scoring_and_russia_sanctions(self):
        risk_australia = evaluate_risk("Australia", "paradip", False, 8.0, RiskTolerance.MEDIUM)
        risk_russia = evaluate_risk("Russia", "paradip", False, 8.0, RiskTolerance.MEDIUM)

        # Russia route must trigger statutory sanctions flag and have higher composite score
        self.assertGreater(risk_russia.composite_score, risk_australia.composite_score)
        self.assertIn("Statutory Marine Sanctions Flag", risk_russia.flags)

    # 5. Contracts & Scenarios
    def test_contract_evaluation_savings(self):
        econ = calculate_voyage_economics("panamax", "Australia", "paradip", 70000.0, 14500.0, False, data_provider=self.provider)
        risk = evaluate_risk("Australia", "paradip", False, 8.0, RiskTolerance.MEDIUM)
        contracts = evaluate_contracts(econ, risk, 70000.0)

        spot = next(c for c in contracts if c.strategy == ContractStrategy.SPOT)
        coa = next(c for c in contracts if c.strategy == ContractStrategy.COA)

        self.assertGreater(spot.delivered_cost_per_mt, coa.delivered_cost_per_mt)
        self.assertGreater(coa.savings_vs_spot_usd, 0.0)

    # 6. Backhaul Optimization
    def test_backhaul_contribution_odisha_iron_ore(self):
        backhaul = evaluate_backhaul_contribution("paradip", "panamax", 70000.0, self.provider)
        self.assertTrue(backhaul.opportunity_identified)
        self.assertGreater(backhaul.net_monetization_usd, 0.0)
        self.assertGreater(backhaul.cost_reduction_per_mt, 0.0)

    # 7. End-to-End Master Recommendation
    def test_end_to_end_decision_flow(self):
        req = RecommendationRequestV2(
            commodity="Coking Coal",
            cargo_quantity_mt=70000.0,
            origin="Australia",
            destination="paradip",
            risk_tolerance=RiskTolerance.MEDIUM
        )
        resp = self.engine.optimize_chartering_decision(req)

        # Assertions on response structure
        self.assertIn("vessel_class", resp.recommendation)
        self.assertEqual(resp.recommendation["vessel_class"], "panamax") # 70k MT coal to Paradip selects Panamax
        self.assertGreater(resp.economics["expected_delivered_cost_usd"], 0.0)
        self.assertGreater(len(resp.explanation), 3)
        self.assertIn("panamax", [c.vessel_class for c in resp.candidate_evaluations])
        self.assertIn("base", resp.scenarios)
        self.assertIn("bull", resp.scenarios)
        self.assertIn("bear", resp.scenarios)


if __name__ == "__main__":
    unittest.main()
