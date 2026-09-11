# 09 — Animation System & Motion Tokens

> **Document:** `docs/09_ANIMATION_SYSTEM.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Animation Philosophy & Strict Library Ownership

In an industrial energy-tech platform, animation exists exclusively to:
1. **Clarify State Changes:** Confirming a SCADA dispatch acknowledgment or modal dismiss.
2. **Guide Focus During Critical Alerts:** Subtly directing operator attention to an emerging ramp hazard.
3. **Power Narrative Understanding on the Landing Page:** Explaining the 5-stage transformation from meteorological cloud physics to grid dispatch.

Animation **NEVER** exists for decorative novelty. There are no bouncing buttons, floating spheres, continuous pulsing cards, or gratuitous 3D rotations.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      ANIMATION LIBRARY GOVERNANCE                      │
├──────────────────┬─────────────────────────────────────────────────────┤
│ Library          │ Strict Ownership Boundary                           │
├──────────────────┼─────────────────────────────────────────────────────┤
│ Motion           │ • Standard UI transitions (modals, drawers, tabs)   │
│ (motion/react)   │ • Component entrances & staggered list reveals       │
│                  │ • Button press micro-interactions & dropdown opens  │
├──────────────────┼─────────────────────────────────────────────────────┤
│ GSAP +           │ • Pinned landing page storytelling (Section 07)     │
│ @gsap/react      │ • Complex synchronized multi-stage timeline reveals │
│                  │ • Scroll-linked scrubbing of forecast curves        │
├──────────────────┼─────────────────────────────────────────────────────┤
│ React Spring     │ • RESTRICTED: Used ONLY for physics-based slider    │
│                  │   drag kinetics if standard CSS transforms fail     │
├──────────────────┼─────────────────────────────────────────────────────┤
│ Lottie           │ • RESTRICTED: Used ONLY for a single lightweight    │
│                  │   illustrative solar/wind asset telemetry check     │
└──────────────────┴─────────────────────────────────────────────────────┘
```

---

## 2. Motion Duration Tokens & Timing Scale

Every duration is standardized to prevent erratic, disconnected speeds:

| Token Name | Value | Purpose & Application |
| :--- | :--- | :--- |
| `duration-instant` | `50ms` | Immediate feedback: Checkbox toggles, radio buttons, active tab clicks. |
| `duration-fast` | `150ms` | Micro-interactions: Tooltip appearance, button hover states, row highlight. |
| `duration-normal` | `250ms` | Standard UI: Modal backdrop fade, drawer slide-out, dropdown menus. |
| `duration-slow` | `450ms` | Structural transitions: Page tab view shifts, chart series filtering. |
| `duration-dramatic`| `750ms` | Hero section load entrance, landing page narrative step transition. |

---

## 3. Easing Curves & Mathematical Bezier Profiles

All animations utilize calibrated cubic-bezier curves that emulate physical mass with damped deceleration:

```css
/* Standard cubic-bezier easing tokens */
--ease-out-editorial: cubic-bezier(0.16, 1, 0.3, 1);    /* Rapid onset, graceful settle */
--ease-in-out-smooth: cubic-bezier(0.65, 0, 0.35, 1);   /* Balanced layout transitions */
--ease-sharp:         cubic-bezier(0.4, 0, 0.2, 1);     /* High-efficiency UI dismiss */
--ease-linear:        linear;                           /* Constant-velocity time sweeps */
```

* **Entering Elements:** Always use `--ease-out-editorial`. The element arrives quickly to respect user time, then gently settles into position.
* **Exiting Elements:** Always use `--ease-sharp`. Elements dismiss rapidly without lagging on screen.
* **Layout Morphs:** Use `--ease-in-out-smooth` for fluid card resizing and grid rearrangement.

---

## 4. Reusable Motion Presets (Motion / React)

Standardized motion variants exported from `src/animations/presets.ts`:

### 4.1 `fadeIn`
```ts
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } 
  }
};
```

### 4.2 `fadeUp` (Primary Content Entrance)
```ts
export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
  }
};
```

### 4.3 `staggerChildren` (Metric & Card Containers)
```ts
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};
```

### 4.4 `scaleIn` (Modals & Alert Badges)
```ts
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.97, 
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } 
  }
};
```

---

## 5. GSAP ScrollTrigger Architecture (Landing Page)

For the pinned narrative section (*Section 07: The 5-Stage Intelligence Pipeline*), GSAP is orchestrated via `@gsap/react`:

```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function PipelineStory() {
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#pipeline-container',
        start: 'top top',
        end: '+=2500',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1
      }
    });

    // Step 1: Weather alert illuminates
    tl.to('#step-weather', { opacity: 1, y: 0, duration: 1 })
      // Step 2: Forecast curve recalculates
      .to('#step-forecast', { opacity: 1, y: 0, duration: 1 }, '+=0.5')
      // Step 3: Risk tag fires
      .to('#step-risk', { opacity: 1, y: 0, duration: 1 }, '+=0.5')
      // Step 4: Action card deploys
      .to('#step-action', { opacity: 1, y: 0, duration: 1 }, '+=0.5')
      // Step 5: Financial impact badge calculates
      .to('#step-impact', { opacity: 1, y: 0, duration: 1 }, '+=0.5');
  }, { scope: '#pipeline-container' });

  return <section id="pipeline-container">...</section>;
}
```

---

## 6. Accessibility Override (`prefers-reduced-motion`)

Whenever a user enables system-level reduced motion preferences:
1. All `duration` values automatically collapse to `0ms`.
2. All `y` and `scale` offsets collapse to `0`.
3. GSAP ScrollTrigger timelines decouple from scroll scrub and render in an open, stacked static vertical card layout.
4. Data remains 100% accessible, legible, and functional.
