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

45 unit and integration tests (Vitest + Testing Library + MSW), written against
what the user sees: roles, labels and visible text, not component internals.
Edge cases override a mock response inside the test with `server.use(...)`.

- **The three the brief requires:** an amount over the balance shows the error and
  sends no request; a successful transfer shows the success screen and the
  dashboard updates; a failed dashboard request shows the error and `Retry`
  loads it.
- **Dashboard:** loading state, totals excluding the credit card, the 8 newest
  transactions, search (case and spaces), no-results and empty states, keeping
  data when a background refresh fails, theme and segment persistence.
- **Transfer:** focus on open and return on close, starting empty after Cancel,
  payee search and keyboard selection, every validation rule, deposit-only
  accounts, quick amounts, the note counter, Back keeping values, masking a new
  account number, sending only once on a double click, failure then retry, and
  showing the API's message when it rejects a field.
- **Pure logic:** totals and remaining limit (`lib/accounts`), demo-param
  forwarding (`api/client`), formatting.

I picked these because they're the places a banking UI can go wrong silently:
wrong money totals, a second send, success shown after a failure, or errors a
screen-reader user can't hear.

**E2E (Playwright, `npm run test:e2e`, not in CI):** the dashboard loads with no
console errors, the dialog closes with `Esc` and returns focus, and it's a
full-screen sheet at 390 px. Set `E2E_BASE_URL` to run against the deployed
site; without it, it builds and previews locally.

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
