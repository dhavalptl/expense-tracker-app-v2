# 05 — Transaction history with search & filters

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 4

## What to build
`/history` lists the user’s transactions (cap ~100). Search note (`q`) and filters `type`, `categoryId`, `from`, `to` live in URL search params. Empty state CTA links to Add.

## Acceptance
- [x] `listTransactions` respects filters + ownership; stable newest-first order
- [x] Search-param schema validated; unit tests for parse/defaults
- [x] History UI wired to params; empty CTA → `/add`
- [x] Tests at seams: filter combinations; ownership via userId scoping

## Blocked by
04 — Add transactions

## Verify
- [x] Focused Vitest for search-param parse + list filters
- [x] `npm run typecheck`
- [x] `npm run build`
