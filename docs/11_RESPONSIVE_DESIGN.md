# 11 — Responsive Design & Breakpoint Engineering

> **Document:** `docs/11_RESPONSIVE_DESIGN.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Responsive Philosophy: Intentional Adaptation Over Shrinking

RenewableIQ is designed intentionally across 5 distinct viewport classes. We do not simply scale down desktop elements; we transform layouts to preserve **operational density, touch ergonomics, and situational awareness** regardless of whether an operator is at a 3-monitor control console or inspecting field inverters on an iPad or mobile phone.

---

## 2. Breakpoint Matrix & Layout Configurations

| Breakpoint Key | Min-Width | Target Device Class | Primary Layout Behavior |
| :--- | :--- | :--- | :--- |
| **`2xl` (Wide)** | `1536px` | Dual/Triple Control Room Displays | Fixed sidebar, 1440px content container, maximum chart resolution. |
| **`xl` (Desktop)**| `1280px` | Standard Laptops / Workstations | 12-column grid, 8-col chart + 4-col intelligence sidebar. |
| **`lg` (Tablet L)**| `1024px` | iPad Pro Landscape, Compact Laptops | Collapsed icon-rail sidebar, stacked secondary metrics. |
| **`md` (Tablet P)**| `768px` | iPad Portrait, Tablets | Drawer navigation, single-column dashboard stack, 2x2 KPI grid. |
| **`sm` (Mobile)** | `390px` | Modern Smartphones (iPhone, Pixel) | Full-width vertical cards, touch-optimized tooltips, swipeable charts. |

---

## 3. Detailed Component Transformation Rules

### 3.1 Navigation Systems
* **Desktop (`≥ 1024px`):**
  - Left navigation sidebar permanently docked (`w-64` or `w-20` collapsed).
  - Top header displays live UTC/Local clocks, telemetry ticker, and full plant switcher dropdown.
* **Tablet / Mobile (`< 1024px`):**
  - Sidebar collapses into an accessible slide-over drawer triggered by a `Menu` button in the header.
  - Telemetry ticker compresses into a compact pulsing status dot (`● LIVE`).
  - Plant switcher transforms into a native touch modal selector.

### 3.2 Master Dashboard Grid
* **Desktop (`≥ 1280px`):**
  - Split Viewport: Left 66% dedicated to the 72-hour master forecast chart; Right 34% dedicated to the intelligence sidebar (Action card, active risks, weather ribbon).
* **Tablet (`768px – 1279px`):**
  - Full-width stacked layout: Forecast chart spans 100% width, followed immediately by a 2-column grid hosting the action card and risk ledger.
* **Mobile (`< 768px`):**
  - Strict vertical stack: KPI cards → Action card → Forecast chart → Risk feed → Weather ribbon.

### 3.3 KPI Metric Ribbon
* **`≥ 1280px`:** 4-column horizontal grid (`grid-cols-4 gap-6`).
* **`768px – 1279px`:** 2x2 grid (`grid-cols-2 gap-4`).
* **`< 768px`:** Single-column vertical stack (`grid-cols-1 gap-3`) or swipeable horizontal carousel with snap alignment.

### 3.4 Data Charts & Time-Series Visualizations
* **Chart Heights:**
  - Desktop: `380px – 440px`.
  - Tablet: `320px`.
  - Mobile: `260px` (ensuring the user can view the chart and immediate context without losing page position).
* **Axis Ticks & Labels:**
  - Desktop: Hourly ticks with detailed dates (`00:00`, `04:00`, `08:00`, `12:00`...).
  - Mobile: Filtered to major 12-hour intervals (`Day 1`, `Day 2`, `Day 3`) to prevent overlapping text collisions.
* **Touch Crosshair Interaction:**
  - Desktop: Real-time mouse hover tracking.
  - Mobile: Tap-and-drag scrubbing with haptic feedback (where supported) and floating sticky tooltip header above the canvas.

### 3.5 High-Density Data Tables
* **Desktop (`≥ 1024px`):** Full 8-column table (Timestamp, Actual MW, Forecast MW, P10, P90, Delta %, Weather Index, Dispatch Status).
* **Mobile (`< 1024px`):** 
  - Responsive Card Transformation: Each table row converts into a compact data card displaying key values with expandable details on tap.
  - Alternative: Horizontally scrollable container with a sticky first column (`Timestamp` pinned).

### 3.6 What-If Scenario Sandbox Controls
* **Desktop:** Parameter sliders arranged in a persistent left panel; live synchronized difference chart on the right.
* **Mobile:** Parameter controls positioned in an expandable bottom drawer (`<Sheet />`), allowing operators to adjust sliders while viewing the chart delta above.

---

## 4. Touch Target & Ergonomic Standards

* **Minimum Interactive Touch Target:** `44px x 44px` on all mobile viewports (buttons, tab items, dropdown items, chart zoom controls).
* **Thumb-Zone Placement:** Critical dispatch actions (e.g., `Acknowledge Risk`, `Dispatch BESS`) on mobile devices are placed within the bottom ergonomic reach zone.
* **Font Legibility Minimum:** No mobile UI text falls below `12px` (`0.75rem`), with high contrast maintained.
