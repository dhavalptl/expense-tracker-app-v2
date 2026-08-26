---
name: deploy-ci
description: GitHub Actions quality gates and deploy. Use when editing workflows or shipping to production.
disable-model-invocation: true
---

# CI and deploy

Copy `templates/github/ci.yml`, then **adapt** the package manager to the lockfile (`pnpm-lock.yaml` → pnpm, `package-lock.json` → `npm ci`, `yarn.lock` → yarn). Do not add a second host.

## Gates (PR + default branch)

1. Frozen lockfile install
2. Typecheck
3. Vitest
4. Production build
5. Playwright (bundled Chromium in CI)
6. `audit --audit-level=high` — do not hide High+

Fail the PR if any job fails. E2E is required for UI-visible work.

## Prod deploy

- Human approval after green CI. Never deploy from a draft PR.
- Secrets only in the host or GitHub **Secrets**, never in yaml or the client bundle.
- Rollback: previous host deployment or revert the merge commit.
- Workflow `permissions: contents: read`. `persist-credentials: false` on checkout.
- Pin actions the way the **app** repo already pins (SHA if they use SHA, else the same major as existing workflows).

## Launch

- [ ] CI green
- [ ] No Critical `security-review`
- [ ] Data changes reversible
- [ ] Branch protection: tell the human if checks are optional

## Exit

- [ ] Workflow matches this repo's package manager
- [ ] Production still needs an explicit human OK
