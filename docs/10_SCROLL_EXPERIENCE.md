# 10 — Scroll Experience & Storytelling Architecture

> **Document:** `docs/10_SCROLL_EXPERIENCE.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Editorial Scroll Storytelling Philosophy

The RenewableIQ landing page utilizes scroll as an educational and explanatory medium. Rather than bombarding users with marketing superlatives, the scroll experience demonstrates **the exact physical transformation pipeline** that the platform performs every 15 minutes:

```
WEATHER ────────► FORECAST ────────► RISK ────────► ACTION ────────► IMPACT
(Atmosphere)      (Prediction)       (Hazard)       (Dispatch)       (Economics)
```

The user controls the tempo of the explanation through scroll momentum. As they advance through the pinned viewport, each stage of intelligence illuminates with synchronized chart updates.

---

## 2. The 5-Stage Storytelling Timeline (Detailed Choreography)

### Stage 01: WEATHER (`Atmospheric Physics`)
* **Visual Presentation:** The viewport pins. The left column displays:
  - Eyebrow: `01 / SATELLITE & RADAR ASSIMILATION`
  - Headline: `Convective cloud formation detected upwind.`
  - Narrative: *High-resolution Doppler radar and geostationary satellite telemetry identify a dense cloud front advancing at 28 km/h toward the array. Solar Global Horizontal Irradiance (GHI) drops precipitously from 880 W/m² to 220 W/m².*
  - Telemetry Chip: `GHI: 220 W/m² (-75%) · Cloud Opacity: 82%`.
* **Synchronized Graphic:** The preview chart illustrates the weather layer: a sharp blue stepped line indicates cloud cover spiking from 15% to 85%.

### Stage 02: FORECAST (`Machine Learning Ensemble`)
* **Visual Presentation:** As scroll continues, Stage 01 dims to 40% opacity; Stage 02 enters:
  - Eyebrow: `02 / PREDICTIVE ML ENSEMBLE`
  - Headline: `Expected generation drops 38 MW in 45 minutes.`
  - Narrative: *Physics-informed neural networks evaluate inverter string geometry, sun azimuth, and atmospheric diffusion. The continuous 72-hour forecast recalculates, predicting a generation cliff from 94 MW down to 56 MW starting at 18:15 UTC.*
  - Telemetry Chip: `Projected Loss: -38 MW · Confidence: 94.2%`.
* **Synchronized Graphic:** The solid emerald forecast curve bends downward sharply, accompanied by an expanding \(P_{10} - P_{90}\) shaded confidence corridor showing model spread.

### Stage 03: RISK (`Automated Anomaly Classification`)
* **Visual Presentation:**
  - Eyebrow: `03 / REAL-TIME RISK INTELLIGENCE`
  - Headline: `Critical ramp-down anomaly triggered.`
  - Narrative: *The anomaly engine compares the forecasted trajectory against the plant's committed day-ahead schedule. A critical ramp alert is logged: generation loss exceeds 20% in under 30 minutes, violating balancing interconnect tolerance.*
  - Threat Badge: `CRITICAL RAMP HAZARD · SEVERITY: LEVEL 4`.
* **Synchronized Graphic:** A vertical crimson hazard zone (`rgba(201, 74, 74, 0.15)`) overlays the chart between hours 18:00 and 19:30, with an animated warning marker pulsing once.

### Stage 04: ACTION (`Prescriptive Asset Dispatch`)
* **Visual Presentation:**
  - Eyebrow: `04 / AUTONOMOUS MITIGATION`
  - Headline: `Pre-condition BESS storage for 19 MW discharge.`
  - Narrative: *Rather than dumping raw alerts into an operator's queue, RenewableIQ formulates an exact physical mitigation. Battery Storage Units 1 & 2 are instructed to ramp up discharge at 18:12 UTC, perfectly compensating for the solar drop.*
  - Action Card: `BESS Unit 1: +9.5 MW · BESS Unit 2: +9.5 MW · Duration: 75 min`.
* **Synchronized Graphic:** A complementary cyan/emerald battery discharge curve elevates from the zero axis, perfectly smoothing the net output curve into a flat, compliant line.

### Stage 05: IMPACT (`Financial & Grid Reliability Yield`)
* **Visual Presentation:**
  - Eyebrow: `05 / SYSTEMIC & COMMERCIAL IMPACT`
  - Headline: `Penalty avoided. Grid stability preserved.`
  - Narrative: *Feeder frequency remains rock-solid at 60.00 Hz. The plant owner avoids \$18,400 in CAISO deviation penalties, while the balancing authority avoids firing up a high-emissions natural gas peaker.*
  - Impact Metric: `+$18,400 Avoided Penalty · 0.0 Hz Frequency Deviation · -14.2 MT CO₂e`.
* **Synchronized Graphic:** The net generation curve aligns smoothly with the day-ahead schedule line, highlighting a complete hazard resolution.

---

## 3. Smooth Scrolling Architecture (Lenis Integration)

To ensure the scroll experience feels high-craft, buttery-smooth, and consistent across varying hardware mice and trackpads, **Lenis** is integrated with strict safeguards:

### 3.1 Integration Rules
1. **Lightweight Global Provider:** Wrap the landing page layout with a React-based Lenis context.
2. **Strict Accessibility Bypass:** Automatically disable Lenis if `prefers-reduced-motion: reduce` is detected.
3. **No Scroll Hijacking:** Lenis must only normalize scroll delta; it must NEVER prevent the user from reaching the bottom of the page or break native browser gestures.
4. **Anchor Link Integrity:** Ensure internal page anchor jumps (e.g., `#pipeline`, `#pricing`) animate smoothly to target positions using `lenis.scrollTo(target, { offset: -80 })`.

### 3.2 Implementation Blueprint (`src/components/shared/smooth-scroll.tsx`)
```tsx
'use client';

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // 1. Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    // 2. Initialize Lenis with gentle inertia
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

## 4. Mobile & Touch Screen Fallback Rules

On mobile viewports (\(< 768px\)):
* **Pinning is Disabled:** Pinned scrolling on small screens causes touch trapping and disorientation.
* **Vertical Stacked Cards:** The 5 stages transform into an elegant vertical timeline with connecting dotted lines (`border-l-2 border-border`).
* **Interactive Step Indicators:** Users can tap steps (`01 Weather`, `02 Forecast`, etc.) to view each stage without continuous dragging.
