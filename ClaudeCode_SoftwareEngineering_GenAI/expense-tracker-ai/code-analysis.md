# Export Feature Code Analysis

Systematic comparison of three data export implementations for the expense tracker application.

**Branches analyzed:**
- `feature-data-export-v1` — Simple one-button CSV export
- `feature-data-export-v2` — Advanced modal with multi-format and filtering
- `feature-data-export-v3` — Cloud-integrated panel with templates, scheduling, and history

---

## Version 1 — Simple CSV Export

### Files Created / Modified

| File | Change |
|------|--------|
| `src/utils/export.ts` | Modified — column order changed (Amount ↔ Category swapped) |
| `src/app/page.tsx` | Modified — added `Download` icon import, `exportToCSV` import, button in header |

**Net addition: ~11 lines across 2 files.**

### Architecture Overview

Flat, zero-abstraction. The `export.ts` utility is a single pure function that receives the full expenses array and imperatively builds a Blob and triggers a download. No layers, no types beyond what `Expense` already provides, no component. The page calls the function directly from an `onClick` handler.

```
page.tsx onClick → exportToCSV(expenses) → DOM download
```

### Key Components and Responsibilities

- **`exportToCSV(expenses)`** — Sole entry point. Builds CSV string, creates Blob, injects a temporary `<a>` into the DOM, clicks it, then cleans up.
- **`Export Data` button** — Styled `<button>` in the dashboard header. No state — fires and forgets.

### Libraries and Dependencies Used

- `lucide-react` — `Download` icon only
- Standard browser APIs: `Blob`, `URL.createObjectURL`, `URL.revokeObjectURL`, `document.createElement`

No new dependencies added.

### Implementation Patterns

- **Imperative DOM manipulation** — Creates a temporary anchor element rather than using React state or a ref.
- **Template literal CSV builder** — Joins header row and data rows with `\n`. No CSV library.
- **RFC 4180 partial compliance** — Description field wrapped in double-quotes; internal double-quotes doubled (`""`). Comma escaping only applied to the description column, not category or date.

### Code Complexity Assessment

**Very low.** `export.ts` is 24 lines. The dashboard change is 11 lines. Cyclomatic complexity is 1 — there are no branches in the export path. A junior developer can read and modify it in under two minutes.

### Error Handling Approach

**None.** There is no:
- Guard for an empty expenses array (produces a header-only CSV — technically valid but possibly surprising)
- try/catch around DOM manipulation
- User feedback if the download fails (browser popup blockers can silently block `URL.createObjectURL` downloads)

### Security Considerations

**CSV injection risk (unmitigated).** Values in the Description, Category, or Amount fields that begin with `=`, `+`, `-`, or `@` can be interpreted as spreadsheet formulas by Excel and LibreOffice when the file is opened. This is a known CSV injection attack vector. The current implementation does not prefix such values with a tab or single quote.

**Example risk:** A description of `=HYPERLINK("http://evil.com","Click me")` would render as an active hyperlink in Excel.

The double-quote escaping in the description column is correct but insufficient — it only prevents CSV structure breakage, not formula injection.

### Performance Implications

- **Synchronous, single-pass.** The CSV build is O(n) over the expense list. No memoization needed since there's no reactive recalculation — the function runs once per click.
- **Memory:** A `Blob` is created in memory, URL is revoked immediately after the click. No leak risk.
- For 10,000+ expense records, the synchronous string building on the main thread could cause a brief UI freeze, but this is unlikely to matter at realistic data volumes for a personal expense tracker.

### Extensibility and Maintainability

**Poor extensibility.** Adding JSON export means either duplicating the function or adding a format parameter with a conditional. Adding filtering means the caller must pre-filter before passing the array. The function has no configuration surface — every behavior is hardcoded.

**Excellent maintainability for what it does.** There's nothing to maintain. If the export logic needs to change (e.g., add a column), it's one place with one responsibility.

---

### Technical Deep Dive — V1

**How export works technically:**
1. `formatDate()` and `toFixed(2)` transform each Expense field to display strings.
2. Rows are mapped to arrays of strings, then joined with commas.
3. All rows plus the header are joined with `\n` into a single CSV string.
4. A `Blob` with MIME type `text/csv;charset=utf-8;` wraps the string.
5. `URL.createObjectURL(blob)` generates a temporary `blob://` URL.
6. An `<a>` element is created, given the URL as `href` and a dated filename as `download`, appended to the body (required for Firefox), clicked programmatically, removed, and the URL is revoked.

**File generation:** Pure in-memory string concatenation → Blob. No server round-trip.

**User interaction:** Single click. No confirmation, no preview, no feedback.

**State management:** None. The export function is called directly from the event handler. React state is not involved.

**Edge case handling:**
- Empty array → valid CSV with header only (file downloads as `expenses_2025-01-01.csv` containing just `Date,Category,Amount,Description`)
- Descriptions with commas → handled by quote-wrapping
- Descriptions with quotes → handled by `""` doubling
- Amount precision → `toFixed(2)` ensures two decimal places

---

## Version 2 — Advanced Export Modal

### Files Created / Modified

| File | Change |
|------|--------|
| `src/utils/exportAdvanced.ts` | **New** — ~110 lines |
| `src/components/ExportModal.tsx` | **New** — ~293 lines |
| `src/app/page.tsx` | Modified — added `Download` icon, `ExportModal` import, `showExport` state, trigger button, modal render |

**Net addition: ~420 lines across 3 files.**

### Architecture Overview

Two-layer separation: a **utility layer** (`exportAdvanced.ts`) handling all file generation logic, and a **component layer** (`ExportModal.tsx`) handling all user interaction. The page is only aware of a boolean `showExport` state and passes `expenses` + `onClose` to the modal.

```
page.tsx
  └─ showExport state → <ExportModal expenses onClose>
       ├─ local state: format, dateFrom, dateTo, selectedCategories, filename, isExporting, showPreview
       ├─ useMemo: filtered, totalAmount
       └─ handleExport() → exportAdvanced.ts
            ├─ filterExpensesForExport()
            ├─ exportAsCSV() | exportAsJSON() | exportAsPDF()
            └─ triggerDownload() [private]
```

### Key Components and Responsibilities

**`exportAdvanced.ts`:**
- `ExportOptions` interface — typed configuration surface for filtering
- `filterExpensesForExport()` — reusable filter accepting a partial `ExportOptions`. Returns filtered expense array.
- `exportAsCSV()` — Builds RFC-4180 CSV, delegates to `triggerDownload`
- `exportAsJSON()` — Serializes an array of sanitized expense objects (strips `id`, `createdAt`, `updatedAt`)
- `exportAsPDF()` — Generates a complete HTML document string with inline CSS, opens it in a new tab via `window.open`, and calls `window.print()` on load
- `triggerDownload()` — Private helper (not exported) using the same Blob/anchor pattern as V1

**`ExportModal.tsx`:**
- Format picker (3-card selector)
- Date range inputs (from / to)
- Category pill filter with select-all toggle
- Filename input with live format extension suffix
- Summary bar (record count + total amount, warning when zero matches)
- Toggle-able preview table (first 8 rows of filtered data)
- Export / Cancel footer with loading spinner

### Libraries and Dependencies Used

- `lucide-react` — `X`, `Download`, `FileText`, `FileJson`, `Printer`, `Calendar`, `Tag`, `Eye`, `Loader2`
- `date-fns` — `todayString()` from formatters (which uses `format`)
- Standard browser APIs — same Blob/URL pattern, plus `window.open` for PDF

No new npm dependencies.

### Implementation Patterns

- **Configuration object pattern** — `ExportOptions` type separates what to export from how; `filterExpensesForExport` accepts a `Pick<ExportOptions, ...>` making it reusable independent of the full options shape.
- **Strategy-like dispatch** — `handleExport()` uses if/else to dispatch to the appropriate export function based on `format` state. Could be a map lookup but is clear enough at three cases.
- **Controlled component pattern** — All form fields are controlled via `useState`. `useMemo` derives `filtered` and `totalAmount` from state without side effects.
- **Artificial delay for UX** — `await new Promise(r => setTimeout(r, 400))` before executing the export gives the `isExporting` state time to render a spinner, preventing the UI from appearing frozen.
- **Data sanitization in JSON export** — `exportAsJSON` explicitly maps to `{ date, category, amount, description }`, stripping internal fields (`id`, `createdAt`, `updatedAt`). This is a deliberate design choice not present in V1.

### Code Complexity Assessment

**Medium.** The modal component has 7 `useState` declarations and 2 `useMemo` calls. The `handleExport` function has a simple if/else chain. The category toggle logic (`toggleCategory`, `toggleAllCategories`) has minor conditional complexity. Overall cyclomatic complexity is low per function, but the component manages more state than V1.

The utility file is clean and simple — each export function is independently testable with no shared mutable state.

### Error Handling Approach

**Moderate.** The `handleExport` function uses `try/finally` to ensure `isExporting` is reset and `onClose` is called even if the export throws. The export button is disabled when `filtered.length === 0`. The summary bar shows an amber warning state when filters return zero results.

What's missing:
- No catch block — exceptions are swallowed by the `finally` without user feedback
- `window.open` for PDF can return `null` in popup-blocked environments; the null check (`if (win)`) prevents a crash but gives no user feedback
- No validation on the filename input (empty string falls back to `"expenses"` via the onChange handler)

### Security Considerations

**CSV injection** — Same risk as V1. The description is quote-wrapped and double-quote escaped, but formula-prefixed values are not neutralized.

**XSS in PDF generation** — `exportAsPDF` interpolates `e.description` directly into an HTML template string without HTML-escaping:
```typescript
<td>${e.description}</td>
```
If a description contains `<script>` tags or other HTML, it will execute in the new browser tab context. While the opened tab has the same origin restrictions as a blank page (`window.open("", "_blank")`), this is still a vector for stored-XSS-style attacks if an attacker can control expense descriptions. Descriptions should be passed through an HTML entity encoder before insertion.

**JSON export** strips internal IDs — intentional data minimization (good practice).

### Performance Implications

- `useMemo` on `filtered` prevents recomputing the filter predicate on every keystroke in the filename input.
- `previewRows = filtered.slice(0, 8)` — preview is O(1) from the already-computed filtered array.
- PDF opens in a new tab and renders asynchronously; no impact on the main tab's performance.
- The 400ms delay is artificial and adds no real overhead.

### Extensibility and Maintainability

**Good.** Adding a new format (e.g., XLSX) requires:
1. Adding a type to `ExportFormat`
2. Writing an `exportAsXLSX()` function in `exportAdvanced.ts`
3. Adding an entry to the `FORMAT_OPTIONS` array in `ExportModal.tsx`
4. Adding an `else if` case in `handleExport()`

The filter logic is fully decoupled from the export logic — adding new filter dimensions (e.g., amount range) means updating `ExportOptions` and `filterExpensesForExport` without touching the export functions.

**Potential fragility:** The modal component is a monolith at ~293 lines. Adding more filter options or format-specific configuration panels would grow it significantly. At that scale, it would benefit from splitting into sub-components.

---

### Technical Deep Dive — V2

**How export works technically:**
- CSV and JSON: same Blob/anchor mechanism as V1, but data is pre-filtered by `filterExpensesForExport` before being passed to the format-specific function.
- PDF: `exportAsPDF` builds a complete HTML document string with inline styles and a `<script>` that calls `window.print()` on load. `window.open("", "_blank")` creates a new blank tab; `win.document.write(html)` populates it; `win.document.close()` signals document parsing is complete, triggering `onload`.

**File generation:**
- CSV/JSON: In-memory string → Blob → object URL → programmatic anchor click
- PDF: HTML string → new browser tab → browser print dialog (Save as PDF)

**User interaction flow:**
1. User clicks "Export" button → modal opens
2. User picks format, optionally sets date range / categories / filename
3. Summary bar updates reactively as filters change
4. User optionally opens preview table
5. User clicks "Export N records" → spinner shown → file downloaded → modal closes

**State management:**
- 7 `useState` hooks manage: format, dateFrom, dateTo, selectedCategories, filename, isExporting, showPreview
- 2 `useMemo` hooks derive: filtered (from expenses + filter state), totalAmount (from filtered)
- No external state management; all state is local to the modal instance

**Edge case handling:**
- Zero-match filters → button disabled, amber warning shown
- Empty filename → falls back to `"expenses"` via onChange guard
- `window.open` returns null → null check prevents crash (silent failure)
- `finally` block ensures modal always closes and loading state always resets

---

## Version 3 — Cloud-Integrated Export Panel

### Files Created / Modified

| File | Change |
|------|--------|
| `src/utils/exportCloud.ts` | **New** — ~240 lines |
| `src/hooks/useExportHistory.ts` | **New** — ~77 lines |
| `src/components/CloudExportPanel.tsx` | **New** — ~630 lines |
| `src/app/page.tsx` | Modified — added `UploadCloud` icon, `CloudExportPanel` import, `showExportPanel` state, trigger button, panel render |

**Net addition: ~970 lines across 4 files.**

### Architecture Overview

Three-tier architecture: **data/config layer** (`exportCloud.ts`), **persistence layer** (`useExportHistory.ts`), and **presentation layer** (`CloudExportPanel.tsx`). The page only manages a boolean for panel visibility.

```
page.tsx
  └─ showExportPanel state → <CloudExportPanel expenses onClose>
       ├─ useExportHistory hook
       │    ├─ localStorage: history (50-entry cap), schedule, connectedServices
       │    └─ CRUD operations via useCallback
       ├─ local state: activeTab, selectedTemplateId, selectedDestId, emailInput,
       │               emailSent, isProcessing, shareLink, copiedLink, showQR,
       │               connectingId, localSchedule
       ├─ useMemo: filteredCount, totalAmount
       └─ handleExport() → exportCloud.ts
            ├─ generateContent(template, expenses)
            │    ├─ template.filter(expenses)  [Strategy pattern]
            │    └─ template.transform(filtered)  [Strategy pattern]
            └─ triggerDownload() | setShareLink() | setEmailSent()
```

### Key Components and Responsibilities

**`exportCloud.ts`:**
- `ExportTemplate` interface — defines the template contract: `filter()` and `transform()` functions embedded as data
- `CloudDestination` interface — defines destination metadata with `requiresAuth` flag
- `ExportHistoryEntry` interface — typed history record with status, size, timestamps
- `ScheduleConfig` interface — complete schedule configuration shape
- `EXPORT_TEMPLATES` array — 4 concrete templates (Tax Report, Monthly Summary, Category Analysis, Full Backup), each with specialized data transformations:
  - Tax Report: sorts by category, groups with per-category subtotals and grand total row
  - Monthly Summary: current-month filter with running balance column
  - Category Analysis: aggregation with percentages, averages, max per category → JSON
  - Full Backup: raw JSON with all Expense fields including internal ones
- `CLOUD_DESTINATIONS` array — 6 destination configs
- `generateContent()` — orchestrates template.filter → template.transform
- `triggerDownload()` — exported (unlike V2's private version)
- `generateShareableLink()` — produces a fake but realistic-looking URL
- `getFileSizeKb()` — uses `TextEncoder` for accurate byte size
- `buildFilename()` — template-id-based filename with date
- `describeNextExport()` — computes next scheduled export as a human-readable string

**`useExportHistory.ts`:**
- Manages three independent pieces of localStorage state: export history, schedule config, connected services set
- All mutations via `useCallback` for referential stability
- History capped at 50 entries to prevent unbounded localStorage growth
- `try/catch` on initial localStorage reads to handle corrupted data gracefully
- Converts connected services array ↔ Set between storage format and runtime format

**`CloudExportPanel.tsx`:**
- Right-side slide-in drawer (flex layout with backdrop div)
- Gradient header with Cloud icon, data summary, tab navigation
- `FakeQRCode` sub-component — deterministic visual QR grid from string hash (not real, for UI mockup)
- 4 tabs with conditional rendering:
  - **Templates** — 2×2 card grid, detail panel, destination pill picker, share link result area
  - **Destinations** — service list with connect/disconnect simulation, integration disclaimer
  - **Schedule** — toggle, frequency selector, conditional day-of-week/day-of-month pickers, time input, template/destination selectors, next-export preview
  - **History** — timeline list with empty state, per-entry delete (hover reveal), clear all
- Footer only rendered on Templates tab (action button changes label based on destination)

### Libraries and Dependencies Used

- `lucide-react` — 26 icons (largest icon usage of the three versions)
- `date-fns` — `formatDistanceToNow` (for history timestamps), `format` (for schedule preview and filenames)
- Standard browser APIs — Blob/URL/anchor pattern, `navigator.clipboard`, `localStorage`, `TextEncoder`

No new npm dependencies.

### Implementation Patterns

- **Strategy pattern** — `ExportTemplate.filter()` and `ExportTemplate.transform()` are functions stored as object properties. `generateContent()` calls them polymorphically, making it trivial to add new templates without modifying any existing code (open/closed principle).
- **Data-driven UI** — Both `EXPORT_TEMPLATES` and `CLOUD_DESTINATIONS` are arrays of plain objects. The UI iterates them to render cards, lists, and selectors. Adding a destination or template is a config change, not a code change.
- **Custom hook for cross-session persistence** — `useExportHistory` encapsulates all localStorage interaction behind a clean API, keeping the component free of storage concerns. The hook pattern also makes the persistence logic independently testable.
- **Local schedule state with explicit save** — `localSchedule` in the component is a draft copy of the persisted `schedule` from the hook. The user edits locally and commits with "Save Schedule" — a common pattern in settings UIs to prevent accidental auto-save.
- **Simulated async operations** — `handleConnect` uses `setTimeout(1200)` to simulate OAuth flow. `handleExport` uses `setTimeout(600)` for "processing" UX. These are purely cosmetic but establish the interaction vocabulary for a real implementation.
- **Deterministic fake QR code** — `FakeQRCode` uses a simple hash of the URL string to produce consistent-looking but non-scannable QR module patterns. Corner finder patterns are always-on (mirroring real QR spec) for visual credibility.

### Code Complexity Assessment

**High.** `CloudExportPanel.tsx` is 630 lines — the largest single component in the project. It manages 10 `useState` hooks, 2 `useMemo` hooks, and 4 async/sync handler functions. The tab-based conditional rendering means a reader must track which state variables apply to which tab.

`exportCloud.ts` has moderate complexity concentrated in the template transform functions (Tax Report's category grouping is the most complex at ~15 lines). The `describeNextExport` date arithmetic is readable but has 3 conditional branches.

`useExportHistory.ts` is simple and well-scoped — 77 lines, 4 callbacks, no complex logic.

### Error Handling Approach

**Most robust of the three versions.**

- `useExportHistory` wraps all `localStorage` reads in `try/catch` (malformed JSON, storage quota errors, private browsing restrictions all handled gracefully).
- `handleExport` uses `try/finally` for cleanup.
- `handleCopyLink` uses `.catch(() => {})` — clipboard API failures (non-HTTPS, permissions denied) are silently swallowed. A toast notification would improve this.
- `window.open` null check not present — if a popup blocker prevents opening, `generateShareableLink` still runs but the window reference in `exportAsPDF`-style flows would crash. However, V3 doesn't call `window.open` — PDF is not a format in V3.
- History capped at 50 entries prevents localStorage bloat.
- Connected services stored as JSON array, deserialized back to `Set` at load time.

What's still missing:
- No error toast or visual feedback when clipboard copy fails
- Schedule "Save Schedule" has no success confirmation
- `generateShareableLink` uses `Math.random()` which can technically produce the same token across calls (extremely unlikely but non-zero)

### Security Considerations

**Multiple concerns:**

1. **`generateShareableLink` uses `Math.random()`** — Not cryptographically secure. In production, server-generated tokens using `crypto.randomUUID()` or similar would be required. The current implementation also hardcodes a non-existent domain, so the links are entirely fictional.

2. **localStorage trust** — `useExportHistory` parses localStorage data via `JSON.parse` inside a `try/catch`. An attacker with XSS access could manipulate the stored history or schedule config. This is an inherent limitation of localStorage-based persistence (no server-side validation).

3. **CSV injection** — Same risk as V1/V2. The Tax Report template's `transform` function does not escape formula-prefixed values.

4. **Description field in CSV templates** — Description is quote-wrapped and double-quote escaped correctly in all templates. No raw HTML rendering unlike V2's PDF.

5. **No sensitive data exposure** — The "Full Backup" template exports `id`, `createdAt`, `updatedAt` fields. These are internal IDs and timestamps — low sensitivity, but worth noting that the backup format exposes more fields than the other templates.

### Performance Implications

- `filteredCount` and `totalAmount` are memoized via `useMemo` on `[selectedTemplate, expenses]`. However, `selectedTemplate.filter(expenses)` is called twice on each render where the template changes — once for `filteredCount` and once for `totalAmount`. These could be consolidated into a single `useMemo` returning both values.
- History tab renders all history entries without virtualization. At the 50-entry cap this is fine; it would matter at higher volumes.
- `FakeQRCode` recomputes the cell array on every render (no `useMemo`). The hash computation is O(URL length) and the cell generation is O(121) — negligible.
- Template `filter()` functions run synchronously on click in `generateContent`. At large expense counts, the Tax Report sort + group would be the most expensive operation.
- 600ms artificial delay is longer than V2's 400ms — more noticeable on fast machines.
- `TextEncoder.encode(content).length` for file size calculation is accurate but creates a temporary typed array. Inconsequential for typical data volumes.

### Extensibility and Maintainability

**Excellent extensibility.** Due to the data-driven template and destination patterns:
- **New template:** Add an object to `EXPORT_TEMPLATES` with `filter` and `transform` functions. No component code changes.
- **New destination:** Add an object to `CLOUD_DESTINATIONS`, add an icon/color entry, add a handler case in `handleExport`. Component auto-renders it in both the picker and destinations tab.
- **New schedule frequency:** Add to the union type and add a case in `describeNextExport`.

**Maintainability concern:** `CloudExportPanel.tsx` at 630 lines is approaching the threshold where splitting into tab-specific sub-components would improve navigability. Specifically, the Schedule tab (lines ~394–531) and History tab (lines ~533–596) could be extracted without breaking any interfaces. The hook already provides a clean separation boundary.

---

## Cross-Version Comparison

### Metrics Summary

| Metric | V1 | V2 | V3 |
|--------|----|----|-----|
| New lines of code | ~35 | ~420 | ~970 |
| New files | 0 | 2 | 3 |
| Export formats | 1 (CSV) | 3 (CSV, JSON, PDF) | 2 (CSV, JSON) |
| Filtering | None | Date range + categories | Template-defined |
| Data preview | No | Yes (8 rows) | No |
| Persisted state | No | No | Yes (localStorage) |
| Export history | No | No | Yes (50 entries) |
| Scheduling UI | No | No | Yes |
| Custom filename | No | Yes | No (template-defined) |
| Cloud destinations | No | No | 6 (3 simulated) |
| Share links | No | No | Yes (simulated) |
| Loading state | No | Yes (400ms) | Yes (600ms) |
| Empty state handling | Silent | Warning + disabled | Warning + disabled |
| Error handling | None | try/finally | try/finally + catch |
| TypeScript types added | 0 | 2 | 4 |
| useState count | 0 | 7 | 10 |
| useMemo count | 0 | 2 | 2 |
| Custom hooks | 0 | 0 | 1 |

### Shared Technical Patterns Across All Versions

All three use identical file download mechanics:
```typescript
const blob = new Blob([content], { type: mimeType });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
```
This is idiomatic and correct. The `body.appendChild` is required for Firefox compatibility. `revokeObjectURL` is called synchronously after the click, which works because the browser queues the download asynchronously.

### Shared Security Gap — CSV Injection

All three versions have the same unmitigated CSV injection vulnerability. A description starting with `=`, `+`, `-`, or `@` will be interpreted as a formula by spreadsheet applications. The fix is to prefix such values with a tab character:

```typescript
const safeCsvValue = (val: string) =>
  /^[=+\-@]/.test(val) ? `\t${val}` : val;
```

This should be applied to all user-controlled string fields before CSV serialization.

### UI Pattern Differences

| Aspect | V1 | V2 | V3 |
|--------|----|----|-----|
| Trigger | Filled indigo button | Outline button | Gradient indigo/violet button |
| Container | None (direct action) | Center modal with backdrop | Right-side drawer with backdrop |
| Navigation | None | Linear (single form) | Tabbed (4 tabs) |
| Action label | "Export Data" | "Export" | "Export & Sync" |
| Post-export | Nothing | Modal closes | Panel stays open, history updated |

---

## Recommendation for Adoption

### If you need this in production now: **V2 as the base**

V2 offers the right balance of user control and implementation simplicity. The modal pattern is widely understood, the filtering covers real user needs (date range, categories), and the code is clean enough to extend without a full rewrite. The two priority fixes before shipping are:

1. HTML-escape descriptions before inserting into the PDF template
2. Add CSV injection mitigation on all string fields

### If you're building toward a product: **V3's architecture + V2's PDF**

V3's template pattern is genuinely extensible and the data-driven destination config makes adding real integrations later (OAuth, API calls) purely additive. The main things to carry forward from V2 are:
- PDF export (V3 dropped it)
- Data preview before export
- Custom filename input

V3's `useExportHistory` hook and `ExportTemplate` interface are worth keeping as-is. `CloudExportPanel.tsx` should be refactored to extract tab content into sub-components before growing further.

### What to discard from all versions

- Artificial loading delays (`setTimeout`) — replace with real async operations or remove
- `Math.random()` for share token generation — replace with `crypto.randomUUID()`
- Hardcoded `app.expensetracker.io` domain in V3 — parameterize or remove until there's a real backend
- The 50-entry history cap is fine for a personal app but would need to move server-side for a multi-user product
