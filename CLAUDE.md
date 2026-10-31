# Meridian Banking — working rules

One-page banking app (dashboard + 3-step transfer dialog). The spec is
`brief/candidate-brief.md`; layout is in `wireframes/wireframe.md`; the API is
in `brief/api-contract.md`. When they disagree with this file, the brief wins.

## Setup and checks

- Node 22: `nvm use` (see `.nvmrc`). Install with `npm ci`, not `npm install`,
  so the lockfile isn't rewritten.
- `npm run check` (lint + typecheck + unit tests) and `npm run build` must pass
  before a PR. CI runs the same on every PR.
- `npm run test:e2e` runs Playwright. Set `E2E_BASE_URL` to test a deployed
  site; without it, it builds and previews locally. It is not part of CI.

## Code rules

- **Never edit `mock-api/` or `src/mocks/`.** To test an edge case, override a
  response inside the test with `server.use(...)` from `src/test/setup.ts`.
- **Server data lives in TanStack Query only.** No copies in `useState` or a
  store, no `fetch` in components or `useEffect`. API calls go through
  `apiFetch` and the hooks in `src/api/`.
- **Don't store what you can calculate** (totals, remaining limit). Use the
  helpers in `src/lib/`.
- **Each validation rule is defined once**, in the transfer Zod schema, and used
  for both inline errors and submit.
- **Colours come from tokens only:** `var(--…)` from `brief/design-tokens.css`.
  No hex, `rgb()` or named colours in components or CSS modules.
- **Styling** is CSS Modules (`Component.module.css` next to the component);
  globals live in `src/index.css`.
- **Copy** must match brief §4 exactly. Money uses `formatMoney`, dates use
  `formatShortDate` (`src/lib/format.ts`).
- TypeScript strict, no `any`.

## Tests

- Test behaviour through the UI (roles, labels, visible text), not
  implementation details.
- `formatMoney` puts a non-breaking space after `SGD`, which Testing Library
  doesn't match against a plain string. Use the `money()` helper from
  `src/test/renderApp.tsx` in text queries.
- Mock responses take ~500ms; async queries already allow 3s.

## Workflow

- Never commit to `main`. One branch per feature (`feat/…`, `fix/…`,
  `chore/…`), merged through a PR.
- Open PRs with `/raise-pr`. PR descriptions are for reviewers: describe the
  change, not how it came about.
- Commit in small steps on the feature branch. Push only through `/raise-pr`,
  after the PR text is approved. Merging is the developer's call.
