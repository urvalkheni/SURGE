# 03 — Design System Specifications & Visual Primitives

> **Document:** `docs/03_DESIGN_SYSTEM.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Design Direction: Light-First Industrial Energy-Tech

RenewableIQ implements an unapologetically **light-first**, editorial-grade design system tailored for commercial energy analytics. 

Control rooms, utility desks, and asset management offices operate in brightly lit environments where dark-mode interfaces often produce glare, eye fatigue, and reduced chart legibility across multi-series time plots. RenewableIQ uses an engineered, soft-slate off-white canvas (`#F7F8F5`) paired with pure white data cards (`#FFFFFF`), hairline structural dividers (`#E3E8E3`), and high-contrast deep forest typography (`#17211B`).

---

## 2. Layout Grid & Spatial Rhythm

### 2.1 The 4px Spatial Scale
All margins, paddings, gaps, and dimensions strictly conform to a 4px mathematical scale. Arbitrary values (e.g., `13px`, `19px`, `27px`) are banned.

| Token | Pixels | Rem Equivalent | Primary Application |
| :--- | :--- | :--- | :--- |
| `space-1` | `4px` | `0.25rem` | Micro-gaps between badge icon and text, compact table padding. |
| `space-2` | `8px` | `0.5rem` | Input internal vertical padding, icon-to-label spacing in buttons. |
| `space-3` | `12px` | `0.75rem` | Card internal micro-padding, list item gaps, small toolbar spacing. |
| `space-4` | `16px` | `1.0rem` | Standard card internal padding, form input field gaps. |
| `space-6` | `24px` | `1.5rem` | Layout grid gutters, dashboard card gaps, section separations. |
| `space-8` | `32px` | `2.0rem` | Large card padding, page header margins, modal inner padding. |
| `space-12` | `48px` | `3.0rem` | Landing page section padding, dashboard block dividers. |
| `space-16` | `64px` | `4.0rem` | Landing page major story block transitions. |
| `space-24` | `96px` | `6.0rem` | Landing page hero and final CTA vertical padding. |

### 2.2 Container Constraints & Grid Breakpoints
* **Maximum Layout Width:** `1440px` (`max-w-7xl` with horizontal padding `px-4 sm:px-6 lg:px-8`).
* **Desktop Grid:** 12-column fluid grid, `24px` gutters (`gap-6`).
* **Tablet Grid (768px – 1023px):** 8-column fluid grid, `16px` gutters (`gap-4`).
* **Mobile Grid (360px – 767px):** 4-column fluid grid, `12px` gutters (`gap-3`).

---

## 3. Surface Elevation & Structural Dividers

### 3.1 Border-First Architecture
In accordance with industrial dashboard best practices, RenewableIQ uses **borders over drop shadows** to define visual hierarchy. Heavy blurred shadows create perceptual ambiguity and unanchored UI elements; hairline borders provide clean, crisp containment for complex numerical data.

* **Default Container Border:** `1px solid var(--border)` (`#E3E8E3`).
* **Active / Focused Border:** `1px solid var(--primary)` (`#167A4A`).
* **Alert / Warning Border:** `1px solid var(--warning)` (`#C98216`).
* **Critical / Danger Border:** `1px solid var(--danger)` (`#C94A4A`).

### 3.2 Shadow Tokens (Subtle & Restrained)
```css
--shadow-none: none;
--shadow-subtle: 0 1px 2px 0 rgba(23, 33, 27, 0.04);
--shadow-card: 0 1px 3px 0 rgba(23, 33, 27, 0.05), 0 1px 2px -1px rgba(23, 33, 27, 0.03);
--shadow-elevated: 0 4px 6px -1px rgba(23, 33, 27, 0.06), 0 2px 4px -2px rgba(23, 33, 27, 0.04);
--shadow-modal: 0 12px 24px -4px rgba(23, 33, 27, 0.10);
```

---

## 4. Border Radius Primitives

RenewableIQ avoids hyper-rounded pills or playful circular cards. A restrained, medium corner radius is applied systematically:

* `rounded-xs` (`2px`): Sub-chart indicator lines, mini progress bar ticks.
* `rounded-sm` (`4px`): Status badges, table cells, metric delta pills, tags.
* `rounded-md` (`6px`): Buttons, form inputs, select dropdown triggers, tooltips.
* `rounded-lg` (`8px`): Standard dashboard cards, chart panels, metric cards, table containers.
* `rounded-xl` (`12px`): Modal dialogs, drawer panels, landing page feature showcase containers.
* `rounded-full` (`9999px`): Reserved strictly for circular avatar initials and status pulse dots.

---

## 5. UI Component Primitives

### 5.1 Buttons (`<Button />`)
* **Primary:** Dark industrial green background (`#0D4F32`), white text (`#FFFFFF`), subtle hover transition to `#167A4A`, active press scale `0.98`. Focus ring: `2px solid #167A4A` with 2px offset.
* **Secondary:** Pure white background (`#FFFFFF`), hairline border (`#E3E8E3`), dark forest text (`#17211B`), hover background `#F7F8F5`.
* **Destructive / Alert Action:** Crimson outline or crimson solid for emergency plant shut-off / disconnect dispatches.
* **Ghost / Icon-Only:** Transparent background, muted icon (`#66736A`), hover background `#E8F5ED` with green icon highlight.

### 5.2 Status & Metric Badges (`<Badge />`)
Badges must never rely solely on color. Every badge features a semantic icon + uppercase/capitalized text label:

| Status Variant | Background Token | Text Token | Border Token | Required Icon | Example Text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Normal / Nominal** | `#E8F5ED` | `#0D4F32` | `#BCE3CA` | `CheckCircle2` | `NOMINAL` |
| **Warning / Ramp Alert** | `#FDF6EC` | `#8C570A` | `#F5D6A4` | `AlertTriangle` | `RAMP RISK: 24%` |
| **Critical Anomaly** | `#FDF2F2` | `#9B2C2C` | `#F8B4B4` | `AlertOctagon` | `UNDERGEN: -18 MW` |
| **Informational / Sync** | `#EFF6FB` | `#1E4E73` | `#B9D7EA` | `Info` | `SCADA SYNCED` |

### 5.3 Data Cards (`<Card />`)
* Base background `#FFFFFF`, border `1px solid #E3E8E3`, border-radius `8px`, padding `16px` or `24px`.
* Header pattern: Title (`font-display font-semibold text-sm tracking-tight text-foreground`) + optional status badge / action icon.
* Body: Metric hero value (`font-sans font-bold tabular-nums text-2xl lg:text-3xl tracking-tight text-foreground`) + sub-label with trend delta pill.

### 5.4 Data Tables (`<DataTable />`)
* Sticky header with subtle border-bottom `1px solid #E3E8E3` and light slate wash `#F7F8F5`.
* Header typography: `font-display font-medium text-xs uppercase tracking-wider text-muted-foreground`.
* Row hover state: `bg-[#F7F8F5] transition-colors duration-150`.
* Cell padding: `py-3 px-4`, numerical cells right-aligned with `tabular-nums`.

---

## 6. Iconography Rules (Lucide React)

Icons are strictly functional and informative. They must never be used as random background floating decorations.
* **Stroke Width:** Uniform `1.75px` across all sizes for a balanced, engineered technical weight.
* **Size Hierarchy:**
  - `14px` (`size-3.5`): Table inline badges, delta arrows.
  - `16px` (`size-4`): Buttons, input adornments, standard badges.
  - `20px` (`size-5`): Navigation links, card header icons.
  - `24px` (`size-6`): Primary section headers, modal banners.
* **Approved Functional Core:**
  `Sun`, `Cloud`, `CloudRain`, `Wind`, `Battery`, `BatteryCharging`, `Zap`, `TrendingUp`, `TrendingDown`, `Activity`, `AlertTriangle`, `AlertOctagon`, `ShieldCheck`, `Layers`, `SlidersHorizontal`, `ArrowRight`, `ChevronRight`, `Download`, `RefreshCw`.
