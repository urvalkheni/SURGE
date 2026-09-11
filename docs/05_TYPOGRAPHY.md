# 05 — Typography System & Numerical Data Styling

> **Document:** `docs/05_TYPOGRAPHY.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Font Family Pairing Strategy

RenewableIQ uses a dual-typeface strategy engineered for technical clarity, editorial authority, and extreme data density:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TYPOGRAPHIC HIERARCHY                           │
├───────────────────────────────────┬────────────────────────────────────┤
│ DISPLAY & HEADINGS                │ UI, BODY & NUMERICAL TELEMETRY     │
│ Manrope                           │ Inter                              │
│ • Geometric sans-serif            │ • Neutral neo-grotesque            │
│ • Engineered structure            │ • Micro-scale legibility           │
│ • High-impact editorial presence  │ • Advanced OpenType tabular nums   │
│ • Used for H1-H3, Hero, Section   │ • Used for cards, tables, inputs,  │
│   titles, and major metric labels │   charts, and telemetry feeds      │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Complete Typographic Scale & Token Specifications

| Token Name | Font Family | Size (px / rem) | Line Height | Weight | Letter Spacing | Primary Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display XL** | Manrope | `64px / 4.0rem` | `1.1 (70px)` | Bold (700) | `-0.03em` | Landing page hero headline. |
| **Display L** | Manrope | `48px / 3.0rem` | `1.15 (56px)`| Bold (700) | `-0.025em`| Landing section heroes, major narrative headers. |
| **Heading 1** | Manrope | `36px / 2.25rem`| `1.2 (44px)` | SemiBold (600)| `-0.02em` | Major page titles (Dashboard, Forecast, Scenarios). |
| **Heading 2** | Manrope | `28px / 1.75rem`| `1.3 (36px)` | SemiBold (600)| `-0.015em`| Card group titles, modal headers, subsection headers. |
| **Heading 3** | Manrope | `20px / 1.25rem`| `1.4 (28px)` | SemiBold (600)| `-0.01em` | Standard card titles, drawer headers, widget titles. |
| **Body Large** | Inter | `18px / 1.125rem`| `1.55 (28px)`| Regular (400)| `-0.005em`| Landing hero subcopy, lead paragraphs. |
| **Body Regular**| Inter | `16px / 1.0rem` | `1.5 (24px)` | Regular (400)| `0.0em` | Standard readable text, form field labels, dialogues. |
| **Body Small** | Inter | `14px / 0.875rem`| `1.45 (20px)`| Regular / Med | `0.0em` | Table data cells, secondary metadata, input help text. |
| **Caption** | Inter | `12px / 0.75rem` | `1.35 (16px)`| Medium (500) | `+0.01em` | Chart axis labels, timestamp footnotes, badge text. |
| **Overline** | Manrope | `11px / 0.6875rem`| `1.25 (14px)`| Bold (700) | `+0.08em` | Category tags, uppercase section eyebrows. |

---

## 3. Mission-Critical Numerical & Stat Typography

Because RenewableIQ is an energy telemetry platform, **numbers represent physical reality and economic value**. Numbers must never shift positions, wobble during live updates, or be ambiguous.

### 3.1 Tabular Lining Numerals Rule
All numerical readouts, telemetry metrics, table figures, and chart tooltips **MUST** use tabular lining figures (`font-variant-numeric: tabular-nums` or `tnum`).

```css
/* Core Tailwind utility class for metrics */
.tabular-stat {
  font-family: var(--font-sans), system-ui, sans-serif;
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" 1, "cv02" 1, "cv03" 1, "cv04" 1;
  letter-spacing: -0.02em;
}
```

### 3.2 Stat Scale Hierarchy

| Stat Token | Font Size | Weight | Line Height | Unit Styling | Example Render |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stat Giant** | `44px` (`text-4xl lg:text-5xl`)| Bold (700) | `1.0` | `text-lg font-medium text-foreground-secondary ml-1.5` | `108.4 MW` |
| **Stat Large** | `32px` (`text-3xl`) | Bold (700) | `1.1` | `text-sm font-medium text-foreground-secondary ml-1` | `3,420 MWh` |
| **Stat Medium**| `24px` (`text-2xl`) | SemiBold (600)| `1.2`| `text-xs font-normal text-muted-foreground ml-1` | `98.2 %` |
| **Stat Small** | `18px` (`text-lg`) | SemiBold (600)| `1.2`| `text-xs font-normal text-muted-foreground ml-0.5` | `+$14,280` |

---

## 4. Engineering Units & Number Formatting Standards

1. **Power vs Energy Distinction:**
   - Instantaneous Capacity / Generation: **MW** or **kW** (Capitalized). Example: `84.2 MW`.
   - Cumulative Yield / Storage Capacity: **MWh** or **kWh**. Example: `1,240.5 MWh`.
2. **Precision & Decimal Places:**
   - Plant Capacity / Forecast Output: **1 decimal place** (`104.2 MW`).
   - Percentages / Inverter Availability: **1 decimal place** (`98.4%`).
   - Financial Values: **No decimal places for >$1,000**, with comma separators (`$24,500`).
   - Irradiance (GHI / DNI): **Whole integer** (`845 W/m²`).
3. **Temporal Formatting:**
   - Continuous 24-hour UTC or local time: `HH:mm` (e.g., `18:45 UTC`).
   - Date + Time: `MMM DD, YYYY · HH:mm` (e.g., `Sep 14, 2026 · 14:00 UTC`).

---

## 5. Web Font Loading & Performance Rules

To prevent Cumulative Layout Shift (CLS) during page load:
* Use `next/font/google` with `display: 'swap'`.
* Pre-define CSS variable fallbacks with matched metric overrides:
```ts
// src/app/layout.tsx configuration
import { Inter, Manrope } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  axes: ['opsz'],
});

export const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});
```
