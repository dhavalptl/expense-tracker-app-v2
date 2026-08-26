---
name: shadcn-ui
description: Installs and composes shadcn/ui. Use when adding primitives or when components.json exists.
disable-model-invocation: true
---

# shadcn/ui

Do not guess component APIs. Run the CLI, then **read the files it added**.

Use the project's runner: `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx shadcn@latest`.

## Lookup (required)

- `components.json` is truth (aliases, radix vs base, icon library, css file).
- Installed UI: list `components/ui` before `add`.
- Unknown API: `shadcn docs <name>` or `shadcn view`, then fetch those URLs. Match the installed version, not a blog post.

Template for new apps: `shadcn init` with template **`start`**.

## Rules

- Compose primitives: Card, Field, Button, Dialog, Table, Sidebar, Empty, Skeleton, Alert, sonner toasts.
- `className` for **layout** (`flex`, `gap-*`, `grid`). Do not override primitive colors/typography with raw palettes.
- `gap-*`, not `space-y-*`. Equal width/height: `size-*`.
- Semantic tokens: `bg-background`, `text-muted-foreground`. No `bg-blue-500` for brand UI.
- `cn()` for conditional classes.
- Forms: `FieldGroup` + `Field` + `FieldLabel` when those exist in the installed version; otherwise match existing form files.
- Overlays need a Title (`DialogTitle`). Icon-only buttons need `aria-label`.
- Buttons: compose Spinner + `disabled`; do not invent `isLoading` props if the primitive has none.
- Icons: project's `iconLibrary`. Follow existing `data-icon` usage if present.

## Add flow

1. Search installed + `shadcn search`.
2. `shadcn add <comp>` — do not hand-copy GitHub sources.
3. Read added files; fix alias/icon mismatches.
4. Ask which registry when the user names a block without `@scope`.

## Exit

- [ ] Component exists in the ui folder before import
- [ ] Semantic tokens only
- [ ] Keyboard-accessible overlay titles
