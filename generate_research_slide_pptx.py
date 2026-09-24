# -*- coding: utf-8 -*-
"""
SAIL-NaviBulk 26006 - Master Research & Reference PowerPoint Deck
Generates a 16:9 widescreen presentation with clean, punchy points and DEEP direct document links.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette
    COLOR_BG = RGBColor(9, 13, 22)          # #090D16 Dark Navy
    COLOR_CARD = RGBColor(15, 23, 42)       # #0F172A Slate 900
    COLOR_BORDER = RGBColor(30, 41, 59)     # #1E293B
    COLOR_COBALT = RGBColor(37, 99, 235)    # #2563EB
    COLOR_BLUE_LT = RGBColor(96, 165, 250)  # #60A5FA
    COLOR_EMERALD = RGBColor(16, 185, 129)  # #10B981
    COLOR_AMBER = RGBColor(245, 158, 11)    # #F59E0B
    COLOR_ROSE = RGBColor(244, 63, 94)      # #F43F5E
    COLOR_CYAN = RGBColor(6, 182, 212)      # #06B6D4
    COLOR_PURPLE = RGBColor(168, 85, 247)   # #A855F7
    COLOR_TEXT_HI = RGBColor(248, 250, 252) # White
    COLOR_TEXT_MID = RGBColor(148, 163, 184)# Slate 400
    COLOR_TEXT_LOW = RGBColor(100, 116, 139)# Slate 500

    def add_blank_slide():
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return slide

    def add_header(slide, title, subtitle):
        # Category Pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(3.4), Inches(0.26))
        pill.fill.solid()
        pill.fill.fore_color.rgb = RGBColor(18, 30, 56)
        pill.line.color.rgb = COLOR_COBALT
        pill.line.width = Pt(1)
        p = pill.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = "SIH-26006 • MINISTRY OF STEEL / SAIL"
        r.font.size = Pt(8)
        r.font.bold = True
        r.font.color.rgb = COLOR_BLUE_LT

        # Title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(9.0), Inches(0.55))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title
        r.font.size = Pt(17)
        r.font.bold = True
        r.font.color.rgb = COLOR_TEXT_HI

        p2 = tf.add_paragraph()
        r2 = p2.add_run()
        r2.text = subtitle
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = COLOR_TEXT_MID

    # =========================================================================
    # SLIDE 1: MASTER 6-STAGE RESEARCH & REFERENCE SLIDE (WITH DIRECT DEEP LINKS)
    # =========================================================================
    slide1 = add_blank_slide()
    add_header(
        slide1,
        "⚓ SAIL NaviBulk: Research, Validation & Competitive Proofs",
        "Direct Primary Sources: Port Circulars, Statutory CAG Audits & Econometric Equations"
    )

    # Top Metric Counters
    metrics = [
        ("18–22 MMT", "Annual Coking Coal"),
        ("₹3,300+ Cr", "Annual Freight Outlay"),
        ("1.81%", "XGBoost 1-Day MAPE")
    ]
    for idx, (val, lbl) in enumerate(metrics):
        tb_m = slide1.shapes.add_textbox(Inches(8.8 + idx * 1.45), Inches(0.4), Inches(1.35), Inches(0.7))
        tf_m = tb_m.text_frame
        tf_m.margin_left = tf_m.margin_top = tf_m.margin_right = tf_m.margin_bottom = 0
        p_val = tf_m.paragraphs[0]
        p_val.alignment = PP_ALIGN.RIGHT
        r_val = p_val.add_run()
        r_val.text = val
        r_val.font.size = Pt(13.5)
        r_val.font.bold = True
        r_val.font.color.rgb = COLOR_EMERALD

        p_lbl = tf_m.add_paragraph()
        p_lbl.alignment = PP_ALIGN.RIGHT
        r_lbl = p_lbl.add_run()
        r_lbl.text = lbl
        r_lbl.font.size = Pt(7)
        r_lbl.font.color.rgb = COLOR_TEXT_LOW

    # 6-Step Ribbon Flow
    steps = [
        ("1. THE MARKET GAP", COLOR_ROSE),
        ("2. SAIL VALIDATION", COLOR_AMBER),
        ("3. SOURCE → DESTINATION", COLOR_CYAN),
        ("4. DATA APPLICATION", COLOR_COBALT),
        ("5. COMPETITIVE PROOFS", COLOR_EMERALD),
        ("6. STATUTORY GOVERNANCE", COLOR_PURPLE)
    ]
    ribbon_w = Inches(1.88)
    gap_w = Inches(0.1)
    start_x = Inches(0.8)
    ribbon_y = Inches(1.28)

    for i, (stitle, scolor) in enumerate(steps):
        s_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x + i * (ribbon_w + gap_w), ribbon_y, ribbon_w, Inches(0.28))
        s_box.fill.solid()
        s_box.fill.fore_color.rgb = COLOR_CARD
        s_box.line.color.rgb = scolor
        s_box.line.width = Pt(1)
        p = s_box.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = stitle
        r.font.size = Pt(7.5)
        r.font.bold = True
        r.font.color.rgb = scolor

    # 6 Cards Data (Punchy Bullets + Exact Direct Document Hyperlinks)
    cards = [
        {
            "col": 0, "row": 0,
            "title": "01. The Market Gap", "color": COLOR_ROSE, "tag": "COMMERCIAL RISK",
            "bullets": [
                ("Spot Volatility:", "BDI swings $15k–$35k/day cause severe budget shocks."),
                ("Demurrage Traps:", "Blind broker fixtures incur $20k–$35k/day waiting penalties."),
                ("Haldia Bottleneck:", "8.8m riverine draft locks out Panamax ships without lightering."),
                ("Scale Shifts:", "Raw price level ML fails (~40% MAPE) on 40-year BDI changes.")
            ],
            "links": [
                ("Baltic Benchmark Rules", "https://www.balticexchange.com/en/data-services/market-information0/dry-services.html"),
                ("BIMCO Laytime Rules", "https://www.bimco.org/contracts-and-clauses/bimco-clauses/current/laytime-definitions-for-chartering-2013")
            ]
        },
        {
            "col": 1, "row": 0,
            "title": "02. SAIL Validation", "color": COLOR_AMBER, "tag": "CAG AUDIT PROVEN",
            "bullets": [
                ("Feedstock Deficit:", "Domestic coal has 24–32% ash; blast furnaces need <10% ash."),
                ("Freight Spend:", "SAIL imports 18–22 MMT coal, spending ₹3,300+ Cr ($400M+) yearly."),
                ("CAG Report 11/2018:", "Official audit of 670 vessels (₹12,797 Cr); ordered demurrage cuts."),
                ("Sansad Warning:", "Parliament instructed SAIL to cut 80–85% reliance on Australia.")
            ],
            "links": [
                ("CAG Audit Report 11/2018", "https://cag.gov.in/en/audit-report/details/46174"),
                ("PIB Coking Coal Statement", "https://pib.gov.in/PressReleasePage.aspx?PRID=1778931")
            ]
        },
        {
            "col": 2, "row": 0,
            "title": "03. Source → Destination", "color": COLOR_CYAN, "tag": "PHYSICAL GATING",
            "bullets": [
                ("Paradip (PPA):", "14.5m draft CB-1/2, 16.5m deep approach channel [Notice 750]."),
                ("Vizag (VPT):", "Outer Harbor VGCB 18.1m draft allows 200,000 DWT Capesize."),
                ("Haldia (SMPK):", "8.8m lock limit forces Sagar 2-stage lightering ($3.80/t + 3.5d)."),
                ("Nautical Routing:", "SeaRates & NGA: Hay Point (4,850nm), Hampton Roads (11,300nm).")
            ],
            "links": [
                ("Paradip Berth Specs", "https://paradipport.gov.in/berth-specifications/"),
                ("Vizag Port Berths", "https://vizagport.com/Template/navigateTemplate/gnt/QmVydGhz"),
                ("Haldia Draft Forecast", "https://smportkolkata.shipping.gov.in/smpk/en/draft-forecast/")
            ]
        },
        {
            "col": 0, "row": 1,
            "title": "04. Data Application", "color": COLOR_COBALT, "tag": "ECONOMETRIC ML",
            "bullets": [
                ("10,246 Records:", "Merged 1985–2026 data trained on log-returns: r_t = ln(P_t/P_{t-1})."),
                ("Forecast Win:", "XGBoost achieves 1.81% MAPE ($457/day); SARIMA achieves 2.39%."),
                ("G20 Bunker Prices:", "Dynamic cubic fuel burn (P ∝ v³) against Ship & Bunker VLSFO."),
                ("Commodity Benchmarks:", "World Bank Pink Sheet coking coal & iron ore monthly series.")
            ],
            "links": [
                ("ajoposor BDI Dataset [CSV]", "https://raw.githubusercontent.com/ajoposor/Baltic-Dry-Index/master/Old_Data_Baltic_Dry_Index.csv"),
                ("Ship & Bunker G20 Index", "https://shipandbunker.com/prices/av/global/av-g20-global-20-ports-average"),
                ("World Bank Pink Sheet [XLSX]", "https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx")
            ]
        },
        {
            "col": 1, "row": 1,
            "title": "05. Competitive Advantage", "color": COLOR_EMERALD, "tag": "PROVEN NOVELTY",
            "bullets": [
                ("vs MarineTraffic:", "Descriptive GPS tracking only vs NaviBulk predictive TCE freight math."),
                ("vs Clarksons SIN:", "$10k/yr paywalled macro PDF reports vs operational berth checks."),
                ("vs SAP TM:", "Enterprise ERP lacks marine physics, tidal limits, and bunker curves."),
                ("NOVEL Arbitrage:", "Stage 07 multi-basin delivered $/MT optimization cuts Australia risk.")
            ],
            "links": [
                ("VesselFinder AIS Fleet", "https://www.vesselfinder.com/"),
                ("Clarksons Portal", "https://www.clarksons.com/"),
                ("SAP TM Logistics", "https://help.sap.com/docs/SAP_TRANSPORTATION_MANAGEMENT")
            ]
        },
        {
            "col": 2, "row": 1,
            "title": "06. Statutory Governance", "color": COLOR_PURPLE, "tag": "CAG & CVC COMPLIANT",
            "bullets": [
                ("CAG Audit Defense:", "Directly mitigates ₹274.71 Cr demurrage loss cited in CAG Report 11/2018."),
                ("CVC Compliance:", "Automated immutable audit trail justifying L1 vessel fixtures & COA splits."),
                ("BIMCO Charter Armor:", "Virtual Arrival 2011 clause freezes laytime clocks during port congestion."),
                ("DGS / IMO Standard:", "Mandatory fuel switch & zero scrubber washwater discharge in 12 NM zone.")
            ],
            "links": [
                ("CAG Report 11/2018", "https://cag.gov.in/en/audit-report/details/46174"),
                ("CVC Procurement", "https://www.cvc.gov.in/"),
                ("BIMCO Virtual Arrival", "https://www.bimco.org/contracts-and-clauses/bimco-clauses/current/virtual-arrival-clause-for-voyage-charter-parties-2011")
            ]
        }
    ]

    card_w = Inches(3.78)
    card_h = Inches(2.55)
    row_gap = Inches(0.18)
    col_gap = Inches(0.18)

    for c in cards:
        cx = start_x + c["col"] * (card_w + col_gap)
        cy = Inches(1.7) + c["row"] * (card_h + row_gap)

        card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, card_w, card_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD
        card.line.color.rgb = COLOR_BORDER
        card.line.width = Pt(1)

        tb_c = slide1.shapes.add_textbox(cx + Inches(0.14), cy + Inches(0.12), card_w - Inches(0.28), card_h - Inches(0.24))
        tf_c = tb_c.text_frame
        tf_c.word_wrap = True
        tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0

        # Header Title + Tag
        p_head = tf_c.paragraphs[0]
        r_title = p_head.add_run()
        r_title.text = c["title"]
        r_title.font.size = Pt(10)
        r_title.font.bold = True
        r_title.font.color.rgb = c["color"]

        r_space = p_head.add_run()
        r_space.text = "   "

        r_tag = p_head.add_run()
        r_tag.text = f"[{c['tag']}]"
        r_tag.font.size = Pt(7)
        r_tag.font.bold = True
        r_tag.font.color.rgb = c["color"]

        # 1-Line Punchy Bullets
        for lead, rest in c["bullets"]:
            pb = tf_c.add_paragraph()
            pb.space_before = Pt(3.5)
            
            r_icon = pb.add_run()
            r_icon.text = "▸ "
            r_icon.font.size = Pt(7.5)
            r_icon.font.color.rgb = COLOR_BLUE_LT

            r_lead = pb.add_run()
            r_lead.text = lead + " "
            r_lead.font.bold = True
            r_lead.font.size = Pt(7.5)
            r_lead.font.color.rgb = COLOR_TEXT_HI

            r_rest = pb.add_run()
            r_rest.text = rest
            r_rest.font.size = Pt(7.2)
            r_rest.font.color.rgb = COLOR_TEXT_MID

        # Direct Document Hyperlinks
        p_links = tf_c.add_paragraph()
        p_links.space_before = Pt(7)

        r_lhdr = p_links.add_run()
        r_lhdr.text = "🔗 Document Proofs: "
        r_lhdr.font.size = Pt(7.2)
        r_lhdr.font.bold = True
        r_lhdr.font.color.rgb = COLOR_TEXT_LOW

        for link_text, link_url in c["links"]:
            r_lnk = p_links.add_run()
            r_lnk.text = f"[{link_text}]  "
            r_lnk.font.size = Pt(7.2)
            r_lnk.font.bold = True
            r_lnk.font.color.rgb = COLOR_BLUE_LT
            r_lnk.hyperlink.address = link_url

    # Bottom Status Bar
    tb_foot = slide1.shapes.add_textbox(Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.3))
    tf_foot = tb_foot.text_frame
    tf_foot.margin_left = tf_foot.margin_top = tf_foot.margin_right = tf_foot.margin_bottom = 0
    p_foot = tf_foot.paragraphs[0]
    r_f = p_foot.add_run()
    r_f.text = "● DIRECT DOCUMENT PROOFS  •  Ministry of Steel / SAIL (SIH-26006)  •  NGA Pub 151 & SeaRates  •  CAG Report 11/2018 Audit Compliant"
    r_f.font.size = Pt(8)
    r_f.font.color.rgb = COLOR_TEXT_LOW

    # =========================================================================
    # SLIDE 2: COMPETITIVE TABLE WITH DIRECT PRODUCT DOC LINKS
    # =========================================================================
    slide2 = add_blank_slide()
    add_header(
        slide2,
        "🏆 Competitive Matrix: Why SAIL NaviBulk Outperforms Existing Platforms",
        "Direct Feature Comparison against MarineTraffic, Clarksons SIN, and SAP Transportation Management"
    )

    rows = 6
    cols = 4
    table_shape = slide2.shapes.add_table(rows, cols, Inches(0.8), Inches(1.45), Inches(11.733), Inches(4.9))
    table = table_shape.table

    table.columns[0].width = Inches(2.3)
    table.columns[1].width = Inches(3.0)
    table.columns[2].width = Inches(3.1)
    table.columns[3].width = Inches(3.333)

    comp_headers = ["Capability / Feature", "Incumbent Tools", "Critical Limitation for SAIL", "SAIL NaviBulk Solution (Verified Proof)"]
    for j, h in enumerate(comp_headers):
        cell = table.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(18, 30, 56)
        p = cell.text_frame.paragraphs[0]
        r = p.add_run()
        r.text = h
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = COLOR_BLUE_LT

    comp_rows = [
        (
            "Vessel Telemetry & Tracking",
            "MarineTraffic / Kpler\n(Satellite AIS)",
            "Purely descriptive GPS tracking. Shows ship location but lacks forward rate forecasting or voyage math.",
            "Combines AIS with forward XGBoost freight curves (1.81% MAPE) and automated laytime arrival schedules."
        ),
        (
            "Market Intelligence & Analytics",
            "Clarksons SIN / Braemar\n(Shipbroking Reports)",
            "Expensive paywalled PDF reports ($10,000+/yr). Broad macro statistics without Indian port constraint checks.",
            "Open-architecture econometric engine modeling BCI/BPI indices with CVC/CAG compliant fixture audit dossiers."
        ),
        (
            "Enterprise Logistics & ERP",
            "SAP Transportation Management\n(SAP TM / S/4HANA)",
            "Handles invoices and rail vouchers. Zero understanding of marine physics, tidal windows, or bunker burn curves.",
            "Hydrodynamic simulation modeling cubic fuel burn (P ∝ v³), lightering gating at Sagar, and demurrage prevention."
        ),
        (
            "NOVEL: Multi-Basin Sourcing (Stage 07)",
            "None\n(Traditional single-origin spot booking)",
            "India is 80–85% dependent on Australian coal. Spot bookings fail to challenge nominations with alternative costs.",
            "Computes blast furnace gate delivered $/MT arbitrage across Australia, Mozambique, Indonesia, and USA."
        ),
        (
            "NOVEL: Backhaul Repositioning",
            "None\n(Unladen return legs ignored)",
            "Vessels return empty to foreign ports; shipowners price return ballast risk directly into outbound freight rates.",
            "Pairs return ballast legs with coastal iron ore / steel exports (Paradip → East Asia), recovering up to $350k/voyage."
        )
    ]

    for i, row_data in enumerate(comp_rows):
        for j, text in enumerate(row_data):
            cell = table.cell(i + 1, j)
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_CARD if (i % 2 == 0) else RGBColor(12, 18, 32)
            p = cell.text_frame.paragraphs[0]
            r = p.add_run()
            r.text = text
            r.font.size = Pt(8)
            if j == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_TEXT_HI
            elif j == 3:
                r.font.color.rgb = COLOR_EMERALD
                r.font.bold = True
            else:
                r.font.color.rgb = COLOR_TEXT_MID

    # Bottom link bar
    tb_c_links = slide2.shapes.add_textbox(Inches(0.8), Inches(6.55), Inches(11.733), Inches(0.4))
    tf_cl = tb_c_links.text_frame
    p_cl = tf_cl.paragraphs[0]
    r_cl_hdr = p_cl.add_run()
    r_cl_hdr.text = "🔗 Verified Competitor Documentation:  "
    r_cl_hdr.font.bold = True
    r_cl_hdr.font.size = Pt(8.5)
    r_cl_hdr.font.color.rgb = COLOR_TEXT_LOW

    comp_links = [
        ("VesselFinder AIS Fleet Tracker", "https://www.vesselfinder.com/"),
        ("Clarksons Shipping Intelligence", "https://www.clarksons.com/"),
        ("SAP TM Logistics Documentation", "https://help.sap.com/docs/SAP_TRANSPORTATION_MANAGEMENT"),
        ("Kpler Dry Bulk Analytics", "https://www.kpler.com/")
    ]
    for c_name, c_url in comp_links:
        r_l = p_cl.add_run()
        r_l.text = f"[{c_name}]   "
        r_l.font.size = Pt(8.5)
        r_l.font.bold = True
        r_l.font.color.rgb = COLOR_BLUE_LT
        r_l.hyperlink.address = c_url

    # =========================================================================
    # SLIDE 3: ML MODEL ARCHITECTURE & FORECASTING FLOWCHART
    # =========================================================================
    slide3 = add_blank_slide()
    add_header(
        slide3,
        "🧠 Econometric & ML Forecasting Architecture: End-to-End Decision Pipeline",
        "Dual-Engine (XGBoost Regressor + SARIMAX + GARCH) with Stationarity Transform & Hydrodynamic Bunker Optimization"
    )

    # 5 Sequential Flowchart Steps Across Slide
    flow_steps = [
        {
            "step": "STEP 01",
            "title": "Raw Data Ingestion",
            "tag": "INPUT TELEMETRY",
            "color": COLOR_CYAN,
            "bullets": [
                "10,246 BDI daily records (1985–2026).",
                "Ship & Bunker G20 VLSFO ($829.50/t).",
                "NGA & SeaRates nautical distance matrix.",
                "Port bathymetry (14.5m / 18.1m / 8.8m)."
            ]
        },
        {
            "step": "STEP 02",
            "title": "Stationarity & Transform",
            "tag": "FEATURE TENSORS",
            "color": COLOR_COBALT,
            "bullets": [
                "Log-returns: r_t = ln(P_t / P_{t-1}).",
                "Eliminates 40-yr structural regime bias.",
                "Rolling volatility: σ_7d, σ_14d, σ_30d.",
                "Exponential moving averages & momentum."
            ]
        },
        {
            "step": "STEP 03",
            "title": "Dual-Core ML Engine",
            "tag": "MODEL TRAINING",
            "color": COLOR_PURPLE,
            "bullets": [
                "XGBoost Regressor: 1.81% 1-day MAPE.",
                "SARIMAX(1,0,1): 2.39% MLE baseline.",
                "GARCH(1,1): Dynamic variance modeling.",
                "Trained with zero lookahead bias."
            ]
        },
        {
            "step": "STEP 04",
            "title": "Vessel Scaling & Cones",
            "tag": "PROJECTION LAYER",
            "color": COLOR_AMBER,
            "bullets": [
                "Post-2018 Baltic weights (40/30/30 split).",
                "Compounding: P̂_{t+h} = P_t · exp(Σ r̂_τ).",
                "95% widening econometric confidence cones.",
                "Stress multipliers (0.85x to 1.35x crisis)."
            ]
        },
        {
            "step": "STEP 05",
            "title": "Prescriptive Dispatch",
            "tag": "COMMERCIAL ACTION",
            "color": COLOR_EMERALD,
            "bullets": [
                "Hydrodynamic cubic burn (P ∝ v³).",
                "Spot Fixture vs 14d Delay vs COA Hedge.",
                "Demurrage prevention & laytime synch.",
                "CVC GFR Rule 144(xi) fixture dossier."
            ]
        }
    ]

    f_card_w = Inches(2.18)
    f_card_h = Inches(2.35)
    f_gap = Inches(0.20)
    f_start_x = Inches(0.8)
    f_y = Inches(1.45)

    for idx, fs in enumerate(flow_steps):
        fcx = f_start_x + idx * (f_card_w + f_gap)
        
        # Step Card
        fcard = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, fcx, f_y, f_card_w, f_card_h)
        fcard.fill.solid()
        fcard.fill.fore_color.rgb = COLOR_CARD
        fcard.line.color.rgb = fs["color"]
        fcard.line.width = Pt(1.2)

        tb_fc = slide3.shapes.add_textbox(fcx + Inches(0.08), f_y + Inches(0.08), f_card_w - Inches(0.16), f_card_h - Inches(0.16))
        tf_fc = tb_fc.text_frame
        tf_fc.word_wrap = True
        tf_fc.margin_left = tf_fc.margin_top = tf_fc.margin_right = tf_fc.margin_bottom = 0

        p_shead = tf_fc.paragraphs[0]
        r_step = p_shead.add_run()
        r_step.text = f"{fs['step']} • {fs['tag']}\n"
        r_step.font.size = Pt(6.8)
        r_step.font.bold = True
        r_step.font.color.rgb = fs["color"]

        r_stitle = p_shead.add_run()
        r_stitle.text = fs["title"]
        r_stitle.font.size = Pt(9.5)
        r_stitle.font.bold = True
        r_stitle.font.color.rgb = COLOR_TEXT_HI

        for b in fs["bullets"]:
            pb = tf_fc.add_paragraph()
            pb.space_before = Pt(3.5)
            r_dot = pb.add_run()
            r_dot.text = "▸ "
            r_dot.font.size = Pt(7)
            r_dot.font.color.rgb = fs["color"]
            
            r_bt = pb.add_run()
            r_bt.text = b
            r_bt.font.size = Pt(7.2)
            r_bt.font.color.rgb = COLOR_TEXT_MID

        # Connector Arrow (between cards)
        if idx < len(flow_steps) - 1:
            arr_x = fcx + f_card_w + Inches(0.03)
            arr_y = f_y + Inches(1.05)
            tb_arr = slide3.shapes.add_textbox(arr_x, arr_y, f_gap - Inches(0.06), Inches(0.3))
            tf_arr = tb_arr.text_frame
            tf_arr.margin_left = tf_arr.margin_top = tf_arr.margin_right = tf_arr.margin_bottom = 0
            p_arr = tf_arr.paragraphs[0]
            p_arr.alignment = PP_ALIGN.CENTER
            r_arrow = p_arr.add_run()
            r_arrow.text = "➔"
            r_arrow.font.size = Pt(14)
            r_arrow.font.bold = True
            r_arrow.font.color.rgb = COLOR_BLUE_LT

    # -------------------------------------------------------------------------
    # Lower Section: Benchmark Table (Left) + Mathematical Proofs (Right)
    # -------------------------------------------------------------------------
    lower_y = Inches(4.0)
    lower_h = Inches(2.9)

    # Left Container: Benchmark Comparison Table
    b_table_shape = slide3.shapes.add_table(5, 4, Inches(0.8), lower_y, Inches(5.7), lower_h)
    b_table = b_table_shape.table
    b_table.columns[0].width = Inches(2.2)
    b_table.columns[1].width = Inches(1.1)
    b_table.columns[2].width = Inches(1.1)
    b_table.columns[3].width = Inches(1.3)

    b_headers = ["Forecasting Architecture", "1-Day MAPE", "Level RMSE", "Horizon / Basis"]
    for j, bh in enumerate(b_headers):
        bcell = b_table.cell(0, j)
        bcell.fill.solid()
        bcell.fill.fore_color.rgb = RGBColor(18, 30, 56)
        p = bcell.text_frame.paragraphs[0]
        r = p.add_run()
        r.text = bh
        r.font.bold = True
        r.font.size = Pt(8)
        r.font.color.rgb = COLOR_BLUE_LT

    b_rows = [
        ("XGBoost Regressor (NaviBulk)", "1.81%", "$457 / day", "30-Day Multi-Step"),
        ("SARIMAX(1,0,1) Baseline", "2.39%", "$604 / day", "Conditional Gaussian MLE"),
        ("Naive Lag-1 Persistence", "4.85%", "$1,218 / day", "P̂_{t+1} = P_t"),
        ("Raw Price Level ML (Unstationary)", "~40.2%", "$8,940 / day", "Fails (Scale Contaminated)")
    ]

    for i, row in enumerate(b_rows):
        for j, val in enumerate(row):
            cell = b_table.cell(i + 1, j)
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_CARD if (i % 2 == 0) else RGBColor(12, 18, 32)
            p = cell.text_frame.paragraphs[0]
            r = p.add_run()
            r.text = val
            r.font.size = Pt(7.5)
            if j == 0 and i == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_EMERALD
            elif j == 1 and i == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_EMERALD
            elif i == 3:
                r.font.color.rgb = COLOR_ROSE
            else:
                r.font.color.rgb = COLOR_TEXT_HI if j == 0 else COLOR_TEXT_MID

    # Right Container: Mathematical Proofs & Governing Laws
    p_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), lower_y, Inches(5.733), lower_h)
    p_box.fill.solid()
    p_box.fill.fore_color.rgb = COLOR_CARD
    p_box.line.color.rgb = COLOR_BORDER
    p_box.line.width = Pt(1)

    tb_p = slide3.shapes.add_textbox(Inches(6.95), lower_y + Inches(0.12), Inches(5.433), lower_h - Inches(0.24))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True
    tf_p.margin_left = tf_p.margin_top = tf_p.margin_right = tf_p.margin_bottom = 0

    p_mhead = tf_p.paragraphs[0]
    r_mh = p_mhead.add_run()
    r_mh.text = "📐 Governing Mathematical Formulations & Hydrodynamic Laws\n"
    r_mh.font.size = Pt(9.5)
    r_mh.font.bold = True
    r_mh.font.color.rgb = COLOR_CYAN

    math_items = [
        ("1. Log-Return Stationarity Transform:", "r_t = ln(P_t / P_{t-1})  [Eliminates unit-root variance over 40 yrs of BDI]"),
        ("2. GARCH(1,1) Volatility Formulation:", "σ_t² = ω + α·ε_{t-1}² + β·σ_{t-1}²  [Expands dynamic 95% confidence cones]"),
        ("3. Cumulative Trajectory Compounding:", "P̂_{t+h} = P_t · exp(Σ_{τ=1}^h r̂_τ)  [Projects nominal $/day forward freight]"),
        ("4. Hydrodynamic Cubic Speed Law:", "F(v) = F_design · (v / v_design)³  [Optimizes steaming knots vs bunker price]"),
        ("5. Net Timing Arbitrage Savings:", "ΔSpend = (P_0 - P̂_{fixture}) · TransitDays · (MT / DWT) - DemurrageRisk")
    ]

    for mlead, mformula in math_items:
        pm = tf_p.add_paragraph()
        pm.space_before = Pt(3)
        rm_l = pm.add_run()
        rm_l.text = mlead + " "
        rm_l.font.size = Pt(7.5)
        rm_l.font.bold = True
        rm_l.font.color.rgb = COLOR_TEXT_HI

        rm_f = pm.add_run()
        rm_f.text = mformula
        rm_f.font.size = Pt(7.2)
        rm_f.font.color.rgb = COLOR_AMBER

    # Bottom Status Bar on Slide 3
    tb_foot3 = slide3.shapes.add_textbox(Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.3))
    tf_foot3 = tb_foot3.text_frame
    tf_foot3.margin_left = tf_foot3.margin_top = tf_foot3.margin_right = tf_foot3.margin_bottom = 0
    p_foot3 = tf_foot3.paragraphs[0]
    r_f3 = p_foot3.add_run()
    r_f3.text = "● AUDIT PROOF: Zero lookahead bias  •  Walk-forward validation on 10,246 trading records  •  CVC & CAG compliant fixture dossier"
    r_f3.font.size = Pt(8)
    r_f3.font.color.rgb = COLOR_TEXT_LOW

    # Save presentation
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "SAIL_NaviBulk_Research_and_Reference_Slide.pptx")
    prs.save(output_path)
    print(f"[OK] PowerPoint saved successfully with 3 complete slides to: {output_path}")

if __name__ == "__main__":
    create_presentation()
