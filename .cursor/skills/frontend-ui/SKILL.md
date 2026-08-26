---
name: frontend-ui
description: Accessible production UI without template aesthetics. Use when building layouts or WCAG states.
disable-model-invocation: true
---

# Frontend UI

Looks like a design-system app, not a template. Follow shadcn tokens already in the project.

## Structure

Colocate component + test. Presentational child; container talks to Start loaders/server fns.

## Visual

Use the project's spacing scale and type hierarchy. One `h1` per page. Contrast: 4.5:1 body text.

Avoid: purple-gradient defaults, oversized rounding everywhere, generic hero+card-grid, lorem, heavy stacked shadows, equal padding that flattens hierarchy.

## States

Every data view has loading (Skeleton), empty (Empty + next action), error (retry). Optimistic updates only when the repo already uses Query-style cache.

## A11y (WCAG 2.1 AA)

- Real `<button>` / `<a>` / labels. Icon-only controls have names.
- Tab order matches reading order. Dialogs move focus and restore it.
- Status messages use `role="status"` / `aria-live` where content updates async.
- Do not convey state by color alone.

## Responsive

Mobile-first Tailwind breakpoints. Check 320 / 768 / 1024.

## Motion

Respect `prefers-reduced-motion`. Disable animation in tests (`animate-none` / RTL setup) when animations flake.

## Exit

- [ ] Keyboard path works
- [ ] Loading/empty/error exist
- [ ] No raw palette fighting the theme
- [ ] shadcn primitives used instead of restyled divs
