# 16 — Team Development Rules & Engineering Contracts

> **Document:** `docs/16_DEVELOPMENT_RULES.md`  
> **Parent Architecture:** [UI_UX_MASTER_PLAN.md](file:///home/ommistry223/DAIICT/docs/UI_UX_MASTER_PLAN.md)  
> **Status:** Approved Baseline  

---

## 1. Two-Developer Team Division of Responsibilities

To achieve commercial-grade velocity during high-intensity hackathon development, work is decoupled across two autonomous domains:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TWO-DEVELOPER BOUNDARY ARCHITECTURE                  │
├───────────────────────────────────┬────────────────────────────────────┤
│ DEVELOPER A: FRONTEND / UI / UX   │ DEVELOPER B: BACKEND / ML / API    │
│ • Design system tokens & CSS      │ • Python FastAPI / Flask service   │
│ • Next.js App Router pages        │ • NWP ingestion (ECMWF, GFS, HRRR) │
│ • Recharts SVG visualizations     │ • ML ensemble forecast pipeline    │
│ • Framer Motion & GSAP animations │ • Ramp risk detection heuristics   │
│ • Component taxonomy & a11y       │ • BESS dispatch optimization logic │
│ • Local state & demo fallback     │ • REST & WebSocket API endpoints   │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. API Contract-First Development Protocol

Frontend development must **never** block on backend deployment. Both developers agree upon typed TypeScript schemas in `src/types/` before implementation:

### 2.1 The Contract Guarantee
1. Developer B guarantees that API endpoints output JSON matching the exact TypeScript interfaces in `src/types/energy.ts` and `src/types/risk.ts`.
2. Developer A constructs all UI components against these TypeScript interfaces using rich, deterministic mock datasets in `src/data/demo-data.ts`.
3. When Developer B delivers live API endpoints, Developer A simply toggles the API URL in `src/lib/api.ts` without modifying a single line of component JSX.

### 2.2 The Resilient Demo Mode Pattern
Every data hook implements an automatic fallback mechanism:
```ts
// Example: src/hooks/use-forecast.ts
export function useForecast(plantId: string, horizon: string) {
  const [data, setData] = useState<ForecastSummary>(demoForecastSummary);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/forecast?plantId=${plantId}&horizon=${horizon}`, {
          signal: AbortSignal.timeout(3000) // 3-second hard timeout
        });
        if (!response.ok) throw new Error('Backend offline');
        const liveData = await response.json();
        setData(liveData);
        setIsDemoMode(false);
      } catch (err) {
        // Transparent fallback to deterministic high-fidelity mock data
        console.warn('Backend unavailable, using RenewableIQ Demo Engine', err);
        setData(demoForecastSummary);
        setIsDemoMode(true);
      }
    }
    loadData();
  }, [plantId, horizon]);

  return { data, isDemoMode };
}
```

---

## 3. Strict Code Quality & TypeScript Rules

1. **No `any` Types:** All variables, props, and API payloads must have explicit TypeScript types.
2. **No Hardcoded Hex Values:** Color styling must use Tailwind semantic classes (`text-foreground`, `bg-primary`, `border-border`).
3. **No Unhandled Errors:** Every promise and async fetch must include user-facing feedback or fallback handling.
4. **No Console Spam:** Production builds must remove debug `console.log` statements.
5. **Linting Compliance:** All code must pass `npm run lint` without warnings.
