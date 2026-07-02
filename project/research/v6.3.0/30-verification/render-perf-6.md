# Verification: render-perf-6 — negative results (Object.keys vs for-in; hidden-class init)

## Finding summary

Two suspected micro-optimizations in the render hot path were benchmarked and found to be
non-improvements:

1. Replacing `const extraKeys = Object.keys(extraAttrs)` with `for-in` over the attribute bag
   measured **slower** (304 vs 324 ns/op) — the bag is a null-prototype dictionary-mode object.
2. Constructor-initializing Tag's lazily-added optional fields (`id?`, `class?`, `style?`,
   `htmx?`, `toggles?`) to stabilize hidden classes measured **flat** (81-86 vs 81-82 ns/tag)
   on a shape-mixed corpus.

Proposal: change nothing; record the negative results so future perf passes don't re-attempt them.

## Gap check

**Result: gapConfirmed = false** — there is no missing API and no live pain point in current src.

Code anchors verified against current source:

- `src/render/serialize.ts:277` — `const extraKeys = Object.keys(extraAttrs);` exists exactly as
  described, guarded by the `extraAttrs !== EMPTY_ATTRS` fast path at line 276.
- `src/core/tag.ts:191` (and 206, 373, 430) — attribute bag is created via
  `Object.create(null)`, confirming the dictionary-mode premise. (Finding cited `tag.ts`; actual
  path is `src/core/tag.ts` — same file, minor path drift.)
- `src/core/tag.ts:68-73` — the optional fields `id?`, `class?`, `style?`, `htmx?`, `toggles?`
  are declared but not constructor-initialized (constructor at lines 82-85 sets only `el` and
  `child`), confirming the lazy-field premise.

The finding is self-described as a **verified non-issue**: both premises exist in the code, both
were benchmarked, and both measured flat or negative. There is no defect, no missing overload,
and no API surface to add. The only "gap" is archival — the negative results are not recorded
anywhere durable.

## Score: 2 / 10

## Reasoning

- **Zero call sites improve.** The proposal is explicitly "keep the current code in both spots."
  No user-facing API changes, no perf gain, no bug fix.
- **Effort is near-zero, but so is value.** The entire deliverable is a documentation note (or at
  most a short code comment on the two spots). Value-density arithmetic on "real call sites
  improved vs effort" yields ~0 improved call sites.
- **Residual value is real but small:** it inoculates future perf passes against re-running the
  same two dead-end experiments. The numbers are plausible and internally consistent (for-in over
  a dictionary-mode object paying enumeration overhead that `Object.keys` amortizes; V8's
  megamorphic IC absorbing shape variance in `buildAttrs`), so the record is credible.
- **Recommended disposition:** do not schedule as a v6.3.0 work item. Fold the numbers into
  whatever perf-notes ledger the release process keeps; optionally add a one-line comment at
  `src/render/serialize.ts:277` and `src/core/tag.ts:68` noting "benchmarked: alternatives flat
  or slower" if the team wants the guard co-located with the code.
