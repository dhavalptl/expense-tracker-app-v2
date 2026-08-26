---
name: github-gh
description: GitHub issues, PRs, and checks via gh. Use when opening issues or pull requests.
disable-model-invocation: true
---

# GitHub via `gh`

Require `gh auth status` and `gh repo view`. If logged out, stop. Operate only on the current repo.

## Prod writes

- Create issues only after the ticket list is human-approved.
- Open PRs as **`--draft`**. Ready-for-review only when the human says so.
- Child tickets use `Refs #n`, never `Fixes`/`Closes` (those auto-close the parent).
- Close issues only when the human asks.
- Do not `gh api` unless the human asks. Prefer `gh pr comment` if they want GitHub noise.
- Do not `--force`, `--no-verify`, or skip required checks.

## Issues

```
gh issue create --title "…" --body-file -
gh issue list --state open
gh issue view N
```

## PRs

Branch: repo convention or `feat/<issue>-<slug>`.

```
gh pr create --draft --title "…" --body "$(cat <<'EOF'
## Summary
- …

## Spec
- specs/<slug>.md / Refs #<parent>

## Test plan
- [ ] unit (repo script)
- [ ] typecheck
- [ ] e2e critical path
- [ ] security-review
EOF
)"
gh pr checks
gh pr diff
```

## Actions

```
gh run list --branch "$(git branch --show-current)"
gh run view <id> --log-failed
```

Fix code or workflow; do not weaken the gate.

## Exit

- [ ] URL returned
- [ ] Draft unless human asked to publish
- [ ] Body uses Refs, not Fixes, for parents
