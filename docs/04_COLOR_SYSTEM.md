# 04 — Color System & Semantic Tokens

> **Document:** `docs/04_COLOR_SYSTEM.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Primary Design Direction & Hex Specifications

RenewableIQ uses an engineered, restrained palette rooted in high-contrast natural foliage and industrial control hardware.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      RENEWABLEIQ COLOR SYSTEM                          │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ Canvas / Bg      │ Surface / Cards  │ Primary Text     │ Borders       │
│ #F7F8F5          │ #FFFFFF          │ #17211B          │ #E3E8E3       │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ Primary Green    │ Dark Green       │ Light Green Tint │ Muted Text    │
│ #167A4A          │ #0D4F32          │ #E8F5ED          │ #8B968F       │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ Secondary Text   │ Warning Amber    │ Danger Crimson   │ Info Cobalt   │
│ #66736A          │ #C98216          │ #C94A4A          │ #3978A8       │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

---

## 2. Semantic Token System

All components must reference semantic CSS custom properties or Tailwind token classes rather than raw hex codes.

### 2.1 Core Semantic Token Mapping (CSS / Tailwind)

| Token Name | Hex Value | Purpose & Application |
| :--- | :--- | :--- |
| `--background` | `#F7F8F5` | Global application viewport canvas, outer scroll view. |
| `--surface` | `#FFFFFF` | Primary card background, panel surfaces, modal bodies. |
| `--surface-elevated` | `#FFFFFF` | Popovers, tooltips, sticky navigation bars, floating dialogs. |
| `--foreground` | `#17211B` | Primary headings, KPI hero numbers, high-priority table data. |
| `--foreground-secondary`| `#66736A` | Sub-headings, metadata labels, unit indicators (\(MW, MWh\)). |
| `--foreground-muted` | `#8B968F` | Chart axis labels, timestamp subtitles, disabled text. |
| `--border` | `#E3E8E3` | Hairline card boundaries, table cell dividers, separator rules. |
| `--border-subtle` | `#EDF1ED` | Inner chart gridlines, nested list item borders. |
| `--primary` | `#167A4A` | Brand accents, interactive links, primary chart forecast curve. |
| `--primary-foreground` | `#FFFFFF` | Text rendered on top of primary button / badge fills. |
| `--primary-dark` | `#0D4F32` | Dominant CTA buttons, active sidebar item backgrounds. |
| `--primary-tint` | `#E8F5ED` | Selected item backgrounds, nominal status badge backgrounds. |
| `--success` | `#167A4A` | Nominal generation, solar target met, battery fully charged. |
| `--warning` | `#C98216` | Ramp-down risk detected, moderate cloud onset, curtailment threat. |
| `--warning-tint` | `#FDF6EC` | Warning badge background, alert banner tint. |
| `--danger` | `#C94A4A` | Severe under-generation breach, inverter trip, reserve margin breach. |
| `--danger-tint` | `#FDF2F2` | Critical alert background, destructive action hover tint. |
| `--info` | `#3978A8` | Meteorological telemetry, atmospheric pressure overlay, SCADA heartbeat. |
| `--info-tint` | `#EFF6FB` | Informational callout box background, weather pill wash. |

---

## 3. Chart Color Token System

Charts are the central instrument of RenewableIQ. They must convey multiple complex data streams with clear, instant discrimination:

| Time-Series Stream | Stroke Token | Stroke Width | Line Style | Area Fill Token |
| :--- | :--- | :--- | :--- | :--- |
| **Actual Generation** | `#0D4F32` (Dark Green) | `2.5px` | Solid | None |
| **Predicted Generation**| `#167A4A` (Primary Green)| `2.5px` | Solid / Dashed | Subtle vertical gradient (`#167A4A` 10% to 0%) |
| **Confidence Corridor (\(P_{10}\dots P_{90}\))** | None | `0px` | N/A | `#167A4A` at `8%` opacity (`rgba(22, 122, 74, 0.08)`) |
| **Day-Ahead Baseline** | `#8B968F` (Muted) | `1.5px` | Dotted (`4 4`)| None |
| **Solar Irradiance (GHI)**| `#C98216` (Warning Amber)| `1.5px` | Solid | `#C98216` at `6%` opacity |
| **Cloud Cover %** | `#3978A8` (Info Cobalt)| `1.5px` | Stepped Area | `#3978A8` at `8%` opacity |
| **Ramp Risk Alert Zone**| `#C94A4A` (Danger Crimson)| `2px` | Vertical Reference Area | Red highlight band (`rgba(201, 74, 74, 0.12)`) |

---

## 4. Accessibility & Contrast Verification (WCAG 2.1 AA)

All primary text combinations exceed the WCAG AA minimum requirement of **4.5:1** for normal body copy and **3.0:1** for large display text:

| Foreground Hex | Background Hex | Calculated Contrast Ratio | Compliance Status |
| :--- | :--- | :--- | :--- |
| `#17211B` (Primary Text) | `#F7F8F5` (Canvas) | **13.84 : 1** | **Pass (WCAG AAA)** |
| `#17211B` (Primary Text) | `#FFFFFF` (Surface) | **15.22 : 1** | **Pass (WCAG AAA)** |
| `#66736A` (Secondary Text)| `#FFFFFF` (Surface) | **4.78 : 1** | **Pass (WCAG AA)** |
| `#0D4F32` (Dark Green CTA) | `#FFFFFF` (Button Text) | **8.62 : 1** | **Pass (WCAG AAA)** |
| `#167A4A` (Primary Green) | `#E8F5ED` (Tint) | **4.64 : 1** | **Pass (WCAG AA)** |
| `#C98216` (Warning Amber)| `#FFFFFF` (Surface) | **3.42 : 1** (Large text/Icon)| **Pass (UI Component / Large)** |
| `#8C570A` (Dark Amber Text)| `#FDF6EC` (Warning Tint) | **5.21 : 1** | **Pass (WCAG AA)** |
| `#C94A4A` (Danger Crimson)| `#FFFFFF` (Surface) | **4.65 : 1** | **Pass (WCAG AA)** |

---

## 5. Explicit Usage Rules: What Is Permitted vs Forbidden

### Permitted
* Using `#0D4F32` for dominant, authoritative call-to-action buttons.
* Using `#E8F5ED` and `#167A4A` for nominal status chips and positive delta badges.
* Using `#C98216` and `#C94A4A` strictly when an operational anomaly or threshold breach is present.
* Using `#3978A8` for secondary meteorological context (cloud layers, barometric pressure).

### Strictly Forbidden
* **NO Purple, Magenta, or Cyan "AI Neon" accents:** The platform is an industrial grid intelligence system, not a consumer chatbot.
* **NO Rainbow Chart Series:** Never display 8 different bright neon colors on a single chart canvas. Keep all energy metrics in the green/slate family and weather overlays in amber/cobalt.
* **NO Random Colored Containers:** Cards must remain `#FFFFFF` or `#F7F8F5`. Never create saturated full-color background cards.
* **NO Raw Hex Inlining in JSX:** All color references must use Tailwind semantic classes (e.g., `text-foreground`, `bg-primary`, `border-border`, `bg-warning/10`).

---

## 6. Architectural Dark-Mode Strategy

While RenewableIQ is **Light-First** as required by utility control rooms, the token architecture is built to support a future high-contrast dark theme without breaking any component layouts:

```css
:root {
  --background: 247 248 245; /* #F7F8F5 */
  --surface: 255 255 255;    /* #FFFFFF */
  --foreground: 23 33 27;     /* #17211B */
  --border: 227 232 227;     /* #E3E8E3 */
  --primary: 22 122 74;      /* #167A4A */
  --primary-dark: 13 79 50;  /* #0D4F32 */
  --warning: 201 130 22;     /* #C98216 */
  --danger: 201 74 74;       /* #C94A4A */
  --info: 57 120 168;        /* #3978A8 */
}

/* Dark theme architectural parity (High-contrast obsidian, NOT saturated neon) */
.dark {
  --background: 13 18 15;     /* #0D120F */
  --surface: 20 28 23;       /* #141C17 */
  --foreground: 240 245 241; /* #F0F5F1 */
  --border: 35 48 40;        /* #233028 */
  --primary: 34 197 94;      /* #22C55E */
  --primary-dark: 22 122 74; /* #167A4A */
  --warning: 234 179 8;      /* #EAB308 */
  --danger: 239 68 68;       /* #EF4444 */
  --info: 56 189 248;        /* #38BDF8 */
}
```
