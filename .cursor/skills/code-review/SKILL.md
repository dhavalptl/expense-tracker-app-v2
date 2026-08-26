---
name: code-review
description: Two-axis Spec vs Standards review. Use when reviewing a PR, branch, or merge.
---

# Code review

Pin the base: `git diff <base>...HEAD` (three-dot). If unspecified, use the PR base or `main`. Empty diff → stop.

Find the spec: issue refs in commits, `specs/`, or the ticket body. If none, Spec axis reports "no spec".

## Two axes (keep separate)

Run mentally (or as parallel subagents) then paste both:

**Standards** — repo conventions + these smells (judgment, not auto-fail): Mysterious Name, Duplication, Feature Envy, Primitive Obsession, Shotgun Surgery, Speculative Generality. Repo docs override.

**Spec** — missing requirements, extra scope, wrong behavior. Quote the spec line.

A change can pass Standards and fail Spec (or the reverse). Do not merge the lists.

## Also scan (five axes)

Correctness, readability, architecture fit, security (delegate `security-review` if auth/input/secrets), performance (unbounded lists, client waterfalls).

Approve when the change **improves** health even if you would have typed it differently. Block on bugs, missing tests at named seams, secrets, or authz holes.

## Comments

Lead with highest leverage. Severity: **Critical** (merge-block), **Required**, **Optional**, **Nit**.

## Sizing

~300 changed lines is the comfort cap for one PR. Larger: ask to split.

## Tests first

Read tests before implementation. Tests that only mock internals fail the Standards axis.

## Output

```markdown
## Review <branch>

### Spec
…

### Standards
…

### Verification
Commands run and results.

### Verdict
Approve | Request changes
```

## Exit

- [ ] Both axes reported
- [ ] Critical empty or fixed
- [ ] Typecheck/tests cited
