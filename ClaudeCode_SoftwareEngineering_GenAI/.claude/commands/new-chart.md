---
description: Scaffold a recharts component and wire it in via next/dynamic(..., ssr:false)
argument-hint: <ChartName> [page: dashboard|insights]
allowed-tools: Read, Write, Edit, Glob
---

Scaffold a new chart under [src/components/charts/](expense-tracker-ai/src/components/charts/) and import it into a page with SSR disabled.

Arguments: `$1` = PascalCase chart component name (e.g. `WeeklyChart`). `$2` = target page, either `dashboard` ([src/app/page.tsx](expense-tracker-ai/src/app/page.tsx)) or `insights` ([src/app/insights/page.tsx](expense-tracker-ai/src/app/insights/page.tsx)). Default: `dashboard`.

If `$1` is missing or not PascalCase, stop and ask. If a file at `src/components/charts/$1.tsx` already exists, stop and ask — do not overwrite.

Steps:

1. Read [src/components/charts/MonthlyChart.tsx](expense-tracker-ai/src/components/charts/MonthlyChart.tsx) and [src/components/charts/CategoryChart.tsx](expense-tracker-ai/src/components/charts/CategoryChart.tsx) to match their conventions: `"use client"` directive, `ExpenseSummary` prop shape, `ResponsiveContainer`, `.card` wrapper, Tailwind styling with `indigo-600` brand color, `formatCurrency` from [src/utils/formatters.ts](expense-tracker-ai/src/utils/formatters.ts) for tooltips.
2. Create `expense-tracker-ai/src/components/charts/$1.tsx` following that pattern. Use a placeholder `BarChart` with `summary.monthlyTotals` as the dataset unless the name hints otherwise (`Category*` → pie, `Weekly*`/`Monthly*` → bar).
3. Open the target page and add:
   - `const $1 = dynamic(() => import("@/components/charts/$1"), { ssr: false });` next to the existing dynamic imports.
   - `<$1 summary={summary} />` in the charts grid.
   - If `dynamic` is not already imported on that page, add `import dynamic from "next/dynamic";`.
4. Report the files created/modified with clickable paths. Remind the user to run `/preflight` before committing.

Non-negotiable: **never** import chart components statically. `recharts` touches `window` during render and will blow up SSR hydration. Always go through `next/dynamic` with `ssr: false` — the same pattern [src/app/page.tsx](expense-tracker-ai/src/app/page.tsx) uses.
