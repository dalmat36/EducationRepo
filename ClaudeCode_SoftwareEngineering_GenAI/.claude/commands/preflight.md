---
description: Run lint + build from expense-tracker-ai/ and summarize failures
argument-hint: (no args)
allowed-tools: Bash, Read
---

Run the PR gate for this repo and report back.

1. From [expense-tracker-ai/](expense-tracker-ai/), run `npm run lint` and `npm run build` **in parallel** (single message, two Bash calls).
2. If either fails:
   - Parse the output for error locations (`file:line:col`) and the error message.
   - Present a compact punch list: one bullet per failure with a clickable `[file.ts:line](expense-tracker-ai/path/to/file.ts#Lline)` link and the error text.
   - Do NOT attempt to fix anything yet — just report. Ask the user if they want fixes applied.
3. If both pass: report "preflight clean" with the build's route summary (the table `next build` prints) and stop.

Notes:
- `npm run build` is the authoritative TypeScript check (tsconfig has `noEmit: true`), so don't substitute `npx tsc --noEmit`.
- Do not skip hooks, do not disable lint rules inline to make errors go away.
