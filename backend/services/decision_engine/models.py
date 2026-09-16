"""
SAIL NaviBulk - V2 Decision Intelligence Service
Domain models and request/response schemas for SIH 26006.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class RiskTolerance(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ContractStrategy(str, Enum):
    SPOT = "SPOT"
    COA = "COA"
    TIME_CHARTER = "TIME_CHARTER"


class TimingAction(str, Enum):
    FIX_NOW = "FIX_NOW"
    WAIT_7D = "WAIT_7D"
    WAIT_15D = "WAIT_15D"
    COA_HEDGE = "COA_HEDGE"


class RecommendationConfidence(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class RecommendationRequestV2(BaseModel):
    commodity: str = Field(default="Coking Coal", description="Bulk cargo commodity type")
    cargo_quantity_mt: float = Field(default=70000.0, description="Required parcel size in Metric Tonnes (MT)")
    origin: str = Field(default="Australia", description="Load port country/region: Australia, US, Mozambique, Russia, Indonesia")
    destination: str = Field(default="paradip", description="Discharge port key: paradip, vizag, gangavaram, gopalpur, dhamra, sagar, haldia")
    required_delivery_date: Optional[str] = Field(default=None, description="ISO target delivery date")
    laycan_start: Optional[str] = Field(default=None, description="Laycan window start")
    laycan_end: Optional[str] = Field(default=None, description="Laycan window end")
    contract_horizon_days: int = Field(default=30, description="Decision horizon in days (e.g., 30)")
    risk_tolerance: RiskTolerance = Field(default=RiskTolerance.MEDIUM, description="User risk preference profile")
    current_market_rate: Optional[float] = Field(default=None, description="Optional manual override of current TCE rate")
    max_acceptable_cost_per_mt: Optional[float] = Field(default=None, description="Budget cap per MT delivered")


class FeasibilityCheckResult(BaseModel):
    vessel_class: str
    vessel_name: str
    feasible: bool
    is_direct_berth: bool
    requires_lightering: bool
    lightering_port: Optional[str] = None
    rejection_reason: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)


class CandidateVoyageEconomics(BaseModel):
    vessel_class: str
    vessel_name: str
    sub_index: str
    distance_nm: float
    num_voyages: int
    parcel_per_voyage_mt: float
    sea_days_laden: float
    sea_days_ballast: float
    port_days: float
    lightering_days: float
    total_voyage_days: float
    tce_rate_usd_per_day: float
    charter_hire_cost_usd: float
    fuel_burn_total_mt: float
    bunker_cost_usd: float
    port_charges_usd: float
    canal_tolls_usd: float
    lightering_cost_usd: float
    total_voyage_cost_usd: float
    delivered_cost_per_mt: float


class RiskComponentDetail(BaseModel):
    dimension: str
    score: float  # 0 to 100
    level: str    # Low, Moderate, High, Critical
    category: str # OBSERVED_DATA, STATIC_ASSUMPTION, MODEL_DERIVED, SIMULATED_RISK
    description: str
    mitigation: str


class RiskAssessment(BaseModel):
    composite_score: float # 0 to 100
    tier: str             # LOW, MEDIUM, HIGH, CRITICAL
    penalty_usd_per_mt: float
    components: Dict[str, RiskComponentDetail]
    flags: List[str]


class ContractEvaluation(BaseModel):
    strategy: ContractStrategy
    description: str
    delivered_cost_per_mt: float
    total_cost_usd: float
    risk_adjusted_cost_per_mt: float
    savings_vs_spot_usd: float
    assumptions: str
    commitment_mt: float


class ScenarioDetail(BaseModel):
    scenario: str # "base", "bull", "bear"
    sub_index_rate: float
    delivered_cost_per_mt: float
    total_cost_usd: float
    risk_adjusted_cost_per_mt: float
    ci_level: str
    probability_note: str


class TimingOption(BaseModel):
    action: TimingAction
    days_to_wait: int
    projected_tce_rate: float
    delivered_cost_per_mt: float
    risk_adjusted_cost_per_mt: float
    expected_savings_usd: float
    feasibility_status: str
    rationale: str


class BackhaulContribution(BaseModel):
    opportunity_identified: bool
    route: Optional[str] = None
    cargo: Optional[str] = None
    distance_nm: float = 0.0
    gross_revenue_usd: float = 0.0
    additional_bunker_usd: float = 0.0
    net_monetization_usd: float = 0.0
    cost_reduction_per_mt: float = 0.0
    rationale: str = "No backhaul leg selected"


class CandidateStrategy(BaseModel):
    vessel_class: str
    vessel_name: str
    contract: ContractStrategy
    timing: TimingAction
    nominal_delivered_cost_per_mt: float
    risk_adjusted_cost_per_mt: float
    total_voyage_cost_usd: float
    risk_score: float
    backhaul_benefit_per_mt: float
    net_effective_cost_per_mt: float
    rank: int


class RecommendationResponseV2(BaseModel):
    recommendation: Dict[str, Any]
    economics: Dict[str, Any]
    forecast: Dict[str, Any]
    risk: RiskAssessment
    scenarios: Dict[str, ScenarioDetail]
    timing_options: List[TimingOption]
    contracts: List[ContractEvaluation]
    backhaul: BackhaulContribution
    candidate_evaluations: List[CandidateStrategy]
    vessel_feasibility: List[FeasibilityCheckResult]
    explanation: List[str]
    provenance_labels: Dict[str, str]
    audit_metadata: Dict[str, Any]
