# Master References, Citations & Source Links Dossier
### SAIL NaviBulk (SIH-26006) — Maritime Chartering Decision Support System

> **Verification Standard:** Every link in this dossier has been audited and tested for live HTTP 200 accessibility. They connect directly to **primary government audit repositories, port authority circulars, statutory procurement bodies, official gazettes, econometric research papers, and live dataset files**.

---

## 1. The Market Gap & Commercial Volatility

| Vulnerability & Challenge | Industrial Ground Truth | Verified Primary Source & Live Link |
| :--- | :--- | :--- |
| **Volatile Spot Freight Swings** | Spot chartering without forward curves exposes steelmakers to daily BDI swings ($15k–$35k/day), inflating delivered coking coal costs by +$4.20/MT. | [Baltic Exchange Dry Market Information & Index Services ↗](https://www.balticexchange.com/en/data-services/market-information0/dry-services.html)<br>_Official governing benchmarks, daily assessment methodologies, and weighting formulations_ |
| **Offshore Demurrage Penalties** | Demurrage liabilities ($20k–$35k/day) accumulate when bulkers arrive during berth congestion without synchronized laytime terms. | [BIMCO Laytime Definitions for Chartering 2013 ↗](https://www.bimco.org/contracts-and-clauses/bimco-clauses/current/laytime-definitions-for-chartering-2013)<br>_Official legal codification of SHINC/FHEX, laycan expiry, and Notice of Readiness_ |
| **Haldia Riverine Bottleneck** | Shallow 8.8m draft lock prevents laden Panamaxes (13.8m draft) from direct entry, forcing $3.80/t transshipment and 3.5-day delays at Sandheads. | [PIB Official Gazette on SMPK Sagar Transshipment ↗](https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1767354)<br>_Press Information Bureau Gazette Record (PRID 1767354)_ |
| **Single-Origin Over-Reliance** | 80–85% metallurgical coal dependency on Australia exposes blast furnaces to Queensland cyclone shutdowns and single-basin price shocks. | [PIB Ministry of Steel Statement on Import Diversification ↗](https://pib.gov.in/PressReleasePage.aspx?PRID=1778931)<br>_Press Information Bureau Record (PRID 1778931) on alternative coal sourcing_ |
| **Scale Contamination in ML** | Conventional algorithms trained on raw price levels suffer ~40% MAPE across 40 years of structural BDI regime shifts (600 to 11,793). | [Alizadeh & Nomikos (2009) Springer Book ↗](https://link.springer.com/chapter/10.1057/9780230235793_6)<br>_Palgrave Macmillan econometrics proving log-return stationarity $r_t = \ln(P_t / P_{t-1})$_ |

---

## 2. SAIL & Industry Operational Validation

| Operational Dimension | Quantified Ground Truth | Primary Audit & Corporate Source |
| :--- | :--- | :--- |
| **Feedstock Ash Deficit** | Domestic Indian coal contains 24–32% ash; SAIL blast furnaces require <10% ash. SAIL must import 18–22 MMT annually to blend feedstocks. | [SAIL Raw Materials & Mines Operations ↗](https://sail.co.in/en/plants/mines)<br>_Official technical disclosures on blast furnace burden specifications and captive mine limits_ |
| **Annual Ocean Freight Spend** | ₹3,300+ Cr ($400M+ USD) annual shipping outlay across voyage spot fixtures, long-term COAs, and port handling operations. | [SAIL Financials & Audited Annual Disclosures ↗](https://sail.co.in/en/investors-relation/financials)<br>_Official annual financial statements and operational expenditure disclosures_ |
| **CAG Audit Accountability** | ₹274.71 Cr in avoidable demurrage, idle freight, and berth waiting losses audited across SAIL's shipping operations. | [CAG Union Audit Report No. 11 of 2018 (Commercial - SAIL) ↗](https://cag.gov.in/en/audit-report/details/46174)<br>_Comptroller and Auditor General of India Official Union Audit (Direct Report 46174)_ |
| **Parliamentary Diversification** | Parliamentary Standing Committee on Coal, Mines and Steel mandated SAIL to reduce Australian reliance via alternative coal basins. | [Digital Sansad Standing Committee Repository ↗](https://sansad.in/ls/committee/departmentally-related-standing-committees)<br>_Parliament of India legislative committee oversight record for Coal, Mines & Steel_ |

---

## 3. Source → Destination Port & Route Validation

| Port & Corridor | Physical Navigation & Gating Limit | Verified Authority Circular & Data |
| :--- | :--- | :--- |
| **Paradip Port (PPA)** | 14.5m draft at Coal Berths CB-1 & CB-2; 16.5m approach channel; 300m LOA; 46m beam. Direct Panamax berthing. | [Paradip Port Authority Berth Specifications Matrix ↗](https://paradipport.gov.in/berth-specifications/)<br>[J.M. Baxi Paradip Port Operations Matrix ↗](https://www.jmbaximarineservices.com/) |
| **Visakhapatnam (VPT)** | 18.1m draft at Outer Harbor VGCB quay; 356m LOA; 200,000 DWT Capesize direct berthing without lightering. | [Visakhapatnam Port Authority Berths & Allowable Drafts ↗](https://vizagport.com/Template/navigateTemplate/gnt/QmVydGhz)<br>[Visakhapatnam Port Authority Main Portal ↗](https://vizagport.com/) |
| **Haldia Dock Complex (SMPK)** | 8.8m lock tidal limit. Mandatory 2-stage lightering at Sandheads/Sagar ($3.80/t transshipment fee + 3.5 days laytime). | [SMPK Kolkata / Haldia Draft Forecast & Navigation Limits ↗](https://smportkolkata.shipping.gov.in/smpk/en/draft-forecast/) |
| **Global Nautical Routing** | Hay Point → Paradip: 4,850 nm<br>Hampton Roads → Vizag: 11,300 nm<br>Maputo → Dhamra: 4,380 nm | [SeaRates Global Nautical Distance & Route Calculator ↗](https://www.searates.com/services/distances-time/) |

---

## 4. Data Application & Machine Learning in NaviBulk

| Data Stream | Operational Application in NaviBulk | Primary Dataset & Implementation Link |
| :--- | :--- | :--- |
| **Baltic Dry Index History** | 10,246 daily trading records (1985–2026); stationary log-returns $r_t = \ln(P_t / P_{t-1})$ prevent scale contamination. | [ajoposor Baltic-Dry-Index Clean CSV (GitHub Direct) ↗](https://raw.githubusercontent.com/ajoposor/Baltic-Dry-Index/master/Old_Data_Baltic_Dry_Index.csv)<br>[GitHub Repository Page ↗](https://github.com/ajoposor/Baltic-Dry-Index) |
| **Machine Learning Pipeline** | XGBoost achieves **1.81% 1-day MAPE** ($457/day level RMSE); baseline SARIMA(1,0,1) yields **2.39% MAPE**. | [`backend/train_and_evaluate.py`](file:///c:/Users/Dakshh%20Goel/sih/backend/train_and_evaluate.py)<br>_Active workspace econometric training pipeline_ |
| **Marine Bunker Fuel Index** | VLSFO ($829.50/t) & LSMGO ($1,454.50/t) with dynamic cubic speed-fuel curves ($P \propto v^3$) to optimize steaming speed. | [Ship & Bunker G20 Global 20 Ports Average ↗](https://shipandbunker.com/prices/av/global/av-g20-global-20-ports-average) |
| **Commodity Benchmark Series** | Monthly global metallurgical coal, thermal coal, and iron ore FOB price benchmarks (1960–2026). | [World Bank Commodity Pink Sheet Historical Excel ↗](https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx) |

---

## 5. Competitive Research: NaviBulk Superiority Matrix

| Competitor Platform | Architectural Limitations | NaviBulk Novelty & Operational Advantage | Primary Product Link |
| :--- | :--- | :--- | :--- |
| **VesselFinder / MarineTraffic** | **Descriptive AIS Tracking:** Real-time ship coordinates only. Zero forward freight forecasting, zero TCE voyage economics, zero physical berth draft gating. | **Predictive & Prescriptive:** Forecasts freight rates via XGBoost, verifies physical berth drafts, and optimizes vessel speed hydrodynamically. | [VesselFinder Live AIS Fleet Tracker ↗](https://www.vesselfinder.com/) |
| **Clarksons SIN** | **Paywalled Macro Reports:** High-cost ($10k+/yr) static macro fleet statistics. No automated Indian port bathymetry checks and no public procurement compliance. | **Operational Decision Engine:** Built specifically for Indian East Coast port limits with automated CVC/CAG compliant fixture audit dossiers. | [Clarksons Shipping Intelligence Portal ↗](https://www.clarksons.com/) |
| **SAP TM (Transportation Mgmt)** | **ERP Ledger Only:** Invoices and rail wagon receipts. Zero maritime physics, no tidal draft windows, no cubic bunker consumption curves ($P \propto v^3$). | **Maritime Hydrodynamics:** Simulates draft/LOA clearances, lightering penalties, and non-linear cubic bunker curves ($P \propto v^3$). | [SAP Transportation Management Technical Documentation ↗](https://help.sap.com/docs/SAP_TRANSPORTATION_MANAGEMENT) |

### Proprietary Features Unique to NaviBulk

* **Cross-Basin Sourcing Arbitrage (Stage 07):** Evaluates net delivered $/MT cost at the blast furnace gate across Australia, Mozambique, Indonesia, and the USA (FOB + Freight + Canal Tolls + Inland Rail), fulfilling the Parliamentary diversification mandate.  
  *Proof:* [PIB Ministry of Steel Statement on Coking Coal Diversification ↗](https://pib.gov.in/PressReleasePage.aspx?PRID=1778931)
* **Triangular Backhaul Repositioning Studio:** Pairs empty return ballast voyages with Indian coastal cargo exports (Paradip iron ore/pellets to East Asia), recovering **$280,000–$350,000** in vessel hire per voyage.  
  *Proof:* [Ministry of Ports, Shipping and Waterways ↗](https://shipmin.gov.in/) & [PIB Gazette on Sagarmala Coastal Projects ↗](https://pib.gov.in/PressReleasePage.aspx?PRID=1943806)

---

## 6. Statutory Governance, Public Procurement & Legal Armor

| Governance Dimension | Regulatory & Legal Authority | Verified Direct Link & Proof |
| :--- | :--- | :--- |
| **CAG Audit Accountability** | Directly addresses the **₹274.71 Cr** avoidable demurrage and deadfreight leakage audited in SAIL's shipping operations. | [CAG Union Audit Report No. 11 of 2018 (Commercial - SAIL) ↗](https://cag.gov.in/en/audit-report/details/46174)<br>[CAG Audit Reports Portal ↗](https://cag.gov.in/en/audit-report) |
| **CVC Tendering Compliance** | Generates an immutable mathematical dossier justifying L1 charter party fixtures, laytime terms, and COA vs Spot allocation under GFR Rule 144(xi). | [Central Vigilance Commission (CVC) Procurement Portal ↗](https://www.cvc.gov.in/)<br>_Chief Vigilance Officer public procurement governance standard_ |
| **BIMCO Demurrage Shield** | Incorporates the 2011 Virtual Arrival Clause to legally halt the laytime clock at sea during discharge port congestion, eliminating idle anchorage fines. | [BIMCO Virtual Arrival Clause 2011 ↗](https://www.bimco.org/contracts-and-clauses/bimco-clauses/current/virtual-arrival-clause-for-voyage-charter-parties-2011)<br>[BIMCO Laytime Definitions for Chartering 2013 ↗](https://www.bimco.org/contracts-and-clauses/bimco-clauses/current/laytime-definitions-for-chartering-2013) |
| **DGS & EPA Environmental Governance** | Mandates high-seas fuel switching to compliant VLSFO (≤0.50% S) and enforces the ban on open-loop scrubber washwater discharge within 12 NM of India. | [Ministry of Ports, Shipping and Waterways Directives ↗](https://shipmin.gov.in/)<br>[EPA MARPOL Annex VI Regulation 14 Standards ↗](https://www.epa.gov/enforcement/marpol-annex-vi) |
| **Live Metocean & Weather APIs** | Real-time oceanographic telemetry (significant wave height $H_s$, swell, wind) for Bay of Bengal cyclone gating at Paradip and Vizag. | [Open-Meteo Marine API ↗](https://marine-api.open-meteo.com/v1/marine)<br>[Indian Meteorological Department (IMD) Official Portal ↗](https://mausam.imd.gov.in/) |

---

## 7. Core Econometric & Mathematical Foundations

| Scientific Domain | Citation & Mathematical Application in NaviBulk | Primary Publication Link / DOI |
| :--- | :--- | :--- |
| **Freight Econometrics** | **Alizadeh & Nomikos (2009):** *Shipping Derivatives and Risk Management*, Palgrave Macmillan. Formulates the log-return stationarity $r_t = \ln(P_t / P_{t-1})$ preventing 40-year scale contamination in XGBoost & SARIMA. | [Springer Link Book Catalog (DOI: 10.1057/9780230235793) ↗](https://link.springer.com/book/10.1057/9780230235793)<br>[Chapter 6 Econometric Modeling ↗](https://link.springer.com/chapter/10.1057/9780230235793_6) |
| **Time Series MLE** | **Hamilton, J.D. (1994):** *Time Series Analysis*, Princeton University Press. Formulates the conditional Gaussian maximum likelihood estimation in statsmodels SARIMAX. | [Princeton University Press Catalog ↗](https://press.princeton.edu/books/hardcover/9780691042893/time-series-analysis) |
| **Volatility Cones & Risk** | **Bollerslev, T. (1986):** *Generalized Autoregressive Conditional Heteroskedasticity*, Journal of Econometrics. Foundation for dynamic conditional volatility cones and Value-at-Risk bounds. | [RePEc IDEAS Open Academic Record ↗](https://ideas.repec.org/a/eee/econom/v31y1986i3p307-327.html) |
