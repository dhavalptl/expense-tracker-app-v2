---
name: grill-requirements
description: Grills product decisions before spec or code. Use when a feature is starting or requirements are still vague.
---

# Grill requirements

Reach a **shared understanding** before any spec file. Decisions belong to the human. Facts belong to you — look them up in the repo; do not ask what `package.json` already says.

## Design tree

Map the idea as a tree of decisions. The **frontier** is every decision whose prerequisites are already settled. Ask the whole frontier in one round, then wait.

```
❓ **Q1** — **<title>**: <body and options>

➡️ Recommended: <your best default and why>

---

❓ **Q2** — ...
```

A question that depends on an unanswered Q in this round belongs in a **later** round.

Stop when the frontier is empty and the human confirms shared understanding. Then run `write-spec`.

## First message: assumptions

Before questions, list guesses:

```
ASSUMPTIONS
1. TanStack Start (SSR + server functions), not a Vite SPA-only app
2. shadcn/ui already initialized if components.json exists
3. Auth: <guess from codebase or "none yet">
→ Correct these now, or I will proceed on them.
```

## Frontier themes (cover all before you stop)

- **User and job**: who, job-to-be-done, frequency
- **Happy path**: one concrete walkthrough
- **Authz**: anonymous vs signed-in vs admin
- **Data**: source of truth, mutations, optimistic UI
- **Empty / loading / error**: what the UI must show
- **Out of scope**: what this drop will not do
- **Success**: testable signals (not "feels fast")
- **Seams**: which public interfaces we will test (route, server fn, component)

## Question quality

- Offer a recommended answer every time so the human can say "yes".
- Prefer numbered choices over open essays.
- Surface conflicts ("this wants shareable URLs and also ephemeral client-only state").
- Reframe vague goals as measurable criteria and ask if those numbers are right.

## Exit

- [ ] Assumptions confirmed or corrected
- [ ] Happy path narrated end to end
- [ ] Out of scope named
- [ ] Test seams named
- [ ] Human says the understanding is shared
