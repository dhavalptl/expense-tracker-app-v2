---
name: diagnose-bugs
description: Reproduce, minimize, then fix with a regression test. Use when debugging a failure or red CI.
---

# Diagnose

Do not spray unrelated refactors. Prove the bug first.

```
reproduce → minimize → hypothesize → instrument → fix → regression test
```

## Reproduce

Write the failing Vitest or Playwright example that demonstrates the bug (`tdd-vitest` / `playwright-e2e`). If it cannot fail in CI, you do not own a fix yet.

For UI: note route, user role, search params, console errors. Read existing logs/CI (`gh run view`).

## Minimize

Strip inputs until one knob flips pass/fail. Bisect recent commits if it is a regression (`git log`, `git bisect` only when the human wants it).

## Hypothesize

Write 1–3 ranked hypotheses (authz, parse, loader cache, hydration mismatch, locator). Check the cheapest first.

Hydration: compare server HTML vs client. Search params vs state. Server fn throwing vs client swallowing.

## Fix

Smallest change. Then full unit suite + the new test. If user-visible, add or extend e2e only for a critical path gap.

## Exit

- [ ] Red test existed before the fix
- [ ] Green after
- [ ] Cause stated in the commit body
