# 12 — Accessibility Architecture (a11y) & WCAG 2.1 AA Compliance

> **Document:** `docs/12_ACCESSIBILITY.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Core Commitment: Mission-Critical Accessibility

RenewableIQ adheres to **WCAG 2.1 Level AA** standards. In utility dispatch environments, situational awareness must remain unhindered by visual impairments, color vision deficiencies, or mobility constraints.

---

## 2. Color Vision Deficiency & Multi-Channel Signifiers

### 2.1 The Red/Green Colorblindness Rule
In conventional dashboards, status is often indicated purely via red and green dots. For operators with deuteranopia or protanopia, this results in catastrophic ambiguity between nominal generation and critical under-generation trips.

**Strict Platform Rule:** Color must **never** be the sole conveyor of information. Every status state must provide three simultaneous, redundant signifiers:
1. **Calibrated Semantic Color:** (e.g., `#E8F5ED` green for nominal, `#FDF2F2` crimson for critical).
2. **Distinct Semantic Icon:** (e.g., `CheckCircle2` for nominal, `AlertTriangle` for warning, `AlertOctagon` for critical).
3. **Explicit Text Label:** (e.g., `NOMINAL`, `RAMP WARNING`, `CRITICAL ANOMALY`).

```tsx
// Compliant Status Indicator Implementation
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-danger-tint text-danger border border-danger/20">
  <AlertOctagon className="size-3.5" aria-hidden="true" />
  <span className="text-xs font-semibold uppercase tracking-wider">CRITICAL RAMP RISK</span>
</div>
```

---

## 3. Keyboard Navigation & Focus Ring Standards

### 3.1 Focus Indicator Styling
All interactive elements (buttons, links, inputs, sliders, table rows) feature an unmistakable, high-contrast focus ring that never relies on default browser outlines:

```css
/* Standard focus visible utility */
.focus-ring {
  @apply focus-visible:outline-none 
         focus-visible:ring-2 
         focus-visible:ring-primary 
         focus-visible:ring-offset-2 
         focus-visible:ring-offset-background;
}
```

### 3.2 Keyboard Navigation Sequence & Shortcuts
* **Skip Link:** A top-level skip link is rendered at the start of `<body>`:  
  `<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 ...">Skip to Main Telemetry Viewport</a>`
* **Tab Order:** Logical left-to-right, top-to-bottom document flow through:
  - Sidebar Navigation Links → Header Controls → KPI Metric Cards → Master Chart Toolbar → Chart Data Points → Intelligence Action Cards.
* **Modal Dialogs:** Focus is trapped within modal dialogs (`<Dialog />` via Radix UI) upon opening; pressing `Escape` immediately dismisses the modal and returns focus to the trigger button.
* **Slider Controls (What-If Lab):** Arrow keys (`Left`/`Right`) increment/decrement values by 1 unit; `Page Up`/`Page Down` adjust by 10 units.

---

## 4. Semantic HTML & Landmark Roles

RenewableIQ strictly utilizes standard HTML5 landmark elements:
* `<header role="banner">`: Application shell top-bar.
* `<nav role="navigation" aria-label="Main Navigation">`: Left application sidebar.
* `<main id="main-content" role="main">`: Primary operational canvas.
* `<aside role="complementary" aria-label="Real-time Risk and Recommendations">`: Intelligence sidebar.
* `<footer role="contentinfo">`: Page footer and system status strip.
* `<section aria-labelledby="heading-id">`: Content groupings with accessible headings.

---

## 5. Accessible Chart Data Architecture

Visual charts can be opaque to screen readers. RenewableIQ provides structured alternative representations for all chart visualizers:

```tsx
<figure 
  role="region" 
  aria-labelledby="chart-title" 
  tabIndex={0}
  aria-describedby="chart-summary"
>
  <div id="chart-title" className="text-sm font-semibold">
    72-Hour Continuous Generation Forecast
  </div>
  <p id="chart-summary" className="sr-only">
    Line chart displaying generation trajectory over the next 72 hours for Desert Sun IV.
    Expected peak generation is 108.6 Megawatts at 13:45 UTC tomorrow.
    A critical ramp-down event is forecasted between 18:00 and 19:30 UTC today.
  </p>

  {/* Visual SVG Chart */}
  <EnergyLineChart data={forecastPoints} aria-hidden="true" />

  {/* Accessible Tabular Fallback for Screen Readers */}
  <div className="sr-only">
    <table>
      <caption>Hourly Generation Forecast Data</caption>
      <thead>
        <tr>
          <th scope="col">Timestamp (UTC)</th>
          <th scope="col">Expected Generation (MW)</th>
          <th scope="col">Lower Bound P10 (MW)</th>
          <th scope="col">Upper Bound P90 (MW)</th>
        </tr>
      </thead>
      <tbody>
        {forecastPoints.map((pt) => (
          <tr key={pt.timestamp}>
            <td>{pt.timestamp}</td>
            <td>{pt.predictedMw}</td>
            <td>{pt.p10Mw}</td>
            <td>{pt.p90Mw}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</figure>
```

---

## 6. Real-Time ARIA Live Regions

To ensure operators relying on screen readers receive immediate hazard awareness:
* **Non-Critical Telemetry Updates:** Handled with `aria-live="polite"` (e.g., minute-by-minute solar GHI fluctuations).
* **Critical Grid Ramp Alarms:** Handled with `aria-live="assertive"` and `role="alert"`, interrupting speech synthesizers immediately when a Level 4 or Level 5 hazard is detected.

---

## 7. Reduced Motion Support (`prefers-reduced-motion`)

The platform respects operating system preferences for reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
* On the landing page, GSAP scroll-pinning decouples into a clear, open stacked layout.
* Number cross-fades collapse to immediate value replacements.
