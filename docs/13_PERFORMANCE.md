# 13 — Performance Engineering & Resource Optimization

> **Document:** `docs/13_PERFORMANCE.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Performance Targets & Core Web Vitals Budgets

RenewableIQ is engineered to deliver immediate, sub-second responses even on low-bandwidth field cellular connections:

| Metric | Commercial Target | Hard Budget Limit | Measurement Protocol |
| :--- | :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | `< 1.2s` | `1.8s` | Fast 4G / 75th percentile |
| **Cumulative Layout Shift (CLS)** | `0.00` | `< 0.05` | Font loading + dynamic cards |
| **Interaction to Next Paint (INP)** | `< 80ms` | `120ms` | Slider dragging / tab switching |
| **First Contentful Paint (FCP)** | `< 0.8s` | `1.2s` | Server-rendered shell |
| **Initial JS Bundle Size** | `< 160 kB` | `220 kB` | Gzipped first load JS |

---

## 2. Server vs Client Component Architecture

Next.js App Router allows fine-grained separation of server rendering and client-side interactivity.

### 2.1 The Server Component Default Rule
All page wrappers, layout shells, markdown docs, and static data containers are **Server Components by default**. This eliminates React hydration overhead for over 60% of the DOM tree.

### 2.2 Client Component Quarantine (`'use client'`)
The `'use client'` directive is restricted exclusively to leaf nodes requiring:
1. Browser APIs (`window`, `localStorage`, `matchMedia`).
2. Interactive State Hooks (`useState`, `useReducer`).
3. Chart Canvas rendering (`recharts` SVG generation).
4. Motion & GSAP animations (`motion/react`, `@gsap/react`).

```
┌─────────────────────────────────────────────────────────────┐
│ [SERVER] Page Component (Fetches initial plant telemetry)   │
│ └── [SERVER] AppShell & Layout Containers                   │
│     ├── [SERVER] Static KPI Card Shell                      │
│     │   └── [CLIENT] Live Ticker Number Leaf (150ms fade)   │
│     └── [CLIENT] Dynamic Lazy-Loaded Chart Container        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Dynamic Imports & Lazy Loading Strategy

Heavy third-party libraries (Recharts, GSAP ScrollTrigger, Lenis) must **never** block the initial critical rendering path:

### 3.1 Dynamic Chart Loading with Loading Skeleton
```tsx
import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/feedback/chart-skeleton';

export const EnergyLineChart = dynamic(
  () => import('@/components/charts/energy-line-chart').then((mod) => mod.EnergyLineChart),
  {
    loading: () => <ChartSkeleton height="380px" />,
    ssr: false, // Prevents SVG hydration mismatches
  }
);
```

### 3.2 Dynamic Scroll Animation Loading (Landing Page)
```tsx
export const PipelineStory = dynamic(
  () => import('@/components/landing/pipeline-story').then((mod) => mod.PipelineStory),
  {
    loading: () => <div className="h-[600px] bg-surface rounded-lg animate-pulse" />,
    ssr: true,
  }
);
```

---

## 4. Time-Series Data Optimization & Memoization

A continuous 72-hour forecast sampled at 15-minute intervals contains **288 discrete data points** with multiple attributes (Actual, Predicted, P10, P90, GHI, Temp, Cloud Cover).

### 4.1 Memoized Data Transformations
Expensive mathematical transformations (e.g., computing ramp rates or running averages) must be wrapped in `useMemo`:

```tsx
const processedPoints = useMemo(() => {
  return rawPoints.map((pt, idx, arr) => {
    const prev = arr[idx - 1];
    const rampRate = prev ? ((pt.predictedMw - prev.predictedMw) / 0.25) : 0; // MW/hr
    return {
      ...pt,
      rampRate,
      isRampAlert: Math.abs(rampRate) > 25.0
    };
  });
}, [rawPoints]);
```

### 4.2 Throttled Slider Scrubbing (What-If Lab)
When an operator drags the cloud cover slider, chart recalculation must be throttled or debounced using `useDeferredValue` to prevent thread jank:

```tsx
const [cloudDelta, setCloudDelta] = useState(0);
const deferredCloudDelta = useDeferredValue(cloudDelta);

// Complex mathematical curve simulation evaluates with low priority
const simulatedCurve = useMemo(() => {
  return calculateScenarioShock(baselineCurve, deferredCloudDelta);
}, [baselineCurve, deferredCloudDelta]);
```

---

## 5. Image & Font Asset Rules

1. **Zero Unoptimized Raster Images:** All technical diagrams and brand assets use scalable SVG.
2. **Next.js Font Optimization:** `next/font/google` downloads Google Fonts at build time, eliminating external runtime requests to `fonts.googleapis.com`.
3. **No Unjustified 3D Runtimes:** Loading `three.js` or `@react-three/fiber` adds over **500 kB** of uncompressed JavaScript, destroying mobile LCP. 3D libraries remain strictly omitted unless a dedicated asset-level solar array visualizer is explicitly authorized.
