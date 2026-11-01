# Meridian Banking — LIN HANHUI

- Deployed: https://dbs-fe-take-home.vercel.app
- Run locally: `npm ci && npm run dev`

## Project structure

```
src/
├─ main.tsx         app's main entry point; starts the MSW mock server
├─ api/             backend API integration: fetch client, types, queries and mutations
├─ lib/             generic TypeScript helper functions
├─ components/      generic UI with no banking knowledge: Button, fields, InlineError,
│                   EmptyState, Skeleton, icons
├─ features/
│  ├─ dashboard/    Dashboard (loading/error boundaries) → DashboardContent (the page),
│  │                Header, BalanceHero, AccountCard, DailyLimitCard, TransactionList
│  ├─ preferences/  usePreference (theme/segment), ThemeToggle, SegmentSwitch
│  └─ transfer/     TransferDialog, the three steps, SuccessPanel, transferSchema (Zod)
└─ test/            unit test setup and helpers
e2e/                e2e tests using Playwright
```

## Decisions and trade-offs

**Server state vs UI state.**

- **Server state:** all data from the API is kept in the TanStack Query cache.
- **Derived values:** total available and remaining daily limit are calculated
  from that data when needed, not stored.
- **UI state:** UI-only data (dialog open, current step, search text) is kept
  in local `useState`.
- **No global store:** server data already lives in TanStack Query and the
  remaining UI state is local, so Redux or Zustand would be overkill.

**Forms and validation.**

- **React Hook Form + Zod:** the transfer form uses React Hook Form, connected
  to a Zod schema with `zodResolver`, so every rule is defined once and used
  for both inline errors and `Continue`.
- **One form for all three steps:** values survive Back and step changes for
  free.

**Theming.**

- **No flash on load:** a small script in `index.html` sets the theme before
  the page first paints, so the user never sees it switch from the wrong theme.

**Dashboard loading with Suspense instead of `isLoading` checks.**

- **Why:** rather than checking `isLoading` / `isError` for each query and
  branching in the page, `Suspense` shows the skeleton and an error boundary
  shows the error and `Retry`. The page component only renders data that's
  already loaded, with no `undefined` checks.
- **Trade-off:** it needed one extra library, `react-error-boundary`, and
  splitting the dashboard into a shell and a content component.

**Search optimisation.**

- **Now:** search filters the 8 loaded transactions on the client, so there's
  no request per keystroke and, for simplicity, no debounce.
- **In a real app:** search should run on the server, with the input debounced
  so the server isn't hit on every keystroke.

**Handling bad API data.**

- **Safe fallbacks:** an invalid date or non-number amount shows `—`, missing
  text shows as empty, and a missing balance counts as nothing available, so
  one bad record can't crash the page or skip the balance check.
- **In a real app:** I'd validate API responses with Zod as they arrive, so bad
  data is caught in one place instead of where it's used.

## Loading, empty and error states

| State | How it's handled | See it on the deployed site |
| --- | --- | --- |
| Loading | Skeleton with the same layout as the loaded page, so nothing jumps | [`?delay=1500`](https://dbs-fe-take-home.vercel.app/?delay=1500) |
| Dashboard error | `We couldn't load your dashboard.` + `Retry` (error boundary) | [`?scenario=error`](https://dbs-fe-take-home.vercel.app/?scenario=error) |
| Empty lists | `No transactions yet.`; payees: `You have no saved payees yet.`, with `Send to someone new` still offered | [`?scenario=empty`](https://dbs-fe-take-home.vercel.app/?scenario=empty) |
| No search results | `No transactions match your search.` + `Clear search` | search for `zzz` |
| Field errors | Inline under the field, linked with `aria-describedby`; space reserved so the form doesn't move | e.g. amount `99999` |
| Send failure | Stays on Review with data intact, error in `role="alert"`, `Confirm transfer` to retry | put `#fail` in the note |

## Tests

53 unit and integration tests (Vitest + Testing Library + MSW), covering the
happy and unhappy paths of each flow, including the three the brief requires.

- **UI tests:** check behaviour after user interaction (clicking, typing,
  keyboard) through roles, labels and visible text, not component internals.
- **Helper function tests:** cover edge cases such as an empty list, negative
  amounts, rounding and timezones.
- **Bad data:** both the helpers and the UI are tested with incomplete or
  invalid API data (invalid dates, non-number amounts, missing text or
  balances), so nothing crashes or shows "NaN".

## AI use

I used **Claude Code** throughout:

- **What for:** planning against the brief, writing components and tests,
  reviewing, and opening PRs.
- **Guardrails:** a `CLAUDE.md` file holds the house rules it had to follow:
  tokens only, server data in TanStack Query only, each validation rule once,
  never edit the mock API.
- **Process:** every change went through a feature branch, `npm run check` and
  a PR I reviewed and merged.

Places where I changed, rejected or corrected what it produced:

- **Suspense.** Claude recommended keeping `useQuery` with explicit loading and
  error branches. I chose Suspense and an error boundary because the component
  reads more cleanly; we then made sure the three requests still run in
  parallel with `useSuspenseQueries`.
- **Where types and helpers live.** I moved the `Theme` type into
  `src/api/types.ts` next to `Segment` against its suggestion, and simplified
  code it had written defensively: a redundant `isSuccess` check around
  `transfer.data`, and a guard around `showModal()`.

## Not done / known issues

- **Optional extras not built:** daily-limit progress bar, `Discard this
  transfer?` confirmation, an in-app debug menu (the URL parameters above cover
  it), balance hide, a third segment, the `#transfer` deep link.
- **A full e2e test of the transfer flow.** The Playwright tests cover the
  dashboard and the dialog's open/close behaviour; the transfer itself (happy
  and unhappy paths) is covered by unit/integration tests but not end to end
  in a real browser.
