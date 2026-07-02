# architecture-4 — Refuter 1 verdict: REFUTED

**Finding:** Bidirectional core↔render boundary (latent cycle) plus core→elements type dependency.

**Verdict: refuted.** Every factual anchor in the finding is accurate, but none of them produces — or can plausibly produce — an observable defect. The "latent cycle" is benign under ESM evaluation semantics even if it materializes, and the "separable-units story" the finding says is broken is not a promise the package makes anywhere.

## Facts confirmed (the anchors are real)

- `src/core/behavior-methods.ts:9` — `import { escapeJs } from "../render/escape.js"` (runtime). Loaded into the `./core` subpath via the side-effect mixin import at `src/core/index.ts:11`.
- `src/render/serialize.ts:3,6` — runtime imports of `EMPTY_ATTRS` (core/tag.js) and `isTag`/`isRawString` (core/guards.js).
- `src/render/escape.ts` — zero imports today; no module cycle exists.
- `src/core/tag.ts:7` — `import type { ... } from "../elements/html-types.js"` (type-only, erased at runtime).
- `package.json` exports `./core` and `./render` as separate subpaths.

## Why this is not a defect

### 1. The "latent cycle" is doubly hypothetical and benign even if realized

The finding concedes no cycle exists today. For the feared failure ("genuine ESM cycle through the hottest path") to cause anything, **three** independent things must happen:

1. Someone adds an import to `render/escape.ts` (a deliberate, reviewable change to a file whose header comment and role make it an obvious leaf);
2. That import transitively reaches `core/tag.js` or `core/guards.js`;
3. Some binding is accessed **during module evaluation** while its defining module is mid-cycle.

Step 3 cannot occur with the code as written, and this is a semantic guarantee, not luck:

- `escapeJs`, `isTag`, `isRawString` are **hoisted `function` declarations** — ESM live bindings make hoisted functions callable from an in-cycle module even before its evaluation completes.
- `EMPTY_ATTRS` is a `const`, but every use in `serialize.ts` is **inside function bodies** (lines 97, 276, 298, 316, 353–355, 430–435) — executed at render time, long after the whole module graph has evaluated. Same for every `escapeJs` call in `behavior-methods.ts` (lines 71, 91, 96, 103) — inside behavior-builder functions.

So even a genuine `render ↔ core` ESM cycle would load and run correctly. ESM cycles are only a defect when an uninitialized binding is read at evaluation time; nothing on this boundary does that. "A cycle would exist" is not a failure scenario; "a cycle would throw or misbehave" is, and it wouldn't.

### 2. No "separable-units story" is advertised, so none is broken

- Searched `README.md` and `docs/`: no claim that `./core` or `./render` are standalone, dependency-free from sibling subpaths, or independently consumable units. The README's "zero dependencies" badges refer to **npm dependencies**, which is true and unaffected.
- Subpath exports in a single package are entry-point ergonomics (cf. `rxjs/operators`, `lodash-es` internals); internal relative cross-imports between subpath trees are the norm, not a contract violation.
- The `core/tag.d.ts → ../elements/html-types.js` type import resolves fine inside the shipped `dist/` — TypeScript follows relative imports within the package. "Not self-contained .d.ts" only matters for isolated-declaration extraction or repackaging of a subtree, which nothing in this repo does or documents. No consumer-visible failure exists.
- Cost check: `fluent-html/render` pulls only `core/tag.js` + `core/guards.js` (+ `proto`/`ids`), not the mixin barrel; `fluent-html/core` pulls only `render/escape.js`, a ~60-line zero-import leaf. `"sideEffects": false` plus these leaf-level edges means bundling/tree-shaking impact is negligible.

### 3. No layering rule exists to violate

No dependency-cruiser config; `eslint.config.js` has no `import/no-cycle` or boundaries rules. The repo has no stated or enforced layering contract that these imports break.

## Assessment of the proposal

Moving `escape.ts` under `core/` with a `render` re-export would be harmless hygiene and cheap. But hygiene preference is not a defect. As an *issue* with a failure scenario, the finding does not hold: nothing fails today, and the postulated future failure is prevented by ESM cycle semantics given the call-time-only access pattern on both sides.

**refuted = true, confidence = high** (cycle claim positively refuted by evaluation-semantics reading of both boundary files; separability claim refuted by absence of any such contract in README/docs/exports).
