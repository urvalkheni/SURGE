# 19 — Repository Audit & Technical Baseline

> **Document:** `docs/19_REPOSITORY_AUDIT.md`  
> **Status:** Completed Phase 1 Baseline  
> **Date:** September 2026  

---

## 1. Executive Summary

This audit establishes the baseline inspection of the **RenewableIQ** repository prior to executing Phase 1 frontend foundations and engineering setup. The workspace contains the full architectural master documentation suite (19 documents) and foundational configuration files.

The goal of this audit is to evaluate package versions, verify directory hygiene, identify dependency deprecations or conflicts, and guarantee a smooth path to production-grade implementation.

---

## 2. Technical Stack Audit

| Component | Target Version | Current Configuration | Audit Evaluation |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | `next: 15.1.7` | ✅ **Modern & Correct:** Uses standard App Router conventions. |
| **Runtime** | React 19 | `react: ^19.0.0`, `react-dom: ^19.0.0` | ✅ **Up to date:** Requires modern packages compatible with React 19. |
| **Language** | TypeScript 5.x | `typescript: ^5.7.3` | ✅ **Strict:** Configured with `strict: true`, `@/*` path mapping. |
| **Styling** | Tailwind CSS 3.4+ | `tailwindcss: ^3.4.17` | ✅ **Token-bound:** Custom color tokens and font variables configured. |
| **PostCSS** | PostCSS 8 | `postcss: ^8.5.3` | ✅ **Valid:** Autoprefixer and Tailwind plugins enabled. |

---

## 3. Dependency Inventory & Hygiene Check

### 3.1 Unjustified or Deprecated Packages (Action Required)
1. **`framer-motion`**:
   - *Status:* Outdated. The Framer Motion library has transitioned to modern `motion`.
   - *Correction:* Remove `framer-motion` and install `motion` (`^12.x`). All React imports must strictly use `motion/react`.
2. **`lenis`**:
   - *Status:* Unjustified in Phase 1 foundation.
   - *Correction:* Remove from active `package.json` dependencies until the Landing Page Animation phase (Phase 5). Ensure deprecated `@studio-freight/react-lenis` is never referenced.
3. **Unused Radix Primitives**:
   - *Status:* `@radix-ui/react-select`, `@radix-ui/react-slider`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip` were pre-listed in `package.json`.
   - *Correction:* Only install Radix primitives when their specific UI components are implemented. For Phase 1 foundational UI, `@radix-ui/react-dialog` and `@radix-ui/react-dropdown-menu` are justified.

### 3.2 Required Additions
1. **`next-themes`**: Required for the light-first architectural theme provider.

---

## 4. Source Directory Audit (`src/`)

| Directory | Contents | Evaluation |
| :--- | :--- | :--- |
| `src/app/` | `globals.css` | ⚠️ **Needs Completion:** Missing `layout.tsx` and `page.tsx` required for Next.js build. |
| `src/animations/` | `presets.ts` | ⚠️ **Needs Modernization:** Update presets to type against `motion/react`. |
| `src/config/` | `tokens.ts`, `site.ts`, `navigation.ts`, `design.ts` | ✅ **Excellent:** Fully aligned with master design system tokens. |
| `src/data/` | `demo-data.ts` | ✅ **Deterministic:** High-fidelity 72h solar curve with zero random jitter. |
| `src/lib/` | `utils.ts`, `formatters.ts` | ✅ **Clean:** `cn()` utility and numerical/currency/time formatters ready. |
| `src/types/` | `energy.ts`, `weather.ts`, `risk.ts`, `recommendations.ts`, `scenarios.ts`, `plant.ts`, `index.ts` | ✅ **Strict:** Explicit, reusable domain contracts free of UI coupling. |
| `src/services/` | *Not yet created* | ⚠️ **Missing:** Needed for API client and domain service boundaries. |
| `src/providers/`| *Not yet created* | ⚠️ **Missing:** Needed for ThemeProvider and global React context. |
| `src/components/`| *Not yet created* | ⚠️ **Missing:** Foundational UI primitives (`Button`, `Badge`, `Card`, etc.) required. |

---

## 5. Summary of Actions for Phase 1

1. **Retain Without Modification:**
   - Design tokens in `src/config/tokens.ts` and `src/config/design.ts`.
   - Domain models in `src/types/*.ts`.
   - Deterministic procedural dataset in `src/data/demo-data.ts`.
   - Class merger and formatters in `src/lib/`.
2. **Correct & Update:**
   - `package.json`: Switch `framer-motion` to `motion`, add `next-themes`, prune unneeded dependencies.
   - `docs/`: Update any lingering references from `framer-motion` to `motion` (`motion/react`).
   - `src/animations/presets.ts`: Wire up with `motion/react`.
3. **Construct:**
   - `docs/00_PRD.md`: Full Product Requirements Document.
   - `src/services/api/client.ts` + domain mock service layers.
   - `src/providers/`: ThemeProvider and application provider wrapper.
   - `src/components/ui/` & `src/components/feedback/`: Foundational UI primitives and states.
   - `src/app/layout.tsx` & `src/app/page.tsx`: Clean foundational layout and build verification shell.
   - `.env.example` & `README.md`.
