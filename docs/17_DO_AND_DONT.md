# 17 — Visual & Architectural DOs and DON'Ts

> **Document:** `docs/17_DO_AND_DONT.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Visual & Aesthetic Principles

| DO | DON'T |
| :--- | :--- |
| **DO** use an engineered, light-first palette (`#F7F8F5` canvas, `#FFFFFF` cards, `#17211B` text). | **DON'T** use dark purple, violet, or cyan "crypto / consumer AI" themes. |
| **DO** rely on hairline structural borders (`#E3E8E3`) to define containers. | **DON'T** use heavy blurred drop shadows (`box-shadow: 0 20px...`) that float unanchored. |
| **DO** use purposeful whitespace (4px spatial scale) to establish clean information hierarchy. | **DON'T** clutter the viewport with decorative background cards, colored pills, or badges that convey no data. |
| **DO** employ subtle, restrained corner radiuses (`6px` for buttons, `8px` for cards). | **DON'T** make every element hyper-rounded or pill-shaped (`rounded-full`, `rounded-3xl`). |
| **DO** use tabular lining numerals (`tabular-nums`) for all telemetry metrics and tables. | **DON'T** use proportional numbers that wobble or shift alignment as figures update. |
| **DO** pair Manrope (Display/Headings) with Inter (UI/Body/Data). | **DON'T** introduce third-party display fonts, serif styles, or script fonts. |

---

## 2. Animation & Interaction Principles

| DO | DON'T |
| :--- | :--- |
| **DO** use animation strictly to clarify state transitions (150ms hover, 250ms modal). | **DON'T** animate every card, button, and badge on page load with bouncing entrances. |
| **DO** use GSAP ScrollTrigger to tell a disciplined 5-stage story (*Weather → Forecast → Risk → Action → Impact*). | **DON'T** create endless scrolling parallax that traps the user or delays reaching product content. |
| **DO** respect `prefers-reduced-motion` by immediately collapsing durations to `0ms`. | **DON'T** ignore user system preferences or hijack native browser touch scrolling. |
| **DO** reserve Framer Motion for UI state transitions and GSAP for pinned landing sections. | **DON'T** mix multiple physics and animation libraries on the same component. |

---

## 3. Data Visualization & Charting Principles

| DO | DON'T |
| :--- | :--- |
| **DO** keep the primary forecast curve visually dominant in deep emerald (`#167A4A`, 2.5px). | **DON'T** render 7 competing neon rainbow lines on a single chart canvas. |
| **DO** render the \(P_{10} \dots P_{90}\) confidence band with subtle transparency (`rgba(22, 122, 74, 0.08)`). | **DON'T** use opaque or heavily patterned fills that obscure historical actuals or gridlines. |
| **DO** provide high-density tooltips with exact timestamps, MW values, and delta percentages. | **DON'T** show generic tooltips that only display a single unformatted float. |
| **DO** annotate critical ramp-down and curtailment risks directly on the time axis. | **DON'T** leave operators guessing why an anomaly alert occurred. |

---

## 4. Frontend Engineering & Architecture Principles

| DO | DON'T |
| :--- | :--- |
| **DO** build components against explicit TypeScript interfaces in `src/types/`. | **DON'T** use `any` types or inline unverified API payload shapes. |
| **DO** implement deterministic demo fallback data in `src/data/demo-data.ts`. | **DON'T** let the entire platform crash or display blank screens if the backend API is offline. |
| **DO** lazy-load heavy chart components using `next/dynamic` with loading skeletons. | **DON'T** block the critical server rendering path with massive client-side bundles. |
| **DO** keep layouts and static content as Next.js Server Components. | **DON'T** add `'use client'` at the top of every single file without justification. |
| **DO** ensure all interactive elements pass WCAG 2.1 AA keyboard and contrast tests. | **DON'T** use color as the sole indicator of hazard status. |
