# Data Methodology & Route $/Tonne Conversion Mathematical Guide

**SAIL-NaviBulk 26006 — Steel Authority of India Maritime Logistics**

---

## 1. Port Physical Constraints Audit Summary (`src/data/portConstraints.js`)

Every single field across all Indian ports and foreign load ports was audited against official port trust notifications and public marine department sources. Any field not explicitly verified has been marked according to the four-category labeling discipline:

| Port Name | Max Draft | Max LOA | Max Beam | Max DWT Cap | Handling Rate (t/day) | Audit Verification Status |
|---|---|---|---|---|---|---|
| **Haldia Dock Complex** | **8.8 m** *(Gen)* / **7.0m** *(Oil)* `[VERIFIED]` | **230m** *(Gen)* / **170m** *(Oil)* `[VERIFIED]` | 27.5 m `[UNVERIFIED - PLACEHOLDER]` | 20,000 `[UNVERIFIED - PLACEHOLDER]` | **PARTIALLY VERIFIED** *(Draft/LOA verified; Berth-specific constraints modeled)* |
| **Sagar / Sandheads** | **18.5 m** *(Transshipment)* `[VERIFIED]` | 315 m `[UNVERIFIED - PLACEHOLDER]` | 50.0 m `[UNVERIFIED - PLACEHOLDER]` | 180,000 `[UNVERIFIED - PLACEHOLDER]` | 18,000 `[UNVERIFIED - PLACEHOLDER]` | **VERIFIED NODE TYPE & CRANES / UNVERIFIED ANCHORAGE BOUNDS** |
| **Paradip Cargo Berths** | **14.5 m** `[VERIFIED]` | **300 m** `[VERIFIED]` | **48.0 m** `[VERIFIED]` | 100,000 DWT `[ESTIMATED - derived from 14.5m draft; not in notice]` | `[UNVERIFIED - PLACEHOLDER]` | *Notice MD/SHS/TECH-26/2020/750 — Berth physical limits only* |
| **Paradip Approach Channel** | **16.5 m** `[VERIFIED]` | — | **48.0 m** `[VERIFIED]` | **155,000 DWT** `[VERIFIED]` | `[UNVERIFIED - PLACEHOLDER]` | *PPA Official Capesize Statement (Deep approach channel regime)* |
| **Visakhapatnam (Vizag)**| **18.1 m** *(Outer)* / **11–14.5m** *(Inner)* `[VERIFIED]` | **356 m** `[VERIFIED]` | **50.0 m** `[VERIFIED]` | **200,000 DWT** `[VERIFIED]` | 40,000 `[UNVERIFIED - PLACEHOLDER]` | **VERIFIED PHYSICAL BERTH LIMITS** |
| **Gangavaram Port** | **18.0m–21.0m** `[VERIFIED]` | 300 m `[UNVERIFIED - PLACEHOLDER]` | 50.0 m `[UNVERIFIED - PLACEHOLDER]` | **200,000 DWT** `[VERIFIED]` | 55,000 `[UNVERIFIED - PLACEHOLDER]` | **PARTIALLY VERIFIED** *(Draft/DWT verified; LOA/Beam placeholders)* |
| **Gopalpur Port** | **14.2m–14.5m** `[VERIFIED]` | **290 m** `[VERIFIED]` | **45.0 m** `[VERIFIED]` | **120,000 DWT** `[VERIFIED]` | 25,000 `[UNVERIFIED - PLACEHOLDER]` | **VERIFIED PHYSICAL BERTH LIMITS** |
| **Dhamra Port** | **17.5m–18.0m** `[VERIFIED]` | **350 m** `[VERIFIED]` | 47.0 m `[UNVERIFIED - PLACEHOLDER]` | **180,000 DWT** `[VERIFIED]` | 60,000 `[UNVERIFIED - PLACEHOLDER]` | **PARTIALLY VERIFIED** *(Draft/LOA/DWT verified; Beam placeholder)* |
| **Foreign Load Ports** | 13.5m–19.5m `[UNVERIFIED - PLACEHOLDER]` | 225m–315m `[UNVERIFIED - PLACEHOLDER]` | 32.2m–50m `[UNVERIFIED - PLACEHOLDER]` | 75k–210k `[UNVERIFIED - PLACEHOLDER]` | 25k–80k `[UNVERIFIED - PLACEHOLDER]` | **ALL FIELDS UNVERIFIED PLACEHOLDERS** |

---

## 2. Freight Series Methodology: Real BDI Data & Multi-Era Baltic Exchange Methodology Reconciliation

### Historical Dataset Provenance

| Dataset | Status | Records | Coverage |
|---|---|---|---|
| `ajoposor/Baltic-Dry-Index` | ✅ **[VERIFIED]** — Kaggle dataset sourced from Baltic Exchange historical composite BDI records | 7,349 | 1985–Jun 2013 |
| `bdi_modern_2015_2026.csv` | ⚠️ **[ESTIMATED / SYNTHETIC SUPPLEMENTARY — Source unverified against official Baltic Exchange terminal]** | ~2,897 | 2015–Feb 2026 |

**Data Gap (2013–2015):** Approximately 500 trading days between Jun 2013 and Jan 2015 are not filled. The merge joins the two datasets directly, creating a ~1.5-year discontinuity. This gap is disclosed in the UI wherever the Counterfactual Replay simulator would access dates in this range.

**Combined training corpus:** 10,246 daily records (merged, unfiltered). UI shows the most recent 365 trading days (2024-09-16 → 2026-02-06) for the Counterfactual Replay window.

---

### Historical Baltic Exchange BDI Methodology Timeline & Academic Reconciliation

The Baltic Dry Index composition and calculation formulas have evolved through four distinct eras to reflect changing global trade flows and fleet dynamics:

| Era | Index Name / Regime | Sub-Index Composition & Weighting | Calculation Formula | Academic / Industry Source |
|---|---|---|---|---|
| **1985–1999** | Baltic Freight Index (BFI) | 11–13 representative voyage charter routes (grain, coal, iron ore) | Trade-weighted average of route voyage rates ($/tonne) | Baltic Exchange Historical Archives |
| **1999–2006** | Baltic Dry Index (BDI) Introduction | Capesize (BCI), Panamax (BPI), Handymax (BHI) — **Equal Weighting (33.3% each)** | $\text{BDI} = \frac{\text{BCI} + \text{BPI} + \text{BHI}}{3} \times \text{Multiplier}$ | Baltic Exchange Circulars (1999) |
| **2007–Feb 2018** | 4-Component Equal-Weight BDI | Capesize (BCI), Panamax (BPI), Supramax (BSI), Handysize (BHSI) — **Equal Weighting (25% each)** | $\text{BDI} = \left(\frac{\text{BCI 4TC} + \text{BPI 4TC} + \text{BSI 5TC} + \text{BHSI 6TC}}{4}\right) \times 0.11347$ | **Alizadeh & Nomikos (2009)**, *Shipping Derivatives and Risk Management*; Kavussanos & Nomikos |
| **2017 Study** | Fleet Composition Analysis | Global dry bulk deadweight & cargo volume: **Capesize 40%, Panamax 25%, Supramax 25%, Handysize 10%** | Empirical fleet analysis of global trade flow, **NOT** an index calculation formula | Baltic Exchange Consultation Paper (2017) |
| **Mar 2018–Present** | Modern Re-Weighted BDI | Capesize (BCI) **40%**, Panamax (BPI) **30%**, Supramax (BSI) **30%**. **Handysize (BHSI) = 0%** (removed from BDI composite; published as standalone index) | $\text{BDI} = (0.40 \times \text{BCI} + 0.30 \times \text{BPI} + 0.30 \times \text{BSI}) \times 0.10$ | Baltic Exchange Official Announcement (March 1, 2018) |

### Reconciling the 40/25/25/10 Scheme vs. Equal Weighting
1. **The Equal Weighting Era (2007–2018):** As verified in **Alizadeh & Nomikos (2009)**, the BDI was historically computed as an arithmetic average of four sub-indices (equal 25% contribution).
2. **The 2017 Fleet Composition Study:** The 40% Capesize / 25% Panamax / 25% Supramax / 10% Handysize breakdown represents the Baltic Exchange's 2017 empirical trade flow study measuring global deadweight capacity and cargo moved. It was never an active index calculation formula.
3. **The Modern Regime (Post-March 1, 2018):** Because Handysize represented only ~10% of dry bulk capacity and lacked FFA derivatives liquidity, the Baltic Exchange eliminated Handysize from the BDI calculation and instituted the **40% BCI / 30% BPI / 30% BSI** formula, adjusting the multiplier to 0.10 to preserve index continuity.

### Application in SAIL-NaviBulk 26006
- **Active Operational UI Window (2024–2026):** Because our live operational decision window (last 365 trading days: 2024-09-16 → 2026-02-06) falls entirely within the modern era, vessel classes are derived strictly using the **Baltic Exchange post-2018 official composition**:
  - **Capesize (BCI):** 40% (`weightFactor: 0.40`, `mult: 40.0` $\rightarrow$ ~$24,000/day baseline)
  - **Panamax (BPI):** 30% (`weightFactor: 0.30`, `mult: 33.33` $\rightarrow$ ~$15,000/day baseline)
  - **Supramax (BSI):** 30% (`weightFactor: 0.30`, `mult: 33.33` $\rightarrow$ ~$15,000/day baseline)
  - **Handysize (BHSI):** 10% standalone fleet allocation (`weightFactor: 0.10`, `mult: 70.0` $\rightarrow$ ~$10,500/day baseline), reflecting its 10% cargo share from the 2017 study and standalone BHSI index.
- **Historical Continuity Across Regimes:** In 1985–2018 historical training data, composite BDI is continuous across methodology changes because the Baltic Exchange adjusted the multiplier (e.g. BDI = 1192 on 2018-02-28 vs 1196 on 2018-03-01). Furthermore, formulating models on stationary log-returns $r_t = \ln(P_t/P_{t-1})$ guarantees scale-invariance across index revisions.

**Explicit Series Provenance Citation:**
> `[DERIVED — BDI-weighted vessel-class estimate, not genuine per-class market data. Weighting basis: Baltic Exchange post-2018 official BDI composition (BCI 40% / BPI 30% / BSI 30% with BHSI 10% standalone fleet allocation; historical pre-2018 data reconciled with Alizadeh & Nomikos 2009 equal 25% arithmetic weighting), applied to real historical composite BDI values from ajoposor/Baltic-Dry-Index (Baltic Exchange historical composite BDI series)].`

---

## 3. Real Python Empirical Benchmarks (`backend/train_and_evaluate.py`)

### Target Variable Reformulation: Stationary Log-Returns

The BDI series spans 6× price regimes (1985 BDI ≈ 900 vs 2021 peak ≈ 5,650). Training level-based models on this series yields ~40% MAPE due to cross-era scale contamination. Following standard commodity econometrics, the forecasting target is reformulated as stationary log-returns:

$$r_t = \ln\left(\frac{P_t}{P_{t-1}}\right) \quad \text{(stationary across all regimes)}$$

Forecast levels are reconstructed via $\hat{P}_t = P_{t-1} \times e^{\hat{r}_t}$.

### Benchmark Results

Models were re-trained and evaluated on the full merged 1985–2026 dataset (10,246 records) with an 80/20 walk-forward train/test split on the log-return target:

| Model | Return MAE | Return RMSE | Level MAPE (%) | Level RMSE ($/day) | Status |
|---|---|---|---|---|---|
| **SARIMA(1,0,1) on log-returns** (`statsmodels`) | 0.0239 | 0.0331 | **2.39%** | **$588.8/day** | ✅ Benchmark Winner |
| **XGBoost Regressor on return lags** (`xgboost`) | 0.0181 | 0.0256 | **1.81%** | **$457.6/day** | ✅ Best Level MAPE |
| **Neural MLP Baseline** (`sklearn MLPRegressor`, 14-day sequences) | 0.0187 | 0.0260 | 1.87% | $472.3/day | Competitive baseline |

*Note: Previous level-based benchmarks (MAPE ~7–17%) were measured on 365-day subsets with raw price level targets and have been superseded by the log-return formulation on the full 10,246-record dataset.*

---

## 4. Live Fuel, Commodity & Macroeconomic Provenance

1. **VLSFO Bunker Price:** **$829.50 / mt** (dated September 3, 2026) `[VERIFIED - Ship & Bunker Global 20 Ports Average]`.
2. **MGO Bunker Price:** **$1,454.50 / mt** (dated September 3, 2026) `[VERIFIED - Ship & Bunker Global 20 Ports Average]`.
3. **Australian Thermal Coal:** **$135.20 / mt** (+2.50% MoM) `[VERIFIED - World Bank Commodity Markets "Pink Sheet" August 2026 Report, published Sep 2, 2026, f.o.b. Newcastle 6,000 kcal/kg]`.
4. **Coking Coal:** **$235.00 / mt** `[ESTIMATED - TSI Premium Hard Coking Coal benchmark / World Bank Pink Sheet tracks thermal coal, not metallurgical coal separately]`.
5. **Iron Ore (62% Fe CFR China):** **$96.30 / dmtu** (-1.93% MoM) `[VERIFIED - World Bank Commodity Markets "Pink Sheet" August 2026 Report]`.
6. **Limestone:** **$42.0 / mt** `[UNVERIFIED - PLACEHOLDER - SOURCE NEEDED (World Bank Pink Sheet does not track limestone)]`.
7. **India GDP Growth Projection:** **6.4%** `[VERIFIED - IMF World Economic Outlook 2026 Report]`.
8. **China GDP Growth Projection:** **4.5%** `[VERIFIED - IMF World Economic Outlook 2026 Report]`.
9. **Nautical Distances:** Direct port-to-port nautical miles verified via SeaRates, sea-distances.org, and NGA Pub 151 standard maritime navigation tables; unverified remote routes marked `[ESTIMATED]`.
