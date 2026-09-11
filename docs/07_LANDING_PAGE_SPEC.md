# 07 — Landing Page Specification & Narrative Architecture

> **Document:** `docs/07_LANDING_PAGE_SPEC.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Landing Page Overview & Design Objective

The RenewableIQ landing page serves as the commercial gateway for clean energy asset managers, independent power producers (IPPs), and transmission operators. 

It must immediately establish:
1. **Scientific Rigor & Commercial Authority:** Demonstrating deep domain competence in meteorology, power systems, and market economics.
2. **Interactive Proof Over Marketing Claims:** Showing the actual product interface and interactive forecasting canvas directly within the viewport.
3. **Restrained Editorial Aesthetics:** Clean light canvas (`#F7F8F5`), precision typography (Manrope + Inter), hairline borders, and deliberate motion. Zero neon gradients, generic purple AI blobs, or gimmick 3D models.

---

## 2. Comprehensive 11-Section Narrative Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE ARCHITECTURE                       │
├────────────────────────────────────────────────────────────────────────┤
│ 01. Sticky Engineered Navigation Bar (Telemetry snippet + CTA)         │
│ 02. Hero Section (Headline + Immediate 72h Interactive Preview Visual) │
│ 03. Institutional Proof Strip (Multi-GW operators, ISO partners)       │
│ 04. The Intermittency Dilemma (Ramp volatility & financial penalties)  │
│ 05. The Core Forecast Engine (Ensemble NWP + physical asset modeling)  │
│ 06. Interactive Forecast Canvas (72h Horizon, P10/P50/P90 exploration) │
│ 07. The 5-Stage Intelligence Pipeline (Weather→Forecast→Risk→Action)   │
│ 08. Interactive What-If Simulator Teaser (Cloud surge parameter test)  │
│ 09. Quantified Economic & Environmental Impact (Avoided penalty stats) │
│ 10. Master Call-To-Action Banner (Direct entry to live platform)       │
│ 11. Technical Editorial Footer (System status, sitemap, documentation) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Section-by-Section Detailed Specifications

### Section 01: Sticky Engineered Navigation Bar (`<LandingNavbar />`)
* **Visual Style:** Floating translucent container (`bg-surface/90 backdrop-blur-md border border-border/80 rounded-lg max-w-7xl mx-auto top-4`).
* **Left:** RenewableIQ wordmark with subtle emerald status pulse dot (`#167A4A`).
* **Center Links:** `Platform Overview`, `Forecasting Engine`, `Grid Risk Intelligence`, `What-If Lab`, `Documentation`.
* **Right Controls:**
  - Live Telemetry Chip: `● SCADA Live · 14.8 GW Monitored` (Text: 11px overline).
  - Secondary Button: `Sign In` (Ghost).
  - Primary CTA: `Launch Platform Demo` (Dark green `#0D4F32`).

### Section 02: Hero Section (`<HeroSection />`)
* **Category Tag / Eyebrow:** `NEXT-GENERATION RENEWABLE GENERATION INTELLIGENCE`
* **Headline:**  
  **Make renewable generation predictable.**
* **Sub-headline (Body Large):**  
  *Forecast the next 72 hours of solar and wind generation with physics-grounded machine learning, detect rapid ramp risks before they destabilize the grid, and turn weather uncertainty into autonomous dispatch decisions.*
* **CTA Group:**
  - Primary CTA: `Explore the Platform` (`/dashboard` with arrow icon).
  - Secondary CTA: `See How It Works` (Smooth scroll to Section 07 Pipeline).
* **Metadata Proof:** `● 98.4% Dispatch Compliance · 72h Rolling Horizon · Sub-15min Refresh`.

### Section 03: Hero Energy Forecasting Visual (`<HeroForecastVisual />`)
* **Nature of Visual:** High-craft, interactive SVG/Canvas time-series component representing a live 72-hour forecast for a 120 MW solar + storage asset.
* **Visible Data Layers:**
  1. *Actual Generation:* Solid dark green line (`#0D4F32`, 2.5px) transitioning smoothly into the future.
  2. *Predicted Generation:* Emerald forecast curve (`#167A4A`, 2.5px) covering the next 72 hours.
  3. *Confidence Corridor (\(P_{10} - P_{90}\)):* Subtle shaded band (`rgba(22, 122, 74, 0.08)`) illustrating meteorological uncertainty.
  4. *Atmospheric Context:* Light amber GHI solar curve and cobalt cloud cover overlay on a synchronized sub-axis.
  5. *Live Anomaly Annotation Marker:* At Hour +18, a red dashed line flags a *"34 MW Ramp-Down Risk (Cloud Front Impact)"* with an attached preview card: *"Action: BESS Discharge Pre-Conditioned"*.
* **Micro-Interactions:** Hovering over any time point reveals an exact tabular readout with MW, percentage variance, and weather factors.

### Section 04: Institutional Proof Strip (`<ProofStrip />`)
* **Headline:** `TRUSTED BY BALANCING AUTHORITIES AND UTILITY-SCALE IPPS NATIONWIDE`
* **Content:** Clean monochrome logos of regional grid operators, clean power utilities, and independent power producers (e.g., CAISO, ERCOT, NextEra Energy, Brookfield Renewable, AES Clean Energy).
* **Certifications:** `NERC CIP Compliant Architecture · IEC 61850 Telemetry Protocols · ISO 27001 Certified`.

### Section 05: The Intermittency Dilemma (`<ProblemStatement />`)
* **Narrative Focus:** Why traditional forecasting fails modern grids.
* **Three Structured Problem Cards:**
  1. *The 50 MW Ramp Trap:* Sudden convective cloud clusters cause steep generation cliffs in under 30 minutes, triggering severe frequency deviation penalties.
  2. *The Blind Battery Conundrum:* Storage systems sit idle during peak penalty windows because legacy SCADA lacks predictive foresight.
  3. *The Curtailment Squeeze:* Over-generation during negative market clearing prices forces manual asset curtailment, burning millions in lost PTCs and revenue.

### Section 06: Forecast Intelligence Features (`<CapabilitiesGrid />`)
* **Format:** 2x2 asymmetrical engineered feature grid with subtle hairline borders and micro-metric displays.
* **Card 1: 72-Hour Continuous Quantile Horizons:** Multi-model meteorological ensemble blending ECMWF, GFS, and local radar.
* **Card 2: Real-Time Anomaly & Ramp Detection:** Automated classification of ramp-up, ramp-down, and clipping hazards.
* **Card 3: Autonomous BESS Dispatch Intelligence:** Prescriptive battery pre-charging and discharge scheduling optimized for nodal LMP arbitrage.
* **Card 4: Enterprise Digital Twin Modeling:** Custom parametrization of inverter strings, single-axis tracker azimuths, and battery degradation limits.

### Section 07: The 5-Stage Intelligence Pipeline (`<PipelineStory />`)
* **Format:** Scroll-pinned interactive storytelling sequence (GSAP ScrollTrigger). As the user scrolls, the active step illuminates while the synchronized graphic demonstrates the pipeline transformation:
  1. `01 WEATHER` — Convective cloud formation detected 40 miles upwind; GHI drops from 880 to 240 W/m².
  2. `02 FORECAST` — Ensemble model predicts net plant generation drops 38 MW starting at 18:15 UTC.
  3. `03 RISK` — System classifies event as `CRITICAL RAMP-DOWN RISK` (Confidence: 94%).
  4. `04 ACTION` — Recommendation Engine schedules BESS Unit 1 & 2 to discharge 19 MW each.
  5. `05 IMPACT` — Grid frequency stabilized; plant avoids \$18,400 in imbalance penalties.

### Section 08: Interactive What-If Teaser (`<WhatIfTeaser />`)
* **Format:** Live interactive playground right on the landing page.
* **Controls:**
  - Slider: Cloud Cover Surge (`-30%` to `+50%`, default: `+20%`).
  - Toggle: Battery Assistance (`Enabled` / `Disabled`).
* **Visual Output:** Instantaneous reactive chart shift displaying the baseline curve vs the simulated shock curve, with an animated counter showing net revenue delta.

### Section 09: Economic & Environmental Impact (`<ImpactMetrics />`)
* **Format:** 4 authoritative stat blocks with large tabular typography.
* **Metrics:**
  - **`$142,000`** — Average annual imbalance penalty avoided per 100 MW asset.
  - **`3.8%`** — Day-ahead forecast MAPE (34% improvement over standard NWP).
  - **`99.2%`** — Grid interconnection dispatch compliance rate.
  - **`14,200 MT`** — CO₂ equivalent emissions displaced by eliminating reserve gas peakers.

### Section 10: Final Call-to-Action (`<CtaBanner />`)
* **Headline:** `Bring dispatch predictability to your renewable portfolio.`
* **Supporting Text:** `Launch the fully interactive RenewableIQ platform sandbox or connect your plant telemetry via standard IEC 61850 webhooks.`
* **Actions:**
  - Primary: `Launch Interactive Dashboard` (Links to `/dashboard`).
  - Secondary: `Review Technical Documentation` (Links to `/docs`).

### Section 11: Technical Editorial Footer (`<LandingFooter />`)
* **Columns:**
  - Brand & Status: RenewableIQ logo, system status badge (`All Forecast Services Operational`), copyright.
  - Core Platform: Dashboard, 72h Forecast, Risk Ledger, Recommendations, What-If Lab.
  - Integration: SCADA API, Modbus/DNP3 Gateways, Weather Providers, Webhook Alerts.
  - Compliance & Security: NERC CIP, ISO 27001, Privacy Policy, Terms of Service.
