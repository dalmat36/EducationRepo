# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This directory is part of a larger education monorepo (`EducationRepo`). The only app here is [expense-tracker-ai/](expense-tracker-ai/) — a Next.js 14 App Router application. All commands below assume `cd expense-tracker-ai` first.

## Commands

Run from [expense-tracker-ai/](expense-tracker-ai/):

- `npm run dev` — start the Next.js dev server (http://localhost:3000)
- `npm run build` — production build; also the canonical TypeScript type-check (tsconfig has `noEmit: true`, so `next build` is what exercises the type system end-to-end)
- `npm start` — serve the production build
- `npm run lint` — `next lint` using `eslint-config-next`

There is no unit-test runner configured. If you add tests, wire the command into `package.json` and document it here — do not invent a command that doesn't exist.

### Single-file / focused checks

- Type-check without a full build: `npx tsc --noEmit` (respects [tsconfig.json](expense-tracker-ai/tsconfig.json))
- Lint one path: `npx next lint --file src/components/ExpenseForm.tsx`

## Architecture

Client-side-only SPA built on the Next.js App Router. There is no backend, no API routes, and no database — all state lives in the browser's `localStorage`.

**Data flow (single source of truth):**

1. [src/utils/storage.ts](expense-tracker-ai/src/utils/storage.ts) reads/writes `localStorage` under key `expense_tracker_data`. On first load with no data it seeds a demo dataset so the UI isn't empty — be aware that deleting the key triggers reseeding, not an empty state.
2. [src/hooks/useExpenses.ts](expense-tracker-ai/src/hooks/useExpenses.ts) is the **only** consumer of `storage.ts`. It owns the expenses array, exposes CRUD callbacks (`addExpense`, `updateExpense`, `deleteExpense`), filters, and a memoized `summary` (totals, by-category, last-6-months rollup). Every page calls this hook; do not read `localStorage` from components.
3. Each route under [src/app/](expense-tracker-ai/src/app/) (`/`, `/expenses`, `/insights`) is a `"use client"` page that calls `useExpenses()` and composes presentational components from [src/components/](expense-tracker-ai/src/components/).

**SSR caveat:** `useExpenses` is tied to `localStorage`, so any component that renders charts or expense data must be a client component. Chart components ([components/charts/](expense-tracker-ai/src/components/charts/)) are imported via `next/dynamic(..., { ssr: false })` from the pages — follow that pattern for any new `recharts`- or `window`-dependent component to avoid hydration mismatches.

**Types:** [src/types/expense.ts](expense-tracker-ai/src/types/expense.ts) is the shared type surface. `Category` is a string-literal union — adding a category requires updating `CATEGORIES`, `CATEGORY_COLORS`, and `CATEGORY_ICONS` together, or TypeScript will flag the missing keys.

**Styling:** Tailwind with a small set of custom component classes (`.card`, `.btn-primary`, `.input`, `.label`, `.badge`) defined in [src/app/globals.css](expense-tracker-ai/src/app/globals.css). Reuse these before writing new utility-soup; the brand color is `indigo-600`.

**Path alias:** `@/*` maps to `src/*` ([tsconfig.json](expense-tracker-ai/tsconfig.json)). Always import with `@/...` rather than relative paths.

## Testing

No test framework is currently installed. When tests exist:

- **Never remove or skip a test to make CI green.** A failing test is a signal — fix the code under test, or if the test itself is wrong, fix the assertion and explain why in the commit message. Deleting or `.skip`-ing tests to unblock a merge is not acceptable.
- Treat `npm run build` (full type-check) and `npm run lint` as the minimum gate before opening a PR.
- If you introduce a new test tool (Vitest, Jest, Playwright, etc.), add the script to `package.json` and update this file in the same change.

## Building

`npm run build` is what CI and deploys run. Because `tsconfig.json` has `noEmit: true`, the build is also the authoritative type check — a clean `tsc` does not prove the build will pass. Always run `npm run build` before declaring a change done.

Build artifacts (`.next/`, `*.tsbuildinfo`, `next-env.d.ts`) are git-ignored; never commit them.

## GitHub workflow

- Main branch: `main`. Remote: `origin` (`github.com/dalmat36/EducationRepo`).
- Feature branches use a descriptive prefix (e.g. `feature-data-export-v1/2/3` are preserved comparison branches — do not delete them; [expense-tracker-ai/code-analysis.md](expense-tracker-ai/code-analysis.md) references them).
- Create a new branch per change; never commit directly to `main`.
- Open a PR against `main`. Before requesting review, run `npm run lint` and `npm run build` locally and confirm both pass.
- Use `gh pr create` for PRs; keep titles under ~70 chars and put detail in the body.
- Do not force-push to `main`. Do not skip hooks (`--no-verify`).

