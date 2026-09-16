"""
SAIL NaviBulk - V2 Master Decision Engine
Central orchestrator answering:
“Given a cargo requirement today, what vessel should SAIL use, from which origin,
to which East Coast Indian port, under which contract strategy, and when should it be fixed,
so that expected delivered procurement cost is minimized while controlling risk?”

Objective:
MINIMIZE: Risk-Adjusted Delivered Cost ($/MT)
= Nominal Delivered Cost ($/MT) + Risk Penalty ($/MT) - Backhaul Contribution ($/MT)
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List

from .models import (
    RecommendationRequestV2,
    RecommendationResponseV2,
    CandidateStrategy,
    ContractStrategy,
    TimingAction
)
from .providers import DataProvider, PORT_SPECIFICATIONS
from .feasibility import check_all_vessels_feasibility
from .forecast_adapter import ForecastAdapter
from .economics import calculate_voyage_economics
from .risk import evaluate_risk
from .contracts import evaluate_contracts
from .scenarios import generate_scenarios
from .timing import evaluate_timing_options
from .backhaul import evaluate_backhaul_contribution
from .explanation import generate_recommendation_explanation, evaluate_recommendation_confidence


class DecisionEngineV2:
    def __init__(self, data_provider: DataProvider = None):
        self.provider = data_provider or DataProvider()
        self.forecast_adapter = ForecastAdapter(self.provider)

    def optimize_chartering_decision(self, req: RecommendationRequestV2) -> RecommendationResponseV2:
        """
        Executes complete 12-stage decision pipeline.
        """
        dest_key = req.destination.lower()
        origin_country = req.origin
        cargo_mt = req.cargo_quantity_mt
        commodity = req.commodity
        dest_port = self.provider.get_port_spec(dest_key)

        # Stage 1: Port & Vessel Physical Feasibility Gating
        feasibility_results = check_all_vessels_feasibility(dest_key, origin_country, cargo_mt)
        feasible_vessels = [f for f in feasibility_results if f.feasible]

        if not feasible_vessels:
            # Handle edge case: No vessel satisfies constraints
            reasons = [f"{f.vessel_name}: {f.rejection_reason}" for f in feasibility_results]
            return RecommendationResponseV2(
                recommendation={
                    "action": "NO_FEASIBLE_VESSEL",
                    "vessel": "NONE",
                    "origin": origin_country,
                    "destination": dest_key,
                    "contract": "NONE",
                    "timing": "NONE",
                    "confidence": "LOW",
                    "rejection_summary": reasons
                },
                economics={},
                forecast={},
                risk=evaluate_risk(origin_country, dest_key, False, 5.0, req.risk_tolerance),
                scenarios={},
                timing_options=[],
                contracts=[],
                backhaul=evaluate_backhaul_contribution(dest_key, "panamax", cargo_mt, self.provider),
                candidate_evaluations=[],
                vessel_feasibility=feasibility_results,
                explanation=["No candidate vessel class satisfies port draft, LOA, beam, or cargo constraints."],
                provenance_labels={"status": "INFEASIBLE_CONSTRAINTS"},
                audit_metadata={"timestamp": datetime.now().isoformat()}
            )

        # Stage 2: Evaluate All Feasible Candidates across Economics, Risk, Timing, and Contracts
        candidate_evaluations: List[CandidateStrategy] = []
        detailed_economics_by_vessel = {}
        forecast_data_by_vessel = {}
        risk_by_vessel = {}
        backhaul_by_vessel = {}
        contracts_by_vessel = {}
        timing_by_vessel = {}
        scenarios_by_vessel = {}

        for f_vessel in feasible_vessels:
            v_key = f_vessel.vessel_class
            requires_lightering = f_vessel.requires_lightering

            # Freight forecast for specific sub-index
            forecast_data = self.forecast_adapter.get_vessel_forecast(v_key, req.contract_horizon_days)
            forecast_data_by_vessel[v_key] = forecast_data

            current_tce = req.current_market_rate or forecast_data["current_rate_usd_per_day"]

            # Voyage economics
            econ = calculate_voyage_economics(
                vessel_class_key=v_key,
                origin_country=origin_country,
                destination_port_key=dest_key,
                cargo_quantity_mt=cargo_mt,
                tce_rate_usd_per_day=current_tce,
                requires_lightering=requires_lightering,
                data_provider=self.provider
            )
            detailed_economics_by_vessel[v_key] = econ

            # Risk assessment
            volatility_pct = 8.5
            if forecast_data.get("rate_day_15") and current_tce > 0:
                volatility_pct = abs(forecast_data["rate_day_15"] - current_tce) / current_tce * 100.0
            
            risk_eval = evaluate_risk(
                origin_country=origin_country,
                destination_port_key=dest_key,
                requires_lightering=requires_lightering,
                forecast_volatility_pct=volatility_pct,
                risk_tolerance=req.risk_tolerance
            )
            risk_by_vessel[v_key] = risk_eval

            # Contract options
            contracts = evaluate_contracts(econ, risk_eval, cargo_mt)
            contracts_by_vessel[v_key] = contracts

            # Scenarios (Base, Bull, Bear)
            scenarios = generate_scenarios(
                v_key, origin_country, dest_key, cargo_mt, forecast_data, risk_eval, requires_lightering
            )
            scenarios_by_vessel[v_key] = scenarios

            # Market Timing
            timing_opts = evaluate_timing_options(
                v_key, origin_country, dest_key, cargo_mt, forecast_data, risk_eval, requires_lightering
            )
            timing_by_vessel[v_key] = timing_opts

            # Backhaul Repositioning
            backhaul_eval = evaluate_backhaul_contribution(dest_key, v_key, cargo_mt, self.provider)
            backhaul_by_vessel[v_key] = backhaul_eval

            # Objective Calculation: Nominal Delivered Cost + Risk Penalty - Backhaul Benefit
            nominal_cost_mt = econ.delivered_cost_per_mt
            risk_penalty_mt = risk_eval.penalty_usd_per_mt
            backhaul_mt = backhaul_eval.cost_reduction_per_mt if backhaul_eval.opportunity_identified else 0.0

            # Default to COA if multi-voyage volume benefit exists
            best_contract_choice = ContractStrategy.COA if cargo_mt >= 50000 else ContractStrategy.SPOT
            contract_obj = next((c for c in contracts if c.strategy == best_contract_choice), contracts[0])

            # Default to best timing
            best_timing_choice = min(timing_opts, key=lambda t: t.risk_adjusted_cost_per_mt)

            net_effective_cost = contract_obj.risk_adjusted_cost_per_mt - backhaul_mt

            candidate_evaluations.append(CandidateStrategy(
                vessel_class=v_key,
                vessel_name=f_vessel.vessel_name,
                contract=contract_obj.strategy,
                timing=best_timing_choice.action,
                nominal_delivered_cost_per_mt=round(nominal_cost_mt, 2),
                risk_adjusted_cost_per_mt=round(contract_obj.risk_adjusted_cost_per_mt, 2),
                total_voyage_cost_usd=round(econ.total_voyage_cost_usd, 2),
                risk_score=round(risk_eval.composite_score, 1),
                backhaul_benefit_per_mt=round(backhaul_mt, 2),
                net_effective_cost_per_mt=round(net_effective_cost, 2),
                rank=1
            ))

        # Rank candidates by Net Effective Delivered Cost ($/MT) Ascending
        candidate_evaluations.sort(key=lambda c: c.net_effective_cost_per_mt)
        for idx, c in enumerate(candidate_evaluations):
            c.rank = idx + 1

        top_candidate = candidate_evaluations[0]
        second_candidate = candidate_evaluations[1] if len(candidate_evaluations) > 1 else None

        best_vessel_key = top_candidate.vessel_class
        best_econ = detailed_economics_by_vessel[best_vessel_key]
        best_forecast = forecast_data_by_vessel[best_vessel_key]
        best_risk = risk_by_vessel[best_vessel_key]
        best_backhaul = backhaul_by_vessel[best_vessel_key]
        best_contracts = contracts_by_vessel[best_vessel_key]
        best_timing = timing_by_vessel[best_vessel_key]
        best_scenarios = scenarios_by_vessel[best_vessel_key]
        feasibility_obj = next(f for f in feasibility_results if f.vessel_class == best_vessel_key)

        chosen_timing_obj = next((t for t in best_timing if t.action == top_candidate.timing), best_timing[0])
        chosen_contract_obj = next((c for c in best_contracts if c.strategy == top_candidate.contract), best_contracts[0])

        # Confidence assessment
        second_cost = second_candidate.net_effective_cost_per_mt if second_candidate else (top_candidate.net_effective_cost_per_mt * 1.08)
        confidence_tier, confidence_reason = evaluate_recommendation_confidence(
            best_cost_per_mt=top_candidate.net_effective_cost_per_mt,
            second_best_cost_per_mt=second_cost,
            risk_score=best_risk.composite_score,
            forecast_uncertainty_pct=abs(best_forecast["ci_upper_80_day_15"] - best_forecast["ci_lower_80_day_15"]) / best_forecast["current_rate_usd_per_day"] * 100.0
        )

        # Plain language explanations
        explanation_points = generate_recommendation_explanation(
            recommended_vessel_name=top_candidate.vessel_name,
            destination_port_name=dest_port["name"],
            cargo_quantity_mt=cargo_mt,
            commodity=commodity,
            feasibility_results=feasibility_results,
            best_economics=best_econ,
            risk=best_risk,
            best_timing=chosen_timing_obj,
            best_contract=chosen_contract_obj,
            backhaul=best_backhaul,
            is_direct_berth=feasibility_obj.is_direct_berth,
            requires_lightering=feasibility_obj.requires_lightering
        )

        # Baseline comparison (Spot with Handysize/Panamax)
        baseline_cost_total = best_econ.total_voyage_cost_usd
        savings_vs_baseline_usd = max(0.0, chosen_contract_obj.savings_vs_spot_usd + (best_backhaul.net_monetization_usd * 0.35 if best_backhaul.opportunity_identified else 0.0))
        savings_pct = round((savings_vs_baseline_usd / baseline_cost_total) * 100.0, 2) if baseline_cost_total > 0 else 0.0

        recommendation_block = {
            "action": chosen_timing_obj.action.value,
            "vessel_class": best_vessel_key,
            "vessel_name": top_candidate.vessel_name,
            "origin": origin_country,
            "destination": dest_key,
            "destination_port_name": dest_port["name"],
            "contract": chosen_contract_obj.strategy.value,
            "timing": chosen_timing_obj.action.value,
            "confidence": confidence_tier.value,
            "confidence_reason": confidence_reason,
            "net_effective_cost_per_mt": top_candidate.net_effective_cost_per_mt,
            "expected_savings_usd": round(savings_vs_baseline_usd, 2),
            "savings_percentage": savings_pct,
        }

        economics_block = {
            "expected_delivered_cost_usd": round(chosen_contract_obj.total_cost_usd, 2),
            "cost_per_mt_usd": round(chosen_contract_obj.delivered_cost_per_mt, 2),
            "risk_adjusted_cost_per_mt": round(chosen_contract_obj.risk_adjusted_cost_per_mt, 2),
            "net_effective_cost_per_mt": top_candidate.net_effective_cost_per_mt,
            "total_voyage_days": best_econ.total_voyage_days,
            "distance_nm": best_econ.distance_nm,
            "fuel_burn_total_mt": best_econ.fuel_burn_total_mt,
            "bunker_cost_usd": best_econ.bunker_cost_usd,
            "charter_hire_cost_usd": best_econ.charter_hire_cost_usd,
            "port_charges_usd": best_econ.port_charges_usd,
            "lightering_cost_usd": best_econ.lightering_cost_usd,
            "num_voyages": best_econ.num_voyages,
        }

        forecast_block = {
            "vessel_class": best_vessel_key,
            "sub_index": best_forecast["sub_index"],
            "current_rate_usd_per_day": best_forecast["current_rate_usd_per_day"],
            "day_7_rate": best_forecast["rate_day_7"],
            "day_15_rate": best_forecast["rate_day_15"],
            "day_30_rate": best_forecast["rate_day_30"],
            "ci_lower_80": best_forecast["ci_lower_80_day_15"],
            "ci_upper_80": best_forecast["ci_upper_80_day_15"],
            "model_architecture": "Ensemble (55% XGBoost + 45% statsmodels SARIMAX)",
            "label": best_forecast["label"],
            "provenance": best_forecast["provenance"],
        }

        provenance_labels = {
            "bdi_series": "REAL_HISTORICAL (Baltic Exchange 1985-2026 daily records)",
            "vessel_subindex_link": "MODEL_DERIVED (Academic weight factors post-2018 BDI methodology)",
            "forecast_prediction": "MODEL_OUTPUT (Walk-forward SARIMAX + XGBoost)",
            "bunker_fuel_price": "REAL_VERIFIED ($829.50/t VLSFO Ship & Bunker Global 20-Port Average Sep 3, 2026)",
            "port_specifications": "STATIC_ASSUMPTION (Indian Major Port Trust official pilotage guidelines)",
            "backhaul_cargo": "SIMULATED_PAIRING (Illustrative mineral & byproduct export flows)",
            "synthetic_counterfactuals": "SYNTHETIC_CALIBRATED (Calibrated against real historical Baltic dates)",
        }

        audit_metadata = {
            "recommendation_id": f"REC-NAVIBULK-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": datetime.now().isoformat(),
            "commodity": commodity,
            "cargo_quantity_mt": cargo_mt,
            "risk_tolerance": req.risk_tolerance.value,
            "engine_version": "SAIL NaviBulk V2 Decision Intelligence Engine",
        }

        return RecommendationResponseV2(
            recommendation=recommendation_block,
            economics=economics_block,
            forecast=forecast_block,
            risk=best_risk,
            scenarios=best_scenarios,
            timing_options=best_timing,
            contracts=best_contracts,
            backhaul=best_backhaul,
            candidate_evaluations=candidate_evaluations,
            vessel_feasibility=feasibility_results,
            explanation=explanation_points,
            provenance_labels=provenance_labels,
            audit_metadata=audit_metadata
        )
