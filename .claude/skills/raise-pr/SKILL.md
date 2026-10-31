---
name: raise-pr
description: Use when the user asks to raise, open or create a pull request for the current branch.
disable-model-invocation: true
---

# Raise PR

Open a GitHub pull request for the current branch with a consistent title and
body. The PR text is always shown to the user and approved **before** anything
is pushed or created. Never merge.

## 1. Preconditions — stop and tell the user if any fail

- `gh auth status` succeeds.
- Base branch = `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`
  (usually `main`). Record the current branch as `<branch>`
  (`git branch --show-current`); it must **not** be the base branch. Use this
  recorded name, never `HEAD`, in every later step: an editor can switch the
  checkout while the PR text is being reviewed.
- `git status --porcelain` is empty (no uncommitted work).
- `git fetch origin <base>` then `git log --oneline origin/<base>..HEAD` lists
  at least one commit.
- `gh pr list --head <branch> --state open --json url` is empty. If a PR
  exists, show its URL and ask whether to update its body instead.

## 2. Verify

Run `npm run check` and `npm run build`. If either fails, show the failing
output's tail and stop. Do not push a red branch.

## 3. Draft

Read `git log --format='%s%n%n%b' origin/<base>..HEAD`,
`git diff --stat origin/<base>...HEAD`, and the diff of the main files.

**Title:** Conventional Commit style, ≤ 70 chars
(`feat: dashboard with accounts and transactions`).

**Body**, these sections in this order:

```md
## Summary
<1–3 sentences: what this PR does and why>

## Changes
- <one bullet per meaningful change, grouped by area>

## Requirements covered
- <IDs from brief/candidate-brief.md, e.g. D1 — parallel loading with skeleton>

## How to test
- `npm run check`
- <manual steps a reviewer can follow>

## Notes / trade-offs
- <decisions, known gaps, follow-ups; "None" if nothing>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Include **Requirements covered** only if `brief/candidate-brief.md` exists and
the PR touches listed requirements; otherwise leave the section out.

## 4. Approve

Show the exact title and body. Ask: "Create this PR?" Apply any edits the user
asks for and show the result again. Continue only on an explicit yes.

## 5. Create

1. Confirm `git branch --show-current` still equals `<branch>`. If not, stop
   and tell the user the checkout changed.
2. `git push -u origin <branch>`
3. Write the body to a temp file, then
   `gh pr create --base <base> --head <branch> --title "<title>" --body-file <file>`
4. Check `gh pr view <url> --json headRefName,commits` shows `<branch>` and
   the commits from step 3.
5. Reply with the PR URL and remind the user that CI runs on the PR and that
   merging is theirs.

## Common mistakes

| Mistake | Instead |
| --- | --- |
| Creating the PR, then showing the text | Show and get a yes first (step 4) |
| Passing the body with `--body "..."` | `--body-file` keeps backticks and newlines intact |
| `git push origin HEAD` / `gh pr create` without `--head` | Use the recorded `<branch>`; the checkout may have changed |
| Listing every file in **Changes** | Group by what changed for the reviewer |
| Adding reviewers, labels or merging | Only if the user asks |
