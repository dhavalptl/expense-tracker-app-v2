# 05 — Transaction history with search & filters

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 4

## What to build
`/history` lists the user’s transactions (cap ~100). Search note (`q`) and filters `type`, `categoryId`, `from`, `to` live in URL search params. Empty state CTA links to Add.

## Acceptance
- [ ] `listTransactions` respects filters + ownership; stable newest-first order
- [ ] Search-param schema validated; unit tests for parse/defaults
- [ ] History UI wired to params; empty CTA → `/add`
- [ ] Tests at seams: filter combinations; unauthenticated denial

## Blocked by
04 — Add transactions

## Verify
- [ ] Focused Vitest for search-param parse + list filters
- [ ] `npm run typecheck`
- [ ] Manual: filter type/category/date; search note
