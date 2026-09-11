# 14 — Tech Stack & Dependency Governance

> **Document:** `docs/14_TECH_STACK.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Core Technical Foundations

RenewableIQ is constructed on a modern, high-performance TypeScript and React architecture optimized for data density and speed:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      RENEWABLEIQ TECHNOLOGY MATRIX                     │
├───────────────────┬───────────────────────────────┬────────────────────┤
│ Layer             │ Primary Selection             │ Justification      │
├───────────────────┼───────────────────────────────┼────────────────────┤
│ Application Engine│ Next.js 15+ (App Router)      │ Server Components, │
│                   │                               │ SSR, Fast Refresh  │
│ Language          │ TypeScript 5.x (Strict Mode)  │ Type-safe contracts│
│ Styling Engine    │ Tailwind CSS 3.4 / 4.x        │ Zero-runtime CSS,  │
│                   │                               │ design tokens      │
│ UI Primitives     │ Radix UI + shadcn/ui          │ Unstyled, fully a11y│
│ Class Utilities   │ clsx + tailwind-merge + CVA   │ Dynamic styling    │
│ Charting Engine   │ Recharts                      │ Composable SVG viz │
│ Motion Engine     │ Framer Motion (Motion)        │ Declarative UI anim│
│ Scroll Engine     │ GSAP 3.x + @gsap/react        │ Pinned storytelling│
│ Smooth Scroll     │ Lenis                         │ Inertial scrolling │
│ Iconography       │ Lucide React                  │ Tree-shakable icons│
└───────────────────┴───────────────────────────────┴────────────────────┘
```

---

## 2. Strict Dependency Justification Matrix

Every external package must satisfy four strict governance criteria:
1. **Clear Ownership:** Exactly one component or system module consumes it.
2. **No Duplication:** Does not replicate capabilities already provided by the core stack.
3. **Bundle Hygiene:** Gzip impact is justified by non-trivial UX or performance gains.
4. **Hackathon Feasibility:** Can be reliably implemented and demonstrated within time constraints.

| Package | Size (Gzip) | Responsible Module | Evaluation & Alternative Considered |
| :--- | :--- | :--- | :--- |
| `next` | Core | Application Shell | Standard Next.js framework; provides SSR, App Router, image/font optimization. |
| `react` / `react-dom` | Core | Component Engine | Core runtime. |
| `typescript` | Dev | Type Safety | Catches numerical mismatches and invalid telemetry structures at build time. |
| `tailwindcss` | Dev | Visual Design System | Pre-compiled utility classes. Zero runtime overhead. |
| `clsx` / `tailwind-merge`| ~2 kB | `src/lib/utils.ts` | Essential utility for conditionally combining and deduplicating Tailwind classes. |
| `class-variance-authority`| ~1.5 kB | `src/components/ui/*` | Standard pattern for type-safe button and badge variant management. |
| `@radix-ui/react-*` | Modular | UI Primitives | Provides robust, accessible primitives (Dialog, Tabs, Slider, Tooltip, Select). |
| `recharts` | ~45 kB | `src/components/charts/*` | Lightweight, battle-tested React charting library utilizing composable SVG paths. |
| `motion` | ~30 kB | UI Micro-interactions | Modern Motion engine (`motion/react`); handles component mount/unmount fades, modal scaling, and layout morphs. |
| `gsap` + `@gsap/react` | ~26 kB | Landing Page Scroll Story | Unrivaled performance for pinned multi-stage scroll animations with precise scrubbing. |
| `lenis` | ~4 kB | Landing Smooth Scroll | Normalizes inertial scroll speed across trackpads and mice without hijacking gestures. |
| `lucide-react` | Tree-shook | Entire Platform | Over 1,000 clean, consistent engineered SVG icons with customizable stroke width. |

---

## 3. Explicitly Omitted / Prohibited Dependencies

To prevent technical debt and bloated bundles, the following libraries are **banned**:

| Prohibited Library | Reason for Exclusion |
| :--- | :--- |
| **`three` / `@react-three/fiber` / `drei`** | Unjustified 500+ kB bundle overhead. A commercial energy dispatch platform requires 2D time-series charts, not spinning 3D globes. |
| **`chart.js` / `apexcharts` / `highcharts`** | Redundant with Recharts. Highcharts requires expensive commercial licensing; Chart.js canvas rendering lacks crisp DOM accessibility. |
| **`react-spring`** | Redundant with Framer Motion and GSAP. Adds duplicate physics runtime without need. |
| **`styled-components` / `emotion`** | Runtime CSS-in-JS causes substantial performance drops during real-time telemetry streaming and increases bundle size. |
| **Heavy UI Frameworks (Material UI, AntD)** | Imposes inflexible, generic aesthetics that clash with the custom industrial energy-tech design system. |

---

## 4. Node & Runtime Specifications

* **Node.js:** `>= 20.0.0` (LTS or Node 22.x).
* **Package Manager:** `npm` (v10+).
* **Module Resolution:** Bundler (ESNext).
