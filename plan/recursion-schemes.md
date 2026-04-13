# Recursion Schemes: Para, Ana, Hylo

## Context

fluent-html already has `foldView` — a catamorphism that collapses a `View` tree into a value via a `ViewAlgebra<A>`. This handles most cases (render, count, extract text, find links). But three related patterns would complete the toolkit.

## Goal

Add `paraView`, `unfoldView`, and `hyloView` alongside the existing `foldView`.

---

## Tasks

### Paramorphism (`paraView`)

- [x] Implement `paraView<A>(alg: ParaAlgebra<A>, view: View): A`
- [x] `ParaAlgebra<A>` is like `ViewAlgebra<A>` but `tag` receives both the folded children AND the original `View` subtree
- [x] Use case: transformations that need to inspect original node attributes while processing folded children (e.g., wrap every `<a>` in a tooltip showing its href, generate aria descriptions from tag structure)
- [x] Add at least one built-in para algebra as an example

### Anamorphism (`unfoldView`)

- [x] Define `ViewCoalgebra<S>` — the dual of `ViewAlgebra`: given a seed `S`, produce one layer of `View` with new seeds as children
- [x] Implement `unfoldView<S>(coalg: ViewCoalgebra<S>, seed: S): View`
- [x] Use case: build a nested `<ul>` table of contents from a flat heading list, generate a nav tree from a flat route list, build a comment thread tree from flat comment data
- [x] Add at least one built-in coalgebra as an example

### Hylomorphism (`hyloView`)

- [x] Implement `hyloView<S, A>(coalg: ViewCoalgebra<S>, alg: ViewAlgebra<A>, seed: S): A`
- [x] Fuses unfold + fold in one pass — no intermediate `View` tree allocated
- [x] Use case: convert flat data directly to HTML string without materializing the tree (streaming large tables, server-sent partial rendering)
- [ ] Benchmark against unfold-then-fold to confirm the allocation savings matter

### Integration

- [x] Export from `src/fold/index.ts` alongside existing `foldView`
- [x] Add JSDoc with plain-English explanations (not just type signatures)
- [x] Add tests for each scheme
- [ ] Update CHANGELOG

## Notes

- These are not urgent — `foldView` covers 90% of use cases. This is about completing the algebra so fluent-html handles ALL tree operations compositionally.
- Keep implementations simple. Each is ~15-25 lines.
- Reference: fp-patterns-proposal.md in fluent-ffmpeg repo for rationale.
