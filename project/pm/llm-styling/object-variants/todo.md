# Object Variants — Tasks

### As an LLM author I want variant styling as typed objects so that variant groups cost prefix-like tokens while staying structurally scoped

- [ ] [P0] Generate `VariantStyleObject` (`StyleProps` + `NestedVariants`) and `KEY_EMIT` from vocab `valueType` rows (depends: vocab-generator schema enrichment)
- [ ] [P0] Implement `applyVariantObject` (port the spike's ~25-LOC core; `_variantPrefix` push/restore, `finally`-guarded)
- [ ] [P0] Tier-1 variant methods (~21, generated one-liners) + generic `.variant(name, obj)`
- [ ] [P0] DECISION: `2xl` member naming (`xl2` vs `.variant("2xl", …)`-only) — record in decisions.md
- [ ] [P1] Multi-arg composite keys as readonly tuples (`gradient`, `maskFrom`, snap family)
- [ ] [P0] Write tests — port spike proofs: emission (incl. 2-level nesting → `md:hover:first:`), key/value `@ts-expect-error` rejections, `undefined`-value conditionals, `.variant()` arbitrary forms
- [ ] [P0] Check for bugs

### As a maintainer I want `.on()`/`.at()` removed and all consumers migrated so that there is one variant mechanism

- [ ] [P0] Remove `.on()`/`.at()` + lambda `withVariant` registration; rewrite internal consumers (`overlay.ts`, any `FluentCustomMethods` docs pattern)
- [ ] [P1] Codemod the 25 demo sites (fold into the canonical-names codemod run); render-diff class sets before/after
- [ ] [P1] ESLint: extend derived tables for object keys; add `require-satisfies-variant-object` for non-literal variant args (the excess-property hole)
- [ ] [P1] Extractor: verify variant-object emission is covered by `scanFluent` (object args are literal → resolvable); add unresolved-arg fixture
- [ ] [P0] Docs in the same release: README/FLUENT-STYLING/guidelines variant sections rewritten to object form
- [ ] [P1] Write tests — extractor variant-object fixtures; eslint rule fixtures
- [ ] [P1] Check for bugs
