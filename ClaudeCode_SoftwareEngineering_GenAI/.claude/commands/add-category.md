---
description: Add a new expense Category across the three coordinated maps
argument-hint: <Name> <emoji> <hex-color>
allowed-tools: Read, Edit, Bash
---

Add a new `Category` to the expense tracker. Arguments: `$1` = category name (PascalCase, single word), `$2` = emoji, `$3` = hex color (e.g. `#14b8a6`).

If any argument is missing or malformed (hex missing `#`, name not a single word, emoji more than 2 chars), stop and ask the user rather than guessing.

Steps:

1. Read [src/types/expense.ts](expense-tracker-ai/src/types/expense.ts) to see the current shape.
2. In a single response, make three `Edit` calls against that file:
   - Append `| "$1"` to the `Category` string-literal union.
   - Add `"$1"` to the end of the `CATEGORIES` array (before the closing `]`).
   - Add `$1: "$3"` to `CATEGORY_COLORS` and `$1: "$2"` to `CATEGORY_ICONS`.
3. Grep for other places that exhaustively switch/map over categories (e.g. `CATEGORIES.map`, `Record<Category`) to confirm nothing else needs updating. Report what you found.
4. Run `npm run build` from [expense-tracker-ai/](expense-tracker-ai/) to confirm the type system is satisfied. If it fails, fix the reported locations — do NOT widen `Category` to `string` or cast around the error.
5. Report: the edits made, any additional files touched, and build status. Do not commit.

Invariant: `CATEGORIES`, `CATEGORY_COLORS`, and `CATEGORY_ICONS` must always have the same keys as the `Category` union. TypeScript will catch drift — trust it.
